import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import DashboardShell from "../components/DashboardShell";
import api from "../services/api";

const STATUS_OPTIONS = ["open", "in-progress", "escalated", "resolved", "closed"];

const STATUS_CONFIG = {
  open:          { label: "Open",        bg: "bg-slate-500/15 border-slate-500/30",   text: "text-slate-300",   dot: "bg-slate-400" },
  "in-progress": { label: "In Progress", bg: "bg-blue-500/15 border-blue-500/30",    text: "text-blue-300",    dot: "bg-blue-400" },
  escalated:     { label: "Escalated",   bg: "bg-orange-500/15 border-orange-500/30",  text: "text-orange-300",  dot: "bg-orange-400" },
  resolved:      { label: "Resolved",    bg: "bg-emerald-500/15 border-emerald-500/30", text: "text-emerald-300", dot: "bg-emerald-400" },
  closed:        { label: "Closed",      bg: "bg-purple-500/15 border-purple-500/30",  text: "text-purple-300",  dot: "bg-purple-400" },
};

const FILTER_OPTIONS = [
  { value: "", label: "All Department Items" },
  ...STATUS_OPTIONS.map((s) => ({ value: s, label: STATUS_CONFIG[s].label })),
];

const ESCALATION_LABELS = ["Standard", "Dept Level 1", "Admin Escalated"];

export default function DepartmentDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("");
  const [stats, setStats] = useState({ total: 0, open: 0, inProgress: 0, escalated: 0, resolved: 0 });

  const fetchComplaints = useCallback(async () => {
    setLoading(true);
    try {
      const params = {};
      if (filter) params.status = filter;
      const { data } = await api.get("/complaints", { params });
      setComplaints(data);

      if (!filter) {
        setStats({
          total: data.length,
          open: data.filter((c) => c.status === "open").length,
          inProgress: data.filter((c) => c.status === "in-progress").length,
          escalated: data.filter((c) => c.status === "escalated").length,
          resolved: data.filter((c) => ["resolved", "closed"].includes(c.status)).length,
        });
      }
    } catch (err) {
      console.error("Failed to fetch department complaints:", err.message);
    } finally {
      setLoading(false);
    }
  }, [filter]);

  useEffect(() => {
    fetchComplaints();
  }, [fetchComplaints]);

  const handleStatusChange = async (id, newStatus) => {
    try {
      await api.put(`/complaints/${id}/status`, { status: newStatus });
      fetchComplaints();
    } catch (err) {
      console.error("Status update failed:", err.message);
    }
  };

  return (
    <DashboardShell>
      <div className="animate-fade-in-up space-y-8">
        {/* ── Department Hero Banner ─────────────────────────────────── */}
        <div className="relative overflow-hidden rounded-3xl border border-white/15 bg-gradient-to-r from-indigo-950/60 via-blue-950/50 to-slate-900/90 p-8 shadow-2xl backdrop-blur-xl">
          <div className="pointer-events-none absolute -right-10 -top-10 h-64 w-64 rounded-full bg-brand-500/10 blur-3xl" />
          <div className="relative z-10 flex flex-wrap items-center justify-between gap-4">
            <div>
              <span className="inline-flex items-center gap-2 rounded-full border border-indigo-400/30 bg-indigo-500/10 px-3 py-1 text-xs font-bold uppercase tracking-wider text-indigo-300">
                🏢 Department Staff Dashboard
              </span>
              <h1 className="mt-3 text-3xl font-black tracking-tight text-white sm:text-4xl">
                {user?.department?.name ? `${user.department.name} Department` : "Department Console"}
              </h1>
              <p className="mt-2 max-w-xl text-sm leading-relaxed text-indigo-200/80 sm:text-base">
                Manage routed student grievances, track SLA compliance deadlines, update resolution statuses, and prevent administrative escalations.
              </p>
            </div>
            <button
              onClick={fetchComplaints}
              className="flex cursor-pointer items-center gap-2 rounded-xl border border-white/15 bg-white/5 px-4 py-2.5 text-xs font-bold text-white transition hover:bg-white/10"
            >
              <span>🔄</span>
              <span>Refresh Queue</span>
            </button>
          </div>
        </div>

        {/* ── Metric Cards ───────────────────────────────────────────── */}
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {[
            { title: "Assigned Total", value: stats.total, gradient: "from-indigo-500 to-brand-500", glow: "border-indigo-500/20 bg-indigo-500/10" },
            { title: "Open & Pending", value: stats.open, gradient: "from-sky-400 to-blue-500", glow: "border-sky-500/20 bg-sky-500/10" },
            { title: "Escalated to Higher Authority", value: stats.escalated, gradient: "from-red-500 to-rose-600", glow: "border-red-500/20 bg-red-500/10" },
            { title: "Resolved Successfully", value: stats.resolved, gradient: "from-emerald-400 to-teal-500", glow: "border-emerald-500/20 bg-emerald-500/10" },
          ].map((card) => (
            <div
              key={card.title}
              className={`rounded-2xl border p-6 shadow-xl backdrop-blur-xl transition-all duration-300 hover:scale-[1.02] ${card.glow}`}
            >
              <p className="text-xs font-bold uppercase tracking-wider text-surface-200/70">{card.title}</p>
              <p className={`mt-3 bg-gradient-to-r ${card.gradient} bg-clip-text text-4xl font-black text-transparent`}>
                {card.value}
              </p>
            </div>
          ))}
        </div>

        {/* ── Complaints Queue ───────────────────────────────────────── */}
        <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-[#080d20]/80 p-7 shadow-2xl backdrop-blur-xl">
          <div className="mb-6 flex flex-wrap items-center justify-between gap-4 border-b border-white/10 pb-5">
            <div>
              <h2 className="text-xl font-extrabold tracking-tight text-white">Department Queue</h2>
              <p className="text-xs text-surface-200/60 mt-0.5">Complaints assigned for verification and resolution</p>
            </div>

            {/* Filter Pills */}
            <div className="flex flex-wrap gap-1 rounded-2xl bg-black/40 p-1 border border-white/10">
              {FILTER_OPTIONS.map((f) => (
                <button
                  key={f.value}
                  onClick={() => setFilter(f.value)}
                  className={`cursor-pointer rounded-xl px-3 py-1.5 text-xs font-bold transition-all duration-200 ${
                    filter === f.value
                      ? "bg-gradient-to-r from-brand-600 to-indigo-600 text-white shadow-md shadow-brand-500/25"
                      : "text-surface-200/60 hover:text-white"
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>
          </div>

          {loading ? (
            <div className="flex flex-col items-center justify-center py-20">
              <div className="h-9 w-9 animate-spin rounded-full border-3 border-brand-500 border-t-transparent" />
              <p className="mt-3 text-xs font-semibold text-surface-200/50">Fetching assigned complaints...</p>
            </div>
          ) : complaints.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white/5 text-2xl border border-white/10">
                🎉
              </div>
              <p className="mt-4 text-sm font-bold text-white">No pending items in queue</p>
              <p className="mt-1 text-xs text-surface-200/50">All complaints in this department have been handled.</p>
            </div>
          ) : (
            <div className="space-y-3.5">
              {complaints.map((c) => {
                const cfg = STATUS_CONFIG[c.status] || STATUS_CONFIG.open;
                const escalationLabel = ESCALATION_LABELS[c.escalationLevel] || `Level ${c.escalationLevel}`;
                return (
                  <div
                    key={c._id}
                    className="group rounded-2xl border border-white/5 bg-white/[0.02] p-5 transition-all duration-200 hover:border-brand-500/30 hover:bg-brand-500/[0.03]"
                  >
                    <div className="flex flex-wrap items-start justify-between gap-4">
                      {/* Left: Title + Metadata */}
                      <div className="min-w-0 flex-1">
                        <button
                          onClick={() => navigate(`/complaints/${c._id}`)}
                          className="cursor-pointer text-left text-base font-bold text-white transition hover:text-brand-300 block"
                        >
                          {c.title}
                        </button>
                        <div className="mt-2 flex flex-wrap items-center gap-2.5 text-xs text-surface-200/60">
                          <span className="font-semibold text-brand-400">{c.category || "Uncategorized"}</span>
                          <span>·</span>
                          <span>{formatDate(c.createdAt)}</span>
                          <span>·</span>
                          <UrgencyBadge urgency={c.urgency} />
                          {c.escalationLevel > 0 && (
                            <span className="rounded-full border border-red-500/30 bg-red-500/15 px-2.5 py-0.5 text-[11px] font-bold text-red-300">
                              ⚡ {escalationLabel}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Right: Inline Status Changer & Inspector */}
                      <div className="flex items-center gap-2.5">
                        <select
                          value={c.status}
                          onChange={(e) => handleStatusChange(c._id, e.target.value)}
                          className={`cursor-pointer rounded-full border px-3.5 py-1.5 text-xs font-bold outline-none transition ${cfg.bg} ${cfg.text}`}
                        >
                          {STATUS_OPTIONS.map((s) => (
                            <option key={s} value={s} className="bg-surface-900 text-white font-medium">
                              {STATUS_CONFIG[s].label}
                            </option>
                          ))}
                        </select>
                        <button
                          onClick={() => navigate(`/complaints/${c._id}`)}
                          title="Inspect full complaint details"
                          className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-lg bg-white/5 text-surface-200/40 transition hover:bg-brand-500/20 hover:text-brand-300"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                          </svg>
                        </button>
                      </div>
                    </div>

                    {/* SLA countdown indicator bar */}
                    {c.slaDeadline && (
                      <div className="mt-3 border-t border-white/5 pt-3">
                        <SlaIndicator deadline={c.slaDeadline} status={c.status} />
                      </div>
                    )}
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

function UrgencyBadge({ urgency }) {
  const map = {
    low:      "bg-slate-500/15 text-slate-300 border-slate-500/30",
    medium:   "bg-blue-500/15 text-blue-300 border-blue-500/30",
    high:     "bg-orange-500/15 text-orange-300 border-orange-500/30",
    critical: "bg-red-500/15 text-red-300 border-red-500/30",
  };
  return (
    <span className={`inline-block rounded-full border px-2.5 py-0.5 text-[11px] font-bold capitalize ${map[urgency] || map.medium}`}>
      {urgency || "medium"}
    </span>
  );
}

function SlaIndicator({ deadline, status }) {
  if (["resolved", "closed"].includes(status)) {
    return (
      <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-400">
        <span>✓</span>
        <span>Resolved within SLA window ({formatDate(deadline)})</span>
      </span>
    );
  }
  const now = new Date();
  const dl = new Date(deadline);
  const hoursLeft = (dl - now) / (1000 * 60 * 60);
  const overdue = hoursLeft < 0;

  return (
    <span className={`inline-flex items-center gap-1.5 text-xs font-semibold ${overdue ? "text-red-400" : hoursLeft < 12 ? "text-orange-400" : "text-surface-200/60"}`}>
      <span>{overdue ? "⚠️" : "⏱"}</span>
      <span>
        {overdue
          ? `Overdue by ${Math.abs(Math.round(hoursLeft))}h`
          : `${Math.round(hoursLeft)}h remaining until SLA breach`}
        {" · Deadline: "}
        {formatDate(deadline)}
      </span>
    </span>
  );
}

function formatDate(dateStr) {
  if (!dateStr) return "";
  return new Date(dateStr).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}