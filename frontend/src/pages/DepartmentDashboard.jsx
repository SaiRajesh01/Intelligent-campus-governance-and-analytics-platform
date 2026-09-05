import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import DashboardShell from "../components/DashboardShell";
import { useTheme, useDashboardTheme } from "../context/ThemeContext";
import api from "../services/api";

const STATUS_OPTIONS = ["open", "in-progress", "escalated", "resolved", "closed"];

const STATUS_CONFIG_DARK = {
  open:          { label: "Open",        bg: "bg-slate-500/15 border-slate-500/30",   text: "text-slate-300",   dot: "bg-slate-400" },
  "in-progress": { label: "In Progress", bg: "bg-blue-500/15 border-blue-500/30",    text: "text-blue-300",    dot: "bg-blue-400" },
  escalated:     { label: "Escalated",   bg: "bg-orange-500/15 border-orange-500/30",  text: "text-orange-300",  dot: "bg-orange-400" },
  resolved:      { label: "Resolved",    bg: "bg-emerald-500/15 border-emerald-500/30", text: "text-emerald-300", dot: "bg-emerald-400" },
  closed:        { label: "Closed",      bg: "bg-purple-500/15 border-purple-500/30",  text: "text-purple-300",  dot: "bg-purple-400" },
};

const STATUS_CONFIG_LIGHT = {
  open:          { label: "Open",        bg: "bg-slate-100 border-slate-300",         text: "text-slate-700",   dot: "bg-slate-500" },
  "in-progress": { label: "In Progress", bg: "bg-blue-50 border-blue-200",            text: "text-blue-700",    dot: "bg-blue-500" },
  escalated:     { label: "Escalated",   bg: "bg-orange-50 border-orange-200",        text: "text-orange-700",  dot: "bg-orange-500" },
  resolved:      { label: "Resolved",    bg: "bg-emerald-50 border-emerald-200",      text: "text-emerald-700", dot: "bg-emerald-500" },
  closed:        { label: "Closed",      bg: "bg-purple-50 border-purple-200",        text: "text-purple-700",  dot: "bg-purple-500" },
};

const FILTER_OPTIONS = [
  { value: "", label: "All Department Items" },
  { value: "open", label: "Open" },
  { value: "in-progress", label: "In Progress" },
  { value: "escalated", label: "Escalated" },
  { value: "resolved", label: "Resolved" },
  { value: "closed", label: "Closed" },
];

const ESCALATION_LABELS = ["Standard", "Dept Level 1", "Admin Escalated"];

export default function DepartmentDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const d = useDashboardTheme();
  const { lightMode } = useTheme();

  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("");
  const [statusUpdating, setStatusUpdating] = useState(null);

  const statusConfig = lightMode ? STATUS_CONFIG_LIGHT : STATUS_CONFIG_DARK;

  const fetchDepartmentComplaints = useCallback(async () => {
    setLoading(true);
    try {
      const params = {};
      if (filter) params.status = filter;
      const { data } = await api.get("/complaints", { params });
      setComplaints(data);
    } catch (err) {
      console.error("Failed to fetch department complaints:", err.message);
    } finally {
      setLoading(false);
    }
  }, [filter]);

  useEffect(() => {
    fetchDepartmentComplaints();
  }, [fetchDepartmentComplaints]);

  const handleStatusChange = async (id, newStatus) => {
    setStatusUpdating(id);
    try {
      const { data } = await api.put(`/complaints/${id}/status`, { status: newStatus });
      setComplaints((prev) => prev.map((c) => (c._id === id ? data : c)));
    } catch (err) {
      console.error("Failed to update status:", err.message);
    } finally {
      setStatusUpdating(null);
    }
  };

  const openCount = complaints.filter((c) => c.status === "open").length;
  const inProgressCount = complaints.filter((c) => c.status === "in-progress").length;
  const escalatedCount = complaints.filter((c) => c.status === "escalated").length;
  const resolvedCount = complaints.filter((c) => c.status === "resolved" || c.status === "closed").length;

  return (
    <DashboardShell>
      <div className="animate-fade-in-up space-y-8">
        {/* ── Banner ─────────────────────────────────────────────────── */}
        <div className={`relative overflow-hidden rounded-3xl border p-8 shadow-2xl backdrop-blur-xl transition-colors duration-500 ${d.bannerBg}`}>
          <div className="pointer-events-none absolute -right-10 -top-10 h-64 w-64 rounded-full bg-brand-500/10 blur-3xl" />
          <div className="relative z-10 flex flex-wrap items-center justify-between gap-4">
            <div>
              <span className={`inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-bold uppercase tracking-wider ${d.bannerPill}`}>
                🏢 {user?.department?.name || "Department"} Operations
              </span>
              <h1 className={`mt-3 text-3xl font-black tracking-tight sm:text-4xl ${d.bannerHeading}`}>
                Department Incident Queue
              </h1>
              <p className={`mt-2 max-w-xl text-sm leading-relaxed sm:text-base ${d.bannerSub}`}>
                Live intake queue for your unit: inspect assigned complaints, update progress statuses, resolve student issues, and prevent SLA breaches.
              </p>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={fetchDepartmentComplaints}
                className={`flex cursor-pointer items-center gap-2 rounded-xl border px-4 py-2.5 text-xs font-bold transition shadow-sm ${d.btnSecondary}`}
              >
                <span>🔄</span>
                <span>Refresh Live Queue</span>
              </button>
            </div>
          </div>
        </div>

        {/* ── Metric Cards ───────────────────────────────────────────── */}
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {[
            {
              title: "Active Open",
              value: openCount,
              gradient: "from-blue-500 to-indigo-600",
              borderGlow: lightMode ? "border-blue-200 bg-blue-50/70" : "border-blue-500/20 bg-blue-500/10",
              label: "Unacknowledged queue items",
              icon: "📥",
            },
            {
              title: "In Progress",
              value: inProgressCount,
              gradient: "from-brand-500 to-indigo-600",
              borderGlow: lightMode ? "border-brand-200 bg-brand-50/70" : "border-brand-500/20 bg-brand-500/10",
              label: "Under active investigation",
              icon: "🔄",
            },
            {
              title: "Escalated",
              value: escalatedCount,
              gradient: "from-amber-500 to-red-500",
              borderGlow: lightMode ? "border-amber-200 bg-amber-50/70" : "border-amber-500/20 bg-amber-500/10",
              label: "Critical SLA thresholds passed",
              icon: "⚡",
            },
            {
              title: "Resolved & Closed",
              value: resolvedCount,
              gradient: "from-emerald-500 to-teal-600",
              borderGlow: lightMode ? "border-emerald-200 bg-emerald-50/70" : "border-emerald-500/20 bg-emerald-500/10",
              label: "Resolved within department",
              icon: "✓",
            },
          ].map((card) => (
            <div
              key={card.title}
              className={`group relative overflow-hidden rounded-2xl border p-6 shadow-xl backdrop-blur-xl transition-all duration-300 hover:scale-[1.02] ${card.borderGlow}`}
            >
              <div className="flex items-center justify-between">
                <p className={`text-xs font-bold uppercase tracking-wider ${d.cardLabel}`}>{card.title}</p>
                <span className={`flex h-9 w-9 items-center justify-center rounded-xl text-lg ${d.cardIcon}`}>
                  {card.icon}
                </span>
              </div>
              <p className={`mt-4 bg-gradient-to-r ${card.gradient} bg-clip-text text-4xl font-black text-transparent`}>
                {card.value}
              </p>
              <p className={`mt-2 text-xs ${d.cardMeta}`}>{card.label}</p>
            </div>
          ))}
        </div>

        {/* ── Queue Management Card ──────────────────────────────────── */}
        <div className={`relative overflow-hidden rounded-3xl border p-7 backdrop-blur-xl transition-colors duration-500 ${d.panelBg}`}>
          {/* Toolbar */}
          <div className={`mb-6 flex flex-wrap items-center justify-between gap-4 border-b ${d.tableBorder} pb-5`}>
            <div>
              <h2 className={`text-xl font-extrabold tracking-tight ${d.panelHeading}`}>Assigned Department Queue</h2>
              <p className={`text-xs mt-0.5 ${d.panelSub}`}>Complaints assigned for verification and resolution</p>
            </div>

            {/* Filter Pills */}
            <div className={`flex flex-wrap gap-1 rounded-2xl p-1 border ${d.filterBg}`}>
              {FILTER_OPTIONS.map((f) => (
                <button
                  key={f.value}
                  onClick={() => setFilter(f.value)}
                  className={`cursor-pointer rounded-xl px-3 py-1.5 text-xs font-bold transition-all duration-200 ${
                    filter === f.value ? d.filterActive : d.filterInactive
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>
          </div>

          {/* Incident List */}
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20">
              <div className="h-9 w-9 animate-spin rounded-full border-3 border-brand-500 border-t-transparent" />
              <p className={`mt-3 text-xs font-semibold ${d.textMuted}`}>Fetching assigned complaints...</p>
            </div>
          ) : complaints.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <div className={`flex h-14 w-14 items-center justify-center rounded-2xl text-2xl ${d.emptyIcon}`}>
                🎉
              </div>
              <p className={`mt-4 text-sm font-bold ${d.emptyText}`}>No pending items in queue</p>
              <p className={`mt-1 text-xs ${d.emptySub}`}>All complaints in this department have been handled.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {complaints.map((c) => {
                const cfg = statusConfig[c.status] || statusConfig.open;
                return (
                  <div
                    key={c._id}
                    className={`group flex flex-col gap-4 rounded-2xl border p-5 transition-all duration-200 sm:flex-row sm:items-center sm:justify-between ${d.listItemBg}`}
                  >
                    {/* Left: Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <UrgencyBadge urgency={c.urgency} lightMode={lightMode} />
                        <span className={`text-xs font-bold ${d.textMuted}`}>
                          #{c._id?.slice(-6)?.toUpperCase()}
                        </span>
                        {c.escalationLevel > 0 && (
                          <span className="rounded-full bg-red-500/15 border border-red-500/30 px-2 py-0.5 text-[10px] font-black text-red-500">
                            ⚡ {ESCALATION_LABELS[c.escalationLevel] || "Escalated"}
                          </span>
                        )}
                      </div>

                      <button
                        onClick={() => navigate(`/complaints/${c._id}`)}
                        className={`mt-2 cursor-pointer text-left text-base font-bold transition block ${d.listTitle}`}
                      >
                        {c.title}
                      </button>

                      <div className={`mt-2 flex flex-wrap items-center gap-2.5 text-xs ${d.listMeta}`}>
                        <span>📁 {c.category || "General"}</span>
                        <span>•</span>
                        <span>👤 {c.isAnonymous ? "Anonymous" : c.submittedBy?.name || "Student"}</span>
                        <span>•</span>
                        <span>📅 {formatDate(c.createdAt)}</span>
                        <span>•</span>
                        <SlaCountdown deadline={c.slaDeadline} lightMode={lightMode} />
                      </div>
                    </div>

                    {/* Right: Actions */}
                    <div className="flex items-center gap-3 self-end sm:self-center">
                      <select
                        value={c.status}
                        onChange={(e) => handleStatusChange(c._id, e.target.value)}
                        disabled={statusUpdating === c._id}
                        className={`cursor-pointer rounded-full border px-3 py-1.5 text-xs font-bold outline-none transition ${cfg.bg} ${cfg.text}`}
                      >
                        {STATUS_OPTIONS.map((s) => (
                          <option key={s} value={s} className={d.selectOption}>
                            {statusConfig[s].label}
                          </option>
                        ))}
                      </select>

                      <button
                        onClick={() => navigate(`/complaints/${c._id}`)}
                        title="Open Details"
                        className={`flex h-8 w-8 cursor-pointer items-center justify-center rounded-lg transition ${d.listArrow}`}
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                        </svg>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </DashboardShell>
  );
}

function UrgencyBadge({ urgency, lightMode }) {
  const mapDark = {
    low:      "bg-slate-500/15 text-slate-300 border-slate-500/30",
    medium:   "bg-blue-500/15 text-blue-300 border-blue-500/30",
    high:     "bg-orange-500/15 text-orange-300 border-orange-500/30",
    critical: "bg-red-500/15 text-red-300 border-red-500/30",
  };
  const mapLight = {
    low:      "bg-slate-100 text-slate-700 border-slate-300",
    medium:   "bg-blue-50 text-blue-700 border-blue-200",
    high:     "bg-orange-50 text-orange-700 border-orange-200",
    critical: "bg-red-50 text-red-700 border-red-200",
  };
  const map = lightMode ? mapLight : mapDark;
  return (
    <span className={`inline-block rounded-full border px-2.5 py-0.5 text-[11px] font-bold capitalize ${map[urgency] || map.medium}`}>
      {urgency || "medium"}
    </span>
  );
}

function SlaCountdown({ deadline, lightMode }) {
  if (!deadline) return null;
  const now = new Date();
  const end = new Date(deadline);
  const diffMs = end - now;
  const hoursLeft = Math.round(diffMs / (1000 * 60 * 60));
  const overdue = diffMs < 0;

  return (
    <span className={`inline-flex items-center gap-1.5 text-xs font-semibold ${overdue ? "text-red-500" : hoursLeft < 12 ? "text-orange-500" : lightMode ? "text-slate-500" : "text-surface-200/60"}`}>
      <span className={`h-1.5 w-1.5 rounded-full ${overdue ? "bg-red-500 animate-pulse" : hoursLeft < 12 ? "bg-orange-500" : "bg-emerald-500"}`} />
      {overdue ? "SLA Overdue" : `${hoursLeft}h SLA left`}
    </span>
  );
}

function formatDate(dateStr) {
  if (!dateStr) return "";
  return new Date(dateStr).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}
