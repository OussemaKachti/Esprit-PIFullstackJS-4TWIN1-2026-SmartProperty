import { useCallback, useEffect, useMemo, useState, type ReactNode } from "react";
import toast from "react-hot-toast";
import { Link } from "react-router";
import PageMeta from "../components/common/PageMeta";
import Button from "../components/ui/button/Button";
import { resolvePropertyImageUrl } from "../utils/propertyImageUrl";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";
const MARKETPLACE_URL = (import.meta.env.VITE_FRONTEND_URL || "http://localhost:3000").replace(
  /\/$/,
  ""
);

function effStatus(row: { status?: string; transactionId?: { status?: string } | null }) {
  const ts =
    row.transactionId && typeof row.transactionId === "object" ? row.transactionId.status : null;
  return ts || row.status || "PENDING";
}

function listingHref(propertyId: string | undefined, rent: boolean) {
  if (!propertyId) return MARKETPLACE_URL;
  return rent
    ? `${MARKETPLACE_URL}/rent-details/${propertyId}`
    : `${MARKETPLACE_URL}/buy-details/${propertyId}`;
}

const statusPill: Record<string, string> = {
  PENDING: "bg-amber-100 text-amber-900 dark:bg-amber-500/20 dark:text-amber-200",
  CONFIRMED: "bg-sky-100 text-sky-900 dark:bg-sky-500/20 dark:text-sky-200",
  COMPLETED: "bg-emerald-100 text-emerald-900 dark:bg-emerald-500/20 dark:text-emerald-200",
  CANCELLED: "bg-rose-100 text-rose-900 dark:bg-rose-500/20 dark:text-rose-200",
};

export default function MyPortfolio() {
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
      if (!res.ok) throw new Error(json.message || "Unable to load data");
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

  const { completedPurchases, activePurchases, completedRentals, activeRentals } = useMemo(() => {
    const doneSale = (s: any) => {
      const st = effStatus(s);
      return st === "COMPLETED" || s.flouciPaid === true;
    };
    const activeSale = (s: any) => !doneSale(s) && effStatus(s) !== "CANCELLED";
    const doneLease = (l: any) => {
      const st = effStatus(l);
      return st === "COMPLETED" || l.flouciPaid === true;
    };
    const activeLease = (l: any) => !doneLease(l) && effStatus(l) !== "CANCELLED";

    return {
      completedPurchases: sales.filter(doneSale),
      activePurchases: sales.filter(activeSale),
      completedRentals: leases.filter(doneLease),
      activeRentals: leases.filter(activeLease),
    };
  }, [sales, leases]);

  const Section = ({
    title,
    subtitle,
    children,
  }: {
    title: string;
    subtitle?: string;
    children: ReactNode;
  }) => (
    <section className="space-y-4">
      <div>
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">{title}</h2>
        {subtitle && <p className="text-sm text-gray-500 dark:text-gray-400">{subtitle}</p>}
      </div>
      {children}
    </section>
  );

  const StatCard = ({
    label,
    value,
    accent,
  }: {
    label: string;
    value: number;
    accent: "blue" | "emerald" | "violet" | "teal";
  }) => {
    const ring =
      accent === "blue"
        ? "bg-blue-50 text-blue-600 dark:bg-blue-500/15 dark:text-blue-300"
        : accent === "emerald"
          ? "bg-emerald-50 text-emerald-600 dark:bg-emerald-500/15 dark:text-emerald-300"
          : accent === "violet"
            ? "bg-violet-50 text-violet-600 dark:bg-violet-500/15 dark:text-violet-300"
            : "bg-teal-50 text-teal-600 dark:bg-teal-500/15 dark:text-teal-300";
    return (
      <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03]">
        <div className={`mb-3 flex h-11 w-11 items-center justify-center rounded-xl ${ring}`}>
          <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
            />
          </svg>
        </div>
        <p className="text-sm text-gray-500 dark:text-gray-400">{label}</p>
        <p className="mt-1 text-2xl font-bold text-gray-900 dark:text-white">
          {loading ? "—" : value}
        </p>
      </div>
    );
  };

  const Card = ({ row, kind }: { row: any; kind: "sale" | "lease" }) => {
    const st = effStatus(row);
    const pid = row.propertyId?._id || row.propertyId;
    const rent = kind === "lease";
    const imgUrl = resolvePropertyImageUrl(row.propertyId?.images?.[0]?.url);
    const pillClass = statusPill[st] || "bg-gray-100 text-gray-800 dark:bg-white/10 dark:text-gray-300";

    return (
      <article className="group overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm transition hover:border-gray-300 hover:shadow-md dark:border-gray-800 dark:bg-gray-900 dark:hover:border-gray-700">
        <div className="relative aspect-[16/10] overflow-hidden bg-gray-100 dark:bg-gray-800">
          <img
            src={imgUrl}
            alt=""
            className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.02]"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-black/10 to-transparent" />
          <div className="absolute left-3 top-3 flex flex-wrap gap-2">
            <span
              className={`rounded-lg px-2.5 py-1 text-xs font-semibold shadow-sm backdrop-blur-sm ${
                rent
                  ? "bg-purple-600/90 text-white"
                  : "bg-blue-600/90 text-white"
              }`}
            >
              {rent ? "Rental" : "Purchase"}
            </span>
            <span
              className={`rounded-lg px-2.5 py-1 text-xs font-semibold shadow-sm backdrop-blur-sm ${pillClass}`}
            >
              {st}
            </span>
          </div>
          <div className="absolute bottom-3 left-3 right-3">
            <h3 className="line-clamp-2 text-lg font-semibold leading-tight text-white drop-shadow-md">
              {row.propertyId?.title || row.propertyId?.reference || "Property"}
            </h3>
            {row.propertyId?.city && (
              <p className="mt-0.5 text-sm text-white/90 drop-shadow">{row.propertyId.city}</p>
            )}
          </div>
        </div>
        <div className="space-y-3 p-4">
          <div className="flex flex-wrap items-end justify-between gap-2 border-b border-gray-100 pb-3 dark:border-gray-800">
            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-gray-400">Amount</p>
              <p className="text-lg font-bold text-gray-900 dark:text-white">
                {rent
                  ? `${(Number(row.rentAmount) + Number(row.charges || 0)).toLocaleString()} TND`
                  : `${Number(row.salePrice).toLocaleString()} TND`}
                {rent && <span className="ml-1 text-xs font-normal text-gray-500">/ period</span>}
              </p>
            </div>
          </div>
          {rent && row.startDate && (
            <p className="text-xs text-gray-500 dark:text-gray-400">
              <span className="font-medium text-gray-700 dark:text-gray-300">Stay: </span>
              {new Date(row.startDate).toLocaleDateString()} —{" "}
              {new Date(row.endDate).toLocaleDateString()}
            </p>
          )}
          <div className="flex flex-wrap gap-2 pt-1">
            <a href={listingHref(pid, rent)} target="_blank" rel="noreferrer">
              <Button size="sm" variant="outline">
                View listing
              </Button>
            </a>
            <Link to="/my-offers">
              <Button size="sm" variant="outline">
                Offer details
              </Button>
            </Link>
          </div>
        </div>
      </article>
    );
  };

  return (
    <div className="space-y-10">
      <PageMeta
        title="Purchases & rentals | Smart Property"
        description="Properties you are buying or renting through Smart Property."
      />

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">Purchases & rentals</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Visual overview of properties linked to your offers and bookings.
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={load} disabled={loading}>
          Refresh
        </Button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Active purchases" value={activePurchases.length} accent="blue" />
        <StatCard label="Completed purchases" value={completedPurchases.length} accent="emerald" />
        <StatCard label="Active rentals" value={activeRentals.length} accent="violet" />
        <StatCard label="Completed rentals" value={completedRentals.length} accent="teal" />
      </div>

      {loading && (
        <div className="grid gap-4 md:grid-cols-2">
          {[1, 2].map((k) => (
            <div
              key={k}
              className="overflow-hidden rounded-2xl border border-gray-200 dark:border-gray-800"
            >
              <div className="aspect-[16/10] animate-pulse bg-gray-200 dark:bg-gray-800" />
              <div className="space-y-2 p-4">
                <div className="h-4 w-2/3 animate-pulse rounded bg-gray-200 dark:bg-gray-700" />
                <div className="h-8 w-1/3 animate-pulse rounded bg-gray-100 dark:bg-gray-800" />
              </div>
            </div>
          ))}
        </div>
      )}

      {!loading && (
        <div className="space-y-12">
          <Section
            title="Active requests"
            subtitle="Offers and bookings in progress — payment or confirmation may still be pending."
          >
            {activePurchases.length === 0 && activeRentals.length === 0 ? (
              <p className="rounded-2xl border border-dashed border-gray-200 px-6 py-12 text-center text-sm text-gray-500 dark:border-gray-700 dark:text-gray-400">
                No active purchase or rental request.{" "}
                <a href={MARKETPLACE_URL} className="font-medium text-brand-600 underline dark:text-brand-400">
                  Browse the marketplace
                </a>
              </p>
            ) : (
              <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
                {activePurchases.map((s) => (
                  <Card key={s._id} row={s} kind="sale" />
                ))}
                {activeRentals.map((l) => (
                  <Card key={l._id} row={l} kind="lease" />
                ))}
              </div>
            )}
          </Section>

          <Section
            title="Completed"
            subtitle="Closed purchases and rental agreements — your confirmed Smart Property activity."
          >
            {completedPurchases.length === 0 && completedRentals.length === 0 ? (
              <p className="rounded-2xl border border-dashed border-gray-200 px-6 py-12 text-center text-sm text-gray-500 dark:border-gray-700 dark:text-gray-400">
                No completed deals yet.
              </p>
            ) : (
              <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
                {completedPurchases.map((s) => (
                  <Card key={s._id} row={s} kind="sale" />
                ))}
                {completedRentals.map((l) => (
                  <Card key={l._id} row={l} kind="lease" />
                ))}
              </div>
            )}
          </Section>
        </div>
      )}
    </div>
  );
}
