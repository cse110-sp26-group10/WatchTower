# MVP Definition

## What is the MVP?

WatchTower's MVP is considered functional when it can **display errors and logs
from a data source** in a readable, organized interface. All other features
(alerting, deployment linking, performance metrics) are out of scope for the MVP.

---

## MVP Requirements

### Must Have (MVP)
- [ ] Fetch or load error/log data from a data source
- [ ] Display errors/logs in a readable list or table format
- [ ] Each log entry should show at minimum:
  - Error message
  - Timestamp
  - Severity level (e.g. INFO, WARN, ERROR)
- [ ] UI is functional on Cloudflare / GitHub Pages with no frameworks

### Nice to Have (Post-MVP)
- [ ] Filter logs by severity or time range
- [ ] Link errors to a specific build or deployment
- [ ] Track "upset user signals"
- [ ] Performance degradation indicators

### Out of Scope
- User authentication
- Real-time streaming
- Mobile responsiveness (Phase 1)

---

## Open Questions

- [ ] Where is the data coming from? (static JSON, API, webhook, user input?)
- [ ] What is the minimum number of log fields required per entry?
- [ ] Does the TA consider a static JSON source acceptable for MVP?

---

## Definition of Done

The MVP is complete when:
1. Error/log data loads and renders on the page
2. The interface is deployed and accessible via GitHub Pages or Cloudflare
3. All MVP checkboxes above are checked
4. Code is reviewed and merged via pull request