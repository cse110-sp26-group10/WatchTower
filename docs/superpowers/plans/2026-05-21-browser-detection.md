# Browser Detection Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Capture the browser name and version on every tracked event and display it in the issue detail Context panel.

**Architecture:** `parseBrowser(ua, uaData)` is a pure function in the tracker that uses three-tier detection (userAgentData → regex → truncated UA string) and returns `{ name, version }`. This object is attached as a top-level `browser` field on every event, validated server-side in `Event.js`, stored as JSONB in Postgres, and rendered in the dashboard's Context panel.

**Tech Stack:** Vanilla JS (ESM), Node.js HTTP server, PostgreSQL (via `pg` pool), Vitest (unit tests)

---

## File Map

| File | Change |
|------|--------|
| `src/prototype/tracker/assets/tracker.js` | Add `parseBrowser(ua, uaData)`, call in `eventTemplate()` |
| `src/prototype/server/assets/Event.js` | Add `"browser"` to `EVENT_FIELDS`, add `validateBrowser()` |
| `src/prototype/server/assets/init-db.js` | Add `browser JSONB` column to `events` table |
| `src/prototype/server/server.js` | Include `browser` in `logEvent()` INSERT |
| `src/prototype/dashboard/assets/scripts/data.js` | Add `browser` field to `makeEvent()` |
| `src/prototype/dashboard/assets/scripts/signal.js` | Add `kvRow` for browser in `renderContext()` |
| `tests/unit/tracker.test.js` | New — unit tests for `parseBrowser()` |
| `tests/unit/event.test.js` | Add browser validation tests |

---

## Task 1: Unit-test and implement `parseBrowser()`

**Files:**
- Create: `tests/unit/tracker.test.js`
- Modify: `src/prototype/tracker/assets/tracker.js`

`parseBrowser(ua, uaData)` must accept both arguments so it can be unit-tested in Node (where `navigator` does not exist). `eventTemplate()` calls it as `parseBrowser(navigator.userAgent, navigator.userAgentData)`.

Detection priority:
1. `uaData.brands` — use `findLast` to find the last brand entry whose name does not include `"Not"` (Chrome orders brands with the most-specific name last, e.g. `"Google Chrome"` after `"Chromium"`)
2. Regex fallback — checked in this order: Edge (`Edg/`) → Opera (`OPR/`) → Chrome (`Chrome/`) → Firefox (`Firefox/`) → Safari (`Version/\d+.*Safari`)
3. Last resort — `{ name: ua.slice(0, 50) || 'Unknown', version: '' }`

- [ ] **Step 1: Create the test file**

Create `tests/unit/tracker.test.js`:

```js
import { describe, it, expect } from 'vitest';
import { parseBrowser } from '../../src/prototype/tracker/assets/tracker.js';

const CHROME_UA  = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36';
const EDGE_UA    = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36 Edg/124.0.0.0';
const FIREFOX_UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:125.0) Gecko/20100101 Firefox/125.0';
const SAFARI_UA  = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 14_4) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.4 Safari/605.1.15';
const OPERA_UA   = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36 OPR/110.0.0.0';
const WEIRD_UA   = 'MyCustomBot/1.0';

describe('parseBrowser — userAgentData path', () => {
  it('uses userAgentData when brands are present', () => {
    const uaData = { brands: [{ brand: 'Chromium', version: '124' }, { brand: 'Google Chrome', version: '124' }] };
    expect(parseBrowser(CHROME_UA, uaData)).toEqual({ name: 'Google Chrome', version: '124' });
  });

  it('skips placeholder brands containing "Not"', () => {
    const uaData = { brands: [{ brand: 'Not A Brand', version: '99' }, { brand: 'Google Chrome', version: '124' }] };
    expect(parseBrowser(CHROME_UA, uaData)).toEqual({ name: 'Google Chrome', version: '124' });
  });

  it('falls through to regex when all brands contain "Not"', () => {
    const uaData = { brands: [{ brand: 'Not A Brand', version: '99' }] };
    expect(parseBrowser(CHROME_UA, uaData)).toEqual({ name: 'Chrome', version: '124' });
  });

  it('falls through to regex when uaData is undefined', () => {
    expect(parseBrowser(FIREFOX_UA, undefined)).toEqual({ name: 'Firefox', version: '125' });
  });
});

describe('parseBrowser — regex path', () => {
  it('detects Chrome', () => {
    expect(parseBrowser(CHROME_UA, undefined)).toEqual({ name: 'Chrome', version: '124' });
  });

  it('detects Edge (not misidentified as Chrome)', () => {
    expect(parseBrowser(EDGE_UA, undefined)).toEqual({ name: 'Edge', version: '124' });
  });

  it('detects Firefox', () => {
    expect(parseBrowser(FIREFOX_UA, undefined)).toEqual({ name: 'Firefox', version: '125' });
  });

  it('detects Safari (not misidentified as Chrome)', () => {
    expect(parseBrowser(SAFARI_UA, undefined)).toEqual({ name: 'Safari', version: '17' });
  });

  it('detects Opera (not misidentified as Chrome)', () => {
    expect(parseBrowser(OPERA_UA, undefined)).toEqual({ name: 'Opera', version: '110' });
  });
});

describe('parseBrowser — fallback path', () => {
  it('returns a truncated UA string for completely unrecognised agents', () => {
    const result = parseBrowser(WEIRD_UA, undefined);
    expect(result.name).toBe('MyCustomBot/1.0');
    expect(result.version).toBe('');
  });

  it('returns "Unknown" when the UA string is empty', () => {
    expect(parseBrowser('', undefined)).toEqual({ name: 'Unknown', version: '' });
  });
});
```

- [ ] **Step 2: Run the test to confirm it fails**

```bash
npm run test:unit
```

Expected: failures — `parseBrowser` is not exported yet.

- [ ] **Step 3: Implement `parseBrowser` in the tracker**

Add `parseBrowser` before `eventTemplate()` in `src/prototype/tracker/assets/tracker.js`, and export it. Then add `event.browser` inside `eventTemplate()`.

```js
export function parseBrowser(ua, uaData) {
  // Tier 1: userAgentData (Chromium-based browsers)
  if (uaData?.brands?.length) {
    const real = uaData.brands.find(b => !b.brand.includes('Not'));
    if (real) return { name: real.brand, version: real.version };
  }
  // Tier 2: UA string regex
  const patterns = [
    { name: 'Edge',    re: /Edg\/(\d+)/ },
    { name: 'Opera',   re: /OPR\/(\d+)/ },
    { name: 'Chrome',  re: /Chrome\/(\d+)/ },
    { name: 'Firefox', re: /Firefox\/(\d+)/ },
    { name: 'Safari',  re: /Version\/(\d+).*Safari/ },
  ];
  for (const { name, re } of patterns) {
    const m = ua.match(re);
    if (m) return { name, version: m[1] };
  }
  // Tier 3: raw UA string truncated
  return { name: ua.slice(0, 50) || 'Unknown', version: '' };
}
```

Update `eventTemplate()` to include browser (add the `event.browser` line after `event.referrer`):

```js
function eventTemplate() {
  const event = {};
  event.timestamp = new Date().toISOString();
  event.deployment = (window.WatchTower = {}).deployment = {
    "id": "dep_abcd",
    "version": "0.0.0",
    "commit_hash": "a1b2c3d",
    "deployed_at": "2026-03-25T00:00:00.000Z",
    "author": "kevin"
  };
  event.user_id = getUserId();
  event.current_url = window.location.href;
  event.referrer = document.referrer;
  event.browser = parseBrowser(navigator.userAgent, navigator.userAgentData);
  return event;
}
```

- [ ] **Step 4: Run the tests and confirm they pass**

```bash
npm run test:unit
```

Expected: all `parseBrowser` tests pass.

- [ ] **Step 5: Commit**

```bash
git add tests/unit/tracker.test.js src/prototype/tracker/assets/tracker.js
git commit -m "feat: add parseBrowser() to tracker and attach browser to all events"
```

---

## Task 2: Add `browser` validation to `Event.js`

**Files:**
- Modify: `src/prototype/server/assets/Event.js`
- Modify: `tests/unit/event.test.js`

- [ ] **Step 1: Update `validBase()` and add browser tests**

In `tests/unit/event.test.js`, update `validBase()` to include a `browser` field (so all existing tests keep passing), then add a new describe block at the bottom of the file.

Update `validBase()`:

```js
function validBase(eventType = 'page_load', metadata = { load_time: 100 }) {
  return {
    event_type: eventType,
    timestamp: secsAgo(10),
    deployment: {
      id: 'dep_001',
      version: '1.0.0',
      commit_hash: 'abc1234',
      deployed_at: '2026-01-01T00:00:00.000Z',
      author: 'evan',
    },
    user_id: VALID_UUID,
    current_url: 'https://example.com/page',
    referrer: '',
    browser: { name: 'Chrome', version: '124' },
    metadata,
  };
}
```

Add at the bottom of the file:

```js
describe('Event — browser validation', () => {
  it('accepts a valid browser field', () => {
    const e = new Event(JSON.stringify(validBase()));
    expect(e.valid).toBe(true);
    expect(e.event.browser).toEqual({ name: 'Chrome', version: '124' });
  });

  it('rejects a missing browser field', () => {
    const data = validBase();
    delete data.browser;
    expect(new Event(JSON.stringify(data)).valid).toBe(false);
  });

  it('rejects browser where name is not a string', () => {
    const data = { ...validBase(), browser: { name: 42, version: '124' } };
    expect(new Event(JSON.stringify(data)).valid).toBe(false);
  });

  it('rejects browser where version is not a string', () => {
    const data = { ...validBase(), browser: { name: 'Chrome', version: 124 } };
    expect(new Event(JSON.stringify(data)).valid).toBe(false);
  });

  it('rejects browser that is not an object', () => {
    const data = { ...validBase(), browser: 'Chrome' };
    expect(new Event(JSON.stringify(data)).valid).toBe(false);
  });

  it('strips extra fields inside browser', () => {
    const data = { ...validBase(), browser: { name: 'Chrome', version: '124', extra: 'remove' } };
    const e = new Event(JSON.stringify(data));
    expect(e.valid).toBe(true);
    expect(e.event.browser.extra).toBeUndefined();
  });
});
```

- [ ] **Step 2: Run tests to confirm new tests fail, existing pass**

```bash
npm run test:unit
```

Expected: the 6 new browser tests fail; all prior tests still pass (they now include `browser` via the updated `validBase()`).

- [ ] **Step 3: Update `Event.js`**

Make four changes to `src/prototype/server/assets/Event.js`:

**a) Add `"browser"` to `EVENT_FIELDS`** (after `"referring_domain"`):

```js
const EVENT_FIELDS = new Set([
    "event_type",
    "timestamp",
    "created_at",
    "deployment",
    "ip",
    "user_id",
    "current_url",
    "host",
    "pathname",
    "referrer",
    "referring_domain",
    "browser",
    "metadata"
]);
```

**b) Add `BROWSER_FIELDS` constant** (after `DEPLOYMENT_FIELDS`):

```js
const BROWSER_FIELDS = new Set(["name", "version"]);
```

**c) Add `validateBrowser()` function** (after `validateReferrer`):

```js
function validateBrowser(event) {
    let browser = event.browser;
    if (typeof browser !== "object" || browser === null) return false;
    if (typeof browser.name !== "string") return false;
    if (typeof browser.version !== "string") return false;
    return true;
}
```

**d) Call `validateBrowser()` in the constructor and clean up extra browser fields.**

Add after the `if (!validateReferrer(event)) return null;` line:

```js
if (!validateBrowser(event)) return null;
```

Add `cleanupExtraFields(event.browser, BROWSER_FIELDS);` alongside the other cleanup calls:

```js
cleanupExtraFields(event.browser, BROWSER_FIELDS);
cleanupExtraFields(event.deployment, DEPLOYMENT_FIELDS);
cleanupExtraFields(event.metadata, METADATA_FIELDS[event.event_type]);
cleanupExtraFields(event, EVENT_FIELDS);
```

- [ ] **Step 4: Run tests and confirm they all pass**

```bash
npm run test:unit
```

Expected: all 6 new browser tests pass plus all prior tests.

- [ ] **Step 5: Commit**

```bash
git add src/prototype/server/assets/Event.js tests/unit/event.test.js
git commit -m "feat: validate browser field in Event schema"
```

---

## Task 3: Add `browser` column to the database and server INSERT

**Files:**
- Modify: `src/prototype/server/assets/init-db.js`
- Modify: `src/prototype/server/server.js`

- [ ] **Step 1: Add `browser JSONB` column to `init-db.js`**

In the `sql` template string inside `src/prototype/server/assets/init-db.js`, add the `browser` column after `metadata`:

```sql
CREATE TABLE events (
    id SERIAL PRIMARY KEY,
    event_type TEXT NOT NULL,
    timestamp TIMESTAMPTZ NOT NULL,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    deployment JSONB NOT NULL,
    ip TEXT,
    user_id UUID NOT NULL,
    current_url TEXT NOT NULL,
    host TEXT NOT NULL,
    pathname TEXT NOT NULL,
    referrer TEXT,
    referring_domain TEXT,
    metadata JSONB NOT NULL,
    browser JSONB
);
```

- [ ] **Step 2: Update `logEvent()` in `server.js`**

Replace the existing `logEvent` function:

```js
async function logEvent(eventObject) {
    const event = eventObject.event;
    const query = `
        INSERT INTO events (
            event_type, timestamp, created_at, deployment, ip,
            user_id, current_url, host, pathname, referrer,
            referring_domain, metadata, browser
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
    `;
    const values = [
        event.event_type, event.timestamp, event.created_at, JSON.stringify(event.deployment), event.ip,
        event.user_id, event.current_url, event.host, event.pathname, event.referrer,
        event.referring_domain, JSON.stringify(event.metadata), JSON.stringify(event.browser)
    ];
    console.log("\nLogging event...");
    try {
        await pool.query(query, values);
        console.log("Event logged");
        console.log(JSON.stringify(eventObject, null, 2));
    } catch (error) {
        console.error("Query failed: ", error);
    }
}
```

- [ ] **Step 3: Re-initialise the database**

```bash
cd src/prototype/server && node assets/init-db.js
```

Expected output ends with: `Mock data initialized successfully`

- [ ] **Step 4: Commit**

```bash
git add src/prototype/server/assets/init-db.js src/prototype/server/server.js
git commit -m "feat: add browser JSONB column to events table and include in INSERT"
```

---

## Task 4: Add `browser` to mock dashboard data

**Files:**
- Modify: `src/prototype/dashboard/assets/scripts/data.js`

- [ ] **Step 1: Update `makeEvent()` to accept and return `browser`**

Update the function signature and return object in `src/prototype/dashboard/assets/scripts/data.js`:

```js
function makeEvent({ deployment_id, event_type, minsAgo, pathname, meta, browser }) {
  const d = deploymentById(deployment_id);
  __eventCounter += 1;
  return {
    id: `evt_${String(__eventCounter).padStart(3, '0')}`,
    event_type,
    timestamp: minutesAgo(minsAgo),
    created_at: minutesAgo(minsAgo),
    deployment: d ? { id: d.id, version: d.version, commit_hash: d.commit_hash } : null,
    ip: '192.0.2.14',
    pathname,
    browser: browser || { name: 'Chrome', version: '124' },
    metadata: {
      severity: 'signal',
      message: '',
      rating: null,
      comment: null,
      pageUrl: `https://demo.watchtower.local${pathname}`,
      ...(meta || {}),
    },
  };
}
```

- [ ] **Step 2: Add browser variety to error mock events**

Update the first two error events in the `EVENTS` array to pass different browsers, so the dashboard shows realistic variation:

```js
makeEvent({ deployment_id: 'dep_8f2c', event_type: 'error', minsAgo: 2,  pathname: '/checkout',   meta: { severity: 'critical', message: 'TypeError: cannot read property "id" of undefined' }, browser: { name: 'Safari', version: '17' } }),
makeEvent({ deployment_id: 'dep_8f2c', event_type: 'error', minsAgo: 11, pathname: '/api/orders', meta: { severity: 'critical', message: '500 Internal Server Error on POST /api/orders' }, browser: { name: 'Firefox', version: '125' } }),
```

All other events default to `{ name: 'Chrome', version: '124' }` via the fallback in `makeEvent()`.

- [ ] **Step 3: Run unit tests**

```bash
npm run test:unit
```

Expected: all tests pass.

- [ ] **Step 4: Commit**

```bash
git add src/prototype/dashboard/assets/scripts/data.js
git commit -m "feat: add browser field to mock dashboard event data"
```

---

## Task 5: Display browser in the issue detail Context panel

**Files:**
- Modify: `src/prototype/dashboard/assets/scripts/signal.js`

- [ ] **Step 1: Update `renderContext()` in `signal.js`**

Replace the `renderContext` function body with the version below. The only change is adding the `browserLabel` variable and the `kvRow('browser', browserLabel)` line:

```js
function renderContext(event) {
  const list = document.getElementById('context-list');
  const browserLabel = event.browser
    ? `${event.browser.name}${event.browser.version ? ' ' + event.browser.version : ''}`
    : '—';
  list.innerHTML = [
    kvRow('pathname', event.pathname || '—', { mono: true }),
    kvRow('page url', event.metadata.pageUrl || '—', { mono: true }),
    kvRow('ip', event.ip || '—', { mono: true }),
    kvRow('browser', browserLabel),
    kvRow('observed', `${relativeTime(event.timestamp)} (${new Date(event.timestamp).toLocaleString()})`),
    kvRow('received', `${relativeTime(event.created_at)} (${new Date(event.created_at).toLocaleString()})`),
  ].join('');
}
```

- [ ] **Step 2: Open the dashboard and verify**

Start a local server from the project root:

```bash
npx serve .
```

Open `http://localhost:3000/src/prototype/dashboard/errors.html`. Click into any error event. Confirm the Context panel shows a `browser` row — e.g. `Safari 17`, `Firefox 125`, or `Chrome 124`.

- [ ] **Step 3: Run the full test suite**

```bash
npm run test:unit
```

Expected: all tests pass.

- [ ] **Step 4: Commit**

```bash
git add src/prototype/dashboard/assets/scripts/signal.js
git commit -m "feat: display browser in issue detail Context panel"
```

---

## Self-Review

- **Spec coverage:** `parseBrowser` three-tier detection (Task 1) ✓, `Event.js` validation (Task 2) ✓, DB column + INSERT (Task 3) ✓, mock data (Task 4) ✓, dashboard display (Task 5) ✓
- **No placeholders:** all steps include complete code
- **Type consistency:** `browser` is `{ name: string, version: string }` in tracker, Event.js, server INSERT, mock data, and dashboard rendering — consistent throughout. `BROWSER_FIELDS` set in Task 2 matches the two fields validated in `validateBrowser()`. `parseBrowser` signature `(ua, uaData)` matches calls in `eventTemplate()` and all test cases.
