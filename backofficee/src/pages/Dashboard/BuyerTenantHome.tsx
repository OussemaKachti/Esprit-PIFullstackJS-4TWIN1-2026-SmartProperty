import { useCallback, useEffect, useMemo, useState } from "react";
import { Link } from "react-router";
import toast from "react-hot-toast";
import PageMeta from "../../components/common/PageMeta";
import EcommerceMetrics from "../../components/ecommerce/EcommerceMetrics";
import MonthlySalesChart from "../../components/ecommerce/MonthlySalesChart";
import StatisticsChart from "../../components/ecommerce/StatisticsChart";
import BuyerDealsSummary from "../../components/ecommerce/BuyerDealsSummary";
import DemographicCard from "../../components/ecommerce/DemographicCard";
import BuyerDealActivityTable from "../../components/ecommerce/BuyerDealActivityTable";
import { buildBuyerTenantDashboardData } from "../../utils/buyerTenantDashboardStats";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";
const FRONTEND_URL = (import.meta.env.VITE_FRONTEND_URL || "http://localhost:3000").replace(
  /\/$/,
  ""
);

const shortcutClass =
  "group flex flex-col rounded-2xl border border-gray-200 bg-white p-4 shadow-sm transition hover:border-brand-300 hover:shadow-md dark:border-gray-800 dark:bg-white/[0.03] dark:hover:border-brand-600/40";

export default function BuyerTenantHome() {
  const [sales, setSales] = useState<any[]>([]);
  const [leases, setLeases] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    const token = localStorage.getItem("token");
    if (!token) {
      toast.error("Please sign in again.");
      setLoading(false);
      return;
    }
    try {
      const res = await fetch(`${API_URL}/users/me/offers?kind=all`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.message || "Unable to load");
      setSales(json.data?.sales || []);
      setLeases(json.data?.leases || []);
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : "Unable to load");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const dash = useMemo(
    () => buildBuyerTenantDashboardData(sales, leases),
    [sales, leases]
  );

  return (
    <>
      <PageMeta
        title="Dashboard | Smart Property"
        description="Overview of your purchases, rentals, and offers."
      />

      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">Dashboard</h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Track purchase offers, rental bookings, and deal progress in one place.
          </p>
        </div>
        <button
          type="button"
          onClick={load}
          disabled={loading}
          className="inline-flex h-10 shrink-0 items-center justify-center rounded-lg border border-gray-300 bg-white px-4 text-sm font-medium text-gray-700 shadow-theme-xs hover:bg-gray-50 disabled:opacity-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200 dark:hover:bg-white/[0.03]"
        >
          Refresh data
        </button>
      </div>

      <div className="mb-8 grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-6">
        <Link to="/my-portfolio" className={shortcutClass}>
          <span className="text-xs font-medium uppercase tracking-wide text-gray-400">Portfolio</span>
          <span className="mt-1 text-sm font-semibold text-gray-900 dark:text-white">Purchases & rentals</span>
          <span className="mt-2 text-xs text-brand-600 dark:text-brand-400">Open →</span>
        </Link>
        <Link to="/my-offers" className={shortcutClass}>
          <span className="text-xs font-medium uppercase tracking-wide text-gray-400">Offers</span>
          <span className="mt-1 text-sm font-semibold text-gray-900 dark:text-white">My offers</span>
          <span className="mt-2 text-xs text-brand-600 dark:text-brand-400">Open →</span>
        </Link>
        <Link to="/transactions" className={shortcutClass}>
          <span className="text-xs font-medium uppercase tracking-wide text-gray-400">Payments</span>
          <span className="mt-1 text-sm font-semibold text-gray-900 dark:text-white">Activity</span>
          <span className="mt-2 text-xs text-brand-600 dark:text-brand-400">Open →</span>
        </Link>
        <Link to="/calendar" className={shortcutClass}>
          <span className="text-xs font-medium uppercase tracking-wide text-gray-400">Schedule</span>
          <span className="mt-1 text-sm font-semibold text-gray-900 dark:text-white">Calendar</span>
          <span className="mt-2 text-xs text-brand-600 dark:text-brand-400">Open →</span>
        </Link>
        <Link to="/documents" className={shortcutClass}>
          <span className="text-xs font-medium uppercase tracking-wide text-gray-400">Files</span>
          <span className="mt-1 text-sm font-semibold text-gray-900 dark:text-white">Documents</span>
          <span className="mt-2 text-xs text-brand-600 dark:text-brand-400">Open →</span>
        </Link>
        <a href={FRONTEND_URL} className={shortcutClass}>
          <span className="text-xs font-medium uppercase tracking-wide text-gray-400">Public site</span>
          <span className="mt-1 text-sm font-semibold text-gray-900 dark:text-white">Marketplace</span>
          <span className="mt-2 text-xs text-brand-600 dark:text-brand-400">Open →</span>
        </a>
      </div>

      <div className="grid grid-cols-12 gap-4 md:gap-6">
        <div className="col-span-12 space-y-6 xl:col-span-7">
          <EcommerceMetrics
            loading={loading}
            primary={loading ? undefined : dash.metrics.primary}
            secondary={loading ? undefined : dash.metrics.secondary}
          />

          <MonthlySalesChart
            loading={loading}
            title="Deal activity"
            seriesName="Offers & bookings"
            data={dash.charts.monthlyTotalActivity}
          />
        </div>

        <div className="col-span-12 xl:col-span-5">
          <BuyerDealsSummary
            loading={loading}
            completionPercent={dash.summary.completionPercent}
            totalCommittedTnd={dash.summary.totalCommittedTnd}
            activeDeals={dash.summary.activeDeals}
            completedCount={dash.summary.completedCount}
            newOffersThisMonth={dash.summary.newOffersThisMonth}
            offersMomPct={dash.summary.offersMomPct}
            offersMomTrend={dash.summary.offersMomTrend}
            currency="TND"
          />
        </div>

        <div className="col-span-12">
          <StatisticsChart
            loading={loading}
            series={dash.charts.statisticsSeries}
            subtitle="Purchase offers vs rental bookings by month (current year)"
          />
        </div>

        <div className="col-span-12 xl:col-span-5">
          <DemographicCard
            loading={loading}
            topCities={dash.topCities}
            title="Where your deals are"
            subtitle="Cities tied to your active and completed purchase or rental activity"
            entitySingular="deal"
            entityPlural="deals"
          />
        </div>

        <div className="col-span-12 xl:col-span-7">
          <BuyerDealActivityTable loading={loading} rows={dash.tableRows} currency="TND" />
        </div>
      </div>
    </>
  );
}
