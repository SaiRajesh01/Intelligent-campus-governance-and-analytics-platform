import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { useDashboardTheme } from "../context/ThemeContext";
import DashboardShell from "../components/DashboardShell";
import ComplaintForm from "../components/ComplaintForm";
import MyComplaints from "../components/MyComplaints";
import api from "../services/api";

export default function StudentDashboard() {
  const { user } = useAuth();
  const d = useDashboardTheme();
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

  const handleComplaintCreated = () => {
    setRefreshKey((k) => k + 1);
  };

  const rawName = user?.name || "";
  const displayName = rawName.includes("@")
    ? rawName.split("@")[0].replace(/[._-]/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())
    : rawName || "Student";

  const CARDS = [
    {
      title: "Total Submitted",
      value: stats.total,
      gradient: "from-indigo-600 to-brand-500",
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
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
    },
  ];

  return (
    <DashboardShell>
      <div className="animate-fade-in-up space-y-8">
        {/* ── Welcome Banner ── */}
        <div className={`relative overflow-hidden rounded-3xl border p-8 shadow-2xl backdrop-blur-xl ${d.bannerBg}`}>
          <div className="pointer-events-none absolute -right-12 -top-12 h-64 w-64 rounded-full bg-brand-500/15 blur-3xl" />
          <div className="relative z-10 flex flex-wrap items-center justify-between gap-4">
            <div>
              <h1 className={`text-3xl font-black tracking-tight sm:text-4xl ${d.bannerHeading}`}>
                Welcome, {displayName} 👋
              </h1>
              <p className={`mt-2 max-w-xl text-sm leading-relaxed sm:text-base ${d.bannerSub}`}>
                Report campus concerns, track real-time resolution SLAs, and provide feedback directly to departmental authorities.
              </p>
            </div>
            <div className="hidden sm:block text-right">
              <p className={`text-xs font-semibold uppercase tracking-wider ${d.textMuted}`}>Campus Time</p>
              <p className={`text-sm font-bold ${d.textPrimary}`}>{new Date().toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric", year: "numeric" })}</p>
            </div>
          </div>
        </div>

        {/* ── Stat Cards ── */}
        <div className="grid gap-5 sm:grid-cols-3">
          {CARDS.map((card) => (
            <div
              key={card.title}
              className={`group relative overflow-hidden rounded-2xl border p-6 shadow-xl backdrop-blur-xl transition-all duration-300 hover:scale-[1.02] ${d.cardBg}`}
            >
              <div className="flex items-center justify-between">
                <p className={`text-xs font-bold uppercase tracking-wider ${d.cardLabel}`}>{card.title}</p>
                <div className={`flex h-11 w-11 items-center justify-center rounded-xl ${d.cardIcon}`}>
                  {card.icon}
                </div>
              </div>
              <p className={`mt-4 bg-gradient-to-r ${card.gradient} bg-clip-text text-4xl font-black text-transparent`}>
                {card.value}
              </p>
              <div className={`mt-2 flex items-center gap-1.5 text-xs ${d.cardMeta}`}>
                <span>Active count in system</span>
              </div>
            </div>
          ))}
        </div>

        {/* ── Main Workspace (Complaint Form + Complaints List) ── */}
        <div className="grid gap-8 lg:grid-cols-12">
          <div className="lg:col-span-5">
            <ComplaintForm onCreated={handleComplaintCreated} />
          </div>
          <div className="lg:col-span-7">
            <MyComplaints refreshKey={refreshKey} />
          </div>
        </div>
      </div>
    </DashboardShell>
  );
}