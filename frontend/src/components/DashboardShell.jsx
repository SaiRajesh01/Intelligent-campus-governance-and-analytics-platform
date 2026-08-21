import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import NotificationBell from "./NotificationBell";

const NAV_ITEMS = {
  student: [
    { label: "Overview & Complaints", path: "/student-dashboard", icon: "📋" },
  ],
  departmentHead: [
    { label: "Department Queue", path: "/department-dashboard", icon: "🏢" },
    { label: "Analytics & Trends", path: "/analytics", icon: "📊" },
  ],
  admin: [
    { label: "Management Console", path: "/admin-dashboard", icon: "⚙️" },
    { label: "Analytics & Trends", path: "/analytics", icon: "📊" },
  ],
};

const ROLE_BADGES = {
  student: { label: "Student", bg: "bg-blue-500/15 text-blue-300 border-blue-500/30" },
  departmentHead: { label: "Department Head", bg: "bg-indigo-500/15 text-indigo-300 border-indigo-500/30" },
  admin: { label: "Administrator", bg: "bg-amber-500/15 text-amber-300 border-amber-500/30" },
};

export default function DashboardShell({ children }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const navItems = NAV_ITEMS[user?.role] || [];
  const currentRole = ROLE_BADGES[user?.role] || { label: user?.role, bg: "bg-slate-500/15 text-slate-300 border-slate-500/30" };

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <div className="flex min-h-screen text-slate-100 selection:bg-brand-500 selection:text-white">
      {/* ── Sidebar ─────────────────────────────────────────────────── */}
      <aside className="fixed inset-y-0 left-0 z-30 flex w-64 flex-col border-r border-white/10 bg-[#060a18]/90 backdrop-blur-2xl">
        {/* Brand */}
        <div className="flex h-16 items-center gap-3 border-b border-white/10 px-5">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 via-brand-600 to-blue-700 text-sm font-black text-white shadow-lg shadow-brand-500/30 ring-1 ring-white/20">
            SC
          </div>
          <div>
            <p className="text-base font-black tracking-tight text-white">SCGIS</p>
            <p className="text-[10px] font-semibold uppercase tracking-wider text-brand-300/80">Campus Governance</p>
          </div>
        </div>

        {/* Nav links */}
        <nav className="flex-1 space-y-1.5 px-3.5 py-6">
          <p className="mb-3 px-3 text-[11px] font-bold uppercase tracking-wider text-surface-200/40">
            Navigation Menu
          </p>
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path + item.label}
                to={item.path}
                className={`group flex items-center gap-3 rounded-xl px-3.5 py-3 text-sm font-semibold transition-all duration-200 ${
                  isActive
                    ? "bg-gradient-to-r from-brand-600 to-indigo-600 text-white shadow-lg shadow-brand-500/25 ring-1 ring-white/20"
                    : "text-surface-200/70 hover:bg-white/[0.07] hover:text-white"
                }`}
              >
                <span className="text-lg transition-transform group-hover:scale-110">{item.icon}</span>
                <span className="truncate">{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* User footer */}
        <div className="border-t border-white/10 bg-black/20 p-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-brand-500 to-indigo-600 text-sm font-bold text-white shadow-md shadow-brand-500/20 ring-1 ring-white/20">
              {user?.name?.charAt(0)?.toUpperCase() || "U"}
            </div>
            <div className="flex-1 min-w-0">
              <p className="truncate text-sm font-bold text-white">
                {user?.name || "User"}
              </p>
              <span className={`inline-block mt-0.5 rounded-md border px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${currentRole.bg}`}>
                {currentRole.label}
              </span>
            </div>
            <button
              onClick={handleLogout}
              title="Sign out of portal"
              className="cursor-pointer rounded-lg p-2 text-surface-200/40 transition hover:bg-red-500/15 hover:text-red-400"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
            </button>
          </div>
        </div>
      </aside>

      {/* ── Main content area ────────────────────────────────────────── */}
      <div className="ml-64 flex-1">
        {/* Top bar with glassmorphic effect */}
        <header className="sticky top-0 z-20 flex h-16 items-center justify-between border-b border-white/10 bg-[#060a18]/70 px-8 backdrop-blur-xl">
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-emerald-400 shadow-sm shadow-emerald-400/80 animate-pulse" />
            <span className="text-xs font-semibold uppercase tracking-wider text-surface-200/60">
              System Active & Synchronized
            </span>
          </div>
          <div className="flex items-center gap-4">
            <NotificationBell />
          </div>
        </header>

        <main className="p-8 lg:p-10">
          {children}
        </main>
      </div>
    </div>
  );
}
