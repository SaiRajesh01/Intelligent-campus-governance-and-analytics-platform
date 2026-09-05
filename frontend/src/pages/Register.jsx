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
    label: "Department",
    subtitle: "Resolve assigned complaints",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
      </svg>
    ),
  },
  {
    value: "admin",
    label: "Admin",
    subtitle: "Monitor campus & trends",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
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
    <div className={`flex min-h-screen w-full transition-colors duration-500 ${t.pageBg} selection:bg-brand-500 selection:text-white`}>
      {/* ── Left Hero ── */}
      <div className="relative hidden lg:flex lg:w-1/2 flex-col justify-between overflow-hidden bg-gradient-to-br from-indigo-700 via-brand-600 to-blue-900 p-12 text-white">
        <div className="pointer-events-none absolute inset-0 opacity-20">
          <svg className="h-full w-full" viewBox="0 0 800 800" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="400" cy="400" r="300" stroke="white" strokeWidth="1.5" strokeDasharray="6 6" />
            <path d="M100 700 C 300 500, 500 600, 700 300" stroke="white" strokeWidth="2" />
            <path d="M50 600 C 250 400, 450 500, 650 200" stroke="white" strokeWidth="1.5" opacity="0.6" />
            <path d="M150 800 C 350 600, 550 700, 750 400" stroke="white" strokeWidth="1.5" opacity="0.4" />
          </svg>
        </div>

        <div className="relative z-10 flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white/15 text-white shadow-inner backdrop-blur-md">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
            </svg>
          </div>
          <div>
            <h2 className="text-xl font-black tracking-tight text-white">BBC</h2>
            <p className="text-xs font-medium text-white/70">BrightBridge Campus</p>
          </div>
        </div>

        <div className="relative z-10 my-auto py-10">
          <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl lg:text-6xl text-white leading-tight">
            Welcome to <br />
            <span className="bg-gradient-to-r from-white via-indigo-100 to-blue-200 bg-clip-text text-transparent">
              BrightBridge Campus!
            </span>
          </h1>
          <p className="mt-6 max-w-md text-base leading-relaxed text-indigo-100/90 sm:text-lg">
            Create your profile to participate in a transparent campus ecosystem. Connect directly with departmental authorities and track every complaint transparently.
          </p>
        </div>
      </div>

      {/* ── Right Form ── */}
      <div className="flex w-full lg:w-1/2 flex-col justify-center px-6 py-12 sm:px-12 lg:px-16 xl:px-20 transition-colors duration-500">
        <div className="mx-auto w-full max-w-md animate-fade-in-up">
          {/* Mobile brand */}
          <div className="mb-8 flex items-center gap-3 lg:hidden">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-brand-500 to-brand-700 text-sm font-bold text-white shadow-lg shadow-brand-500/25">SC</div>
            <div>
              <p className={`text-base font-bold tracking-tight ${t.heading}`}>SCGIS</p>
              <p className={`text-xs ${t.footer}`}>Campus Governance</p>
            </div>
          </div>

          {/* Header + toggle */}
          <div className="mb-6 flex items-start justify-between gap-4">
            <h2 className={`text-3xl font-extrabold tracking-tight sm:text-4xl ${t.heading}`}>
              Create Account
            </h2>
            <button
              type="button"
              onClick={toggleTheme}
              className={`relative mt-1 flex h-8 w-14 flex-shrink-0 cursor-pointer items-center rounded-full border border-white/10 px-1 transition-colors duration-300 ${t.toggleBg}`}
              aria-label="Toggle light/dark mode"
            >
              <span className={`flex h-6 w-6 items-center justify-center rounded-full shadow-md transition-all duration-300 ${t.toggleDot} ${lightMode ? "translate-x-5" : "translate-x-0"}`}>
                <span className="text-sm">{lightMode ? "☀️" : "🌙"}</span>
              </span>
            </button>
          </div>

          {/* Error */}
          {error && (
            <div className={`mb-6 flex items-start gap-3 rounded-xl border p-4 text-sm ${t.errorBg}`}>
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
              <label className={`mb-2 block text-xs font-semibold uppercase tracking-wider ${t.label}`}>
                Choose Account Type
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                {ROLES.map((r) => {
                  const isSelected = form.role === r.value;
                  return (
                    <button
                      key={r.value}
                      type="button"
                      onClick={() => setForm((prev) => ({ ...prev, role: r.value, department: "" }))}
                      className={`flex cursor-pointer flex-col items-start gap-1 rounded-xl border p-3 text-left transition-all ${
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
              <div className={`animate-fade-in-up rounded-xl border p-3.5 ${t.deptPanel}`}>
                <label htmlFor="register-department" className={`mb-1.5 block text-xs font-semibold uppercase tracking-wider ${t.deptLabel}`}>
                  Select Your Assigned Department <span className="text-red-400">*</span>
                </label>
                <select
                  id="register-department" name="department"
                  value={form.department} onChange={handleChange} required
                  className={`w-full cursor-pointer rounded-lg border px-3.5 py-2.5 text-sm outline-none transition focus:ring-2 ${t.deptSelect}`}
                >
                  <option value="" className={t.deptOption}>Choose a department (e.g. EEE, Mechanical, CSE, MBA...)</option>
                  {departments.map((d) => (
                    <option key={d._id} value={d._id} className={t.deptOption}>{d.name}</option>
                  ))}
                </select>
              </div>
            )}

            {/* Full Name */}
            <div>
              <label htmlFor="register-name" className={`mb-1.5 block text-xs font-semibold uppercase tracking-wider ${t.label}`}>
                Full Name
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
                  className={`w-full rounded-xl border py-2.5 pl-11 pr-4 text-sm outline-none transition focus:ring-4 ${t.inputCls}`}
                />
              </div>
            </div>

            {/* Email */}
            <div>
              <label htmlFor="register-email" className={`mb-1.5 block text-xs font-semibold uppercase tracking-wider ${t.label}`}>
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
                  value={form.email} onChange={handleChange} placeholder="you@campus.edu"
                  className={`w-full rounded-xl border py-2.5 pl-11 pr-4 text-sm outline-none transition focus:ring-4 ${t.inputCls}`}
                />
              </div>
            </div>

            {/* Passwords */}
            <div className="grid gap-3 sm:grid-cols-2">
              <div>
                <label htmlFor="register-password" className={`mb-1.5 block text-xs font-semibold uppercase tracking-wider ${t.label}`}>
                  Password
                </label>
                <input
                  id="register-password" name="password"
                  type={showPassword ? "text" : "password"} required autoComplete="new-password"
                  value={form.password} onChange={handleChange} placeholder="Min. 6 chars"
                  className={`w-full rounded-xl border py-2.5 px-3.5 text-sm outline-none transition focus:ring-4 ${t.inputCls}`}
                />
              </div>
              <div>
                <label htmlFor="register-confirm-password" className={`mb-1.5 block text-xs font-semibold uppercase tracking-wider ${t.label}`}>
                  Confirm Password
                </label>
                <input
                  id="register-confirm-password" name="confirmPassword"
                  type={showPassword ? "text" : "password"} required autoComplete="new-password"
                  value={form.confirmPassword} onChange={handleChange} placeholder="Confirm"
                  className={`w-full rounded-xl border py-2.5 px-3.5 text-sm outline-none transition focus:ring-4 ${t.inputCls}`}
                />
              </div>
            </div>

            {/* Show/hide password */}
            <div className="flex items-center justify-end">
              <button type="button" onClick={() => setShowPassword(!showPassword)}
                className={`cursor-pointer text-xs font-medium ${t.showPwBtn}`}
              >
                {showPassword ? "Hide passwords" : "Show passwords"}
              </button>
            </div>

            {/* Submit */}
            <button
              type="submit" disabled={loading}
              className={`group relative mt-2 flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl py-3.5 text-sm font-bold transition-all hover:brightness-110 active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-60 ${t.btnPrimary}`}
            >
              {loading ? (
                <div className="flex items-center gap-2">
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  <span>Creating Account...</span>
                </div>
              ) : (
                <>
                  <span>Create Account</span>
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 transition-transform group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
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
              className={`flex w-full items-center justify-center gap-2 rounded-xl border py-3 text-sm font-semibold transition ${t.loginBtn}`}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
              </svg>
              <span>Login</span>
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
