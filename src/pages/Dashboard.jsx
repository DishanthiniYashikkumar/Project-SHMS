import { useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { ROLE_LABELS } from "../services/authService";
import { initials } from "../utils/format";
import "../styles/layout.css";

/**
 * Placeholder landing page shared by every role — proof that the single login
 * page routes correctly. Replaced by the real per-role dashboards in phases
 * 6 through 10.
 */
function Dashboard({ role }) {
  const navigate = useNavigate();
  const { user, signOut } = useAuth();

  function handleSignOut() {
    signOut();
    navigate("/login", { replace: true });
  }

  return (
    <div className="shms-page">
      <main
        id="main-content"
        style={{ display: "grid", placeItems: "center", padding: "var(--space-8)" }}
      >
        <div
          className="shms-card shms-card-pad"
          style={{ width: "100%", maxWidth: 460, textAlign: "center" }}
        >
          <span
            className="shms-state-icon"
            aria-hidden="true"
            style={{ margin: "0 auto var(--space-4)" }}
          >
            <strong style={{ fontSize: 22, letterSpacing: "0.04em" }}>
              {initials(user?.name)}
            </strong>
          </span>

          <h1 className="shms-state-title" style={{ marginBottom: "var(--space-2)" }}>
            {ROLE_LABELS[role] ?? "User"} Dashboard
          </h1>

          <p className="shms-state-message" style={{ margin: "0 auto var(--space-6)" }}>
            Signed in as <strong>{user?.name ?? "Unknown"}</strong>
            <br />
            {user?.email}
          </p>

          <button
            type="button"
            className="shms-btn shms-btn-primary shms-btn-block"
            onClick={handleSignOut}
          >
            <i className="bi bi-box-arrow-right" aria-hidden="true" />
            Sign out
          </button>
        </div>
      </main>
    </div>
  );
}

export default Dashboard;
