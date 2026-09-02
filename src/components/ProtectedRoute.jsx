import { Navigate, useLocation } from "react-router-dom";
import { getCurrentUser, isAuthenticated } from "../services/authService";

/**
 * Route guard for RBAC.
 *
 *   <ProtectedRoute allow={[ROLES.ADMIN]}> <AdminDashboard /> </ProtectedRoute>
 *
 * Omit `allow` to require only that the user is signed in.
 *
 * This is a UX guard, not a security boundary — the API must enforce the same
 * rules server-side on every request.
 */
function ProtectedRoute({ allow, children }) {
  const location = useLocation();

  if (!isAuthenticated()) {
    // Remember where they were headed so login can send them back.
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }

  const user = getCurrentUser();
  if (allow?.length && !allow.includes(user?.role)) {
    return <Navigate to="/unauthorized" replace />;
  }

  return children;
}

export default ProtectedRoute;
