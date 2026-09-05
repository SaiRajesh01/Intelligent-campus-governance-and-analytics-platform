import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useTheme, useDashboardTheme } from "../context/ThemeContext";
import api from "../services/api";
import DashboardShell from "../components/DashboardShell";

const STATUS_CONFIG = {
  open: {
    label: "Open / Unassigned",
    bg: "bg-blue-500/15 border-blue-500/30",
    text: "text-blue-400",
    dot: "bg-blue-400",
  },
  "in-progress": {
    label: "In Progress",
    bg: "bg-amber-500/15 border-amber-500/30",
    text: "text-amber-400",
    dot: "bg-amber-400",
  },
  escalated: {
    label: "Escalated",
    bg: "bg-red-500/15 border-red-500/30",
    text: "text-red-400",
    dot: "bg-red-400",
  },
  resolved: {
    label: "Resolved",
    bg: "bg-emerald-500/15 border-emerald-500/30",
    text: "text-emerald-400",
    dot: "bg-emerald-400",
  },
  closed: {
    label: "Closed",
    bg: "bg-slate-500/15 border-slate-500/30",
    text: "text-slate-400",
    dot: "bg-slate-400",
  },
};

export default function ComplaintDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { lightMode } = useTheme();
  const d = useDashboardTheme();

  const [complaint, setComplaint] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Feedback form state (students rating resolved complaints)
  const [feedbackRating, setFeedbackRating] = useState(0);
  const [feedbackHover, setFeedbackHover] = useState(0);
  const [feedbackComment, setFeedbackComment] = useState("");
  const [feedbackSubmitted, setFeedbackSubmitted] = useState(false);
  const [feedbackLoading, setFeedbackLoading] = useState(false);
  const [feedbackError, setFeedbackError] = useState("");

  useEffect(() => {
    (async () => {
      try {
        const { data } = await api.get(`/complaints/${id}`);
        setComplaint(data);
      } catch (err) {
        setError(err.response?.data?.message || "Failed to load complaint details.");
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  const handleFeedbackSubmit = async (e) => {
    e.preventDefault();
    if (feedbackRating < 1) {
      setFeedbackError("Please select a star rating between 1 and 5.");
      return;
    }
    setFeedbackLoading(true);
    setFeedbackError("");
    try {
      await api.post("/feedback", {
        complaintId: id,
        rating: feedbackRating,
        comment: feedbackComment,
      });
      setFeedbackSubmitted(true);
    } catch (err) {
      setFeedbackError(err.response?.data?.message || "Failed to submit feedback.");
    } finally {
      setFeedbackLoading(false);
    }
  };

  const cfg = STATUS_CONFIG[complaint?.status] || STATUS_CONFIG.open;
  const isOwner = complaint?.submittedBy?._id === user?._id;
  const isResolved = complaint?.status === "resolved" || complaint?.status === "closed";
  const canFeedback = user?.role === "student" && isOwner && isResolved;

  if (loading) {
    return (
      <DashboardShell>
        <div className="flex h-64 items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-brand-500 border-t-transparent" />
        </div>
      </DashboardShell>
    );
  }

  if (error || !complaint) {
    return (
      <DashboardShell>
        <div className={`rounded-2xl border p-8 text-center backdrop-blur-xl ${lightMode ? "border-red-300 bg-red-50 text-red-700" : "border-red-500/30 bg-red-500/10 text-red-300"}`}>
          <p className="font-bold">{error || "Complaint record could not be found."}</p>
          <button
            onClick={() => navigate(-1)}
            className="mt-4 cursor-pointer rounded-xl bg-brand-600 px-4 py-2 text-xs font-bold text-white shadow-lg transition hover:bg-brand-500"
          >
            Go Back
          </button>
        </div>
      </DashboardShell>
    );
  }

  return (
    <DashboardShell>
      <div className="mx-auto max-w-4xl space-y-8 animate-fade-in-up">
        {/* Back Link */}
        <button
          onClick={() => navigate(-1)}
          className={`inline-flex cursor-pointer items-center gap-2 rounded-xl border px-4 py-2 text-xs font-semibold backdrop-blur-md transition ${
            lightMode
              ? "border-slate-200 bg-white text-slate-700 hover:border-brand-400 hover:bg-slate-50 shadow-sm"
              : "border-white/10 bg-white/5 text-surface-200 hover:border-brand-500/40 hover:bg-brand-500/10 hover:text-white"
          }`}
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Back to Dashboard
        </button>

        {/* ── Main Details Card ──────────────────────────────────────── */}
        <div className={`relative overflow-hidden rounded-3xl border p-8 backdrop-blur-xl transition-all ${d.panelBg}`}>
          {/* Header Row */}
          <div className="flex flex-wrap items-start justify-between gap-4 border-b pb-6" style={{ borderColor: lightMode ? "#e2e8f0" : "rgba(255,255,255,0.1)" }}>
            <div className="space-y-1.5 max-w-2xl">
              <div className="flex items-center gap-2">
                <span className="rounded-lg bg-brand-500/15 border border-brand-500/30 px-2.5 py-0.5 text-xs font-bold text-brand-500">
                  {complaint.category || "General Issue"}
                </span>
                <span className={`text-xs ${d.textMuted}`}>
                  ID: #{complaint._id.slice(-6).toUpperCase()}
                </span>
              </div>
              <h1 className={`text-2xl font-extrabold tracking-tight sm:text-3xl ${d.panelHeading}`}>
                {complaint.title}
              </h1>
              <p className={`text-xs ${d.textMuted}`}>
                Submitted on {formatDateTime(complaint.createdAt)}
                {complaint.isAnonymous ? " • Filed Anonymously" : complaint.submittedBy?.name ? ` • By ${complaint.submittedBy.name}` : ""}
              </p>
            </div>

            {/* Status Badge */}
            <span className={`inline-flex items-center gap-2 rounded-full border px-4 py-1.5 text-xs font-extrabold shadow-sm ${cfg.bg} ${cfg.text}`}>
              <span className={`h-2 w-2 rounded-full ${cfg.dot} animate-pulse`} />
              {cfg.label}
            </span>
          </div>

          {/* Description Content */}
          <div className={`mt-6 rounded-2xl border p-5 ${
            lightMode ? "border-slate-200 bg-slate-50" : "border-white/10 bg-white/[0.03]"
          }`}>
            <h3 className={`mb-2 text-xs font-bold uppercase tracking-wider ${lightMode ? "text-slate-500" : "text-surface-200/60"}`}>
              Issue Description
            </h3>
            <p className={`text-sm leading-relaxed whitespace-pre-wrap ${lightMode ? "text-slate-700" : "text-slate-200"}`}>
              {complaint.description}
            </p>
          </div>

          {/* Meta Grid */}
          <div className="mt-6 grid gap-4 sm:grid-cols-3">
            <MetaCard label="Urgency Level" value={complaint.urgency || "medium"} isUrgency lightMode={lightMode} />
            <MetaCard label="Routed Department" value={complaint.department?.name || "Unassigned"} lightMode={lightMode} />
            <MetaCard label="Target SLA Deadline" value={complaint.slaDeadline ? formatDate(complaint.slaDeadline) : "—"} lightMode={lightMode} />
          </div>

          {/* Attachments */}
          {complaint.attachments?.length > 0 && (
            <div className="mt-6 border-t pt-6" style={{ borderColor: lightMode ? "#e2e8f0" : "rgba(255,255,255,0.1)" }}>
              <p className={`mb-3 text-xs font-bold uppercase tracking-wider ${lightMode ? "text-slate-500" : "text-surface-200/60"}`}>Attached Files</p>
              <div className="flex flex-wrap gap-2.5">
                {complaint.attachments.map((a, i) => (
                  <span
                    key={i}
                    className={`inline-flex items-center gap-2 rounded-xl border px-3.5 py-2 text-xs font-medium ${
                      lightMode
                        ? "border-slate-200 bg-slate-100 text-slate-700"
                        : "border-white/10 bg-white/5 text-surface-200"
                    }`}
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
          <div className={`relative overflow-hidden rounded-3xl border p-8 shadow-2xl backdrop-blur-xl transition-all ${d.panelBg}`}>
            <h2 className={`mb-6 text-base font-extrabold uppercase tracking-wider ${d.panelHeading}`}>Status Timeline</h2>
            <div className="relative ml-3 border-l-2 border-brand-500/30 pl-6 space-y-6">
              {complaint.statusHistory.map((entry, i) => {
                const entryCfg = STATUS_CONFIG[entry.to] || STATUS_CONFIG.open;
                return (
                  <div key={i} className="relative">
                    <span className={`absolute -left-[31px] top-1 h-3.5 w-3.5 rounded-full border-2 ${
                      lightMode ? "border-white" : "border-[#080d20]"
                    } ${entryCfg.dot} shadow`} />
                    <div className={`rounded-xl border p-3.5 ${
                      lightMode ? "border-slate-200 bg-slate-50 text-slate-800" : "border-white/5 bg-white/[0.02] text-white"
                    }`}>
                      <p className="text-sm font-bold">
                        <span className={lightMode ? "text-slate-500" : "text-surface-200/50"}>{STATUS_CONFIG[entry.from]?.label || entry.from}</span>
                        <span className="mx-2 text-brand-500">→</span>
                        <span className={entryCfg.text}>{entryCfg.label}</span>
                      </p>
                      <p className={`mt-1 text-xs ${lightMode ? "text-slate-400" : "text-surface-200/50"}`}>
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
          <div className={`rounded-3xl border p-8 text-center backdrop-blur-xl animate-fade-in-up ${
            lightMode ? "border-emerald-300 bg-emerald-50 text-emerald-800" : "border-emerald-500/30 bg-emerald-500/10 text-emerald-300"
          }`}>
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-emerald-500/20 text-emerald-500 text-xl font-bold">
              ✓
            </div>
            <h3 className={`mt-3 text-lg font-bold ${lightMode ? "text-emerald-900" : "text-emerald-300"}`}>Thank you for your feedback!</h3>
            <p className={`mt-1 text-xs ${lightMode ? "text-emerald-700" : "text-emerald-200/70"}`}>Your rating helps improve campus service standards.</p>
          </div>
        ) : canFeedback ? (
          <form
            onSubmit={handleFeedbackSubmit}
            className={`relative overflow-hidden rounded-3xl border p-8 shadow-2xl backdrop-blur-xl ${
              lightMode
                ? "border-brand-200 bg-gradient-to-br from-indigo-50/70 via-white to-slate-50 shadow-slate-900/5"
                : "border-brand-500/30 bg-gradient-to-br from-indigo-950/70 via-[#080d20] to-[#080d20] shadow-black/50"
            }`}
          >
            <h2 className={`text-lg font-extrabold ${lightMode ? "text-slate-900" : "text-white"}`}>Rate Resolution Quality</h2>
            <p className={`mt-1 text-xs ${lightMode ? "text-slate-600" : "text-indigo-200/70"}`}>This complaint has been marked as resolved. How satisfied are you with the outcome?</p>

            {feedbackError && (
              <div className={`mt-4 rounded-xl border p-3 text-xs ${
                lightMode ? "border-red-300 bg-red-50 text-red-700" : "border-red-500/30 bg-red-500/10 text-red-300"
              }`}>
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
                  aria-label={`Rate ${star} stars`}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className={`h-9 w-9 transition-colors ${
                      star <= (feedbackHover || feedbackRating)
                        ? "fill-amber-400 text-amber-400 filter drop-shadow(0 0 8px rgba(251,191,36,0.5))"
                        : lightMode
                        ? "fill-none text-slate-300"
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
              className={`mb-4 w-full resize-none rounded-xl border p-4 text-sm outline-none transition focus:ring-4 ${
                lightMode
                  ? "border-slate-200 bg-white text-slate-900 placeholder-slate-400 focus:border-brand-500 focus:ring-brand-500/20"
                  : "border-white/10 bg-white/[0.04] text-white placeholder-surface-200/30 focus:border-brand-400 focus:bg-white/[0.08] focus:ring-brand-500/20"
              }`}
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

function MetaCard({ label, value, isUrgency, lightMode }) {
  return (
    <div className={`rounded-2xl border p-4 ${
      lightMode ? "border-slate-200 bg-slate-50" : "border-white/10 bg-white/[0.03]"
    }`}>
      <p className={`text-[11px] font-bold uppercase tracking-wider ${
        lightMode ? "text-slate-500" : "text-surface-200/50"
      }`}>{label}</p>
      <p className={`mt-1.5 text-sm font-bold capitalize ${
        isUrgency
          ? lightMode ? "text-amber-600" : "text-amber-400"
          : lightMode ? "text-slate-900" : "text-white"
      }`}>
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
