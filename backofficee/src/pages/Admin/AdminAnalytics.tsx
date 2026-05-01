import { useEffect, useState } from "react";
import ReactApexChart from "react-apexcharts";
import { ApexOptions } from "apexcharts";
import toast from "react-hot-toast";
import PageMeta from "../../components/common/PageMeta";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

const MONTHS = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
const BI_COLORS = [
  "#4A90D9", // Bleu Acier
  "#3DB89A", // Teal Doux
  "#7B6FD4", // Lavande
  "#C2527A", // Framboise Douce
  "#6BAF7A", // Vert Sauge
  "#F2B960", // Ambre Chaud (principal)
  "#5BA3B8", // Bleu Ciel
  "#A0907A", // Taupe Chaud
];

type AnalyticsData = {
  meta: { generatedAt: string; year: number };
  kpis: {
    totalProperties: { value: number; changePercent: number; trend: string; thisMonth: number };
    totalUsers: { value: number; changePercent: number; trend: string; thisMonth: number };
    totalTransactions: { value: number; changePercent: number; trend: string; thisMonth: number };
    revenueThisMonth: { value: number; changePercent: number; trend: string };
    avgPropertyPrice: { value: number; portfolioValue: number };
    totalFeedbacks: { value: number; avgRating: number };
  };
  timeSeries: {
    months: string[];
    newListings: number[];
    transactionVolume: number[];
    newUsers: number[];
  };
  properties: {
    byType: { label: string; value: number }[];
    byStatus: { label: string; value: number }[];
    byListingType: { label: string; value: number }[];
    topCities: { city: string; count: number }[];
    byPriceRange: { label: string; value: number }[];
  };
  users: { byRole: { label: string; value: number }[] };
  transactions: {
    byType: { label: string; value: number }[];
    byStatus: { label: string; value: number }[];
    revenueByType: { label: string; revenue: number; count: number }[];
  };
  feedback: {
    ratingDistribution: { star: number; count: number }[];
    avgRating: number;
    total: number;
  };
};

function fmt(n: number) {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return String(n);
}

function fmtTND(n: number) {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(2)}M TND`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K TND`;
  return `${Math.round(n).toLocaleString("fr-TN")} TND`;
}

function isDark() {
  return document.documentElement.classList.contains("dark");
}

// ─── KPI Card ────────────────────────────────────────────────────────────────
function KpiCard({
  title, value, sub, change, trend, gradient, icon,
}: {
  title: string; value: string; sub: string;
  change?: number; trend?: string;
  gradient: string; icon: React.ReactNode;
}) {
  const up = trend === "up";
  const hasChange = change !== undefined && !isNaN(change);

  return (
    <div className="group relative overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-gray-100 transition-all hover:shadow-lg hover:-translate-y-0.5 dark:bg-gray-dark dark:ring-gray-800">
      {/* gradient accent bar */}
      <div className={`absolute left-0 top-0 h-1 w-full ${gradient}`} />
      <div className="px-5 pt-6 pb-5">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            <p className="text-[11px] font-bold uppercase tracking-widest text-gray-400 dark:text-gray-500">
              {title}
            </p>
            <p className="mt-2 text-2xl font-extrabold text-gray-900 dark:text-white leading-none truncate">
              {value}
            </p>
            <p className="mt-1.5 text-xs text-gray-500 dark:text-gray-400 truncate">{sub}</p>
          </div>
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white ring-1 ring-gray-200 shadow-sm dark:bg-gray-900 dark:ring-gray-700">
            {icon}
          </div>
        </div>
        {hasChange && (
          <div className="mt-3 flex items-center gap-1.5">
            <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-bold ${
              up
                ? "bg-emerald-50 text-emerald-600 ring-1 ring-emerald-200 dark:bg-emerald-900/20 dark:text-emerald-400 dark:ring-emerald-800"
                : "bg-rose-50 text-rose-600 ring-1 ring-rose-200 dark:bg-rose-900/20 dark:text-rose-400 dark:ring-rose-800"
            }`}>
              {up ? "▲" : "▼"} {Math.abs(change!)}%
            </span>
            <span className="text-[11px] text-gray-400">vs mois précédent</span>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Chart Card ──────────────────────────────────────────────────────────────
function ChartCard({
  title, sub, badge, children,
}: {
  title: string; sub?: string; badge?: string; children: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl bg-white shadow-sm ring-1 ring-gray-100 dark:bg-gray-dark dark:ring-gray-800 overflow-hidden">
      <div className="flex items-start justify-between gap-3 px-5 pt-5 pb-0">
        <div>
          <h3 className="text-sm font-bold text-gray-900 dark:text-white">{title}</h3>
          {sub && <p className="mt-0.5 text-xs text-gray-400 dark:text-gray-500">{sub}</p>}
        </div>
        {badge && (
          <span className="shrink-0 rounded-full bg-slate-100 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-500 ring-1 ring-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:ring-slate-700">
            {badge}
          </span>
        )}
      </div>
      <div className="px-2 pb-2">
        {children}
      </div>
    </div>
  );
}

// ─── Colour palettes — requested BI palette ───────────────────────────────────
const PALETTE = BI_COLORS;
const CITY_COLS = BI_COLORS;
const RATING_COLS = [BI_COLORS[3], BI_COLORS[5], BI_COLORS[0], BI_COLORS[2], BI_COLORS[1]];
const PRICE_DIST_COLS = [BI_COLORS[0], BI_COLORS[1], BI_COLORS[2], BI_COLORS[3], BI_COLORS[4], BI_COLORS[5]];

// ─── Chart option factories ───────────────────────────────────────────────────
function areaOptions(
  _name1: string, name2: string | null,
  colors: string[]
): ApexOptions {
  return {
    chart: { type: "area", toolbar: { show: false }, background: "transparent", fontFamily: "inherit", sparkline: { enabled: false } },
    stroke: { curve: "smooth", width: [2.5, 2.5] },
    fill: {
      type: "gradient",
      gradient: { type: "vertical", shadeIntensity: 1, opacityFrom: 0.18, opacityTo: 0.01, stops: [0, 100] },
    },
    colors,
    xaxis: {
      categories: MONTHS,
      axisBorder: { show: false },
      axisTicks: { show: false },
      labels: { style: { fontSize: "10px", colors: "#9ca3af" } },
    },
    yaxis: { labels: { style: { fontSize: "10px", colors: "#9ca3af" } } },
    grid: { borderColor: isDark() ? "#1f2937" : "#f3f4f6", strokeDashArray: 4, padding: { left: 0, right: 0 } },
    legend: { show: !!name2, position: "top", fontSize: "11px", fontWeight: 600, itemMargin: { horizontal: 12 } },
    tooltip: { shared: true, intersect: false, theme: isDark() ? "dark" : "light" },
    dataLabels: { enabled: false },
    theme: { mode: isDark() ? "dark" : "light" },
    markers: { size: 0, hover: { size: 5 } },
  };
}

function donutOptions(labels: string[], colors?: string[], centerLabel?: string): ApexOptions {
  return {
    chart: { type: "donut", background: "transparent", fontFamily: "inherit" },
    labels,
    colors: colors ?? PALETTE,
    legend: { position: "bottom", fontSize: "11px", fontWeight: 500, itemMargin: { horizontal: 8, vertical: 4 } },
    plotOptions: {
      pie: {
        donut: {
          size: "70%",
          labels: {
            show: !!centerLabel,
            total: {
              show: true,
              label: centerLabel ?? "Total",
              fontSize: "12px",
              fontWeight: 700,
              color: isDark() ? "#e5e7eb" : "#374151",
              formatter: (w) => {
                const total = w.globals.seriesTotals.reduce((a: number, b: number) => a + b, 0);
                return fmt(total);
              },
            },
          },
        },
      },
    },
    dataLabels: {
      enabled: true,
      formatter: (_val: number, opts) => {
        const pct = opts.w.globals.seriesPercent[opts.seriesIndex][0];
        return pct > 5 ? `${pct.toFixed(1)}%` : "";
      },
      style: { fontSize: "10px", fontWeight: 700 },
      dropShadow: { enabled: false },
    },
    stroke: { width: 2, colors: [isDark() ? "#111827" : "#ffffff"] },
    tooltip: { theme: isDark() ? "dark" : "light" },
    theme: { mode: isDark() ? "dark" : "light" },
  };
}

function barOptions(
  categories: string[],
  horizontal = false,
  unit = "",
  colors: string[] = ["#6366f1"],
  distributed = false
): ApexOptions {
  return {
    chart: { type: "bar", toolbar: { show: false }, background: "transparent", fontFamily: "inherit" },
    plotOptions: {
      bar: {
        borderRadius: horizontal ? 4 : 6,
        horizontal,
        columnWidth: "52%",
        distributed,
        barHeight: horizontal ? "60%" : undefined,
      },
    },
    colors: distributed ? PALETTE : colors,
    xaxis: {
      categories,
      axisBorder: { show: false },
      axisTicks: { show: false },
      labels: { style: { fontSize: "10px", colors: "#9ca3af" } },
    },
    yaxis: {
      labels: {
        style: { fontSize: "10px", colors: "#9ca3af" },
        formatter: (v) => unit ? `${fmt(v)}${unit}` : fmt(v),
      },
    },
    grid: { borderColor: isDark() ? "#1f2937" : "#f3f4f6", strokeDashArray: 4 },
    tooltip: {
      theme: isDark() ? "dark" : "light",
      y: { formatter: (v) => unit ? `${Math.round(v).toLocaleString()}${unit}` : String(v) },
    },
    legend: { show: false },
    dataLabels: { enabled: false },
    theme: { mode: isDark() ? "dark" : "light" },
  };
}

// ─── Skeleton loader ──────────────────────────────────────────────────────────
function Skeleton() {
  return (
    <div className="space-y-5 p-6 animate-pulse">
      <div className="h-28 rounded-3xl bg-gray-100 dark:bg-gray-800" />
      <div className="grid grid-cols-2 gap-4 xl:grid-cols-5">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="h-32 rounded-2xl bg-gray-100 dark:bg-gray-800" />
        ))}
      </div>
      <div className="grid gap-4 xl:grid-cols-2">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="h-64 rounded-2xl bg-gray-100 dark:bg-gray-800" />
        ))}
      </div>
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────
export default function AdminAnalytics() {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    const token = localStorage.getItem("token");
    if (!token) { toast.error("Session expirée — veuillez vous reconnecter."); return; }
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/bi/analytics`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.message || "Erreur API");
      setData(json.data ?? json);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Erreur de chargement");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { void fetchData(); }, []);

  if (loading) return <Skeleton />;
  if (!data) return (
    <div className="flex h-64 items-center justify-center text-sm text-gray-400">
      Aucune donnée disponible.
    </div>
  );

  const { kpis, timeSeries, properties, users, transactions, feedback } = data;

  return (
    <>
      <PageMeta
        title="Analytics BI | Smart Property Admin"
        description="Tableau de bord analytique avancé pour l'administrateur SmartProperty."
      />

      <div className="space-y-5 pb-12">

        {/* ── Header ─────────────────────────────────────────────────────── */}
        <div className="relative overflow-hidden rounded-3xl bg-white shadow-sm ring-1 ring-gray-100 dark:bg-gray-dark dark:ring-gray-800">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-50/80 via-transparent to-sky-50/40 dark:from-blue-950/20 dark:via-gray-950 dark:to-sky-950/10" />
          {/* decorative blobs */}
          <div className="pointer-events-none absolute -right-16 -top-16 h-64 w-64 rounded-full bg-blue-100/30 blur-3xl dark:bg-blue-900/10" />
          <div className="pointer-events-none absolute -left-8 bottom-0 h-40 w-40 rounded-full bg-teal-100/20 blur-3xl dark:bg-teal-900/10" />

          <div className="relative px-6 py-6 sm:px-8 sm:py-7">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <div className="inline-flex items-center gap-2 rounded-full border border-blue-200 bg-white/90 px-3 py-1 text-[11px] font-bold uppercase tracking-widest text-blue-700 shadow-sm backdrop-blur dark:border-blue-500/20 dark:bg-gray-900/80 dark:text-blue-300">
                  <span className="h-1.5 w-1.5 rounded-full bg-blue-500 animate-pulse" />
                  Business Intelligence
                </div>
                <h1 className="mt-3 text-2xl font-extrabold tracking-tight text-gray-900 dark:text-white sm:text-3xl">
                  Analytics Dashboard
                </h1>
                <p className="mt-1.5 text-sm text-gray-500 dark:text-gray-400 max-w-xl">
                  Vue analytique complète — propriétés, utilisateurs, transactions &amp; satisfaction client.
                </p>
                <p className="mt-1 text-xs text-gray-400 dark:text-gray-600">
                  Généré le {new Date(data.meta.generatedAt).toLocaleString("fr-FR")}
                </p>
              </div>
              <button
                onClick={fetchData}
                className="inline-flex h-9 items-center gap-2 rounded-xl border border-gray-200 bg-white px-4 text-sm font-semibold text-gray-600 shadow-sm transition-all hover:border-blue-300 hover:bg-blue-50 hover:text-blue-700 active:scale-95 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300 dark:hover:border-blue-700 dark:hover:text-blue-300"
              >
                <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                Actualiser
              </button>
            </div>
          </div>
        </div>

        {/* ── KPI Cards ──────────────────────────────────────────────────── */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-5">
          <KpiCard
            title="Propriétés"
            value={fmt(kpis.totalProperties.value)}
            sub={`+${kpis.totalProperties.thisMonth} ce mois`}
            change={kpis.totalProperties.changePercent}
            trend={kpis.totalProperties.trend}
            gradient="bg-gradient-to-r from-blue-500 to-blue-600"
            icon={
              <img
                src="/images/icons/house.png"
                alt="Properties"
                className="h-5 w-5 object-contain"
              />
            }
          />
          <KpiCard
            title="Utilisateurs"
            value={fmt(kpis.totalUsers.value)}
            sub={`+${kpis.totalUsers.thisMonth} ce mois`}
            change={kpis.totalUsers.changePercent}
            trend={kpis.totalUsers.trend}
            gradient="bg-gradient-to-r from-teal-400 to-teal-600"
            icon={
              <img
                src="/images/icons/group.png"
                alt="Users"
                className="h-5 w-5 object-contain"
              />
            }
          />
          <KpiCard
            title="Transactions"
            value={fmt(kpis.totalTransactions.value)}
            sub={`+${kpis.totalTransactions.thisMonth} ce mois`}
            change={kpis.totalTransactions.changePercent}
            trend={kpis.totalTransactions.trend}
            gradient="bg-gradient-to-r from-amber-400 to-amber-600"
            icon={
              <img
                src="/images/icons/transaction.png"
                alt="Transactions"
                className="h-5 w-5 object-contain"
              />
            }
          />
          <KpiCard
            title="Revenue ce mois"
            value={fmtTND(kpis.revenueThisMonth.value)}
            sub="Transactions confirmées"
            change={kpis.revenueThisMonth.changePercent}
            trend={kpis.revenueThisMonth.trend}
            gradient="bg-gradient-to-r from-sky-400 to-sky-600"
            icon={
              <img
                src="/images/icons/sales.png"
                alt="Revenue"
                className="h-5 w-5 object-contain"
              />
            }
          />
          <KpiCard
            title="Prix moyen"
            value={fmtTND(kpis.avgPropertyPrice.value)}
            sub={`Portefeuille: ${fmtTND(kpis.avgPropertyPrice.portfolioValue)}`}
            gradient="bg-gradient-to-r from-violet-500 to-violet-700"
            icon={
              <img
                src="/images/icons/profit.png"
                alt="Average Price"
                className="h-5 w-5 object-contain"
              />
            }
          />
        </div>

        {/* ── Section label ───────────────────────────────────────────────── */}
        <SectionLabel>Évolution temporelle</SectionLabel>

        {/* ── Row 1: Time series ─────────────────────────────────────────── */}
        <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
          <ChartCard
            title="Nouvelles annonces & Utilisateurs"
            sub={`Évolution mensuelle — ${data.meta.year}`}
            badge="12 mois"
          >
            <ReactApexChart
              type="area"
              height={250}
              options={{
                ...areaOptions("Annonces", "Utilisateurs", ["#3b82f6", "#14b8a6"]),
              }}
              series={[
                { name: "Annonces", data: timeSeries.newListings },
                { name: "Utilisateurs", data: timeSeries.newUsers },
              ]}
            />
          </ChartCard>

          <ChartCard
            title="Volume de transactions"
            sub={`Montants confirmés — ${data.meta.year}`}
            badge="k TND"
          >
            <ReactApexChart
              type="area"
              height={250}
              options={{
                ...areaOptions("Volume", null, ["#14b8a6"]),
                fill: {
                  type: "gradient",
                  gradient: { type: "vertical", shadeIntensity: 1, opacityFrom: 0.3, opacityTo: 0.02 },
                },
                yaxis: {
                  labels: {
                    style: { fontSize: "10px", colors: "#9ca3af" },
                    formatter: (v) => v >= 1000 ? `${(v / 1000).toFixed(0)}k` : String(v),
                  },
                },
                tooltip: {
                  theme: isDark() ? "dark" : "light",
                  y: { formatter: (v: number) => `${Math.round(v).toLocaleString()} TND` },
                },
              }}
              series={[{ name: "Volume (TND)", data: timeSeries.transactionVolume }]}
            />
          </ChartCard>
        </div>

        {/* ── Section label ───────────────────────────────────────────────── */}
        <SectionLabel>Répartition des propriétés</SectionLabel>

        {/* ── Row 2: Property breakdown ──────────────────────────────────── */}
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          <ChartCard title="Types de propriétés" sub="Répartition du catalogue">
            <ReactApexChart
              type="donut"
              height={250}
              options={donutOptions(
                properties.byType.map((x) => x.label),
                PALETTE,
                "Types"
              )}
              series={properties.byType.map((x) => x.value)}
            />
          </ChartCard>

          <ChartCard title="Statuts des propriétés" sub="État actuel du parc">
            <ReactApexChart
              type="donut"
              height={250}
              options={donutOptions(
                properties.byStatus.map((x) => x.label),
                ["#14b8a6","#f59e0b","#3b82f6","#ef4444","#94a3b8"],
                "Statuts"
              )}
              series={properties.byStatus.map((x) => x.value)}
            />
          </ChartCard>

          <ChartCard title="Vente vs Location" sub="Type de listing">
            <ReactApexChart
              type="donut"
              height={250}
              options={donutOptions(
                properties.byListingType.map((x) => x.label),
                [BI_COLORS[3], BI_COLORS[0]],
                "Listings"
              )}
              series={properties.byListingType.map((x) => x.value)}
            />
          </ChartCard>
        </div>

        {/* ── Section label ───────────────────────────────────────────────── */}
        <SectionLabel>Géographie & Utilisateurs</SectionLabel>

        {/* ── Row 3: Cities + Users ─────────────────────────────────────── */}
        <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
          <ChartCard title="Top villes" sub="Nombre de propriétés par ville" badge="Top 8">
            <ReactApexChart
              type="bar"
              height={270}
              options={{
                ...barOptions(properties.topCities.map((x) => x.city), true, "", CITY_COLS, true),
                plotOptions: {
                  bar: {
                    borderRadius: 5,
                    horizontal: true,
                    barHeight: "58%",
                    distributed: true,
                  },
                },
                xaxis: {
                  categories: properties.topCities.map((x) => x.city),
                  axisBorder: { show: false },
                  axisTicks: { show: false },
                  labels: { style: { fontSize: "10px", colors: "#9ca3af" } },
                },
                tooltip: {
                  theme: isDark() ? "dark" : "light",
                  y: { formatter: (v: number) => `${v} propriétés` },
                },
                dataLabels: {
                  enabled: true,
                  textAnchor: "start",
                  style: { fontSize: "10px", fontWeight: 700, colors: ["#fff"] },
                  formatter: (val: number) => ` ${val}`,
                  offsetX: 0,
                },
              }}
              series={[{ name: "Propriétés", data: properties.topCities.map((x) => x.count) }]}
            />
          </ChartCard>

          <ChartCard title="Répartition des utilisateurs" sub="Par rôle">
            <ReactApexChart
              type="donut"
              height={270}
              options={donutOptions(
                users.byRole.map((x) => x.label),
                [BI_COLORS[0], BI_COLORS[1], BI_COLORS[2], BI_COLORS[3], BI_COLORS[5]],
                "Rôles"
              )}
              series={users.byRole.map((x) => x.value)}
            />
          </ChartCard>
        </div>

        {/* ── Section label ───────────────────────────────────────────────── */}
        <SectionLabel>Transactions & Satisfaction</SectionLabel>

        {/* ── Row 4: Transactions + Ratings ─────────────────────────────── */}
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          <ChartCard title="Types de transactions" sub="SALE vs RENT">
            <ReactApexChart
              type="donut"
              height={230}
              options={donutOptions(
                transactions.byType.map((x) => x.label),
                [BI_COLORS[7], BI_COLORS[0]],
                "Types"
              )}
              series={transactions.byType.map((x) => x.value)}
            />
          </ChartCard>

          <ChartCard title="Statuts des transactions" sub="Répartition des dossiers">
            <ReactApexChart
              type="donut"
              height={230}
              options={donutOptions(
                transactions.byStatus.map((x) => x.label),
                [BI_COLORS[5], BI_COLORS[1], BI_COLORS[2], BI_COLORS[3], BI_COLORS[7]],
                "Statuts"
              )}
              series={transactions.byStatus.map((x) => x.value)}
            />
          </ChartCard>

          <ChartCard
            title="Distribution des avis"
            sub={`Note moyenne ${feedback.avgRating}/5 · ${feedback.total} avis`}
            badge="⭐"
          >
            <ReactApexChart
              type="bar"
              height={230}
              options={{
                chart: { type: "bar", toolbar: { show: false }, background: "transparent", fontFamily: "inherit" },
                plotOptions: { bar: { borderRadius: 6, columnWidth: "48%", distributed: true } },
                colors: RATING_COLS,
                xaxis: {
                  categories: ["★1", "★2", "★3", "★4", "★5"],
                  axisBorder: { show: false },
                  axisTicks: { show: false },
                  labels: { style: { fontSize: "12px", fontWeight: 700, colors: RATING_COLS } },
                },
                yaxis: { labels: { style: { fontSize: "10px", colors: "#9ca3af" } } },
                grid: { borderColor: isDark() ? "#1f2937" : "#f3f4f6", strokeDashArray: 4 },
                legend: { show: false },
                dataLabels: {
                  enabled: true,
                  style: { fontSize: "11px", fontWeight: 700, colors: ["#fff"] },
                  formatter: (v: number) => v > 0 ? String(v) : "",
                },
                tooltip: {
                  theme: isDark() ? "dark" : "light",
                  y: { formatter: (v: number) => `${v} avis` },
                },
                theme: { mode: isDark() ? "dark" : "light" },
              }}
              series={[{ name: "Avis", data: feedback.ratingDistribution.map((x) => x.count) }]}
            />
          </ChartCard>
        </div>

        {/* ── Section label ───────────────────────────────────────────────── */}
        <SectionLabel>Analyse financière</SectionLabel>

        {/* ── Row 5: Price distribution + Revenue by type ────────────────── */}
        <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
          <ChartCard title="Distribution des prix" sub="Fourchettes de prix — TND">
            <ReactApexChart
              type="bar"
              height={250}
              options={{
                ...barOptions(properties.byPriceRange.map((x) => x.label), false, "", PRICE_DIST_COLS, true),
                plotOptions: {
                  bar: {
                    borderRadius: 10,
                    columnWidth: "42%",
                    distributed: true,
                    dataLabels: { position: "top" },
                  },
                },
                fill: { type: "solid", opacity: 1 },
                colors: PRICE_DIST_COLS,
                dataLabels: {
                  enabled: true,
                  offsetY: -6,
                  style: {
                    fontSize: "11px",
                    fontWeight: 800,
                    colors: [isDark() ? "#e5e7eb" : "#334155"],
                  },
                  background: { enabled: false },
                  formatter: (v: number) => (v > 0 ? fmt(v) : ""),
                },
                tooltip: {
                  theme: isDark() ? "dark" : "light",
                  y: { formatter: (v: number) => `${v} propriétés` },
                },
              }}
              series={[{ name: "Propriétés", data: properties.byPriceRange.map((x) => x.value) }]}
            />
          </ChartCard>

          <ChartCard title="Revenue par type" sub="SALE vs RENT — transactions confirmées">
            <ReactApexChart
              type="bar"
              height={250}
              options={{
                chart: { type: "bar", toolbar: { show: false }, background: "transparent", fontFamily: "inherit" },
                plotOptions: { bar: { borderRadius: 8, columnWidth: "35%", distributed: true } },
                colors: [BI_COLORS[5], BI_COLORS[0]],
                xaxis: {
                  categories: transactions.revenueByType.map((x) => x.label),
                  axisBorder: { show: false },
                  axisTicks: { show: false },
                  labels: { style: { fontSize: "12px", fontWeight: 700, colors: "#6b7280" } },
                },
                yaxis: {
                  labels: {
                    style: { fontSize: "10px", colors: "#9ca3af" },
                    formatter: (v: number) => v >= 1_000_000 ? `${(v / 1_000_000).toFixed(1)}M` : v >= 1000 ? `${(v / 1000).toFixed(0)}K` : String(v),
                  },
                },
                grid: { borderColor: isDark() ? "#1f2937" : "#f3f4f6", strokeDashArray: 4 },
                legend: { show: false },
                dataLabels: {
                  enabled: true,
                  style: { fontSize: "10px", fontWeight: 700, colors: ["#fff"] },
                  formatter: (v: number) => v >= 1_000_000 ? `${(v / 1_000_000).toFixed(1)}M` : v >= 1000 ? `${(v / 1000).toFixed(0)}K` : String(v),
                },
                tooltip: {
                  theme: isDark() ? "dark" : "light",
                  y: { formatter: (v: number) => `${Math.round(v).toLocaleString("fr-TN")} TND` },
                },
                theme: { mode: isDark() ? "dark" : "light" },
              }}
              series={[{
                name: "Revenue (TND)",
                data: transactions.revenueByType.map((x) => x.revenue),
              }]}
            />
          </ChartCard>
        </div>

        {/* ── Footer ─────────────────────────────────────────────────────── */}
        <div className="flex items-center justify-center gap-2 rounded-2xl border border-dashed border-slate-200 bg-slate-50/50 px-6 py-4 text-xs text-slate-400 dark:border-slate-800 dark:bg-slate-900/50">
          <span className="h-1.5 w-1.5 rounded-full bg-teal-400" />
          Données temps réel · MongoDB Aggregation Pipelines · SmartProperty BI · {data.meta.year}
        </div>

      </div>
    </>
  );
}

// ─── Section label helper ─────────────────────────────────────────────────────
function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-3">
      <div className="h-px flex-1 bg-gradient-to-r from-transparent to-slate-200 dark:to-slate-800" />
      <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400 dark:text-slate-600">
        {children}
      </span>
      <div className="h-px flex-1 bg-gradient-to-l from-transparent to-slate-200 dark:to-slate-800" />
    </div>
  );
}
