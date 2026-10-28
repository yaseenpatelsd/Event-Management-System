// ============================================================
// EVENTS (user) — #/events
// List all events (GET /event/all) and book one (POST /event/register/{id})
// ============================================================
import { api } from "../api.js";
import { state } from "../store.js";
import { h, root, toast, shell } from "../ui.js";

export async function renderEvents() {
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
        h("th", {}, "Details"),
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
      h("h2", { class: "section-title", style: "margin:0" }, "Available Events"),
      h(
        "button",
        { class: "btn small outline", onclick: () => renderEvents() },
        "Refresh"
      )
    ),
    table
  );

  root.replaceChildren(
    shell("events", card, { admin: state.admin, username: state.username })
  );

  tableBody.appendChild(
    h("tr", {}, h("td", { colspan: 6 }, h("div", { class: "empty" }, "Loading...")))
  );

  let events = [];
  try {
    events = (await api.listEvents()) || [];
  } catch (err) {
    tableBody.replaceChildren(
      h("tr", {}, h("td", { colspan: 6 }, h("div", { class: "empty" }, err.message)))
    );
    return;
  }

  tableBody.replaceChildren();
  if (!events.length) {
    tableBody.appendChild(
      h("tr", {}, h("td", { colspan: 6 }, h("div", { class: "empty" }, "No events available yet.")))
    );
    return;
  }

  for (const ev of events) {
    const isActive = ev.status === "ACTIVE";

    const bookBtn = h(
      "button",
      {
        class: "btn small",
        disabled: isActive ? null : "",
        title: isActive ? "Register for this event" : "This event is not open for registration",
        onclick: async (e) => {
          const b = e.currentTarget;
          b.disabled = true;
          b.textContent = "Booking...";
          try {
            const out = await api.registerForEvent(ev.id);
            toast((out && out.message) || `Booked: ${ev.name}`, "success");
          } catch (err) {
            toast("Could not book: " + err.message, "error");
          } finally {
            b.disabled = false;
            b.textContent = "Book Now";
          }
        },
      },
      "Book Now"
    );

    const actions = h(
      "div",
      { class: "row-actions" },
      bookBtn,
      h(
        "button",
        {
          class: "btn small outline",
          onclick: () => showEventDetails(ev.id),
        },
        "Details"
      )
    );

    tableBody.appendChild(
      h(
        "tr",
        {},
        h("td", {}, ev.name),
        h("td", {}, ev.date || ""),
        h("td", {}, ev.location || ""),
        h("td", {}, ev.details || ""),
        h(
          "td",
          {},
          h(
            "span",
            {
              class:
                "badge " +
                (ev.status === "ACTIVE" ? "active" : ev.status === "DILIST" ? "dilist" : ""),
            },
            ev.status || "—"
          )
        ),
        h("td", { class: "actions-cell" }, actions)
      )
    );
  }
}

// Small modal showing GET /event/{id}
async function showEventDetails(id) {
  let ev;
  try {
    ev = await api.getEvent(id);
  } catch (err) {
    toast("Could not load event: " + err.message, "error");
    return;
  }

  const overlay = h("div", {
    style:
      "position:fixed;inset:0;background:rgba(0,0,0,.35);display:flex;align-items:center;justify-content:center;padding:20px;z-index:1000",
  });
  const close = () => overlay.remove();
  overlay.addEventListener("click", (e) => {
    if (e.target === overlay) close();
  });

  const box = h(
    "div",
    { class: "card", style: "max-width:420px" },
    h("h2", { class: "section-title" }, ev.name),
    h("div", { class: "field" }, h("label", {}, "Date"), h("div", {}, String(ev.date || ""))),
    h("div", { class: "field" }, h("label", {}, "Location"), h("div", {}, ev.location || "")),
    h("div", { class: "field" }, h("label", {}, "Details"), h("div", {}, ev.details || "")),
    h(
      "div",
      { class: "field" },
      h("label", {}, "Status"),
      h(
        "span",
        {
          class:
            "badge " +
            (ev.status === "ACTIVE" ? "active" : ev.status === "DILIST" ? "dilist" : ""),
        },
        ev.status || "—"
      )
    ),
    h(
      "div",
      { class: "field" },
      h("label", {}, "Event ID"),
      h("div", {}, String(ev.id))
    ),
    h("button", { class: "btn", onclick: close }, "Close")
  );

  overlay.appendChild(box);
  document.body.appendChild(overlay);
}
