import "./style.css";
import { router } from "./router.js";
import { isLoggedIn } from "./store.js";

// Boot: send to a sensible start page.
if (!location.hash) {
  location.hash = isLoggedIn() ? "#/events" : "#/login";
}
router();
