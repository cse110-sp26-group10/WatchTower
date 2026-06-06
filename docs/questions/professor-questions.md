# Questions for Professor Powell

##**Sprint 1 — Leadership Questions**

---

## Product Scope

1. The course MVP definition asks us to focus on errors, performance degradation, upset user signals, and build/deployment signals. How strictly should we scope the prototype to these four areas, or is it acceptable to explore adjacent signals if they naturally fit?

2. How polished does the Sprint 1 prototype need to be? Is "low-fidelity but functional with mock data" the right bar, or should we be aiming for something closer to a real working product by end of Sprint 1?

3. At what point in the quarter should we stop exploring and lock the design? Is there an expected transition point between exploration and implementation?

---

## Operational Stability and Complexity

4. The team is intentionally trying to avoid over-engineering. What is the biggest mistake you've seen teams make when they try to build too much too fast in a course project like this?

5. How much backend complexity is appropriate for this project? We are currently leaning toward a static frontend with mock data for Sprint 1. Is that a reasonable long-term simplification or should we plan for lightweight server-side logic?

6. For a team of our size, what is the right amount of infrastructure to aim for by the end of the quarter — for example, CI, automated testing, deployment pipelines?

---

## Risk and Prioritization

7. If we cannot complete every planned MVP feature by the end of the quarter, what should we protect first — a clean working core or a broader set of partially working features?

8. Are there any specific WatchTower signals — errors, performance, user feedback, deployments — that you think are more important or more interesting to prioritize over others?

---

## Team Structure and Process

9. How much process overhead is appropriate for a team our size? We are doing standups, sprint planning, TA syncs, and documentation. Is there anything we are missing or anything we should reduce?

10. What is the best way to make sure all team members are contributing meaningfully across different roles — frontend, research, product, QA — without creating bottlenecks?  

## Sprint 2 — Authentication and Backend
 
---
 
### Authentication
6. We are planning to use Supabase for authentication. Are there any security patterns or constraints you want us to follow, or is the implementation largely our call?
7. How much of the backend complexity should be exposed to the frontend at this stage — should we keep things loosely coupled from the start, or is tight integration acceptable for now?
---
 
### Code Quality
8. How detailed should our JSDoc comments be? Are public APIs sufficient, or do you expect all functions including internal helpers to be documented?
9. For a team our size, what is the right level of CI infrastructure to have in place by mid-quarter — for example, lint checks, unit tests, and automated formatting?
---
 
## Sprint 3 — Frontend, Notifications, and Refactoring
 
---
 
### Notifications
10. We have decided to use ntfy for push notifications, alongside potential SMS and email support. Do you have a preference for notification delivery, or should we support multiple channels from the start?
11. What is the minimum viable notification flow you would expect to see working by end of Sprint 3 — just the backend trigger, or a full end-to-end alert reaching a user?
---
 
### Frontend and Accessibility
12. How closely should the implemented UI match our wireframes? Is design flexibility acceptable during development, or should we treat wireframes as a strict specification?
13. You gave us guidance on accessibility during office hours. What is the minimum bar you expect — for example, WCAG 2.1 AA compliance? Should colorblind themes and ARIA support be fully in scope this sprint?
14. We are doing a significant frontend refactor this sprint alongside new feature work. What is your guidance on managing that risk — should the old branch stay live until the new one is fully tested?
---
 
## Sprint 4 — Testing, Polish, and Delivery
---
 
### Testing
15. What are your expectations for test coverage — is there a minimum percentage, or are there specific critical paths such as login, notifications, and the dashboard that you want fully covered?
16. For end-to-end tests, do you have a preferred framework such as Playwright or Cypress, or is that left to us?
---
 
### Final Deliverable
17. How much weight does the final PR structure and code review quality carry relative to the working product itself?
18. What does a complete Sprint 4 look like to you — feature freeze, passing CI, updated documentation, or all of the above?
19. If we cannot finish every planned feature by the end of the quarter, what should we protect first — a clean working core, or a broader set of partially working features?
