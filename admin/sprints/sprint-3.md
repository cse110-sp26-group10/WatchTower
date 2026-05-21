# Sprint 3 — Cohesive Demo App, Uptime Visualization, and High-Fidelity Design

**Project:** WatchTower <br>
**Dates:** 05/19/2026 – 05/24/2026 <br>

---

## Sprint Goal

> Build a cohesive, functional WatchTower app connected to the test app for the project demo, display uptime through a dashboard card/graph, and develop the wireframes into high-fidelity designs that consider user flow and branding.

---

## Team

| Name | Role | Mode |
|------|------|------|
| Nicole Sutedja | Team Lead | Solo / Pairing |
| Evan Marriott | Team Lead | Solo / Pairing |
| Kaley Chung | Product & Design | Pairing |
| Jensen Guo | Product & Design | Pairing |
| Prakhar Shah | Product & Design | Pairing |
| Bethany Miyamoto | Development | Pairing |
| Kevin Wang | Development | Pairing |
| Han Yang-Lin | Development | Pairing |
| Aron Wu | Quality & Ops | Pairing |
| Benedict Luis | Quality & Ops | Pairing |

> Mode: `Pairing` / `Mobbing` / `Solo`

---

## Sprint Backlog

| ID | Task | Assignee(s) | Status | Notes |
|----|------|-------------|--------|-------|
| T01 | Stabilize the end-to-end demo flow from test app to tracker, backend server, and dashboard | Han Yang-Lin, Kevin Wang, Bethany Miyamoto | 🔄 In Progress | Carryover from Sprint 2 T01; must be reliable for demo |
| T02 | Connect the WatchTower dashboard to live/semi-live signals from the test app | Han Yang-Lin, Kevin Wang, Bethany Miyamoto | 🔄 In Progress | Keep mock fallback if the server is unavailable |
| T03 | Add an uptime card to the dashboard | Kevin Wang, Han Yang-Lin | ✅ Done | Stand-up 1 notes uptime card and backend-connected uptime display |
| T04 | Add an uptime graph/history view | Kevin Wang, Han Yang-Lin | 🔲 Not Started | Use the website status signal structure from the prototype README |
| T05 | Implement PostgreSQL persistence with node-postgres | Han Yang-Lin | ✅ Done | Stand-up 1 notes PostgreSQL database implementation |
| T06 | Develop low-fidelity wireframes into high-fidelity Figma designs | Nicole Sutedja, Jensen Guo, Kaley Chung, Prakhar Shah | 🔄 In Progress | Include visual hierarchy, spacing, color, and component states |
| T07 | Refine user flow across dashboard, issue detail, feedback, errors, activity, and uptime views | Jensen Guo, Product & Design Team | 🔄 In Progress | Make demo path easy to follow and consistent with MVP |
| T08 | Define WatchTower branding guidance for the hi-fi designs and app UI | Nicole Sutedja, Product & Design Team | 🔄 In Progress | Logo/wordmark usage, color palette, typography, and tone |
| T09 | Align implemented UI with the high-fidelity dashboard direction | Kevin Wang, Jensen Guo | 🔄 In Progress | Focus on demo-facing screens first; update layout based on Figma |
| T10 | Continue refactoring/modularizing dashboard pages and scripts | Jensen Guo | 🔄 In Progress | Feedback page, errors page, and signal overview script started |
| T11 | Add ESLint plus HTML/CSS validation to the GitHub Actions CI pipeline | Benedict Luis, Aron Wu | 🔄 In Progress | Carryover from Sprint 2 T08 |
| T12 | Finish useful JSDoc coverage for existing JavaScript files | All Developers | 🔄 In Progress | Carryover from Sprint 2 T09; prioritize shared logic and backend validation |
| T13 | Write initial unit tests for backend signal validation logic | Benedict Luis, Aron Wu | 🔲 Not Started | Carryover from Sprint 2 T10 |
| T14 | Update CHANGELOG.md with Sprint 2 and Sprint 3 changes | All Members | 🔲 Not Started | Carryover from Sprint 2 T11; keep entries project-focused |
| T15 | Prepare and document the project demo script/video plan | Nicole Sutedja, Evan Marriott | 🔄 In Progress | Include setup steps, expected signals, and fallback plan |
| T16 | Verify the demo manually before sprint review | Nicole Sutedja, Evan Marriott, QA Team | 🔲 Not Started | Run test app actions and confirm dashboard updates |

> Status options: 🔲 Not Started · 🔄 In Progress · ✅ Done · 🚫 Blocked

---

## Stand-ups

### Stand-up 1 — 05/20/2026

| Name | Did | Doing | Blockers |
|------|-----|-------|----------|
| Nicole Sutedja | helped with making wireframes and branding material | write script & organize product demo video for tomorrow | None |
| Kaley Chung | | | |
| Jensen Guo | A lot of code refactoring and modularizing, as well as create the feedback page, errors page, and signalOverview script | Activity page, and continue reviewing code to make sure everything is consistent | None |
| Prakhar Shah | | | |
| Bethany Miyamoto | | | |
| Kevin Wang | add uptime card, add a sidebar, talk with teammates about page logic | adjust the page layout based on the Figma design | midterms |
| Han Yang-Lin | Connected uptime display in the dashboard to the backend and implemented a PostgreSQL database with node-postgres | Modify the backend as needed to work with the updated dashboard | Quizzes and midterms |
| Aron Wu | | | |
| Benedict Luis | started working on the GitHub action for the linting test, complete stand up log for sprint 2 | finish setting up the GitHub action and help Aron with the linting test and validation to work | Quizzes |
| Evan Marriott | | | |

### Stand-up 2 — 05/22/2026

| Name | Did | Doing | Blockers |
|------|-----|-------|----------|
| Nicole Sutedja | | | |
| Kaley Chung | | | |
| Jensen Guo | | | |
| Prakhar Shah | | | |
| Bethany Miyamoto | | | |
| Kevin Wang | | | |
| Han Yang-Lin | | | |
| Aron Wu | | | |
| Benedict Luis | | | |
| Evan Marriott | | | |

### Stand-up 3 — 05/24/2026

| Name | Did | Doing | Blockers |
|------|-----|-------|----------|
| Nicole Sutedja | | | |
| Kaley Chung | | | |
| Jensen Guo | | | |
| Prakhar Shah | | | |
| Bethany Miyamoto | | | |
| Kevin Wang | | | |
| Han Yang-Lin | | | |
| Aron Wu | | | |
| Benedict Luis | | | |
| Evan Marriott | | | |

---

## Decisions Made

| Decision | Rationale | ADR Link |
|----------|-----------|----------|
| Use the test app as the primary demo signal source | The project demo needs a controlled app that can generate predictable page load, click, error, survey, and uptime signals | TBD |
| Prioritize uptime card and graph for Sprint 3 | Uptime visibility is central to the demo goal and gives users an immediate health signal | TBD |
| Move low-fidelity wireframes into high-fidelity branded designs | The app needs to feel cohesive for the demo and should reflect user flow and branding decisions | `/docs/adr/003-use-figma.md` |

---

## Sprint Review

### What was completed:
-

### What was not completed:
-

### Reason(s):
-

---

## Sprint Retrospective

### What went well:
-

### What didn't go well:
-

### What we'll do differently:
-

---

## Metrics

| Metric | Value |
|--------|-------|
| Tasks Planned | 16 |
| Tasks Completed | |
| PRs Opened | |
| PRs Merged | |
| Lines of Code Added | |
| Unit Tests Written | |

---

## Notes & Misc

> Carryovers from Sprint 2: stabilize the frontend/backend/test app connection, finish CI validation, add initial backend validation tests, improve JSDoc coverage, update the changelog, and continue wireframe/design refinement. Sprint 3 should keep implementation and high-fidelity design tightly aligned so the demo feels like one cohesive product.
