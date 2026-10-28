// ============================================================
// MANAGE EVENTS (admin) — #/manage
// GET /event/all, GET /event/register/{id}, PATCH /event/status/change?id=,
// DELETE /event/{id}
// ============================================================
import { api } from "../api.js";
import { state } from "../store.js";
import { h, root, toast, shell } from "../ui.js";

export async function renderManageEvents() {
  const tableBody = h("tbody");
  const infoBox = h("div");

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
        h("th", {}, "Status"),
        h("th", { class: "actions-cell" }, "Actions")
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
      h("h2", { class: "section-title", style: "margin:0" }, "Manage Events"),
      h(
        "button",
        { class: "btn small", onclick: () => (location.hash = "#/create") },
        "+ Create New Event"
      )
    ),
    table,
    infoBox
  );

  root.replaceChildren(
    shell("manage", card, { admin: state.admin, username: state.username })
  );

  tableBody.appendChild(
    h("tr", {}, h("td", { colspan: 5 }, h("div", { class: "empty" }, "Loading...")))
  );

  let events = [];
  try {
    events = (await api.listEvents()) || [];
  } catch (err) {
    tableBody.replaceChildren(
      h("tr", {}, h("td", { colspan: 5 }, h("div", { class: "empty" }, err.message)))
    );
    return;
  }

  tableBody.replaceChildren();
  if (!events.length) {
    tableBody.appendChild(
      h("tr", {}, h("td", { colspan: 5 }, h("div", { class: "empty" }, "No events yet.")))
    );
    return;
  }

  const refresh = () => renderManageEvents();

  for (const ev of events) {
    const viewBtn = h(
      "button",
      {
        class: "btn small outline",
        onclick: async () => {
          infoBox.replaceChildren();
          try {
            const names = await api.getRegistrants(ev.id);
            const list = h("ul", { class: "registrant-list" });
            if (!names.length) list.appendChild(h("li", {}, "No users registered yet."));
            else names.forEach((n) => list.appendChild(h("li", {}, n)));
            infoBox.replaceChildren(
              h("h3", { class: "sub-title" }, `Users Registered for ${ev.name}:`),
              list
            );
          } catch (err) {
            infoBox.replaceChildren(
              h("h3", { class: "sub-title" }, `Users Registered for ${ev.name}:`),
              h("div", { class: "empty" }, "Could not load users: " + err.message)
            );
          }
        },
      },
      "View Users"
    );

    const delistBtn = h(
      "button",
      {
        class: "btn small",
        title: "Set status to DILIST (soft delete)",
        onclick: async () => {
          if (!confirm(`Delist "${ev.name}"?`)) return;
          try {
            await api.changeEventStatus(ev.id);
            toast("Event delisted", "success");
            refresh();
          } catch (err) {
            toast("Could not delist: " + err.message, "error");
          }
        },
      },
      "Delist"
    );

    const deleteBtn = h(
      "button",
      {
        class: "btn small danger",
        title: "Permanently delete",
        onclick: async () => {
          if (!confirm(`Permanently delete "${ev.name}"? This cannot be undone.`)) return;
          try {
            const out = await api.deleteEvent(ev.id);
            toast((out && out.message) || "Event deleted", "success");
            refresh();
          } catch (err) {
            toast("Could not delete: " + err.message, "error");
          }
        },
      },
      "Delete"
    );

    const statusText = ev.status || "—";
    const statusBadge = h(
      "span",
      {
        class:
          "badge " +
          (ev.status === "ACTIVE" ? "active" : ev.status === "DILIST" ? "dilist" : ""),
      },
      statusText
    );

    tableBody.appendChild(
      h(
        "tr",
        {},
        h("td", {}, ev.name),
        h("td", {}, ev.date || ""),
        h("td", {}, ev.location || ""),
        h("td", {}, statusBadge),
        h("td", { class: "actions-cell" }, h("div", { class: "row-actions" }, viewBtn, delistBtn, deleteBtn))
      )
    );
  }
}
