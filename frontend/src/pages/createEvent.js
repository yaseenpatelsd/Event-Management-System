// ============================================================
// CREATE NEW EVENT (admin) — #/create
// POST /event/register  {name,date,location,details}
// ============================================================
import { api } from "../api.js";
import { state } from "../store.js";
import { h, root, toast, shell } from "../ui.js";
import { navigate } from "../router.js";

export function renderCreateEvent() {
  const name = h("input", { type: "text" });
  const date = h("input", { type: "date" });
  const location = h("input", { type: "text" });
  const details = h("textarea");
  const error = h("div", { class: "error left" });
  const btn = h("button", { class: "btn", type: "submit" }, "Create Event");

  const form = h(
    "form",
    {
      onsubmit: async (e) => {
        e.preventDefault();
        error.textContent = "";
        btn.disabled = true;
        btn.textContent = "Creating...";
        try {
          await api.createEvent({
            name: name.value.trim(),
            date: date.value,
            location: location.value.trim(),
            details: details.value.trim(),
          });
          toast("Event created successfully", "success");
          navigate("#/manage");
        } catch (err) {
          error.textContent = err.message;
        } finally {
          btn.disabled = false;
          btn.textContent = "Create Event";
        }
      },
    },
    h("div", { class: "field" }, h("label", {}, "Event Name:"), name),
    h("div", { class: "field" }, h("label", {}, "Event Date:"), date),
    h("div", { class: "field" }, h("label", {}, "Event Location:"), location),
    h("div", { class: "field" }, h("label", {}, "Event Details:"), details),
    btn,
    error
  );

  const card = h(
    "div",
    { class: "card", style: "max-width:460px" },
    h("h2", { class: "section-title" }, "Create New Event"),
    form
  );

  root.replaceChildren(
    shell("create", card, { admin: state.admin, username: state.username })
  );
}
