import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const NAV_ITEMS = {
  student: [
    { label: "Dashboard", path: "/student-dashboard", icon: "🏠" },
  ],
  departmentHead: [
    { label: "Dashboard", path: "/department-dashboard", icon: "🏠" },
  ],
  admin: [
    { label: "Dashboard", path: "/admin-dashboard", icon: "🏠" },
  ],
};

const ROLE_LABELS = {
  student: "Student",
  departmentHead: "Dept. Head",
  admin: "Admin",
};

export default function DashboardShell({ children }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const navItems = NAV_ITEMS[user?.role] || [];

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <div className="flex min-h-screen">
      {/* ── Sidebar ─────────────────────────────────────────────────── */}
      <aside className="fixed inset-y-0 left-0 z-30 flex w-64 flex-col border-r border-white/10 bg-surface-950/80 backdrop-blur-xl">
        {/* Brand */}
        <div className="flex h-16 items-center gap-3 border-b border-white/10 px-5">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-brand-500 to-brand-700 text-sm font-bold text-white shadow-lg shadow-brand-500/25">
            SC
          </div>
          <div>
            <p className="text-sm font-bold text-white tracking-tight">SCGIS</p>
            <p className="text-[11px] text-surface-200/50">Campus Governance</p>
          </div>
        </div>

        {/* Nav links */}
        <nav className="flex-1 space-y-1 px-3 py-4">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition ${
                  isActive
                    ? "bg-brand-500/15 text-brand-300"
                    : "text-surface-200/60 hover:bg-white/5 hover:text-white"
                }`}
              >
                <span className="text-base">{item.icon}</span>
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* User footer */}
        <div className="border-t border-white/10 p-4">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-brand-400 to-brand-600 text-sm font-bold text-white">
              {user?.name?.charAt(0)?.toUpperCase() || "U"}
            </div>
            <div className="flex-1 min-w-0">
              <p className="truncate text-sm font-medium text-white">
                {user?.name || "User"}
              </p>
              <p className="text-[11px] text-surface-200/50">
                {ROLE_LABELS[user?.role] || user?.role}
              </p>
            </div>
            <button
              onClick={handleLogout}
              title="Sign out"
              className="cursor-pointer rounded-lg p-1.5 text-surface-200/40 transition hover:bg-white/10 hover:text-red-400"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
            </button>
          </div>
        </div>
      </aside>

      {/* ── Main content ────────────────────────────────────────────── */}
      <main className="ml-64 flex-1 p-8">
        {children}
      </main>
    </div>
  );
}
