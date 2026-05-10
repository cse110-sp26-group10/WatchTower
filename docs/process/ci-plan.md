# CI Plan — Sprint 1

**Status:** Planning only — no GitHub Actions workflows are implemented yet.

---

## Goal

Define what the WatchTower CI pipeline should eventually check so that it can be implemented incrementally starting in Sprint 2.

---

## Planned Pipeline Steps

### 1. HTML Validation
- Use an HTML validator (e.g., `html-validate` or the W3C validator CLI) to catch structural errors in `index.html` and any other HTML files.

### 2. CSS Linting
- Run a CSS linter (e.g., `stylelint`) to enforce consistent style rules and catch invalid property values.

### 3. JavaScript Linting
- Run `eslint` on `app.js`, `data.js`, and any other JS files to catch syntax errors, undefined variables, and style issues.
- Config should enforce no `var`, consistent semicolons, and JSDoc presence on exported functions.

### 4. Unit Tests
- Run JavaScript unit tests using a lightweight test runner (e.g., Jest or plain Node `assert`).
- Initially targets filter functions, signal-to-deployment matching logic, and data formatting utilities.

### 5. Link Check (Optional)
- Check internal links in documentation files to catch broken `docs/` references.

---

## Trigger Conditions

| Event | Pipeline |
|-------|----------|
| Pull request opened or updated | Run all steps |
| Push to `main` | Run all steps |
| Manual trigger | Run all steps |

---

## Sprint 1 Status

No CI workflow file exists yet. This document captures the intent so the team can implement the pipeline in Sprint 2 without re-planning from scratch.

The workflow file will live at `.github/workflows/ci.yml` when created.

---

## Open Questions

- Will we use Jest or a lighter test runner given the no-framework constraint?
- Should the HTML validator run against the deployed page or the raw file?
- Who is responsible for maintaining the CI configuration as the project grows?
