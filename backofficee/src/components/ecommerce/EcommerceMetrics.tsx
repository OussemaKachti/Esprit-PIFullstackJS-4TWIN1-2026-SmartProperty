import {
  ArrowDownIcon,
  ArrowUpIcon,
  BoxIconLine,
  GroupIcon,
} from "../../icons";
import Badge from "../ui/badge/Badge";

export type MetricCardProps = {
  label: string;
  sublabel?: string;
  value: number;
  changePercent: number;
  trend: "up" | "down";
};

type Props = {
  loading?: boolean;
  primary?: MetricCardProps;
  secondary?: MetricCardProps;
};

function SkeletonCard() {
  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] md:p-6 animate-pulse">
      <div className="h-12 w-12 rounded-xl bg-gray-200 dark:bg-gray-700" />
      <div className="mt-5 h-4 w-24 rounded bg-gray-200 dark:bg-gray-700" />
      <div className="mt-3 h-8 w-20 rounded bg-gray-200 dark:bg-gray-700" />
    </div>
  );
}

export default function EcommerceMetrics({
  loading,
  primary,
  secondary,
}: Props) {
  if (loading || !primary || !secondary) {
    return (
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:gap-6">
        <SkeletonCard />
        <SkeletonCard />
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:gap-6">
      <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] md:p-6">
        <div className="flex items-center justify-center w-12 h-12 bg-gray-100 rounded-xl dark:bg-gray-800">
          <GroupIcon className="text-gray-800 size-6 dark:text-white/90" />
        </div>

        <div className="flex items-end justify-between mt-5">
          <div>
            <span className="text-sm text-gray-500 dark:text-gray-400">
              {primary.label}
            </span>
            {primary.sublabel && (
              <span className="block text-xs text-gray-400 dark:text-gray-500 mt-0.5">
                {primary.sublabel}
              </span>
            )}
            <h4 className="mt-2 font-bold text-gray-800 text-title-sm dark:text-white/90">
              {primary.value.toLocaleString()}
            </h4>
          </div>
          <Badge color={primary.trend === "up" ? "success" : "error"}>
            {primary.trend === "up" ? <ArrowUpIcon /> : <ArrowDownIcon />}
            {Math.abs(primary.changePercent).toFixed(1)}%
          </Badge>
        </div>
      </div>

      <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] md:p-6">
        <div className="flex items-center justify-center w-12 h-12 bg-gray-100 rounded-xl dark:bg-gray-800">
          <BoxIconLine className="text-gray-800 size-6 dark:text-white/90" />
        </div>
        <div className="flex items-end justify-between mt-5">
          <div>
            <span className="text-sm text-gray-500 dark:text-gray-400">
              {secondary.label}
            </span>
            {secondary.sublabel && (
              <span className="block text-xs text-gray-400 dark:text-gray-500 mt-0.5">
                {secondary.sublabel}
              </span>
            )}
            <h4 className="mt-2 font-bold text-gray-800 text-title-sm dark:text-white/90">
              {secondary.value.toLocaleString()}
            </h4>
          </div>

          <Badge color={secondary.trend === "up" ? "success" : "error"}>
            {secondary.trend === "up" ? <ArrowUpIcon /> : <ArrowDownIcon />}
            {Math.abs(secondary.changePercent).toFixed(1)}%
          </Badge>
        </div>
      </div>
    </div>
  );
}
