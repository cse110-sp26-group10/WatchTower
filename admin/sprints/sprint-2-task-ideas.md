# Sprint 2 Task Ideas

**Prepared by:** Evan Marriott
**Based on:** Sprint 1 MVP definition, research, prototype progress, and expected TA feedback

---

## Context

Sprint 1 focused on planning, research, UCD, and a low-fidelity prototype using mock data. Sprint 2 should move toward a real working product or a more realistic prototype. These task ideas are preliminary and should be reviewed after the TA sync and Sprint 1 retrospective.

---

## Candidate Tasks

### Core Functionality
- Replace mock error data with real error capture (e.g., a lightweight JS error listener on a test page)
- Implement a real uptime check using a scheduled GitHub Action that pings a URL and writes status to a JSON file
- Connect the dashboard to a real (or semi-real) data source instead of `data.js`
- Build a working issue detail page linked from the dashboard

### User Feedback Signal
- Build a simple embeddable feedback widget (thumbs up/down or 1–5 rating) that writes signals to a lightweight store
- Display aggregated user signal data on the dashboard

### Deployment / Build Signals
- Integrate a GitHub Actions webhook or log to capture deploy events and surface them in the dashboard
- Add a timeline view showing when deployments happened relative to error spikes

### Filtering and Navigation
- Improve filtering: filter by signal type, severity, and date range
- Add basic routing so users can navigate between dashboard and issue detail without a full page reload

### Testing
- Write unit tests for filtering logic, signal matching, and data formatting functions
- Document an E2E test scenario and implement it manually or with a lightweight tool

### Documentation and Process
- Write Sprint 2 planning notes
- Update CHANGELOG with Sprint 2 additions
- Conduct and document a Sprint 1 retrospective
- Refine ADRs based on any technology decisions made in Sprint 2

---

## Notes

- Priority for Sprint 2 should be determined after TA feedback on the Sprint 1 prototype.
- Avoid adding features that require authentication, a real database, or server infrastructure unless the team has capacity.
- Any task that depends on Sprint 1 deliverables being complete (MVP doc, UCD artifacts, prototype) should be listed as blocked until Sprint 1 closes out.
