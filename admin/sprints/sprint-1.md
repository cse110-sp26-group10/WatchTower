# Sprint 1 — Research, Prototyping, and MVP Definition

**Project:** WatchTower <br>
**Dates:** 05/04/2026 – 05/11/2026 <br>

---

## Sprint Goal

> Define the project’s Minimal Viable Product (MVP) through user research and early prototyping while establishing the team’s development workflow.

---

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
| T01 | Review project overview and documentation requirements | All team members | 🔄 In Progress | Review GitHub structure |
| T02 | Assign Sprint 1 roles and update task tracker | Nicole / Evan |  ✅ Done | |
| T03 | Conduct user research and create personas | Product & Design Team | 🔲 Not Started | Use Figma |
| T04 | Create initial wireframes and user flow | Product & Design Team | 🔲 Not Started | Use Figma |
| T05 | Build early prototype (LLM assistance allowed) | Product & Design Team | 🔲 Not Started | Focus on core flow |
| T06 | Finalize and document MVP definition | Leadership / Product | 🔄 In Progress | |
| T07 | Attend Professor Powell’s office hours | Evan / Available Members | ✅ Done | Wed 2 PM - 4 PM |
| T08 | Maintain Sprint 1 documentation in GitHub | Nicole | 🔄 In Progress | |

> Status options: 🔲 Not Started · 🔄 In Progress · ✅ Done · 🚫 Blocked

---

## Stand-ups

### Stand-up 1 — 05/05/2026 (Tuesday)

| Name | Did | Doing | Blockers |
|------|-----|-------|----------|
| Nicole Sutedja | Created repository structure, finished Sprint 1 notes, created project doc, created and assigned roles for this sprint | Prepare questions for Powell, plan out GitHub Issues, flush out MVP definition | None |
| Kaley Chung | Started communicating in the Product & Design Team channel | Delegate roles & understand aligned tasks for every role | None |
| Jensen Guo | Figured out subteam roles and signed up for tasks on the tracker | Begin learning Figma and start on wireframes | None |
| Prakhar Shah | Started communicating and finished subdivision of roles within the team | Look at requirements for role and research user personas | None |
| Bethany Miyamoto | Figured out roles in subteam development; assigned as data engineer | Research and brainstorm data that should be tracked/tested | None |
| Kevin Wang | Divided roles within the development team; assigned as frontend developer | Build the dashboard prototype | None |
| Han Yang-Lin | Divided roles within development team; assigned as backend developer | Research observability tools, write the ADR, build prototype file structure | None |
| Aron Wu | Started communicating; decided to collaborate on tasks this sprint | Begin working on testing plan | None |
| Benedict Luis | Discussed approach to testing tasks; determined a testing plan for the next best step | Develop a testing plan | None |
| Evan Marriott | Planned tasks for this sprint | Work on defining the MVP for the project | None |

### Stand-up 2 — 05/07/2026 (Thursday)

| Name | Did | Doing | Blockers |
|------|-----|-------|----------|
| Nicole Sutedja | Met with Powell to understand MVP requirements | Update MVP definition, check-in with the different teams | Ensuring the team has the same/aligned goals |
| Kaley Chung | Started with User Researcher / Persona Lead & Listing Key Points | Finishing up research | Having midterms/quizzes |
| Jensen Guo | Began wireframing the dashboard and other pages using Figma | Finish the wireframes (estimated by saturday night) | I don't have a good understanding of the build/deployment signals, if there's any examples of them that would help a lot |
| Prakhar Shah | started on research for user personas | start crafting user personas | midterm and huge time commitment tomorrow |
| Bethany Miyamoto | Started on mock data JS file for errors, performance, signals, deployments | Finish file and connect to prototype for testing | None |
| Kevin Wang | start building a dashboard prototype and the basic filtering logic | Finish them and start building the issue detail prototype | None |
| Han Yang-Lin | Conducted research on product and web analytics tools | start building the prototype file structure | None |
| Aron Wu | Started drafting testing plan | Complete testing plan | None |
| Benedict Luis | testing plan drafted on 2 separate testing plan (Aron’s and mine) | refine both testing plan with Aron to finalize the official one | Midtemrs and quizzes |
| Evan Marriott | Prepare questions to ask TA for project | Create Github issues for all tasks | Time |

### Stand-up 3 — 05/10/2026 (Sunday)

| Name | Did | Doing | Blockers |
|------|-----|-------|----------|
| Nicole Sutedja | Check in with each team, checked GitHub issues, update MVP with definition & informed development | Update Figma with user research & possibly style guide, plan for next sprint | deciding on how to alert the user of issues & if required waiting to tell TA about external dependencies |
| Kaley Chung | Completed company research and realistic features and what to avoid for project | Finish the remaining research | Midterms and quizzes |
| Jensen Guo | Drafted low fidelity initial wireframes for the dashboard, issue detail, user feedback, and requirements | terate and refine the wireframes based off feedback, and add them to the repo | None |
| Prakhar Shah | | | |
| Bethany Miyamoto | Finished up mock data file and started a feedback widget for feedback and filtering | Finish the js files and push | None |
| Kevin Wang | communicated with teammates about the shape of log data, built the prototype for dashboard | Build exploratory issue detail prototype | None |
| Han Yang-Lin | Created the file structure for the prototype. Started writing basic logic for validating client signals | Continue working on server.js to connect issues to signals | None |
| Aron Wu | Finished testing plan with Ben. Finalized unit test ideas and e2e flows | Help update testing evidence log | None |
| Benedict Luis | Reviewed and finalized testing plan ideas with Aron and decided what to combine into the official sprint 1's testing plan. Added sections for future unit tests, the E2E demo flow and manual testing. Update stand up 2 | Add or help collect testing evidence later, such as screenshots of the dashboard, filters, issue detail view and maybe deployment signal connection. Finish up stand up 3 log | None |
| Evan Marriott | Created all 41 Sprint 1 GitHub issues with labels, priorities, and acceptance criteria. Wrote and closed professor questions, Sprint 2 task ideas, two ADRs (vanilla JS decision, mock data decision), and CI plan. Reorganized docs into subfolders | Continue finalizing structure and planning for next sprint | Can't finalize MVP updates until TA sync with Audria happens |

---

## Decisions Made

| Decision | Rationale | ADR Link |
|----------|-----------|----------|
| Sprint 1 Duration: 1 Week | Shorter cycle for planning/research allows for faster regrouping. | N/A |
| Asynchronous Slack Stand-ups | More efficient than live meetings for brief status updates. | N/A |
| Use Figma for Design/Research | Provides a centralized, collaborative space for visual planning. | N/A |
|Vanilla HTML, CSS, JS chosen for tech stack|JS frameworks prohibited, reduces complexity, and adds accessibility for all members|[Link](/docs/adr/001-use-vanilla-html-css-js.md)|
|Static mock data for prototype|Validates MVP design and UCD direction without making infrastructure commitments|[Link](/docs/adr/002-use-mock-data-for-prototype.md)|

---

## Sprint Review

### What was completed:
- Prototype development is going well, frontend built, good progress towards completion across frontend backend and dashboard, individual parts working 
- Wireframes made, research into similar products and project expectations done
- Testing plan developed and finalized
- ADRs created for crucial decisions, questions prepared for TA and professor
- Repo and prototype file structures defined

### What was not completed:
- User personas

### Reason(s):
- Not confirmed completed

---

## Sprint Retrospective

### What went well:  
-  Solo development worked well across all teams
-  Tasks were completed efficiently
-  Collaborative efforts also worked well
-  Check-ins and sprint went well
-  Everyone is on task, wireframes demos and dashboard all look great

### What didn't go well:
- Not as much communication during solo development
- Concerns about code conflicts in prototype as a result of decentralized development
- Wireframe developed with less influence from user research and desired features

### What we'll do differently:
- Begin using GitHub Issues to track tasks and retire the Google Sheets task tracker
- Schedule a meeting to merge code and fix issues if they come up.
- Update changelog accordingly, include both features and bug fixes
- Begin working together and collaborating more within teams
- Begin thinking about implementing tests 
- Update wireframe to reflect user research and desired features

---

## Metrics

| Metric | Value |
|--------|-------|
| Tasks Planned | 8 |
| Tasks Completed | |
| PRs Opened | |
| PRs Merged | |
| Lines of Code Added | |
| Unit Tests Written | |

---

## Notes & Misc

> Office hours are on Wednesday from 2:00 PM to 4:00 PM in CSE 2124. Any questions regarding project expectations should be directed to Professor Powell during this time.
