# Technical Specifications

**Project:** WatchTower<br>
**Course:** CSE 110 Spring 2026<br>
**Last Updated:** 2026-06-05<br>

---

## Stack

| Layer | Technology |
|------------|-----------------------------------|
| Markup | HTML5 (standards-based) |
| Styling | CSS3 (no frameworks) |
| Logic | Vanilla JavaScript (ES6+) |
| Frontend Architecture | Single Page Application (SPA) with hash routing and reusable web components |
| Backend | Node.js |
| Database | Supabase (hosted PostgreSQL) |
| Authentication | Supabase Auth |
| Notifications | NodeMailer (email via SMTP) and ntfy |
| Deployment | Frontend static hosting plus Node backend deployment |
| Testing | Vitest (unit), Playwright (E2E), GitHub Actions (CI) |
| Docs | JSDoc, ADRs, GENAI log, CHANGELOG |

> No frontend frameworks (React, Vue, Angular, etc.) are permitted per course constraints.

---

## Architecture

### Data Flow

WatchTower uses a client-server architecture with Supabase as the primary data layer.

1. A lightweight browser tracker script captures client-side events such as page loads, clicks, errors, and feedback.
2. The tracker sends event payloads to the WatchTower Node.js backend.
3. The backend validates and processes incoming payloads.
4. Processed data is stored in Supabase using the `@supabase/supabase-js` client.
5. The dashboard frontend fetches live data from backend API endpoints for errors, feedback, activity, projects, and uptime.
6. Supabase Auth manages login, signup, session persistence, and user/project access control.

### Rendering
- The dashboard is a fully client-rendered SPA built in vanilla JavaScript.
- Routing is handled with hash routes.
- UI is built from reusable web components and per-page JavaScript modules.
- No server-side rendering is used.

### Backend Responsibilities
- ingest tracker events
- validate event payloads
- serve dashboard data to the frontend
- run uptime checks
- send notifications
- coordinate reads and writes to Supabase

### Storage and Auth
- Supabase is the primary database platform for the project.
- Schema changes are tracked in `supabase/migrations/`.
- Seed data is stored in `supabase/seed.sql`.
- Authentication is handled through Supabase Auth using email/password login.
- User and project access is scoped through the authenticated Supabase user model.

### Notifications
- Email alerts are sent through NodeMailer over SMTP.
- Push alerts are sent through ntfy.
- Notifications are triggered for key monitoring events such as downtime or error thresholds.

---

## Process Requirements

| Practice | Requirement |
|---------------------------|----------------------------------------------|
| Stand-ups | 3x per week |
| TA Meetings | Weekly |
| Code Reviews | Required for PRs with > 300 lines of code |
| Commits | Prefer Conventional Commits format |
| Branching | Feature branches, PRs into `main` |
| Sprint Mode | Pairing, solo work, and demo-readiness support depending on sprint |

---

## Documentation Standards

- **JSDoc** — exported functions should include JSDoc where applicable
- **ADRs** — architectural decisions are logged under `/docs/adr/`
- **GENAI.md** — any AI-assisted code or content must be disclosed
- **CHANGELOG.md** — notable changes are tracked using Semantic Versioning