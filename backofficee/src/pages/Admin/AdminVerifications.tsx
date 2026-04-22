import { useCallback, useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import PageMeta from "../../components/common/PageMeta";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";
const UPLOAD_ORIGIN = API_URL.replace(/\/?api\/?$/, "").replace(/\/$/, "") || "http://localhost:5000";

type IdentityDoc = { kind: string; url: string; filename?: string };

type VerificationUser = {
  _id: string;
  login?: string;
  firstName?: string;
  lastName?: string;
  email: string;
  role: string;
  identityVerificationStatus: string;
  identityVerificationNote?: string;
  identityDocuments?: IdentityDoc[];
  createdAt: string;
};

type StatusFilter = "PENDING" | "REJECTED" | "ALL";

export default function AdminVerifications() {
  const [users, setUsers] = useState<VerificationUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("PENDING");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);

  const stats = useMemo(() => {
    const list = Array.isArray(users) ? users : [];
    return {
      total: list.length,
      pending: list.filter((u) => u.identityVerificationStatus === "PENDING").length,
      rejected: list.filter((u) => u.identityVerificationStatus === "REJECTED").length,
    };
  }, [users]);

  const fetchRequests = useCallback(async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(
        `${API_URL}/users/admin/verification-requests?status=${statusFilter}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (!response.ok) throw new Error("Failed to load verification requests");

      const data = await response.json();
      const list: VerificationUser[] = Array.isArray(data.users) ? data.users : [];
      setUsers(list);
    } catch (e) {
      console.error(e);
      toast.error("Failed to load verification requests");
      setUsers([]);
    } finally {
      setLoading(false);
    }
  }, [statusFilter]);

  useEffect(() => {
    fetchRequests();
  }, [fetchRequests]);

  useEffect(() => {
    setCurrentPage(1);
  }, [statusFilter]);

  const docUrl = (url: string) => {
    if (!url) return "#";
    if (url.startsWith("http")) return url;
    return `${UPLOAD_ORIGIN}${url.startsWith("/") ? url : `/${url}`}`;
  };

  const handleApprove = async (userId: string) => {
    const ok = confirm(
      "Approve this verification?\n\nThis will:\n- Mark the account as APPROVED\n- Send an email to the user\n- Allow them to sign in"
    );
    if (!ok) return;
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${API_URL}/users/admin/verification-requests/${userId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status: "APPROVED" }),
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(data.message || "Update failed");
      toast.success("Approved. The user has been notified by email.");
      fetchRequests();
    } catch (e) {
      console.error(e);
      toast.error("Could not approve. Please try again.");
    }
  };

  const handleReject = async (userId: string) => {
    const note = window.prompt(
      "Reason for rejection (shown to the user). Leave blank for a default message.",
      ""
    );
    if (note === null) return;
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${API_URL}/users/admin/verification-requests/${userId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status: "REJECTED", note: note.trim() }),
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(data.message || "Update failed");
      toast.success("Request rejected");
      fetchRequests();
    } catch (e) {
      console.error(e);
      toast.error("Could not reject request");
    }
  };

  const totalPages = Math.ceil(users.length / itemsPerPage) || 1;
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentRows = users.slice(indexOfFirstItem, indexOfLastItem);

  const getRoleBadge = (role: string) => {
    const badges: Record<string, string> = {
      AGENCY: "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400",
      OWNER: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
      TENANT: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
      BUYER: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400",
    };
    return badges[role] || "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300";
  };

  return (
    <>
      <PageMeta
        title="Identity verifications | Admin"
        description="Review uploaded documents and approve or reject new accounts"
      />

      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Identity verifications</h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              Review documents submitted at signup. Only administrators see this module.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <StatCard title="In this list" value={stats.total} helper="Current filter" accent="indigo" />
          <StatCard title="Pending (subset)" value={stats.pending} helper="Awaiting decision" accent="amber" />
          <StatCard title="Rejected (subset)" value={stats.rejected} helper="Declined accounts" accent="rose" />
        </div>

        <div className="bg-white dark:bg-gray-dark rounded-2xl border border-gray-200 dark:border-gray-800 p-6">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Queue</label>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as StatusFilter)}
            className="w-full max-w-md px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500"
          >
            <option value="PENDING">Pending review</option>
            <option value="REJECTED">Rejected</option>
            <option value="ALL">Pending and rejected</option>
          </select>
        </div>

        <div className="bg-white dark:bg-gray-dark rounded-2xl border border-gray-200 dark:border-gray-800 overflow-hidden">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600" />
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[1050px] table-fixed">
                <thead className="bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
                  <tr>
                    <th className="px-3 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider w-40">
                      User
                    </th>
                    <th className="px-3 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider w-72">
                      Email
                    </th>
                    <th className="px-3 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider w-28">
                      Role
                    </th>
                    <th className="px-3 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider w-32">
                      Status
                    </th>
                    <th className="px-3 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                      Documents
                    </th>
                    <th className="px-3 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider w-36">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  {currentRows.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-3 py-12 text-center text-gray-500 dark:text-gray-400">
                        No requests in this queue
                      </td>
                    </tr>
                  ) : (
                    currentRows.map((user) => (
                      <tr key={user._id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                        <td className="px-3 py-3 align-top">
                          <div className="text-sm font-medium text-gray-900 dark:text-white">
                            {user.firstName || user.lastName
                              ? `${user.firstName || ""} ${user.lastName || ""}`.trim()
                              : user.login || "—"}
                          </div>
                          <div className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                            {new Date(user.createdAt).toLocaleString()}
                          </div>
                        </td>
                        <td className="px-3 py-3 align-top">
                          <div className="text-sm text-gray-900 dark:text-white break-all">{user.email}</div>
                          {user.identityVerificationNote && (
                            <div className="text-xs text-red-600 dark:text-red-400 mt-1">
                              {user.identityVerificationNote}
                            </div>
                          )}
                        </td>
                        <td className="px-3 py-3 align-top">
                          <span
                            className={`inline-flex px-2 py-1 rounded-lg text-xs font-medium ${getRoleBadge(user.role)}`}
                          >
                            {user.role}
                          </span>
                        </td>
                        <td className="px-3 py-3 align-top">
                          <span
                            className={`inline-flex px-2 py-1 rounded-lg text-xs font-medium ${
                              user.identityVerificationStatus === "PENDING"
                                ? "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-200"
                                : "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300"
                            }`}
                          >
                            {user.identityVerificationStatus}
                          </span>
                        </td>
                        <td className="px-3 py-3 align-top">
                          <ul className="space-y-1 text-sm">
                            {(user.identityDocuments || []).map((d, i) => (
                              <li key={`${d.kind}-${i}`}>
                                <a
                                  href={docUrl(d.url)}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-indigo-600 dark:text-indigo-400 hover:underline"
                                >
                                  {d.kind}
                                  {d.filename ? ` — ${d.filename}` : ""}
                                </a>
                              </li>
                            ))}
                          </ul>
                        </td>
                        <td className="px-3 py-3 align-top">
                          <div className="flex flex-col gap-2">
                            <button
                              type="button"
                              onClick={() => handleApprove(user._id)}
                              className="px-3 py-1.5 text-xs font-medium rounded-lg bg-emerald-600 text-white hover:bg-emerald-700"
                            >
                              Approve
                            </button>
                            <button
                              type="button"
                              onClick={() => handleReject(user._id)}
                              className="px-3 py-1.5 text-xs font-medium rounded-lg border border-red-300 text-red-700 dark:border-red-800 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20"
                            >
                              Reject
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {!loading && users.length > itemsPerPage && (
          <div className="flex items-center justify-between px-2">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Page {currentPage} of {totalPages}
            </p>
            <div className="flex gap-2">
              <button
                type="button"
                disabled={currentPage <= 1}
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                className="px-4 py-2 text-sm rounded-lg border border-gray-300 dark:border-gray-600 disabled:opacity-50"
              >
                Previous
              </button>
              <button
                type="button"
                disabled={currentPage >= totalPages}
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                className="px-4 py-2 text-sm font-medium rounded-lg border border-indigo-600 bg-indigo-600 text-white disabled:opacity-50 hover:bg-indigo-700"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </>
  );
}

function StatCard({
  title,
  value,
  helper,
  accent,
}: {
  title: string;
  value: number | string;
  helper: string;
  accent: "indigo" | "violet" | "blue" | "emerald" | "amber" | "rose";
}) {
  const accentClass: Record<typeof accent, string> = {
    indigo: "from-indigo-500 to-indigo-600",
    violet: "from-violet-500 to-violet-600",
    blue: "from-blue-500 to-blue-600",
    emerald: "from-emerald-500 to-emerald-600",
    amber: "from-amber-500 to-amber-600",
    rose: "from-rose-500 to-rose-600",
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
