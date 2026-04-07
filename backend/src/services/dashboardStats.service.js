const mongoose = require('mongoose');
const { Property } = require('../models');
const { Transaction } = require('../models/Transaction');

const startOfMonth = (d) => new Date(d.getFullYear(), d.getMonth(), 1);
const endOfMonth = (d) => new Date(d.getFullYear(), d.getMonth() + 1, 0, 23, 59, 59, 999);
const startOfDay = (d) => new Date(d.getFullYear(), d.getMonth(), d.getDate());

/**
 * Dashboard stats scoped to the logged-in user:
 * - AGENCY / OWNER: only properties where createdBy = userId
 * - ADMIN: all properties (platform overview)
 */
exports.getDashboardStatsForUser = async (userId, role) => {
  const propertyMatch =
    role === 'ADMIN' ? {} : { createdBy: new mongoose.Types.ObjectId(userId) };

  const now = new Date();
  const year = now.getFullYear();
  const thisMonthStart = startOfMonth(now);
  const lastMonthRef = new Date(year, now.getMonth() - 1, 1);
  const lastMonthStart = startOfMonth(lastMonthRef);
  const lastMonthEnd = endOfMonth(lastMonthRef);
  const yearStart = new Date(year, 0, 1);
  const dayStart = startOfDay(now);
  const last30d = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

  const newThisMonth = await Property.countDocuments({
    ...propertyMatch,
    createdAt: { $gte: thisMonthStart },
  });
  const newLastMonth = await Property.countDocuments({
    ...propertyMatch,
    createdAt: { $gte: lastMonthStart, $lte: lastMonthEnd },
  });
  const newToday = await Property.countDocuments({
    ...propertyMatch,
    createdAt: { $gte: dayStart },
  });

  const pctChange = (cur, prev) => {
    if (prev === 0) return cur > 0 ? 100 : 0;
    return ((cur - prev) / prev) * 100;
  };
  const newListingsMomPct = pctChange(newThisMonth, newLastMonth);

  const totalNonArchived = await Property.countDocuments({
    ...propertyMatch,
    status: { $ne: 'ARCHIVED' },
  });

  const activeCount = await Property.countDocuments({
    ...propertyMatch,
    status: { $in: ['AVAILABLE', 'PENDING'] },
  });

  const propertyDocs = await Property.find(propertyMatch).select('_id').lean();
  const propertyIds = propertyDocs.map((p) => p._id);
  const txBase =
    propertyIds.length > 0 ? { propertyId: { $in: propertyIds } } : { propertyId: { $in: [] } };

  const txThisMonth = await Transaction.countDocuments({
    ...txBase,
    createdAt: { $gte: thisMonthStart },
  });
  const txLastMonth = await Transaction.countDocuments({
    ...txBase,
    createdAt: { $gte: lastMonthStart, $lte: lastMonthEnd },
  });
  const txLast30 = await Transaction.countDocuments({
    ...txBase,
    createdAt: { $gte: last30d },
  });
  const txMomPct = pctChange(txThisMonth, txLastMonth);

  const monthlyNewAgg = await Property.aggregate([
    { $match: { ...propertyMatch, createdAt: { $gte: yearStart } } },
    { $group: { _id: { $month: '$createdAt' }, c: { $sum: 1 } } },
  ]);
  const monthlyNewListings = Array.from({ length: 12 }, (_, i) => {
    const month = i + 1;
    const row = monthlyNewAgg.find((x) => x._id === month);
    return row ? row.c : 0;
  });

  const monthlyTxAgg = await Transaction.aggregate([
    { $match: { ...txBase, createdAt: { $gte: yearStart } } },
    { $group: { _id: { $month: '$createdAt' }, total: { $sum: '$amount' } } },
  ]);
  const monthlyTxVolumeK = Array.from({ length: 12 }, (_, i) => {
    const month = i + 1;
    const row = monthlyTxAgg.find((x) => x._id === month);
    return row ? Math.round(row.total / 1000) : 0;
  });

  const sumPortfolio = await Property.aggregate([
    { $match: { ...propertyMatch, status: { $ne: 'ARCHIVED' } } },
    { $group: { _id: null, sum: { $sum: '$price' } } },
  ]);
  const totalPortfolioValue = sumPortfolio[0]?.sum || 0;

  const revenueThisMonth = await Transaction.aggregate([
    {
      $match: {
        ...txBase,
        createdAt: { $gte: thisMonthStart },
        status: { $in: ['CONFIRMED', 'COMPLETED'] },
      },
    },
    { $group: { _id: null, sum: { $sum: '$amount' } } },
  ]);
  const revenueLastMonth = await Transaction.aggregate([
    {
      $match: {
        ...txBase,
        createdAt: { $gte: lastMonthStart, $lte: lastMonthEnd },
        status: { $in: ['CONFIRMED', 'COMPLETED'] },
      },
    },
    { $group: { _id: null, sum: { $sum: '$amount' } } },
  ]);
  const revThis = revenueThisMonth[0]?.sum || 0;
  const revLast = revenueLastMonth[0]?.sum || 0;
  const revenueMomPct = pctChange(revThis, revLast);

  const activePercent =
    totalNonArchived === 0 ? 0 : Math.min(100, Math.round((activeCount / totalNonArchived) * 100));

  const cityAgg = await Property.aggregate([
    { $match: propertyMatch },
    { $group: { _id: '$city', count: { $sum: 1 } } },
    { $sort: { count: -1 } },
    { $limit: 6 },
  ]);
  const cityTotal = cityAgg.reduce((s, c) => s + c.count, 0) || 1;
  const topCities = cityAgg.map((c) => ({
    city: c._id || 'Unknown',
    count: c.count,
    percent: Math.round((c.count / cityTotal) * 100),
  }));

  const recentProperties = await Property.find(propertyMatch)
    .sort({ updatedAt: -1 })
    .limit(6)
    .select('title type price status listingType images updatedAt')
    .lean();

  return {
    currency: 'TND',
    scope: role === 'ADMIN' ? 'platform' : 'mine',
    metrics: {
      primary: {
        label: 'New listings',
        sublabel: 'this month',
        value: newThisMonth,
        changePercent: Number(newListingsMomPct.toFixed(1)),
        trend: newListingsMomPct >= 0 ? 'up' : 'down',
      },
      secondary: {
        label: 'Transactions',
        sublabel: 'last 30 days',
        value: txLast30,
        changePercent: Number(txMomPct.toFixed(1)),
        trend: txMomPct >= 0 ? 'up' : 'down',
      },
    },
    charts: {
      monthlyNewListings,
      statistics: {
        series: [
          { name: 'New listings', data: monthlyNewListings },
          { name: 'Transaction volume (k TND)', data: monthlyTxVolumeK },
        ],
      },
    },
    monthlyTarget: {
      activePercent,
      totalPortfolioValue,
      revenueThisMonth: revThis,
      newListingsThisMonth: newThisMonth,
      newListingsToday: newToday,
      revenueMomPct: Number(revenueMomPct.toFixed(1)),
      revenueTrend: revenueMomPct >= 0 ? 'up' : 'down',
    },
    portfolio: {
      totalListings: totalNonArchived,
      activeListings: activeCount,
    },
    topCities,
    recentProperties,
  };
};
