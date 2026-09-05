import { useCallback, useEffect, useState } from "react";
import { Link, Outlet, useLocation, useNavigate } from "react-router-dom";
import DashboardSidebar from "./DashboardSidebar";
import NotificationDropdown from "../common/NotificationDropdown";
import { useAuth } from "../../hooks/useAuth";
import { getNotifications } from "../../services/notificationService";
import { initials } from "../../utils/format";
import "../../styles/dashboard.css";

/**
 * Shell for every signed-in role: sidebar, topbar and routed content.
 *
 * Notifications are fetched once here and shared with the dropdown, so the
 * unread badge and the notifications page never disagree. Pages set their own
 * heading through the `title` / `subtitle` props on the Outlet context.
 */

/** Page headings, keyed by route. Keeps the topbar honest without prop drilling. */
const PAGE_TITLES = {
  "/guest/dashboard": { title: "Dashboard", subtitle: "Your stay at a glance" },
  "/guest/bookings": { title: "My Bookings", subtitle: "Current, upcoming and past stays" },
  "/guest/requests": { title: "Service Requests", subtitle: "Anything you need, we'll arrange" },
  "/guest/payments": { title: "Payments & Bills", subtitle: "Invoices and outstanding balances" },
  "/guest/notifications": { title: "Notifications", subtitle: "Updates about your stay" },
  "/guest/feedback": { title: "Give Feedback", subtitle: "Tell us how we did" },
  "/guest/profile": { title: "Profile", subtitle: "Your details and preferences" },
};

function resolveHeading(pathname) {
  if (PAGE_TITLES[pathname]) return PAGE_TITLES[pathname];
  // Detail routes fall back to their section, e.g. /guest/bookings/bk-1
  const section = Object.keys(PAGE_TITLES).find(
    (path) => pathname.startsWith(`${path}/`) && path !== "/",
  );
  return section ? PAGE_TITLES[section] : { title: "Ocean Stays", subtitle: "" };
}

function DashboardLayout() {
  const { user, role, signOut } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);

  const heading = resolveHeading(location.pathname);

  /* ---- Notifications ---------------------------------------------------- */
  useEffect(() => {
    if (!user?.id) return undefined;
    let cancelled = false;

    getNotifications({ userId: user.id })
      .then((items) => {
        if (!cancelled) setNotifications(items);
      })
      .catch(() => {
        // A failed fetch just leaves the bell empty; it is not worth a toast.
      });

    return () => {
      cancelled = true;
    };
  }, [user?.id]);

  /* ---- Drawer: escape and scroll lock ----------------------------------- */
  useEffect(() => {
    if (!isSidebarOpen) return undefined;

    function handleKeyDown(event) {
      if (event.key === "Escape") setIsSidebarOpen(false);
    }

    const { overflow } = document.body.style;
    document.body.style.overflow = "hidden";
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = overflow;
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isSidebarOpen]);

  const closeSidebar = useCallback(() => setIsSidebarOpen(false), []);

  function handleSignOut() {
    signOut();
    navigate("/", { replace: true });
  }

  return (
    <div className="shms-dash">
      <a className="shms-skip-link" href="#dashboard-content">
        Skip to main content
      </a>

      <DashboardSidebar
        role={role}
        isOpen={isSidebarOpen}
        onClose={closeSidebar}
        onSignOut={handleSignOut}
      />

      {isSidebarOpen && (
        <button
          type="button"
          className="shms-side-scrim"
          onClick={closeSidebar}
          tabIndex={-1}
          aria-hidden="true"
        />
      )}

      <div className="shms-dash-main">
        <header className="shms-topbar">
          <button
            type="button"
            className="shms-icon-btn shms-sidebar-toggle"
            onClick={() => setIsSidebarOpen(true)}
            aria-label="Open navigation"
            aria-controls="dashboard-sidebar"
            aria-expanded={isSidebarOpen}
          >
            <i className="bi bi-list" aria-hidden="true" />
          </button>

          <div className="shms-topbar-heading">
            <h1>{heading.title}</h1>
            {heading.subtitle && <p>{heading.subtitle}</p>}
          </div>

          <div className="shms-topbar-actions">
            <Link className="shms-icon-btn" to="/" aria-label="Back to the Ocean Stays website">
              <i className="bi bi-house" aria-hidden="true" />
            </Link>

            <NotificationDropdown
              notifications={notifications}
              userId={user?.id}
              onChange={setNotifications}
              viewAllHref="/guest/notifications"
            />

            <Link
              className="shms-account-trigger"
              to="/guest/profile"
              aria-label="Your profile"
              style={{ textDecoration: "none" }}
            >
              <span className="shms-account-avatar" aria-hidden="true">
                {initials(user?.name)}
              </span>
              <span className="shms-account-name">{user?.name}</span>
            </Link>
          </div>
        </header>

        <main className="shms-dash-content" id="dashboard-content">
          <Outlet context={{ notifications, setNotifications }} />
        </main>
      </div>
    </div>
  );
}

export default DashboardLayout;
