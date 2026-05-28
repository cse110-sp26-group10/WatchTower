# Sprint #3 — Deliver Core Features & Polish for Final Demo
**Project:** WatchTower <br>
**Dates:** 05/25/2026 – 05/31/2026 <br>

---
## Sprint Goal
> Complete the major remaining features (SMS/email notifications, user login, frontend refactor + new UI, CI improvements, and accessibility) so the project is demo-ready and the final week can be spent on refinement.

---
## Team
| Name | Role | Mode |
|------|------|------|
| Nicole Sutedja | Team Lead / Frontend | Pairing |
| Evan Marriott | Team Lead / Full-Stack | Solo |
| Aron Wu | Backend / Testing | Pairing |
| Bethany Miyamoto | Frontend | Pairing |
| Jensen Guo | Frontend | Pairing |
| Kaley Chung | Research / QA | Pairing |
| Xuanye Wang | Frontend | Pairing |
| Benedict Luis | Backend / Testing | Pairing |
| Han Yang-Lin | Backend | Solo |
| Prakhar Shah | QA / Accessibility / Flex | Solo |

> Mode: `Pairing` / `Mobbing` / `Solo`

---
## Sprint Backlog
| ID | Task | Assignee(s) | Status | Notes |
|----|------|-------------|--------|-------|
| T01 | Attempt toll-free SMS verification (Twilio); pivot to Google API email if unresolved by Thursday | Han Yang-Lin | 🔲 Not Started | Trial account limitation — can only send to virtual number currently |
| T02 | Implement user login using Supabase built-in auth | Han Yang-Lin | 🔲 Not Started | Supabase migration makes this significantly simpler |
| T03 | Frontend refactor — single index.html with per-page JS files and reusable components | Jensen Guo, Bethany Miyamoto | 🔲 Not Started | Coordinate closely to avoid merge conflicts |
| T04 | Implement new UI from Figma wireframes | Xuanye Wang, Bethany Miyamoto, Nicole Sutedja | 🔲 Not Started | Nicole recruiting one available member to assist |
| T05 | Open PR for browser-type detection feature (already on branch) | Evan Marriott | 🔲 Not Started | Professor requested: detect Firefox vs. Chrome etc. at time of error |
| T06 | Implement screen/display size tracking for error events | Evan Marriott | 🔲 Not Started | Capture whether error occurred on phone vs. desktop |
| T07 | Add more error types to the test app | Evan Marriott | 🔲 Not Started | Targeting today or tomorrow |
| T08 | Update & close completed GitHub Issues; add new issues for this sprint | Evan Marriott | 🔲 Not Started | 11 issues currently open; some may already be complete |
| T09 | Add dependency checking, changelog check, and code formatting to CI pipeline | Aron Wu, Benedict Luis | 🔲 Not Started | Implement on testing branch first, then open PR |
| T10 | Write new tests for recently added features | Aron Wu, Benedict Luis | 🔲 Not Started | Continue from previous sprint's testing work |
| T11 | Test dashboard responsiveness across multiple screen sizes | Prakhar Shah, Kaley Chung | 🔲 Not Started | Find tool referenced by Audreya in Slack/meeting notes |
| T12 | Accessibility: zoom to 200%, ARIA live regions, proper image alt tags | Prakhar Shah | 🔲 Not Started | 4–5 user stories cover these requirements |
| T13 | Accessibility: colorblind themes and light/dark mode | Prakhar Shah, Kaley Chung | 🔲 Not Started | In existing user stories |
| T14 | Research additional app feature ideas | Kaley Chung | 🔲 Not Started | Flex task — contribute to accessibility/UI testing as needed |
| T15 | Cross-team check-ins and project management | Nicole Sutedja | 🔲 Not Started | Ongoing throughout sprint |

> Status options: 🔲 Not Started · 🔄 In Progress · ✅ Done · 🚫 Blocked

---
## Stand-ups
### Stand-up 1 — 05/27/2026
| Name | Did | Doing | Blockers |
|------|-----|-------|----------|
| Nicole Sutedja | added sprint 3 md and organized docs, researched sms & decided on ntfy, finished Wireframes details | implement frontend design into app | waiting on code to be ready in new dashboard branch |
| Kaley Chung | | | |
| Jensen Guo | | | |
| Prakhar Shah | | | |
| Bethany Miyamoto | | | |
| Kevin Wang | | | |
| Han Yang-Lin | | | |
| Aron Wu | | | |
| Benedict Luis | | | |
| Evan Marriott | office hours with Powell and organized tasks for sprint 3 | more errors in test app and screen size tracking | None |

### Stand-up 2 — 05/29/2026
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

### Stand-up 3 — 05/31/2026
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
| SMS first, email fallback by Thursday | Professor emphasized text notifications over email; email via Google API is ready as a backup if Twilio verification stalls | |
| Proceed with frontend refactor before new UI implementation | Current codebase has duplicate HTML/JS across pages; refactoring to component architecture first makes new Figma UI implementation cleaner and more maintainable | |
| Use Supabase built-in auth for user login | Supabase migration (completed last sprint) makes this low-effort; avoids building custom auth | |
| Sprint deadline: Friday 05/30 | Final sprint — tasks not done by Friday must be completed before next sprint review; this week determines final project quality | |
| Add suggested mid-sprint deadlines going forward | Work has been back-loaded in previous sprints; internal checkpoints will help distribute effort more evenly | |

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

### What didn't go well:

### What we'll do differently:

---
## Metrics
| Metric | Value |
|--------|-------|
| Tasks Planned | 15 |
| Tasks Completed | |
| PRs Opened | |
| PRs Merged | |
| Lines of Code Added | |
| Unit Tests Written | |

---
## Notes & Misc

> [@Evan Marriott](https://10-devs.slack.com/team/U0AR4S1P0JZ)
* Open PR for browser detection feature on error dashboard
* Add more error types to the test app
* Implement screen/display size tracking for error events
* Update & close completed GitHub issues; add new ones for this sprint

> [@Nicole Sutedja](https://10-devs.slack.com/team/U0ARM53Q7NV)
* Check in across all teams
* Begin implementing Figma wireframes into code (will recruit one available member to help)

> [@Jensen Guo](https://10-devs.slack.com/team/U0ARM5JS801)
* Refactor frontend: single index page with per-page JS files and reusable components
* Coordinate with Bethany and Xuanye to avoid merge conflicts

> [@Bethany Miyamoto](https://10-devs.slack.com/team/U0ARM5P1S8H)
* Implement new UI based on updated wireframes
* Collaborate with Jensen on frontend refactor

> [@Kevin Wang](https://10-devs.slack.com/team/U0AR4RZNJ85)
* Rewrite frontend UI to match new Figma designs
* Coordinate with Jensen and Bethany on refactor

> [@Han Yang-Lin](https://10-devs.slack.com/team/U0ARM5P534Z)
* Attempt toll-free SMS verification (Twilio); if unresolved by Thursday → pivot to email via Google API
* Implement user login using Supabase built-in auth

> [@Aron Wu](https://10-devs.slack.com/team/U0AQSQS5R9D)
* Add dependency checking, changelog check, and code formatting to CI pipeline (test on testing branch first, then open PR)
* Write new tests for recently added features

> [@Benedict Luis](https://10-devs.slack.com/team/U0ARBRZDU5S)
* Continue CI pipeline research and implementation alongside Aron
* Write additional feature tests

> [@Prakhar Shah](https://10-devs.slack.com/team/U0ARM5LEXMX)
* Test dashboard responsiveness across multiple screen sizes (find the tool from Audreya in Slack/meeting notes)
* Address accessibility user stories: zoom to 200%, ARIA live regions, proper image alt tags
* Available as flex resource — reach out if you need extra help

> [@Kaley Chung](https://10-devs.slack.com/team/U0AR1SQ631R)
* Research additional app feature ideas
* Help verify accessibility and UI across different screen sizes with Prakhar
