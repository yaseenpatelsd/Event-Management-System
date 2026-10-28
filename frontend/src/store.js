// ============================================================
// Auth/session store + tiny role helper.
// The backend JWT only carries the username (subject); the role is
// NOT in the token. So we store the role at login time by probing
// an admin-only endpoint, and keep it in localStorage.
// ============================================================

export const state = {
  get token() {
    return localStorage.getItem("token");
  },
  get username() {
    return localStorage.getItem("username");
  },
  get admin() {
    return localStorage.getItem("admin") === "true";
  },
};

export function isLoggedIn() {
  return !!localStorage.getItem("token");
}

export function saveSession(token, username, admin = false) {
  localStorage.setItem("token", token);
  localStorage.setItem("username", username);
  localStorage.setItem("admin", admin ? "true" : "false");
}

export function setAdmin(admin) {
  localStorage.setItem("admin", admin ? "true" : "false");
}

export function logout() {
  localStorage.removeItem("token");
  localStorage.removeItem("username");
  localStorage.removeItem("admin");
  location.hash = "#/login";
}
