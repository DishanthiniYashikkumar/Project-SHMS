import { useNavigate } from "react-router-dom";
import { getCurrentUser, logout, ROLE_LABELS } from "../services/authService";
import "../styles/login.css";

/**
 * Placeholder landing page shared by every role — proof that the single login
 * page routed correctly. Replace with the real per-role dashboards.
 */
function Dashboard({ role }) {
  const navigate = useNavigate();
  const user = getCurrentUser();

  function handleSignOut() {
    logout();
    navigate("/login", { replace: true });
  }

  return (
    <div className="shms-login" style={{ gridTemplateColumns: "1fr" }}>
      <main className="shms-panel">
        <div className="shms-card" style={{ textAlign: "center" }}>
          <span className="shms-card-badge" style={{ margin: "0 auto 22px" }}>
            <i className="bi bi-speedometer2" aria-hidden="true" />
          </span>

          <h1 className="shms-card-title">{ROLE_LABELS[role] ?? "User"} Dashboard</h1>
          <p className="shms-card-subtitle">
            Signed in as <strong>{user?.name ?? "Unknown"}</strong>
            <br />
            {user?.email}
          </p>

          <button type="button" className="shms-submit" onClick={handleSignOut}>
            <i className="bi bi-box-arrow-right" aria-hidden="true" />
            Sign out
          </button>
        </div>
      </main>
    </div>
  );
}

export default Dashboard;
