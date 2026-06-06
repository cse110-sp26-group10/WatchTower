# Sprint #4 — Final Polish, Bug Fixes & Demo Readiness
**Project:** WatchTower <br>
**Dates:** 06/01/2026 – 06/07/2026 <br>

---
## Sprint Goal
> Tie up all remaining loose ends — complete backend-frontend integration, polish the UI for developer needs, finalize CI and scrum docs, ensure absolute demo readiness (accessibility, responsiveness, repo cleanup), and deliver a polished final video. CODE FREEZE IS JUNE 7TH!

---
## Team
| Name | Role | Mode |
|------|------|------|
| Nicole Sutedja | Team Lead / Frontend | Pairing |
| Evan Marriott | Team Lead / Full-Stack | Solo |
| Jensen Guo | Frontend (Mini-Lead) | Pairing |
| Han Yang-Lin | Backend (Mini-Lead) | Pairing |
| Kevin Wang | Backend | Pairing |
| Benedict Luis | Scrum Master + Testing / CI (Mini-Lead) | Pairing |
| Aron Wu | Testing / CI | Pairing |
| Kaley Chung | Demo Readiness (Mini-Lead) | Pairing |
| Prakhar Shah | Demo Readiness | Pairing |
| Bethany Miyamoto | Demo Readiness | Pairing |

> Mode: `Pairing` / `Mobbing` / `Solo`
> Demo Readiness: Flexible contributors — ensure all tasks are complete, requirements are met, repo is clean, and the project is ready to demo. Go wherever help is needed.

---
## Sprint Backlog
| ID | Task | Assignee(s) | Status | Notes |
|----|------|-------------|--------|-------|
| T01 | Complete backend–frontend integration (connect new UI to endpoints) | Han Yang-Lin, Kevin Wang, Jensen Guo | ✅ Done | High priority integration; ensure ready for demo |
| T02 | Write ADR for notification system (NodeMailer / ntfy) | Han Yang-Lin, Kevin Wang | ✅ Done | Backend documentation deliverable |
| T03 | Update Supabase ADR to include auth reasoning | Han Yang-Lin, Kevin Wang | 🔄 In Progress | Add detailed architectural justification for built-in auth |
| T04 | Finish small UI fixes, polish app/cards to look professional | Jensen Guo | ✅ Done | Rounded corners removed, error emphasis improved, survey message fixed |
| T05 | Merge browser-type detection PR and validate in dashboard | Evan Marriott, Nicole Sutedja | ✅ Done | Core lead verification |
| T06 | Implement screen/display size tracking for error events | Evan Marriott, Nicole Sutedja | 🔲 Not Started | Track display context at time of error |
| T07 | Finalize PR structure and close completed GitHub Issues | Evan Marriott, Nicole Sutedja | ✅ Done | Align issue tracker with final repository state |
| T08 | Write "definition of done" into process docs | Evan Marriott, Nicole Sutedja | ✅ Done | Core process documentation |
| T09 | Finalize CI pipeline additions (dependency check, changelog, formatting) & open PR from testing branch | Benedict Luis, Aron Wu | ✅ Done | Merged via PR #83; dependency + Prettier on `main` |
| T10 | Check and update all Scrum Master docs, repo tasks, metrics, and issues | Benedict Luis, Aron Wu | 🔄 In Progress | ci-plan + standup updated; metrics and GitHub issues still open |
| T11 | Rename `prototype` folder and update lint/test paths | Kaley Chung, Prakhar Shah, Bethany Miyamoto | ✅ Done | `src/app/` is now the primary directory; prototype archived |
| T12 | Validate mobile responsiveness across screen sizes | Kaley Chung, Prakhar Shah, Bethany Miyamoto | ✅ Done | Hamburger menu position fixed; tested on multiple viewport widths |
| T13 | Finalize accessibility features (zoom 200%, ARIA, alt tags, colorblind/light-dark mode) | Kaley Chung, Prakhar Shah, Bethany Miyamoto | ✅ Done | All accessibility features in place from Sprint 3; verified this sprint |
| T14 | Update README and project setup docs to reflect Supabase and current architecture | Kaley Chung, Prakhar Shah, Bethany Miyamoto | ✅ Done | README updated with current setup instructions |
| T15 | Ensure all tasks are majority completed / adjust to MVP scope if blocked | Kaley Chung, Prakhar Shah, Bethany Miyamoto | 🔄 In Progress | Tracking blockers actively |
| T16 | Cross-check everything against Audria's original requirements spec | Kaley Chung, Prakhar Shah, Bethany Miyamoto | 🔄 In Progress | In progress |
| T17 | Repo cleanup: dead code, stale branches, unused files | Kaley Chung, Prakhar Shah, Bethany Miyamoto | ✅ Done | Unused pages deleted; frontend docs and dead imports removed |
| T18 | Demo dry-run: walk full app flow end-to-end before submission | Kaley Chung, Prakhar Shah, Bethany Miyamoto | 🔲 Not Started | Scheduled before code freeze |
| T19 | Check previous PRs and GitHub Issues to add more detail if necessary | Kaley Chung, Prakhar Shah, Bethany Miyamoto | 🔄 In Progress | In progress |
| T20 | Audit all documentation (sprints, ADRs, changelog, AI use log, etc.) | Kaley Chung, Prakhar Shah, Bethany Miyamoto | 🔄 In Progress | In progress — all sprint docs and ADRs being reviewed and filled out |
| T21 | Ensure demo video is made on time and fully edited | Kaley Chung, Prakhar Shah, Bethany Miyamoto | 🔲 Not Started | Scheduled before code freeze |

> Status options: 🔲 Not Started · 🔄 In Progress · ✅ Done · 🚫 Blocked

---
## Stand-ups
### Stand-up 1 — 06/03/2026
| Name | Did | Doing | Blockers |
|------|-----|-------|----------|
| Nicole Sutedja | Finished adding icons/sidebar changes into UI, created & delegated tasks, started Wiki | Continue with UI polishes in feat/ui-polish | Midterm |
| Evan Marriott | Merged PRs into main for the dashboard and errors or test app, refactored src folder to have the folder name for the watchtower be “app” instead of prototype | continue refining documentation and PRs | midterm tomorrow |
| Jensen Guo | UI tweaks (emphasizing error number, fixing hamburger menu), repo cleanup, code comments | Ensure CSS consistency, make branding stronger, documentation | Finals |
| Han Yang-Lin | Finished integrating the frontend with the backend. Added project filter dropdown that stays updated with the existing list of projects. Updated uptime card with removed project filter, added margins, and fixed checkmark for indicating selection | Add auth reasoning to Supabase ADR | CSE 120 project |
| Kevin Wang | asking for feedback from the prof | polish the frontend | other ddls and final |
| Benedict Luis | Went to prof Powell for feedback and started working on audit scrum master doc | Finish issue #86 | Finals and projects |
| Aron Wu | confirmed CI pipeline passing end to end | review test coverage gaps, help with scrum docs | None |
| Kaley Chung | Fix the mobile and validate mobile responsiveness across screen sizes (use the tool from Audria's Slack notes) and add Figma to the repo | Delegate tasks and deadlines for demo prep team | midterms |
| Prakhar Shah | reviewed outstanding sprint 4 tasks, confirmed sprint 3 accessibility features are working | begin documentation audit across sprints, ADRs, and GENAI log | None |
| Bethany Miyamoto | task for next sprint assigned | repo clean up and dry run | midterm and projects |

### Stand-up 2 — 06/04/2026
| Name | Did | Doing | Blockers |
|------|-----|-------|----------|
| Nicole Sutedja | continued cross-team check-ins, reviewed pending PRs | finalize any remaining frontend tasks before code freeze | None |
| Evan Marriott | backfilled CHANGELOG entries for v0.2.1, v0.3.0, and v0.4.0 | finish PR triage, continue closing and updating GitHub issues | None |
| Jensen Guo | deleted unused pages, fixed hamburger menu position, emphasized errors styling, cleaned up frontend documentation and dead imports | wrap up any remaining UI polish before code freeze | None |
| Han Yang-Lin | fixed survey message display, added project filter to top bar, implemented project sharing with permission levels (Owner, Co-Owner, Viewer), fixed API key in tracker.js | do a final backend review before code freeze | None |
| Kevin Wang | coordinated with Han on permission levels; tested sharing and unsharing flows | confirm feature works end to end across different permission levels | None |
| Benedict Luis | updated sprint docs and worked on scrum master checklist | finish metric updates and review all documentation fields | None |
| Aron Wu | reviewed CI pipeline, confirmed all checks still passing after new commits | help with any remaining test coverage or docs | None |
| Kaley Chung | validated mobile responsiveness across screen sizes, cross-checked features against requirements spec | continue demo readiness work, help with dry-run prep | None |
| Prakhar Shah | audited sprint docs, ADRs, and GENAI log — filled in empty stand-up entries, fixed ADR language and incomplete sections | finish remaining documentation gaps, update README | None |
| Bethany Miyamoto | verified responsiveness on multiple viewport widths, reviewed open and closed GitHub issues for detail | help with demo dry-run prep and any remaining cleanup | None |

### Stand-up 3 — 06/06/2026
| Name | Did | Doing | Blockers |
|------|-----|-------|----------|
| Nicole Sutedja | | | |
| Evan Marriott | | | |
| Jensen Guo | | | |
| Han Yang-Lin | | | |
| Kevin Wang | | | |
| Benedict Luis | | | |
| Aron Wu | | | |
| Kaley Chung | | | |
| Prakhar Shah | | | |
| Bethany Miyamoto | | | |

---
## Decisions Made
| Decision | Rationale | ADR Link |
|----------|-----------|----------|
| Add permission levels (Owner, Co-Owner, Viewer) to project sharing | Sharing a project should let the owner control what the other person can do; Viewer covers read-only use and Co-Owner allows management tasks | |
| Scope project filter to the top bar, not individual cards | Filtering by project at the top level scopes all dashboard cards at once, which is cleaner than per-card dropdowns | |
| Prefix ntfy topic names with "WatchTower/" | Makes the WatchTower notification channel clearly identifiable in the ntfy app alongside other subscriptions | |

---
## Sprint Review
### What was completed:
- The main backend–frontend integration work was completed, so the app is now connected to live backend data.
- The notification system was added and documented with email and ntfy support.
- Browser-type detection was merged and checked in the dashboard.
- A lot of final UI polish was completed, including responsiveness fixes, sidebar updates, layout cleanup, and app directory restructuring.
- The CI pipeline additions were finished and merged, including dependency checking and Prettier formatting checks.
- Sprint/process documentation was updated as part of the final Sprint 4 closeout work.

### What was not completed:
- Screen/display size tracking for error events was not started.
- The final demo dry-run and demo video are still scheduled before code freeze.
- Some final documentation cleanup, issue-board comments, metrics, and scope checks are still in progress.
- The Supabase ADR still needs the final auth reasoning details

### Reason(s):
- Sprint 4 had a lot of final integration, documentation, polish, and demo-readiness work happening at the same time.
- Some items depend on the final team update, the demo dry-run, and the last GitHub issue-board cleanup.
- Standup 3 and some final metrics should be filled in after the next team update instead of guessing early

---
## Sprint Retrospective
### What went well:
- The team made strong progress on connecting the frontend and backend.
- CI/testing work was finished and merged into main.
- The app became more polished and demo-ready through UI fixes, responsiveness work, and cleanup.
- Team members were actively reviewing docs, PRs, issues, and final requirements.

### What didn't go well:
- Some sprint documentation and GitHub issue statuses were not updated as consistently during the sprint.
- A few tasks stayed open late because they depended on final review, demo prep, or code freeze timing.
- Final metrics and issue comments still needed manual cleanup near the end.

### What we'll do differently:
- Update sprint docs and issue statuses more regularly during the sprint.
- Track metrics earlier instead of waiting until the end.
- Add final issue comments and remaining-work notes as part of the normal PR/issue closeout process.

---
## Metrics
| Metric | Value |
|--------|-------|
| Tasks Planned | 21 |
| Tasks Completed | 12 |
| PRs Opened | 4 |
| PRs Merged | 4 |
| Lines of Code Added | 13,984 |
| Unit Tests Written | 0 new unit test written|

---
## Notes & Misc

> **Backend Team** (@Han Yang-Lin [lead], @Kevin Wang)
* Complete backend–frontend integration (connect new UI to endpoints)
* Write ADR for notification system (NodeMailer / ntfy)
* Update Supabase ADR to include auth reasoning
* Ensure functionality ready for demo!!

> **Frontend Team** (@Jensen Guo [lead])
* Complete backend–frontend integration (coordinate with backend team)
* Finish small UI fixes (be very detail oriented)
* Overall polish of the app and cards to look professional and demo-ready

> **Leads** (@Evan Marriott, @Nicole Sutedja)
* Merge browser-type detection PR and validate in dashboard
* Implement screen/display size tracking for error events
* Finalize PR structure and close completed GitHub Issues
* Write "definition of done" into process docs 

> **Scrum Master + Testing / CI** (@Benedict Luis [lead], @Aron Wu)
* Finalize CI pipeline additions (dependency check, changelog, formatting) and open PR from testing branch
* Merge everything into main
* Update Scrum Master docs/repo, mark tasks done, update metrics and issues

> **Demo Readiness** (@Kaley Chung [lead], @Prakhar Shah, @Bethany Miyamoto)
* Rename `prototype` folder and update lint/test paths
* Validate mobile responsiveness across screen sizes (use the tool from Audria's Slack notes)
* Finalize accessibility features (zoom 200%, ARIA, alt tags, colorblind/light-dark mode)
* Update README and project setup docs to reflect Supabase and architecture
* Monitor completion metrics; flag blockers early to adjust to MVP scope
* Cross-check everything against Audria's original requirements spec
* Repo cleanup (dead code, stale branches, unused files)
* Run end-to-end demo dry-runs
* Audit and flesh out detail on previous PRs, GitHub Issues, and all documentation fields
* Record, edit, and submit final demo video on time

---
### Demo Prep Timeline

**Thursday (EOD)**

@Kaley Chung
* Validate mobile responsiveness across screen sizes (use the tool from Audria's Slack notes)
* Add Figma into the repo

@Prakhar Shah
* Finalize accessibility features: zoom 200%, ARIA, alt tags, colorblind/light-dark mode

**Friday (EOD)**

@Kaley Chung
* Ensure all tasks are majority completed — if something is blocked, surface it early and adjust to MVP scope

@Prakhar Shah
* Audit all documentation (sprints, ADRs, changelog, AI use log, etc.) — every field filled out, all docs current

@Bethany Miyamoto
* Repo cleanup: dead code, stale branches, unused files — make it presentable
* Check all previous PRs and GitHub Issues — add more detail if necessary

**Saturday (EOD)**

@Kaley Chung
* Cross-check everything against Audria's original requirements spec

@Prakhar Shah
* Update README and project setup docs to reflect Supabase and current architecture
* Wiki for the repo

@Bethany Miyamoto
* Demo dry-run: walk the full app flow end-to-end before submission

@Aron Wu
* Ensure demo video is made on time and edited
