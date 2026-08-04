import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";

const STATUS_CONFIG = {
  open:          { label: "Open",        bg: "bg-slate-500/15",   text: "text-slate-300",   dot: "bg-slate-400" },
  "in-progress": { label: "In Progress", bg: "bg-blue-500/15",    text: "text-blue-300",    dot: "bg-blue-400" },
  escalated:     { label: "Escalated",   bg: "bg-orange-500/15",  text: "text-orange-300",  dot: "bg-orange-400" },
  resolved:      { label: "Resolved",    bg: "bg-emerald-500/15", text: "text-emerald-300", dot: "bg-emerald-400" },
  closed:        { label: "Closed",      bg: "bg-purple-500/15",  text: "text-purple-300",  dot: "bg-purple-400" },
};

const FILTER_OPTIONS = [
  { value: "", label: "All" },
  { value: "open", label: "Open" },
  { value: "in-progress", label: "In Progress" },
  { value: "escalated", label: "Escalated" },
  { value: "resolved", label: "Resolved" },
  { value: "closed", label: "Closed" },
];

export default function MyComplaints({ refreshKey }) {
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    fetchComplaints();
  }, [filter, refreshKey]);

  const fetchComplaints = async () => {
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
  };

  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-xl">
      {/* Header + filter */}
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-lg font-bold text-white">My Complaints</h2>
        <div className="flex gap-1.5 rounded-xl bg-surface-900/60 p-1">
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

      {/* List */}
      {loading ? (
        <div className="flex justify-center py-12">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-brand-500 border-t-transparent" />
        </div>
      ) : complaints.length === 0 ? (
        <div className="py-12 text-center text-sm text-surface-200/40">
          {filter ? "No complaints with this status." : "You haven't submitted any complaints yet."}
        </div>
      ) : (
        <div className="space-y-3">
          {complaints.map((c) => {
            const cfg = STATUS_CONFIG[c.status] || STATUS_CONFIG.open;
            return (
              <div
                key={c._id}
                onClick={() => navigate(`/complaints/${c._id}`)}
                className="group flex cursor-pointer items-center gap-4 rounded-xl border border-white/5 bg-white/[0.02] px-5 py-4 transition hover:border-brand-500/20 hover:bg-white/5"
              >
                {/* Status dot */}
                <span className={`h-2.5 w-2.5 flex-shrink-0 rounded-full ${cfg.dot}`} />

                {/* Content */}
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold text-white group-hover:text-brand-300 transition">
                    {c.title}
                  </p>
                  <p className="mt-0.5 truncate text-xs text-surface-200/50">
                    {c.category || "Uncategorized"} · {formatDate(c.createdAt)}
                    {c.isAnonymous && " · 🕶 Anonymous"}
                  </p>
                </div>

                {/* Status badge */}
                <span className={`flex-shrink-0 rounded-full px-2.5 py-1 text-xs font-medium ${cfg.bg} ${cfg.text}`}>
                  {cfg.label}
                </span>

                {/* Arrow */}
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 flex-shrink-0 text-surface-200/20 transition group-hover:text-brand-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                </svg>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function formatDate(dateStr) {
  if (!dateStr) return "";
  return new Date(dateStr).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}
