import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import ProtectedRoute from "./components/ProtectedRoute";
import ComingSoon from "./pages/ComingSoon";
import Dashboard from "./pages/Dashboard";
import Login from "./pages/login";
import { ROLES } from "./services/authService";

/**
 * ONE login route for all five roles. The role returned by the backend decides
 * which dashboard the user lands on (see ROLE_ROUTES in authService.js), and
 * ProtectedRoute keeps each dashboard restricted to its role.
 */
function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/login" element={<Login />} />

        <Route
          path="/guest/dashboard"
          element={
            <ProtectedRoute allow={[ROLES.GUEST]}>
              <Dashboard role={ROLES.GUEST} />
            </ProtectedRoute>
          }
        />
        <Route
          path="/reception/dashboard"
          element={
            <ProtectedRoute allow={[ROLES.RECEPTIONIST]}>
              <Dashboard role={ROLES.RECEPTIONIST} />
            </ProtectedRoute>
          }
        />
        <Route
          path="/housekeeping/dashboard"
          element={
            <ProtectedRoute allow={[ROLES.HOUSEKEEPING]}>
              <Dashboard role={ROLES.HOUSEKEEPING} />
            </ProtectedRoute>
          }
        />
        <Route
          path="/service/dashboard"
          element={
            <ProtectedRoute allow={[ROLES.SERVICE_STAFF]}>
              <Dashboard role={ROLES.SERVICE_STAFF} />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/dashboard"
          element={
            <ProtectedRoute allow={[ROLES.ADMIN]}>
              <Dashboard role={ROLES.ADMIN} />
            </ProtectedRoute>
          }
        />

        {/* Destinations for the links on the login page — build these next. */}
        <Route
          path="/register"
          element={
            <ComingSoon
              icon="bi-person-plus"
              title="Create an account"
              message="Guest registration is coming soon. Staff accounts are created by an administrator."
            />
          }
        />
        <Route
          path="/forgot-password"
          element={
            <ComingSoon
              icon="bi-envelope-arrow-up"
              title="Reset your password"
              message="Password recovery will email you a secure reset link once the backend is connected."
            />
          }
        />
        <Route
          path="/unauthorized"
          element={
            <ComingSoon
              icon="bi-shield-exclamation"
              title="Access denied"
              message="Your role doesn't have permission to view that page."
            />
          }
        />

        <Route
          path="*"
          element={
            <ComingSoon
              icon="bi-compass"
              title="Page not found"
              message="That page doesn't exist in SHMS."
            />
          }
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
