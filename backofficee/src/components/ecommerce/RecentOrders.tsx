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

export type RecentPropertyRow = {
  _id: string;
  title: string;
  type: string;
  listingType?: string;
  price: number;
  status: string;
  images?: { url?: string }[];
};

type Props = {
  loading?: boolean;
  rows?: RecentPropertyRow[];
  currency?: string;
};

function statusBadgeColor(
  status: string
): "success" | "warning" | "error" | "info" {
  const s = status?.toUpperCase();
  if (s === "AVAILABLE") return "success";
  if (s === "PENDING") return "warning";
  if (s === "RENTED") return "info";
  if (s === "SOLD") return "success";
  if (s === "ARCHIVED") return "error";
  return "warning";
}

function listingLabel(listingType?: string) {
  if (!listingType) return "";
  return listingType === "FOR_RENT" ? "For rent" : "For sale";
}

export default function RecentOrders({
  loading,
  rows = [],
  currency = "TND",
}: Props) {
  return (
    <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white px-4 pb-3 pt-4 dark:border-gray-800 dark:bg-white/[0.03] sm:px-6">
      <div className="flex flex-col gap-2 mb-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
            Recent properties
          </h3>
          <p className="text-theme-xs text-gray-500 dark:text-gray-400 mt-0.5">
            Latest updates on your portfolio
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            to="/my-properties"
            className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-theme-sm font-medium text-gray-700 shadow-theme-xs hover:bg-gray-50 hover:text-gray-800 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-white/[0.03] dark:hover:text-gray-200"
          >
            See all
          </Link>
        </div>
      </div>
      <div className="max-w-full overflow-x-auto">
        <Table>
          <TableHeader className="border-gray-100 dark:border-gray-800 border-y">
            <TableRow>
              <TableCell
                isHeader
                className="py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
              >
                Property
              </TableCell>
              <TableCell
                isHeader
                className="py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
              >
                Type
              </TableCell>
              <TableCell
                isHeader
                className="py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
              >
                Price
              </TableCell>
              <TableCell
                isHeader
                className="py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
              >
                Status
              </TableCell>
            </TableRow>
          </TableHeader>

          <TableBody className="divide-y divide-gray-100 dark:divide-gray-800">
            {loading &&
              Array.from({ length: 5 }).map((_, i) => (
                <TableRow key={i}>
                  <TableCell colSpan={4} className="py-4">
                    <div className="h-12 rounded-lg bg-gray-100 dark:bg-gray-800 animate-pulse" />
                  </TableCell>
                </TableRow>
              ))}
            {!loading &&
              rows.map((p) => {
                const img = resolvePropertyImageUrl(p.images?.[0]?.url);
                return (
                  <TableRow key={p._id}>
                    <TableCell className="py-3">
                      <div className="flex items-center gap-3">
                        <div className="h-[50px] w-[50px] overflow-hidden rounded-md bg-gray-100 dark:bg-gray-800">
                          <img
                            src={img}
                            className="h-[50px] w-[50px] object-cover"
                            alt=""
                          />
                        </div>
                        <div>
                          <p className="font-medium text-gray-800 text-theme-sm dark:text-white/90 line-clamp-1">
                            {p.title}
                          </p>
                          <span className="text-gray-500 text-theme-xs dark:text-gray-400">
                            {listingLabel(p.listingType)}
                          </span>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="py-3 text-gray-500 text-theme-sm dark:text-gray-400">
                      {p.type?.replace(/_/g, " ") || "—"}
                    </TableCell>
                    <TableCell className="py-3 text-gray-800 text-theme-sm dark:text-white/90 font-medium">
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
                  className="py-8 text-center text-gray-500 text-theme-sm dark:text-gray-400"
                >
                  No properties yet. Add your first listing from My Properties.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
