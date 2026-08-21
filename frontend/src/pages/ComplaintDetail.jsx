import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../services/api";
import DashboardShell from "../components/DashboardShell";

const STATUS_CONFIG = {
  open:          { label: "Open",        bg: "bg-slate-500/15 border-slate-500/30",   text: "text-slate-300",   dot: "bg-slate-400" },
  "in-progress": { label: "In Progress", bg: "bg-blue-500/15 border-blue-500/30",    text: "text-blue-300",    dot: "bg-blue-400" },
  escalated:     { label: "Escalated",   bg: "bg-orange-500/15 border-orange-500/30",  text: "text-orange-300",  dot: "bg-orange-400" },
  resolved:      { label: "Resolved",    bg: "bg-emerald-500/15 border-emerald-500/30", text: "text-emerald-300", dot: "bg-emerald-400" },
  closed:        { label: "Closed",      bg: "bg-purple-500/15 border-purple-500/30",  text: "text-purple-300",  dot: "bg-purple-400" },
};

export default function ComplaintDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [complaint, setComplaint] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [feedbackRating, setFeedbackRating] = useState(0);
  const [feedbackHover, setFeedbackHover] = useState(0);
  const [feedbackComment, setFeedbackComment] = useState("");
  const [feedbackSubmitted, setFeedbackSubmitted] = useState(false);
  const [feedbackLoading, setFeedbackLoading] = useState(false);
  const [feedbackError, setFeedbackError] = useState("");

  useEffect(() => {
    fetchComplaint();
  }, [id]);

  const fetchComplaint = async () => {
    setLoading(true);
    try {
      const { data } = await api.get(`/complaints/${id}`);
      setComplaint(data);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load complaint details.");
    } finally {
      setLoading(false);
    }
  };

  const handleFeedbackSubmit = async (e) => {
    e.preventDefault();
    if (feedbackRating < 1) return setFeedbackError("Please select a star rating.");
    setFeedbackLoading(true);
    setFeedbackError("");
    try {
      await api.post(`/complaints/${id}/feedback`, {
        rating: feedbackRating,
        comment: feedbackComment.trim() || undefined,
      });
      setFeedbackSubmitted(true);
    } catch (err) {
      const msg = err.response?.data?.message || "Failed to submit feedback.";
      if (msg.includes("already submitted")) {
        setFeedbackSubmitted(true);
      } else {
        setFeedbackError(msg);
      }
    } finally {
      setFeedbackLoading(false);
    }
  };

  if (loading) {
    return (
      <DashboardShell>
        <div className="flex flex-col items-center justify-center py-24">
          <div className="h-10 w-10 animate-spin rounded-full border-3 border-brand-500 border-t-transparent" />
          <p className="mt-4 text-xs font-semibold text-surface-200/50">Loading complaint history...</p>
        </div>
      </DashboardShell>
    );
  }

  if (error || !complaint) {
    return (
      <DashboardShell>
        <div className="animate-fade-in-up py-20 text-center">
          <p className="text-base font-bold text-red-400">{error || "Complaint record not found."}</p>
          <button
            onClick={() => navigate(-1)}
            className="mt-4 inline-flex items-center gap-2 rounded-xl bg-white/5 border border-white/10 px-4 py-2 text-xs font-bold text-brand-300 hover:bg-white/10"
          >
            ← Return to Dashboard
          </button>
        </div>
      </DashboardShell>
    );
  }

  const cfg = STATUS_CONFIG[complaint.status] || STATUS_CONFIG.open;
  const canFeedback = ["resolved", "closed"].includes(complaint.status) && !feedbackSubmitted;

  return (
    <DashboardShell>
      <div className="mx-auto max-w-4xl animate-fade-in-up space-y-6">
        {/* Back navigation button */}
        <button
          onClick={() => navigate(-1)}
          className="group flex cursor-pointer items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-xs font-bold text-surface-200/70 transition hover:bg-white/10 hover:text-white"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 transition-transform group-hover:-translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
          Back to Overview
        </button>

        {/* ── Main Detail Card ────────────────────────────────────────── */}
        <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-[#080d20]/90 p-8 shadow-2xl backdrop-blur-xl">
          {/* Header */}
          <div className="flex flex-wrap items-start justify-between gap-4 border-b border-white/10 pb-6">
            <div className="space-y-1.5">
              <span className="inline-flex items-center gap-1.5 rounded-lg border border-indigo-500/30 bg-indigo-500/10 px-2.5 py-0.5 text-xs font-bold text-indigo-300">
                Department: {complaint.department?.name || "General"}
              </span>
              <h1 className="text-2xl font-black tracking-tight text-white sm:text-3xl">
                {complaint.title}
              </h1>
              <p className="text-xs text-surface-200/50">
                Category: <span className="text-surface-100 font-medium">{complaint.category || "Uncategorized"}</span> · Filed on {formatDate(complaint.createdAt)}
                {complaint.isAnonymous && <span className="ml-2 font-bold text-amber-400">🕶 Anonymous Submission</span>}
              </p>
            </div>
            <span className={`rounded-full border px-4 py-1.5 text-xs font-bold ${cfg.bg} ${cfg.text}`}>
              {cfg.label}
            </span>
          </div>

          {/* Description Content */}
          <div className="mt-6 rounded-2xl border border-white/10 bg-white/[0.03] p-5">
            <h3 className="mb-2 text-xs font-bold uppercase tracking-wider text-surface-200/60">Issue Description</h3>
            <p className="text-sm leading-relaxed text-slate-200 whitespace-pre-wrap">
              {complaint.description}
            </p>
          </div>

          {/* Meta Grid */}
          <div className="mt-6 grid gap-4 sm:grid-cols-3">
            <MetaCard label="Urgency Level" value={complaint.urgency || "medium"} isUrgency />
            <MetaCard label="Routed Department" value={complaint.department?.name || "Unassigned"} />
            <MetaCard label="Target SLA Deadline" value={complaint.slaDeadline ? formatDate(complaint.slaDeadline) : "—"} />
          </div>

          {/* Attachments */}
          {complaint.attachments?.length > 0 && (
            <div className="mt-6 border-t border-white/10 pt-6">
              <p className="mb-3 text-xs font-bold uppercase tracking-wider text-surface-200/60">Attached Files</p>
              <div className="flex flex-wrap gap-2.5">
                {complaint.attachments.map((a, i) => (
                  <span
                    key={i}
                    className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3.5 py-2 text-xs font-medium text-surface-200"
                  >
                    📎 {a}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* ── Status Progression Timeline ───────────────────────────── */}
        {complaint.statusHistory?.length > 0 && (
          <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-[#080d20]/90 p-8 shadow-2xl backdrop-blur-xl">
            <h2 className="mb-6 text-base font-extrabold uppercase tracking-wider text-white">Status Timeline</h2>
            <div className="relative ml-3 border-l-2 border-brand-500/30 pl-6 space-y-6">
              {complaint.statusHistory.map((entry, i) => {
                const entryCfg = STATUS_CONFIG[entry.to] || STATUS_CONFIG.open;
                return (
                  <div key={i} className="relative">
                    <span className={`absolute -left-[31px] top-1 h-3.5 w-3.5 rounded-full border-2 border-[#080d20] ${entryCfg.dot} shadow`} />
                    <div className="rounded-xl border border-white/5 bg-white/[0.02] p-3.5">
                      <p className="text-sm font-bold text-white">
                        <span className="text-surface-200/50">{STATUS_CONFIG[entry.from]?.label || entry.from}</span>
                        <span className="mx-2 text-brand-400">→</span>
                        <span className={entryCfg.text}>{entryCfg.label}</span>
                      </p>
                      <p className="mt-1 text-xs text-surface-200/50">
                        Updated: {formatDateTime(entry.changedAt)}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ── Star Feedback Section (for resolved complaints) ───────── */}
        {feedbackSubmitted ? (
          <div className="rounded-3xl border border-emerald-500/30 bg-emerald-500/10 p-8 text-center backdrop-blur-xl animate-fade-in-up">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-emerald-500/20 text-emerald-400 text-xl">
              ✓
            </div>
            <h3 className="mt-3 text-lg font-bold text-emerald-300">Thank you for your feedback!</h3>
            <p className="mt-1 text-xs text-emerald-200/70">Your rating helps improve campus service standards.</p>
          </div>
        ) : canFeedback ? (
          <form
            onSubmit={handleFeedbackSubmit}
            className="relative overflow-hidden rounded-3xl border border-brand-500/30 bg-gradient-to-br from-indigo-950/70 via-[#080d20] to-[#080d20] p-8 shadow-2xl backdrop-blur-xl"
          >
            <h2 className="text-lg font-extrabold text-white">Rate Resolution Quality</h2>
            <p className="mt-1 text-xs text-indigo-200/70">This complaint has been marked as resolved. How satisfied are you with the outcome?</p>

            {feedbackError && (
              <div className="mt-4 rounded-xl border border-red-500/30 bg-red-500/10 p-3 text-xs text-red-300">
                {feedbackError}
              </div>
            )}

            {/* Interactive Stars */}
            <div className="my-5 flex items-center gap-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onMouseEnter={() => setFeedbackHover(star)}
                  onMouseLeave={() => setFeedbackHover(0)}
                  onClick={() => setFeedbackRating(star)}
                  className="cursor-pointer p-1 transition-transform hover:scale-125"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className={`h-9 w-9 transition-colors ${
                      star <= (feedbackHover || feedbackRating)
                        ? "fill-amber-400 text-amber-400 filter drop-shadow(0 0 8px rgba(251,191,36,0.5))"
                        : "fill-none text-surface-200/30"
                    }`}
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={1.5}
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                  </svg>
                </button>
              ))}
            </div>

            {/* Comment */}
            <textarea
              rows={3}
              value={feedbackComment}
              onChange={(e) => setFeedbackComment(e.target.value)}
              placeholder="Any comments regarding staff responsiveness or issue fix? (optional)..."
              className="mb-4 w-full resize-none rounded-xl border border-white/10 bg-white/[0.04] p-4 text-sm text-white placeholder-surface-200/30 outline-none transition focus:border-brand-400 focus:bg-white/[0.08] focus:ring-4 focus:ring-brand-500/20"
            />

            <button
              type="submit"
              disabled={feedbackLoading || feedbackRating < 1}
              className="cursor-pointer rounded-xl bg-gradient-to-r from-brand-600 to-indigo-600 px-6 py-3 text-sm font-bold text-white shadow-lg shadow-brand-500/25 transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {feedbackLoading ? "Submitting..." : "Submit Experience Feedback"}
            </button>
          </form>
        ) : null}
      </div>
    </DashboardShell>
  );
}

function MetaCard({ label, value, isUrgency }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
      <p className="text-[11px] font-bold uppercase tracking-wider text-surface-200/50">{label}</p>
      <p className={`mt-1.5 text-sm font-bold capitalize ${isUrgency ? "text-amber-400" : "text-white"}`}>
        {value}
      </p>
    </div>
  );
}

function formatDate(dateStr) {
  if (!dateStr) return "";
  return new Date(dateStr).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

function formatDateTime(dateStr) {
  if (!dateStr) return "";
  return new Date(dateStr).toLocaleString("en-US", {
    month: "short", day: "numeric", year: "numeric",
    hour: "numeric", minute: "2-digit",
  });
}