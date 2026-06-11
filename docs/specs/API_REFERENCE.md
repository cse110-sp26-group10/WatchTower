# WatchTower API Reference

The WatchTower server runs on `http://localhost:8080` by default.

## Authentication

Most endpoints require a valid session. The server uses **HttpOnly cookies** — after a successful `/login` or `/signup` the server sets `access_token` and `refresh_token` cookies automatically. All subsequent requests from the same origin carry these cookies; no manual token handling is needed in the dashboard frontend.

The one exception is `/api/log`, which uses a **Bearer API key** in the `Authorization` header instead of cookies (it is called by the tracker running on a third-party site, not by the dashboard).

---

## Event Ingestion

### `POST /api/log`

Ingest a tracker event from a monitored site.

**Auth:** `Authorization: Bearer <project_api_key>` (the project's API key, a UUID)

**Request body:** A JSON event object. See `src/app/README.md` for the full raw event schema.

**Response**
```json
{ "status": "success" }
```

**Notes**
- The request origin must match the `website_url` of the project that owns the API key.
- Triggers an async error notification if `event_type` is `"error"`.

---

## Authentication Endpoints

### `POST /signup`

Create a new account.

**Request body**
```json
{ "email": "user@example.com", "password": "secret" }
```

**Response** — sets `access_token` and `refresh_token` cookies
```json
{ "status": "success" }
```

---

### `POST /login`

Log in with email and password.

**Request body**
```json
{ "email": "user@example.com", "password": "secret" }
```

**Response** — sets `access_token` and `refresh_token` cookies
```json
{ "status": "success" }
```

---

### `POST /logout`

End the current session.

**Request body:** none

**Response** — clears `access_token` and `refresh_token` cookies
```json
{ "status": "success" }
```

---

### `POST /auth/refresh`

Exchange the refresh token for a new access token. Called automatically by the dashboard when a session expires.

**Auth:** `refresh_token` cookie

**Request body:** none

**Response** — sets new `access_token` and `refresh_token` cookies
```json
{ "status": "success" }
```

---

## Profile

### `GET /profile`

Return the current user's profile.

**Auth:** `access_token` cookie

**Response**
```json
{
  "email": "user@example.com",
  "created_at": "2026-05-01T00:00:00.000Z",
  "alert_id": "uuid-used-as-ntfy-topic",
  "notify_methods": ["push", "email"]
}
```

`notify_methods` is an array of active channels (`"push"`, `"email"`), an empty array (opted out of all), or `null` (preference not set — defaults to all channels).

---

## Events

### `GET /api/events`

Return all unresolved events across the current user's projects, ordered newest first.

**Auth:** `access_token` cookie

**Response** — array of event rows
```json
[
  {
    "id": 1,
    "event_type": "error",
    "timestamp": "2026-06-01T12:00:00.000Z",
    "project_id": 5,
    "current_url": "https://example.com/shop",
    "host": "example.com",
    "pathname": "/shop",
    "referrer": "",
    "referring_domain": "",
    "browser": { "name": "Chrome", "version": "124" },
    "deployment": { "id": "dep_001", "version": "1.0.0", "commit_hash": "abc1234", "deployed_at": "2026-05-30T00:00:00.000Z", "author": "evan" },
    "ip": "1.2.3.4",
    "metadata": { "severity": "critical", "message": "TypeError: cannot read properties of null" },
    "resolved": false
  }
]
```

---

### `POST /api/events/resolve`

Mark one or more events as resolved (soft-delete). Only events belonging to the user's own projects can be resolved.

**Auth:** `access_token` cookie

**Request body**
```json
{ "ids": [1, 2, 3] }
```

**Response**
```json
{ "status": "success" }
```

---

## Uptime

### `GET /api/uptime`

Return the uptime log across all of the current user's projects, ordered newest first.

**Auth:** `access_token` cookie

**Response** — array of uptime log rows
```json
[
  {
    "id": 1,
    "project_id": 5,
    "url": "https://example.com",
    "timestamp": "2026-06-01T12:00:00.000Z",
    "is_up": true,
    "status": 200,
    "latency": 143,
    "attempts": [
      { "timestamp": "2026-06-01T12:00:00.000Z", "status": 200, "latency": 143, "error": null }
    ]
  }
]
```

---

## Projects

### `GET /api/projects`

Return all projects the current user has access to, including their permission level.

**Auth:** `access_token` cookie

**Response** — array of project rows
```json
[
  {
    "id": 5,
    "name": "My Store",
    "website_url": "https://example.com",
    "api_key": "uuid-used-as-bearer-token",
    "permission_level": "Owner"
  }
]
```

`permission_level` is `"Owner"`, `"Co-Owner"`, or `"Viewer"`.

---

### `POST /api/projects/create`

Create a new project. The creator is assigned as Owner and uptime monitoring starts immediately.

**Auth:** `access_token` cookie

**Request body**
```json
{ "name": "My Store", "website_url": "https://example.com" }
```

**Response** — the created project row
```json
{
  "id": 5,
  "name": "My Store",
  "website_url": "https://example.com",
  "api_key": "uuid-api-key"
}
```

---

### `POST /api/projects/delete`

Delete a project (Owner or Co-Owner) or remove yourself from a shared project (Viewer).

**Auth:** `access_token` cookie

**Request body**
```json
{ "id": 5 }
```

**Response**
```json
{ "status": "success" }
```

---

### `POST /api/projects/share`

Share a project with another user. Requires Owner or Co-Owner permission. Cannot share with yourself or assign the `"Owner"` level.

**Auth:** `access_token` cookie

**Request body**
```json
{
  "id": 5,
  "user_id": "uuid-of-user-to-share-with",
  "permission_level": "Co-Owner"
}
```

`permission_level` must be `"Co-Owner"` or `"Viewer"`.

**Response**
```json
{ "status": "success" }
```

---

### `POST /api/projects/unshare`

Remove a user's access to a project. Requires Owner or Co-Owner permission. Cannot unshare yourself.

**Auth:** `access_token` cookie

**Request body**
```json
{ "id": 5, "user_id": "uuid-of-user-to-remove" }
```

**Response**
```json
{ "status": "success" }
```

---

## Notifications

### `POST /api/notifications/methods`

Update the current user's notification channel preferences.

**Auth:** `access_token` cookie

**Request body**
```json
{ "methods": ["push", "email"] }
```

| Value | Meaning |
|-------|---------|
| `["push", "email"]` | Both channels enabled |
| `["push"]` | Push only |
| `["email"]` | Email only |
| `[]` | All notifications disabled |
| `null` | Clear preference — falls back to all channels |

**Response**
```json
{ "status": "success", "notify_methods": ["push", "email"] }
```

---

## Error Responses

All endpoints return `400` for bad or missing request data and `401` for missing or invalid authentication.

```json
{ "error": "description of the problem" }
```
