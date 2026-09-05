import { useState, useRef, useEffect } from "react";
import { useNotifications } from "../context/NotificationContext";
import { useTheme } from "../context/ThemeContext";

export default function NotificationBell() {
  const {
    notifications,
    unreadCount,
    markAsRead,
    markAllAsRead,
  } = useNotifications();
  const [open, setOpen] = useState(false);
  const panelRef = useRef(null);
  const { lightMode } = useTheme();

  // Close panel on outside click
  useEffect(() => {
    const handler = (e) => {
      if (panelRef.current && !panelRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    if (open) document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  return (
    <div className="relative" ref={panelRef}>
      {/* Bell button */}
      <button
        onClick={() => setOpen((v) => !v)}
        className={`relative cursor-pointer rounded-xl p-2 transition ${
          lightMode
            ? "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
            : "text-surface-200/60 hover:bg-white/10 hover:text-white"
        }`}
        title="Notifications"
        aria-label="View notifications"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
        </svg>
        {unreadCount > 0 && (
          <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold text-white shadow-md animate-pulse">
            {unreadCount > 99 ? "99+" : unreadCount}
          </span>
        )}
      </button>

      {/* Notification Dropdown Panel */}
      {open && (
        <div className={`absolute right-0 mt-3 w-80 sm:w-96 rounded-2xl border p-4 shadow-2xl backdrop-blur-2xl transition-all z-50 animate-fade-in-up ${
          lightMode
            ? "bg-white border-slate-200 text-slate-800 shadow-slate-900/10 ring-1 ring-slate-200/60"
            : "bg-[#080d20]/95 border-white/10 text-white shadow-black/60 ring-1 ring-white/10"
        }`}>
          {/* Header */}
          <div className={`flex items-center justify-between border-b pb-3 ${lightMode ? "border-slate-100" : "border-white/10"}`}>
            <div className="flex items-center gap-2">
              <span className="text-sm font-bold">Notifications</span>
              {unreadCount > 0 && (
                <span className="rounded-full bg-brand-500/20 px-2 py-0.5 text-[10px] font-bold text-brand-500">
                  {unreadCount} new
                </span>
              )}
            </div>
            {unreadCount > 0 && (
              <button
                onClick={markAllAsRead}
                className="cursor-pointer text-xs font-semibold text-brand-500 hover:text-brand-600 transition"
              >
                Mark all read
              </button>
            )}
          </div>

          {/* List */}
          <div className="mt-3 max-h-80 space-y-2 overflow-y-auto pr-1">
            {notifications.length === 0 ? (
              <div className="py-8 text-center">
                <span className="text-2xl">🔔</span>
                <p className={`mt-2 text-xs font-medium ${lightMode ? "text-slate-400" : "text-surface-200/40"}`}>
                  No notifications right now
                </p>
              </div>
            ) : (
              notifications.map((n) => (
                <div
                  key={n._id}
                  onClick={() => !n.isRead && markAsRead(n._id)}
                  className={`group relative cursor-pointer rounded-xl border p-3 transition ${
                    n.isRead
                      ? lightMode
                        ? "border-slate-100 bg-slate-50/50 text-slate-500"
                        : "border-white/5 bg-white/[0.01] text-surface-200/50"
                      : lightMode
                      ? "border-brand-200 bg-brand-50/40 text-slate-800 shadow-sm"
                      : "border-brand-500/20 bg-brand-500/[0.05] text-white"
                  } hover:scale-[0.99]`}
                >
                  <div className="flex items-start gap-2.5">
                    {!n.isRead && (
                      <span className="mt-1.5 h-2 w-2 flex-shrink-0 rounded-full bg-brand-500 shadow-sm shadow-brand-500/50" />
                    )}
                    <div className="flex-1 min-w-0">
                      <p className={`text-xs leading-relaxed ${!n.isRead ? "font-semibold" : ""}`}>
                        {n.message}
                      </p>
                      <p className={`mt-1 text-[10px] ${lightMode ? "text-slate-400" : "text-surface-200/40"}`}>
                        {new Date(n.createdAt).toLocaleString("en-US", {
                          month: "short",
                          day: "numeric",
                          hour: "numeric",
                          minute: "2-digit",
                        })}
                      </p>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
