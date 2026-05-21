# Sprint 2 — Integration, Testing Infrastructure, and Design Refinement

**Project:** WatchTower <br>
**Dates:** 05/11/2026 – 05/17/2026 <br>

---

## Sprint Goal

> Connect the backend and frontend into a working end-to-end prototype, create low-fidelity wireframes with complete user research, and establish the ESLint/CI testing strategy so the team is ready for feature development in Sprint 3.

---

## Team

| Name | Role | Mode |
|------|------|------|
| Nicole Sutedja | Team Lead | Solo / Pairing |
| Evan Marriott | Team Lead | Solo / Pairing |
| Kaley Chung | Product & Design | Pairing |
| Jensen Guo | Product & Design | Pairing |
| Prakhar Shah | Product & Design | Pairing |
| Han Yang-Lin | Development | Pairing |
| Kevin Wang | Development | Pairing |
| Bethany Miyamoto | Development  | Pairing |
| Aron Wu | Quality & Ops | Pairing |
| Benedict Luis | Quality & Ops | Pairing |

> Mode: `Pairing` / `Mobbing` / `Solo`

---

## Sprint Backlog

| ID | Task | Assignee(s) | Status | Notes |
|----|------|-------------|--------|-------|
| T01 | Connect backend server to frontend dashboard (wire real/mock data to UI) | Han Yang-Lin, Kevin Wang, Bethany Miyamoto | 🔄 In Progress | Backend server, tracker, and dashboard fetch path exist; needs end-to-end demo stabilization in Sprint 3 |
| T02 | Finalize event signal structure and decide on database | Han Yang-Lin | ✅ Done | Event structure documented; PostgreSQL selected in ADR 004 |
| T03 | Complete and merge user personas | Prakhar Shah | ✅ Done  | Carried over from Sprint 1 |
| T04 | Finish remaining user research (build/deployment signal context) | Kaley Chung | ✅ Done  | Unblock Jensen's wireframe work |
| T05 | Iterate wireframes based on user research and MVP feedback | Jensen Guo | 🔄 In Progress | Dashboard wireframes progressed; high-fidelity user flow and branding work carried into Sprint 3 |
| T06 | Add wireframes to repo (Figma export or link) | Jensen Guo | ✅ Done | Figma link added to design plan; exports/screenshots can still be added in Sprint 3 if needed |
| T07 | Define ESLint configuration and document testing strategy | Aron, Benedict Luis | ✅ Done | ESLint ADR created; testing strategy exists in docs |
| T08 | Add ESLint + HTML/CSS validation to GitHub Actions CI pipeline | Benedict Luis | 🔄 In Progress | No GitHub Actions workflow found yet; carry into Sprint 3 |
| T09 | Add JSDoc comments to all existing JS files | All Developers | 🔄 In Progress | Some prototype JS now has JSDoc; remaining files carry into Sprint 3 |
| T10 | Write initial unit tests for backend signal validation logic | Benedict, Aron | 🔲 Not Started | Testing must be verifiable early in repo |
| T11 | Update CHANGELOG.md for all Sprint 2 changes | All Members | 🔲 Not Started | CHANGELOG still only lists Sprint 1 / v0.1.0 content; carry into Sprint 3 |
| T12 | Update GENAI.md with any AI tool usage this sprint | All Members | ✅ Done | Test app AI usage recorded |
| T13 | Hold dev team sync to coordinate frontend/backend merge | Nicole / Evan | ✅ Done  | Prevent code conflicts flagged in Sprint 1 retro |
| T14 | TA sync with Audria — confirm ESLint approval & alert/notification approach | Ben, Aron | ✅ Done | Stand-ups record TA check-in and ESLint direction |
| T15 | Maintain Sprint 2 documentation in GitHub | Nicole, Benedict | ✅ Done | Sprint 2 stand-ups and planning notes maintained |

> Status options: 🔲 Not Started · 🔄 In Progress · ✅ Done · 🚫 Blocked

---

## Stand-ups

### Stand-up 1 — 05/12/2026

| Name | Did | Doing | Blockers |
|------|-----|-------|----------|
| Nicole Sutedja | Finished in-class activity doc & submitted, scheduled dev team meeting | Sprint 2 goals md | None |
| Kaley Chung | Completed first key point and started looking at build signals | Finish the remaining research, ask team to review before committing to GitHub | Midterms and quizzes |
| Jensen Guo | Began updating wireframes in accordance with TA Audria's resources (arrows showing user flow) and the MVP | User summary page, refine the other pages | None |
| Prakhar Shah | Started researching the CSE 135 site | Finish research and detail findings | Busy and midterms |
| Bethany Miyamoto | Done with mock, feedback, and filtering data and pushed for review | Meet with team and coordinate between frontend/backend/example data | None |
| Kevin Wang | Dashboard prototype and issue details, asked for feedback from Prof. Powell | Adjust layout based on feedback, add details based on MVP definition | Other deadlines |
| Han Yang-Lin | Created a backend Node.js server to validate incoming event signals, wrote tracker.js to track page load/errors/clicks and send to server, worked on data.js to retrieve data from server for the dashboard | Finalize event signal structure and decide on database in dev meeting, continue working on MVP with mock data | Project/homework deadlines due this week |
| Aron Wu | Researched linting and validation options with Ben and reviewed CI plan; considering ESLint as option | Talk to Audria about using ESLint, look into ESLint and JSDoc documentation generation for GitHub Actions pipelines | None |
| Benedict Luis| Discussed linting/validation with Aron and reviewed CI plan in docs/process; researched ESLint as a possible option (may need ADR due to new dependency); finished loose ends on worksheet | Look into adding ESLint, HTML/CSS validation, and JSDoc documentation generation to GitHub Actions CI pipeline; discuss testing app approach at dev meeting | None |
| Evan Marriott | Finished portion of the in-class activity and prepared for Sprint 2 | Continue managing project progress and development | None |

### Stand-up 2 — 05/14/2026

| Name | Did | Doing | Blockers |
|------|-----|-------|----------|
| Nicole Sutedja | met with dev team, resolved conflicts in data details, assigned tasks to dev & testing team, updated docs in repo | ensure user stories incorporated into features | confirmation to use ESLint & database research |
| Kaley Chung | Saw there was work on http://observability-tools.md/ and read it | Combine the work on http://observability-tools.md/ with my research | Quizzes and Midterms |
| Jensen Guo | Design ADR, linked design docs, began iteration on wireframes | Sync wireframes with frontend development, continue iteration on wireframes | None |
| Prakhar Shah | added cse135 site review | finalize finishing all research | None |
| Bethany Miyamoto | filter.js added to main. met with dev team and working on research for uptime monitoring | finalize a database and method for uptime monitoring | None |
| Kevin Wang | had a meeting with development team, team leader, and the quality&operations team | adjust the dashboard layout | None |
| Han Yang-Lin | Met with the development team to finalize data structure and assign new tasks | Start working on uptime monitoring and researching on databases | None |
| Aron Wu | Had dev meeting to discuss development and testing plan. Checked in with Audria on linting dependency. Discussed with Ben on implementing linting locally and integration into CI pipeline | Implement linting + validation on prototype branch. Write ADR for ESLint. Set up GitHub Action for lint and validation check | None |
| Benedict Luis | Had a dev meeting on how to develop the test app, check in with Audria if our testing preference fits the project. Discussed with Aaron on how we could implement the lint test | Add linting + validation to GitHub Actions once it works locally. Also check if JSDoc should be included | None |
| Evan Marriott | marked issues as completed | test app build | None |

### Stand-up 3 — 05/16/2026

| Name | Did | Doing | Blockers |
|------|-----|-------|----------|
| Nicole Sutedja | Finished Sprint 2 goals, did some personal research on databases and logic | check with each team, update documents to ensure up to date info | None |
| Kaley Chung | Check on GitHub and check work on http://observability-tools.md/. Start research for build signals section | Finish the content for http://build-signals.md./ | Quizzes |
| Jensen Guo | Finalizing dashboard wireframing and talking with frontend about design | continue working with frontend about design choices, update other wireframe pages | None |
| Prakhar Shah | marked tasks as completed and finished writing up research, finish sprint 2 goals | check in with team | None |
| Bethany Miyamoto | research for backend database (postgresql) | help with backend/frontend | None |
| Kevin Wang | updated the dashboard, highlighting the important messages, talk with design about the dashboard | implement the nav bar and other pages, and the up time component | midterm |
| Han Yang-Lin | Implemented uptime tracking and logging, and did basic research on databases | Finalize with the team which database to use and begin implementation | None |
| Aron Wu | Finished ADR | Implement linting and some unit tests | None |
| Benedict Luis | Review ADR and updated stand up log | try to get ESLint working locally and get the GitHub Action pipeline for linting to work | None |
| Evan Marriott | completed test app implementation | fix changelog to not include things about test app because it should only be about watchtower | None |

---

## Decisions Made

| Decision | Rationale | ADR Link |
|----------|-----------|----------|
| ESLint adoption | Standardizes code quality and enables automated linting in CI; adds a dependency so requires ADR | `/docs/adr/005-use-eslint-for-linting-validation.md` |
| PostgreSQL database selection for event signals | Needed to move off mock data and support real signal ingestion | `/docs/adr/004-use-postgre-sql-for-database.md` |

---

## Sprint Review

### What was completed:
- Completed user personas and remaining user research.
- Held dev team sync to coordinate frontend/backend work.
- Created backend server and browser tracking logic for event signals.
- Finalized the event signal structure enough to document it in the prototype README.
- Selected PostgreSQL as the database direction and recorded the decision in ADR 004.
- Continued wiring mock/real data into the frontend dashboard.
- Added the Figma wireframe link to the design plan and continued wireframe iteration.
- Documented ESLint as the linting/validation direction in ADR 005.

### What was not completed:
- The dashboard/backend/test app connection was not yet a fully stable, polished end-to-end demo flow.
- ESLint and HTML/CSS validation were not fully added to GitHub Actions yet.
- Initial unit tests for backend signal validation were not completed.
- JSDoc comments were not added to all existing JS files yet.
- CHANGELOG.md was not updated with Sprint 2 changes.
- Wireframe iteration was still in progress and needed to become high-fidelity design work in Sprint 3.
- Uptime tracking had started, but the dashboard still needed a demo-ready uptime card/graph.

### Reason(s):
- ESLint needed TA approval because it adds a new dependency.
- Backend/frontend integration depended on the team finalizing the signal structure and database direction.
- Team members had other deadlines, midterms, and quizzes.
- Design and implementation work had to move together as the dashboard, test app, and signal structures evolved.

---

## Sprint Retrospective

### What went well:
- The team communicated through dev syncs and standups
- User research and personas were completed
- Backend and frontend work started moving toward integration
- The team began thinking more seriously about linting, testing and CI.
- Documentation was updated throughout the sprint

### What didn't go well:
- Some tasks were blocked because decisions still needed TA or team approval
- ESLint and CI setup took longer than expected
- Some work was still split across different team members, so coordination was needed before merging
- Not all testing and documentation tasks were finished

### What we'll do differently:
- Confirm dependencies and technical decisions earlier in the sprint
- Break testing and CI work into smaller tasks
- Keep using GitHub Issues to track progress clearly
- Update documentation and changelog as changes happen instead of waiting until the end
- Make sure commit messages follow conventional commits

---

## Metrics

| Metric | Value |
|--------|-------|
| Tasks Planned | 15 |
| Tasks Completed | 9 |
| PRs Opened | |
| PRs Merged | |
| Lines of Code Added | |
| Unit Tests Written | 0 |

---

## Notes & Misc

> Key carryovers from Sprint 1 retro: use GitHub Issues (not Google Sheets) for task tracking, hold a dev sync before merging prototype code, update wireframes to reflect actual user research, and begin writing unit tests incrementally.
