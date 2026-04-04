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
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [statusBusyId, setStatusBusyId] = useState<string | null>(null);

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
        {!loading && displayList.length === 0 && <EmptyState participant={isParticipantView} />}

        {!loading &&
          isParticipantView &&
          displayList.map((txn) => {
            const statusCfg = statusColor[txn.status] || { bg: "bg-gray-100", text: "text-gray-800" };
            const typeCfg = typeColor[txn.type] || { bg: "bg-gray-100", text: "text-gray-800" };
            const label = txn.type === "SALE" ? "Purchase" : "Rental";
            const counterparty = txn.type === "SALE" ? "Seller / agency" : "Landlord / agency";
            return (
              <article
                key={txn._id}
                className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm dark:border-gray-800 dark:bg-gray-900"
              >
                <div className="border-b border-gray-100 bg-gradient-to-r from-teal-50/90 to-white px-5 py-4 dark:border-gray-800 dark:from-teal-500/10 dark:to-gray-900">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                      <div className="mb-1 flex flex-wrap items-center gap-2">
                        <Pill label={label} className={`${typeCfg.bg} ${typeCfg.text}`} />
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
                </div>
                <div className="space-y-4 p-5">
                  <div className="rounded-xl bg-gray-50 px-4 py-3 dark:bg-gray-800/50">
                    <p className="text-xs font-medium uppercase tracking-wide text-gray-500">{counterparty}</p>
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
                    <a href={listingUrl(txn)} target="_blank" rel="noreferrer">
                      <Button size="sm" variant="outline">
                        Open marketplace
                      </Button>
                    </a>
                    {txn.status === "PENDING" && canCancel(txn) && (
                      <Button size="sm" variant="outline" onClick={() => updateStatus(txn, "CANCELLED")}>
                        Withdraw request
                      </Button>
                    )}
                  </div>
                </div>
              </article>
            );
          })}

        {!loading &&
          !isParticipantView &&
          displayList.map((txn) => {
            const statusCfg = statusColor[txn.status] || { bg: "bg-gray-100", text: "text-gray-800" };
            const typeCfg = typeColor[txn.type] || { bg: "bg-gray-100", text: "text-gray-800" };
            const latestTimeline =
              txn.timeline && txn.timeline.length > 0 ? txn.timeline[txn.timeline.length - 1] : null;
            const canEdit = canUpdateStatus(txn);
            const busy = statusBusyId === txn._id;

            return (
              <div
                key={txn._id}
                className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-gray-900"
              >
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex flex-wrap items-center gap-3">
                    <Pill label={txn.type} className={`${typeCfg.bg} ${typeCfg.text}`} />
                    <Pill label={txn.status} className={`${statusCfg.bg} ${statusCfg.text}`} />
                    <span className="text-sm font-medium text-gray-900 dark:text-white">
                      {txn.propertyId?.title || txn.propertyId?.reference || "Property"}
                    </span>
                    {txn.propertyId?.city && (
                      <span className="text-xs text-gray-500 dark:text-gray-400">{txn.propertyId.city}</span>
                    )}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-300">
                    <span className="font-semibold text-gray-900 dark:text-white">
                      {formatAmount(txn.amount, txn.currency)}
                    </span>
                    {txn.type === "RENT" && (
                      <span className="ml-2 text-xs">
                        {formatDate(txn.startDate)} → {formatDate(txn.endDate)}
                      </span>
                    )}
                  </div>
                </div>

                <div className="mt-4 grid gap-3 text-sm sm:grid-cols-2">
                  <div className="rounded-xl bg-gray-50 px-4 py-3 dark:bg-gray-800/50">
                    <p className="text-xs font-medium text-gray-500">Owner / Agency</p>
                    <p className="font-semibold text-gray-900 dark:text-white">
                      {formatName(txn.ownerId) || "—"}
                    </p>
                  </div>
                  <div className="rounded-xl bg-gray-50 px-4 py-3 dark:bg-gray-800/50">
                    <p className="text-xs font-medium text-gray-500">Buyer / Tenant</p>
                    <p className="font-semibold text-gray-900 dark:text-white">
                      {formatName(txn.partyId) || "—"}
                    </p>
                  </div>
                </div>

                <div className="mt-3 flex flex-wrap gap-2 text-xs text-gray-500">
                  <span className="inline-flex items-center gap-1 rounded-full bg-gray-100 px-2.5 py-1 dark:bg-white/5">
                    Created {formatDate(txn.createdAt)}
                  </span>
                  {latestTimeline && (
                    <span className="inline-flex items-center gap-1 rounded-full bg-gray-100 px-2.5 py-1 dark:bg-white/5">
                      Updated {formatDate(latestTimeline.at)}
                    </span>
                  )}
                </div>

                {txn.timeline && txn.timeline.length > 0 && (
                  <div className="mt-4 rounded-xl border border-gray-100 bg-gray-50/80 p-4 dark:border-gray-800 dark:bg-gray-800/40">
                    <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
                      History
                    </p>
                    <div className="space-y-2">
                      {txn.timeline
                        .slice(Math.max(txn.timeline.length - 5, 0))
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

                <div className="mt-5 rounded-2xl border border-gray-200 bg-gradient-to-b from-gray-50/80 to-white p-4 dark:border-gray-700 dark:from-gray-800/40 dark:to-gray-900">
                  <div className="mb-3">
                    <p className="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                      Workflow
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-300">
                      Choose the next status for this request. Current step is highlighted.
                    </p>
                  </div>
                  <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-4">
                    {WORKFLOW_STEPS.map((step) => {
                      const isCurrent = txn.status === step.value;
                      return (
                        <button
                          key={step.value}
                          type="button"
                          disabled={!canEdit || busy || isCurrent}
                          onClick={() => updateStatus(txn, step.value)}
                          className={`flex flex-col rounded-xl border px-3 py-3 text-left transition ${
                            isCurrent ? step.currentClass : step.idleClass
                          } ${
                            !canEdit || busy
                              ? "cursor-not-allowed opacity-50"
                              : isCurrent
                                ? "cursor-default"
                                : "cursor-pointer"
                          }`}
                        >
                          <span
                            className={`text-sm font-bold ${
                              isCurrent ? "text-gray-900 dark:text-white" : "text-gray-800 dark:text-gray-100"
                            }`}
                          >
                            {step.title}
                            {isCurrent && (
                              <span className="ml-1.5 text-xs font-semibold text-brand-600 dark:text-brand-400">
                                · now
                              </span>
                            )}
                          </span>
                          <span className="mt-1 text-xs text-gray-600 dark:text-gray-400">{step.hint}</span>
                        </button>
                      );
                    })}
                  </div>
                  {!canEdit && (
                    <p className="mt-3 text-xs text-amber-700 dark:text-amber-400/90">
                      You can view this transaction but only the listing owner or an admin can change its status.
                    </p>
                  )}
                </div>
              </div>
            );
          })}
      </div>
    </div>
  );
}
