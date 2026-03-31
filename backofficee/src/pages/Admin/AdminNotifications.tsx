import { useMemo, useState } from "react";
import toast from "react-hot-toast";
import PageMeta from "../../components/common/PageMeta";

const API_URL = import.meta.env.VITE_FASTAPI_URL || "http://127.0.0.1:8000";

type NotificationResult = {
  email: string;
  name: string;
  sent: boolean;
};

export default function AdminNotifications() {
  const [sending, setSending] = useState(false);
  const [results, setResults] = useState<NotificationResult[]>([]);
  const [lastRun, setLastRun] = useState<Date | null>(null);

  const summary = useMemo(() => {
    const total = results.length;
    const sent = results.filter((r) => r.sent).length;
    return { total, sent };
  }, [results]);

  const triggerEmails = async () => {
    setSending(true);
    try {
      const res = await fetch(`${API_URL}/admin/notifications/trigger`, {
        method: "POST",
      });
      if (!res.ok) throw new Error("Failed to trigger notifications");
      const data = await res.json();
      setResults(Array.isArray(data?.results) ? data.results : []);
      setLastRun(new Date());
      toast.success(`Emails sent to ${data?.sent || 0}/${data?.total || 0} candidates`);
    } catch (error) {
      console.error(error);
      toast.error("Failed to trigger daily email");
    } finally {
      setSending(false);
    }
  };

  return (
    <>
      <PageMeta
        title="Admin · Notifications"
        description="Trigger daily email containing top matches for each candidate"
      />

      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Notifications</h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              Send the daily email that includes top 3 matches for every candidate.
            </p>
          </div>
          <button
            onClick={triggerEmails}
            disabled={sending}
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-70"
          >
            {sending ? "Sending..." : "Send daily email"}
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <StatCard title="Emails sent" value={`${summary.sent}/${summary.total || "-"}`} helper="Last run" />
          <StatCard
            title="Last trigger"
            value={lastRun ? lastRun.toLocaleString() : "Not run yet"}
            helper="Manual trigger"
          />
        </div>

        <div className="bg-white dark:bg-gray-dark rounded-2xl border border-gray-200 dark:border-gray-800 overflow-hidden">
          <table className="w-full table-fixed">
            <thead className="bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
              <tr>
                <th className="px-3 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                  Candidate
                </th>
                <th className="px-3 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                  Email
                </th>
                <th className="px-3 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider w-24">
                  Status
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {results.length === 0 ? (
                <tr>
                  <td colSpan={3} className="px-3 py-10 text-center text-gray-500 dark:text-gray-400">
                    Trigger the daily email to see delivery status.
                  </td>
                </tr>
              ) : (
                results.map((res) => (
                  <tr key={res.email} className="hover:bg-gray-50 dark:hover:bg-gray-800/40 transition-colors">
                    <td className="px-3 py-3 text-sm text-gray-900 dark:text-white font-medium">{res.name}</td>
                    <td className="px-3 py-3 text-sm text-gray-700 dark:text-gray-200">{res.email}</td>
                    <td className="px-3 py-3">
                      <span
                        className={`inline-flex px-3 py-1 rounded-full text-xs font-semibold ${
                          res.sent
                            ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300"
                            : "bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-200"
                        }`}
                      >
                        {res.sent ? "Sent" : "Failed"}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="bg-gray-50 dark:bg-gray-800 border border-dashed border-gray-200 dark:border-gray-700 rounded-2xl p-6">
          <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-2">Email setup</h3>
          <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1 list-disc list-inside">
            <li>Configure EMAIL_SENDER and EMAIL_PASSWORD in rental-matching-ai/.env.</li>
            <li>FastAPI endpoint: POST /admin/notifications/trigger (uses send_match_email).</li>
            <li>Uses the seed candidates defined in the API for demo purposes.</li>
          </ul>
        </div>
      </div>
    </>
  );
}

function StatCard({ title, value, helper }: { title: string; value: string | number; helper: string }) {
  return (
    <div className="bg-white dark:bg-gray-dark rounded-2xl border border-gray-200 dark:border-gray-800 p-5 hover:shadow-sm transition-shadow">
      <p className="text-sm text-gray-600 dark:text-gray-400">{title}</p>
      <p className="text-2xl font-bold text-gray-900 dark:text-white mt-2">{value}</p>
      <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">{helper}</p>
    </div>
  );
}
