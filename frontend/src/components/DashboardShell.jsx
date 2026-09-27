import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useTheme, useDashboardTheme } from "../context/ThemeContext";
import NotificationBell from "./NotificationBell";

const NAV_ITEMS = {
  student: [
    { label: "Overview & Complaints", path: "/student-dashboard", icon: "📋" },
  ],
  departmentHead: [
    { label: "Department Queue", path: "/department-dashboard", icon: "🏢" },
  ],
  admin: [
    { label: "Management Console", path: "/admin-dashboard", icon: "⚙️" },
    { label: "Analytics & Trends", path: "/analytics", icon: "📊" },
  ],
};

const ROLE_BADGES_DARK = {
  student: { label: "Student", bg: "bg-blue-500/15 text-blue-300 border-blue-500/30" },
  departmentHead: { label: "Department Head", bg: "bg-indigo-500/15 text-indigo-300 border-indigo-500/30" },
  admin: { label: "Administrator", bg: "bg-amber-500/15 text-amber-300 border-amber-500/30" },
};

const ROLE_BADGES_LIGHT = {
  student: { label: "Student", bg: "bg-blue-50 text-blue-700 border-blue-200" },
  departmentHead: { label: "Department Head", bg: "bg-indigo-50 text-indigo-700 border-indigo-200" },
  admin: { label: "Administrator", bg: "bg-amber-50 text-amber-700 border-amber-200" },
};

export default function DashboardShell({ children }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { lightMode, toggleTheme } = useTheme();
  const d = useDashboardTheme();

  const navItems = NAV_ITEMS[user?.role] || [];
  const roleBadges = lightMode ? ROLE_BADGES_LIGHT : ROLE_BADGES_DARK;
  const currentRole = roleBadges[user?.role] || { label: user?.role, bg: "bg-slate-500/15 text-slate-300 border-slate-500/30" };

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <div className={`flex min-h-screen transition-colors duration-500 ${lightMode ? d.shellBg : ""} ${lightMode ? "text-slate-800" : "text-slate-100"} selection:bg-brand-500 selection:text-white`}>
      {/* ── Sidebar ── */}
      <aside className={`fixed inset-y-0 left-0 z-30 flex w-64 flex-col backdrop-blur-2xl transition-colors duration-500 ${d.sidebarBg}`}>
        {/* Brand */}
        <div className={`flex h-20 items-center gap-3.5 px-6 ${lightMode ? "border-b border-slate-200/80" : "border-b border-white/10"}`}>
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-tr from-brand-600 via-indigo-500 to-blue-500 text-sm font-black text-white shadow-xl shadow-brand-500/30 ring-2 ring-white/20 transition-transform hover:scale-105">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 14l9-5-9-5-9 5 9 5z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" />
            </svg>
          </div>
          <div>
            <p className={`font-display text-lg font-black tracking-tight ${d.sidebarBrand}`}>SCGIS</p>
            <p className={`text-[10px] font-bold uppercase tracking-widest ${d.sidebarSubBrand}`}>BrightBridge Campus</p>
          </div>
        </div>

        {/* Nav links */}
        <nav className="flex-1 space-y-2 px-4 py-6">
          <p className={`mb-3 px-3 text-[11px] font-bold uppercase tracking-wider ${d.sidebarLabel}`}>
            Campus Navigation
          </p>
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path + item.label}
                to={item.path}
                className={`group relative flex items-center gap-3.5 rounded-2xl px-4 py-3 text-sm font-bold transition-all duration-200 ${
                  isActive ? d.sidebarActive : d.sidebarLink
                }`}
              >
                <span className="text-xl transition-transform group-hover:scale-110">{item.icon}</span>
                <span className="truncate">{item.label}</span>
                {isActive && (
                  <span className="absolute right-3 h-2 w-2 rounded-full bg-white shadow-sm animate-pulse" />
                )}
              </Link>
            );
          })}
        </nav>

        {/* User footer */}
        <div className={`p-4 ${d.sidebarFooterBg}`}>
          <div className="flex items-center gap-3 rounded-2xl border border-white/5 bg-white/[0.03] p-2.5">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-brand-500 via-indigo-600 to-blue-600 text-sm font-bold text-white shadow-md shadow-brand-500/25 ring-2 ring-white/20">
              {user?.name?.charAt(0)?.toUpperCase() || "U"}
            </div>
            <div className="flex-1 min-w-0">
              <p className={`truncate text-xs font-bold ${d.sidebarUserName}`}>
                {user?.name || "User"}
              </p>
              <span className={`inline-block mt-0.5 rounded-md border px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider ${currentRole.bg}`}>
                {currentRole.label}
              </span>
            </div>
            <button
              onClick={handleLogout}
              title="Sign out of portal"
              className={`cursor-pointer rounded-xl p-2 transition ${d.sidebarLogout}`}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
            </button>
          </div>
        </div>
      </aside>

      {/* ── Main content area ── */}
      <div className="ml-64 flex-1">
        {/* Top bar */}
        <header className={`sticky top-0 z-20 flex h-20 items-center justify-between px-8 lg:px-10 backdrop-blur-xl transition-colors duration-500 ${d.headerBg}`}>
          <div className="flex items-center gap-3">
            <div className={`flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-bold uppercase tracking-wider ${lightMode ? "border-emerald-200 bg-emerald-50 text-emerald-700" : "border-emerald-500/30 bg-emerald-500/10 text-emerald-300"}`}>
              <span className="h-2 w-2 rounded-full bg-emerald-500 shadow-sm animate-pulse" />
              <span>Campus Live Synced</span>
            </div>
          </div>
          <div className="flex items-center gap-4">
            {/* Theme Toggle */}
            <button
              type="button"
              onClick={toggleTheme}
              className={`relative flex h-8 w-14 cursor-pointer items-center rounded-full px-1 transition-colors duration-300 ${lightMode ? "bg-slate-200 border border-slate-300" : "bg-white/15 border border-white/10"}`}
              aria-label="Toggle light/dark mode"
            >
              <span className={`flex h-6 w-6 items-center justify-center rounded-full bg-white shadow-md transition-all duration-300 ${lightMode ? "translate-x-5" : "translate-x-0"}`}>
                <span className="text-xs">{lightMode ? "☀️" : "🌙"}</span>
              </span>
            </button>
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
