import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

/**
 * Role-based route guard.
 *
 * Usage:
 *   <Route element={<ProtectedRoute allowedRoles={["admin"]} />}>
 *     <Route path="/admin-dashboard" element={<AdminDashboard />} />
 *   </Route>
 *
 * Props:
 *   allowedRoles — array of roles permitted to access the child routes.
 *                  If omitted, any authenticated user is allowed.
 *   children     — rendered when the user passes the guard.
 */
export default function ProtectedRoute({ allowedRoles, children }) {
  const { user, loading, isAuthenticated } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-brand-500 border-t-transparent" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    // Redirect to the user's own dashboard instead of a generic 403
    const dashboardMap = {
      student: "/student-dashboard",
      departmentHead: "/department-dashboard",
      admin: "/admin-dashboard",
    };
    return <Navigate to={dashboardMap[user.role] || "/login"} replace />;
  }

  return children;
}
