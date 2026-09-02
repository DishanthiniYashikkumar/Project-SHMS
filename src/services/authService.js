/**
 * authService.js
 * -----------------------------------------------------------------------------
 * All authentication logic lives here. UI components never talk to the network
 * and never decide where a user lands after login -- they call these functions
 * and follow the role the backend returns.
 *
 * To connect the real backend later:
 *   1. Set VITE_API_BASE_URL in .env  (see .env.example)
 *   2. Set VITE_USE_MOCK_AUTH="false"
 * Nothing else in the UI has to change.
 */

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "http://localhost:8080/api";

// Mock mode lets the page run before the backend exists. Defaults to on.
const USE_MOCK_AUTH = import.meta.env.VITE_USE_MOCK_AUTH !== "false";

const TOKEN_KEY = "shms.auth.token";
const USER_KEY = "shms.auth.user";

/* -------------------------------------------------------------------------- */
/* Roles + RBAC routing                                                       */
/* -------------------------------------------------------------------------- */

export const ROLES = {
  GUEST: "GUEST",
  RECEPTIONIST: "RECEPTIONIST",
  HOUSEKEEPING: "HOUSEKEEPING",
  SERVICE_STAFF: "SERVICE_STAFF",
  ADMIN: "ADMIN",
};

/**
 * Single source of truth for "which dashboard does this role get?".
 * There is ONE login page -- the role returned by the backend picks the route.
 */
export const ROLE_ROUTES = {
  [ROLES.GUEST]: "/guest/dashboard",
  [ROLES.RECEPTIONIST]: "/reception/dashboard",
  [ROLES.HOUSEKEEPING]: "/housekeeping/dashboard",
  [ROLES.SERVICE_STAFF]: "/service/dashboard",
  [ROLES.ADMIN]: "/admin/dashboard",
};

export const ROLE_LABELS = {
  [ROLES.GUEST]: "Guest",
  [ROLES.RECEPTIONIST]: "Receptionist",
  [ROLES.HOUSEKEEPING]: "Housekeeping",
  [ROLES.SERVICE_STAFF]: "Service Staff",
  [ROLES.ADMIN]: "Administrator",
};

/** Maps a role coming off the API to its dashboard path. */
export function getDashboardRoute(role) {
  return ROLE_ROUTES[String(role ?? "").toUpperCase()] ?? "/unauthorized";
}

/* -------------------------------------------------------------------------- */
/* Session storage                                                            */
/* -------------------------------------------------------------------------- */
/*
 * Passwords are NEVER persisted anywhere -- they live in React state for the
 * duration of the submit and are dropped.
 *
 * "Remember me" only controls token durability:
 *   on  -> localStorage (survives a browser restart)
 *   off -> sessionStorage (cleared when the tab closes)
 *
 * Production note: the most XSS-resistant option is for the backend to issue an
 * httpOnly, Secure, SameSite cookie. If you switch to that, delete the two
 * storage helpers below and add `credentials: "include"` to the fetch call.
 */

function storageFor(remember) {
  return remember ? window.localStorage : window.sessionStorage;
}

export function saveSession({ token, user }, remember = false) {
  const store = storageFor(remember);
  const other = storageFor(!remember);
  try {
    other.removeItem(TOKEN_KEY);
    other.removeItem(USER_KEY);
    store.setItem(TOKEN_KEY, token);
    store.setItem(USER_KEY, JSON.stringify(user));
  } catch {
    // Private-browsing modes can throw on write; the session just won't persist.
  }
}

export function getToken() {
  try {
    return window.sessionStorage.getItem(TOKEN_KEY) ?? window.localStorage.getItem(TOKEN_KEY);
  } catch {
    return null;
  }
}

export function getCurrentUser() {
  try {
    const raw = window.sessionStorage.getItem(USER_KEY) ?? window.localStorage.getItem(USER_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function isAuthenticated() {
  return Boolean(getToken());
}

export function logout() {
  try {
    [window.sessionStorage, window.localStorage].forEach((s) => {
      s.removeItem(TOKEN_KEY);
      s.removeItem(USER_KEY);
    });
  } catch {
    /* ignore */
  }
}

/* -------------------------------------------------------------------------- */
/* Login                                                                      */
/* -------------------------------------------------------------------------- */

/** Error type the UI can render directly. `status` is handy for retry logic. */
export class AuthError extends Error {
  constructor(message, status = 0) {
    super(message);
    this.name = "AuthError";
    this.status = status;
  }
}

function messageForStatus(status, serverMessage) {
  if (serverMessage) return serverMessage;
  if (status === 401 || status === 403) return "Incorrect email or password. Please try again.";
  if (status === 423) return "This account is locked. Contact your administrator.";
  if (status === 429) return "Too many sign-in attempts. Please wait a moment and retry.";
  if (status >= 500) return "The server is unavailable right now. Please try again shortly.";
  return "We couldn't sign you in. Please try again.";
}

/**
 * Authenticates a user.
 * @param {{ email: string, password: string, remember?: boolean }} credentials
 * @returns {Promise<{ token: string, user: { id, name, email, role } }>}
 * @throws {AuthError}
 */
export async function login({ email, password, remember = false }) {
  const session = USE_MOCK_AUTH
    ? await mockLogin({ email, password })
    : await requestLogin({ email, password });

  saveSession(session, remember);
  return session;
}

async function requestLogin({ email, password }) {
  let response;
  try {
    response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify({ email: email.trim().toLowerCase(), password }),
    });
  } catch {
    throw new AuthError("Unable to reach the server. Check your connection and try again.", 0);
  }

  const payload = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new AuthError(messageForStatus(response.status, payload.message), response.status);
  }
  if (!payload.token || !payload.user?.role) {
    throw new AuthError("The server returned an unexpected response.", response.status);
  }

  return {
    token: payload.token,
    user: {
      id: payload.user.id,
      name: payload.user.name,
      email: payload.user.email,
      role: String(payload.user.role).toUpperCase(),
    },
  };
}

/* -------------------------------------------------------------------------- */
/* Mock backend (development only)                                            */
/* -------------------------------------------------------------------------- */
/*
 * No credentials are hardcoded. The mock derives a role from the local part of
 * the email so every role is reachable while the real API is being built:
 *
 *   admin@shms.com         -> Administrator
 *   reception@shms.com     -> Receptionist
 *   housekeeping@shms.com  -> Housekeeping
 *   service@shms.com       -> Service Staff
 *   anything else          -> Guest
 *
 * Any password of 8+ characters is accepted; shorter ones simulate a 401.
 */

const MOCK_ROLE_HINTS = [
  [/^(admin|administrator)/, ROLES.ADMIN],
  [/^(reception|frontdesk|desk)/, ROLES.RECEPTIONIST],
  [/^(housekeep|hk|cleaning)/, ROLES.HOUSEKEEPING],
  [/^(service|room-?service|staff)/, ROLES.SERVICE_STAFF],
];

function mockRoleFor(email) {
  const localPart = email.split("@")[0]?.toLowerCase() ?? "";
  const hit = MOCK_ROLE_HINTS.find(([pattern]) => pattern.test(localPart));
  return hit ? hit[1] : ROLES.GUEST;
}

async function mockLogin({ email, password }) {
  await new Promise((resolve) => setTimeout(resolve, 900)); // network latency

  if (password.length < 8) {
    throw new AuthError("Incorrect email or password. Please try again.", 401);
  }

  const normalised = email.trim().toLowerCase();
  const role = mockRoleFor(normalised);
  const localPart = normalised.split("@")[0] ?? "user";

  return {
    token: `mock.${btoa(`${normalised}:${role}`)}.token`,
    user: {
      id: `mock-${localPart}`,
      name: localPart.replace(/[._-]+/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()),
      email: normalised,
      role,
    },
  };
}

/* -------------------------------------------------------------------------- */
/* Validation                                                                 */
/* -------------------------------------------------------------------------- */

// Deliberately permissive -- the server is the real authority on email validity.
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

/**
 * Validates the login form.
 * @returns {{ email?: string, password?: string }} field -> message (empty = valid)
 */
export function validateCredentials({ email, password }) {
  const errors = {};

  const trimmedEmail = email.trim();
  if (!trimmedEmail) {
    errors.email = "Email address is required.";
  } else if (!EMAIL_PATTERN.test(trimmedEmail)) {
    errors.email = "Enter a valid email address, e.g. name@hotel.com";
  }

  if (!password) {
    errors.password = "Password is required.";
  } else if (password.length < 8) {
    errors.password = "Password must be at least 8 characters.";
  }

  return errors;
}
