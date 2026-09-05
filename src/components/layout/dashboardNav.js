/**
 * dashboardNav.js
 * -----------------------------------------------------------------------------
 * Sidebar navigation AND topbar headings for each role, in one place.
 *
 * The heading shown in the topbar is derived from the same entry that renders
 * the sidebar link, so a route can never appear in the nav with one name and in
 * the heading with another. Phases 8-10 add their sections here rather than
 * editing the shell components.
 *
 * A plain module (no components) so it stays Fast Refresh friendly.
 */

import { ROLES } from "../../services/roles";

/* -------------------------------------------------------------------------- */
/* Guest                                                                      */
/* -------------------------------------------------------------------------- */

const GUEST_NAV = {
  notificationsPath: "/guest/notifications",
  profilePath: "/guest/profile",
  sections: [
    {
      legend: "Your stay",
      items: [
        {
          to: "/guest/dashboard",
          label: "Dashboard",
          icon: "bi-speedometer2",
          subtitle: "Your stay at a glance",
          end: true,
        },
        {
          to: "/guest/bookings",
          label: "My Bookings",
          icon: "bi-calendar2-check",
          subtitle: "Current, upcoming and past stays",
        },
        {
          to: "/guest/requests",
          label: "Service Requests",
          icon: "bi-bell",
          subtitle: "Anything you need, we'll arrange",
        },
      ],
    },
    {
      legend: "Account",
      items: [
        {
          to: "/guest/payments",
          label: "Payments & Bills",
          icon: "bi-credit-card",
          subtitle: "Invoices and outstanding balances",
        },
        {
          to: "/guest/notifications",
          label: "Notifications",
          icon: "bi-inbox",
          subtitle: "Updates about your stay",
        },
        {
          to: "/guest/feedback",
          label: "Give Feedback",
          icon: "bi-chat-quote",
          subtitle: "Tell us how we did",
        },
        {
          to: "/guest/profile",
          label: "Profile",
          icon: "bi-person-gear",
          subtitle: "Your details and preferences",
        },
      ],
    },
  ],
};

/* -------------------------------------------------------------------------- */
/* Receptionist                                                               */
/* -------------------------------------------------------------------------- */

const RECEPTION_NAV = {
  // Reception works from the live queues rather than a notification archive,
  // and staff accounts are managed by an administrator, so neither the bell's
  // "view all" nor the account chip has a destination for this role.
  notificationsPath: null,
  profilePath: null,
  sections: [
    {
      legend: "Front desk",
      items: [
        {
          to: "/reception/dashboard",
          label: "Dashboard",
          icon: "bi-speedometer2",
          subtitle: "Today at the front desk",
          end: true,
        },
        {
          to: "/reception/reservations",
          label: "Reservations",
          icon: "bi-journal-text",
          subtitle: "Every booking, past and future",
        },
        {
          to: "/reception/check-in",
          label: "Check-in",
          icon: "bi-box-arrow-in-right",
          subtitle: "Today's arrivals",
        },
        {
          to: "/reception/check-out",
          label: "Check-out",
          icon: "bi-box-arrow-right",
          subtitle: "Today's departures",
        },
        {
          to: "/reception/rooms",
          label: "Room Allocation",
          icon: "bi-grid-3x3-gap",
          subtitle: "Room status across the property",
        },
      ],
    },
    {
      legend: "Manage",
      items: [
        {
          to: "/reception/guests",
          label: "Guests",
          icon: "bi-people",
          subtitle: "Guest directory and stay history",
        },
        {
          to: "/reception/payments",
          label: "Payments",
          icon: "bi-credit-card",
          subtitle: "Invoices and outstanding balances",
        },
        {
          to: "/reception/requests",
          label: "Requests",
          icon: "bi-bell",
          subtitle: "Guest requests to assign and track",
        },
      ],
    },
  ],
};

/* -------------------------------------------------------------------------- */
/* Housekeeping                                                               */
/* -------------------------------------------------------------------------- */

const HOUSEKEEPING_NAV = {
  notificationsPath: null,
  profilePath: null,
  sections: [
    {
      legend: "Today",
      items: [
        {
          to: "/housekeeping/dashboard",
          label: "Dashboard",
          icon: "bi-speedometer2",
          subtitle: "Your rooms and the property turnaround",
          end: true,
        },
        {
          to: "/housekeeping/tasks",
          label: "Cleaning Tasks",
          icon: "bi-list-check",
          subtitle: "Start and complete your rooms",
        },
        {
          to: "/housekeeping/rooms",
          label: "Assigned Rooms",
          icon: "bi-grid-3x3-gap",
          subtitle: "Inspect and release rooms back to stock",
        },
      ],
    },
    {
      legend: "Reported",
      items: [
        {
          to: "/housekeeping/requests",
          label: "Guest Requests",
          icon: "bi-bell",
          subtitle: "Towels, linen and anything else asked for",
        },
        {
          to: "/housekeeping/maintenance",
          label: "Maintenance",
          icon: "bi-tools",
          subtitle: "Faults found on the floor",
        },
      ],
    },
  ],
};

/* -------------------------------------------------------------------------- */
/* Registry                                                                   */
/* -------------------------------------------------------------------------- */

const EMPTY_NAV = { notificationsPath: null, profilePath: null, sections: [] };

/** Service and admin land in phases 9-10. */
export const NAV_BY_ROLE = {
  [ROLES.GUEST]: GUEST_NAV,
  [ROLES.RECEPTIONIST]: RECEPTION_NAV,
  [ROLES.HOUSEKEEPING]: HOUSEKEEPING_NAV,
  [ROLES.SERVICE_STAFF]: EMPTY_NAV,
  [ROLES.ADMIN]: EMPTY_NAV,
};

function navFor(role) {
  return NAV_BY_ROLE[role] ?? EMPTY_NAV;
}

/** Sidebar sections for a role. */
export function getNavForRole(role) {
  return navFor(role).sections;
}

/** Where the notification bell's "view all" goes, or null to hide it. */
export function getNotificationsPath(role) {
  return navFor(role).notificationsPath;
}

/** Where the topbar account chip goes, or null to render it as plain text. */
export function getProfilePath(role) {
  return navFor(role).profilePath;
}

/**
 * The topbar heading for a route.
 *
 * Falls back to the closest parent section, so detail routes like
 * /guest/bookings/bk-10241 inherit "My Bookings" rather than going blank.
 */
export function resolveHeading(role, pathname) {
  const items = navFor(role).sections.flatMap((section) => section.items);

  const exact = items.find((item) => item.to === pathname);
  if (exact) return { title: exact.label, subtitle: exact.subtitle ?? "" };

  const parent = items
    .filter((item) => pathname.startsWith(`${item.to}/`))
    // Longest match wins, so a nested route picks the most specific parent.
    .sort((a, b) => b.to.length - a.to.length)[0];

  if (parent) return { title: parent.label, subtitle: parent.subtitle ?? "" };

  return { title: "Ocean Stays", subtitle: "" };
}
