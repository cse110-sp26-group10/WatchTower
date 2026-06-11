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
| Nicole Sutedja | research brand color integration with real apps, checked on the progress of peoples tasks, start assigning test team to demo prep, check with backend for final tasks | help with frontend polishing, finalize repo structure and documentation | finals |
| Evan Marriott | Merged PRs into main for the dashboard and errors or test app, refactored src folder to have the folder name for the watchtower be “app” instead of prototype | continue refining documentation and PRs | midterm tmrw |
| Jensen Guo | UI tweaks (emphasizing error number, fixing hamburger menu), repo cleanup, code comments | Ensure CSS consistency, make branding stronger, documentation | Finals |
| Han Yang-Lin | Finished integrating the frontend with the backend. Added project filter dropdown that stays updated with the existing list of projects. Updated uptime card with removed project filter, added margins, and fixed checkmark for indicating selection | Add auth reasoning to Supabase ADR | CSE 120 project |
| Kevin Wang | asking for feedback from the prof | polish the frontend | other ddls and final |
| Benedict Luis | Went to prof Powell's OH for feedback and started working on audit scrum | Finish issue #86 | Finals and projects |
| Aron Wu | Went to prof oh, started adding completion comments to all uncommented issues | Finish adding completion comments to all uncommented issues | none |
| Kaley Chung | Fix the mobile and validate mobile responsiveness across screen sizes (use the tool from Audria's Slack notes) and add Figma to the repo | Delegate tasks and deadlines for demo prep team | midterms |
| Prakhar Shah | Finalize accessibility features: zoom 200%, ARIA, alt tags, light-dark mode | start auditing all documentation for TA | Finals |
| Bethany Miyamoto | task for next sprint assigned | repo clean up and dry run | midterm and projects |

### Stand-up 2 — 06/05/2026
| Name | Did | Doing | Blockers |
|------|-----|-------|----------|
| Nicole Sutedja | look over ui changes and repo structure/documentation | add username info and start merging ui polish to main | final studying |
| Evan Marriott | made UI changes for settings menu and hamburger menu on desktop, merged code into main, cleaned up repo by deleting old branches | continue working on UI improvements and documentation | final studying |
| Jensen Guo | Tweak frontend so that the brand colors are more emphasized | More frontend polishing | Finals |
| Han Yang-Lin | Implemented project sharing server endpoints, and fixed UUID regex, fixed deployment filter, and favicon and logo paths | Update project documentation | Finals |
| Kevin Wang | refined some of the frontend | further polish the frontend | final |
| Benedict Luis | update Changelog + sprint-4.md (final sprint doc) + TECH_SPEC.md. Fixed tampered data in sprint-4.md | finish up left issues and wrapping up docs | Studying for finals |
| Aron Wu | update repo tree and start mobile responsiveness | finish mobile responsiveness | studying for finals |
| Kaley Chung | Tried to delegate the mobile responsivness task | Add user persona (Figma) to repo and ensure all tasks are majority completed | Fever, midterms, quizzes, and finals |
| Prakhar Shah | Audit all documentation (sprints, ADRs, changelog, AI use log, etc.) | Update README and project setup docs and start working in wiki | Finals |
| Bethany Miyamoto | repo cleanup and added more detail to PR and issues | demo dry run | finals |


### Stand-up 3 — 06/06/2026
| Name | Did | Doing | Blockers |
|------|-----|-------|----------|
| Nicole Sutedja | i commented out the old topbar watchtower, i added hover info to all of the charts, changed up home page layout, added username, changed errors page + added charts, moved order of feedback (switch with activity) on the sidebar | approve PRs | None |
| Evan Marriott | Full repo documentation audit, found and catalogued all outdated docs (README setup guide, tracker CDN URL, server paths, repo structure tree). Cleaned up all stale local and remote branches. Reviewed all open GitHub issues and identified what's done vs. still needed. Merged branches into main | Continue to work on documentation gaps | None |
| Jensen Guo | Frontend update and security fixes | Documentation | Final |
| Han Yang-Lin | Revamped ntfy and email notifications, and started working on API documentation | Complete API documentation | Finals |
| Kevin Wang | fix frontend bugs, test features | help with the documentation if needed | None |
| Benedict Luis | Reviewing + finalizing docs and scrum master audit | help anyone who needs a hand in wrapping up | Finals |
| Aron Wu | Add comments for all closed issues to track resolving commit/pr, added css rules specific for mobile topbar and detailed error display | Work on demo videos | Finals |
| Kaley Chung | Uploaded the Figma and checked that all tasks are majority completed | Cross-check everything against Audria's original requirements spec | Finals and fever |
| Prakhar Shah | finished Wiki, checked all docs(sprint,changelog, technicalspec, etc) updated changelog | finished with tasks, work on final demo | finals |
| Bethany Miyamoto | more repo clean up, fixed readme, contacted dev about demo dry run | demo dry run | Finals |

---
## Decisions Made
| Decision | Rationale | ADR Link |
|----------|-----------|----------|
| Add permission levels (Owner, Co-Owner, Viewer) to project sharing | Sharing a project should let the owner control what the other person can do; Viewer covers read-only use and Co-Owner allows management tasks | |
| Scope project filter to the top bar, not individual cards | Filtering by project at the top level scopes all dashboard cards at once, which is cleaner than per-card dropdowns | |
| Prefix ntfy topic names with "WatchTower_" | Makes the WatchTower notification channel clearly identifiable in the ntfy app alongside other subscriptions | |

---
## Sprint Review
### What was completed:
- The main frontend and backend integration was completed, so the dashboard is now connected to live backend data.
- The notification system was finished and improved, with both email and ntfy support working and documented.
- Browser-type detection was merged, checked and reflected in the dashboard.
- A lot of final UI polish got done, including layout cleanup, chart hover details, sidebar updates and mobile responsiveness fixes.
- The repo was cleaned up a lot by removing stale branches, deleting unused files/pages and making `src/app/` the main application directory.
- We did a full documentation audit and found the outdated setup instructions, old tracker references and other cleanup items that still need to be updated before the presentation.
- CI and testing pipeline improvements were finished and merged, including dependency checks and formatting checks.
- Figma files and other final supporting materials were also added and organized for submission.

### What was not completed:
- Screen/display size tracking for error events was not started.
- The Supabase ADR still needs the final auth reasoning added.
- Some documentation cleanup is still in progress, especially the README/Wiki setup instructions and a few outdated references.
- Final GitHub issue comments, sprint metrics, and a few last repo cleanup items still need to be wrapped up.
- The final demo dry-run and demo video still need to be completed before submission.

### Reason(s):
- Sprint 4 had a lot happening at once, especially final integration, polishing, documentation, cleanup and demo prep.
- A few of the remaining tasks were end-of-sprint cleanup items, so they got pushed back until the bigger feature work was done.
- Some final updates still depend on the last documentation pass, demo dry-run and final team wrap-up.

---

## Sprint Retrospective
### What went well:
- The team made strong progress on the biggest Sprint 4 priorities, especially finishing the frontend-backend integration and getting the app into a much more complete state.
- A lot of polish work got done near the end of the sprint, including UI cleanup, responsiveness fixes, notification improvements and repo cleanup.
- Documentation, PRs, and GitHub issues were reviewed more carefully toward the end, which helped us catch outdated setup instructions and other project details before the presentation.
- CI/testing work was completed and merged, which helped keep the repo stable while final changes were being wrapped up.

### What didn't go well:
- Some documentation fell behind the actual state of the project, so we had to spend time late in the sprint doing a full audit and identifying outdated sections.
- A few tasks stayed open until the very end because they depended on final review, demo prep or end-of-sprint cleanup.
- Issue comments, sprint metrics and some repo bookkeeping were not updated as consistently during the sprint as they could have been.

### What we'll do differently:
- Update README/setup docs and other shared documentation earlier whenever architecture or folder structure changes.
- Keep GitHub issues, sprint docs and completion notes up to date throughout the sprint instead of saving most of it for the end.
- Set aside dedicated time earlier for final audit work, demo prep and submission cleanup so those tasks do not pile up all at once.
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
