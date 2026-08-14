import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import api from "../services/api";

const ROLES = [
  {
    value: "student",
    label: "Student",
    description: "Submit and track complaints",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
      </svg>
    ),
  },
  {
    value: "departmentHead",
    label: "Department Head",
    description: "Manage department complaints",
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

  // Fetch departments for the departmentHead role selector
  useEffect(() => {
    (async () => {
      try {
        const { data } = await api.get("/departments");
        setDepartments(data);
      } catch {
        // silently fail — dropdown will just be empty
      }
    })();
  }, []);

  const handleChange = (e) =>
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (form.password !== form.confirmPassword) {
      return setError("Passwords do not match");
    }
    if (form.password.length < 6) {
      return setError("Password must be at least 6 characters");
    }
    if (form.role === "departmentHead" && !form.department) {
      return setError("Please select a department");
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
    <div className="flex min-h-screen items-center justify-center px-4 py-12">
      <div className="animate-fade-in-up w-full max-w-md">
        {/* ── Brand header ──────────────────────────────────────────── */}
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-brand-500 to-brand-700 shadow-lg shadow-brand-500/25">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-white">
            Create your account
          </h1>
          <p className="mt-1 text-sm text-surface-200/70">
            Join the Smart Campus Governance System
          </p>
        </div>

        {/* ── Card ──────────────────────────────────────────────────── */}
        <form
          onSubmit={handleSubmit}
          className="rounded-2xl border border-white/10 bg-white/5 p-8 shadow-2xl backdrop-blur-xl"
        >
          {error && (
            <div className="mb-5 rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">
              {error}
            </div>
          )}

          {/* Name */}
          <div className="mb-4">
            <label htmlFor="register-name" className="mb-1.5 block text-sm font-medium text-surface-200">
              Full name
            </label>
            <input
              id="register-name"
              name="name"
              type="text"
              required
              autoComplete="name"
              value={form.name}
              onChange={handleChange}
              placeholder="John Doe"
              className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-white placeholder-surface-200/40 outline-none transition focus:border-brand-500 focus:ring-2 focus:ring-brand-500/25"
            />
          </div>

          {/* Email */}
          <div className="mb-4">
            <label htmlFor="register-email" className="mb-1.5 block text-sm font-medium text-surface-200">
              Email address
            </label>
            <input
              id="register-email"
              name="email"
              type="email"
              required
              autoComplete="email"
              value={form.email}
              onChange={handleChange}
              placeholder="you@campus.edu"
              className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-white placeholder-surface-200/40 outline-none transition focus:border-brand-500 focus:ring-2 focus:ring-brand-500/25"
            />
          </div>

          {/* Password */}
          <div className="mb-4">
            <label htmlFor="register-password" className="mb-1.5 block text-sm font-medium text-surface-200">
              Password
            </label>
            <input
              id="register-password"
              name="password"
              type="password"
              required
              autoComplete="new-password"
              value={form.password}
              onChange={handleChange}
              placeholder="Min. 6 characters"
              className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-white placeholder-surface-200/40 outline-none transition focus:border-brand-500 focus:ring-2 focus:ring-brand-500/25"
            />
          </div>

          {/* Confirm Password */}
          <div className="mb-5">
            <label htmlFor="register-confirm-password" className="mb-1.5 block text-sm font-medium text-surface-200">
              Confirm password
            </label>
            <input
              id="register-confirm-password"
              name="confirmPassword"
              type="password"
              required
              autoComplete="new-password"
              value={form.confirmPassword}
              onChange={handleChange}
              placeholder="••••••••"
              className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-white placeholder-surface-200/40 outline-none transition focus:border-brand-500 focus:ring-2 focus:ring-brand-500/25"
            />
          </div>

          {/* Role selector */}
          <div className="mb-5">
            <label className="mb-2 block text-sm font-medium text-surface-200">
              I am a…
            </label>
            <div className="grid grid-cols-2 gap-3">
              {ROLES.map((r) => (
                <button
                  key={r.value}
                  type="button"
                  onClick={() => setForm((prev) => ({ ...prev, role: r.value, department: "" }))}
                  className={`flex cursor-pointer flex-col items-center gap-1.5 rounded-xl border px-3 py-3.5 text-center transition ${
                    form.role === r.value
                      ? "border-brand-500 bg-brand-500/15 text-brand-300 shadow-md shadow-brand-500/10"
                      : "border-white/10 bg-white/5 text-surface-200/70 hover:border-white/20 hover:bg-white/10"
                  }`}
                >
                  {r.icon}
                  <span className="text-sm font-semibold">{r.label}</span>
                  <span className="text-[11px] leading-tight opacity-60">
                    {r.description}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Department selector — shown only for departmentHead */}
          {form.role === "departmentHead" && (
            <div className="mb-6">
              <label htmlFor="register-department" className="mb-1.5 block text-sm font-medium text-surface-200">
                Select Department
              </label>
              {departments.length === 0 ? (
                <p className="rounded-lg border border-orange-500/30 bg-orange-500/10 px-4 py-2.5 text-sm text-orange-300">
                  No departments found. Please ask an admin to create departments first.
                </p>
              ) : (
                <select
                  id="register-department"
                  name="department"
                  value={form.department}
                  onChange={handleChange}
                  required
                  className="w-full cursor-pointer rounded-lg border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-white outline-none transition focus:border-brand-500 focus:ring-2 focus:ring-brand-500/25"
                >
                  <option value="" className="bg-surface-900 text-white">
                    Choose a department…
                  </option>
                  {departments.map((d) => (
                    <option key={d._id} value={d._id} className="bg-surface-900 text-white">
                      {d.name}
                    </option>
                  ))}
                </select>
              )}
            </div>
          )}

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className="w-full cursor-pointer rounded-lg bg-gradient-to-r from-brand-600 to-brand-500 px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-brand-500/25 transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? "Creating account…" : "Create account"}
          </button>

          {/* Link to login */}
          <p className="mt-6 text-center text-sm text-surface-200/60">
            Already have an account?{" "}
            <Link
              to="/login"
              className="font-medium text-brand-400 transition hover:text-brand-300"
            >
              Sign in
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
}
