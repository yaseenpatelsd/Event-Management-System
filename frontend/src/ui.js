// ============================================================
// Small shared UI helpers: DOM builder, toast, app shell/header.
// ============================================================
import { logout as doLogout } from "./store.js";

/** Create an element: h("div", {class:"x", onclick:fn}, child, ...) */
export function h(tag, attrs = {}, ...children) {
  const el = document.createElement(tag);
  for (const [k, v] of Object.entries(attrs)) {
    if (v === null || v === undefined || v === false) continue;
    if (k === "class") el.className = v;
    else if (k === "html") el.innerHTML = v;
    else if (k.startsWith("on") && typeof v === "function") {
      el.addEventListener(k.slice(2).toLowerCase(), v);
    } else el.setAttribute(k, v);
  }
  for (const c of children.flat()) {
    if (c === null || c === undefined || c === false) continue;
    el.appendChild(typeof c === "string" ? document.createTextNode(c) : c);
  }
  return el;
}

export const root = document.getElementById("app");

// ---------- Toast ----------
let toastTimer = null;
export function toast(message, type = "info") {
  let el = document.getElementById("toast");
  if (!el) {
    el = h("div", { id: "toast", class: "toast" });
    document.body.appendChild(el);
  }
  el.textContent = message;
  el.className = "toast show " + type;
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => (el.className = "toast"), 3000);
}

// ---------- App shell (topbar + nav) ----------
/**
 * Build the logged-in shell.
 * @param {string} active  one of: events | create | manage | profile
 * @param {HTMLElement} content
 * @param {{admin?:boolean, username?:string}} opts
 */
export function shell(active, content, opts = {}) {
  const isAdmin = !!opts.admin;

  const navItems = [
    { key: "events", label: "Events", route: "#/events" },
    { key: "profile", label: "My Registrations", route: "#/profile" },
  ];
  if (isAdmin) {
    navItems.push({ key: "create", label: "Create Event", route: "#/create" });
    navItems.push({ key: "manage", label: "Manage Events", route: "#/manage" });
  }

  const nav = h(
    "nav",
    { class: "nav" },
    navItems.map((it) =>
      h(
        "button",
        {
          class: it.key === active ? "active" : "",
          onclick: () => (location.hash = it.route),
        },
        it.label
      )
    )
  );

  const topbar = h(
    "div",
    { class: "topbar" },
    h("div", { class: "brand" }, "Event Management"),
    nav,
    h(
      "div",
      { class: "user-box" },
      h(
        "span",
        {},
        (opts.username || "user") + (isAdmin ? " (admin)" : "")
      ),
      h("button", { class: "link", onclick: () => doLogout() }, "Log Out")
    )
  );

  return h(
    "div",
    { class: "app" },
    topbar,
    h("div", { class: "page" }, content)
  );
}

/** Centered single-card screen (auth pages). */
export function centered(card) {
  return h("div", { class: "center-wrap" }, card);
}
