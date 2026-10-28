// ============================================================
// MY REGISTRATIONS (user) — #/profile
// Uses GET /event/register  -> EventReturn[] (current user's events)
// ============================================================
import { api } from "../api.js";
import { state } from "../store.js";
import { h, root, shell } from "../ui.js";

export async function renderMyRegistrations() {
  const tableBody = h("tbody");
  const table = h(
    "table",
    {},
    h(
      "thead",
      {},
      h(
        "tr",
        {},
        h("th", {}, "Event Name"),
        h("th", {}, "Date"),
        h("th", {}, "Location"),
        h("th", {}, "Details")
      )
    ),
    tableBody
  );

  const card = h(
    "div",
    { class: "card wide" },
    h(
      "div",
      { class: "toolbar" },
      h("h2", { class: "section-title", style: "margin:0" }, "My Registrations"),
      h(
        "button",
        { class: "btn small outline", onclick: () => renderMyRegistrations() },
        "Refresh"
      )
    ),
    h("p", { class: "hint" }, "Events you have registered for."),
    table
  );

  root.replaceChildren(
    shell("profile", card, { admin: state.admin, username: state.username })
  );

  tableBody.appendChild(
    h("tr", {}, h("td", { colspan: 4 }, h("div", { class: "empty" }, "Loading...")))
  );

  let events = [];
  try {
    events = await api.getMyRegistrations();
  } catch (err) {
    tableBody.replaceChildren(
      h("tr", {}, h("td", { colspan: 4 }, h("div", { class: "empty" }, err.message)))
    );
    return;
  }

  tableBody.replaceChildren();
  if (!events.length) {
    tableBody.appendChild(
      h(
        "tr",
        {},
        h(
          "td",
          { colspan: 4 },
          h("div", { class: "empty" }, "You are not registered for any events yet.")
        )
      )
    );
    return;
  }

  for (const ev of events) {
    tableBody.appendChild(
      h(
        "tr",
        {},
        h("td", {}, ev.name),
        h("td", {}, ev.date || ""),
        h("td", {}, ev.location || ""),
        h("td", {}, ev.details || "")
      )
    );
  }
}
