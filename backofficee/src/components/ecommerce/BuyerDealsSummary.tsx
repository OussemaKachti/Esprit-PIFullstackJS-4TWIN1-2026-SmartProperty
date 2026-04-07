import Chart from "react-apexcharts";
import { ApexOptions } from "apexcharts";
import { useMemo } from "react";

function formatMoney(n: number, currency: string) {
  if (n >= 1_000_000) {
    return `${(n / 1_000_000).toFixed(2)}M ${currency}`;
  }
  if (n >= 1_000) {
    return `${(n / 1_000).toFixed(1)}k ${currency}`;
  }
  return `${Math.round(n).toLocaleString()} ${currency}`;
}

type Props = {
  loading?: boolean;
  completionPercent: number;
  totalCommittedTnd: number;
  activeDeals: number;
  completedCount: number;
  newOffersThisMonth: number;
  offersMomPct: number;
  offersMomTrend: "up" | "down";
  currency?: string;
};

export default function BuyerDealsSummary({
  loading,
  completionPercent,
  totalCommittedTnd,
  activeDeals,
  completedCount,
  newOffersThisMonth,
  offersMomPct,
  offersMomTrend,
  currency = "TND",
}: Props) {
  const series = useMemo(
    () => [Math.min(100, Math.max(0, Math.round(completionPercent)))],
    [completionPercent]
  );

  const options: ApexOptions = useMemo(
    () => ({
      colors: ["#465FFF"],
      chart: {
        fontFamily: "Outfit, sans-serif",
        type: "radialBar",
        height: 330,
        sparkline: {
          enabled: true,
        },
      },
      plotOptions: {
        radialBar: {
          startAngle: -85,
          endAngle: 85,
          hollow: {
            size: "80%",
          },
          track: {
            background: "#E4E7EC",
            strokeWidth: "100%",
            margin: 5,
          },
          dataLabels: {
            name: {
              show: false,
            },
            value: {
              fontSize: "36px",
              fontWeight: "600",
              offsetY: -40,
              color: "#1D2939",
              formatter(val) {
                return `${val}%`;
              },
            },
          },
        },
      },
      fill: {
        type: "solid",
        colors: ["#465FFF"],
      },
      stroke: {
        lineCap: "round",
      },
      labels: ["Deals closed"],
    }),
    []
  );

  if (loading) {
    return (
      <div className="rounded-2xl border border-gray-200 bg-gray-100 dark:border-gray-800 dark:bg-white/[0.03] animate-pulse">
        <div className="rounded-2xl bg-white px-5 pb-11 pt-5 shadow-default dark:bg-gray-900 sm:px-6 sm:pt-6">
          <div className="mb-2 h-6 w-48 rounded bg-gray-200 dark:bg-gray-700" />
          <div className="mt-4 h-[330px] rounded-lg bg-gray-100 dark:bg-gray-800" />
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-gray-200 bg-gray-100 dark:border-gray-800 dark:bg-white/[0.03]">
      <div className="rounded-2xl bg-white px-5 pb-11 pt-5 shadow-default dark:bg-gray-900 sm:px-6 sm:pt-6">
        <div>
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">Deal progress</h3>
          <p className="mt-1 text-theme-sm text-gray-500 dark:text-gray-400">
            Share of your offers and bookings that are fully completed (excludes cancelled).
          </p>
        </div>
        <div className="relative">
          <div className="max-h-[330px]" id="buyerDealsRadial">
            <Chart options={options} series={series} type="radialBar" height={330} />
          </div>
          <span
            className={`absolute left-1/2 top-full -translate-x-1/2 -translate-y-[95%] rounded-full px-3 py-1 text-xs font-medium ${
              offersMomTrend === "up"
                ? "bg-success-50 text-success-600 dark:bg-success-500/15 dark:text-success-500"
                : "bg-error-50 text-error-600 dark:bg-error-500/15 dark:text-error-500"
            }`}
          >
            {offersMomTrend === "up" ? "+" : ""}
            {offersMomPct.toFixed(1)}% new activity vs last month
          </span>
        </div>
        <p className="mx-auto mt-10 w-full max-w-[380px] text-center text-sm text-gray-500 sm:text-base">
          New offers or bookings this month:{" "}
          <span className="font-medium text-gray-800 dark:text-white/90">{newOffersThisMonth}</span>.
          Active in pipeline:{" "}
          <span className="font-medium text-gray-800 dark:text-white/90">{activeDeals}</span>.
        </p>
      </div>

      <div className="flex flex-wrap items-center justify-center gap-5 px-6 py-3.5 sm:gap-8 sm:py-5">
        <div>
          <p className="mb-1 text-center text-theme-xs text-gray-500 dark:text-gray-400 sm:text-sm">
            Total committed
          </p>
          <p className="text-center text-base font-semibold text-gray-800 dark:text-white/90 sm:text-lg">
            {formatMoney(totalCommittedTnd, currency)}
          </p>
        </div>
        <div className="h-7 w-px bg-gray-200 dark:bg-gray-800" />
        <div>
          <p className="mb-1 text-center text-theme-xs text-gray-500 dark:text-gray-400 sm:text-sm">
            Active deals
          </p>
          <p className="text-center text-base font-semibold text-gray-800 dark:text-white/90 sm:text-lg">
            {activeDeals}
          </p>
        </div>
        <div className="h-7 w-px bg-gray-200 dark:bg-gray-800" />
        <div>
          <p className="mb-1 text-center text-theme-xs text-gray-500 dark:text-gray-400 sm:text-sm">
            Completed
          </p>
          <p className="text-center text-base font-semibold text-gray-800 dark:text-white/90 sm:text-lg">
            {completedCount}
          </p>
        </div>
      </div>
    </div>
  );
}
