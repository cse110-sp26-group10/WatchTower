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
| Kaley Chung | Check over past research pages and added to Github | Start upset user signals | Quizzes |
| Kaley Chung | Check over past research pages and added to Github | Start upset user signals | Quizzes |
| Jensen Guo | A lot of code refactoring and modularizing, as well as create the feedback page, errors page, and signalOverview script | Activity page, and continue reviewing code to make sure everything is consistent | None |
| Prakhar Shah | starter creating additional user personas and user stories
Will do: add the user personas and start working on solidifying the wireframes
Blockers: have been sick for the past week | looked at the wireframes and started brainstorming about ideas to put on the figma
Will do: still have to add the user personals and  add everything to the the figma | have been sick for the past week |
| Bethany Miyamoto | frontend feedback and tested test app/dashboard connection | demo video for development | Club responsibilities |
| Kevin Wang | add uptime card, add a sidebar, talk with teammates about page logic | adjust the page layout based on the Figma design | midterms |
| Han Yang-Lin | Connected uptime display in the dashboard to the backend and implemented a PostgreSQL database with node-postgres | Modify the backend as needed to work with the updated dashboard | Quizzes and midterms |
| Aron Wu | Review current tests and pipeline | Implement more tests | None |
| Aron Wu | Review current tests and pipeline | Implement more tests | None |
| Benedict Luis | started working on the GitHub action for the linting test, complete stand up log for sprint 2 | finish setting up the GitHub action and help Aron with the linting test and validation to work | Quizzes |
| Evan Marriott | finished unit tests, e2e tests, and linting CI pipeline | improve UI with functional changes as recommended from prof powell | None |
| Evan Marriott | finished unit tests, e2e tests, and linting CI pipeline | improve UI with functional changes as recommended from prof powell | None |

### Stand-up 2 — 05/22/2026

| Name | Did | Doing | Blockers |
|------|-----|-------|----------|
| Nicole Sutedja | worked on logo, branding, wireframes, editing video, some pages on the app | continue working with Jensen on frontend development, and design docs | None |
| Kaley Chung | Started research on upset user signals | Finish upset user signals | Quizzes |
| Jensen Guo | demo video, code refactoring for modularity, dashboard sub pages | more code cleanup on the front end, implement hi fi wireframe | None |
| Prakhar Shah | looked at the wireframes and started brainstorming about ideas to put on the figma | still have to add the user personals and  add everything to the the figma | Still sick |
| Bethany Miyamoto | demo video for development, showed backend and frontend running on my device | README.md for code review | club senior banquets |
| Kevin Wang | Asked for feedback from the prof, discuss with the team about database | migrate current raw postgreSQL to supabase | None |
| Han Yang-Lin | Communicated with the team on upcoming tasks | Complete database migration from local to Supabase | Midterm |
| Aron Wu | Started writing unit tests for UptimeCheck and researching into other CI pipeline checkpoints | Finish writing UptimeCheck unit tests, add new CI pipeline checkpoints | None |
| Benedict Luis | Update standup log, started helping Aron to research on other CI pipeline checkpoints | Fix the changelog issues and CI pipeline research | Quizzes |
| Evan Marriott | worked on UI changes and error collapsing in front end | implement browser tracking for errors | None |

### Stand-up 3 — 05/24/2026

| Name | Did | Doing | Blockers |
|------|-----|-------|----------|
| Nicole Sutedja | Assigned tasks to people in preparation for sprint 3, communicated goals | Continue to finalize Figma wireframes for implementation | Family events |
| Kaley Chung | Added research on Figma and http://upset-user-signals.md/on Github | Make more user persona | Quizzes |
| Jensen Guo | Rewriting some functions for the frontend, and planning for full frontend rewrite. i will share at the meeting on tuesday | full frontend rewrite, then implement hi fi figma wireframe | traveling during memorial day |
| Prakhar Shah | On user personnas page for figma, added 3 cards for Alex(Developer), Sam(Team Lead), and Taylor(Customer Specilalist)
Added research page with all newly written 25 user stories | design and add all the hi-fi wireframes (dashboard, errors, page loads, feedback, clicks, activity and deployment) | Midterms |
| Bethany Miyamoto | implemented readme and cleaned up repo, looking over code review | research authentication with supabase and code review | None |
| Kevin Wang | migrate database to supabase | rewrite the frontend based on new ui design | None |
| Han Yang-Lin | Implemented SMS messaging with Twilio to notify users when their website goes down | Start researching how to authenticate users with Supabase | None |
| Aron Wu | Finish unit tests for uptimeCheck, researched additional CI pipeline checks | Add additional CI pipeline checks | None |
| Benedict Luis | Updated/fixed changelog.md, researched more CI testing we can use later on with Aron and finished standup log for sprint 3 | Continue to update changelog if needed, implement more CI testing if needed and finalize sprint 3 | Will be out of town during memorial day and busy preparing for midterms |
| Evan Marriott | browser tracking for watchtower | more errors in test app | None |

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
