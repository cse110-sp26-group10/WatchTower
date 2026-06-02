# CI Plan

**Status:** Implemented on `main` (lint, unit, E2E). Extended checks (dependency audit, Prettier) are on `feat/testing-ci` pending merge (Sprint 4 T09).

---

## Goal

Run automated checks on every push and pull request to `main` so regressions are caught before merge.

---

## Current pipeline (`main`)

Workflow: `.github/workflows/ci.yml`

| Job | Command / tool |
|-----|----------------|
| Lint | `npm run lint` (ESLint, html-validate, Stylelint) |
| Unit tests | `npm run test:unit` (Vitest) |
| E2E tests | `npm run test:e2e` (Playwright, Chromium) |

Unit and E2E jobs depend on lint passing.

---

## Planned additions (`feat/testing-ci`)

| Job | Command / tool |
|-----|----------------|
| Dependency check | `npm audit --audit-level=critical` |
| Code formatting | `npx prettier@3.8.3 --check "src/**/*.{html,js,css}" "tests/**/*.js"` |

Unit tests then depend on lint, dependency check, and formatting.

**Changelog:** Enforced by team process and PR template (`docs/pr-template.md`), not yet a CI job. `docs/specs/CHANGELOG.md` is updated on the testing branch (v0.2.1 entry).

---

## Local commands (match CI)

```bash
npm ci
npm run lint
npm audit --audit-level=critical
npx prettier@3.8.3 --check "src/**/*.{html,js,css}" "tests/**/*.js"
npm run test:unit
npx playwright install chromium
npm run test:e2e
```

---

## Trigger conditions

| Event | Pipeline |
|-------|----------|
| Pull request to `main` | All jobs |
| Push to any branch | All jobs (workflow `on: push`) |
| Push to `main` | All jobs |

---

## Maintenance

- **Owners:** Benedict Luis, Aron Wu (Testing / CI)
- **Test runner:** Vitest (unit), Playwright (E2E)
- **Formatting:** Prettier 3.8.3 (check only in CI; run `--write` locally before commit)
