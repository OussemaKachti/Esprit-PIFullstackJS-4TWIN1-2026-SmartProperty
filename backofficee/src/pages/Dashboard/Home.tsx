import { useEffect, useState } from "react";
import EcommerceMetrics from "../../components/ecommerce/EcommerceMetrics";
import MonthlySalesChart from "../../components/ecommerce/MonthlySalesChart";
import StatisticsChart from "../../components/ecommerce/StatisticsChart";
import MonthlyTarget from "../../components/ecommerce/MonthlyTarget";
import RecentOrders, {
  RecentPropertyRow,
} from "../../components/ecommerce/RecentOrders";
import DemographicCard, {
  CitySlice,
} from "../../components/ecommerce/DemographicCard";
import PageMeta from "../../components/common/PageMeta";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

type DashboardStats = {
  currency: string;
  scope: string;
  metrics: {
    primary: {
      label: string;
      sublabel?: string;
      value: number;
      changePercent: number;
      trend: "up" | "down";
    };
    secondary: {
      label: string;
      sublabel?: string;
      value: number;
      changePercent: number;
      trend: "up" | "down";
    };
  };
  charts: {
    monthlyNewListings: number[];
    statistics: { series: { name: string; data: number[] }[] };
  };
  monthlyTarget: {
    activePercent: number;
    totalPortfolioValue: number;
    revenueThisMonth: number;
    newListingsThisMonth: number;
    newListingsToday: number;
    revenueMomPct: number;
    revenueTrend: "up" | "down";
  };
  topCities: CitySlice[];
  recentProperties: RecentPropertyRow[];
};

export default function Home() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      setLoading(false);
      setError("Not signed in");
      return;
    }

    let cancelled = false;
    (async () => {
      try {
        const res = await fetch(`${API_URL}/properties/dashboard/stats`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const json = await res.json();
        if (!res.ok) {
          throw new Error(json.message || "Failed to load dashboard");
        }
        if (json.success && json.data && !cancelled) {
          setStats(json.data as DashboardStats);
        } else if (!cancelled) {
          setError(json.message || "Failed to load dashboard");
        }
      } catch (e) {
        if (!cancelled) {
          setError(
            e instanceof Error ? e.message : "Failed to load dashboard"
          );
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  const currency = stats?.currency ?? "TND";

  return (
    <>
      <PageMeta
        title="Dashboard | Smart Property"
        description="Your portfolio overview — listings, transactions, and insights."
      />
      {error && !stats && (
        <div className="mb-4 rounded-xl border border-error-200 bg-error-50 px-4 py-3 text-sm text-error-700 dark:border-error-500/30 dark:bg-error-500/10 dark:text-error-400">
          {error}
        </div>
      )}
      <div className="grid grid-cols-12 gap-4 md:gap-6">
        <div className="col-span-12 space-y-6 xl:col-span-7">
          <EcommerceMetrics
            loading={loading}
            primary={stats?.metrics.primary}
            secondary={stats?.metrics.secondary}
          />

          <MonthlySalesChart
            loading={loading}
            title="New listings"
            seriesName="Listings"
            data={stats?.charts.monthlyNewListings}
          />
        </div>

        <div className="col-span-12 xl:col-span-5">
          <MonthlyTarget
            loading={loading}
            activePercent={stats?.monthlyTarget.activePercent}
            totalPortfolioValue={stats?.monthlyTarget.totalPortfolioValue}
            revenueThisMonth={stats?.monthlyTarget.revenueThisMonth}
            newListingsToday={stats?.monthlyTarget.newListingsToday}
            revenueMomPct={stats?.monthlyTarget.revenueMomPct}
            revenueTrend={stats?.monthlyTarget.revenueTrend}
            currency={currency}
          />
        </div>

        <div className="col-span-12">
          <StatisticsChart
            loading={loading}
            series={stats?.charts.statistics.series}
          />
        </div>

        <div className="col-span-12 xl:col-span-5">
          <DemographicCard loading={loading} topCities={stats?.topCities} />
        </div>

        <div className="col-span-12 xl:col-span-7">
          <RecentOrders
            loading={loading}
            rows={stats?.recentProperties}
            currency={currency}
          />
        </div>
      </div>
    </>
  );
}
