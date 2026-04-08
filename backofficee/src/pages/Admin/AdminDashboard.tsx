import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router";
import toast from "react-hot-toast";
import PageMeta from "../../components/common/PageMeta";
import {
  BoxIconLine,
  CheckCircleIcon,
  DollarLineIcon,
  GroupIcon,
  PieChartIcon,
  ShootingStarIcon,
  UserIcon,
} from "../../icons";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

type UserRecord = {
  _id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  role: string;
  isActive?: boolean;
  createdAt?: string;
};

type PropertyRecord = {
  _id: string;
  address?: string;
  city?: string;
  type?: string;
  listingType?: string;
  price?: number;
  status?: string;
  createdAt?: string;
};

type AdminDashboardData = {
  users: UserRecord[];
  properties: PropertyRecord[];
  totals: {
    users: number;
    activeUsers: number;
    inactiveUsers: number;
    properties: number;
    availableProperties: number;
    pendingProperties: number;
    rentedProperties: number;
    soldProperties: number;
    liveListings: number;
    newUsers30d: number;
    newProperties30d: number;
    averagePrice: number;
    medianPrice: number;
    activeRate: number;
    inventorySellThrough: number;
    userGrowthRate: number;
    listingGrowthRate: number;
  };
  roleBreakdown: Array<{ key: string; label: string; count: number; tone: string }>;
  statusBreakdown: Array<{ key: string; label: string; count: number; tone: string }>;
  typeBreakdown: Array<{ key: string; label: string; count: number; tone: string }>;
  cityBreakdown: Array<{ key: string; label: string; count: number }>;
  recentUsers: UserRecord[];
  recentProperties: PropertyRecord[];
};

const roleLabels: Record<string, string> = {
  ADMIN: "Admins",
  AGENCY: "Agencies",
  OWNER: "Owners",
  TENANT: "Tenants",
  BUYER: "Buyers",
};

const statusLabels: Record<string, string> = {
  available: "Available",
  pending: "Pending",
  rented: "Rented",
  sold: "Sold",
  archived: "Archived",
};

const typeLabels: Record<string, string> = {
  apartment: "Apartment",
  house: "House",
  villa: "Villa",
  office: "Office",
  land: "Land",
  commercial: "Commercial",
  studio: "Studio",
};

const toneClasses = [
  "bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300",
  "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300",
  "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300",
  "bg-cyan-100 text-cyan-700 dark:bg-cyan-900/30 dark:text-cyan-300",
  "bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-300",
];

function formatCurrency(value: number) {
  return `${Math.round(value).toLocaleString("en-US")} TND`;
}

function formatDate(value?: string) {
  if (!value) return "Unknown";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Unknown";
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function getFullName(user: UserRecord) {
  const fullName = [user.firstName, user.lastName].filter(Boolean).join(" ").trim();
  return fullName || user.email || "Unknown user";
}

function getInitials(user: UserRecord) {
  const first = user.firstName?.[0] || user.email?.[0] || "U";
  const last = user.lastName?.[0] || "";
  return `${first}${last}`.toUpperCase();
}

function getStartOfDayDaysAgo(daysAgo: number) {
  const date = new Date();
  date.setHours(0, 0, 0, 0);
  date.setDate(date.getDate() - daysAgo);
  return date;
}

function countBy<T>(items: T[], selector: (item: T) => string) {
  return items.reduce<Record<string, number>>((acc, item) => {
    const key = selector(item);
    acc[key] = (acc[key] || 0) + 1;
    return acc;
  }, {});
}

function getMedian(values: number[]) {
  if (values.length === 0) return 0;
  const sorted = [...values].sort((a, b) => a - b);
  const midpoint = Math.floor(sorted.length / 2);
  return sorted.length % 2 === 0
    ? (sorted[midpoint - 1] + sorted[midpoint]) / 2
    : sorted[midpoint];
}

function computeGrowthRate(current: number, previous: number) {
  if (previous === 0) return current > 0 ? 100 : 0;
  return ((current - previous) / previous) * 100;
}

function splitStatus(value?: string) {
  return String(value || "").trim().toLowerCase();
}

function SectionStat({
  label,
  value,
  helper,
  accent,
  icon,
}: {
  label: string;
  value: string;
  helper: string;
  accent: string;
  icon: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm transition-shadow hover:shadow-md dark:border-gray-800 dark:bg-gray-dark">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-gray-500 dark:text-gray-400">{label}</p>
          <p className="mt-2 text-3xl font-bold text-gray-900 dark:text-white">{value}</p>
          <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">{helper}</p>
        </div>
        <div className={`flex h-12 w-12 items-center justify-center rounded-2xl ${accent}`}>
          {icon}
        </div>
      </div>
    </div>
  );
}

function BreakdownBar({
  label,
  count,
  total,
  tone,
}: {
  label: string;
  count: number;
  total: number;
  tone: string;
}) {
  const percent = total > 0 ? Math.max(4, (count / total) * 100) : 0;
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between text-sm">
        <span className="font-medium text-gray-700 dark:text-gray-200">{label}</span>
        <span className="text-gray-500 dark:text-gray-400">
          {count} / {total}
        </span>
      </div>
      <div className="h-2 rounded-full bg-gray-100 dark:bg-gray-800">
        <div
          className={`h-2 rounded-full ${tone}`}
          style={{ width: `${percent}%` }}
        />
      </div>
    </div>
  );
}

function CityChart({
  items,
}: {
  items: Array<{ key: string; label: string; count: number }>;
}) {
  const chartItems = items.slice(0, 6);
  const maxCount = Math.max(...chartItems.map((item) => item.count), 1);
  const totalCount = items.reduce((sum, item) => sum + item.count, 0);
  const topCity = items[0] || null;
  const topCityShare = topCity && totalCount > 0 ? (topCity.count / totalCount) * 100 : 0;

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-gray-dark">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Top cities</h3>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Where your inventory is concentrated right now.</p>
        </div>
        <div className="inline-flex items-center gap-2 rounded-full border border-indigo-200 bg-indigo-50 px-3 py-1 text-xs font-semibold text-indigo-700 dark:border-indigo-500/20 dark:bg-indigo-900/20 dark:text-indigo-300">
          <span className="h-2 w-2 rounded-full bg-indigo-500" />
          City mix
        </div>
      </div>

      <div className="mt-4 grid grid-cols-1 gap-2.5 sm:grid-cols-3">
        <div className="rounded-xl bg-gray-50 px-3 py-2 text-center dark:bg-white/[0.03]">
          <p className="text-[11px] text-gray-500 dark:text-gray-400">Lead city</p>
          <p className="mt-0.5 truncate text-sm font-semibold text-gray-900 dark:text-white">
            {topCity?.label || "No data"}
          </p>
          <p className="text-[11px] text-gray-500 dark:text-gray-400">
            {topCity?.count ? `${topCity.count} listings` : "No listings"}
          </p>
        </div>
        <div className="rounded-xl bg-gray-50 px-3 py-2 text-center dark:bg-white/[0.03]">
          <p className="text-[11px] text-gray-500 dark:text-gray-400">City share</p>
          <p className="mt-0.5 text-sm font-semibold text-gray-900 dark:text-white">
            {topCity ? `${topCityShare.toFixed(1)}%` : "—"}
          </p>
          <p className="text-[11px] text-gray-500 dark:text-gray-400">of total inventory</p>
        </div>
        <div className="rounded-xl bg-gray-50 px-3 py-2 text-center dark:bg-white/[0.03]">
          <p className="text-[11px] text-gray-500 dark:text-gray-400">Active cities</p>
          <p className="mt-0.5 text-sm font-semibold text-gray-900 dark:text-white">{items.length}</p>
          <p className="text-[11px] text-gray-500 dark:text-gray-400">with current stock</p>
        </div>
      </div>

      <div className="mt-5 rounded-2xl bg-gradient-to-b from-gray-50 to-white p-4 dark:from-white/[0.03] dark:to-white/[0.02]">
        <div className="flex h-[250px] items-end gap-3 overflow-hidden rounded-xl border border-gray-100 bg-white px-4 pt-5 pb-4 dark:border-gray-800 dark:bg-gray-950/30 sm:gap-4">
          {chartItems.length > 0 ? (
            chartItems.map((item, index) => {
              const percent = Math.max(12, (item.count / maxCount) * 100);
              const barHeight = `${percent}%`;
              const accent = toneClasses[index % toneClasses.length];
              const barColor =
                index % 5 === 0
                  ? "bg-indigo-500"
                  : index % 5 === 1
                    ? "bg-emerald-500"
                    : index % 5 === 2
                      ? "bg-cyan-500"
                      : index % 5 === 3
                        ? "bg-amber-500"
                        : "bg-rose-500";

              return (
                <div key={item.key} className="flex min-w-0 flex-1 flex-col items-center justify-end gap-3">
                  <div className="flex w-full flex-1 items-end justify-center">
                    <div className="relative flex h-full w-full max-w-[42px] items-end justify-center">
                      <div
                        className={`w-full rounded-t-[16px] shadow-[0_10px_18px_rgba(79,70,229,0.12)] ${barColor}`}
                        style={{ height: barHeight }}
                        title={`${item.label}: ${item.count}`}
                      />
                    </div>
                  </div>
                  <div className="flex flex-col items-center gap-1 text-center">
                    <span className={`inline-flex h-6 w-6 items-center justify-center rounded-full text-[10px] font-semibold ${accent}`}>
                      {item.label.slice(0, 1).toUpperCase()}
                    </span>
                    <span className="max-w-[4.6rem] truncate text-[11px] font-medium text-gray-600 dark:text-gray-300">
                      {item.label}
                    </span>
                    <span className="text-[11px] font-semibold text-gray-900 dark:text-white">{item.count}</span>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="flex h-full w-full items-center justify-center text-sm text-gray-500 dark:text-gray-400">
              No city data available yet.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function AdminDashboard() {
  const [data, setData] = useState<AdminDashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<string | null>(null);

  const fetchDashboard = async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      setError("Please sign in again to load the admin dashboard.");
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const [usersRes, propertiesRes] = await Promise.all([
        fetch(`${API_URL}/users/all`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        fetch(`${API_URL}/properties`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);

      const usersJson = usersRes.ok ? await usersRes.json() : { users: [] };
      const propertiesJson = propertiesRes.ok ? await propertiesRes.json() : { properties: [] };

      if (!usersRes.ok) {
        throw new Error(usersJson.message || "Failed to load users");
      }
      if (!propertiesRes.ok) {
        throw new Error(propertiesJson.message || "Failed to load properties");
      }

      const usersList: UserRecord[] = Array.isArray(usersJson)
        ? usersJson
        : usersJson.users || usersJson.data || [];
      const propertiesList: PropertyRecord[] = Array.isArray(propertiesJson)
        ? propertiesJson
        : propertiesJson.properties || propertiesJson.data?.properties || propertiesJson.data || [];

      const now = new Date();
      const currentMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
      const previousMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      const currentMonthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 1);
      const previousMonthEnd = currentMonthStart;
      const thirtyDaysAgo = getStartOfDayDaysAgo(30);

      const userCreated = usersList.filter((user) => {
        const createdAt = user.createdAt ? new Date(user.createdAt) : null;
        return createdAt && !Number.isNaN(createdAt.getTime());
      });
      const propertyCreated = propertiesList.filter((property) => {
        const createdAt = property.createdAt ? new Date(property.createdAt) : null;
        return createdAt && !Number.isNaN(createdAt.getTime());
      });

      const currentMonthUsers = userCreated.filter((user) => {
        const createdAt = new Date(user.createdAt || "");
        return createdAt >= currentMonthStart && createdAt < currentMonthEnd;
      }).length;
      const currentMonthProperties = propertyCreated.filter((property) => {
        const createdAt = new Date(property.createdAt || "");
        return createdAt >= currentMonthStart && createdAt < currentMonthEnd;
      }).length;

      const activeUsers = usersList.filter((user) => user.isActive !== false).length;
      const inactiveUsers = Math.max(0, usersList.length - activeUsers);

      const propertyStatusCounts = countBy(propertiesList, (property) => splitStatus(property.status) || "available");
      const propertyTypeCounts = countBy(propertiesList, (property) => splitStatus(property.type) || "unknown");
      const cityCounts = countBy(propertiesList, (property) => property.city?.trim() || "Other");
      const roleCounts = countBy(usersList, (user) => String(user.role || "").toUpperCase() || "UNKNOWN");

      const prices = propertiesList
        .map((property) => Number(property.price))
        .filter((price) => Number.isFinite(price) && price > 0);
      const averagePrice = prices.length ? prices.reduce((sum, price) => sum + price, 0) / prices.length : 0;
      const medianPrice = getMedian(prices);

      const availableProperties = propertyStatusCounts.available || 0;
      const pendingProperties = propertyStatusCounts.pending || 0;
      const rentedProperties = propertyStatusCounts.rented || 0;
      const soldProperties = propertyStatusCounts.sold || 0;
      const liveListings = availableProperties + pendingProperties;
      const closedListings = rentedProperties + soldProperties;
      const activeRate = usersList.length > 0 ? (activeUsers / usersList.length) * 100 : 0;
      const inventorySellThrough = propertiesList.length > 0 ? (closedListings / propertiesList.length) * 100 : 0;
      const userGrowthRate = computeGrowthRate(currentMonthUsers, userCreated.filter((user) => {
        const createdAt = new Date(user.createdAt || "");
        return createdAt >= previousMonthStart && createdAt < previousMonthEnd;
      }).length);
      const listingGrowthRate = computeGrowthRate(currentMonthProperties, propertyCreated.filter((property) => {
        const createdAt = new Date(property.createdAt || "");
        return createdAt >= previousMonthStart && createdAt < previousMonthEnd;
      }).length);

      const roleBreakdown = Object.entries(roleCounts)
        .map(([key, count], index) => ({
          key,
          label: roleLabels[key] || key,
          count,
          tone: toneClasses[index % toneClasses.length],
        }))
        .sort((a, b) => b.count - a.count);

      const statusBreakdown = Object.entries(propertyStatusCounts)
        .map(([key, count], index) => ({
          key,
          label: statusLabels[key] || key,
          count,
          tone: toneClasses[index % toneClasses.length],
        }))
        .sort((a, b) => b.count - a.count);

      const typeBreakdown = Object.entries(propertyTypeCounts)
        .map(([key, count], index) => ({
          key,
          label: typeLabels[key] || key,
          count,
          tone: toneClasses[index % toneClasses.length],
        }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 5);

      const cityBreakdown = Object.entries(cityCounts)
        .map(([key, count]) => ({ key, label: key, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 5);

      const recentUsers = [...usersList]
        .filter((user) => user.createdAt)
        .sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime())
        .slice(0, 6);
      const recentProperties = [...propertiesList]
        .filter((property) => property.createdAt)
        .sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime())
        .slice(0, 6);

      setData({
        users: usersList,
        properties: propertiesList,
        totals: {
          users: usersList.length,
          activeUsers,
          inactiveUsers,
          properties: propertiesList.length,
          availableProperties,
          pendingProperties,
          rentedProperties,
          soldProperties,
          liveListings,
          newUsers30d: userCreated.filter((user) => {
            const createdAt = new Date(user.createdAt || "");
            return createdAt >= thirtyDaysAgo;
          }).length,
          newProperties30d: propertyCreated.filter((property) => {
            const createdAt = new Date(property.createdAt || "");
            return createdAt >= thirtyDaysAgo;
          }).length,
          averagePrice,
          medianPrice,
          activeRate,
          inventorySellThrough,
          userGrowthRate,
          listingGrowthRate,
        },
        roleBreakdown,
        statusBreakdown,
        typeBreakdown,
        cityBreakdown,
        recentUsers,
        recentProperties,
      });
      setLastUpdated(new Date().toLocaleString());
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to load dashboard";
      setError(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void fetchDashboard();
  }, []);

  const heroSummary = useMemo(() => {
    if (!data) return null;
    const totalClosed = data.totals.rentedProperties + data.totals.soldProperties;
    return [
      {
        label: "Live inventory",
        value: data.totals.liveListings,
        helper: `${data.totals.availableProperties} available · ${data.totals.pendingProperties} pending`,
        accent: "bg-indigo-100 dark:bg-indigo-900/30",
        icon: <BoxIconLine className="size-6 text-indigo-700 dark:text-indigo-300" />,
      },
      {
        label: "Closed listings",
        value: totalClosed,
        helper: `${data.totals.rentedProperties} rented · ${data.totals.soldProperties} sold`,
        accent: "bg-emerald-100 dark:bg-emerald-900/30",
        icon: <CheckCircleIcon className="size-6 text-emerald-700 dark:text-emerald-300" />,
      },
      {
        label: "User health",
        value: data.totals.activeUsers,
        helper: `${Math.round(data.totals.activeRate)}% active rate`,
        accent: "bg-cyan-100 dark:bg-cyan-900/30",
        icon: <GroupIcon className="size-6 text-cyan-700 dark:text-cyan-300" />,
      },
      {
        label: "New this month",
        value: data.totals.newProperties30d,
        helper: `${data.totals.newUsers30d} new users · ${data.totals.listingGrowthRate.toFixed(1)}% listings growth`,
        accent: "bg-amber-100 dark:bg-amber-900/30",
        icon: <ShootingStarIcon className="size-6 text-amber-700 dark:text-amber-300" />,
      },
    ];
  }, [data]);

  return (
    <>
      <PageMeta
        title="Admin Dashboard | Smart Property"
        description="Operational overview of users, inventory, and live platform activity."
      />

      <div className="space-y-6">
        <div className="overflow-hidden rounded-3xl border border-gray-200 bg-white shadow-sm dark:border-gray-800 dark:bg-gray-dark">
          <div className="relative px-6 py-6 sm:px-8 sm:py-7">
            <div className="absolute inset-0 bg-gradient-to-br from-indigo-50 via-white to-cyan-50 dark:from-indigo-950/30 dark:via-gray-950 dark:to-cyan-950/20" />
            <div className="relative flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
              <div className="max-w-3xl">
                <div className="inline-flex items-center gap-2 rounded-full border border-indigo-200 bg-white/80 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-indigo-700 backdrop-blur dark:border-indigo-500/20 dark:bg-gray-900/70 dark:text-indigo-300">
                  Admin overview
                </div>
                <h1 className="mt-4 text-3xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-4xl">
                  Platform control center
                </h1>
                <p className="mt-3 max-w-2xl text-sm leading-6 text-gray-600 dark:text-gray-300 sm:text-base">
                  Track inventory health, user growth, property flow, and the latest activity in one view. The dashboard is tuned for fast decisions, not just vanity counts.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <button
                  type="button"
                  onClick={fetchDashboard}
                  className="inline-flex h-11 items-center justify-center rounded-xl border border-gray-300 bg-white px-4 text-sm font-medium text-gray-700 shadow-sm transition hover:border-indigo-300 hover:text-indigo-700 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-200 dark:hover:border-indigo-500/40"
                >
                  Refresh data
                </button>
                <Link
                  to="/admin/properties"
                  className="inline-flex h-11 items-center justify-center rounded-xl bg-indigo-600 px-4 text-sm font-medium text-white shadow-sm transition hover:bg-indigo-700"
                >
                  Review inventory
                </Link>
                <Link
                  to="/admin/users"
                  className="inline-flex h-11 items-center justify-center rounded-xl border border-gray-300 bg-white px-4 text-sm font-medium text-gray-700 shadow-sm transition hover:border-gray-400 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-200"
                    
                >
                  Manage users
                </Link>
              </div>
            </div>
          </div>
        </div>
                  

        {error && (
          <div className="rounded-2xl border border-error-200 bg-error-50 px-4 py-3 text-sm text-error-700 dark:border-error-500/30 dark:bg-error-500/10 dark:text-error-400">
            {error}
          </div>
        )}
                  

        {loading || !data ? (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
            {Array.from({ length: 4 }).map((_, index) => (
              <div key={index} className="h-32 animate-pulse rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03]" />
            ))}
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
              {heroSummary?.map((card) => (
                <SectionStat
                  key={card.label}
                  label={card.label}
                  value={card.value.toLocaleString()}
                  helper={card.helper}
                  accent={card.accent}
                  icon={card.icon}
                />
              ))}
            </div>

            <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
              <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-gray-dark">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Inventory pulse</h2>
                    <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                      Current property status mix and the pressure points that matter most.
                    </p>
                  </div>
                  <div className="rounded-xl bg-indigo-50 px-3 py-2 text-center dark:bg-indigo-900/20">
                    <p className="text-xs text-indigo-600 dark:text-indigo-300">Avg price</p>
                    <p className="text-base font-semibold text-indigo-700 dark:text-indigo-200">
                      {formatCurrency(data.totals.averagePrice)}
                    </p>
                  </div>
                </div>

                <div className="mt-6 space-y-4">
                  {data.statusBreakdown.map((item) => (
                    <BreakdownBar
                      key={item.key}
                      label={item.label}
                      count={item.count}
                      total={data.totals.properties}
                      tone={item.key === "available"
                        ? "bg-emerald-500"
                        : item.key === "pending"
                          ? "bg-amber-500"
                          : item.key === "rented"
                            ? "bg-cyan-500"
                            : item.key === "sold"
                              ? "bg-rose-500"
                              : "bg-gray-500"}
                    />
                  ))}
                </div>

                <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-3">
                  <div className="rounded-2xl bg-gray-50 p-4 dark:bg-white/[0.03]">
                    <p className="text-sm text-gray-500 dark:text-gray-400">Median listing price</p>
                    <p className="mt-2 text-xl font-semibold text-gray-900 dark:text-white">
                      {formatCurrency(data.totals.medianPrice)}
                    </p>
                  </div>
                  <div className="rounded-2xl bg-gray-50 p-4 dark:bg-white/[0.03]">
                    <p className="text-sm text-gray-500 dark:text-gray-400">Sell-through</p>
                    <p className="mt-2 text-xl font-semibold text-gray-900 dark:text-white">
                      {data.totals.inventorySellThrough.toFixed(1)}%
                    </p>
                  </div>
                  <div className="rounded-2xl bg-gray-50 p-4 dark:bg-white/[0.03]">
                    <p className="text-sm text-gray-500 dark:text-gray-400">Live listings</p>
                    <p className="mt-2 text-xl font-semibold text-gray-900 dark:text-white">
                      {data.totals.liveListings}
                    </p>
                  </div>
                </div>
              </div>

              <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-gray-dark">
                <div>
                  <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Growth snapshot</h2>
                  <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                    Compare this month against the previous month.
                  </p>
                </div>

                <div className="mt-6 space-y-4">
                  <div className="rounded-2xl bg-gray-50 p-4 dark:bg-white/[0.03]">
                    <p className="text-sm text-gray-500 dark:text-gray-400">Users added this month</p>
                    <p className="mt-2 text-2xl font-bold text-gray-900 dark:text-white">{data.totals.newUsers30d}</p>
                    <p className={`mt-1 text-sm ${data.totals.userGrowthRate >= 0 ? "text-emerald-600 dark:text-emerald-400" : "text-rose-600 dark:text-rose-400"}`}>
                      {data.totals.userGrowthRate >= 0 ? "+" : ""}{data.totals.userGrowthRate.toFixed(1)}% vs last month
                    </p>
                  </div>
                  <div className="rounded-2xl bg-gray-50 p-4 dark:bg-white/[0.03]">
                    <p className="text-sm text-gray-500 dark:text-gray-400">Properties added this month</p>
                    <p className="mt-2 text-2xl font-bold text-gray-900 dark:text-white">{data.totals.newProperties30d}</p>
                    <p className={`mt-1 text-sm ${data.totals.listingGrowthRate >= 0 ? "text-emerald-600 dark:text-emerald-400" : "text-rose-600 dark:text-rose-400"}`}>
                      {data.totals.listingGrowthRate >= 0 ? "+" : ""}{data.totals.listingGrowthRate.toFixed(1)}% vs last month
                    </p>
                  </div>
                  <div className="rounded-2xl bg-gray-50 p-4 dark:bg-white/[0.03]">
                    <p className="text-sm text-gray-500 dark:text-gray-400">Active user rate</p>
                    <p className="mt-2 text-2xl font-bold text-gray-900 dark:text-white">{data.totals.activeRate.toFixed(1)}%</p>
                    <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                      {data.totals.activeUsers} active · {data.totals.inactiveUsers} inactive
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
              <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-gray-dark">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h2 className="text-lg font-semibold text-gray-900 dark:text-white">User mix</h2>
                    <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                      Role distribution across the whole platform.
                    </p>
                  </div>
                  <div className="rounded-xl bg-cyan-50 px-3 py-2 text-xs font-semibold text-cyan-700 dark:bg-cyan-900/20 dark:text-cyan-200">
                    {data.totals.users} total
                  </div>
                </div>
                <div className="mt-6 space-y-4">
                  {data.roleBreakdown.map((item) => (
                    <BreakdownBar
                      key={item.key}
                      label={item.label}
                      count={item.count}
                      total={data.totals.users}
                      tone={item.key === "ADMIN"
                        ? "bg-rose-500"
                        : item.key === "AGENCY"
                          ? "bg-indigo-500"
                          : item.key === "OWNER"
                            ? "bg-sky-500"
                            : item.key === "TENANT"
                              ? "bg-emerald-500"
                              : "bg-amber-500"}
                    />
                  ))}
                </div>
              </div>

              <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-gray-dark">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Property types</h2>
                    <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                      What kind of stock is actually in the catalog.
                    </p>
                  </div>
                  <div className="rounded-xl bg-amber-50 px-3 py-2 text-xs font-semibold text-amber-700 dark:bg-amber-900/20 dark:text-amber-200">
                    {data.totals.properties} total
                  </div>
                </div>
                <div className="mt-6 space-y-4">
                  {data.typeBreakdown.length > 0 ? (
                    data.typeBreakdown.map((item) => (
                      <BreakdownBar
                        key={item.key}
                        label={item.label}
                        count={item.count}
                        total={data.totals.properties}
                        tone={item.key === "apartment"
                          ? "bg-indigo-500"
                          : item.key === "villa"
                            ? "bg-emerald-500"
                            : item.key === "house"
                              ? "bg-cyan-500"
                              : item.key === "office"
                                ? "bg-amber-500"
                                : "bg-rose-500"}
                      />
                    ))
                  ) : (
                    <p className="rounded-2xl bg-gray-50 p-4 text-sm text-gray-500 dark:bg-white/[0.03] dark:text-gray-400">
                      No property type data available yet.
                    </p>
                  )}
                </div>
              </div>

              <CityChart items={data.cityBreakdown} />
            </div>

            <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
              <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-gray-dark">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Recent users</h2>
                    <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                      Latest sign-ups and account creations.
                    </p>
                  </div>
                  <Link
                    to="/admin/users"
                    className="text-sm font-medium text-indigo-600 hover:text-indigo-700 dark:text-indigo-300"
                  >
                    View all →
                  </Link>
                </div>
                <div className="mt-5 space-y-3">
                  {data.recentUsers.length > 0 ? (
                    data.recentUsers.map((user) => (
                      <div
                        key={user._id}
                        className="flex items-center justify-between gap-4 rounded-2xl bg-gray-50 px-4 py-3 transition hover:bg-gray-100 dark:bg-white/[0.03] dark:hover:bg-white/[0.05]"
                      >
                        <div className="flex min-w-0 items-center gap-3">
                          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500 to-cyan-500 text-sm font-semibold text-white">
                            {getInitials(user)}
                          </div>
                          <div className="min-w-0">
                            <p className="truncate font-medium text-gray-900 dark:text-white">{getFullName(user)}</p>
                            <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                              <span>{user.email}</span>
                              <span className="rounded-full bg-gray-200 px-2 py-0.5 text-[11px] font-medium text-gray-700 dark:bg-gray-800 dark:text-gray-200">
                                {roleLabels[user.role] || user.role}
                              </span>
                            </div>
                          </div>
                        </div>
                        <span className="shrink-0 text-xs text-gray-500 dark:text-gray-400">
                          {formatDate(user.createdAt)}
                        </span>
                      </div>
                    ))
                  ) : (
                    <p className="rounded-2xl bg-gray-50 p-4 text-sm text-gray-500 dark:bg-white/[0.03] dark:text-gray-400">
                      No users yet.
                    </p>
                  )}
                </div>
              </div>

              <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-gray-dark">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Recent properties</h2>
                    <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                      New listings added to the platform.
                    </p>
                  </div>
                  <Link
                    to="/admin/properties"
                    className="text-sm font-medium text-indigo-600 hover:text-indigo-700 dark:text-indigo-300"
                  >
                    View all →
                  </Link>
                </div>
                <div className="mt-5 space-y-3">
                  {data.recentProperties.length > 0 ? (
                    data.recentProperties.map((property) => {
                      const status = splitStatus(property.status);
                      const badgeTone =
                        status === "available"
                          ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300"
                          : status === "pending"
                            ? "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300"
                            : status === "rented"
                              ? "bg-cyan-100 text-cyan-700 dark:bg-cyan-900/30 dark:text-cyan-300"
                              : status === "sold"
                                ? "bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-300"
                                : "bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-300";

                      return (
                        <div
                          key={property._id}
                          className="rounded-2xl bg-gray-50 px-4 py-3 transition hover:bg-gray-100 dark:bg-white/[0.03] dark:hover:bg-white/[0.05]"
                        >
                          <div className="flex items-start justify-between gap-4">
                            <div className="min-w-0">
                              <p className="truncate font-medium text-gray-900 dark:text-white">
                                {property.address || "Untitled listing"}
                              </p>
                              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                                {[property.city, property.type].filter(Boolean).join(" • ") || "No location data"}
                              </p>
                              <p className="mt-1 text-xs text-gray-400 dark:text-gray-500">
                                Created {formatDate(property.createdAt)}
                              </p>
                            </div>
                            <div className="text-right">
                              <p className="font-semibold text-gray-900 dark:text-white">
                                {Number.isFinite(Number(property.price)) ? formatCurrency(Number(property.price)) : "N/A"}
                              </p>
                              <span className={`mt-2 inline-flex rounded-full px-2 py-0.5 text-[11px] font-semibold ${badgeTone}`}>
                                {statusLabels[status] || status || "Unknown"}
                              </span>
                            </div>
                          </div>
                        </div>
                      );
                    })
                  ) : (
                    <p className="rounded-2xl bg-gray-50 p-4 text-sm text-gray-500 dark:bg-white/[0.03] dark:text-gray-400">
                      No properties yet.
                    </p>
                  )}
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-gray-dark">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Operational shortcuts</h2>
                  <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                    Direct links to the screens you’ll use most.
                  </p>
                </div>
                {lastUpdated && (
                  <p className="text-xs text-gray-500 dark:text-gray-400">Updated {lastUpdated}</p>
                )}
              </div>

              <div className="mt-5 grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
                <Link
                  to="/admin/users"
                  className="group rounded-2xl border border-gray-200 bg-gradient-to-br from-white to-indigo-50 p-4 transition hover:border-indigo-300 hover:shadow-md dark:border-gray-800 dark:from-gray-dark dark:to-indigo-950/20"
                >
                  <p className="text-xs font-semibold uppercase tracking-[0.16em] text-indigo-600 dark:text-indigo-300">Users</p>
                  <p className="mt-2 text-base font-semibold text-gray-900 dark:text-white">Review accounts</p>
                  <div className="mt-3 inline-flex items-center gap-2 text-sm font-medium text-indigo-700 dark:text-indigo-300">
                    <UserIcon className="size-4" />
                    <span>Permissions, roles, and activity</span>
                  </div>
                </Link>
                <Link
                  to="/admin/properties"
                  className="group rounded-2xl border border-gray-200 bg-gradient-to-br from-white to-emerald-50 p-4 transition hover:border-emerald-300 hover:shadow-md dark:border-gray-800 dark:from-gray-dark dark:to-emerald-950/20"
                >
                  <p className="text-xs font-semibold uppercase tracking-[0.16em] text-emerald-600 dark:text-emerald-300">Properties</p>
                  <p className="mt-2 text-base font-semibold text-gray-900 dark:text-white">Inspect listings</p>
                  <div className="mt-3 inline-flex items-center gap-2 text-sm font-medium text-emerald-700 dark:text-emerald-300">
                    <BoxIconLine className="size-4" />
                    <span>Status, price, and inventory mix</span>
                  </div>
                </Link>
                <Link
                  to="/admin/rentals"
                  className="group rounded-2xl border border-gray-200 bg-gradient-to-br from-white to-cyan-50 p-4 transition hover:border-cyan-300 hover:shadow-md dark:border-gray-800 dark:from-gray-dark dark:to-cyan-950/20"
                >
                  <p className="text-xs font-semibold uppercase tracking-[0.16em] text-cyan-600 dark:text-cyan-300">Rentals</p>
                  <p className="mt-2 text-base font-semibold text-gray-900 dark:text-white">Track rental flow</p>
                  <div className="mt-3 inline-flex items-center gap-2 text-sm font-medium text-cyan-700 dark:text-cyan-300">
                    <PieChartIcon className="size-4" />
                    <span>Bookings, leases, and occupancy</span>
                  </div>
                </Link>
                <Link
                  to="/admin/notifications"
                  className="group rounded-2xl border border-gray-200 bg-gradient-to-br from-white to-amber-50 p-4 transition hover:border-amber-300 hover:shadow-md dark:border-gray-800 dark:from-gray-dark dark:to-amber-950/20"
                >
                  <p className="text-xs font-semibold uppercase tracking-[0.16em] text-amber-600 dark:text-amber-300">Notifications</p>
                  <p className="mt-2 text-base font-semibold text-gray-900 dark:text-white">Check alerts</p>
                  <div className="mt-3 inline-flex items-center gap-2 text-sm font-medium text-amber-700 dark:text-amber-300">
                    <DollarLineIcon className="size-4" />
                    <span>Operational messages and reminders</span>
                  </div>
                </Link>
              </div>
            </div>
          </>
        )}
      </div>
    </>
  );
}
