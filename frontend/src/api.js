// ============================================================
// API layer — talks to the Spring Boot backend.
//
// Two ways to reach the backend:
//   1) Vite dev proxy:  "/api/*"  ->  http://localhost:8081/*
//      (see vite.config.js). Same-origin -> no CORS.
//   2) Direct backend:  http://localhost:8081/*  (fallback)
//
// The "Failed to fetch" error happens when the browser cannot
// complete the request at all (network/CORS), as opposed to an
// HTTP error like 4xx/5xx. To make this robust we:
//   - try the proxy path first (works in `npm run dev`)
//   - if it fails with a *network* error, retry against the direct
//     backend URL
//   - remember which base works so later calls are fast
//   - turn a raw network failure into a clear, human message
//
// Endpoints (latest backend):
//   POST   /user/register                 {username,email,password,confirmPassword} -> {message}
//   POST   /user/login                    {username,password} -> {token}
//   GET    /event/all                     -> EventReturn[] {id,name,date,location,details,status}
//   GET    /event/{id}                    -> EventReturn
//   POST   /event/register                {name,date,location,details} -> EventReturn   [ADMIN]
//   PATCH  /event/status/change?id=       -> (empty)                                    [ADMIN]
//   DELETE /event/{id}                    -> {message}                                  [ADMIN]
//   POST   /event/register/{id}           -> {message}   register current user for event
//   GET    /event/register/{id}           -> string[]    usernames registered for event
//   GET    /event/register                -> EventReturn[] current user's registered events
// ============================================================

const PROXY_BASE = "/api"; // used with the Vite dev proxy
const DIRECT_BASE = "http://localhost:8081"; // direct backend (fallback)

let activeBase = localStorage.getItem("apiBase") || PROXY_BASE;

function authHeaders() {
  const token = localStorage.getItem("token");
  return token ? { Authorization: "Bearer " + token } : {};
}

function buildUrl(base, path, params) {
  let url = base + path;
  if (params) {
    const q = new URLSearchParams(params).toString();
    if (q) url += "?" + q;
  }
  return url;
}

function networkError() {
  const err = new Error(
    "Cannot reach the backend at " +
      DIRECT_BASE +
      ". Make sure it is running, then start the app with `npm run dev` " +
      "(the dev server proxies API calls). If you opened the built files " +
      "directly, the backend also needs CORS enabled for this origin."
  );
  err.network = true;
  return err;
}

/** Perform a fetch; on a network-level failure, throw a networkError(). */
async function doFetch(base, path, { method, body, params }) {
  try {
    return await fetch(buildUrl(base, path, params), {
      method,
      headers: { "Content-Type": "application/json", ...authHeaders() },
      body: body ? JSON.stringify(body) : undefined,
    });
  } catch {
    // TypeError: Failed to fetch — network/CORS, not an HTTP status.
    return null;
  }
}

async function parse(res) {
  const text = await res.text();
  try {
    return text ? JSON.parse(text) : null;
  } catch {
    return text;
  }
}

async function request(path, opts = {}) {
  const { method = "GET", body, params } = opts;

  // Candidate bases: the remembered one first, then the other.
  const others = PROXY_BASE === activeBase ? DIRECT_BASE : PROXY_BASE;
  const candidates = [activeBase, others];

  let res = null;
  let usedBase = activeBase;
  for (const base of candidates) {
    res = await doFetch(base, path, { method, body, params });
    if (res) {
      usedBase = base;
      break;
    }
  }

  if (!res) throw networkError();

  if (usedBase !== activeBase) {
    activeBase = usedBase;
    localStorage.setItem("apiBase", activeBase);
  }

  const data = await parse(res);

  if (!res.ok) {
    const rawMsg =
      (data && data.message) ||
      (typeof data === "string" && data && data.length < 300 && data) ||
      "";
    const err = new Error(normaliseError(res.status, rawMsg));
    err.status = res.status;
    err.raw = rawMsg;
    throw err;
  }
  return data;
}

// The backend overloads HTTP 403 for many different failures (not an admin,
// event not found, already delisted, foreign-key conflict, ...), and returns
// an empty body. Turn that into something understandable.
function normaliseError(status, msg) {
  if (status === 403) {
    return (
      msg ||
      "Forbidden (403). The backend uses 403 for several cases: you are not an " +
        "admin, the event was not found, it is already delisted, or it still " +
        "has registered users."
    );
  }
  if (status === 401) return "Your session has expired. Please log in again.";
  if (status === 500) {
    return msg && msg.length < 300
      ? msg
      : "Server error (500). Please try again.";
  }
  return msg || `Request failed (${status})`;
}

export const api = {
  // ---- Auth ----
  register: (payload) => request("/user/register", { method: "POST", body: payload }),
  login: (payload) => request("/user/login", { method: "POST", body: payload }),

  // ---- Events (read) ----
  listEvents: () => request("/event/all"),
  getEvent: (id) => request(`/event/${id}`),

  // ---- Events (admin) ----
  createEvent: (payload) => request("/event/register", { method: "POST", body: payload }),
  changeEventStatus: (id) =>
    request("/event/status/change", { method: "PATCH", params: { id } }),
  deleteEvent: (id) => request(`/event/${id}`, { method: "DELETE" }),

  // ---- Event registration ----
  /** Register the current user for an event. */
  registerForEvent: (id) => request(`/event/register/${id}`, { method: "POST" }),
  /** Usernames registered for a given event. */
  getRegistrants: async (id) => {
    const out = await request(`/event/register/${id}`);
    return Array.isArray(out) ? out : [];
  },
  /** Events the *current user* is registered for. */
  getMyRegistrations: async () => {
    const out = await request("/event/register");
    return Array.isArray(out) ? out : [];
  },

  /**
   * Determine whether the logged-in user is an admin.
   *
   * The backend exposes no role info (JWT has only `sub`; login returns
   * only a token) and overloads 403 for both "not admin" and service
   * errors, so the only reliable signal is a *successful* admin-only
   * action. We create a throwaway event and immediately delete it.
   * A non-admin gets a 403 on create. This has no lasting side effect.
   */
  detectAdmin: async () => {
    const probe = {
      name: "__role_probe__",
      date: "2000-01-01",
      location: "probe",
      details: "role probe",
    };
    try {
      const created = await request("/event/register", { method: "POST", body: probe });
      // Success => admin. Clean up the probe event.
      if (created && created.id) {
        try {
          await request(`/event/${created.id}`, { method: "DELETE" });
        } catch {
          /* ignore cleanup failure */
        }
      }
      return true;
    } catch (err) {
      if (err.status === 403) return false;
      // Any other error (network, 400, 500) is inconclusive; assume not admin.
      return false;
    }
  },
};
