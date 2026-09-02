import { Link } from "react-router-dom";
import "../styles/login.css";

/**
 * Stand-in for screens that aren't built yet (register, forgot password,
 * unauthorized). Keeps every link on the login page a real destination.
 */
function ComingSoon({ title, message, icon = "bi-hourglass-split" }) {
  return (
    <div className="shms-login" style={{ gridTemplateColumns: "1fr" }}>
      <main className="shms-panel">
        <div className="shms-card" style={{ textAlign: "center" }}>
          <span className="shms-card-badge" style={{ margin: "0 auto 22px" }}>
            <i className={`bi ${icon}`} aria-hidden="true" />
          </span>

          <h1 className="shms-card-title">{title}</h1>
          <p className="shms-card-subtitle">{message}</p>

          <Link className="shms-submit" to="/login" style={{ textDecoration: "none" }}>
            <i className="bi bi-arrow-left" aria-hidden="true" />
            Back to sign in
          </Link>
        </div>
      </main>
    </div>
  );
}

export default ComingSoon;
