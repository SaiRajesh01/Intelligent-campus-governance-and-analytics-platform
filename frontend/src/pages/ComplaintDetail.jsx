import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../services/api";
import DashboardShell from "../components/DashboardShell";

const STATUS_CONFIG = {
  open:          { label: "Open",        bg: "bg-slate-500/15",   text: "text-slate-300",   dot: "bg-slate-400" },
  "in-progress": { label: "In Progress", bg: "bg-blue-500/15",    text: "text-blue-300",    dot: "bg-blue-400" },
  escalated:     { label: "Escalated",   bg: "bg-orange-500/15",  text: "text-orange-300",  dot: "bg-orange-400" },
  resolved:      { label: "Resolved",    bg: "bg-emerald-500/15", text: "text-emerald-300", dot: "bg-emerald-400" },
  closed:        { label: "Closed",      bg: "bg-purple-500/15",  text: "text-purple-300",  dot: "bg-purple-400" },
};

export default function ComplaintDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [complaint, setComplaint] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Feedback state
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
      setError(err.response?.data?.message || "Failed to load complaint.");
    } finally {
      setLoading(false);
    }
  };

  const handleFeedbackSubmit = async (e) => {
    e.preventDefault();
    if (feedbackRating < 1) return setFeedbackError("Please select a rating.");
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
        <div className="flex justify-center py-20">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-brand-500 border-t-transparent" />
        </div>
      </DashboardShell>
    );
  }

  if (error || !complaint) {
    return (
      <DashboardShell>
        <div className="animate-fade-in-up py-20 text-center">
          <p className="text-lg text-red-400">{error || "Complaint not found."}</p>
          <button onClick={() => navigate(-1)} className="mt-4 cursor-pointer text-sm text-brand-400 hover:text-brand-300">
            ← Go back
          </button>
        </div>
      </DashboardShell>
    );
  }

  const cfg = STATUS_CONFIG[complaint.status] || STATUS_CONFIG.open;
  const canFeedback =
    ["resolved", "closed"].includes(complaint.status) && !feedbackSubmitted;

  return (
    <DashboardShell>
      <div className="mx-auto max-w-3xl animate-fade-in-up">
        {/* Back button */}
        <button
          onClick={() => navigate(-1)}
          className="mb-6 flex cursor-pointer items-center gap-1.5 text-sm text-surface-200/50 transition hover:text-brand-400"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
          Back to complaints
        </button>

        {/* ── Main card ────────────────────────────────────────────── */}
        <div className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-xl">
          {/* Title + status */}
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <h1 className="text-xl font-bold text-white">{complaint.title}</h1>
              <p className="mt-1 text-xs text-surface-200/50">
                {complaint.category || "Uncategorized"} · Submitted {formatDate(complaint.createdAt)}
                {complaint.isAnonymous && " · 🕶 Anonymous"}
              </p>
            </div>
            <span className={`rounded-full px-3 py-1 text-sm font-medium ${cfg.bg} ${cfg.text}`}>
              {cfg.label}
            </span>
          </div>

          {/* Description */}
          <div className="mt-6 rounded-xl border border-white/5 bg-white/[0.02] p-4">
            <p className="text-sm leading-relaxed text-surface-200/80 whitespace-pre-wrap">
              {complaint.description}
            </p>
          </div>

          {/* Meta grid */}
          <div className="mt-6 grid gap-4 sm:grid-cols-3">
            <MetaCard label="Urgency" value={complaint.urgency || "medium"} />
            <MetaCard label="Department" value={complaint.department?.name || "Unassigned"} />
            <MetaCard label="SLA Deadline" value={complaint.slaDeadline ? formatDate(complaint.slaDeadline) : "—"} />
          </div>

          {/* Attachments */}
          {complaint.attachments?.length > 0 && (
            <div className="mt-6">
              <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-surface-200/40">Attachments</p>
              <div className="flex flex-wrap gap-2">
                {complaint.attachments.map((a, i) => (
                  <span
                    key={i}
                    className="rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-xs text-surface-200/70"
                  >
                    📎 {a}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* ── Status Timeline ──────────────────────────────────────── */}
        {complaint.statusHistory?.length > 0 && (
          <div className="mt-6 rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-xl">
            <h2 className="mb-4 text-sm font-bold uppercase tracking-wider text-surface-200/50">Status Timeline</h2>
            <div className="relative ml-3 border-l border-white/10 pl-6">
              {complaint.statusHistory.map((entry, i) => {
                const entryCfg = STATUS_CONFIG[entry.to] || STATUS_CONFIG.open;
                return (
                  <div key={i} className="relative mb-5 last:mb-0">
                    {/* Dot */}
                    <span className={`absolute -left-[31px] top-0.5 h-3 w-3 rounded-full border-2 border-surface-900 ${entryCfg.dot}`} />
                    <p className="text-sm text-surface-100">
                      <span className="text-surface-200/50">{STATUS_CONFIG[entry.from]?.label || entry.from}</span>
                      <span className="mx-1.5 text-surface-200/30">→</span>
                      <span className={`font-medium ${entryCfg.text}`}>{entryCfg.label}</span>
                    </p>
                    <p className="mt-0.5 text-[11px] text-surface-200/40">
                      {formatDateTime(entry.changedAt)}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ── Feedback Form ────────────────────────────────────────── */}
        {feedbackSubmitted ? (
          <div className="mt-6 rounded-2xl border border-emerald-500/20 bg-emerald-500/5 p-6 text-center">
            <p className="text-sm font-medium text-emerald-300">
              ✓ Thank you for your feedback!
            </p>
          </div>
        ) : canFeedback ? (
          <form
            onSubmit={handleFeedbackSubmit}
            className="mt-6 rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-xl"
          >
            <h2 className="mb-1 text-sm font-bold uppercase tracking-wider text-surface-200/50">Rate Your Experience</h2>
            <p className="mb-4 text-xs text-surface-200/40">Your complaint has been resolved. How was the handling?</p>

            {feedbackError && (
              <div className="mb-4 rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-2.5 text-sm text-red-300">
                {feedbackError}
              </div>
            )}

            {/* Star rating */}
            <div className="mb-4 flex gap-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onMouseEnter={() => setFeedbackHover(star)}
                  onMouseLeave={() => setFeedbackHover(0)}
                  onClick={() => setFeedbackRating(star)}
                  className="cursor-pointer p-0.5 transition-transform hover:scale-110"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className={`h-8 w-8 transition ${
                      star <= (feedbackHover || feedbackRating)
                        ? "fill-amber-400 text-amber-400"
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
              placeholder="Any comments? (optional)"
              className="mb-4 w-full resize-none rounded-lg border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-white placeholder-surface-200/40 outline-none transition focus:border-brand-500 focus:ring-2 focus:ring-brand-500/25"
            />

            <button
              type="submit"
              disabled={feedbackLoading || feedbackRating < 1}
              className="cursor-pointer rounded-lg bg-gradient-to-r from-brand-600 to-brand-500 px-6 py-2.5 text-sm font-semibold text-white shadow-lg shadow-brand-500/25 transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {feedbackLoading ? "Sending…" : "Submit Feedback"}
            </button>
          </form>
        ) : null}
      </div>
    </DashboardShell>
  );
}

function MetaCard({ label, value }) {
  return (
    <div className="rounded-xl border border-white/5 bg-white/[0.02] px-4 py-3">
      <p className="text-[11px] font-semibold uppercase tracking-wider text-surface-200/40">{label}</p>
      <p className="mt-1 text-sm font-medium capitalize text-surface-100">{value}</p>
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
