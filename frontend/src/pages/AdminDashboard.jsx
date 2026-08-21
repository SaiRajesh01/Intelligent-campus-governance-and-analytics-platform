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
  { value: "", label: "All Complaints" },
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
      // fallback
    }
  }, []);

  useEffect(() => {
    fetchComplaints();
    fetchSummary();
  }, [fetchComplaints, fetchSummary]);

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

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to permanently delete this complaint record?")) return;
    try {
      await api.delete(`/complaints/${id}`);
      fetchComplaints();
      fetchSummary();
    } catch (err) {
      console.error("Delete failed:", err.message);
    }
  };

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
      <div className="animate-fade-in-up space-y-8">
        {/* ── Admin Hero Banner ──────────────────────────────────────── */}
        <div className="relative overflow-hidden rounded-3xl border border-white/15 bg-gradient-to-r from-amber-950/40 via-indigo-950/60 to-slate-900/90 p-8 shadow-2xl backdrop-blur-xl">
          <div className="pointer-events-none absolute -right-10 -top-10 h-64 w-64 rounded-full bg-amber-500/10 blur-3xl" />
          <div className="relative z-10 flex flex-wrap items-center justify-between gap-4">
            <div>
              <span className="inline-flex items-center gap-2 rounded-full border border-amber-400/30 bg-amber-500/10 px-3 py-1 text-xs font-bold uppercase tracking-wider text-amber-300">
                ⚙️ Master Governance Console
              </span>
              <h1 className="mt-3 text-3xl font-black tracking-tight text-white sm:text-4xl">
                Campus Admin Dashboard
              </h1>
              <p className="mt-2 max-w-xl text-sm leading-relaxed text-slate-300 sm:text-base">
                Full-system authority: Monitor institutional workflows, oversee department performance, perform bulk updates, and manage SLAs.
              </p>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => { fetchComplaints(); fetchSummary(); }}
                className="flex cursor-pointer items-center gap-2 rounded-xl border border-white/15 bg-white/5 px-4 py-2.5 text-xs font-bold text-white transition hover:bg-white/10 hover:border-white/30"
              >
                <span>🔄</span>
                <span>Refresh Live Data</span>
              </button>
            </div>
          </div>
        </div>

        {/* ── Key Metrics Cards ──────────────────────────────────────── */}
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {[
            {
              title: "Total System Influx",
              value: summary?.total ?? "—",
              gradient: "from-indigo-500 via-brand-500 to-blue-600",
              borderGlow: "border-indigo-500/20 bg-indigo-500/10",
              label: "All departments combined",
              icon: "📑",
            },
            {
              title: "Open & Escalated",
              value: summary ? `${summary.open + summary.escalated}` : "—",
              gradient: "from-amber-400 via-orange-500 to-red-500",
              borderGlow: "border-amber-500/20 bg-amber-500/10",
              label: "Requiring active staff attention",
              icon: "⚡",
            },
            {
              title: "Avg Resolution Speed",
              value: summary?.averageResolutionTime ? `${summary.averageResolutionTime.hours}h` : "—",
              gradient: "from-sky-400 via-cyan-500 to-blue-500",
              borderGlow: "border-sky-500/20 bg-sky-500/10",
              label: "Campus-wide turnaround",
              icon: "⏱",
            },
            {
              title: "Successfully Resolved",
              value: summary?.resolved ?? "—",
              gradient: "from-emerald-400 via-teal-500 to-green-600",
              borderGlow: "border-emerald-500/20 bg-emerald-500/10",
              label: "Complaints closed with feedback",
              icon: "✓",
            },
          ].map((card) => (
            <div
              key={card.title}
              className={`group relative overflow-hidden rounded-2xl border p-6 shadow-xl backdrop-blur-xl transition-all duration-300 hover:scale-[1.02] ${card.borderGlow}`}
            >
              <div className="flex items-center justify-between">
                <p className="text-xs font-bold uppercase tracking-wider text-surface-200/70">{card.title}</p>
                <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/5 text-lg border border-white/10">
                  {card.icon}
                </span>
              </div>
              <p className={`mt-4 bg-gradient-to-r ${card.gradient} bg-clip-text text-4xl font-black text-transparent`}>
                {card.value}
              </p>
              <p className="mt-2 text-xs text-surface-200/50">{card.label}</p>
            </div>
          ))}
        </div>

        {/* ── Master Complaints Table Card ───────────────────────────── */}
        <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-[#080d20]/80 p-7 shadow-2xl backdrop-blur-xl">
          {/* Toolbar */}
          <div className="mb-6 flex flex-wrap items-center justify-between gap-4 border-b border-white/10 pb-5">
            <div>
              <h2 className="text-xl font-extrabold tracking-tight text-white">All Campus Complaints</h2>
              <p className="text-xs text-surface-200/60 mt-0.5">Filter, inspect, bulk-update status, or delete invalid records</p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
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

              {/* Bulk Actions Menu */}
              {selected.size > 0 && (
                <div className="flex items-center gap-2 rounded-2xl bg-brand-500/10 border border-brand-500/30 px-3 py-1.5 animate-fade-in-up">
                  <span className="text-xs font-bold text-brand-300">{selected.size} selected</span>
                  <select
                    value={bulkStatus}
                    onChange={(e) => setBulkStatus(e.target.value)}
                    className="cursor-pointer rounded-lg border border-brand-500/40 bg-surface-900 px-2.5 py-1 text-xs font-semibold text-white outline-none"
                  >
                    <option value="">Set Status...</option>
                    {STATUS_OPTIONS.map((s) => (
                      <option key={s} value={s}>{STATUS_CONFIG[s].label}</option>
                    ))}
                  </select>
                  <button
                    onClick={handleBulkUpdate}
                    disabled={!bulkStatus || bulkLoading}
                    className="cursor-pointer rounded-lg bg-brand-600 px-3 py-1 text-xs font-bold text-white transition hover:bg-brand-500 disabled:opacity-50"
                  >
                    {bulkLoading ? "Applying..." : "Apply"}
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Table Container */}
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20">
              <div className="h-9 w-9 animate-spin rounded-full border-3 border-brand-500 border-t-transparent" />
              <p className="mt-3 text-xs font-semibold text-surface-200/50">Loading database records...</p>
            </div>
          ) : complaints.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white/5 text-2xl border border-white/10">
                📭
              </div>
              <p className="mt-4 text-sm font-bold text-white">No complaints found</p>
              <p className="mt-1 text-xs text-surface-200/50">No complaints matching the selected filter criteria.</p>
            </div>
          ) : (
            <div className="overflow-x-auto rounded-2xl border border-white/10 bg-black/20">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-white/10 bg-white/[0.03] text-xs font-bold uppercase tracking-wider text-surface-200/60">
                    <th className="px-4 py-3.5">
                      <input
                        type="checkbox"
                        checked={selected.size === complaints.length && complaints.length > 0}
                        onChange={toggleSelectAll}
                        className="cursor-pointer accent-brand-500 rounded"
                      />
                    </th>
                    <th className="px-4 py-3.5">Subject & Title</th>
                    <th className="px-4 py-3.5">Department</th>
                    <th className="px-4 py-3.5">Category</th>
                    <th className="px-4 py-3.5">Urgency</th>
                    <th className="px-4 py-3.5">Current Status</th>
                    <th className="px-4 py-3.5">Submitted By</th>
                    <th className="px-4 py-3.5">Filed On</th>
                    <th className="px-4 py-3.5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {complaints.map((c) => {
                    const cfg = STATUS_CONFIG[c.status] || STATUS_CONFIG.open;
                    return (
                      <tr
                        key={c._id}
                        className="transition-colors hover:bg-brand-500/[0.04]"
                      >
                        {/* Checkbox */}
                        <td className="px-4 py-3.5">
                          <input
                            type="checkbox"
                            checked={selected.has(c._id)}
                            onChange={() => toggleSelect(c._id)}
                            className="cursor-pointer accent-brand-500 rounded"
                          />
                        </td>

                        {/* Title (clickable) */}
                        <td className="max-w-[240px] px-4 py-3.5">
                          <button
                            onClick={() => navigate(`/complaints/${c._id}`)}
                            className="cursor-pointer truncate text-left font-bold text-white transition hover:text-brand-300 block w-full"
                          >
                            {c.title}
                          </button>
                        </td>

                        {/* Department */}
                        <td className="px-4 py-3.5">
                          <span className="inline-flex rounded-lg bg-indigo-500/10 border border-indigo-500/20 px-2.5 py-1 text-xs font-bold text-indigo-300">
                            {c.department?.name || "General"}
                          </span>
                        </td>

                        {/* Category */}
                        <td className="px-4 py-3.5 text-xs font-medium text-surface-200/70">
                          {c.category || "—"}
                        </td>

                        {/* Urgency */}
                        <td className="px-4 py-3.5">
                          <UrgencyBadge urgency={c.urgency} />
                        </td>

                        {/* Inline Status Dropdown */}
                        <td className="px-4 py-3.5">
                          <select
                            value={c.status}
                            onChange={(e) => handleStatusChange(c._id, e.target.value)}
                            className={`cursor-pointer rounded-full border px-3 py-1 text-xs font-bold outline-none transition ${cfg.bg} ${cfg.text}`}
                          >
                            {STATUS_OPTIONS.map((s) => (
                              <option key={s} value={s} className="bg-surface-900 text-white font-medium">
                                {STATUS_CONFIG[s].label}
                              </option>
                            ))}
                          </select>
                        </td>

                        {/* Submitter */}
                        <td className="px-4 py-3.5 text-xs text-surface-200/70">
                          {c.isAnonymous ? (
                            <span className="inline-flex items-center gap-1 font-semibold text-amber-400">
                              🕶 Anonymous
                            </span>
                          ) : (
                            c.submittedBy?.name || "—"
                          )}
                        </td>

                        {/* Date */}
                        <td className="px-4 py-3.5 text-xs text-surface-200/50">
                          {formatDate(c.createdAt)}
                        </td>

                        {/* Actions */}
                        <td className="px-4 py-3.5 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => navigate(`/complaints/${c._id}`)}
                              title="Inspect Details"
                              className="cursor-pointer rounded-lg p-2 text-surface-200/40 transition hover:bg-brand-500/15 hover:text-brand-300"
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                              </svg>
                            </button>
                            <button
                              onClick={() => handleDelete(c._id)}
                              title="Delete Record"
                              className="cursor-pointer rounded-lg p-2 text-surface-200/40 transition hover:bg-red-500/15 hover:text-red-400"
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

function formatDate(dateStr) {
  if (!dateStr) return "";
  return new Date(dateStr).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}