import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import DashboardShell from "../components/DashboardShell";
import api from "../services/api";

const STATUS_OPTIONS = ["open", "in-progress", "escalated", "resolved", "closed"];

const STATUS_CONFIG = {
  open:          { label: "Open",        bg: "bg-slate-500/15",   text: "text-slate-300",   dot: "bg-slate-400" },
  "in-progress": { label: "In Progress", bg: "bg-blue-500/15",    text: "text-blue-300",    dot: "bg-blue-400" },
  escalated:     { label: "Escalated",   bg: "bg-orange-500/15",  text: "text-orange-300",  dot: "bg-orange-400" },
  resolved:      { label: "Resolved",    bg: "bg-emerald-500/15", text: "text-emerald-300", dot: "bg-emerald-400" },
  closed:        { label: "Closed",      bg: "bg-purple-500/15",  text: "text-purple-300",  dot: "bg-purple-400" },
};

const FILTER_OPTIONS = [
  { value: "", label: "All" },
  ...STATUS_OPTIONS.map((s) => ({ value: s, label: STATUS_CONFIG[s].label })),
];

// Escalation level labels
const ESCALATION_LABELS = ["None", "Dept Head", "Admin"];

export default function DepartmentDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("");

  // Stat counters
  const [stats, setStats] = useState({ total: 0, open: 0, inProgress: 0, escalated: 0, resolved: 0 });

  const fetchComplaints = useCallback(async () => {
    setLoading(true);
    try {
      const params = {};
      if (filter) params.status = filter;
      const { data } = await api.get("/complaints", { params });
      setComplaints(data);

      // Compute stats from the full unfiltered list
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
      console.error("Failed to fetch complaints:", err.message);
    } finally {
      setLoading(false);
    }
  }, [filter]);

  useEffect(() => {
    fetchComplaints();
  }, [fetchComplaints]);

  // Also fetch unfiltered stats once on mount
  useEffect(() => {
    (async () => {
      try {
        const { data } = await api.get("/complaints");
        setStats({
          total: data.length,
          open: data.filter((c) => c.status === "open").length,
          inProgress: data.filter((c) => c.status === "in-progress").length,
          escalated: data.filter((c) => c.status === "escalated").length,
          resolved: data.filter((c) => ["resolved", "closed"].includes(c.status)).length,
        });
      } catch { /* ignore */ }
    })();
  }, []);

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
      <div className="animate-fade-in-up">
        <h1 className="text-2xl font-bold text-white">Department Dashboard 🏢</h1>
        <p className="mt-1 text-surface-200/70">
          Welcome, {user?.name || "Head"} — Manage your department&apos;s complaints and SLA compliance.
        </p>

        {/* ── Stat cards ─────────────────────────────────────────────── */}
        <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {[
            { title: "Total", value: stats.total, color: "from-brand-500 to-brand-700" },
            { title: "Open", value: stats.open, color: "from-sky-500 to-cyan-600" },
            { title: "Escalated", value: stats.escalated, color: "from-red-500 to-rose-600" },
            { title: "Resolved", value: stats.resolved, color: "from-emerald-500 to-green-600" },
          ].map((card) => (
            <div key={card.title} className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-xl">
              <p className="text-sm font-medium text-surface-200/60">{card.title}</p>
              <p className={`mt-2 bg-gradient-to-r ${card.color} bg-clip-text text-3xl font-extrabold text-transparent`}>
                {card.value}
              </p>
            </div>
          ))}
        </div>

        {/* ── Complaints table ───────────────────────────────────────── */}
        <div className="mt-8 rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-xl">
          <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
            <h2 className="text-lg font-bold text-white">Department Complaints</h2>
            <div className="flex gap-1 rounded-xl bg-surface-900/60 p-1">
              {FILTER_OPTIONS.map((f) => (
                <button
                  key={f.value}
                  onClick={() => setFilter(f.value)}
                  className={`cursor-pointer rounded-lg px-3 py-1.5 text-xs font-medium transition ${
                    filter === f.value
                      ? "bg-brand-500/20 text-brand-300"
                      : "text-surface-200/50 hover:text-white"
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>
          </div>

          {loading ? (
            <div className="flex justify-center py-12">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-brand-500 border-t-transparent" />
            </div>
          ) : complaints.length === 0 ? (
            <div className="py-12 text-center text-sm text-surface-200/40">
              No complaints found.
            </div>
          ) : (
            <div className="space-y-3">
              {complaints.map((c) => {
                const cfg = STATUS_CONFIG[c.status] || STATUS_CONFIG.open;
                const escalationLabel = ESCALATION_LABELS[c.escalationLevel] || `Level ${c.escalationLevel}`;
                return (
                  <div
                    key={c._id}
                    className="group rounded-xl border border-white/5 bg-white/[0.02] p-4 transition hover:border-brand-500/20 hover:bg-white/5"
                  >
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      {/* Left: title + meta */}
                      <div className="min-w-0 flex-1">
                        <button
                          onClick={() => navigate(`/complaints/${c._id}`)}
                          className="cursor-pointer text-left text-sm font-semibold text-white transition hover:text-brand-300"
                        >
                          {c.title}
                        </button>
                        <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-surface-200/50">
                          <span>{c.category || "Uncategorized"}</span>
                          <span>·</span>
                          <span>{formatDate(c.createdAt)}</span>
                          <span>·</span>
                          <UrgencyBadge urgency={c.urgency} />
                          {c.escalationLevel > 0 && (
                            <>
                              <span>·</span>
                              <span className="rounded-full bg-red-500/10 px-2 py-0.5 text-[11px] font-medium text-red-400">
                                ⚡ Escalation: {escalationLabel}
                              </span>
                            </>
                          )}
                        </div>
                      </div>

                      {/* Right: status dropdown + view */}
                      <div className="flex items-center gap-2">
                        <select
                          value={c.status}
                          onChange={(e) => handleStatusChange(c._id, e.target.value)}
                          className={`cursor-pointer rounded-full border-0 px-2.5 py-1 text-xs font-medium outline-none ${cfg.bg} ${cfg.text}`}
                        >
                          {STATUS_OPTIONS.map((s) => (
                            <option key={s} value={s} className="bg-surface-900 text-white">
                              {STATUS_CONFIG[s].label}
                            </option>
                          ))}
                        </select>
                        <button
                          onClick={() => navigate(`/complaints/${c._id}`)}
                          className="cursor-pointer rounded-lg p-1.5 text-surface-200/30 transition hover:bg-white/10 hover:text-brand-400"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                          </svg>
                        </button>
                      </div>
                    </div>

                    {/* SLA indicator */}
                    {c.slaDeadline && (
                      <div className="mt-2">
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
    low:      "bg-slate-500/15 text-slate-300",
    medium:   "bg-blue-500/15 text-blue-300",
    high:     "bg-orange-500/15 text-orange-300",
    critical: "bg-red-500/15 text-red-300",
  };
  return (
    <span className={`rounded-full px-2 py-0.5 text-[11px] font-medium capitalize ${map[urgency] || map.medium}`}>
      {urgency || "medium"}
    </span>
  );
}

function SlaIndicator({ deadline, status }) {
  if (["resolved", "closed"].includes(status)) {
    return (
      <span className="text-[11px] text-emerald-400/60">
        ✓ SLA: {formatDate(deadline)}
      </span>
    );
  }
  const now = new Date();
  const dl = new Date(deadline);
  const hoursLeft = (dl - now) / (1000 * 60 * 60);
  const overdue = hoursLeft < 0;

  return (
    <span className={`text-[11px] font-medium ${overdue ? "text-red-400" : hoursLeft < 12 ? "text-orange-400" : "text-surface-200/40"}`}>
      {overdue
        ? `⚠ Overdue by ${Math.abs(Math.round(hoursLeft))}h`
        : `⏱ ${Math.round(hoursLeft)}h remaining`}
      {" · SLA: "}
      {formatDate(deadline)}
    </span>
  );
}

function formatDate(dateStr) {
  if (!dateStr) return "";
  return new Date(dateStr).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}
