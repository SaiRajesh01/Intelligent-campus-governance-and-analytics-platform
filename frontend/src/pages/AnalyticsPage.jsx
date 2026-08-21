import { useState, useEffect } from "react";
import {
  PieChart, Pie, Cell, Tooltip as ReTooltip,
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  LineChart, Line,
  ResponsiveContainer,
} from "recharts";
import DashboardShell from "../components/DashboardShell";
import api from "../services/api";

const COLORS = [
  "#6366f1", "#ec4899", "#f59e0b", "#10b981",
  "#3b82f6", "#8b5cf6", "#14b8a6", "#ef4444",
];

const CHART_CARD = "relative overflow-hidden rounded-3xl border border-white/10 bg-[#080d20]/80 p-7 shadow-2xl backdrop-blur-xl transition-all duration-300 hover:border-brand-500/20";

export default function AnalyticsPage() {
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
      const [sumRes, lbRes, trRes] = await Promise.all([
        api.get("/analytics/summary"),
        api.get("/analytics/leaderboard"),
        api.get(`/analytics/trends?period=${trendPeriod}&window=4`),
      ]);
      setSummary(sumRes.data);
      setLeaderboard(lbRes.data);
      setTrends(trRes.data);
    } catch (err) {
      console.error("Analytics fetch failed:", err.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <DashboardShell>
        <div className="flex flex-col items-center justify-center py-24">
          <div className="h-10 w-10 animate-spin rounded-full border-3 border-brand-500 border-t-transparent" />
          <p className="mt-4 text-xs font-semibold text-surface-200/50">Aggregating campus intelligence...</p>
        </div>
      </DashboardShell>
    );
  }

  const categoryData = summary?.byCategory || [];
  const deptData = summary?.byDepartment?.map((d) => ({
    name: d.departmentName,
    count: d.count,
  })) || [];

  const timelineData = trends?.timeline?.map((t) => ({
    label: t.period.month
      ? `${monthName(t.period.month)} ${t.period.year}`
      : `W${t.period.week} ${t.period.year}`,
    count: t.count,
  })) || [];

  const leaderboardData = leaderboard.map((d) => ({
    name: d.departmentName,
    score: d.gamificationScore,
    resolution: +(d.resolutionRate * 100).toFixed(1),
    sla: +(d.slaCompliance * 100).toFixed(1),
    avgHours: d.avgResolutionHours,
  }));

  return (
    <DashboardShell>
      <div className="animate-fade-in-up space-y-8">
        {/* ── Banner ─────────────────────────────────────────────────── */}
        <div className="relative overflow-hidden rounded-3xl border border-white/15 bg-gradient-to-r from-indigo-950/70 via-brand-950/50 to-slate-900/90 p-8 shadow-2xl backdrop-blur-xl">
          <div className="pointer-events-none absolute -right-10 -top-10 h-64 w-64 rounded-full bg-brand-500/10 blur-3xl" />
          <div className="relative z-10 flex flex-wrap items-center justify-between gap-4">
            <div>
              <span className="inline-flex items-center gap-2 rounded-full border border-indigo-400/30 bg-indigo-500/10 px-3 py-1 text-xs font-bold uppercase tracking-wider text-indigo-300">
                📊 Campus Intelligence & Analytics
              </span>
              <h1 className="mt-3 text-3xl font-black tracking-tight text-white sm:text-4xl">
                Analytics & Insights
              </h1>
              <p className="mt-2 max-w-xl text-sm leading-relaxed text-indigo-200/80 sm:text-base">
                Real-time grievance metrics, departmental performance leaderboards, and AI-predicted issue volumes.
              </p>
            </div>
            <button
              onClick={fetchAll}
              className="flex cursor-pointer items-center gap-2 rounded-xl border border-white/15 bg-white/5 px-4 py-2.5 text-xs font-bold text-white transition hover:bg-white/10"
            >
              <span>🔄</span>
              <span>Re-calculate Metrics</span>
            </button>
          </div>
        </div>

        {/* ── Summary Stats ──────────────────────────────────────────── */}
        {summary && (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-5">
            {[
              { title: "Total Volume", value: summary.total, gradient: "from-indigo-500 to-brand-500", glow: "border-indigo-500/20 bg-indigo-500/10" },
              { title: "Open Unassigned", value: summary.open, gradient: "from-slate-400 to-slate-600", glow: "border-slate-500/20 bg-slate-500/10" },
              { title: "In Progress", value: summary["in-progress"] || 0, gradient: "from-blue-400 to-cyan-500", glow: "border-blue-500/20 bg-blue-500/10" },
              { title: "Escalated", value: summary.escalated, gradient: "from-orange-500 to-red-500", glow: "border-orange-500/20 bg-orange-500/10" },
              { title: "Resolved", value: summary.resolved, gradient: "from-emerald-400 to-teal-500", glow: "border-emerald-500/20 bg-emerald-500/10" },
            ].map((card) => (
              <div key={card.title} className={`rounded-2xl border p-5 shadow-xl backdrop-blur-xl transition-all duration-300 hover:scale-[1.02] ${card.glow}`}>
                <p className="text-[11px] font-bold uppercase tracking-wider text-surface-200/70">{card.title}</p>
                <p className={`mt-2 bg-gradient-to-r ${card.gradient} bg-clip-text text-3xl font-black text-transparent`}>
                  {card.value}
                </p>
              </div>
            ))}
          </div>
        )}

        {/* ── Charts Row 1: Category & Department ────────────────────── */}
        <div className="grid gap-8 lg:grid-cols-2">
          {/* Pie: Complaints by Category */}
          <div className={CHART_CARD}>
            <h2 className="mb-4 text-sm font-extrabold uppercase tracking-wider text-white">
              Complaints by Category
            </h2>
            {categoryData.length === 0 ? (
              <EmptyChart />
            ) : (
              <ResponsiveContainer width="100%" height={280}>
                <PieChart>
                  <Pie
                    data={categoryData}
                    dataKey="count"
                    nameKey="category"
                    cx="50%"
                    cy="50%"
                    outerRadius={95}
                    innerRadius={50}
                    paddingAngle={4}
                    label={({ category, percent }) => `${category} (${(percent * 100).toFixed(0)}%)`}
                    labelLine={false}
                  >
                    {categoryData.map((_, i) => (
                      <Cell key={i} fill={COLORS[i % COLORS.length]} />
                    ))}
                  </Pie>
                  <ReTooltip contentStyle={tooltipStyle} />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>

          {/* Bar: Complaints by Department */}
          <div className={CHART_CARD}>
            <h2 className="mb-4 text-sm font-extrabold uppercase tracking-wider text-white">
              Complaints by Department
            </h2>
            {deptData.length === 0 ? (
              <EmptyChart />
            ) : (
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={deptData} layout="vertical" margin={{ left: 10 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
                  <XAxis type="number" tick={{ fill: "#94a3b8", fontSize: 11 }} />
                  <YAxis dataKey="name" type="category" width={90} tick={{ fill: "#94a3b8", fontSize: 11 }} />
                  <ReTooltip contentStyle={tooltipStyle} />
                  <Bar dataKey="count" fill="#6366f1" radius={[0, 8, 8, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* ── Charts Row 2: Volume Trend & AI Prediction ─────────────── */}
        <div className={CHART_CARD}>
          <div className="mb-4 flex flex-wrap items-center justify-between gap-4">
            <div>
              <h2 className="text-sm font-extrabold uppercase tracking-wider text-white">
                Complaint Volume Trend & Forecasting
              </h2>
              <p className="text-xs text-surface-200/50 mt-0.5">Historical submission timeline across campus</p>
            </div>
            <div className="flex gap-1 rounded-2xl bg-black/40 p-1 border border-white/10">
              {["month", "week"].map((p) => (
                <button
                  key={p}
                  onClick={() => setTrendPeriod(p)}
                  className={`cursor-pointer rounded-xl px-3.5 py-1.5 text-xs font-bold capitalize transition ${
                    trendPeriod === p
                      ? "bg-gradient-to-r from-brand-600 to-indigo-600 text-white shadow-md shadow-brand-500/25"
                      : "text-surface-200/60 hover:text-white"
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
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
                <XAxis dataKey="label" tick={{ fill: "#94a3b8", fontSize: 11 }} />
                <YAxis tick={{ fill: "#94a3b8", fontSize: 11 }} />
                <ReTooltip contentStyle={tooltipStyle} />
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
            <div className="mt-5 rounded-2xl border border-brand-500/30 bg-gradient-to-r from-brand-500/10 via-indigo-500/5 to-transparent p-4">
              <div className="flex items-center justify-between">
                <p className="text-xs font-bold uppercase tracking-wider text-brand-300">
                  📈 Moving Average Forecast
                </p>
                <span className="rounded-full bg-brand-500/20 border border-brand-500/30 px-2.5 py-0.5 text-[10px] font-bold text-brand-300">
                  AI Estimate
                </span>
              </div>
              <p className="mt-2 text-2xl font-black text-white">
                ~{trends.prediction.predictedNextPeriodTotal} <span className="text-xs font-medium text-surface-200/60">predicted complaints next {trendPeriod}</span>
              </p>
              <p className="mt-1 text-[11px] text-surface-200/40">
                {trends.prediction.note}
              </p>
            </div>
          )}
        </div>

        {/* ── Department Leaderboard ──────────────────────────────────── */}
        <div className="grid gap-8 lg:grid-cols-2">
          {/* Gamification Bar Chart */}
          <div className={CHART_CARD}>
            <h2 className="mb-4 text-sm font-extrabold uppercase tracking-wider text-white">
              Department Performance Leaderboard 🏆
            </h2>
            {leaderboardData.length === 0 ? (
              <EmptyChart />
            ) : (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={leaderboardData} layout="vertical" margin={{ left: 10 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
                  <XAxis type="number" domain={[0, 100]} tick={{ fill: "#94a3b8", fontSize: 11 }} />
                  <YAxis dataKey="name" type="category" width={90} tick={{ fill: "#94a3b8", fontSize: 11 }} />
                  <ReTooltip contentStyle={tooltipStyle} />
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
          <div className={CHART_CARD}>
            <h2 className="mb-4 text-sm font-extrabold uppercase tracking-wider text-white">
              SLA Compliance & Resolution Breakdown
            </h2>
            {leaderboardData.length === 0 ? (
              <EmptyChart />
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead>
                    <tr className="border-b border-white/10 text-xs font-bold uppercase tracking-wider text-surface-200/50">
                      <th className="px-3 py-2.5">Rank</th>
                      <th className="px-3 py-2.5">Dept</th>
                      <th className="px-3 py-2.5">Resolution</th>
                      <th className="px-3 py-2.5">SLA Speed</th>
                      <th className="px-3 py-2.5 font-black text-white">Score</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {leaderboardData.map((d, i) => (
                      <tr key={d.name} className="transition hover:bg-white/[0.02]">
                        <td className="px-3 py-3">
                          <RankBadge rank={i + 1} />
                        </td>
                        <td className="px-3 py-3 font-bold text-white">{d.name}</td>
                        <td className="px-3 py-3">
                          <PercentBar value={d.resolution} color="bg-emerald-500" />
                        </td>
                        <td className="px-3 py-3">
                          <PercentBar value={d.sla} color="bg-indigo-500" />
                        </td>
                        <td className="px-3 py-3 font-black text-brand-300">{d.score}</td>
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
    <div className="flex h-44 items-center justify-center text-xs font-semibold text-surface-200/40">
      No data available yet
    </div>
  );
}

function RankBadge({ rank }) {
  const medals = { 1: "🥇", 2: "🥈", 3: "🥉" };
  if (medals[rank]) return <span className="text-xl">{medals[rank]}</span>;
  return <span className="text-xs font-bold text-surface-200/50">#{rank}</span>;
}

function PercentBar({ value, color }) {
  return (
    <div className="flex items-center gap-2">
      <div className="h-2 w-16 rounded-full bg-white/10 overflow-hidden">
        <div
          className={`h-full rounded-full ${color}`}
          style={{ width: `${Math.min(value, 100)}%` }}
        />
      </div>
      <span className="text-xs font-bold text-surface-200/70">{value}%</span>
    </div>
  );
}

const tooltipStyle = {
  backgroundColor: "#0b132b",
  border: "1px solid rgba(255,255,255,0.15)",
  borderRadius: "14px",
  color: "#f1f5f9",
  fontSize: "12px",
  boxShadow: "0 10px 25px rgba(0,0,0,0.5)",
};

function monthName(num) {
  return ["", "Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"][num] || "";
}