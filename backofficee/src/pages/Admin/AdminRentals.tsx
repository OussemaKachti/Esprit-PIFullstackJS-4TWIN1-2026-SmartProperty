import { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import PageMeta from "../../components/common/PageMeta";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

const resolveImageUrl = (relativeUrl?: string) => {
  if (!relativeUrl) {
    return "/img/default_property.jfif";
  }

  const normalized = relativeUrl.replace(/\\/g, "/");
  if (/^https?:\/\//i.test(normalized)) return normalized;

  const baseApi = API_URL.replace(/\/api$/, "");
  if (normalized.startsWith("/uploads/")) return `${baseApi}${normalized}`;
  if (normalized.startsWith("uploads/")) return `${baseApi}/${normalized}`;
  return `${baseApi}/${normalized}`;
};

export type Rental = {
  id: string;
  property_type: string;
  room_count: number;
  bathroom_count: number;
  size: number;
  price: number;
  city: string;
  region: string;
  status?: string;
  price_per_m2?: number;
  image?: string;
};

const PROPERTY_TYPES = [
  { value: "", label: "All types" },
  { value: "APARTMENT", label: "Apartment" },
  { value: "HOUSE", label: "House" },
  { value: "VILLA", label: "Villa" },
  { value: "STUDIO", label: "Studio" },
];

export default function AdminRentals() {
  const [rentals, setRentals] = useState<Rental[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [filters, setFilters] = useState({
    city: "",
    propertyType: "",
    minPrice: "",
    maxPrice: "",
  });
  const [appliedFilters, setAppliedFilters] = useState(filters);

  const stats = useMemo(() => {
    const total = rentals.length;
    const avgPrice = total
      ? Math.round(rentals.reduce((acc, r) => acc + (r.price || 0), 0) / total)
      : 0;
    const premium = rentals.filter((r) => (r.price || 0) >= avgPrice).length;
    const withImages = rentals.filter((r) => Boolean(r.image)).length;
    return { total, avgPrice, premium, withImages };
  }, [rentals]);

  useEffect(() => {
    fetchRentals();
  }, [page, appliedFilters]);

  const fetchRentals = async () => {
    setLoading(true);
    try {
      const url = new URL(`${API_URL}/properties`);
      if (appliedFilters.city) url.searchParams.set("city", appliedFilters.city);
      if (appliedFilters.propertyType) url.searchParams.set("type", appliedFilters.propertyType);
      if (appliedFilters.minPrice) url.searchParams.set("minPrice", appliedFilters.minPrice);
      if (appliedFilters.maxPrice) url.searchParams.set("maxPrice", appliedFilters.maxPrice);
      url.searchParams.set("listingType", "FOR_RENT");
      url.searchParams.set("status", "AVAILABLE");
      url.searchParams.set("limit", "25");
      url.searchParams.set("page", String(page));

      const res = await fetch(url.toString());
      if (!res.ok) throw new Error("Failed to fetch properties");
      const data = await res.json();

      const payload = data?.data || data;
      const properties = Array.isArray(payload?.properties) ? payload.properties : [];
      const rawTotal = Number(payload?.total || properties.length);
      const rawTotalPages = Number(payload?.totalPages || 1);

      const mapped: Rental[] = properties.map((p: any) => {
        const priceNum = Number(p.price) || 0;
        const sizeNum = Number(p.surface) || 0;
        return {
          id: p._id,
          property_type: p.type || "Property",
          room_count: Number(p.rooms) || 0,
          bathroom_count: Number(p.bathrooms) || 0,
          size: sizeNum,
          price: priceNum,
          city: p.city || "",
          region: p.country || "",
          status: p.status,
          price_per_m2: sizeNum > 0 ? priceNum / sizeNum : undefined,
          image: Array.isArray(p.images) && p.images.length > 0 ? p.images[0]?.url : undefined,
        };
      });

      setRentals(mapped);
      setTotalCount(rawTotal);
      setTotalPages(Math.max(1, rawTotalPages));
    } catch (error) {
      console.error(error);
      toast.error("Unable to load rentals from backend");
      setRentals([]);
    } finally {
      setLoading(false);
    }
  };

  const resetFilters = () => {
    const empty = { city: "", propertyType: "", minPrice: "", maxPrice: "" };
    setFilters(empty);
    setAppliedFilters(empty);
    setPage(1);
  };

  const applyFilters = () => {
    setPage(1);
    setAppliedFilters(filters);
  };

  const formatTND = (value: number) => `${Math.round(value).toLocaleString("fr-TN")} TND`;

  const goToPage = (nextPage: number) => {
    setPage(Math.min(Math.max(1, nextPage), totalPages));
  };

  return (
    <>
      <PageMeta title="Smart Property" description="Browse live rental listings from backend" />

      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Rental Listings</h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              Live backend view of available rentals with city, price, and property type filters.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={resetFilters}
              className="px-3 py-2 text-sm font-medium rounded-lg border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800"
              disabled={loading}
            >
              Reset
            </button>
            <button
              onClick={applyFilters}
              className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
              disabled={loading}
            >
              {loading ? "Loading..." : "Apply filters"}
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard title="Visible rentals" value={stats.total} helper={`page ${page} of ${totalPages}`} tone="indigo" />
          <StatCard title="Total catalogue" value={totalCount || stats.total} helper="all matching rentals" tone="slate" />
          <StatCard title="Average price" value={formatTND(stats.avgPrice)} helper="current page" tone="emerald" />
          <StatCard title="With images" value={stats.withImages} helper={`${stats.premium} premium priced`} tone="amber" />
        </div>

        <div className="bg-white dark:bg-gray-dark rounded-2xl border border-gray-200 dark:border-gray-800 p-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">City</label>
              <input
                type="text"
                value={filters.city}
                onChange={(e) => setFilters({ ...filters, city: e.target.value })}
                placeholder="Tunis, Sousse..."
                className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Property type</label>
              <select
                value={filters.propertyType}
                onChange={(e) => setFilters({ ...filters, propertyType: e.target.value })}
                className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500"
              >
                {PROPERTY_TYPES.map((type) => (
                  <option key={type.value || "all"} value={type.value}>
                    {type.label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Min price</label>
              <input
                type="number"
                value={filters.minPrice}
                onChange={(e) => setFilters({ ...filters, minPrice: e.target.value })}
                placeholder="0"
                className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Max price</label>
              <input
                type="number"
                value={filters.maxPrice}
                onChange={(e) => setFilters({ ...filters, maxPrice: e.target.value })}
                placeholder="2000"
                className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-dark rounded-2xl border border-gray-200 dark:border-gray-800 overflow-hidden">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
            </div>
          ) : (
            <table className="w-full table-fixed">
              <thead className="bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
                <tr>
                  <th className="px-3 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">Type</th>
                  <th className="px-3 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">Location</th>
                  <th className="px-3 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider w-32">Price</th>
                  <th className="px-3 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider w-32">Size</th>
                  <th className="px-3 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider w-24">Rooms</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {rentals.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-3 py-12 text-center text-gray-500 dark:text-gray-400">
                      No rentals found with these filters
                    </td>
                  </tr>
                ) : (
                  rentals.map((rental) => (
                    <tr key={rental.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/40 transition-colors">
                      <td className="px-3 py-4 text-sm font-semibold text-gray-900 dark:text-white">
                        <div className="flex items-center gap-3">
                          <div className="h-12 w-12 rounded-xl overflow-hidden bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 flex-shrink-0">
                            <img
                              src={resolveImageUrl(rental.image)}
                              alt={rental.property_type}
                              className="h-full w-full object-cover"
                              onError={(e) => {
                                e.currentTarget.src = "/img/default_property.jfif";
                              }}
                            />
                          </div>
                          <div>
                            <div>{rental.property_type}</div>
                            <p className="text-xs text-gray-500 dark:text-gray-400">{rental.status || "AVAILABLE"}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-3 py-4 text-sm text-gray-800 dark:text-gray-100">
                        {rental.city}
                        <p className="text-xs text-gray-500 dark:text-gray-400">{rental.region}</p>
                      </td>
                      <td className="px-3 py-4 text-sm text-gray-900 dark:text-white font-semibold">
                        {formatTND(rental.price)}
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          {rental.price_per_m2 ? `${rental.price_per_m2.toFixed(2)} TND / m²` : "–"}
                        </p>
                      </td>
                      <td className="px-3 py-4 text-sm text-gray-800 dark:text-gray-100">
                        {rental.size} m²
                      </td>
                      <td className="px-3 py-4 text-sm text-gray-800 dark:text-gray-100">
                        {rental.room_count} bd · {rental.bathroom_count} bath
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          )}
        </div>

        <div className="flex items-center justify-between gap-3 flex-wrap pt-2">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Showing page <span className="font-semibold text-gray-900 dark:text-white">{page}</span> of <span className="font-semibold text-gray-900 dark:text-white">{totalPages}</span>
          </p>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => goToPage(page - 1)}
              disabled={page <= 1 || loading}
              className="px-4 py-2 text-sm font-medium rounded-lg border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-200 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-gray-800"
            >
              Previous
            </button>
            <button
              type="button"
              onClick={() => goToPage(page + 1)}
              disabled={page >= totalPages || loading}
              className="px-4 py-2 text-sm font-medium rounded-lg border border-indigo-600 bg-indigo-600 text-white disabled:opacity-50 disabled:cursor-not-allowed hover:bg-indigo-700"
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

function StatCard({ title, value, helper, tone = "indigo" }: { title: string; value: number | string; helper: string; tone?: "indigo" | "slate" | "emerald" | "amber" }) {
  const toneClass: Record<"indigo" | "slate" | "emerald" | "amber", string> = {
    indigo: "from-indigo-500 to-indigo-600",
    slate: "from-slate-500 to-slate-600",
    emerald: "from-emerald-500 to-emerald-600",
    amber: "from-amber-500 to-amber-600",
  };

  return (
    <div className="relative overflow-hidden bg-white dark:bg-gray-dark rounded-2xl border border-gray-200 dark:border-gray-800 p-5 hover:shadow-sm transition-shadow">
      <div className={`absolute inset-x-0 top-0 h-1 bg-gradient-to-r ${toneClass[tone]}`} />
      <p className="text-sm font-medium text-gray-600 dark:text-gray-400">{title}</p>
      <p className="text-3xl font-bold text-gray-900 dark:text-white mt-2 tracking-tight">{value}</p>
      <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">{helper}</p>
    </div>
  );
}
