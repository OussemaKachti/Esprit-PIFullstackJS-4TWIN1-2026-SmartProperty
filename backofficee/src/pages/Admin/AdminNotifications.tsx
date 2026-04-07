import { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import PageMeta from "../../components/common/PageMeta";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

type NotificationItem = {
  id: string;
  type: string;
  isRead?: boolean;
  propertyId?: string;
  propertyTitle?: string;
  propertyCity?: string;
  propertyStatus?: string;
  recipientName?: string;
  recipientRole?: string;
  authorName?: string;
  authorEmail?: string | null;
  message?: string;
  createdAt?: string;
};

const typeLabel: Record<string, string> = {
  ENQUIRY: "Enquiry",
  RENT_REQUEST: "Rent request",
  LEASE_CREATED: "Lease created",
  SALE_CREATED: "Sale created",
};

const typeTone: Record<string, string> = {
  ENQUIRY: "bg-sky-100 text-sky-700 dark:bg-sky-900/30 dark:text-sky-300",
  RENT_REQUEST: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300",
  LEASE_CREATED: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300",
  SALE_CREATED: "bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300",
};

export default function AdminNotifications() {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [unreadCount, setUnreadCount] = useState(0);
  const [lastSync, setLastSync] = useState<Date | null>(null);
  const [filter, setFilter] = useState<"all" | "unread" | "read">("all");

  const filteredNotifications = useMemo(() => {
    if (filter === "unread") return notifications.filter((item) => !item.isRead);
    if (filter === "read") return notifications.filter((item) => item.isRead);
    return notifications;
  }, [filter, notifications]);

  const stats = useMemo(() => {
    const total = totalCount || notifications.length;
    const unread = unreadCount || notifications.filter((item) => !item.isRead).length;
    const enquiry = notifications.filter((item) => item.type === "ENQUIRY").length;
    const rent = notifications.filter((item) => item.type === "RENT_REQUEST").length;
    return { total, unread, enquiry, rent };
  }, [notifications, totalCount, unreadCount]);

  useEffect(() => {
    loadNotifications();
  }, [page]);

  const loadNotifications = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_URL}/notifications/admin?page=${page}&limit=20`, {
        headers: {
          Authorization: token ? `Bearer ${token}` : "",
          "Content-Type": "application/json",
        },
      });
      if (!res.ok) throw new Error("Failed to fetch admin notifications");
      const data = await res.json();
      const payload = data?.data || data;
      setNotifications(Array.isArray(payload?.notifications) ? payload.notifications : []);
      setTotalCount(Number(payload?.total || 0));
      setUnreadCount(Number(payload?.unread || 0));
      setTotalPages(Math.max(1, Number(payload?.totalPages || 1)));
      setLastSync(new Date());
    } catch (error) {
      console.error(error);
      toast.error("Unable to load platform notifications");
      setNotifications([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const refresh = () => {
    setRefreshing(true);
    loadNotifications();
  };

  const formatDate = (value?: string) => {
    if (!value) return "—";
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return "—";
    return date.toLocaleString("fr-TN", {
      day: "2-digit",
      month: "short",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <>
      <PageMeta
        title="Admin · Notifications"
        description="Monitor platform notifications and property activity"
      />

      <div className="space-y-6">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Notifications</h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1 max-w-2xl">
              Platform activity, enquiries, rent requests, and transaction updates are tracked here for the admin team.
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
              {lastSync ? `Last sync: ${lastSync.toLocaleString()}` : "Not synced yet"}
            </p>
          </div>
          <button
            onClick={refresh}
            disabled={loading || refreshing}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 text-white font-semibold hover:bg-indigo-700 disabled:opacity-70 transition-colors shadow-sm"
          >
            {refreshing ? "Refreshing..." : "Refresh"}
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
          <StatCard title="Total notifications" value={stats.total} helper={`Page ${page} of ${totalPages}`} accent="indigo" />
          <StatCard title="Unread" value={stats.unread} helper="Needs attention" accent="rose" />
          <StatCard title="Enquiries" value={stats.enquiry} helper="Buyer / tenant requests" accent="sky" />
          <StatCard title="Rent requests" value={stats.rent} helper="Rental workflow" accent="amber" />
        </div>

        <div className="bg-white dark:bg-gray-dark rounded-2xl border border-gray-200 dark:border-gray-800 p-4 sm:p-6">
          <div className="flex flex-wrap items-center gap-2 mb-4">
            {[
              { key: "all", label: "All" },
              { key: "unread", label: "Unread" },
              { key: "read", label: "Read" },
            ].map((item) => (
              <button
                key={item.key}
                type="button"
                onClick={() => setFilter(item.key as typeof filter)}
                className={`px-4 py-2 rounded-full text-sm font-semibold transition-colors ${
                  filter === item.key
                    ? "bg-gray-900 text-white dark:bg-white dark:text-gray-900"
                    : "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300"
                }`}
              >
                {item.label}
              </button>
            ))}
            <div className="ml-auto text-sm text-gray-500 dark:text-gray-400">
              Showing <span className="font-semibold text-gray-900 dark:text-white">{filteredNotifications.length}</span> items
            </div>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-16">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600" />
            </div>
          ) : filteredNotifications.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/40 p-10 text-center">
              <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-indigo-100 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-300">
                <svg className="h-7 w-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C8.067 6.234 7 7.943 7 10v4.159c0 .538-.214 1.055-.595 1.436L5 17h5m5 0v1a3 3 0 11-6 0v-1m6 0H9" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">No notifications yet</h3>
              <p className="mt-2 text-sm text-gray-600 dark:text-gray-400 max-w-xl mx-auto">
                New enquiries, rent requests, leases, and sale events will appear here automatically once users start interacting with listings.
              </p>
            </div>
          ) : (
            <div className="overflow-hidden rounded-2xl border border-gray-200 dark:border-gray-800">
              <table className="w-full table-fixed">
                <thead className="bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
                  <tr>
                    <th className="px-3 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider w-28">Type</th>
                    <th className="px-3 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">Activity</th>
                    <th className="px-3 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider w-40">Recipient</th>
                    <th className="px-3 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider w-28">Status</th>
                    <th className="px-3 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider w-32">Time</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700 bg-white dark:bg-gray-dark">
                  {filteredNotifications.map((item) => (
                    <tr key={item.id} className={`${item.isRead ? "" : "bg-indigo-50/40 dark:bg-indigo-950/20"} hover:bg-gray-50 dark:hover:bg-gray-800/40 transition-colors align-top`}>
                      <td className="px-3 py-4">
                        <span className={`inline-flex px-3 py-1 rounded-full text-xs font-semibold ${typeTone[item.type] || "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300"}`}>
                          {typeLabel[item.type] || item.type}
                        </span>
                      </td>
                      <td className="px-3 py-4">
                        <div className="space-y-1">
                          <p className="font-medium text-gray-900 dark:text-white">{item.propertyTitle || "Property activity"}</p>
                          <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">{item.message || "No message provided."}</p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            From {item.authorName || "Unknown"}{item.authorEmail ? ` • ${item.authorEmail}` : ""}
                          </p>
                        </div>
                      </td>
                      <td className="px-3 py-4 text-sm text-gray-700 dark:text-gray-200">
                        <div className="space-y-1">
                          <p className="font-medium text-gray-900 dark:text-white">{item.recipientName || "Admin inbox"}</p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">{item.recipientRole || "ADMIN"}</p>
                        </div>
                      </td>
                      <td className="px-3 py-4">
                        <span className={`inline-flex px-3 py-1 rounded-full text-xs font-semibold ${item.isRead ? "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300" : "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300"}`}>
                          {item.isRead ? "Read" : "New"}
                        </span>
                        {item.propertyCity ? (
                          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{item.propertyCity}</p>
                        ) : null}
                      </td>
                      <td className="px-3 py-4 text-sm text-gray-700 dark:text-gray-200">{formatDate(item.createdAt)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <div className="flex items-center justify-between gap-3 flex-wrap">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Page <span className="font-semibold text-gray-900 dark:text-white">{page}</span> of <span className="font-semibold text-gray-900 dark:text-white">{totalPages}</span>
          </p>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setPage((prev) => Math.max(1, prev - 1))}
              disabled={page <= 1 || loading}
              className="px-4 py-2 text-sm font-medium rounded-lg border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-200 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-gray-800"
            >
              Previous
            </button>
            <button
              type="button"
              onClick={() => setPage((prev) => Math.min(totalPages, prev + 1))}
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

function StatCard({ title, value, helper, accent }: { title: string; value: number | string; helper: string; accent: "indigo" | "rose" | "sky" | "amber" }) {
  const accentClass: Record<typeof accent, string> = {
    indigo: "from-indigo-500 to-indigo-600",
    rose: "from-rose-500 to-rose-600",
    sky: "from-sky-500 to-sky-600",
    amber: "from-amber-500 to-amber-600",
  };

  return (
    <div className="relative overflow-hidden bg-white dark:bg-gray-dark rounded-2xl border border-gray-200 dark:border-gray-800 p-5 hover:shadow-sm transition-shadow">
      <div className={`absolute inset-x-0 top-0 h-1 bg-gradient-to-r ${accentClass[accent]}`} />
      <p className="text-sm font-medium text-gray-600 dark:text-gray-400">{title}</p>
      <p className="text-3xl font-bold text-gray-900 dark:text-white mt-2 tracking-tight">{value}</p>
      <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">{helper}</p>
    </div>
  );
}
