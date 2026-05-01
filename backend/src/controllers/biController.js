const { Property } = require('../models');
const { Transaction } = require('../models/Transaction');
const { User } = require('../models/User');
const { Feedback } = require('../models/FeedBack');
const { Lease } = require('../models/Lease');
const { apiResponse } = require('../utils/apiResponse');

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

const startOfMonth = (d) => new Date(d.getFullYear(), d.getMonth(), 1);
const endOfMonth = (d) => new Date(d.getFullYear(), d.getMonth() + 1, 0, 23, 59, 59, 999);

/**
 * @desc    BI Analytics endpoint – platform-wide aggregations (Admin only)
 * @route   GET /api/bi/analytics
 * @access  Private (ADMIN)
 */
exports.getAnalytics = async (req, res, next) => {
  try {
    const now = new Date();
    const year = now.getFullYear();
    const yearStart = new Date(year, 0, 1);
    const thisMonthStart = startOfMonth(now);
    const lastMonthStart = startOfMonth(new Date(year, now.getMonth() - 1, 1));
    const lastMonthEnd = endOfMonth(new Date(year, now.getMonth() - 1, 1));

    const pct = (cur, prev) => {
      if (prev === 0) return cur > 0 ? 100 : 0;
      return Math.round(((cur - prev) / prev) * 100 * 10) / 10;
    };

    // ── Run all aggregations in parallel ─────────────────────────────────────
    const [
      totalProperties,
      totalUsers,
      totalTransactions,
      totalFeedbacks,
      totalLeases,

      propertiesThisMonth,
      propertiesLastMonth,
      usersThisMonth,
      usersLastMonth,
      txThisMonth,
      txLastMonth,

      // Portfolio value
      portfolioAgg,

      // Revenue
      revenueAgg,
      revenueLastAgg,

      // Monthly new listings (12 months)
      monthlyListingsAgg,

      // Monthly transaction volume (12 months)
      monthlyTxAgg,

      // Monthly user registrations (12 months)
      monthlyUsersAgg,

      // Property breakdowns
      propertyTypeAgg,
      propertyStatusAgg,
      listingTypeAgg,
      priceRangeAgg,

      // Top cities
      cityAgg,

      // User role breakdown
      roleAgg,

      // Transaction breakdown
      txTypeAgg,
      txStatusAgg,

      // Feedback ratings distribution
      ratingAgg,

      // Avg rating
      avgRatingAgg,

      // Lease status breakdown
      leaseStatusAgg,

      // Sale vs Rent revenue split
      revenueByTypeAgg,

    ] = await Promise.all([
      // Counts
      Property.countDocuments({}),
      User.countDocuments({}),
      Transaction.countDocuments({}),
      Feedback.countDocuments({}),
      Lease.countDocuments({}),

      // Growth
      Property.countDocuments({ createdAt: { $gte: thisMonthStart } }),
      Property.countDocuments({ createdAt: { $gte: lastMonthStart, $lte: lastMonthEnd } }),
      User.countDocuments({ createdAt: { $gte: thisMonthStart } }),
      User.countDocuments({ createdAt: { $gte: lastMonthStart, $lte: lastMonthEnd } }),
      Transaction.countDocuments({ createdAt: { $gte: thisMonthStart } }),
      Transaction.countDocuments({ createdAt: { $gte: lastMonthStart, $lte: lastMonthEnd } }),

      // Portfolio value (sum of all non-archived property prices)
      Property.aggregate([
        { $match: { status: { $ne: 'ARCHIVED' } } },
        { $group: { _id: null, total: { $sum: '$price' }, avg: { $avg: '$price' } } },
      ]),

      // Revenue this month
      Transaction.aggregate([
        { $match: { createdAt: { $gte: thisMonthStart }, status: { $in: ['CONFIRMED', 'COMPLETED'] } } },
        { $group: { _id: null, total: { $sum: '$amount' } } },
      ]),
      Transaction.aggregate([
        { $match: { createdAt: { $gte: lastMonthStart, $lte: lastMonthEnd }, status: { $in: ['CONFIRMED', 'COMPLETED'] } } },
        { $group: { _id: null, total: { $sum: '$amount' } } },
      ]),

      // Monthly listings per month of current year
      Property.aggregate([
        { $match: { createdAt: { $gte: yearStart } } },
        { $group: { _id: { $month: '$createdAt' }, count: { $sum: 1 } } },
        { $sort: { _id: 1 } },
      ]),

      // Monthly transaction volume per month
      Transaction.aggregate([
        { $match: { createdAt: { $gte: yearStart }, status: { $in: ['CONFIRMED', 'COMPLETED'] } } },
        { $group: { _id: { $month: '$createdAt' }, volume: { $sum: '$amount' } } },
        { $sort: { _id: 1 } },
      ]),

      // Monthly user registrations
      User.aggregate([
        { $match: { createdAt: { $gte: yearStart } } },
        { $group: { _id: { $month: '$createdAt' }, count: { $sum: 1 } } },
        { $sort: { _id: 1 } },
      ]),

      // Property type breakdown
      Property.aggregate([
        { $group: { _id: '$type', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
      ]),

      // Property status breakdown
      Property.aggregate([
        { $group: { _id: '$status', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
      ]),

      // Listing type (FOR_SALE vs FOR_RENT)
      Property.aggregate([
        { $group: { _id: '$listingType', count: { $sum: 1 } } },
      ]),

      // Price range distribution (buckets)
      Property.aggregate([
        {
          $bucket: {
            groupBy: '$price',
            boundaries: [0, 50000, 150000, 300000, 500000, 1000000, Infinity],
            default: 'Other',
            output: { count: { $sum: 1 } },
          },
        },
      ]),

      // Top 8 cities
      Property.aggregate([
        { $group: { _id: '$city', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 8 },
      ]),

      // User role breakdown
      User.aggregate([
        { $group: { _id: '$role', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
      ]),

      // Transaction type breakdown (SALE vs RENT)
      Transaction.aggregate([
        { $group: { _id: '$type', count: { $sum: 1 } } },
      ]),

      // Transaction status breakdown
      Transaction.aggregate([
        { $group: { _id: '$status', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
      ]),

      // Feedback rating distribution
      Feedback.aggregate([
        { $group: { _id: '$rating', count: { $sum: 1 } } },
        { $sort: { _id: 1 } },
      ]),

      // Average rating
      Feedback.aggregate([
        { $group: { _id: null, avg: { $avg: '$rating' }, total: { $sum: 1 } } },
      ]),

      // Lease status breakdown
      Lease.aggregate([
        { $group: { _id: '$status', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
      ]),

      // Revenue split by transaction type
      Transaction.aggregate([
        { $match: { status: { $in: ['CONFIRMED', 'COMPLETED'] } } },
        { $group: { _id: '$type', revenue: { $sum: '$amount' }, count: { $sum: 1 } } },
      ]),
    ]);

    // ── Build monthly series (12 slots) ───────────────────────────────────────
    const buildMonthly = (agg, field = 'count') =>
      Array.from({ length: 12 }, (_, i) => {
        const row = agg.find((x) => x._id === i + 1);
        return row ? row[field] : 0;
      });

    const monthlyListings = buildMonthly(monthlyListingsAgg);
    const monthlyTxVolume = buildMonthly(monthlyTxAgg, 'volume').map((v) => Math.round(v / 1000));
    const monthlyUsers = buildMonthly(monthlyUsersAgg);

    // ── KPI values ────────────────────────────────────────────────────────────
    const portfolioValue = portfolioAgg[0]?.total || 0;
    const avgPrice = portfolioAgg[0]?.avg || 0;
    const revenueThisMonth = revenueAgg[0]?.total || 0;
    const revenueLastMonth = revenueLastAgg[0]?.total || 0;

    // ── Price range labels ────────────────────────────────────────────────────
    const priceRangeLabels = {
      0: '< 50K',
      50000: '50K–150K',
      150000: '150K–300K',
      300000: '300K–500K',
      500000: '500K–1M',
      1000000: '> 1M',
      Other: 'Other',
    };

    // ── Build response ────────────────────────────────────────────────────────
    res.status(200).json(
      apiResponse(true, 'BI analytics retrieved successfully', {
        meta: {
          generatedAt: new Date().toISOString(),
          year,
          months: MONTHS,
        },

        // Overview KPIs
        kpis: {
          totalProperties: {
            value: totalProperties,
            changePercent: pct(propertiesThisMonth, propertiesLastMonth),
            trend: propertiesThisMonth >= propertiesLastMonth ? 'up' : 'down',
            thisMonth: propertiesThisMonth,
          },
          totalUsers: {
            value: totalUsers,
            changePercent: pct(usersThisMonth, usersLastMonth),
            trend: usersThisMonth >= usersLastMonth ? 'up' : 'down',
            thisMonth: usersThisMonth,
          },
          totalTransactions: {
            value: totalTransactions,
            changePercent: pct(txThisMonth, txLastMonth),
            trend: txThisMonth >= txLastMonth ? 'up' : 'down',
            thisMonth: txThisMonth,
          },
          revenueThisMonth: {
            value: revenueThisMonth,
            changePercent: pct(revenueThisMonth, revenueLastMonth),
            trend: revenueThisMonth >= revenueLastMonth ? 'up' : 'down',
          },
          avgPropertyPrice: {
            value: Math.round(avgPrice),
            portfolioValue: Math.round(portfolioValue),
          },
          totalFeedbacks: {
            value: totalFeedbacks,
            avgRating: avgRatingAgg[0]?.avg ? Math.round(avgRatingAgg[0].avg * 10) / 10 : 0,
          },
          totalLeases: { value: totalLeases },
        },

        // Monthly time series
        timeSeries: {
          months: MONTHS,
          newListings: monthlyListings,
          transactionVolume: monthlyTxVolume, // in thousands TND
          newUsers: monthlyUsers,
        },

        // Property analytics
        properties: {
          byType: propertyTypeAgg.map((x) => ({ label: x._id || 'Unknown', value: x.count })),
          byStatus: propertyStatusAgg.map((x) => ({ label: x._id || 'Unknown', value: x.count })),
          byListingType: listingTypeAgg.map((x) => ({ label: x._id || 'Unknown', value: x.count })),
          byPriceRange: priceRangeAgg.map((x) => ({
            label: priceRangeLabels[x._id] || String(x._id),
            value: x.count,
          })),
          topCities: cityAgg.map((x) => ({ city: x._id || 'Unknown', count: x.count })),
        },

        // User analytics
        users: {
          byRole: roleAgg.map((x) => ({ label: x._id || 'Unknown', value: x.count })),
          monthlyRegistrations: monthlyUsers,
        },

        // Transaction analytics
        transactions: {
          byType: txTypeAgg.map((x) => ({ label: x._id || 'Unknown', value: x.count })),
          byStatus: txStatusAgg.map((x) => ({ label: x._id || 'Unknown', value: x.count })),
          revenueByType: revenueByTypeAgg.map((x) => ({
            label: x._id || 'Unknown',
            revenue: Math.round(x.revenue),
            count: x.count,
          })),
          monthlyVolume: monthlyTxVolume,
        },

        // Feedback analytics
        feedback: {
          ratingDistribution: [1, 2, 3, 4, 5].map((star) => {
            const found = ratingAgg.find((x) => x._id === star);
            return { star, count: found?.count || 0 };
          }),
          avgRating: avgRatingAgg[0]?.avg ? Math.round(avgRatingAgg[0].avg * 10) / 10 : 0,
          total: totalFeedbacks,
        },

        // Lease analytics
        leases: {
          byStatus: leaseStatusAgg.map((x) => ({ label: x._id || 'Unknown', value: x.count })),
          total: totalLeases,
        },
      })
    );
  } catch (error) {
    next(error);
  }
};
