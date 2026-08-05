import { useState, useEffect } from "react";
import {
  PieChart, Pie, Cell, Tooltip as ReTooltip,
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  LineChart, Line,
  ResponsiveContainer, Legend,
} from "recharts";
import DashboardShell from "../components/DashboardShell";
import api from "../services/api";

// ── Color palette for charts ────────────────────────────────────────────
const COLORS = [
  "#818cf8", "#f472b6", "#fb923c", "#34d399",
  "#60a5fa", "#facc15", "#a78bfa", "#f87171",
];

const CHART_CARD = "rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-xl";

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
        <div className="flex justify-center py-20">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-brand-500 border-t-transparent" />
        </div>
      </DashboardShell>
    );
  }

  // ── Data transforms ────────────────────────────────────────────────────
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
      <div className="animate-fade-in-up">
        <h1 className="text-2xl font-bold text-white">Analytics & Insights 📊</h1>
        <p className="mt-1 text-surface-200/70">
          System-wide analytics, department leaderboard, and complaint trends.
        </p>

        {/* ── Summary cards ───────────────────────────────────────────── */}
        {summary && (
          <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-5">
            {[
              { title: "Total", value: summary.total, color: "from-brand-500 to-brand-700" },
              { title: "Open", value: summary.open, color: "from-slate-400 to-slate-600" },
              { title: "In Progress", value: summary["in-progress"] || 0, color: "from-blue-500 to-cyan-600" },
              { title: "Escalated", value: summary.escalated, color: "from-orange-500 to-red-600" },
              { title: "Resolved", value: summary.resolved, color: "from-emerald-500 to-green-600" },
            ].map((card) => (
              <div key={card.title} className="rounded-2xl border border-white/10 bg-white/5 p-5 backdrop-blur-xl">
                <p className="text-xs font-medium text-surface-200/50">{card.title}</p>
                <p className={`mt-1 bg-gradient-to-r ${card.color} bg-clip-text text-2xl font-extrabold text-transparent`}>
                  {card.value}
                </p>
              </div>
            ))}
          </div>
        )}

        {/* ── Charts row 1: By Category (Pie) + By Department (Bar) ── */}
        <div className="mt-8 grid gap-6 lg:grid-cols-2">
          {/* Pie: Complaints by Category */}
          <div className={CHART_CARD}>
            <h2 className="mb-4 text-sm font-bold uppercase tracking-wider text-surface-200/50">
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
                    outerRadius={100}
                    innerRadius={50}
                    paddingAngle={3}
                    label={({ category, percent }) =>
                      `${category} (${(percent * 100).toFixed(0)}%)`
                    }
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
            <h2 className="mb-4 text-sm font-bold uppercase tracking-wider text-surface-200/50">
              Complaints by Department
            </h2>
            {deptData.length === 0 ? (
              <EmptyChart />
            ) : (
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={deptData} layout="vertical" margin={{ left: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                  <XAxis type="number" tick={{ fill: "#94a3b8", fontSize: 11 }} />
                  <YAxis dataKey="name" type="category" width={100} tick={{ fill: "#94a3b8", fontSize: 11 }} />
                  <ReTooltip contentStyle={tooltipStyle} />
                  <Bar dataKey="count" fill="#818cf8" radius={[0, 6, 6, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* ── Charts row 2: Trend line + Prediction ──────────────────── */}
        <div className="mt-6">
          <div className={CHART_CARD}>
            <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
              <h2 className="text-sm font-bold uppercase tracking-wider text-surface-200/50">
                Complaint Volume Trend
              </h2>
              <div className="flex gap-1 rounded-xl bg-surface-900/60 p-1">
                {["month", "week"].map((p) => (
                  <button
                    key={p}
                    onClick={() => setTrendPeriod(p)}
                    className={`cursor-pointer rounded-lg px-3 py-1.5 text-xs font-medium capitalize transition ${
                      trendPeriod === p
                        ? "bg-brand-500/20 text-brand-300"
                        : "text-surface-200/50 hover:text-white"
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
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                  <XAxis dataKey="label" tick={{ fill: "#94a3b8", fontSize: 11 }} />
                  <YAxis tick={{ fill: "#94a3b8", fontSize: 11 }} />
                  <ReTooltip contentStyle={tooltipStyle} />
                  <Line
                    type="monotone"
                    dataKey="count"
                    stroke="#818cf8"
                    strokeWidth={2.5}
                    dot={{ r: 4, fill: "#818cf8" }}
                    activeDot={{ r: 6 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            )}

            {/* Prediction callout */}
            {trends?.prediction?.predictedNextPeriodTotal != null && (
              <div className="mt-4 rounded-xl border border-brand-500/20 bg-brand-500/5 px-4 py-3">
                <p className="text-xs font-semibold text-brand-300">
                  📈 Predicted next {trendPeriod} volume:{" "}
                  <span className="text-lg font-extrabold text-white">
                    {trends.prediction.predictedNextPeriodTotal}
                  </span>
                </p>
                <p className="mt-0.5 text-[11px] text-surface-200/40">
                  {trends.prediction.note}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* ── Department Leaderboard ──────────────────────────────────── */}
        <div className="mt-6 grid gap-6 lg:grid-cols-2">
          {/* Gamification score bar chart */}
          <div className={CHART_CARD}>
            <h2 className="mb-4 text-sm font-bold uppercase tracking-wider text-surface-200/50">
              Department Leaderboard 🏆
            </h2>
            {leaderboardData.length === 0 ? (
              <EmptyChart />
            ) : (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={leaderboardData} layout="vertical" margin={{ left: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                  <XAxis type="number" domain={[0, 100]} tick={{ fill: "#94a3b8", fontSize: 11 }} />
                  <YAxis dataKey="name" type="category" width={110} tick={{ fill: "#94a3b8", fontSize: 11 }} />
                  <ReTooltip contentStyle={tooltipStyle} />
                  <Bar dataKey="score" name="Score" fill="#818cf8" radius={[0, 6, 6, 0]}>
                    {leaderboardData.map((entry, i) => (
                      <Cell key={i} fill={i === 0 ? "#facc15" : i === 1 ? "#94a3b8" : i === 2 ? "#cd7f32" : "#818cf8"} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>

          {/* SLA compliance + resolution rate table */}
          <div className={CHART_CARD}>
            <h2 className="mb-4 text-sm font-bold uppercase tracking-wider text-surface-200/50">
              SLA Compliance & Resolution Rate
            </h2>
            {leaderboardData.length === 0 ? (
              <EmptyChart />
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead>
                    <tr className="border-b border-white/10 text-xs uppercase tracking-wider text-surface-200/40">
                      <th className="px-3 py-2">#</th>
                      <th className="px-3 py-2">Department</th>
                      <th className="px-3 py-2">Resolution %</th>
                      <th className="px-3 py-2">SLA %</th>
                      <th className="px-3 py-2">Avg Hours</th>
                      <th className="px-3 py-2">Score</th>
                    </tr>
                  </thead>
                  <tbody>
                    {leaderboardData.map((d, i) => (
                      <tr key={d.name} className="border-b border-white/5 transition hover:bg-white/[0.03]">
                        <td className="px-3 py-2.5">
                          <RankBadge rank={i + 1} />
                        </td>
                        <td className="px-3 py-2.5 font-medium text-white">{d.name}</td>
                        <td className="px-3 py-2.5">
                          <PercentBar value={d.resolution} color="bg-emerald-500" />
                        </td>
                        <td className="px-3 py-2.5">
                          <PercentBar value={d.sla} color="bg-brand-500" />
                        </td>
                        <td className="px-3 py-2.5 text-surface-200/60">
                          {d.avgHours != null ? `${d.avgHours}h` : "—"}
                        </td>
                        <td className="px-3 py-2.5 font-bold text-white">{d.score}</td>
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

// ── Helper components ───────────────────────────────────────────────────

function EmptyChart() {
  return (
    <div className="flex h-40 items-center justify-center text-sm text-surface-200/30">
      No data available yet
    </div>
  );
}

function RankBadge({ rank }) {
  const medals = { 1: "🥇", 2: "🥈", 3: "🥉" };
  if (medals[rank]) return <span className="text-lg">{medals[rank]}</span>;
  return <span className="text-xs text-surface-200/40">#{rank}</span>;
}

function PercentBar({ value, color }) {
  return (
    <div className="flex items-center gap-2">
      <div className="h-1.5 w-16 rounded-full bg-white/10">
        <div
          className={`h-full rounded-full ${color}`}
          style={{ width: `${Math.min(value, 100)}%` }}
        />
      </div>
      <span className="text-xs text-surface-200/60">{value}%</span>
    </div>
  );
}

const tooltipStyle = {
  backgroundColor: "#1e293b",
  border: "1px solid rgba(255,255,255,0.1)",
  borderRadius: "12px",
  color: "#e2e8f0",
  fontSize: "12px",
};

function monthName(num) {
  return ["", "Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"][num] || "";
}
