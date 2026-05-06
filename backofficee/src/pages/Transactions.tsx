import { useCallback, useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import PageMeta from "../components/common/PageMeta";
import Button from "../components/ui/button/Button";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";
const MARKETPLACE_URL = (import.meta.env.VITE_FRONTEND_URL || "http://localhost:3000").replace(
  /\/$/,
  ""
);

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
  <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${className}`}>
    {label}
  </span>
);

const EmptyState = ({ participant }: { participant?: boolean }) => (
  <div className="flex flex-col items-center justify-center gap-2 rounded-2xl border border-dashed border-gray-300 bg-white px-6 py-10 text-center dark:border-gray-800 dark:bg-gray-900">
    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-brand-50 text-brand-600 dark:bg-brand-500/15">
      🗂️
    </div>
    <p className="text-base font-semibold text-gray-900 dark:text-white">No activity yet</p>
    <p className="max-w-sm text-sm text-gray-500 dark:text-gray-400">
      {participant
        ? "Your offers and bookings appear under My offers. Open the marketplace to submit a request."
        : "When a sale or rental request is created, it will show up here with its full status history."}
    </p>
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

const WORKFLOW_STEPS: Array<{
  value: StatusTarget;
  title: string;
  hint: string;
  currentClass: string;
  idleClass: string;
}> = [
  {
    value: "PENDING",
    title: "Pending",
    hint: "Awaiting your review",
    currentClass:
      "border-amber-400 bg-amber-50 ring-2 ring-amber-400/40 dark:border-amber-500/60 dark:bg-amber-500/10 dark:ring-amber-500/30",
    idleClass:
      "border-gray-200 bg-white hover:border-amber-200 hover:bg-amber-50/50 dark:border-gray-700 dark:bg-gray-900 dark:hover:border-amber-500/40",
  },
  {
    value: "CONFIRMED",
    title: "Confirmed",
    hint: "Accepted — tenant / next steps",
    currentClass:
      "border-sky-400 bg-sky-50 ring-2 ring-sky-400/40 dark:border-sky-500/60 dark:bg-sky-500/10 dark:ring-sky-500/30",
    idleClass:
      "border-gray-200 bg-white hover:border-sky-200 hover:bg-sky-50/50 dark:border-gray-700 dark:bg-gray-900 dark:hover:border-sky-500/40",
  },
  {
    value: "COMPLETED",
    title: "Completed",
    hint: "Sale closed or rental finalized",
    currentClass:
      "border-emerald-400 bg-emerald-50 ring-2 ring-emerald-400/40 dark:border-emerald-500/60 dark:bg-emerald-500/10 dark:ring-emerald-500/30",
    idleClass:
      "border-gray-200 bg-white hover:border-emerald-200 hover:bg-emerald-50/50 dark:border-gray-700 dark:bg-gray-900 dark:hover:border-emerald-500/40",
  },
  {
    value: "CANCELLED",
    title: "Cancelled",
    hint: "Decline or withdraw",
    currentClass:
      "border-rose-400 bg-rose-50 ring-2 ring-rose-400/40 dark:border-rose-500/60 dark:bg-rose-500/10 dark:ring-rose-500/30",
    idleClass:
      "border-gray-200 bg-white hover:border-rose-200 hover:bg-rose-50/50 dark:border-gray-700 dark:bg-gray-900 dark:hover:border-rose-500/40",
  },
];

type FilterType = "ALL" | "SALE" | "RENT";
type FilterStatus = "ALL" | "PENDING" | "CONFIRMED" | "COMPLETED" | "CANCELLED";

function listingUrl(txn: Transaction) {
  const id = txn.propertyId?._id;
  if (!id) return MARKETPLACE_URL;
  return txn.type === "RENT"
    ? `${MARKETPLACE_URL}/rent-details/${id}`
    : `${MARKETPLACE_URL}/buy-details/${id}`;
}

export default function Transactions() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(false);
  const [filterType, setFilterType] = useState<FilterType>("ALL");
  const [filterStatus, setFilterStatus] = useState<FilterStatus>("ALL");
  const [adminSearch, setAdminSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [statusBusyId, setStatusBusyId] = useState<string | null>(null);
  const [expandedTransactionId, setExpandedTransactionId] = useState<string | null>(null);

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

  const userRoleUpper = (currentUser?.role || "").toUpperCase();
  const isParticipantView = userRoleUpper === "BUYER" || userRoleUpper === "TENANT";

  const participantTransactions = useMemo(() => {
    if (!isParticipantView || !currentUser) return transactions;
    const uid = extractId(currentUser);
    if (!uid) return [];
    return transactions.filter((t) => extractId(t.partyId) === uid);
  }, [transactions, currentUser, isParticipantView]);

  const displayList = isParticipantView ? participantTransactions : transactions;

  const adminDisplayList = useMemo(() => {
    if (isParticipantView) return displayList;
    const q = adminSearch.trim().toLowerCase();
    if (!q) return displayList;

    return displayList.filter((txn) => {
      const propertyLabel = `${txn.propertyId?.title || ""} ${txn.propertyId?.reference || ""} ${txn.propertyId?.city || ""}`.toLowerCase();
      const ownerLabel = formatName(txn.ownerId).toLowerCase();
      const partyLabel = formatName(txn.partyId).toLowerCase();
      return propertyLabel.includes(q) || ownerLabel.includes(q) || partyLabel.includes(q);
    });
  }, [adminSearch, displayList, isParticipantView]);

  const adminStats = useMemo(() => {
    const total = adminDisplayList.length;
    const pending = adminDisplayList.filter((t) => t.status === "PENDING").length;
    const confirmed = adminDisplayList.filter((t) => t.status === "CONFIRMED").length;
    const completed = adminDisplayList.filter((t) => t.status === "COMPLETED").length;
    const cancelled = adminDisplayList.filter((t) => t.status === "CANCELLED").length;
    const volume = adminDisplayList.reduce((acc, txn) => acc + Number(txn.amount || 0), 0);
    return { total, pending, confirmed, completed, cancelled, volume };
  }, [adminDisplayList]);

  const totalItems = isParticipantView ? displayList.length : adminDisplayList.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / itemsPerPage));
  const paginatedAdminList = useMemo(
    () => adminDisplayList.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage),
    [adminDisplayList, currentPage, itemsPerPage]
  );
  const paginatedParticipantList = useMemo(
    () => displayList.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage),
    [displayList, currentPage, itemsPerPage]
  );
  const visibleTransactions = isParticipantView ? paginatedParticipantList : paginatedAdminList;

  useEffect(() => {
    setCurrentPage(1);
  }, [filterType, filterStatus, adminSearch, isParticipantView]);

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

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
        headers: { Authorization: `Bearer ${token}` },
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
    if (status === txn.status) return;
    const token = localStorage.getItem("token");
    if (!token) {
      toast.error("Please sign in again.");
      return;
    }

    setStatusBusyId(txn._id);
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
      toast.success(`Updated to ${status}`);
    } catch (error: any) {
      console.error(error);
      toast.error(error.message || "Unable to update status");
    } finally {
      setStatusBusyId(null);
    }
  };

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

  const filterBtn = (active: boolean) =>
    `rounded-xl px-3 py-2 text-sm font-medium border transition-colors ${
      active
        ? "border-brand-500 bg-brand-50 text-brand-700 dark:border-brand-400 dark:bg-brand-500/15 dark:text-brand-300"
        : "border-gray-200 text-gray-600 hover:border-brand-200 dark:border-gray-700 dark:text-gray-400 dark:hover:border-brand-500/40"
    }`;

  return (
    <div className="space-y-6">
      <PageMeta
        title={isParticipantView ? "My requests | Smart Property" : "Transactions | Smart Property"}
        description={
          isParticipantView
            ? "Your purchase offers and rental activity"
            : "Sales and rental requests for your portfolio"
        }
      />

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">
            {isParticipantView ? "My requests" : "Transactions"}
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {isParticipantView
              ? "Track requests where you are the buyer or tenant. Use My offers for the full list and payment."
              : "Review each deal and move it through the workflow with the actions below."}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Button variant="outline" size="sm" onClick={fetchTransactions} disabled={loading}>
            Refresh
          </Button>
        </div>
      </div>

      {isParticipantView && (
        <div className="rounded-2xl border border-teal-200 bg-gradient-to-r from-teal-50 to-cyan-50 px-4 py-3 text-sm text-teal-900 dark:border-teal-500/30 dark:from-teal-500/10 dark:to-cyan-500/10 dark:text-teal-100">
          <span className="font-semibold">Tip:</span> Open{" "}
          <a href="/my-offers" className="font-medium underline underline-offset-2">
            My offers
          </a>{" "}
          for amounts, payment, and withdrawal — this page only shows linked transaction history.
        </div>
      )}

      <div className="flex flex-wrap gap-2">
        {(["ALL", "SALE", "RENT"] as const).map((item) => (
          <button key={item} type="button" onClick={() => setFilterType(item)} className={filterBtn(filterType === item)}>
            {item === "ALL" ? "All types" : item === "SALE" ? (isParticipantView ? "Purchases" : "Sales") : "Rentals"}
          </button>
        ))}
        {(["ALL", "PENDING", "CONFIRMED", "COMPLETED", "CANCELLED"] as const).map((item) => (
          <button
            key={item}
            type="button"
            onClick={() => setFilterStatus(item)}
            className={filterBtn(filterStatus === item)}
          >
            {item === "ALL" ? "All statuses" : item}
          </button>
        ))}
      </div>

      <div className="grid gap-4">
        {loading && <div className="text-sm text-gray-500">Loading...</div>}
        {!loading && totalItems === 0 && <EmptyState participant={isParticipantView} />}

        {!loading && !isParticipantView && (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-6 gap-3">
              <AdminStatCard title="Total" value={adminStats.total} helper="Visible requests" accent="indigo" />
              <AdminStatCard title="Pending" value={adminStats.pending} helper="Need review" accent="amber" />
              <AdminStatCard title="Confirmed" value={adminStats.confirmed} helper="Accepted" accent="sky" />
              <AdminStatCard title="Completed" value={adminStats.completed} helper="Closed" accent="emerald" />
              <AdminStatCard title="Cancelled" value={adminStats.cancelled} helper="Rejected / withdrawn" accent="rose" />
              <AdminStatCard title="Volume" value={formatAmount(adminStats.volume, "TND")} helper="Total amount" accent="violet" />
            </div>

            <div className="rounded-2xl border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-gray-900">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 items-end">
                <div className="lg:col-span-8">
                  <label className="block text-xs font-semibold uppercase tracking-wide text-gray-500 mb-2">
                    Quick search
                  </label>
                  <input
                    type="text"
                    value={adminSearch}
                    onChange={(e) => setAdminSearch(e.target.value)}
                    placeholder="Search by property, city, owner, buyer, or tenant"
                    className="w-full rounded-xl border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:border-brand-500 focus:ring-2 focus:ring-brand-200 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100"
                  />
                </div>
                <div className="lg:col-span-4 flex items-center justify-end gap-2">
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    {adminDisplayList.length} transaction(s)
                  </span>
                  <Button size="sm" variant="outline" onClick={() => setAdminSearch("")}>Clear</Button>
                </div>
              </div>
            </div>

            <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900">
              <div className="p-4 space-y-3">
                {visibleTransactions.map((txn) => {
                  const statusCfg = statusColor[txn.status] || { bg: "bg-gray-100", text: "text-gray-800" };
                  const typeCfg = typeColor[txn.type] || { bg: "bg-gray-100", text: "text-gray-800" };
                  const canEdit = canUpdateStatus(txn);
                  const busy = statusBusyId === txn._id;
                  const latestTimeline =
                    txn.timeline && txn.timeline.length > 0 ? txn.timeline[txn.timeline.length - 1] : null;
                  const isExpanded = expandedTransactionId === txn._id;

                  return (
                    <article key={txn._id} className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm transition-shadow hover:shadow-md dark:border-gray-800 dark:bg-gray-950">
                      <button
                        type="button"
                        onClick={() => setExpandedTransactionId((prev) => (prev === txn._id ? null : txn._id))}
                        className="w-full text-left"
                      >
                        <div className="flex flex-col gap-4 p-5 sm:flex-row sm:items-start sm:justify-between">
                          <div className="space-y-3">
                            <div className="flex flex-wrap items-center gap-2">
                              <Pill label={txn.type === "SALE" ? "Purchase" : "Rental"} className={`${typeCfg.bg} ${typeCfg.text}`} />
                              <Pill label={txn.status} className={`${statusCfg.bg} ${statusCfg.text}`} />
                            </div>
                            <div>
                              <h3 className="text-lg font-semibold text-gray-900 dark:text-white line-clamp-1">
                                {txn.propertyId?.title || txn.propertyId?.reference || "Property"}
                              </h3>
                              <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-1">
                                {txn.propertyId?.city || "No city"}
                              </p>
                            </div>
                          </div>

                          <div className="sm:text-right">
                            <p className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">Amount</p>
                            <p className="text-2xl font-bold text-gray-900 dark:text-white">{formatAmount(txn.amount, txn.currency)}</p>
                            <p className="text-xs text-gray-500 dark:text-gray-400">Created {formatDate(txn.createdAt)}</p>
                          </div>
                        </div>
                      </button>

                      {isExpanded && (
                        <div className="border-t border-gray-100 bg-gray-50/70 p-5 dark:border-gray-800 dark:bg-gray-900/50">
                          <div className="grid gap-4 lg:grid-cols-2">
                            <div className="rounded-2xl bg-white p-4 shadow-sm dark:bg-gray-950">
                              <p className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">Property</p>
                              <p className="mt-1 font-medium text-gray-900 dark:text-white">{txn.propertyId?.title || "—"}</p>
                              <p className="text-sm text-gray-500 dark:text-gray-400">{txn.propertyId?.reference || "—"}</p>
                              <p className="mt-3 text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">Parties</p>
                              <p className="mt-1 text-sm text-gray-900 dark:text-white"><span className="font-medium">Owner / Agency:</span> {formatName(txn.ownerId) || "—"}</p>
                              <p className="text-sm text-gray-900 dark:text-white"><span className="font-medium">Buyer / Tenant:</span> {formatName(txn.partyId) || "—"}</p>
                              {latestTimeline && (
                                <p className="mt-3 text-xs text-gray-500 dark:text-gray-400">Updated {formatDate(latestTimeline.at)}{latestTimeline.note ? ` — ${latestTimeline.note}` : ""}</p>
                              )}
                            </div>

                            <div className="rounded-2xl bg-white p-4 shadow-sm dark:bg-gray-950">
                              <p className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">Workflow</p>
                              {isParticipantView ? (
                                <div className="mt-3 space-y-2 text-sm text-gray-600 dark:text-gray-300">
                                  {txn.timeline?.length ? (
                                    [...txn.timeline].slice(-6).reverse().map((entry, idx) => (
                                      <div key={`${entry.at}-${idx}`} className="flex flex-wrap items-center gap-2">
                                        <Pill label={entry.status} className="bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-white" />
                                        <span>{formatDate(entry.at)}</span>
                                        {entry.note && <span>— {entry.note}</span>}
                                      </div>
                                    ))
                                  ) : (
                                    <p>No timeline yet.</p>
                                  )}
                                </div>
                              ) : (
                                <div className="mt-3">
                                  <select
                                    value={txn.status}
                                    disabled={!canEdit || busy}
                                    onChange={(e) => updateStatus(txn, e.target.value as StatusTarget)}
                                    onClick={(e) => e.stopPropagation()}
                                    className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm font-semibold text-gray-800 focus:border-brand-500 focus:ring-2 focus:ring-brand-200 disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100"
                                  >
                                    {WORKFLOW_STEPS.map((step) => (
                                      <option key={step.value} value={step.value}>
                                        {step.title}
                                      </option>
                                    ))}
                                  </select>
                                  {!canEdit && (
                                    <p className="mt-2 text-xs text-amber-700 dark:text-amber-400">View only</p>
                                  )}
                                </div>
                              )}
                            </div>
                          </div>

                          <div className="mt-4 flex flex-wrap gap-2">
                            <a href={listingUrl(txn)} target="_blank" rel="noreferrer" onClick={(e) => e.stopPropagation()}>
                              <Button size="sm" variant="outline">
                                Open marketplace
                              </Button>
                            </a>
                            {txn.status === "PENDING" && canCancel(txn) && (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  updateStatus(txn, "CANCELLED");
                                }}
                              >
                                Withdraw request
                              </Button>
                            )}
                            {busy && <span className="text-xs text-gray-500 self-center">Updating...</span>}
                          </div>
                        </div>
                      )}
                    </article>
                  );
                })}
              </div>
            </div>
          </>
        )}

        {!loading && isParticipantView && (
          <div className="space-y-3">
            {visibleTransactions.map((txn) => {
              const statusCfg = statusColor[txn.status] || { bg: "bg-gray-100", text: "text-gray-800" };
              const typeCfg = typeColor[txn.type] || { bg: "bg-gray-100", text: "text-gray-800" };
              const isExpanded = expandedTransactionId === txn._id;
              return (
                <article
                  key={txn._id}
                  className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm dark:border-gray-800 dark:bg-gray-900"
                >
                  <button
                    type="button"
                    onClick={() => setExpandedTransactionId((prev) => (prev === txn._id ? null : txn._id))}
                    className="w-full text-left"
                  >
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between border-b border-gray-100 bg-gradient-to-r from-teal-50/90 to-white px-5 py-4 dark:border-gray-800 dark:from-teal-500/10 dark:to-gray-900">
                      <div>
                        <div className="mb-1 flex flex-wrap items-center gap-2">
                          <Pill label={txn.type === "SALE" ? "Purchase" : "Rental"} className={`${typeCfg.bg} ${typeCfg.text}`} />
                          <Pill label={txn.status} className={`${statusCfg.bg} ${statusCfg.text}`} />
                        </div>
                        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                          {txn.propertyId?.title || txn.propertyId?.reference || "Property"}
                        </h2>
                        {txn.propertyId?.city && (
                          <p className="text-sm text-gray-500 dark:text-gray-400">{txn.propertyId.city}</p>
                        )}
                      </div>
                      <div className="text-left sm:text-right">
                        <p className="text-xs font-medium uppercase tracking-wide text-gray-500">Amount</p>
                        <p className="text-xl font-semibold text-gray-900 dark:text-white">
                          {formatAmount(txn.amount, txn.currency)}
                        </p>
                      </div>
                    </div>
                  </button>

                  {isExpanded && (
                    <div className="space-y-4 p-5">
                      <div className="rounded-xl bg-gray-50 px-4 py-3 dark:bg-gray-800/50">
                        <p className="text-xs font-medium uppercase tracking-wide text-gray-500">Seller / Agency</p>
                        <p className="mt-0.5 font-medium text-gray-900 dark:text-white">
                          {formatName(txn.ownerId) || "—"}
                        </p>
                      </div>
                      {txn.timeline && txn.timeline.length > 0 && (
                        <div className="rounded-xl border border-gray-100 bg-gray-50/80 p-3 dark:border-gray-800 dark:bg-gray-800/40">
                          <p className="mb-2 text-xs font-semibold text-gray-700 dark:text-gray-200">Progress</p>
                          <div className="space-y-2">
                            {[...txn.timeline]
                              .slice(-6)
                              .reverse()
                              .map((entry, idx) => (
                                <div
                                  key={`${entry.at}-${idx}`}
                                  className="flex flex-wrap items-start gap-2 text-xs text-gray-600 dark:text-gray-300"
                                >
                                  <Pill
                                    label={entry.status}
                                    className="bg-white text-gray-800 dark:bg-gray-900 dark:text-white"
                                  />
                                  <span className="text-gray-500">{formatDate(entry.at)}</span>
                                  {entry.note && <span className="text-gray-500">— {entry.note}</span>}
                                </div>
                              ))}
                          </div>
                        </div>
                      )}
                      <div className="flex flex-wrap gap-2 border-t border-gray-100 pt-4 dark:border-gray-800">
                        <a href={listingUrl(txn)} target="_blank" rel="noreferrer" onClick={(e) => e.stopPropagation()}>
                          <Button size="sm" variant="outline">
                            Open marketplace
                          </Button>
                        </a>
                        {txn.status === "PENDING" && canCancel(txn) && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={(e) => {
                              e.stopPropagation();
                              updateStatus(txn, "CANCELLED");
                            }}
                          >
                            Withdraw request
                          </Button>
                        )}
                      </div>
                    </div>
                  )}
                </article>
              );
            })}
          </div>
        )}

      </div>

      {!loading && totalItems > 0 && (
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Showing <span className="font-semibold text-gray-900 dark:text-white">{(currentPage - 1) * itemsPerPage + 1}</span>-<span className="font-semibold text-gray-900 dark:text-white">{Math.min(currentPage * itemsPerPage, totalItems)}</span> of <span className="font-semibold text-gray-900 dark:text-white">{totalItems}</span> · Page <span className="font-semibold text-gray-900 dark:text-white">{currentPage}</span> of <span className="font-semibold text-gray-900 dark:text-white">{totalPages}</span>
          </p>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
              disabled={currentPage <= 1}
              className="px-4 py-2 text-sm font-medium rounded-lg border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-200 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-gray-800"
            >
              Previous
            </button>
            <button
              type="button"
              onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
              disabled={currentPage >= totalPages}
              className="px-4 py-2 text-sm font-medium rounded-lg border border-indigo-600 bg-indigo-600 text-white disabled:opacity-50 disabled:cursor-not-allowed hover:bg-indigo-700"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function AdminStatCard({
  title,
  value,
  helper,
  accent,
}: {
  title: string;
  value: string | number;
  helper: string;
  accent: "indigo" | "amber" | "sky" | "emerald" | "rose" | "violet";
}) {
  const accentClass: Record<typeof accent, string> = {
    indigo: "from-indigo-500 to-indigo-600",
    amber: "from-amber-500 to-amber-600",
    sky: "from-sky-500 to-sky-600",
    emerald: "from-emerald-500 to-emerald-600",
    rose: "from-rose-500 to-rose-600",
    violet: "from-violet-500 to-violet-600",
  };

  return (
    <div className="relative overflow-hidden rounded-2xl border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-800 dark:bg-gray-900">
      <div className={`absolute inset-x-0 top-0 h-1 bg-gradient-to-r ${accentClass[accent]}`} />
      <p className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">{title}</p>
      <p className="mt-2 text-2xl font-bold text-gray-900 dark:text-white">{value}</p>
      <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">{helper}</p>
    </div>
  );
}
