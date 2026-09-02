import { useCallback } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import LoginForm from "../components/LoginForm";
import { getDashboardRoute } from "../services/authService";
import "../styles/login.css";

const USE_MOCK_AUTH = import.meta.env.VITE_USE_MOCK_AUTH !== "false";

const CAPABILITIES = [
  { icon: "bi-calendar2-check", label: "Reservations" },
  { icon: "bi-key", label: "Front Desk" },
  { icon: "bi-stars", label: "Guest Services" },
];

/**
 * One login page for every role. After authentication the role returned by the
 * backend decides the destination -- see ROLE_ROUTES in authService.js.
 */
function Login() {
  const navigate = useNavigate();
  const location = useLocation();

  const handleAuthenticated = useCallback(
    (user) => {
      // If a guard bounced the user here, send them back where they came from.
      const intended = location.state?.from;
      navigate(intended ?? getDashboardRoute(user.role), { replace: true });
    },
    [navigate, location.state],
  );

  return (
    <div className="shms-login">
      {/* =================================================== LEFT: VISUAL */}
      <section className="shms-visual" aria-labelledby="shms-visual-title">
        <div className="shms-visual-media" aria-hidden="true" />
        <div className="shms-visual-overlay" aria-hidden="true" />

        <div className="shms-visual-inner">
          <div className="shms-brand">
            <span className="shms-brand-mark">
              <i className="bi bi-buildings" aria-hidden="true" />
            </span>
            <span className="shms-brand-name">SHMS</span>
          </div>

          <div className="shms-visual-copy">
            <h1 className="shms-visual-title" id="shms-visual-title">
              Smart Hotel
              <br />
              Management System
            </h1>
            <span className="shms-rule" />
            <p className="shms-tagline">Smart Management. Seamless Hospitality.</p>
            <p className="shms-visual-note">
              Reservations, housekeeping and guest services, run from one intelligent platform.
            </p>
          </div>

          <ul className="shms-capabilities">
            {CAPABILITIES.map(({ icon, label }) => (
              <li key={label} className="shms-capability">
                <i className={`bi ${icon}`} aria-hidden="true" />
                {label}
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* ===================================================== RIGHT: FORM */}
      <main className="shms-panel">
        <div className="shms-card">
          <span className="shms-card-badge">
            <i className="bi bi-buildings" aria-hidden="true" />
          </span>

          <h2 className="shms-card-title">Welcome Back</h2>
          <p className="shms-card-subtitle">Sign in to continue to your dashboard</p>

          <LoginForm onAuthenticated={handleAuthenticated} />

          <p className="shms-secure">
            <i className="bi bi-shield-lock" aria-hidden="true" />
            Secure authentication with role-based access
          </p>
        </div>


      </main>
    </div>
  );
}

export default Login;
