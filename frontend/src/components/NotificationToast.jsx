import { useNotifications } from "../context/NotificationContext";

export default function NotificationToast() {
  const { toast, dismissToast } = useNotifications();

  if (!toast) return null;

  return (
    <div className="fixed right-6 top-6 z-[100] animate-fade-in-up w-80">
      <div className="rounded-2xl border border-white/10 bg-surface-900/95 p-4 shadow-2xl backdrop-blur-xl">
        <div className="flex items-start gap-3">
          {/* Icon */}
          <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-brand-500/15">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-brand-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
            </svg>
          </div>
          {/* Message */}
          <div className="min-w-0 flex-1">
            <p className="text-xs font-semibold text-brand-300">New Notification</p>
            <p className="mt-0.5 text-sm leading-snug text-surface-200/80">
              {toast.message}
            </p>
          </div>
          {/* Dismiss */}
          <button
            onClick={dismissToast}
            className="cursor-pointer flex-shrink-0 rounded-lg p-1 text-surface-200/40 transition hover:text-white"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}
