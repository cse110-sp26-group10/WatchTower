# Technical Specifications

**Project:** WatchTower<br>
**Course:** CSE 110 Spring 2026<br>
**Last Updated:** YYYY-MM-DD<br>

---

## Stack

| Layer      | Technology                        |
|------------|-----------------------------------|
| Markup     | HTML5 (standards-based)           |
| Styling    | CSS3 (no frameworks)              |
| Logic      | Vanilla JavaScript (ES6+)         |
| Deployment | GitHub Pages or Cloudflare Pages  |
| Testing    | Jest (unit), GitHub Actions (CI)  |
| Docs       | JSDocs (code), MADR (decisions)   |

> No frontend frameworks (React, Vue, Angular, etc.) are permitted per course
> constraints.

---

## Architecture

### Data Flow (TBD)
> The data source has not yet been finalized. The options under consideration are:

| Option              | Pros                        | Cons                          |
|---------------------|-----------------------------|-------------------------------|
| Static JSON file    | Simple, no backend needed   | Not dynamic                   |
| Public API/webhook  | Real data                   | Requires CORS handling        |
| User manual input   | No dependency on data source| Not realistic to real use case|

### Rendering
- Logs will be fetched and rendered dynamically via JavaScript DOM manipulation
- No server-side rendering
- Data will be displayed in a table or list component built in vanilla JS

---

## Process Requirements

| Practice                  | Requirement                                  |
|---------------------------|----------------------------------------------|
| Stand-ups                 | 3x per week                                  |
| TA Meetings               | Weekly                                       |
| Code Reviews              | Required for PRs with > 300 lines of code    |
| Commits                   | Must follow Conventional Commits format      |
| Branching                 | Feature branches, PRs into main              |
| Sprint Mode               | Pairing and Mobbing (Sprint #1)              |

---

## Documentation Standards

- **JSDocs** — all exported functions must have JSDoc comments
- **ADRs** — all architectural decisions logged in MADR format under `/docs/adr/`
- **GENAI.md** — any AI-assisted code or content must be disclosed
- **CHANGELOG.md** — updated each sprint using Semantic Versioning
