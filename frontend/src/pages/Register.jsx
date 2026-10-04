import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import api from "../services/api";
import { useTheme, useAuthTheme } from "../context/ThemeContext";

const ROLES = [
  {
    value: "student",
    label: "Student",
    subtitle: "File & monitor complaints",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
      </svg>
    ),
  },
  {
    value: "departmentHead",
    label: "Department Staff",
    subtitle: "Resolve & manage issues",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
      </svg>
    ),
  },
];

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    role: "student",
    department: "",
  });
  const [departments, setDepartments] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const { lightMode, toggleTheme } = useTheme();
  const t = useAuthTheme();

  useEffect(() => {
    (async () => {
      try {
        const { data } = await api.get("/departments");
        setDepartments(data);
      } catch {
        // fallback
      }
    })();
  }, []);

  const handleChange = (e) =>
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (form.password !== form.confirmPassword) {
      return setError("Passwords do not match. Please verify your password.");
    }
    if (form.password.length < 6) {
      return setError("Password must be at least 6 characters long.");
    }
    if (form.role === "departmentHead" && !form.department) {
      return setError("Please select your assigned department.");
    }

    setLoading(true);
    try {
      const user = await register(
        form.name,
        form.email,
        form.password,
        form.role,
        form.role === "departmentHead" ? form.department : undefined
      );
      const dashboardMap = {
        student: "/student-dashboard",
        departmentHead: "/department-dashboard",
        admin: "/admin-dashboard",
      };
      navigate(dashboardMap[user.role] || "/");
    } catch (err) {
      setError(err.response?.data?.message || "Registration failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`relative flex min-h-screen w-full overflow-hidden transition-colors duration-500 ${t.pageBg} selection:bg-brand-500 selection:text-white`}>
      {/* ── Left Hero (Academic Institutional Showcase) ── */}
      <div className="relative hidden lg:flex lg:w-1/2 flex-col justify-between overflow-hidden bg-gradient-to-br from-indigo-900 via-brand-900 to-slate-950 p-12 xl:p-16 text-white">
        {/* Animated Background Mesh & Orbs */}
        <div className="pointer-events-none absolute -left-20 -top-20 h-96 w-96 rounded-full bg-brand-500/20 blur-3xl animate-pulse-glow" />
        <div className="pointer-events-none absolute -bottom-20 -right-20 h-96 w-96 rounded-full bg-indigo-500/20 blur-3xl animate-float" />
        <div className="pointer-events-none absolute inset-0 opacity-15">
          <svg className="h-full w-full" viewBox="0 0 800 800" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="400" cy="400" r="300" stroke="white" strokeWidth="1.5" strokeDasharray="6 6" />
            <path d="M100 700 C 300 500, 500 600, 700 300" stroke="white" strokeWidth="2" />
            <path d="M50 600 C 250 400, 450 500, 650 200" stroke="white" strokeWidth="1.5" opacity="0.6" />
            <path d="M150 800 C 350 600, 550 700, 750 400" stroke="white" strokeWidth="1.5" opacity="0.4" />
          </svg>
        </div>

        {/* Top Header / Crest */}
        <div className="relative z-10 flex items-center justify-between">
          <div className="flex items-center gap-3.5">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-tr from-brand-600 via-indigo-500 to-blue-400 text-white shadow-xl shadow-brand-500/30 ring-2 ring-white/20">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
            </div>
            <div>
              <h2 className="font-display text-2xl font-black tracking-tight text-white">SCGIS</h2>
              <p className="text-xs font-semibold uppercase tracking-widest text-indigo-200/80">BrightBridge Campus</p>
            </div>
          </div>
          <span className="rounded-full border border-white/15 bg-white/10 px-3.5 py-1 text-xs font-bold text-indigo-100 backdrop-blur-md">
            Verified Portal
          </span>
        </div>

        {/* Hero Pitch */}
        <div className="relative z-10 my-auto py-8">
          <div className="inline-flex items-center gap-2 rounded-full border border-brand-400/40 bg-brand-500/15 px-3.5 py-1 text-xs font-bold uppercase tracking-wider text-brand-300 backdrop-blur-md mb-6 animate-fade-in-up">
            🎓 Connect. Resolve. Elevate.
          </div>
          <h1 className="font-display text-4xl font-extrabold tracking-tight sm:text-5xl xl:text-6xl text-white leading-[1.15]">
            Create Your Profile, <br />
            <span className="bg-gradient-to-r from-white via-indigo-100 to-blue-300 bg-clip-text text-transparent">
              Shape Your Campus.
            </span>
          </h1>
          <p className="mt-6 max-w-lg text-base leading-relaxed text-indigo-100/90 sm:text-lg">
            Join thousands of students and faculty members collaborating transparently to resolve institutional concerns with speed and accountability.
          </p>

          <div className="mt-8 flex items-center gap-6">
            <div className="flex -space-x-2">
              {["🎓", "🏢", "⚡", "📊"].map((icon, i) => (
                <span key={i} className="flex h-10 w-10 items-center justify-center rounded-full border-2 border-indigo-900 bg-white/10 backdrop-blur-md text-sm">
                  {icon}
                </span>
              ))}
            </div>
            <p className="text-xs font-semibold text-indigo-100/80">
              Direct departmental routing across 14 campus academic and facility units
            </p>
          </div>
        </div>

        {/* Institutional Footer */}
        <div className="relative z-10 flex items-center justify-between border-t border-white/10 pt-6 text-xs text-indigo-200/70 font-medium">
          <span>BrightBridge Governance Ecosystem</span>
          <span>© 2026 Academic Governance</span>
        </div>
      </div>

      {/* ── Right Form ── */}
      <div className="flex w-full lg:w-1/2 flex-col justify-center px-6 py-12 sm:px-12 lg:px-16 xl:px-20 transition-colors duration-500">
        <div className={`mx-auto w-full max-w-md animate-fade-in-up rounded-3xl border p-8 sm:p-10 shadow-2xl transition-all duration-300 ${t.cardBg}`}>
          {/* Mobile brand */}
          <div className="mb-6 flex items-center gap-3 lg:hidden">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-brand-500 to-indigo-700 text-sm font-black text-white shadow-lg shadow-brand-500/30 ring-1 ring-white/20">
              SC
            </div>
            <div>
              <p className={`text-lg font-black tracking-tight ${t.heading}`}>SCGIS</p>
              <p className="text-[10px] font-bold uppercase tracking-wider text-brand-500">BrightBridge Campus</p>
            </div>
          </div>

          {/* Header + toggle */}
          <div className="mb-8 flex items-start justify-between gap-4">
            <div>
              <h2 className={`text-2xl sm:text-3xl font-black tracking-tight ${t.heading}`}>
                Create Account
              </h2>
              <p className={`mt-1.5 text-xs sm:text-sm ${t.footer}`}>
                Select your role and complete your institutional profile
              </p>
            </div>
            <button
              type="button"
              onClick={toggleTheme}
              className={`relative flex h-8 w-14 flex-shrink-0 cursor-pointer items-center rounded-full border px-1 transition-colors duration-300 ${t.toggleBg}`}
              aria-label="Toggle light/dark mode"
            >
              <span className={`flex h-6 w-6 items-center justify-center rounded-full transition-all duration-300 ${t.toggleDot} ${lightMode ? "translate-x-5" : "translate-x-0"}`}>
                <span className="text-xs">{lightMode ? "☀️" : "🌙"}</span>
              </span>
            </button>
          </div>

          {/* Error */}
          {error && (
            <div className={`mb-6 flex items-start gap-3 rounded-2xl border p-4 text-sm animate-fade-in-up ${t.errorBg}`}>
              <svg xmlns="http://www.w3.org/2000/svg" className={`mt-0.5 h-5 w-5 flex-shrink-0 ${t.errorIcon}`} viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              <span>{error}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Role Selection */}
            <div>
              <label className={`mb-2 block text-xs font-bold uppercase tracking-wider ${t.label}`}>
                Choose Account Type
              </label>
              <div className="grid grid-cols-2 gap-3">
                {ROLES.map((r) => {
                  const isSelected = form.role === r.value;
                  return (
                    <button
                      key={r.value}
                      type="button"
                      onClick={() => setForm((prev) => ({ ...prev, role: r.value, department: "" }))}
                      className={`flex cursor-pointer flex-col items-start gap-1 rounded-2xl border p-3.5 text-left transition-all duration-200 ${
                        isSelected ? t.roleSelected : t.roleDefault
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <span className={isSelected ? t.roleIconSelected : t.roleIconDefault}>{r.icon}</span>
                        <span className="text-sm font-bold">{r.label}</span>
                      </div>
                      <span className={`text-[11px] ${t.roleSubtitle}`}>{r.subtitle}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Department (if dept head) */}
            {form.role === "departmentHead" && (
              <div className={`animate-fade-in-up rounded-2xl border p-4 ${t.deptPanel}`}>
                <label htmlFor="register-department" className={`mb-1.5 block text-xs font-bold uppercase tracking-wider ${t.deptLabel}`}>
                  Assigned Department Unit <span className="text-red-400">*</span>
                </label>
                <select
                  id="register-department" name="department"
                  value={form.department} onChange={handleChange} required
                  className={`w-full cursor-pointer rounded-xl border px-3.5 py-2.5 text-sm outline-none transition focus:ring-4 ${t.deptSelect}`}
                >
                  <option value="" className={t.deptOption}>Select your campus department...</option>
                  {departments.map((d) => (
                    <option key={d._id} value={d._id} className={t.deptOption}>{d.name}</option>
                  ))}
                </select>
              </div>
            )}

            {/* Full Name */}
            <div>
              <label htmlFor="register-name" className={`mb-1.5 block text-xs font-bold uppercase tracking-wider ${t.label}`}>
                Full Legal Name
              </label>
              <div className="relative">
                <div className={`pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 ${t.iconCls}`}>
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
                <input
                  id="register-name" name="name" type="text" required autoComplete="name"
                  value={form.name} onChange={handleChange} placeholder="e.g. Alex Johnson"
                  className={`w-full rounded-xl border py-3 pl-11 pr-4 text-sm outline-none transition focus:ring-4 ${t.inputCls}`}
                />
              </div>
            </div>

            {/* Email */}
            <div>
              <label htmlFor="register-email" className={`mb-1.5 block text-xs font-bold uppercase tracking-wider ${t.label}`}>
                Campus Email Address
              </label>
              <div className="relative">
                <div className={`pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 ${t.iconCls}`}>
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.206" />
                  </svg>
                </div>
                <input
                  id="register-email" name="email" type="email" required autoComplete="email"
                  value={form.email} onChange={handleChange} placeholder="student@campus.edu"
                  className={`w-full rounded-xl border py-3 pl-11 pr-4 text-sm outline-none transition focus:ring-4 ${t.inputCls}`}
                />
              </div>
            </div>

            {/* Passwords */}
            <div className="grid gap-3 sm:grid-cols-2">
              <div>
                <label htmlFor="register-password" className={`mb-1.5 block text-xs font-bold uppercase tracking-wider ${t.label}`}>
                  Password
                </label>
                <input
                  id="register-password" name="password"
                  type={showPassword ? "text" : "password"} required autoComplete="new-password"
                  value={form.password} onChange={handleChange} placeholder="Min. 6 chars"
                  className={`w-full rounded-xl border py-3 px-3.5 text-sm outline-none transition focus:ring-4 ${t.inputCls}`}
                />
              </div>
              <div>
                <label htmlFor="register-confirm-password" className={`mb-1.5 block text-xs font-bold uppercase tracking-wider ${t.label}`}>
                  Confirm Password
                </label>
                <input
                  id="register-confirm-password" name="confirmPassword"
                  type={showPassword ? "text" : "password"} required autoComplete="new-password"
                  value={form.confirmPassword} onChange={handleChange} placeholder="Re-type password"
                  className={`w-full rounded-xl border py-3 px-3.5 text-sm outline-none transition focus:ring-4 ${t.inputCls}`}
                />
              </div>
            </div>

            {/* Show/hide password */}
            <div className="flex items-center justify-end">
              <button type="button" onClick={() => setShowPassword(!showPassword)}
                className={`cursor-pointer text-xs font-semibold ${t.showPwBtn}`}
              >
                {showPassword ? "Hide passwords" : "Show passwords"}
              </button>
            </div>

            {/* Submit */}
            <button
              type="submit" disabled={loading}
              className={`group relative mt-2 flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl py-3.5 text-sm font-bold transition-all ${t.btnPrimary}`}
            >
              {loading ? (
                <div className="flex items-center gap-2">
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  <span>Creating Account...</span>
                </div>
              ) : (
                <>
                  <span>Complete Registration</span>
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 transition-transform " fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                  </svg>
                </>
              )}
            </button>

            {/* Divider */}
            <div className="relative my-4 flex items-center justify-center">
              <div className={`w-full border-t ${t.dividerLine}`} />
              <span className={`absolute px-3 text-xs uppercase tracking-wider ${t.dividerBg}`}>or</span>
            </div>

            {/* Login Button */}
            <Link
              to="/login"
              className={`flex w-full items-center justify-center gap-2 rounded-xl border py-3 text-sm font-bold transition ${t.btnSecondary}`}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
              </svg>
              <span>Already have an account? Sign In</span>
            </Link>
          </form>

          {/* Footer */}
          <div className={`mt-6 text-center text-xs ${t.footer}`}>
            By registering, you agree to SCGIS Campus Code of Conduct and Governance Terms.
          </div>
        </div>
      </div>
    </div>
  );
}
