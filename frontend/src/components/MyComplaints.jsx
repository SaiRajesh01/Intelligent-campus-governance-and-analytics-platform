import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useDashboardTheme } from "../context/ThemeContext";
import api from "../services/api";

const STATUS_CONFIG = {
  open:          { label: "Open",        bg: "bg-slate-500/15 border-slate-500/30",   text: "text-slate-400",   dot: "bg-slate-400" },
  "in-progress": { label: "In Progress", bg: "bg-blue-500/15 border-blue-500/30",    text: "text-blue-400",    dot: "bg-blue-400" },
  escalated:     { label: "Escalated",   bg: "bg-orange-500/15 border-orange-500/30",  text: "text-orange-400",  dot: "bg-orange-400" },
  resolved:      { label: "Resolved",    bg: "bg-emerald-500/15 border-emerald-500/30", text: "text-emerald-400", dot: "bg-emerald-400" },
  closed:        { label: "Closed",      bg: "bg-purple-500/15 border-purple-500/30",  text: "text-purple-400",  dot: "bg-purple-400" },
};

const FILTER_OPTIONS = [
  { value: "", label: "All Complaints" },
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
  const d = useDashboardTheme();

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
    <div className={`relative overflow-hidden rounded-3xl border p-7 backdrop-blur-xl transition-colors duration-500 ${d.panelBg}`}>
      {/* Header + Filter Bar */}
      <div className={`mb-6 flex flex-wrap items-center justify-between gap-4 border-b pb-5 ${d.panelBorder}`}>
        <div>
          <h2 className={`text-xl font-extrabold tracking-tight ${d.panelHeading}`}>Tracked Complaints</h2>
          <p className={`text-xs mt-0.5 ${d.panelSub}`}>Click any row to view resolution timeline or submit feedback</p>
        </div>

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

      {loading ? (
        <div className="flex flex-col items-center justify-center py-16">
          <div className="h-9 w-9 animate-spin rounded-full border-3 border-brand-500 border-t-transparent" />
          <p className={`mt-3 text-xs font-semibold ${d.textMuted}`}>Fetching your records...</p>
        </div>
      ) : complaints.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <div className={`flex h-14 w-14 items-center justify-center rounded-2xl text-2xl border ${d.emptyIcon}`}>
            📭
          </div>
          <p className={`mt-4 text-sm font-bold ${d.emptyText}`}>
            {filter ? "No complaints matching this filter" : "No complaints recorded yet"}
          </p>
          <p className={`mt-1 max-w-sm text-xs ${d.emptySub}`}>
            {filter ? "Try selecting 'All Complaints' to see all active submissions." : "Submit a new issue to any campus department."}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {complaints.map((c) => {
            const cfg = STATUS_CONFIG[c.status] || STATUS_CONFIG.open;
            return (
              <div
                key={c._id}
                onClick={() => navigate(`/complaints/${c._id}`)}
                className={`group flex cursor-pointer items-center gap-4 rounded-2xl border p-4 transition-all duration-200 ${d.listItemBg}`}
              >
                <span className={`h-3 w-3 flex-shrink-0 rounded-full ${cfg.dot} shadow-sm`} />
                <div className="min-w-0 flex-1">
                  <p className={`truncate text-sm font-bold transition ${d.listTitle}`}>
                    {c.title}
                  </p>
                  <div className={`mt-1 flex flex-wrap items-center gap-2 text-xs ${d.listMeta}`}>
                    <span className="font-semibold text-brand-500">{c.department?.name || "General"}</span>
                    <span>·</span>
                    <span>{c.category || "Uncategorized"}</span>
                    <span>·</span>
                    <span>{formatDate(c.createdAt)}</span>
                    {c.isAnonymous && (
                      <>
                        <span>·</span>
                        <span className="text-amber-500 font-semibold">🔒 Anonymous</span>
                      </>
                    )}
                  </div>
                </div>
                <span className={`flex-shrink-0 rounded-full border px-3 py-1 text-xs font-bold ${cfg.bg} ${cfg.text}`}>
                  {cfg.label}
                </span>
                <div className={`flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg transition ${d.listArrow}`}>
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                  </svg>
                </div>
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