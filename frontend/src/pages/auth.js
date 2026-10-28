// ============================================================
// Auth pages: Login (#/login) and Register (#/register)
// ============================================================
import { api } from "../api.js";
import { saveSession, setAdmin, logout } from "../store.js";
import { h, root, toast, centered } from "../ui.js";
import { navigate } from "../router.js";

function go(hash) {
  location.hash = hash;
}

// ---------- Login ----------
export function renderLogin() {
  const username = h("input", { type: "text", placeholder: "Username", autofocus: "" });
  const password = h("input", { type: "password", placeholder: "Password" });
  const error = h("div", { class: "error" });
  const btn = h("button", { class: "btn", type: "submit" }, "Log In");

  const form = h(
    "form",
    {
      onsubmit: async (e) => {
        e.preventDefault();
        error.textContent = "";
        btn.disabled = true;
        btn.textContent = "Logging in...";
        try {
          const res = await api.login({
            username: username.value.trim(),
            password: password.value,
          });
          if (!res || !res.token) throw new Error("No token returned");

          // Persist token first so the admin probe below is authenticated.
          saveSession(res.token, username.value.trim(), false);
          await detectAdmin();
          toast("Logged in", "success");
          navigate("#/events");
        } catch (err) {
          logout();
          error.textContent = err.message;
        } finally {
          btn.disabled = false;
          btn.textContent = "Log In";
        }
      },
    },
    h("div", { class: "field" }, username),
    h("div", { class: "field" }, password),
    btn,
    error
  );

  const card = h(
    "div",
    { class: "card" },
    h("h1", { class: "title" }, "Login"),
    form,
    h(
      "div",
      { class: "link-row" },
      "Don't have an account? ",
      h("button", { class: "link", onclick: () => go("#/register") }, "Sign Up")
    )
  );

  root.replaceChildren(centered(card));
}

// Probe an admin-only action to learn the role (JWT has no role claim).
async function detectAdmin() {
  const isAdmin = await api.detectAdmin();
  setAdmin(isAdmin);
}

// ---------- Register ----------
export function renderRegister() {
  const username = h("input", { type: "text", placeholder: "Username", autofocus: "" });
  const email = h("input", { type: "email", placeholder: "Email" });
  const password = h("input", { type: "password", placeholder: "Password" });
  const confirm = h("input", { type: "password", placeholder: "Confirm Password" });
  const error = h("div", { class: "error" });
  const btn = h("button", { class: "btn", type: "submit" }, "Sign Up");

  const form = h(
    "form",
    {
      onsubmit: async (e) => {
        e.preventDefault();
        error.textContent = "";
        if (password.value !== confirm.value) {
          error.textContent = "Password and Confirm Password do not match";
          return;
        }
        btn.disabled = true;
        btn.textContent = "Signing up...";
        try {
          const res = await api.register({
            username: username.value.trim(),
            email: email.value.trim(),
            password: password.value,
            confirmPassword: confirm.value,
          });
          toast((res && res.message) || "Registered successfully", "success");
          navigate("#/login");
        } catch (err) {
          error.textContent = err.message;
        } finally {
          btn.disabled = false;
          btn.textContent = "Sign Up";
        }
      },
    },
    h("div", { class: "field" }, username),
    h("div", { class: "field" }, email),
    h("div", { class: "field" }, password),
    h("div", { class: "field" }, confirm),
    btn,
    error
  );

  const card = h(
    "div",
    { class: "card" },
    h("h1", { class: "title" }, "Register"),
    form,
    h(
      "div",
      { class: "link-row" },
      "Already have an account? ",
      h("button", { class: "link", onclick: () => go("#/login") }, "Log In")
    )
  );

  root.replaceChildren(centered(card));
}
