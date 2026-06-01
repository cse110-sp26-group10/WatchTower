# CSE 135 Research Notes — WatchTower

**Source:** https://cse135.site  
**Reviewed by:** Anay | 2026-05-30

---

## Ideas Worth Stealing

### 1. Always return `204` from the collect endpoint, even when something goes wrong

No matter what happens (bad JSON, validation failure, DB is down), the server should return `204 No Content` and nothing else. Never send back a `400` or `500`.

If you return errors, you're basically telling attackers what to fix about their payload. `sendBeacon()` doesn't show the response to JS anyway, so real callers never see it. And if the tracker retries on a `500`, a DB outage turns into a traffic flood. Just always say `204` and log the problem server-side.

### 2. Set the timestamp on the server, not the client

Client clocks can be off. Users can also just lie about them. The server should stamp its own `server_timestamp` the moment the beacon arrives. Don't trust whatever the client sends. Same goes for User-Agent: read it from the HTTP header, not the payload.

This matters for WatchTower because we correlate errors to deployments by time. If the timestamp is slightly wrong, our deployment timeline is wrong too.

### 3. Validate everything before it touches the database

Analytics data comes from the internet. Anyone can curl your endpoint. The pipeline should be: reject bad JSON → whitelist known fields → type-check each one → strip HTML from strings → use parameterized queries. Every step matters.

If you skip sanitization and display raw error messages in the dashboard, that's a stored XSS. Our `server.js` probably needs a pass through steps 2-4.

### 4. Add database indexes on timestamp columns before the tables get big

Without an index on `server_timestamp`, date-range queries scan the whole table. At small volumes you won't notice. At a million rows it's slow. At ten million it's unusable.

It's one Supabase migration. Takes five minutes. Do it now, not after the table is already huge and live.

### 5. Show week-over-week change, not just raw counts

"Errors: 42" doesn't tell you anything. "Errors: 42 (+34% vs last week)" tells you something is getting worse. CSE 135 calls this the difference between a vanity metric and an actionable one: a number you can act on needs a time dimension and something to compare against.

Our summary tiles just show counts right now. You can add a small delta badge in frontend JS without touching the schema.

---

## Top 5 Things to Actually Do

1. **Return `204` from `/events` always.** One-line fix, stops info leakage, kills the retry storm risk.
2. **Add indexes on `server_timestamp`.** One migration, prevents slow queries later.
3. **Audit validation in `server.js`.** Whitelist fields, strip HTML, check for parameterized queries.
4. **Add week-over-week deltas to summary tiles.** Frontend JS only, makes the overview actually useful.
5. **Add a grouped errors view** (`GROUP BY error_message ORDER BY count DESC`), way more useful than chronological for triage.

---

*Sources: https://cse135.site/otel-overview.html, /project/server-processing/, /project/storage/, /project/decision/*
