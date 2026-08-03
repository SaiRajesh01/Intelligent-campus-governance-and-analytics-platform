import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) =>
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const user = await login(form.email, form.password);
      const dashboardMap = {
        student: "/student-dashboard",
        departmentHead: "/department-dashboard",
        admin: "/admin-dashboard",
      };
      navigate(dashboardMap[user.role] || "/");
    } catch (err) {
      setError(err.response?.data?.message || "Login failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <div className="animate-fade-in-up w-full max-w-md">
        {/* ── Brand header ──────────────────────────────────────────── */}
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-brand-500 to-brand-700 shadow-lg shadow-brand-500/25">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-white">
            Welcome back
          </h1>
          <p className="mt-1 text-sm text-surface-200/70">
            Sign in to the Smart Campus Governance System
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

          {/* Email */}
          <div className="mb-5">
            <label htmlFor="login-email" className="mb-1.5 block text-sm font-medium text-surface-200">
              Email address
            </label>
            <input
              id="login-email"
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
          <div className="mb-6">
            <label htmlFor="login-password" className="mb-1.5 block text-sm font-medium text-surface-200">
              Password
            </label>
            <input
              id="login-password"
              name="password"
              type="password"
              required
              autoComplete="current-password"
              value={form.password}
              onChange={handleChange}
              placeholder="••••••••"
              className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-white placeholder-surface-200/40 outline-none transition focus:border-brand-500 focus:ring-2 focus:ring-brand-500/25"
            />
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className="w-full cursor-pointer rounded-lg bg-gradient-to-r from-brand-600 to-brand-500 px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-brand-500/25 transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? "Signing in…" : "Sign in"}
          </button>

          {/* Link to register */}
          <p className="mt-6 text-center text-sm text-surface-200/60">
            Don&apos;t have an account?{" "}
            <Link
              to="/register"
              className="font-medium text-brand-400 transition hover:text-brand-300"
            >
              Create one
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
}
