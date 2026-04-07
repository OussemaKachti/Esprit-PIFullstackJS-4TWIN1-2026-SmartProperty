import { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import PageMeta from "../../components/common/PageMeta";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";
const FASTAPI_URL = import.meta.env.VITE_FASTAPI_URL || "http://127.0.0.1:8000";

type Match = {
  rank?: number;
  category?: string;
  city?: string;
  region?: string;
  price?: number;
  size?: number;
  room_count?: number;
  score_pct?: number;
};

type Candidate = {
  id: number;
  name: string;
  email: string;
  city?: string;
  credit_score?: number;
  recommendation?: "ACCEPT" | "GUARANTEE" | "REFUSE" | string;
  debt_ratio?: number;
  explanation?: string;
  top_match?: Match | null;
};

const recBadge: Record<string, string> = {
  ACCEPT: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300",
  GUARANTEE: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300",
  REFUSE: "bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-300",
  PENDING: "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300",
};

const formatMoney = (value?: number) =>
  typeof value === "number" ? `${Math.round(value).toLocaleString("fr-TN")} TND` : "N/A";

const formatScore = (value?: number) => (typeof value === "number" ? `${value.toFixed(0)} / 100` : "Not scored");

export default function AdminCandidates() {
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [loading, setLoading] = useState(true);
  const [dataSource, setDataSource] = useState<"fastapi" | "backend">("backend");

  const summary = useMemo(() => {
    const total = candidates.length;
    const accept = candidates.filter((c) => c.recommendation === "ACCEPT").length;
    const guarantee = candidates.filter((c) => c.recommendation === "GUARANTEE").length;
    const refuse = candidates.filter((c) => c.recommendation === "REFUSE").length;
    const avgScore =
      candidates.length === 0
        ? 0
        : Math.round(
            candidates.reduce((acc, c) => acc + (c.credit_score || 0), 0) / Math.max(candidates.length, 1),
          );
    return { total, accept, guarantee, refuse, avgScore };
  }, [candidates]);

  useEffect(() => {
    loadCandidates();
  }, []);

  const loadCandidates = async () => {
    setLoading(true);
    try {
      // Preferred source: FastAPI (contains AI scoring + top match)
      try {
        const aiRes = await fetch(`${FASTAPI_URL}/admin/candidates`);
        if (aiRes.ok) {
          const aiData = await aiRes.json();
          const aiCandidates = Array.isArray(aiData?.candidates) ? aiData.candidates : [];
          if (aiCandidates.length > 0) {
            const mappedAi: Candidate[] = aiCandidates.map((c: any, idx: number) => ({
              id: c.id || idx + 1,
              name: c.name || c.email || `Candidate ${idx + 1}`,
              email: c.email || "",
              city: c.city || "",
              credit_score: typeof c.credit_score === "number" ? c.credit_score : undefined,
              recommendation: c.recommendation || "PENDING",
              debt_ratio: typeof c.debt_ratio === "number" ? c.debt_ratio : undefined,
              explanation: c.explanation,
              top_match: c.top_match || null,
            }));

            setCandidates(mappedAi);
            setDataSource("fastapi");
            return;
          }
        }
      } catch {
        // FastAPI is optional; fallback to backend users list.
      }

      // Fallback source: backend users (without AI scoring fields)
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_URL}/users/all`, {
        headers: {
          Authorization: token ? `Bearer ${token}` : "",
          "Content-Type": "application/json",
        },
      });
      if (!res.ok) throw new Error("Failed to fetch users");
      const data = await res.json();
      const users = Array.isArray(data?.users) ? data.users : Array.isArray(data) ? data : [];

      const tenants: Candidate[] = users
        .filter((u: any) => u.role === "TENANT")
        .map((u: any, idx: number) => ({
          id: idx + 1,
          name: `${u.firstName || ""} ${u.lastName || ""}`.trim() || u.login || u.email,
          email: u.email,
          city: u.city || "",
          credit_score: typeof u.creditScore === "number" ? u.creditScore : undefined,
          recommendation: u.recommendation || "PENDING",
          debt_ratio: typeof u.debt_ratio === "number" ? u.debt_ratio : undefined,
          explanation:
            u.creditExplanation ||
            "Candidate profile is loaded, but AI scoring is not available. Start FastAPI service to see score and top match.",
          top_match: u.top_match || null,
        }));

      setCandidates(tenants);
      setDataSource("backend");
    } catch (error) {
      console.error(error);
      toast.error("Unable to load candidates from backend");
      setCandidates([]);
    } finally {
      setLoading(false);
    }
  };

  const renderTopMatch = (match?: Match | null) => {
    if (!match) return <span className="text-gray-500">No match</span>;

    return (
      <div className="space-y-1">
        <p className="font-medium text-gray-900 dark:text-white">
          {match.category || "Property"} · {match.city}
        </p>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          {formatMoney(match.price)} · {match.size ? `${match.size} m²` : ""} · {match.room_count || 0} rooms
        </p>
        {match.score_pct !== undefined && (
          <span className="inline-flex items-center px-2 py-1 text-xs font-semibold rounded-full bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-200">
            {match.score_pct}% match
          </span>
        )}
      </div>
    );
  };

  return (
    <>
      <PageMeta
        title="Admin · Candidates"
        description="Monitor candidate credit results and top matches"
      />

      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Candidates</h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              Credit scores, recommendations, and best matched property per candidate.
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              Source: {dataSource === "fastapi" ? "AI service" : "Backend users"}
            </p>
          </div>
          <button
            onClick={loadCandidates}
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
            disabled={loading}
          >
            {loading ? "Loading..." : "Refresh"}
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard title="Total" value={summary.total} helper="Candidates" color="indigo" />
          <StatCard title="Accept" value={summary.accept} helper="Green light" color="green" />
          <StatCard title="Guarantee" value={summary.guarantee} helper="Ask for guarantor" color="amber" />
          <StatCard title="Refuse" value={summary.refuse} helper="High risk" color="rose" />
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
                  <th className="px-3 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                    Candidate
                  </th>
                  <th className="px-3 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider w-28">
                    City
                  </th>
                  <th className="px-3 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider w-28">
                    Credit
                  </th>
                  <th className="px-3 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider w-32">
                    Recommendation
                  </th>
                  <th className="px-3 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                    Top match
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {candidates.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-3 py-12 text-center text-gray-500 dark:text-gray-400">
                      No candidates yet
                    </td>
                  </tr>
                ) : (
                  candidates.map((candidate) => (
                    <tr key={candidate.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/40 transition-colors">
                      <td className="px-3 py-4">
                        <div className="flex items-center space-x-3">
                          <div className="h-10 w-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-semibold">
                            {(candidate.name || candidate.email)[0].toUpperCase()}
                          </div>
                          <div className="space-y-1">
                            <p className="font-medium text-gray-900 dark:text-white">{candidate.name}</p>
                            <p className="text-xs text-gray-500 dark:text-gray-400">{candidate.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-3 py-4 text-sm text-gray-700 dark:text-gray-200">{candidate.city || "–"}</td>
                      <td className="px-3 py-4 text-sm text-gray-900 dark:text-gray-100 font-semibold">
                        {formatScore(candidate.credit_score)}
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          Debt ratio: {typeof candidate.debt_ratio === "number" ? `${(candidate.debt_ratio * 100).toFixed(0)}%` : "Not available"}
                        </p>
                      </td>
                      <td className="px-3 py-4">
                        <span
                          className={`inline-flex px-3 py-1 rounded-full text-xs font-semibold ${recBadge[candidate.recommendation || ""] || "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300"}`}
                        >
                          {candidate.recommendation || "N/A"}
                        </span>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 line-clamp-2">
                          {candidate.explanation}
                        </p>
                      </td>
                      <td className="px-3 py-4">{renderTopMatch(candidate.top_match)}</td>
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

function StatCard({
  title,
  value,
  helper,
  color,
}: {
  title: string;
  value: number | string;
  helper: string;
  color: "indigo" | "green" | "amber" | "rose";
}) {
  const palette: Record<"indigo" | "green" | "amber" | "rose", string> = {
    indigo: "bg-indigo-50 text-indigo-700 dark:bg-indigo-900/20 dark:text-indigo-200",
    green: "bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-200",
    amber: "bg-amber-50 text-amber-700 dark:bg-amber-900/20 dark:text-amber-200",
    rose: "bg-rose-50 text-rose-700 dark:bg-rose-900/20 dark:text-rose-200",
  };

  return (
    <div className="bg-white dark:bg-gray-dark rounded-2xl border border-gray-200 dark:border-gray-800 p-5 hover:shadow-sm transition-shadow">
      <p className="text-sm text-gray-600 dark:text-gray-400">{title}</p>
      <p className="text-3xl font-bold text-gray-900 dark:text-white mt-2">{value}</p>
      <span className={`inline-flex px-2 py-1 mt-3 text-xs font-semibold rounded-full ${palette[color]}`}>
        {helper}
      </span>
    </div>
  );
}
