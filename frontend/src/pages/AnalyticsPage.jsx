import { useState, useEffect } from "react";
import {
  PieChart, Pie, Cell, Tooltip as ReTooltip,
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  LineChart, Line,
  ResponsiveContainer,
} from "recharts";
import DashboardShell from "../components/DashboardShell";
import { useTheme, useDashboardTheme } from "../context/ThemeContext";
import api from "../services/api";

const COLORS = [
  "#6366f1", "#ec4899", "#f59e0b", "#10b981",
  "#3b82f6", "#8b5cf6", "#14b8a6", "#ef4444",
];

export default function AnalyticsPage() {
  const d = useDashboardTheme();
  const { lightMode } = useTheme();
  const [summary, setSummary] = useState(null);
  const [leaderboard, setLeaderboard] = useState([]);
  const [trends, setTrends] = useState(null);
  const [trendPeriod, setTrendPeriod] = useState("month");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAll();
  }, [trendPeriod]);

  const fetchAll = async () => {
    setLoading(true);
    try {
      const [sumRes, leadRes, trendRes] = await Promise.allSettled([
        api.get("/analytics/summary"),
        api.get("/analytics/leaderboard"),
        api.get("/analytics/trends", { params: { period: trendPeriod } }),
      ]);
      if (sumRes.status === "fulfilled") setSummary(sumRes.value.data);
      if (leadRes.status === "fulfilled") setLeaderboard(leadRes.value.data);
      if (trendRes.status === "fulfilled") setTrends(trendRes.value.data);
    } catch (err) {
      console.error("Failed to load analytics:", err);
    } finally {
      setLoading(false);
    }
  };

  if (loading && !summary) {
    return (
      <DashboardShell>
        <div className="flex h-96 flex-col items-center justify-center">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-brand-500 border-t-transparent" />
          <p className={`mt-4 text-xs font-semibold ${d.textMuted}`}>Aggregating campus intelligence...</p>
        </div>
      </DashboardShell>
    );
  }

  // Prep charts
  const categoryData = (summary?.byCategory || []).map((c) => ({
    name: c._id || "Other",
    value: c.count || 0,
  }));

  const deptData = (summary?.byDepartment || []).map((dept) => ({
    name: dept.departmentName || dept.name || "General",
    count: dept.count || 0,
  }));

  const timelineData = (trends?.timeline || []).map((t) => {
    const periodObj = t.period || t._id || {};
    const year = periodObj.year || new Date().getFullYear();
    const month = periodObj.month;
    const week = periodObj.week;
    const label =
      trendPeriod === "month"
        ? (month ? `${monthName(month)} '${String(year).slice(-2)}` : `${year}`)
        : `Wk ${week || 1}, ${year}`;
    return { label, count: t.count || 0 };
  });

  const leaderboardData = (Array.isArray(leaderboard) ? leaderboard : []).map((dItem) => {
    const resRate = dItem.resolutionRate ?? 0;
    const slaRate = dItem.slaCompliance ?? dItem.slaComplianceRate ?? 0;
    return {
      name: dItem.departmentName || dItem.department?.name || dItem.name || "General",
      score: dItem.gamificationScore ?? dItem.score ?? 0,
      resolution: Math.round(resRate <= 1 ? resRate * 100 : resRate),
      sla: Math.round(slaRate <= 1 ? slaRate * 100 : slaRate),
      total: dItem.totalComplaints || 0,
      resolved: dItem.resolvedCount ?? dItem.resolvedComplaints ?? 0,
    };
  });

  return (
    <DashboardShell>
      <div className="animate-fade-in-up space-y-8">
        {/* ── Banner ─────────────────────────────────────────────────── */}
        <div className={`relative overflow-hidden rounded-3xl border p-8 shadow-2xl backdrop-blur-xl transition-colors duration-500 ${d.bannerBg}`}>
          <div className="pointer-events-none absolute -right-10 -top-10 h-64 w-64 rounded-full bg-brand-500/10 blur-3xl" />
          <div className="relative z-10 flex flex-wrap items-center justify-between gap-4">
            <div>
              <span className={`inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-bold uppercase tracking-wider ${d.bannerPill}`}>
                📊 Campus Intelligence & Analytics
              </span>
              <h1 className={`mt-3 text-3xl font-black tracking-tight sm:text-4xl ${d.bannerHeading}`}>
                Analytics & Insights
              </h1>
              <p className={`mt-2 max-w-xl text-sm leading-relaxed sm:text-base ${d.bannerSub}`}>
                Real-time grievance metrics, departmental performance leaderboards, and AI-predicted issue volumes.
              </p>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={fetchAll}
                className={`flex cursor-pointer items-center gap-2 rounded-xl border px-4 py-2.5 text-xs font-bold transition shadow-sm ${d.btnSecondary}`}
              >
                <span>🔄</span>
                <span>Re-calculate Metrics</span>
              </button>
            </div>
          </div>
        </div>

        {/* ── High-Level Metric Tiles ────────────────────────────────── */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          {[
            { title: "Total Volume", value: summary?.total ?? 0, color: "text-indigo-500", bg: lightMode ? "border-indigo-200 bg-indigo-50/70" : "border-indigo-500/20 bg-indigo-500/10" },
            { title: "Open Unassigned", value: summary?.open ?? 0, color: "text-blue-500", bg: lightMode ? "border-blue-200 bg-blue-50/70" : "border-blue-500/20 bg-blue-500/10" },
            { title: "In Progress", value: summary?.["in-progress"] ?? summary?.inProgress ?? 0, color: "text-sky-500", bg: lightMode ? "border-sky-200 bg-sky-50/70" : "border-sky-500/20 bg-sky-500/10" },
            { title: "Escalated", value: summary?.escalated ?? 0, color: "text-orange-500", bg: lightMode ? "border-orange-200 bg-orange-50/70" : "border-orange-500/20 bg-orange-500/10" },
            { title: "Resolved", value: summary?.resolved ?? 0, color: "text-emerald-500", bg: lightMode ? "border-emerald-200 bg-emerald-50/70" : "border-emerald-500/20 bg-emerald-500/10" },
          ].map((card) => (
            <div
              key={card.title}
              className={`rounded-2xl border p-5 shadow-lg backdrop-blur-xl transition-all duration-300 hover:scale-[1.02] ${card.bg}`}
            >
              <p className={`text-[11px] font-bold uppercase tracking-wider ${d.cardLabel}`}>{card.title}</p>
              <p className={`mt-3 text-3xl font-black ${card.color}`}>{card.value}</p>
            </div>
          ))}
        </div>

        {/* ── Category Breakdown & Department Load ───────────────────── */}
        <div className="grid gap-8 lg:grid-cols-2">
          {/* Pie Chart: Complaints by Category */}
          <div className={`relative overflow-hidden rounded-3xl border p-7 backdrop-blur-xl transition-all duration-300 hover:border-brand-500/20 ${d.panelBg}`}>
            <h2 className={`mb-4 text-sm font-extrabold uppercase tracking-wider ${d.panelHeading}`}>
              Complaints by Category
            </h2>
            {categoryData.length === 0 ? (
              <EmptyChart />
            ) : (
              <ResponsiveContainer width="100%" height={280}>
                <PieChart>
                  <Pie
                    data={categoryData}
                    cx="50%"
                    cy="50%"
                    innerRadius={65}
                    outerRadius={105}
                    paddingAngle={3}
                    dataKey="value"
                    label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                    labelLine={false}
                  >
                    {categoryData.map((_, i) => (
                      <Cell key={i} fill={COLORS[i % COLORS.length]} />
                    ))}
                  </Pie>
                  <ReTooltip contentStyle={d.chartTooltip} />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>

          {/* Bar Chart: Complaints by Department */}
          <div className={`relative overflow-hidden rounded-3xl border p-7 backdrop-blur-xl transition-all duration-300 hover:border-brand-500/20 ${d.panelBg}`}>
            <h2 className={`mb-4 text-sm font-extrabold uppercase tracking-wider ${d.panelHeading}`}>
              Complaints by Department
            </h2>
            {deptData.length === 0 ? (
              <EmptyChart />
            ) : (
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={deptData} layout="vertical" margin={{ left: 10 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke={d.chartGrid} />
                  <XAxis type="number" tick={{ fill: d.chartAxis, fontSize: 11 }} />
                  <YAxis dataKey="name" type="category" width={90} tick={{ fill: d.chartAxis, fontSize: 11 }} />
                  <ReTooltip contentStyle={d.chartTooltip} />
                  <Bar dataKey="count" name="Complaints" fill="#818cf8" radius={[0, 6, 6, 0]}>
                    {deptData.map((_, i) => (
                      <Cell key={i} fill={COLORS[i % COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* ── Trends Timeline Chart ──────────────────────────────────── */}
        <div className={`relative overflow-hidden rounded-3xl border p-7 backdrop-blur-xl transition-all duration-300 hover:border-brand-500/20 ${d.panelBg}`}>
          <div className="mb-4 flex flex-wrap items-center justify-between gap-4">
            <div>
              <h2 className={`text-sm font-extrabold uppercase tracking-wider ${d.panelHeading}`}>
                Complaint Volume Trend & Forecasting
              </h2>
              <p className={`text-xs mt-0.5 ${d.panelSub}`}>Historical submission timeline across campus</p>
            </div>
            <div className={`flex gap-1 rounded-2xl p-1 border ${d.filterBg}`}>
              {["month", "week"].map((p) => (
                <button
                  key={p}
                  onClick={() => setTrendPeriod(p)}
                  className={`cursor-pointer rounded-xl px-3.5 py-1.5 text-xs font-bold capitalize transition ${
                    trendPeriod === p ? d.filterActive : d.filterInactive
                  }`}
                >
                  {p}
                </button>
              ))}
            </div>
          </div>

          {timelineData.length === 0 ? (
            <EmptyChart />
          ) : (
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={timelineData}>
                <CartesianGrid strokeDasharray="3 3" stroke={d.chartGrid} />
                <XAxis dataKey="label" tick={{ fill: d.chartAxis, fontSize: 11 }} />
                <YAxis tick={{ fill: d.chartAxis, fontSize: 11 }} />
                <ReTooltip contentStyle={d.chartTooltip} />
                <Line
                  type="monotone"
                  dataKey="count"
                  stroke="#818cf8"
                  strokeWidth={3}
                  dot={{ r: 5, fill: "#6366f1" }}
                  activeDot={{ r: 7 }}
                />
              </LineChart>
            </ResponsiveContainer>
          )}

          {/* Prediction Box */}
          {trends?.prediction?.predictedNextPeriodTotal != null && (
            <div className={`mt-5 rounded-2xl border p-4 ${lightMode ? "border-brand-200 bg-brand-50/60" : "border-brand-500/30 bg-gradient-to-r from-brand-500/10 via-indigo-500/5 to-transparent"}`}>
              <div className="flex items-center justify-between">
                <p className={`text-xs font-bold uppercase tracking-wider ${lightMode ? "text-brand-700" : "text-brand-300"}`}>
                  📈 Moving Average Forecast
                </p>
                <span className={`rounded-full border px-2.5 py-0.5 text-[10px] font-bold ${lightMode ? "bg-brand-100 border-brand-300 text-brand-700" : "bg-brand-500/20 border-brand-500/30 text-brand-300"}`}>
                  AI Estimate
                </span>
              </div>
              <p className={`mt-2 text-2xl font-black ${d.textPrimary}`}>
                ~{trends.prediction.predictedNextPeriodTotal} <span className={`text-xs font-medium ${d.textSecondary}`}>predicted complaints next {trendPeriod}</span>
              </p>
              <p className={`mt-1 text-[11px] ${d.textMuted}`}>
                {trends.prediction.note}
              </p>
            </div>
          )}
        </div>

        {/* ── Department Leaderboard ──────────────────────────────────── */}
        <div className="grid gap-8 lg:grid-cols-2">
          {/* Gamification Bar Chart */}
          <div className={`relative overflow-hidden rounded-3xl border p-7 backdrop-blur-xl transition-all duration-300 hover:border-brand-500/20 ${d.panelBg}`}>
            <h2 className={`mb-4 text-sm font-extrabold uppercase tracking-wider ${d.panelHeading}`}>
              Department Performance Leaderboard 🏆
            </h2>
            {leaderboardData.length === 0 ? (
              <EmptyChart />
            ) : (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={leaderboardData} layout="vertical" margin={{ left: 10 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke={d.chartGrid} />
                  <XAxis type="number" domain={[0, 100]} tick={{ fill: d.chartAxis, fontSize: 11 }} />
                  <YAxis dataKey="name" type="category" width={90} tick={{ fill: d.chartAxis, fontSize: 11 }} />
                  <ReTooltip contentStyle={d.chartTooltip} />
                  <Bar dataKey="score" name="Score" fill="#6366f1" radius={[0, 8, 8, 0]}>
                    {leaderboardData.map((entry, i) => (
                      <Cell key={i} fill={i === 0 ? "#facc15" : i === 1 ? "#94a3b8" : i === 2 ? "#cd7f32" : "#6366f1"} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>

          {/* SLA Table */}
          <div className={`relative overflow-hidden rounded-3xl border p-7 backdrop-blur-xl transition-all duration-300 hover:border-brand-500/20 ${d.panelBg}`}>
            <h2 className={`mb-4 text-sm font-extrabold uppercase tracking-wider ${d.panelHeading}`}>
              SLA Compliance & Resolution Breakdown
            </h2>
            {leaderboardData.length === 0 ? (
              <EmptyChart />
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead>
                    <tr className={`border-b text-xs font-bold uppercase tracking-wider ${d.tableBorder} ${d.tableHeaderText}`}>
                      <th className="px-3 py-2.5">Rank</th>
                      <th className="px-3 py-2.5">Dept</th>
                      <th className="px-3 py-2.5">Resolution</th>
                      <th className="px-3 py-2.5">SLA Speed</th>
                      <th className={`px-3 py-2.5 font-black ${d.textPrimary}`}>Score</th>
                    </tr>
                  </thead>
                  <tbody className={`divide-y ${d.tableBorder}`}>
                    {leaderboardData.map((item, i) => (
                      <tr key={item.name} className={`transition ${d.tableRowHover}`}>
                        <td className="px-3 py-3">
                          <RankBadge rank={i + 1} lightMode={lightMode} />
                        </td>
                        <td className={`px-3 py-3 font-bold ${d.textPrimary}`}>{item.name}</td>
                        <td className="px-3 py-3">
                          <PercentBar value={item.resolution} color="bg-emerald-500" lightMode={lightMode} />
                        </td>
                        <td className="px-3 py-3">
                          <PercentBar value={item.sla} color="bg-indigo-500" lightMode={lightMode} />
                        </td>
                        <td className="px-3 py-3 font-black text-brand-600">{item.score}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </DashboardShell>
  );
}

function EmptyChart() {
  return (
    <div className="flex h-44 items-center justify-center text-xs font-semibold text-slate-400">
      No data available yet
    </div>
  );
}

function RankBadge({ rank, lightMode }) {
  const medals = { 1: "🥇", 2: "🥈", 3: "🥉" };
  if (medals[rank]) return <span className="text-xl">{medals[rank]}</span>;
  return <span className={`text-xs font-bold ${lightMode ? "text-slate-500" : "text-surface-200/50"}`}>#{rank}</span>;
}

function PercentBar({ value, color, lightMode }) {
  const num = typeof value === "number" ? value : 0;
  return (
    <div className="flex items-center gap-2">
      <div className={`h-2 w-16 rounded-full overflow-hidden ${lightMode ? "bg-slate-200" : "bg-white/10"}`}>
        <div
          className={`h-full rounded-full ${color}`}
          style={{ width: `${Math.min(Math.max(num, 0), 100)}%` }}
        />
      </div>
      <span className={`text-xs font-bold ${lightMode ? "text-slate-700" : "text-surface-200/70"}`}>{num}%</span>
    </div>
  );
}

function monthName(num) {
  return ["", "Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"][num] || "";
}
