import { useNotifications } from "../context/NotificationContext";
import { useTheme } from "../context/ThemeContext";

export default function NotificationToast() {
  const { toast, toastNotification, dismissToast, clearToast } = useNotifications();
  const { lightMode } = useTheme();

  const activeToast = toast || toastNotification;
  const handleDismiss = dismissToast || clearToast;

  if (!activeToast) return null;

  return (
    <div className="fixed bottom-6 right-6 z-50 max-w-sm animate-fade-in-up">
      <div className={`flex items-start gap-3 rounded-2xl border p-4 backdrop-blur-2xl transition-all ${
        lightMode
          ? "bg-white/95 border-brand-300 text-slate-800 shadow-2xl shadow-slate-900/15 ring-1 ring-slate-200/60"
          : "bg-surface-900/95 border-brand-500/40 text-surface-100 shadow-2xl shadow-black/50 ring-1 ring-white/10"
      }`}>
        {/* Icon */}
        <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl bg-brand-500/20 text-brand-500 font-bold">
          🔔
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <p className="text-xs font-bold uppercase tracking-wider text-brand-500">Live Campus Alert</p>
          <p className={`mt-0.5 text-xs font-medium leading-relaxed ${lightMode ? "text-slate-700" : "text-surface-200"}`}>
            {activeToast.message}
          </p>
        </div>

        {/* Dismiss button */}
        <button
          onClick={handleDismiss}
          className={`cursor-pointer rounded-lg p-1 transition ${
            lightMode
              ? "text-slate-400 hover:bg-slate-100 hover:text-slate-700"
              : "text-surface-200/40 hover:bg-white/10 hover:text-white"
          }`}
          title="Dismiss notification"
          aria-label="Dismiss notification"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
    </div>
  );
}
