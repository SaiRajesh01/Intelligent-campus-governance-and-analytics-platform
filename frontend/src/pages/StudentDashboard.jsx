import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import DashboardShell from "../components/DashboardShell";
import MyComplaints from "../components/MyComplaints";
import api from "../services/api";

export default function StudentDashboard() {
  const { user } = useAuth();
  const [refreshKey, setRefreshKey] = useState(0);
  const [stats, setStats] = useState({ total: 0, pending: 0, resolved: 0 });

  useEffect(() => {
    fetchStats();
  }, [refreshKey]);

  const fetchStats = async () => {
    try {
      const { data } = await api.get("/complaints");
      const total = data.length;
      const resolved = data.filter((c) => c.status === "resolved" || c.status === "closed").length;
      const pending = total - resolved;
      setStats({ total, pending, resolved });
    } catch {
      // fallback
    }
  };

  /* Derive a display name — prefer user.name, but if it looks like an
     email address (contains @), extract the part before the @ instead. */
  const rawName = user?.name || "";
  const displayName = rawName.includes("@")
    ? rawName.split("@")[0].replace(/[._-]/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())
    : rawName || "Student";

  return (
    <DashboardShell>
      <div className="animate-fade-in-up space-y-8">
        {/* ── Welcome Banner ── */}
        <div className="relative overflow-hidden rounded-3xl border border-white/15 bg-gradient-to-r from-indigo-900/80 via-brand-900/50 to-slate-900/80 p-8 shadow-2xl backdrop-blur-xl">
          <div className="pointer-events-none absolute -right-12 -top-12 h-64 w-64 rounded-full bg-brand-500/15 blur-3xl" />
          <div className="relative z-10 flex flex-wrap items-center justify-between gap-4">
            <div>
              <h1 className="mt-3 text-3xl font-black tracking-tight text-white sm:text-4xl">
                Welcome, {displayName} 👋
              </h1>
              <p className="mt-2 max-w-xl text-sm leading-relaxed text-indigo-200/80 sm:text-base">
                Report campus concerns, track real-time resolution SLAs, and provide feedback directly to departmental authorities.
              </p>
            </div>
            <div className="hidden sm:block text-right">
              <p className="text-xs font-semibold uppercase tracking-wider text-surface-200/40">Campus Time</p>
              <p className="text-sm font-bold text-white">{new Date().toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric", year: "numeric" })}</p>
            </div>
          </div>
        </div>

        {/* ── Stat Cards ── */}
        <div className="grid gap-5 sm:grid-cols-3">
          {[
            {
              title: "Total Submitted",
              value: stats.total,
              gradient: "from-indigo-600 to-brand-500",
              textColor: "text-indigo-400",
              bgGlow: "bg-indigo-500/10 border-indigo-500/20",
              icon: (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              ),
            },
            {
              title: "Pending / In Progress",
              value: stats.pending,
              gradient: "from-amber-500 to-orange-500",
              textColor: "text-amber-400",
              bgGlow: "bg-amber-500/10 border-amber-500/20",
              icon: (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              ),
            },
            {
              title: "Resolved & Closed",
              value: stats.resolved,
              gradient: "from-emerald-500 to-teal-400",
              textColor: "text-emerald-400",
              bgGlow: "bg-emerald-500/10 border-emerald-500/20",
              icon: (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              ),
            },
          ].map((card) => (
            <div
              key={card.title}
              className={`group relative overflow-hidden rounded-2xl border p-6 shadow-xl backdrop-blur-xl transition-all duration-300 hover:scale-[1.02] ${card.bgGlow}`}
            >
              <div className="flex items-center justify-between">
                <p className="text-xs font-bold uppercase tracking-wider text-surface-200/70">{card.title}</p>
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white/5 ring-1 ring-white/10">
                  {card.icon}
                </div>
              </div>
              <p className={`mt-4 bg-gradient-to-r ${card.gradient} bg-clip-text text-4xl font-black text-transparent`}>
                {card.value}
              </p>
              <div className="mt-2 flex items-center gap-1.5 text-xs text-surface-200/50">
                <span>Active count in system</span>
              </div>
            </div>
          ))}
        </div>

        {/* ── My Complaints (full width) ── */}
        <MyComplaints refreshKey={refreshKey} />
      </div>
    </DashboardShell>
  );
}