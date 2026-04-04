import { Link } from "react-router";
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "../ui/table";
import Badge from "../ui/badge/Badge";
import { resolvePropertyImageUrl } from "../../utils/propertyImageUrl";
import type { BuyerDealTableRow } from "../../utils/buyerTenantDashboardStats";

type Props = {
  loading?: boolean;
  rows?: BuyerDealTableRow[];
  currency?: string;
};

function statusBadgeColor(
  status: string
): "success" | "warning" | "error" | "info" {
  const s = status?.toUpperCase();
  if (s === "COMPLETED") return "success";
  if (s === "CONFIRMED") return "info";
  if (s === "CANCELLED") return "error";
  return "warning";
}

export default function BuyerDealActivityTable({
  loading,
  rows = [],
  currency = "TND",
}: Props) {
  return (
    <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white px-4 pb-3 pt-4 dark:border-gray-800 dark:bg-white/[0.03] sm:px-6">
      <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">Recent activity</h3>
          <p className="mt-0.5 text-theme-xs text-gray-500 dark:text-gray-400">
            Latest purchase offers and rental bookings with listing photos
          </p>
        </div>
        <Link
          to="/my-portfolio"
          className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-theme-sm font-medium text-gray-700 shadow-theme-xs hover:bg-gray-50 hover:text-gray-800 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-white/[0.03] dark:hover:text-gray-200"
        >
          See all
        </Link>
      </div>
      <div className="max-w-full overflow-x-auto">
        <Table>
          <TableHeader className="border-y border-gray-100 dark:border-gray-800">
            <TableRow>
              <TableCell
                isHeader
                className="py-3 text-start text-theme-xs font-medium text-gray-500 dark:text-gray-400"
              >
                Property
              </TableCell>
              <TableCell
                isHeader
                className="py-3 text-start text-theme-xs font-medium text-gray-500 dark:text-gray-400"
              >
                Deal
              </TableCell>
              <TableCell
                isHeader
                className="py-3 text-start text-theme-xs font-medium text-gray-500 dark:text-gray-400"
              >
                Amount
              </TableCell>
              <TableCell
                isHeader
                className="py-3 text-start text-theme-xs font-medium text-gray-500 dark:text-gray-400"
              >
                Status
              </TableCell>
            </TableRow>
          </TableHeader>

          <TableBody className="divide-y divide-gray-100 dark:divide-gray-800">
            {loading &&
              Array.from({ length: 5 }).map((_, i) => (
                <TableRow key={i}>
                  <TableCell className="py-4" colSpan={4}>
                    <div className="h-12 animate-pulse rounded-lg bg-gray-100 dark:bg-gray-800" />
                  </TableCell>
                </TableRow>
              ))}
            {!loading &&
              rows.map((p) => {
                const img = resolvePropertyImageUrl(p.images?.[0]?.url);
                const dealColor =
                  p.dealKind === "Rental"
                    ? "bg-purple-100 text-purple-800 dark:bg-purple-500/20 dark:text-purple-200"
                    : "bg-blue-100 text-blue-800 dark:bg-blue-500/20 dark:text-blue-200";
                return (
                  <TableRow key={p._id}>
                    <TableCell className="py-3">
                      <div className="flex items-center gap-3">
                        <div className="h-[52px] w-[52px] shrink-0 overflow-hidden rounded-lg bg-gray-100 ring-1 ring-gray-200 dark:bg-gray-800 dark:ring-gray-700">
                          <img src={img} className="h-full w-full object-cover" alt="" />
                        </div>
                        <div className="min-w-0">
                          <p className="line-clamp-1 text-theme-sm font-medium text-gray-800 dark:text-white/90">
                            {p.title}
                          </p>
                          <span className="text-theme-xs text-gray-500 dark:text-gray-400">
                            {p.type?.replace(/_/g, " ") || "—"}
                          </span>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="py-3">
                      <span
                        className={`inline-flex rounded-lg px-2.5 py-1 text-xs font-semibold ${dealColor}`}
                      >
                        {p.dealKind}
                      </span>
                    </TableCell>
                    <TableCell className="py-3 text-theme-sm font-medium text-gray-800 dark:text-white/90">
                      {Number(p.price).toLocaleString()} {currency}
                    </TableCell>
                    <TableCell className="py-3">
                      <Badge size="sm" color={statusBadgeColor(p.status)}>
                        {p.status}
                      </Badge>
                    </TableCell>
                  </TableRow>
                );
              })}
            {!loading && rows.length === 0 && (
              <TableRow>
                <TableCell
                  colSpan={4}
                  className="py-10 text-center text-theme-sm text-gray-500 dark:text-gray-400"
                >
                  No deals yet. Explore the marketplace to make an offer or book a rental.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
