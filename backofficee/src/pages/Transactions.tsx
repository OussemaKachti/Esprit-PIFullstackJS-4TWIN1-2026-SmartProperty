import { useCallback, useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import PageMeta from "../components/common/PageMeta";
import Button from "../components/ui/button/Button";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

const statusColor: Record<string, { bg: string; text: string }> = {
  PENDING: { bg: "bg-amber-100", text: "text-amber-800" },
  CONFIRMED: { bg: "bg-emerald-100", text: "text-emerald-800" },
  COMPLETED: { bg: "bg-emerald-100", text: "text-emerald-800" },
  CANCELLED: { bg: "bg-rose-100", text: "text-rose-800" },
};

const typeColor: Record<string, { bg: string; text: string }> = {
  SALE: { bg: "bg-blue-100", text: "text-blue-800" },
  RENT: { bg: "bg-purple-100", text: "text-purple-800" },
};

const Pill = ({ label, className }: { label: string; className: string }) => (
  <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${className}`}>
    {label}
  </span>
);

const EmptyState = () => (
  <div className="flex flex-col items-center justify-center gap-2 rounded-2xl border border-dashed border-gray-300 bg-white px-6 py-10 text-center dark:border-gray-800 dark:bg-gray-900">
    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-brand-50 text-brand-600 dark:bg-brand-500/15">🗂️</div>
    <p className="text-base font-semibold text-gray-900 dark:text-white">No transactions yet</p>
    <p className="text-sm text-gray-500 dark:text-gray-400 max-w-sm">When a sale or rental request is created, it will show up here with its full status history.</p>
  </div>
);

const formatDate = (value?: string | Date | null) => {
  if (!value) return "-";
  return new Date(value).toLocaleDateString();
};

const formatAmount = (value?: number | null, currency = "TND") => {
  if (value === null || value === undefined) return "-";
  return `${Number(value).toLocaleString()} ${currency}`;
};

const formatName = (user?: User) => {
  if (!user) return "";
  const full = `${user.firstName || ""} ${user.lastName || ""}`.trim();
  return full || user._id || user.id || "";
};

const extractId = (value: any): string | undefined => {
  if (!value) return undefined;
  if (typeof value === "string") return value;
  return value._id || value.id;
};

type User = {
  _id: string;
  id?: string;
  role: string;
  firstName?: string;
  lastName?: string;
};

type TimelineEntry = {
  status: string;
  actorId: string;
  note?: string;
  at: string;
};

type Transaction = {
  _id: string;
  type: "SALE" | "RENT";
  status: "PENDING" | "CONFIRMED" | "COMPLETED" | "CANCELLED";
  amount: number;
  currency?: string;
  startDate?: string;
  endDate?: string;
  propertyId: {
    _id: string;
    title?: string;
    reference?: string;
    city?: string;
    status?: string;
    listingType?: string;
    createdBy?: string | { _id?: string; id?: string };
  };
  ownerId?: User;
  partyId: User;
  timeline?: TimelineEntry[];
  createdAt?: string;
};

type StatusTarget = "PENDING" | "CONFIRMED" | "COMPLETED" | "CANCELLED";

const STATUS_OPTIONS: Array<{ value: Transaction["status"]; label: string }> = [
  { value: "PENDING", label: "Pending" },
  { value: "CONFIRMED", label: "Confirmed" },
  { value: "COMPLETED", label: "Completed" },
  { value: "CANCELLED", label: "Cancelled" },
];

type FilterType = "ALL" | "SALE" | "RENT";

type FilterStatus = "ALL" | "PENDING" | "CONFIRMED" | "COMPLETED" | "CANCELLED";

export default function Transactions() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(false);
  const [filterType, setFilterType] = useState<FilterType>("ALL");
  const [filterStatus, setFilterStatus] = useState<FilterStatus>("ALL");
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  useEffect(() => {
    const userRaw = localStorage.getItem("user");
    if (userRaw) {
      try {
        setCurrentUser(JSON.parse(userRaw));
      } catch (err) {
        console.error("Unable to parse user", err);
      }
    }
  }, []);

  const fetchTransactions = async () => {
    setLoading(true);
    const token = localStorage.getItem("token");
    if (!token) {
      toast.error("Please sign in again.");
      setLoading(false);
      return;
    }

    const params = new URLSearchParams();
    if (filterType !== "ALL") params.append("type", filterType);
    if (filterStatus !== "ALL") params.append("status", filterStatus);

    try {
      const response = await fetch(`${API_URL}/transactions?${params.toString()}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const payload = await response.json();
      if (!response.ok) {
        throw new Error(payload.message || "Unable to load transactions");
      }

      setTransactions(payload.data || []);
    } catch (error: any) {
      console.error(error);
      toast.error(error.message || "Unable to load transactions");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTransactions();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filterType, filterStatus]);

  const canConfirm = useCallback(
    (txn: Transaction) => {
      if (!currentUser) return false;
      const createdById = extractId(txn.propertyId?.createdBy);
      const ownerId = extractId(txn.ownerId);
      const currentUserId = extractId(currentUser);
      const admin = ["ADMIN", "AGENCY"].includes((currentUser.role || "").toUpperCase());

      const isOwner = !!currentUserId && (ownerId === currentUserId || createdById === currentUserId);
      return admin || isOwner;
    },
    [currentUser]
  );

  const canCancel = useCallback(
    (txn: Transaction) => {
      if (!currentUser) return false;
      const createdById = extractId(txn.propertyId?.createdBy);
      const ownerId = extractId(txn.ownerId);
      const partyId = extractId(txn.partyId);
      const currentUserId = extractId(currentUser);
      const admin = ["ADMIN", "AGENCY"].includes((currentUser.role || "").toUpperCase());

      const isOwner = !!currentUserId && (ownerId === currentUserId || createdById === currentUserId);
      const isParty = !!currentUserId && partyId === currentUserId;
      return admin || isOwner || isParty;
    },
    [currentUser]
  );

  const updateStatus = async (txn: Transaction, status: StatusTarget) => {
    const token = localStorage.getItem("token");
    if (!token) {
      toast.error("Please sign in again.");
      return;
    }

    try {
      const response = await fetch(`${API_URL}/transactions/${txn._id}/status`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status }),
      });

      const payload = await response.json();
      if (!response.ok) {
        throw new Error(payload.message || "Unable to update status");
      }

      const updated: Transaction = payload.data.transaction;
      setTransactions((prev) => prev.map((t) => (t._id === txn._id ? updated : t)));
      toast.success(`Status set to ${status}`);
    } catch (error: any) {
      console.error(error);
      toast.error(error.message || "Unable to update status");
    }
  };

  const filteredTransactions = useMemo(() => transactions, [transactions]);

  const canUpdateStatus = useCallback(
    (txn: Transaction) => {
      if (!currentUser) return false;
      const createdById = extractId(txn.propertyId?.createdBy);
      const ownerId = extractId(txn.ownerId);
      const currentUserId = extractId(currentUser);
      const admin = ["ADMIN", "AGENCY"].includes((currentUser.role || "").toUpperCase());

      const isOwner = !!currentUserId && (ownerId === currentUserId || createdById === currentUserId);
      return admin || isOwner;
    },
    [currentUser]
  );

  return (
    <div className="space-y-6">
      <PageMeta title="Transactions" description="Sales and rentals history" />

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">Transactions</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Review sales and rental requests with full status history.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={fetchTransactions} disabled={loading}>
            Refresh
          </Button>
        </div>
      </div>

      <div className="flex flex-wrap gap-3">
        {["ALL", "SALE", "RENT"].map((item) => (
          <button
            key={item}
            onClick={() => setFilterType(item as FilterType)}
            className={`px-3 py-2 rounded-lg text-sm border transition-colors ${
              filterType === item
                ? "border-brand-500 text-brand-600 bg-brand-50"
                : "border-gray-200 text-gray-600 hover:border-brand-200"
            }`}
          >
            {item === "ALL" ? "All types" : item === "SALE" ? "Sales" : "Rentals"}
          </button>
        ))}
        {["ALL", "PENDING", "CONFIRMED", "COMPLETED", "CANCELLED"].map((item) => (
          <button
            key={item}
            onClick={() => setFilterStatus(item as FilterStatus)}
            className={`px-3 py-2 rounded-lg text-sm border transition-colors ${
              filterStatus === item
                ? "border-brand-500 text-brand-600 bg-brand-50"
                : "border-gray-200 text-gray-600 hover:border-brand-200"
            }`}
          >
            {item === "ALL" ? "All statuses" : item}
          </button>
        ))}
      </div>

      <div className="grid gap-4">
        {loading && <div className="text-sm text-gray-500">Loading...</div>}
        {!loading && filteredTransactions.length === 0 && <EmptyState />}
        {filteredTransactions.map((txn) => {
          const statusCfg = statusColor[txn.status] || { bg: "bg-gray-100", text: "text-gray-800" };
          const typeCfg = typeColor[txn.type] || { bg: "bg-gray-100", text: "text-gray-800" };

          const latestTimeline = txn.timeline && txn.timeline.length > 0 ? txn.timeline[txn.timeline.length - 1] : null;

          return (
            <div
              key={txn._id}
              className="p-5 border border-gray-200 rounded-2xl dark:border-gray-800 bg-white dark:bg-gray-900 shadow-sm"
            >
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-3">
                  <Pill label={txn.type} className={`${typeCfg.bg} ${typeCfg.text}`} />
                  <Pill label={txn.status} className={`${statusCfg.bg} ${statusCfg.text}`} />
                  <span className="text-sm font-medium text-gray-900 dark:text-white">
                    {txn.propertyId?.title || txn.propertyId?.reference || "Property"}
                  </span>
                  {txn.propertyId?.city && (
                    <span className="text-xs text-gray-500">{txn.propertyId.city}</span>
                  )}
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
                  <span>{formatAmount(txn.amount, txn.currency)}</span>
                  {txn.type === "RENT" && (
                    <span>
                      · {formatDate(txn.startDate)} → {formatDate(txn.endDate)}
                    </span>
                  )}
                </div>
              </div>

              <div className="mt-3 grid gap-2 text-sm text-gray-600 dark:text-gray-300 sm:grid-cols-2">
                <div>
                  <p className="text-gray-500">Owner</p>
                  <p className="font-medium text-gray-900 dark:text-white">
                    {formatName(txn.ownerId) || "Owner"}
                  </p>
                </div>
                <div>
                  <p className="text-gray-500">Buyer / Tenant</p>
                  <p className="font-medium text-gray-900 dark:text-white">
                    {formatName(txn.partyId) || "User"}
                  </p>
                </div>
              </div>

              <div className="mt-3 flex flex-wrap gap-3 text-xs text-gray-500">
                <span className="inline-flex items-center gap-1 rounded-full bg-gray-100 px-2.5 py-1 dark:bg-white/5">
                  <span className="text-gray-600 dark:text-gray-300">Created</span>
                  <span className="font-medium text-gray-800 dark:text-white">{formatDate(txn.createdAt)}</span>
                </span>
                {latestTimeline && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-gray-100 px-2.5 py-1 dark:bg-white/5">
                    <span className="text-gray-600 dark:text-gray-300">Updated</span>
                    <span className="font-medium text-gray-800 dark:text-white">{formatDate(latestTimeline.at)}</span>
                  </span>
                )}
              </div>

              {txn.timeline && txn.timeline.length > 0 && (
                <div className="mt-3 border border-gray-100 dark:border-gray-800 rounded-xl p-3 bg-gray-50 dark:bg-gray-800/50">
                  <p className="text-xs font-semibold text-gray-700 dark:text-gray-200 mb-2">History</p>
                  <div className="space-y-2">
                    {txn.timeline
                      .slice(Math.max(txn.timeline.length - 4, 0))
                      .reverse()
                      .map((entry, idx) => (
                        <div
                          key={`${entry.at}-${idx}`}
                          className="flex flex-wrap items-start gap-2 text-xs text-gray-600 dark:text-gray-300"
                        >
                          <Pill label={entry.status} className="bg-white text-gray-800 dark:bg-gray-900/80 dark:text-white" />
                          <span className="text-gray-500">{formatDate(entry.at)}</span>
                          {entry.note && <span className="text-gray-500">— {entry.note}</span>}
                        </div>
                      ))}
                  </div>
                </div>
              )}

              <div className="mt-3 flex flex-wrap gap-3 items-center">
                <div className="flex items-center gap-2">
                  <span className="text-xs text-gray-500">Set status</span>
                  <select
                    className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-700 shadow-sm focus:border-brand-400 focus:outline-none dark:border-gray-700 dark:bg-gray-900 dark:text-white"
                    value={txn.status}
                    disabled={!canUpdateStatus(txn)}
                    onChange={(e) => {
                      const next = e.target.value as Transaction["status"];
                      if (next !== txn.status) {
                        updateStatus(txn, next as StatusTarget);
                      }
                    }}
                  >
                    {STATUS_OPTIONS.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                </div>

                {txn.status === "PENDING" && canCancel(txn) && (
                  <Button size="sm" variant="outline" onClick={() => updateStatus(txn, "CANCELLED")}>
                    Cancel
                  </Button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
