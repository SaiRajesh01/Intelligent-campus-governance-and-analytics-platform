import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useTheme, useAuthTheme } from "../context/ThemeContext";

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const { lightMode, toggleTheme } = useTheme();
  const t = useAuthTheme();

  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

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
      setError(err.response?.data?.message || "Invalid credentials. Please check your email and password.");
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
              <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
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
            Empower your university experience. Submit grievances, track SLA countdowns in real-time, and accelerate resolutions with automated department workflows.
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
          <div className="mb-8 flex items-start justify-between gap-4">
            <h2 className={`text-3xl font-extrabold tracking-tight sm:text-4xl ${t.heading}`}>
              BrightBridge Campus
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
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label htmlFor="login-email" className={`mb-1.5 block text-xs font-semibold uppercase tracking-wider ${t.label}`}>
                Campus Email Address
              </label>
              <div className="relative">
                <div className={`pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 ${t.iconCls}`}>
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.206" />
                  </svg>
                </div>
                <input
                  id="login-email" name="email" type="email" required autoComplete="email"
                  value={form.email} onChange={handleChange}
                  placeholder="student@campus.edu or staff@campus.edu"
                  className={`w-full rounded-xl border py-3 pl-11 pr-4 text-sm outline-none transition focus:ring-4 ${t.inputCls}`}
                />
              </div>
            </div>

            <div>
              <label htmlFor="login-password" className={`mb-1.5 block text-xs font-semibold uppercase tracking-wider ${t.label}`}>
                Password
              </label>
              <div className="relative">
                <div className={`pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 ${t.iconCls}`}>
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </div>
                <input
                  id="login-password" name="password" type={showPassword ? "text" : "password"} required autoComplete="current-password"
                  value={form.password} onChange={handleChange}
                  placeholder="Enter your password"
                  className={`w-full rounded-xl border py-3 pl-11 pr-11 text-sm outline-none transition focus:ring-4 ${t.inputCls}`}
                />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className={`absolute inset-y-0 right-0 flex items-center pr-3.5 ${t.pwIcon}`}>
                  {showPassword ? (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l18 18" />
                    </svg>
                  ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  )}
                </button>
              </div>
            </div>

            <button
              type="submit" disabled={loading}
              className={`group relative flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl py-3.5 text-sm font-bold transition-all hover:brightness-110 active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-60 ${t.btnPrimary}`}
            >
              {loading ? (
                <div className="flex items-center gap-2">
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  <span>Authenticating...</span>
                </div>
              ) : (
                <>
                  <span>Login Now</span>
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 transition-transform group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                  </svg>
                </>
              )}
            </button>

            <div className="relative my-4 flex items-center justify-center">
              <div className={`w-full border-t ${t.dividerLine}`} />
              <span className={`absolute px-3 text-xs uppercase tracking-wider ${t.dividerBg}`}>or</span>
            </div>

            <Link
              to="/register"
              className={`flex w-full items-center justify-center gap-2 rounded-xl border py-3 text-sm font-semibold transition ${t.btnSecondary}`}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
              </svg>
              <span>Register</span>
            </Link>
          </form>

          <div className={`mt-8 text-center text-xs ${t.footer}`}>
            Having trouble logging in?{" "}
            <a href="#" onClick={(e) => { e.preventDefault(); alert("Please contact campus IT Helpdesk at helpdesk@campus.edu"); }} className={`underline transition ${t.link}`}>
              Contact Campus Helpdesk
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}