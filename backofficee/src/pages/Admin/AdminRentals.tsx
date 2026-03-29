import { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import PageMeta from "../../components/common/PageMeta";

const API_URL = import.meta.env.VITE_FASTAPI_URL || "http://127.0.0.1:8000";

export type Rental = {
  id: number;
  property_type: string;
  room_count: number;
  bathroom_count: number;
  size: number;
  price: number;
  city: string;
  region: string;
  price_per_m2?: number;
};

const PROPERTY_TYPES = [
  "Appartements",
  "Maisons et Villas",
  "Locations de vacances",
  "Bureaux",
  "Terrains",
];

export default function AdminRentals() {
  const [rentals, setRentals] = useState<Rental[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    city: "",
    propertyType: "",
    minPrice: "",
    maxPrice: "",
  });

  const stats = useMemo(() => {
    const total = rentals.length;
    const avgPrice = total
      ? Math.round(rentals.reduce((acc, r) => acc + (r.price || 0), 0) / total)
      : 0;
    return { total, avgPrice };
  }, [rentals]);

  useEffect(() => {
    fetchRentals();
  }, []);

  const fetchRentals = async () => {
    setLoading(true);
    try {
      const url = new URL(`${API_URL}/admin/properties`);
      if (filters.city) url.searchParams.set("city", filters.city);
      if (filters.propertyType) url.searchParams.set("property_type", filters.propertyType);
      if (filters.minPrice) url.searchParams.set("min_price", filters.minPrice);
      if (filters.maxPrice) url.searchParams.set("max_price", filters.maxPrice);
      url.searchParams.set("limit", "200");

      const res = await fetch(url.toString());
      if (!res.ok) throw new Error("Failed to fetch properties");
      const data = await res.json();
      setRentals(Array.isArray(data?.properties) ? data.properties : []);
    } catch (error) {
      console.error(error);
      toast.error("Unable to load rentals from FastAPI");
      setRentals([]);
    } finally {
      setLoading(false);
    }
  };

  const resetFilters = () => {
    setFilters({ city: "", propertyType: "", minPrice: "", maxPrice: "" });
  };

  return (
    <>
      <PageMeta title="Admin · Rentals" description="Browse rental listings from the dataset" />

      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Rental Listings</h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              Dataset-powered view with city, price, and property type filters.
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
              onClick={fetchRentals}
              className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
              disabled={loading}
            >
              {loading ? "Loading..." : "Apply"}
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard title="Total listings" value={stats.total} helper="from dataset" />
          <StatCard title="Average price" value={`${stats.avgPrice.toLocaleString("fr-TN")} TND`} helper="approx." />
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
                <option value="">All types</option>
                {PROPERTY_TYPES.map((type) => (
                  <option key={type} value={type}>
                    {type}
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
                        {rental.property_type}
                        <p className="text-xs text-gray-500 dark:text-gray-400">{rental.region}</p>
                      </td>
                      <td className="px-3 py-4 text-sm text-gray-800 dark:text-gray-100">
                        {rental.city}
                        <p className="text-xs text-gray-500 dark:text-gray-400">{rental.region}</p>
                      </td>
                      <td className="px-3 py-4 text-sm text-gray-900 dark:text-white font-semibold">
                        {Math.round(rental.price).toLocaleString("fr-TN")} TND
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
      </div>
    </>
  );
}

function StatCard({ title, value, helper }: { title: string; value: number | string; helper: string }) {
  return (
    <div className="bg-white dark:bg-gray-dark rounded-2xl border border-gray-200 dark:border-gray-800 p-5 hover:shadow-sm transition-shadow">
      <p className="text-sm text-gray-600 dark:text-gray-400">{title}</p>
      <p className="text-3xl font-bold text-gray-900 dark:text-white mt-2">{value}</p>
      <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">{helper}</p>
    </div>
  );
}
