# WatchTower Testing Plan

## Overview

WatchTower uses a two-layer automated test suite — unit tests (Vitest) and end-to-end tests (Playwright) — run on every push and pull request via GitHub Actions CI.

---

## Unit Tests

**Runner:** Vitest · **Location:** `tests/unit/`

| File | What it covers |
|------|----------------|
| `event.test.js` | `Event` class construction, field validation (event type, timestamp, deployment, URL, referrer, browser, metadata), extra-field stripping, and `setField` |
| `tracker.test.js` | `parseBrowser()` — userAgentData path, UA string regex path, and fallback for unrecognised agents |
| `notify.test.js` | `notify`, `notifyDowntime`, `notifyError` — push/email channel selection, retry logic, cooldown suppression, and error handling |
| `uptimeCheck.test.js` | Uptime check attempt success logic and `UptimeCheck` construction |
| `userAuth.test.js` | Login and session flow |

Run locally:

```bash
npm run test:unit
```

---

## End-to-End Tests

**Runner:** Playwright (Chromium) · **Location:** `tests/e2e/`

| Test | What it covers |
|------|----------------|
| Unauthenticated redirect | Login page shown and app shell empty when `wt-auth` is missing |
| App shell load | Topbar, sidebar, and outlet visible on home |
| Sidebar navigation | Overview, Errors, and Activity links present |
| Uptime card | Card renders live status or empty state |
| Error list and activity panels | Error items visible; load and click path panels render |
| Deployment filter | Dropdown populated with at least one non-default option |
| Deployment scoping | Selecting a deployment updates the filter value |
| Error detail modal | Clicking an error row opens the modal |
| Modal content | Severity badge and error message visible in modal |
| Errors page (direct URL) | `/#/errors` loads error list and summary metrics |
| Activity page (direct URL) | `/#/activity` loads the activity feed |

The E2E suite requires the server running with a seeded local Supabase instance (see `supabase/README.md`).

Run locally:

```bash
npx playwright install chromium   # first time only
npm run test:e2e
```

---

## CI Pipeline

All tests run automatically on push and pull request to `main`. See [`docs/testing/ci-plan.md`](ci-plan.md) for the full pipeline definition.

| Job | Tool |
|-----|------|
| Lint | ESLint, html-validate, Stylelint |
| Dependency audit | `npm audit --audit-level=critical` |
| Formatting | Prettier |
| Unit tests | Vitest |
| E2E tests | Playwright (Chromium) |

