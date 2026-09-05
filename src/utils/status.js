/**
 * status.js
 * -----------------------------------------------------------------------------
 * One place where a status string becomes a human label and a badge tone.
 *
 * Components render <StatusBadge status={booking.status} domain="booking" />
 * and never hardcode a colour, so the status system stays consistent across
 * every dashboard.
 */

/** Tones map to the `.shms-badge-*` modifiers in base.css. */
export const TONES = {
  SUCCESS: "success",
  WARNING: "warning",
  INFO: "info",
  DANGER: "danger",
  NEUTRAL: "neutral",
  GOLD: "gold",
};

const BOOKING = {
  PENDING: { label: "Pending", tone: TONES.WARNING },
  CONFIRMED: { label: "Confirmed", tone: TONES.INFO },
  CHECKED_IN: { label: "Checked In", tone: TONES.SUCCESS },
  CHECKED_OUT: { label: "Checked Out", tone: TONES.NEUTRAL },
  CANCELLED: { label: "Cancelled", tone: TONES.DANGER },
};

const PAYMENT = {
  PENDING: { label: "Pending", tone: TONES.WARNING },
  PAID: { label: "Paid", tone: TONES.SUCCESS },
  FAILED: { label: "Failed", tone: TONES.DANGER },
  REFUNDED: { label: "Refunded", tone: TONES.NEUTRAL },
};

const ROOM = {
  AVAILABLE: { label: "Available", tone: TONES.SUCCESS },
  READY: { label: "Ready", tone: TONES.SUCCESS },
  RESERVED: { label: "Reserved", tone: TONES.INFO },
  OCCUPIED: { label: "Occupied", tone: TONES.GOLD },
  CLEANING: { label: "Cleaning", tone: TONES.WARNING },
  MAINTENANCE: { label: "Maintenance", tone: TONES.DANGER },
};

const REQUEST = {
  PENDING: { label: "Pending", tone: TONES.WARNING },
  ASSIGNED: { label: "Assigned", tone: TONES.INFO },
  IN_PROGRESS: { label: "In Progress", tone: TONES.GOLD },
  COMPLETED: { label: "Completed", tone: TONES.SUCCESS },
  CANCELLED: { label: "Cancelled", tone: TONES.NEUTRAL },
};

const PRIORITY = {
  LOW: { label: "Low", tone: TONES.NEUTRAL },
  NORMAL: { label: "Normal", tone: TONES.INFO },
  HIGH: { label: "High", tone: TONES.WARNING },
  URGENT: { label: "Urgent", tone: TONES.DANGER },
};

const USER = {
  ACTIVE: { label: "Active", tone: TONES.SUCCESS },
  INACTIVE: { label: "Inactive", tone: TONES.NEUTRAL },
  SUSPENDED: { label: "Suspended", tone: TONES.DANGER },
};

const DOMAINS = {
  booking: BOOKING,
  payment: PAYMENT,
  room: ROOM,
  request: REQUEST,
  priority: PRIORITY,
  user: USER,
};

/** Turns SOME_STATUS into "Some Status" for anything not in the maps. */
function humanise(status) {
  return String(status)
    .toLowerCase()
    .split("_")
    .filter(Boolean)
    .map((word) => word[0].toUpperCase() + word.slice(1))
    .join(" ");
}

/**
 * Resolves a status to its label and badge tone.
 *
 * @param {string} status
 * @param {"booking"|"payment"|"room"|"request"|"priority"|"user"} domain
 * @returns {{label: string, tone: string}}
 */
export function getStatusMeta(status, domain = "booking") {
  if (!status) return { label: "Unknown", tone: TONES.NEUTRAL };
  return DOMAINS[domain]?.[status] ?? { label: humanise(status), tone: TONES.NEUTRAL };
}
