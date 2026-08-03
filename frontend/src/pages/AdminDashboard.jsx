import { useAuth } from "../context/AuthContext";
import DashboardShell from "../components/DashboardShell";

export default function AdminDashboard() {
  const { user } = useAuth();

  return (
    <DashboardShell>
      <div className="animate-fade-in-up">
        <h1 className="text-2xl font-bold text-white">
          Admin Dashboard ⚙️
        </h1>
        <p className="mt-1 text-surface-200/70">
          Welcome, {user?.name || "Admin"} — Full system overview, analytics, and management.
        </p>

        <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {[
            { title: "Total Complaints", value: "—", color: "from-brand-500 to-brand-700" },
            { title: "Open / Escalated", value: "—", color: "from-amber-500 to-orange-600" },
            { title: "Avg Resolution Time", value: "—", color: "from-sky-500 to-cyan-600" },
            { title: "SLA Compliance", value: "—", color: "from-emerald-500 to-green-600" },
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
      </div>
    </DashboardShell>
  );
}
