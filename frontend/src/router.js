// ============================================================
// Hash router + route guards.
//   #/login     Login
//   #/register  Register
//   #/events    Available Events (user)
//   #/profile   My Registrations (user)
//   #/create    Create Event (admin)
//   #/manage    Manage Events (admin)
// ============================================================
import { isLoggedIn, logout, state } from "./store.js";
import { renderLogin, renderRegister } from "./pages/auth.js";
import { renderEvents } from "./pages/events.js";
import { renderMyRegistrations } from "./pages/myRegistrations.js";
import { renderCreateEvent } from "./pages/createEvent.js";
import { renderManageEvents } from "./pages/manageEvents.js";

export function navigate(hash) {
  location.hash = hash;
}

const PUBLIC = ["#/login", "#/register"];
const ADMIN = ["#/create", "#/manage"];

function router() {
  const hash = location.hash || "#/login";
  const loggedIn = isLoggedIn();

  // Guard: protected pages require login.
  if (!PUBLIC.includes(hash) && !loggedIn) {
    navigate("#/login");
    return;
  }
  // Guard: auth pages redirect when already logged in.
  if (PUBLIC.includes(hash) && loggedIn) {
    navigate("#/events");
    return;
  }
  // Guard: admin pages require the admin role.
  if (ADMIN.includes(hash) && !state.admin) {
    navigate("#/events");
    return;
  }

  switch (hash) {
    case "#/register":
      renderRegister();
      break;
    case "#/events":
      renderEvents();
      break;
    case "#/profile":
      renderMyRegistrations();
      break;
    case "#/create":
      renderCreateEvent();
      break;
    case "#/manage":
      renderManageEvents();
      break;
    case "#/login":
    default:
      renderLogin();
      break;
  }
}

window.addEventListener("hashchange", router);

// If a request ever hits 401/403 mid-session, kick back to login.
window.addEventListener("unhandledrejection", (e) => {
  const status = e.reason && e.reason.status;
  if (status === 401) {
    logout();
  }
});

export { router };
