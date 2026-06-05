# WatchTower Tracker Integration Guide

This guide explains how to embed the WatchTower tracker into any web application so that errors, page loads, clicks, and user feedback are sent to your WatchTower dashboard automatically.

---

## Prerequisites

- A WatchTower account and a project created in the dashboard
- Your project's **API key** (a UUID found on the dashboard settings or projects page)
- A running WatchTower server (see the [server README](../../src/prototype/server/README.md))

---

## 1. Add the Script Tag

Paste the following `<script>` tag into the `<head>` of every page you want to monitor. Replace `YOUR_API_KEY` with the UUID from your project's settings.

```html
<script
  src="https://cdn.jsdelivr.net/gh/cse110-sp26-group10/WatchTower@main/src/prototype/tracker/watchtower.js"
  data-apikey="YOUR_API_KEY"
></script>
```

The tracker loads asynchronously and will not block your page from rendering.

> **Local development:** When running on `localhost` or `127.0.0.1`, the tracker automatically loads from your local server instead of the CDN, so no changes are needed between environments.

---

## 2. What Gets Captured Automatically

Once the script tag is in place, the tracker captures the following events with no additional code required:

| Event | What is recorded |
|-------|-----------------|
| **Page load** | URL, referrer, browser, timestamp, and load time (ms) |
| **JavaScript error** | Error message, current URL, browser, timestamp — severity: `critical` |
| **Unhandled Promise rejection** | Rejection message, current URL, browser, timestamp — severity: `critical` |
| **Failed fetch request** | HTTP method, URL, and status code — severity: `critical` |
| **`console.warn` call** | Warning message — severity: `warning` |
| **Click** | Element ID, element class, and input delay (ms) |

All events are tagged with the browser name and version (Chrome, Firefox, Safari, Edge) detected automatically from the user agent.

---

## 3. Collecting User Feedback (Optional)

To record a user satisfaction rating — for example, after a purchase or form submission — call `window.logSurvey` anywhere in your own JavaScript:

```javascript
window.logSurvey(rating, message);
```

| Parameter | Type | Description |
|-----------|------|-------------|
| `rating` | `number` | A numeric satisfaction score (e.g. 1–5) |
| `message` | `string` | Optional free-text comment from the user |

**Example — post-purchase survey:**
```javascript
document.getElementById("submit-rating").addEventListener("click", () => {
  const rating = document.getElementById("star-input").value;
  const comment = document.getElementById("comment-input").value;
  window.logSurvey(Number(rating), comment);
});
```

The survey event appears in the **Feedback** page of your dashboard.

---

## 4. Triggering Errors Manually (Development Only)

During development you can fire specific JavaScript error types on demand to verify they appear correctly in the dashboard. This is useful for testing your WatchTower setup before going live.

```javascript
// TypeError
null.property;

// ReferenceError
undeclaredFunction();

// Unhandled Promise rejection
Promise.reject(new Error("test rejection"));
```

Remove any manual triggers before deploying to production.

---

## 5. How Authentication Works

The `data-apikey` attribute is a UUID that identifies your project on the WatchTower server. The tracker sends it as a `Bearer` token in every request:

```
Authorization: Bearer YOUR_API_KEY
```

The server looks up the project associated with that key and attaches the `project_id` to every incoming event. **Keep your API key private** — anyone with it can send events to your project.

---

## 6. Verifying the Integration

1. Open your browser's developer console after loading a page with the tracker installed.
2. You should see: `WatchTower: tracker.js loaded`
3. Navigate between pages and click a few elements.
4. Open your WatchTower dashboard — events should appear within seconds on the **Overview** and **Activity** pages.

If events are not appearing, check that:
- The `data-apikey` value matches the UUID shown in your dashboard project settings
- Your WatchTower server is running and reachable
- There are no Content Security Policy (CSP) rules blocking the script or the outgoing requests

---

## 7. Full Example

```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <title>My App</title>

    <!-- WatchTower tracker -->
    <script
      src="https://cdn.jsdelivr.net/gh/cse110-sp26-group10/WatchTower@main/src/prototype/tracker/watchtower.js"
      data-apikey="xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
    ></script>
  </head>
  <body>
    <h1>Welcome</h1>

    <!-- Example: post-purchase feedback widget -->
    <div id="survey">
      <p>How was your experience?</p>
      <input type="number" id="rating" min="1" max="5" />
      <button onclick="window.logSurvey(Number(document.getElementById('rating').value), '')">
        Submit
      </button>
    </div>
  </body>
</html>
```
