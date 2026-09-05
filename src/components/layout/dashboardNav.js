/**
 * dashboardNav.js
 * -----------------------------------------------------------------------------
 * Sidebar navigation for each role, in one place.
 *
 * Phases 7–10 add their sections here rather than editing the sidebar
 * component. A plain module (no components) so it stays Fast Refresh friendly.
 */

import { ROLES } from "../../services/authService";

/** Sections a guest sees in their portal. */
const GUEST_NAV = [
  {
    legend: "Your stay",
    items: [
      { to: "/guest/dashboard", label: "Dashboard", icon: "bi-speedometer2", end: true },
      { to: "/guest/bookings", label: "My Bookings", icon: "bi-calendar2-check" },
      { to: "/guest/requests", label: "Service Requests", icon: "bi-bell" },
    ],
  },
  {
    legend: "Account",
    items: [
      { to: "/guest/payments", label: "Payments & Bills", icon: "bi-credit-card" },
      { to: "/guest/notifications", label: "Notifications", icon: "bi-inbox" },
      { to: "/guest/feedback", label: "Give Feedback", icon: "bi-chat-quote" },
      { to: "/guest/profile", label: "Profile", icon: "bi-person-gear" },
    ],
  },
];

/**
 * Staff sections land in phases 7–10. Each role falls back to an empty list
 * until then, so the shell renders without a nav rather than crashing.
 */
export const NAV_BY_ROLE = {
  [ROLES.GUEST]: GUEST_NAV,
  [ROLES.RECEPTIONIST]: [],
  [ROLES.HOUSEKEEPING]: [],
  [ROLES.SERVICE_STAFF]: [],
  [ROLES.ADMIN]: [],
};

export function getNavForRole(role) {
  return NAV_BY_ROLE[role] ?? [];
}
