import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import DashboardShell from "../components/DashboardShell";
import ComplaintForm from "../components/ComplaintForm";
import MyComplaints from "../components/MyComplaints";
import api from "../services/api";

export default function StudentDashboard() {
  const { user } = useAuth();
  const [refreshKey, setRefreshKey] = useState(0);
  const [stats, setStats] = useState({ total: 0, pending: 0, resolved: 0 });

  // Fetch counts for the stat cards
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
      // silently fail — cards just show 0
    }
  };

  const handleComplaintCreated = () => {
    setRefreshKey((k) => k + 1);
  };

  return (
    <DashboardShell>
      <div className="animate-fade-in-up">
        <h1 className="text-2xl font-bold text-white">
          Welcome, {user?.name || "Student"} 👋
        </h1>
        <p className="mt-1 text-surface-200/70">
          Submit complaints, track status, and provide feedback.
        </p>

        {/* Stat cards */}
        <div className="mt-8 grid gap-5 sm:grid-cols-3">
          {[
            { title: "My Complaints", value: stats.total, color: "from-brand-500 to-brand-700" },
            { title: "Pending", value: stats.pending, color: "from-amber-500 to-orange-600" },
            { title: "Resolved", value: stats.resolved, color: "from-emerald-500 to-green-600" },
          ].map((card) => (
            <div
              key={card.title}
              className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-xl"
            >
              <p className="text-sm font-medium text-surface-200/60">{card.title}</p>
              <p className={`mt-2 bg-gradient-to-r ${card.color} bg-clip-text text-3xl font-extrabold text-transparent`}>
                {card.value}
              </p>
            </div>
          ))}
        </div>

        {/* Two-column layout: form + list */}
        <div className="mt-8 grid gap-6 lg:grid-cols-5">
          <div className="lg:col-span-2">
            <ComplaintForm onCreated={handleComplaintCreated} />
          </div>
          <div className="lg:col-span-3">
            <MyComplaints refreshKey={refreshKey} />
          </div>
        </div>
      </div>
    </DashboardShell>
  );
}
