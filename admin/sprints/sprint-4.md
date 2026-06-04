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
| T04 | Finish small UI fixes, polish app/cards to look professional | Jensen Guo | 🔲 Not Started | Detail-oriented; grounded in developer user research/needs |
| T05 | Merge browser-type detection PR and validate in dashboard | Evan Marriott, Nicole Sutedja | ✅ Done | Core lead verification |
| T06 | Implement screen/display size tracking for error events | Evan Marriott, Nicole Sutedja | 🔲 Not Started | Track display context at time of error |
| T07 | Finalize PR structure and close completed GitHub Issues | Evan Marriott, Nicole Sutedja | ✅ Done | Align issue tracker with final repository state |
| T08 | Write "definition of done" into process docs | Evan Marriott, Nicole Sutedja | ✅ Done | Core process documentation |
| T09 | Finalize CI pipeline additions (dependency check, changelog, formatting) & open PR from testing branch | Benedict Luis, Aron Wu | ✅ Done | Merged via PR #83; dependency + Prettier on `main` |
| T10 | Check and update all Scrum Master docs, repo tasks, metrics, and issues | Benedict Luis, Aron Wu | 🔄 In Progress | ci-plan + standup updated; metrics and GitHub issues still open |
| T11 | Rename `prototype` folder and update lint/test paths | Kaley Chung, Prakhar Shah, Bethany Miyamoto | 🔲 Not Started | Structural path updates |
| T12 | Validate mobile responsiveness across screen sizes | Kaley Chung, Prakhar Shah, Bethany Miyamoto | 🔲 Not Started | Use testing tool from Audria's Slack notes |
| T13 | Finalize accessibility features (zoom 200%, ARIA, alt tags, colorblind/light-dark mode) | Kaley Chung, Prakhar Shah, Bethany Miyamoto | 🔲 Not Started | Comprehensive accessibility pass |
| T14 | Update README and project setup docs to reflect Supabase and current architecture | Kaley Chung, Prakhar Shah, Bethany Miyamoto | 🔲 Not Started | Essential documentation alignment |
| T15 | Ensure all tasks are majority completed / adjust to MVP scope if blocked | Kaley Chung, Prakhar Shah, Bethany Miyamoto | 🔲 Not Started | Surface blocks early and adapt actively |
| T16 | Cross-check everything against Audria's original requirements spec | Kaley Chung, Prakhar Shah, Bethany Miyamoto | 🔲 Not Started | Verification pass to ensure 100% compliance |
| T17 | Repo cleanup: dead code, stale branches, unused files | Kaley Chung, Prakhar Shah, Bethany Miyamoto | 🔲 Not Started | Make the codebase highly presentable for final review |
| T18 | Demo dry-run: walk full app flow end-to-end before submission | Kaley Chung, Prakhar Shah, Bethany Miyamoto | 🔲 Not Started | Full app flow verification |
| T19 | Check previous PRs and GitHub Issues to add more detail if necessary | Kaley Chung, Prakhar Shah, Bethany Miyamoto | 🔲 Not Started | Contextual tracking audit |
| T20 | Audit all documentation (sprints, ADRs, changelog, AI use log, etc.) | Kaley Chung, Prakhar Shah, Bethany Miyamoto | 🔲 Not Started | Every single field filled out and current |
| T21 | Ensure demo video is made on time and fully edited | Kaley Chung, Prakhar Shah, Bethany Miyamoto | 🔲 Not Started | Final video production deliverable |

> Status options: 🔲 Not Started · 🔄 In Progress · ✅ Done · 🚫 Blocked

---
## Stand-ups
### Stand-up 1 — 06/02/2026
| Name | Did | Doing | Blockers |
|------|-----|-------|----------|
| Nicole Sutedja | Finished adding icons/sidebar changes into UI, created & delegated tasks, started Wiki | Continue with UI polishes in feat/ui-polish | Midterm |
| Evan Marriott | Merged PRs into main for the dashboard and errors or test app, refactored src folder to have the folder name for the watchtower be “app” instead of prototype | continue refining documentation and PRs | midterm tomorrow |
| Jensen Guo | UI tweaks (emphasizing error number, fixing hamburger menu), repo cleanup, code comments | Ensure CSS consistency, make branding stronger, documentation | Finals |
| Han Yang-Lin | Finished integrating the frontend with the backend. Added project filter dropdown that stays updated with the existing list of projects. Updated uptime card with removed project filter, added margins, and fixed checkmark for indicating selection | Add auth reasoning to Supabase ADR | CSE 120 project |
| Kevin Wang | asking for feedback from the prof | polish the frontend | other ddls and final |
| Benedict Luis | Went to prof Powell for feedback and started working on audit scrum master doc | Finish issue #86 | Finals and projects |
| Aron Wu | | | |
| Kaley Chung | Fix the mobile and validate mobile responsiveness across screen sizes (use the tool from Audria's Slack notes) and add Figma to the repo | Delegate tasks and deadlines for demo prep team | midterms |
| Prakhar Shah | | | |
| Bethany Miyamoto | task for next sprint assigned | repo clean up and dry run | midterm and projects |

### Stand-up 2 — 06/04/2026
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
| | | |

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
| Tasks Planned | 21 |
| Tasks Completed | |
| PRs Opened | |
| PRs Merged | |
| Lines of Code Added | |
| Unit Tests Written | |

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
