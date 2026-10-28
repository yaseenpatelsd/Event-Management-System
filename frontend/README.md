# Event Management — Frontend (Vite)

A clean, plain HTML/CSS/JS frontend (no framework) built with **Vite**, using
**every** endpoint of the Spring Boot backend.

## Requirements

- Node.js 18+ (tested on Node 22)
- The Spring Boot backend on `http://localhost:8081`

## Install & run

```bash
cd frontend
npm install
npm run dev
```

Open the printed URL (default http://localhost:5173). **Always run via
`npm run dev`** — the Vite dev server proxies API calls to the backend, which
avoids CORS entirely (see below).

## Endpoints used (all of them)

| Screen / action          | Endpoint                              | Auth  |
| ------------------------ | ------------------------------------- | ----- |
| Register account         | `POST /user/register`                 | no    |
| Log in                   | `POST /user/login` → `{ token }`      | no    |
| List events (user)       | `GET /event/all`                      | yes   |
| View event details       | `GET /event/{id}`                     | yes   |
| Book an event            | `POST /event/register/{id}`           | yes   |
| My registrations         | `GET /event/register`                 | yes   |
| Manage: view users       | `GET /event/register/{id}`            | yes   |
| Create event             | `POST /event/register`                | ADMIN |
| Manage: delist           | `PATCH /event/status/change?id=`      | ADMIN |
| Manage: delete           | `DELETE /event/{id}`                  | ADMIN |

## Routes

- `#/login` — Login
- `#/register` — Register
- `#/events` — Available Events (Book Now, Details)
- `#/profile` — My Registrations
- `#/create` — Create New Event (admin)
- `#/manage` — Manage Events: View Users / Delist / Delete (admin)

## About the "Failed to fetch" error

`Failed to fetch` is a **browser network error**, not an HTTP error. It means
the request never completed — usually because:

- the backend isn't running, or
- the browser called the backend **cross-origin** and the backend's CORS
  config didn't allow it.

The backend's CORS class (`corfsConfig`) is **not** a Spring `@Configuration`
(it has no annotation), so its CORS rules are never registered — any direct
browser call to `http://localhost:8081` from another origin is blocked.

### How the frontend solves it

`src/api.js`:

1. Sends requests to the **same origin** (`/api/...`), which the Vite dev
   server proxies to `http://localhost:8081`. Same-origin → no CORS → works.
2. If a request fails at the **network** level, it automatically retries
   against the direct backend URL (`http://localhost:8081`) and remembers
   whichever base works (`localStorage.apiBase`).
3. If both fail, it throws a **clear message** instead of the raw
   "Failed to fetch": it tells you to start the backend and to run the app
   with `npm run dev`.

So with the dev server running and the backend up, the error no longer occurs;
and if something is down, you get an actionable message.

## How the admin role is detected

The backend exposes **no role information**: the JWT contains only the
username (`sub`), login returns only `{token}`, and it overloads HTTP `403`
for *both* "not an admin" and service errors. So the only reliable signal is a
**successful admin-only action**.

At login the app performs a **self-cleaning probe**: it calls
`POST /event/register` with a throwaway event (`__role_probe__`).

- **200** → the user is an admin → the probe event is deleted immediately.
- **403** → not an admin.

This is reliable and leaves no data behind (verified: admin ⇒ 200 + cleanup,
user ⇒ 403). The result is cached in `localStorage.admin`. If you later add a
role to the login response or JWT, replace `api.detectAdmin()` with a simple
read of that field.

## Files

```
src/
  main.js            boot
  router.js          hash router + guards (login / admin)
  api.js             all backend calls + resilient base-URL handling
  store.js           session (token, username, admin flag) + logout
  ui.js              DOM helper, toast, app shell (topbar + nav)
  style.css          clean global styles
  pages/
    auth.js            Login + Register
    events.js          Available Events (book / details modal)
    myRegistrations.js My Registrations
    createEvent.js     Create New Event (admin)
    manageEvents.js    Manage Events (admin)
```

## Build

```bash
npm run build     # dist/
npm run preview
```

> For a production build served by something other than the Vite proxy, the
> backend must enable CORS for that origin (add `@Configuration` to
> `corfsConfig`), or serve the built files from the backend's `static/` folder.

## Backend findings (not changed here)

Thanks to your latest backend changes, these are now **fixed**:

- ✅ `GET /event/all` includes `status` (`eventReturns()` now calls
  `dto.setStatus(...)`). The UI shows real ACTIVE/DILIST badges.
- ✅ `corfsConfig` now has `@Configuration`, so CORS is active (fixes the
  direct cross-origin "Failed to fetch").
- ✅ `GET /event/register` returns the current user's registered events
  (powers "My Registrations").

Still worth knowing:

1. **HTTP 403 is overloaded.** The backend returns `403` for *not an admin*,
   *event not found*, *already delisted*, and **foreign-key conflicts**. The
   most visible one: **you cannot delete an event that still has registered
   users** — the `event_registration` FK blocks it and it surfaces as `403`.
   `src/api.js` now translates these into a readable message.
2. **CORS `allowedMethods` omits `PATCH`.** `corfsConfig` allows
   GET/POST/PUT/DELETE/OPTIONS but not `PATCH`, so the status-change call only
   works through the Vite proxy (same-origin). Add `"PATCH"` if you ever call
   the backend cross-origin.
3. **`EventRegisterService.eventReturns()`** sets `dto.setId(registration.id)`
   (the registration id, not the event id). Harmless for the current UI, which
   only reads name/date/location/details/status from that list.
4. **Errors are plain text**, not JSON (no `@ControllerAdvice`).
