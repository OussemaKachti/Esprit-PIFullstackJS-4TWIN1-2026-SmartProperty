import { useCallback, useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import { Link } from "react-router";
import PageMeta from "../components/common/PageMeta";
import Button from "../components/ui/button/Button";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";
const MARKETPLACE_URL = (import.meta.env.VITE_FRONTEND_URL || "http://localhost:3000").replace(
  /\/$/,
  ""
);

const statusStyles: Record<string, string> = {
  PENDING: "bg-amber-100 text-amber-900 dark:bg-amber-500/20 dark:text-amber-200",
  CONFIRMED: "bg-emerald-100 text-emerald-900 dark:bg-emerald-500/20 dark:text-emerald-200",
  COMPLETED: "bg-emerald-100 text-emerald-900 dark:bg-emerald-500/20 dark:text-emerald-200",
  CANCELLED: "bg-rose-100 text-rose-900 dark:bg-rose-500/20 dark:text-rose-200",
};

function effectiveStatus(row: { status?: string; transactionId?: { status?: string } | null }) {
  const ts = row.transactionId && typeof row.transactionId === "object" ? row.transactionId.status : null;
  return ts || row.status || "PENDING";
}

function listingUrl(propertyId: string | undefined, rent: boolean) {
  if (!propertyId) return MARKETPLACE_URL;
  return rent
    ? `${MARKETPLACE_URL}/rent-details/${propertyId}`
    : `${MARKETPLACE_URL}/buy-details/${propertyId}`;
}

export default function MyOffers() {
  const [sales, setSales] = useState<any[]>([]);
  const [leases, setLeases] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

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
      if (!res.ok) throw new Error(json.message || "Unable to load offers");
      setSales(json.data?.sales || []);
      setLeases(json.data?.leases || []);
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : "Unable to load offers");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const empty = useMemo(() => sales.length === 0 && leases.length === 0, [sales.length, leases.length]);

  return (
    <div className="space-y-6">
      <PageMeta title="My offers | Smart Property" description="Your purchase offers and rental requests." />

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">My offers</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Track status and open the listing on the marketplace to pay with Flouci when accepted.
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={load} disabled={loading}>
          Refresh
        </Button>
      </div>

      {loading && <p className="text-sm text-gray-500">Loading…</p>}

      {!loading && empty && (
        <div className="rounded-2xl border border-dashed border-gray-300 bg-white px-8 py-14 text-center dark:border-gray-700 dark:bg-gray-900">
          <p className="text-base font-semibold text-gray-900 dark:text-white">No offers yet</p>
          <p className="mx-auto mt-2 max-w-md text-sm text-gray-500">
            Submit an offer or booking from the marketplace — it will show up here.
          </p>
          <a
            href={MARKETPLACE_URL}
            className="mt-6 inline-flex rounded-xl bg-teal-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-teal-700"
          >
            Go to marketplace
          </a>
        </div>
      )}

      <div className="grid gap-4">
        {sales.map((row) => {
          const st = effectiveStatus(row);
          const pill = statusStyles[st] || "bg-gray-100 text-gray-800 dark:bg-white/10";
          const pid = row.propertyId?._id || row.propertyId;
          return (
            <article
              key={row._id}
              className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-gray-900"
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="rounded-lg bg-blue-100 px-2 py-0.5 text-xs font-semibold text-blue-800 dark:bg-blue-500/20 dark:text-blue-200">
                      Purchase
                    </span>
                    <span className={`rounded-full px-3 py-0.5 text-xs font-semibold ${pill}`}>{st}</span>
                  </div>
                  <h2 className="mt-2 text-lg font-semibold text-gray-900 dark:text-white">
                    {row.propertyId?.title || row.propertyId?.reference || "Property"}
                  </h2>
                  {row.propertyId?.city && (
                    <p className="text-sm text-gray-500 dark:text-gray-400">{row.propertyId.city}</p>
                  )}
                </div>
                <p className="text-lg font-semibold text-gray-900 dark:text-white">
                  {Number(row.salePrice).toLocaleString()} TND
                </p>
              </div>
              <div className="mt-4 flex flex-wrap gap-2">
                <a href={listingUrl(pid, false)} target="_blank" rel="noreferrer">
                  <Button size="sm" variant="outline">
                    Open listing
                  </Button>
                </a>
                {(st === "CONFIRMED" || st === "COMPLETED") && !row.flouciPaid && (
                  <a href={listingUrl(pid, false)} target="_blank" rel="noreferrer">
                    <Button size="sm">Proceed to payment</Button>
                  </a>
                )}
              </div>
            </article>
          );
        })}

        {leases.map((row) => {
          const st = effectiveStatus(row);
          const pill = statusStyles[st] || "bg-gray-100 text-gray-800 dark:bg-white/10";
          const pid = row.propertyId?._id || row.propertyId;
          const total = Number(row.rentAmount) + Number(row.charges || 0);
          return (
            <article
              key={row._id}
              className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-gray-900"
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="rounded-lg bg-purple-100 px-2 py-0.5 text-xs font-semibold text-purple-800 dark:bg-purple-500/20 dark:text-purple-200">
                      Rental
                    </span>
                    <span className={`rounded-full px-3 py-0.5 text-xs font-semibold ${pill}`}>{st}</span>
                  </div>
                  <h2 className="mt-2 text-lg font-semibold text-gray-900 dark:text-white">
                    {row.propertyId?.title || row.propertyId?.reference || "Property"}
                  </h2>
                </div>
                <p className="text-lg font-semibold text-gray-900 dark:text-white">
                  {total.toLocaleString()} TND
                </p>
              </div>
              <div className="mt-4 flex flex-wrap gap-2">
                <a href={listingUrl(pid, true)} target="_blank" rel="noreferrer">
                  <Button size="sm" variant="outline">
                    Open listing
                  </Button>
                </a>
                {st === "CONFIRMED" && !row.flouciPaid && (
                  <a href={listingUrl(pid, true)} target="_blank" rel="noreferrer">
                    <Button size="sm">Proceed to payment</Button>
                  </a>
                )}
              </div>
            </article>
          );
        })}
      </div>

      <p className="text-center text-xs text-gray-400">
        <Link to="/" className="text-teal-600 hover:underline dark:text-teal-400">
          ← Back to home
        </Link>
      </p>
    </div>
  );
}
