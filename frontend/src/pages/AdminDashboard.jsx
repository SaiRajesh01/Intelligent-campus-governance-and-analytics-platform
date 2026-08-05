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

export default function AdminDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("");
  const [selected, setSelected] = useState(new Set());
  const [bulkStatus, setBulkStatus] = useState("");
  const [bulkLoading, setBulkLoading] = useState(false);
  const [summary, setSummary] = useState(null);

  const fetchComplaints = useCallback(async () => {
    setLoading(true);
    try {
      const params = {};
      if (filter) params.status = filter;
      const { data } = await api.get("/complaints", { params });
      setComplaints(data);
    } catch (err) {
      console.error("Failed to fetch complaints:", err.message);
    } finally {
      setLoading(false);
    }
  }, [filter]);

  const fetchSummary = useCallback(async () => {
    try {
      const { data } = await api.get("/analytics/summary");
      setSummary(data);
    } catch {
      // silently fail — cards just show fallback
    }
  }, []);

  useEffect(() => {
    fetchComplaints();
    fetchSummary();
  }, [fetchComplaints, fetchSummary]);

  // ── Selection helpers ─────────────────────────────────────────────────
  const toggleSelect = (id) => {
    setSelected((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const toggleSelectAll = () => {
    if (selected.size === complaints.length) {
      setSelected(new Set());
    } else {
      setSelected(new Set(complaints.map((c) => c._id)));
    }
  };

  // ── Bulk status update ────────────────────────────────────────────────
  const handleBulkUpdate = async () => {
    if (!bulkStatus || selected.size === 0) return;
    setBulkLoading(true);
    try {
      const promises = [...selected].map((id) =>
        api.put(`/complaints/${id}/status`, { status: bulkStatus })
      );
      await Promise.all(promises);
      setSelected(new Set());
      setBulkStatus("");
      fetchComplaints();
      fetchSummary();
    } catch (err) {
      console.error("Bulk update failed:", err.message);
    } finally {
      setBulkLoading(false);
    }
  };

  // ── Delete complaint ──────────────────────────────────────────────────
  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this complaint?")) return;
    try {
      await api.delete(`/complaints/${id}`);
      fetchComplaints();
      fetchSummary();
    } catch (err) {
      console.error("Delete failed:", err.message);
    }
  };

  // ── Single status update ──────────────────────────────────────────────
  const handleStatusChange = async (id, newStatus) => {
    try {
      await api.put(`/complaints/${id}/status`, { status: newStatus });
      fetchComplaints();
      fetchSummary();
    } catch (err) {
      console.error("Status update failed:", err.message);
    }
  };

  return (
    <DashboardShell>
      <div className="animate-fade-in-up">
        <h1 className="text-2xl font-bold text-white">Admin Dashboard ⚙️</h1>
        <p className="mt-1 text-surface-200/70">
          Welcome, {user?.name || "Admin"} — Full system overview and complaint management.
        </p>

        {/* ── Stat cards ─────────────────────────────────────────────── */}
        <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {[
            { title: "Total Complaints", value: summary?.total ?? "—", color: "from-brand-500 to-brand-700" },
            { title: "Open / Escalated", value: summary ? `${summary.open + summary.escalated}` : "—", color: "from-amber-500 to-orange-600" },
            { title: "Avg Resolution", value: summary?.averageResolutionTime ? `${summary.averageResolutionTime.hours}h` : "—", color: "from-sky-500 to-cyan-600" },
            { title: "Resolved", value: summary?.resolved ?? "—", color: "from-emerald-500 to-green-600" },
          ].map((card) => (
            <div key={card.title} className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-xl">
              <p className="text-sm font-medium text-surface-200/60">{card.title}</p>
              <p className={`mt-2 bg-gradient-to-r ${card.color} bg-clip-text text-3xl font-extrabold text-transparent`}>
                {card.value}
              </p>
            </div>
          ))}
        </div>

        {/* ── Complaint table ────────────────────────────────────────── */}
        <div className="mt-8 rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-xl">
          {/* Toolbar */}
          <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
            <h2 className="text-lg font-bold text-white">All Complaints</h2>

            <div className="flex flex-wrap items-center gap-3">
              {/* Filter pills */}
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

              {/* Bulk actions */}
              {selected.size > 0 && (
                <div className="flex items-center gap-2">
                  <span className="text-xs text-surface-200/50">{selected.size} selected</span>
                  <select
                    value={bulkStatus}
                    onChange={(e) => setBulkStatus(e.target.value)}
                    className="cursor-pointer rounded-lg border border-white/10 bg-surface-900 px-3 py-1.5 text-xs text-white outline-none"
                  >
                    <option value="">Set status…</option>
                    {STATUS_OPTIONS.map((s) => (
                      <option key={s} value={s}>{STATUS_CONFIG[s].label}</option>
                    ))}
                  </select>
                  <button
                    onClick={handleBulkUpdate}
                    disabled={!bulkStatus || bulkLoading}
                    className="cursor-pointer rounded-lg bg-brand-600 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-brand-500 disabled:opacity-50"
                  >
                    {bulkLoading ? "Updating…" : "Apply"}
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Table */}
          {loading ? (
            <div className="flex justify-center py-12">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-brand-500 border-t-transparent" />
            </div>
          ) : complaints.length === 0 ? (
            <div className="py-12 text-center text-sm text-surface-200/40">
              No complaints found.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-white/10 text-xs uppercase tracking-wider text-surface-200/40">
                    <th className="px-3 py-3">
                      <input
                        type="checkbox"
                        checked={selected.size === complaints.length && complaints.length > 0}
                        onChange={toggleSelectAll}
                        className="cursor-pointer accent-brand-500"
                      />
                    </th>
                    <th className="px-3 py-3">Title</th>
                    <th className="px-3 py-3">Category</th>
                    <th className="px-3 py-3">Department</th>
                    <th className="px-3 py-3">Urgency</th>
                    <th className="px-3 py-3">Status</th>
                    <th className="px-3 py-3">Submitted By</th>
                    <th className="px-3 py-3">Date</th>
                    <th className="px-3 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {complaints.map((c) => {
                    const cfg = STATUS_CONFIG[c.status] || STATUS_CONFIG.open;
                    return (
                      <tr
                        key={c._id}
                        className="border-b border-white/5 transition hover:bg-white/[0.03]"
                      >
                        {/* Checkbox */}
                        <td className="px-3 py-3">
                          <input
                            type="checkbox"
                            checked={selected.has(c._id)}
                            onChange={() => toggleSelect(c._id)}
                            className="cursor-pointer accent-brand-500"
                          />
                        </td>

                        {/* Title — clickable */}
                        <td className="max-w-[200px] px-3 py-3">
                          <button
                            onClick={() => navigate(`/complaints/${c._id}`)}
                            className="cursor-pointer truncate text-left font-medium text-white transition hover:text-brand-300"
                          >
                            {c.title}
                          </button>
                        </td>

                        {/* Category */}
                        <td className="px-3 py-3 text-surface-200/60">
                          {c.category || "—"}
                        </td>

                        {/* Department */}
                        <td className="px-3 py-3 text-surface-200/60">
                          {c.department?.name || "—"}
                        </td>

                        {/* Urgency */}
                        <td className="px-3 py-3">
                          <UrgencyBadge urgency={c.urgency} />
                        </td>

                        {/* Status dropdown */}
                        <td className="px-3 py-3">
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
                        </td>

                        {/* Submitted By — hide for anonymous */}
                        <td className="px-3 py-3 text-surface-200/60">
                          {c.isAnonymous ? (
                            <span className="italic text-surface-200/30">🕶 Anonymous</span>
                          ) : (
                            c.submittedBy?.name || "—"
                          )}
                        </td>

                        {/* Date */}
                        <td className="px-3 py-3 text-xs text-surface-200/40">
                          {formatDate(c.createdAt)}
                        </td>

                        {/* Actions */}
                        <td className="px-3 py-3 text-right">
                          <div className="flex items-center justify-end gap-1">
                            <button
                              onClick={() => navigate(`/complaints/${c._id}`)}
                              title="View details"
                              className="cursor-pointer rounded-lg p-1.5 text-surface-200/40 transition hover:bg-white/10 hover:text-brand-400"
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                              </svg>
                            </button>
                            <button
                              onClick={() => handleDelete(c._id)}
                              title="Delete complaint"
                              className="cursor-pointer rounded-lg p-1.5 text-surface-200/40 transition hover:bg-red-500/10 hover:text-red-400"
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                              </svg>
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
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
    <span className={`rounded-full px-2.5 py-1 text-xs font-medium capitalize ${map[urgency] || map.medium}`}>
      {urgency || "medium"}
    </span>
  );
}

function formatDate(dateStr) {
  if (!dateStr) return "";
  return new Date(dateStr).toLocaleDateString("en-US", { month: "short", day: "numeric" });
}
