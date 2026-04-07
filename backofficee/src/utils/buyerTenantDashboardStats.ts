import type { CitySlice } from "../components/ecommerce/DemographicCard";
import type { MetricCardProps } from "../components/ecommerce/EcommerceMetrics";

export function effStatus(row: {
  status?: string;
  transactionId?: { status?: string } | null;
}): string {
  const ts =
    row.transactionId && typeof row.transactionId === "object"
      ? row.transactionId.status
      : null;
  return ts || row.status || "PENDING";
}

export function isCancelled(row: { status?: string; transactionId?: { status?: string } | null }) {
  return effStatus(row) === "CANCELLED";
}

export function isCompletedDeal(row: {
  status?: string;
  flouciPaid?: boolean;
  transactionId?: { status?: string } | null;
}) {
  const st = effStatus(row);
  return st === "COMPLETED" || row.flouciPaid === true;
}

export function isActiveDeal(row: {
  status?: string;
  flouciPaid?: boolean;
  transactionId?: { status?: string } | null;
}) {
  return !isCompletedDeal(row) && !isCancelled(row);
}

function countInMonth(
  sales: { saleDate?: string }[],
  leases: { createdAt?: string }[],
  year: number,
  monthIndex: number
) {
  let n = 0;
  for (const s of sales) {
    if (!s.saleDate) continue;
    const d = new Date(s.saleDate);
    if (d.getFullYear() === year && d.getMonth() === monthIndex) n += 1;
  }
  for (const l of leases) {
    if (!l.createdAt) continue;
    const d = new Date(l.createdAt);
    if (d.getFullYear() === year && d.getMonth() === monthIndex) n += 1;
  }
  return n;
}

function buildYearSeries(
  sales: { saleDate?: string }[],
  leases: { createdAt?: string }[],
  year: number
) {
  const purchase = Array(12).fill(0);
  const rental = Array(12).fill(0);
  const total = Array(12).fill(0);
  for (const s of sales) {
    if (!s.saleDate) continue;
    const d = new Date(s.saleDate);
    if (d.getFullYear() !== year) continue;
    const m = d.getMonth();
    purchase[m] += 1;
    total[m] += 1;
  }
  for (const l of leases) {
    if (!l.createdAt) continue;
    const d = new Date(l.createdAt);
    if (d.getFullYear() !== year) continue;
    const m = d.getMonth();
    rental[m] += 1;
    total[m] += 1;
  }
  return { purchase, rental, total };
}

function momOfferStarts(
  sales: { saleDate?: string }[],
  leases: { createdAt?: string }[],
  now: Date
) {
  const y = now.getFullYear();
  const m = now.getMonth();
  const thisStart = new Date(y, m, 1);
  const lastStart = new Date(y, m - 1, 1);
  const lastEnd = new Date(y, m, 0, 23, 59, 59, 999);

  let thisC = 0;
  let lastC = 0;
  for (const s of sales) {
    if (!s.saleDate) continue;
    const d = new Date(s.saleDate);
    if (d >= thisStart && d.getMonth() === m && d.getFullYear() === y) thisC += 1;
    if (d >= lastStart && d <= lastEnd) lastC += 1;
  }
  for (const l of leases) {
    if (!l.createdAt) continue;
    const d = new Date(l.createdAt);
    if (d >= thisStart && d.getMonth() === m && d.getFullYear() === y) thisC += 1;
    if (d >= lastStart && d <= lastEnd) lastC += 1;
  }
  if (lastC === 0) {
    return { pct: thisC > 0 ? 100 : 0, trend: "up" as const };
  }
  const pct = ((thisC - lastC) / lastC) * 100;
  return { pct: Math.abs(pct), trend: pct >= 0 ? ("up" as const) : ("down" as const) };
}

function topCitiesFromDeals(sales: any[], leases: any[]): CitySlice[] {
  const map = new Map<string, number>();
  for (const s of sales) {
    if (isCancelled(s)) continue;
    const c = s.propertyId?.city;
    if (!c) continue;
    map.set(c, (map.get(c) || 0) + 1);
  }
  for (const l of leases) {
    if (isCancelled(l)) continue;
    const c = l.propertyId?.city;
    if (!c) continue;
    map.set(c, (map.get(c) || 0) + 1);
  }
  const total = [...map.values()].reduce((a, b) => a + b, 0) || 1;
  return [...map.entries()]
    .map(([city, count]) => ({
      city,
      count,
      percent: Math.round((count / total) * 100),
    }))
    .sort((a, b) => b.count - a.count);
}

export type BuyerDealTableRow = {
  _id: string;
  title: string;
  type: string;
  listingType?: string;
  price: number;
  status: string;
  images?: { url?: string }[];
  dealKind: "Purchase" | "Rental";
};

function toTableRows(sales: any[], leases: any[], limit: number): BuyerDealTableRow[] {
  const rows: { at: number; row: BuyerDealTableRow }[] = [];
  for (const s of sales) {
    const pid = s.propertyId;
    const t = pid?.title || pid?.reference || "Property";
    rows.push({
      at: new Date(s.saleDate || s.createdAt || 0).getTime(),
      row: {
        _id: String(s._id),
        title: t,
        type: pid?.type || "—",
        listingType: pid?.listingType,
        price: Number(s.salePrice) || 0,
        status: effStatus(s),
        images: pid?.images,
        dealKind: "Purchase",
      },
    });
  }
  for (const l of leases) {
    const pid = l.propertyId;
    const t = pid?.title || pid?.reference || "Property";
    rows.push({
      at: new Date(l.createdAt || l.startDate || 0).getTime(),
      row: {
        _id: String(l._id),
        title: t,
        type: pid?.type || "—",
        listingType: pid?.listingType,
        price: Number(l.rentAmount) + Number(l.charges || 0),
        status: effStatus(l),
        images: pid?.images,
        dealKind: "Rental",
      },
    });
  }
  return rows
    .sort((a, b) => b.at - a.at)
    .slice(0, limit)
    .map((x) => x.row);
}

export function buildBuyerTenantDashboardData(sales: any[], leases: any[], now = new Date()) {
  const year = now.getFullYear();
  const activePurchases = sales.filter(isActiveDeal);
  const completedPurchases = sales.filter(isCompletedDeal);
  const activeRentals = leases.filter(isActiveDeal);
  const completedRentals = leases.filter(isCompletedDeal);

  const pipeline = activePurchases.length + activeRentals.length;
  const completed = completedPurchases.length + completedRentals.length;
  const nonCancelled =
    sales.filter((s) => !isCancelled(s)).length + leases.filter((l) => !isCancelled(l)).length;
  const completionPercent =
    nonCancelled === 0 ? 0 : Math.min(100, Math.round((completed / nonCancelled) * 100));

  let totalCommitted = 0;
  for (const s of sales) {
    if (!isCancelled(s)) totalCommitted += Number(s.salePrice) || 0;
  }
  for (const l of leases) {
    if (!isCancelled(l)) totalCommitted += Number(l.rentAmount) + Number(l.charges || 0);
  }

  const { pct: offersMomPct, trend: offersMomTrend } = momOfferStarts(sales, leases, now);

  const primary: MetricCardProps = {
    label: "Active pipeline",
    sublabel: "Offers & bookings in progress",
    value: pipeline,
    changePercent: offersMomPct,
    trend: offersMomTrend,
  };

  const secondary: MetricCardProps = {
    label: "Completed deals",
    sublabel: "Purchases & rentals closed",
    value: completed,
    changePercent: 0,
    trend: "up",
  };

  const { purchase, rental, total } = buildYearSeries(sales, leases, year);

  const thisMonthStarts = countInMonth(sales, leases, year, now.getMonth());

  return {
    metrics: { primary, secondary },
    charts: {
      monthlyTotalActivity: total,
      statisticsSeries: [
        { name: "Purchase offers", data: purchase },
        { name: "Rental bookings", data: rental },
      ],
    },
    topCities: topCitiesFromDeals(sales, leases),
    summary: {
      completionPercent,
      totalCommittedTnd: totalCommitted,
      activeDeals: pipeline,
      completedCount: completed,
      newOffersThisMonth: thisMonthStarts,
      offersMomPct,
      offersMomTrend,
    },
    tableRows: toTableRows(sales, leases, 6),
  };
}
