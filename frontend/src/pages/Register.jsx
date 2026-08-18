import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import api from "../services/api";

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

  // Fetch departments for departmentHead role
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
    <div className="flex min-h-screen w-full bg-surface-950 text-white selection:bg-brand-500 selection:text-white">
      {/* ── Left Hero Showcase (Split Screen) ─────────────────────────── */}
      <div className="relative hidden lg:flex lg:w-1/2 flex-col justify-between overflow-hidden bg-gradient-to-br from-indigo-700 via-brand-600 to-blue-900 p-12 text-white">
        {/* Background geometric accents */}
        <div className="pointer-events-none absolute inset-0 opacity-20">
          <svg className="h-full w-full" viewBox="0 0 800 800" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="400" cy="400" r="300" stroke="white" strokeWidth="1.5" strokeDasharray="6 6" />
            <path d="M100 700 C 300 500, 500 600, 700 300" stroke="white" strokeWidth="2" />
            <path d="M50 600 C 250 400, 450 500, 650 200" stroke="white" strokeWidth="1.5" opacity="0.6" />
            <path d="M150 800 C 350 600, 550 700, 750 400" stroke="white" strokeWidth="1.5" opacity="0.4" />
          </svg>
        </div>

        {/* Top Header Badge */}
        <div className="relative z-10 flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white/15 text-white shadow-inner backdrop-blur-md">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
            </svg>
          </div>
          <div>
            <h2 className="text-xl font-black tracking-tight text-white">SCGIS</h2>
            <p className="text-xs font-medium text-white/70">Smart Campus Governance</p>
          </div>
        </div>

        {/* Middle Hero Content */}
        <div className="relative z-10 my-auto py-10">
          <div className="mb-6 inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-white/20 text-white shadow-xl backdrop-blur-xl transition hover:rotate-12 hover:scale-105">
            <span className="text-3xl font-black">✻</span>
          </div>

          <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl lg:text-6xl text-white leading-tight">
            Join <br />
            <span className="bg-gradient-to-r from-white via-indigo-100 to-blue-200 bg-clip-text text-transparent">
              SCGIS Portal! 🚀
            </span>
          </h1>

          <p className="mt-6 max-w-md text-base leading-relaxed text-indigo-100/90 sm:text-lg">
            Create your profile to participate in a transparent campus ecosystem. Connect directly with departmental authorities and track every complaint transparently.
          </p>

          {/* Interactive Feature Pills */}
          <div className="mt-8 flex flex-wrap gap-2.5">
            {[
              "🎓 Student & Faculty Access",
              "🏢 Department Direct Routing",
              "🔔 Instant Notification Alerts",
              "🌟 Star Rating Feedback",
            ].map((tag) => (
              <span
                key={tag}
                className="rounded-xl border border-white/20 bg-white/10 px-3.5 py-1.5 text-xs font-semibold text-white backdrop-blur-md transition hover:bg-white/20"
              >
                {tag}
              </span>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="relative z-10 text-xs font-medium text-indigo-200/60">
          © 2026 SCGIS Platform. All rights reserved.
        </div>
      </div>

      {/* ── Right Form Container ──────────────────────────────────────── */}
      <div className="flex w-full lg:w-1/2 flex-col justify-center px-6 py-12 sm:px-12 lg:px-16 xl:px-20">
        <div className="mx-auto w-full max-w-md animate-fade-in-up">
          {/* Mobile Brand Header */}
          <div className="mb-8 flex items-center gap-3 lg:hidden">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-brand-500 to-brand-700 text-sm font-bold text-white shadow-lg shadow-brand-500/25">
              SC
            </div>
            <div>
              <p className="text-base font-bold text-white tracking-tight">SCGIS</p>
              <p className="text-xs text-surface-200/50">Campus Governance</p>
            </div>
          </div>

          {/* Form Header */}
          <div className="mb-6">
            <h2 className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
              Create Account
            </h2>
            <p className="mt-2 text-sm text-surface-200/70">
              Already have an account?{" "}
              <Link
                to="/login"
                className="font-semibold text-brand-400 underline underline-offset-4 transition hover:text-brand-300"
              >
                Sign in to your account
              </Link>
            </p>
          </div>

          {/* Error Alert */}
          {error && (
            <div className="mb-6 flex items-start gap-3 rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-300">
              <svg xmlns="http://www.w3.org/2000/svg" className="mt-0.5 h-5 w-5 flex-shrink-0 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              <span>{error}</span>
            </div>
          )}

          {/* Registration Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Role Selection Switcher */}
            <div>
              <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-surface-200/70">
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
                      className={`flex cursor-pointer flex-col items-start gap-1 rounded-xl border p-3 text-left transition-all ${
                        isSelected
                          ? "border-brand-400 bg-brand-500/20 text-white shadow-lg shadow-brand-500/15 ring-2 ring-brand-500/30"
                          : "border-white/10 bg-white/5 text-surface-200/60 hover:border-white/20 hover:bg-white/10 hover:text-white"
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <span className={isSelected ? "text-brand-300" : "text-surface-200/40"}>{r.icon}</span>
                        <span className="text-sm font-bold">{r.label}</span>
                      </div>
                      <span className="text-[11px] text-surface-200/50">{r.subtitle}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Department Selection (if Department Head) */}
            {form.role === "departmentHead" && (
              <div className="animate-fade-in-up rounded-xl border border-brand-500/30 bg-brand-500/10 p-3.5">
                <label htmlFor="register-department" className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-brand-200">
                  Select Your Assigned Department <span className="text-red-400">*</span>
                </label>
                <select
                  id="register-department"
                  name="department"
                  value={form.department}
                  onChange={handleChange}
                  required
                  className="w-full cursor-pointer rounded-lg border border-brand-500/40 bg-surface-900 px-3.5 py-2.5 text-sm text-white outline-none transition focus:border-brand-300 focus:ring-2 focus:ring-brand-400/30"
                >
                  <option value="" className="bg-surface-900 text-white">
                    Choose a department (e.g. EEE, Mechanical, CSE, MBA...)
                  </option>
                  {departments.map((d) => (
                    <option key={d._id} value={d._id} className="bg-surface-900 text-white">
                      {d.name}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Full Name */}
            <div>
              <label htmlFor="register-name" className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-surface-200/70">
                Full Name
              </label>
              <div className="relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-surface-200/40">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
                <input
                  id="register-name"
                  name="name"
                  type="text"
                  required
                  autoComplete="name"
                  value={form.name}
                  onChange={handleChange}
                  placeholder="e.g. Alex Johnson"
                  className="w-full rounded-xl border border-white/10 bg-white/5 py-2.5 pl-11 pr-4 text-sm text-white placeholder-surface-200/30 outline-none transition focus:border-brand-400 focus:bg-white/[0.08] focus:ring-4 focus:ring-brand-500/20"
                />
              </div>
            </div>

            {/* Email Address */}
            <div>
              <label htmlFor="register-email" className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-surface-200/70">
                Campus Email Address
              </label>
              <div className="relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-surface-200/40">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.206" />
                  </svg>
                </div>
                <input
                  id="register-email"
                  name="email"
                  type="email"
                  required
                  autoComplete="email"
                  value={form.email}
                  onChange={handleChange}
                  placeholder="you@campus.edu"
                  className="w-full rounded-xl border border-white/10 bg-white/5 py-2.5 pl-11 pr-4 text-sm text-white placeholder-surface-200/30 outline-none transition focus:border-brand-400 focus:bg-white/[0.08] focus:ring-4 focus:ring-brand-500/20"
                />
              </div>
            </div>

            {/* Password Grid (2 columns on sm) */}
            <div className="grid gap-3 sm:grid-cols-2">
              <div>
                <label htmlFor="register-password" className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-surface-200/70">
                  Password
                </label>
                <div className="relative">
                  <input
                    id="register-password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    required
                    autoComplete="new-password"
                    value={form.password}
                    onChange={handleChange}
                    placeholder="Min. 6 chars"
                    className="w-full rounded-xl border border-white/10 bg-white/5 py-2.5 px-3.5 text-sm text-white placeholder-surface-200/30 outline-none transition focus:border-brand-400 focus:bg-white/[0.08] focus:ring-4 focus:ring-brand-500/20"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="register-confirm-password" className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-surface-200/70">
                  Confirm Password
                </label>
                <div className="relative">
                  <input
                    id="register-confirm-password"
                    name="confirmPassword"
                    type={showPassword ? "text" : "password"}
                    required
                    autoComplete="new-password"
                    value={form.confirmPassword}
                    onChange={handleChange}
                    placeholder="Confirm"
                    className="w-full rounded-xl border border-white/10 bg-white/5 py-2.5 px-3.5 text-sm text-white placeholder-surface-200/30 outline-none transition focus:border-brand-400 focus:bg-white/[0.08] focus:ring-4 focus:ring-brand-500/20"
                  />
                </div>
              </div>
            </div>

            {/* Show Password Toggle */}
            <div className="flex items-center justify-end">
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="cursor-pointer text-xs font-medium text-surface-200/60 hover:text-brand-300"
              >
                {showPassword ? "Hide passwords" : "Show passwords"}
              </button>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="group relative mt-2 flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-brand-600 via-indigo-600 to-brand-500 py-3.5 text-sm font-bold text-white shadow-xl shadow-brand-500/25 transition-all hover:brightness-110 hover:shadow-brand-500/40 active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? (
                <div className="flex items-center gap-2">
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  <span>Creating Account...</span>
                </div>
              ) : (
                <>
                  <span>Create Account Now</span>
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 transition-transform group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                  </svg>
                </>
              )}
            </button>
          </form>

          {/* Footer note */}
          <div className="mt-6 text-center text-xs text-surface-200/40">
            By registering, you agree to SCGIS Campus Code of Conduct and Governance Terms.
          </div>
        </div>
      </div>
    </div>
  );
}
