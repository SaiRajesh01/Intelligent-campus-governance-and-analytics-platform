import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { NotificationProvider } from "./context/NotificationContext";
import NotificationToast from "./components/NotificationToast";
import ProtectedRoute from "./routes/ProtectedRoute";
import Login from "./pages/Login";
import Register from "./pages/Register";
import StudentDashboard from "./pages/StudentDashboard";
import DepartmentDashboard from "./pages/DepartmentDashboard";
import AdminDashboard from "./pages/AdminDashboard";
import ComplaintDetail from "./pages/ComplaintDetail";
import AnalyticsPage from "./pages/AnalyticsPage";

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
        <NotificationProvider>
          {/* Global toast overlay */}
          <NotificationToast />

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

            {/* ── Protected: Complaint Detail (any authenticated user) ── */}
            <Route
              path="/complaints/:id"
              element={
                <ProtectedRoute>
                  <ComplaintDetail />
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

            {/* ── Protected: Analytics (admin + departmentHead) ──────── */}
            <Route
              path="/analytics"
              element={
                <ProtectedRoute allowedRoles={["admin", "departmentHead"]}>
                  <AnalyticsPage />
                </ProtectedRoute>
              }
            />

            {/* ── Catch-all: redirect to role-based dashboard or login ── */}
            <Route path="*" element={<RootRedirect />} />
          </Routes>
        </NotificationProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
