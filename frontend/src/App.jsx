import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import ProtectedRoute from "./routes/ProtectedRoute";
import Login from "./pages/Login";
import Register from "./pages/Register";
import StudentDashboard from "./pages/StudentDashboard";
import DepartmentDashboard from "./pages/DepartmentDashboard";
import AdminDashboard from "./pages/AdminDashboard";

// ── Root redirect: send authenticated users to their dashboard ────────────
function RootRedirect() {
  const { user, isAuthenticated, loading } = useAuth();

  if (loading) return null;

  if (!isAuthenticated) return <Navigate to="/login" replace />;

  const dashboardMap = {
    student: "/student-dashboard",
    departmentHead: "/department-dashboard",
    admin: "/admin-dashboard",
  };

  return <Navigate to={dashboardMap[user.role] || "/login"} replace />;
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          {/* ── Public routes ────────────────────────────────────────── */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* ── Protected: Student ──────────────────────────────────── */}
          <Route
            path="/student-dashboard"
            element={
              <ProtectedRoute allowedRoles={["student"]}>
                <StudentDashboard />
              </ProtectedRoute>
            }
          />

          {/* ── Protected: Department Head ──────────────────────────── */}
          <Route
            path="/department-dashboard"
            element={
              <ProtectedRoute allowedRoles={["departmentHead"]}>
                <DepartmentDashboard />
              </ProtectedRoute>
            }
          />

          {/* ── Protected: Admin ────────────────────────────────────── */}
          <Route
            path="/admin-dashboard"
            element={
              <ProtectedRoute allowedRoles={["admin"]}>
                <AdminDashboard />
              </ProtectedRoute>
            }
          />

          {/* ── Catch-all: redirect to role-based dashboard or login ── */}
          <Route path="*" element={<RootRedirect />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}
