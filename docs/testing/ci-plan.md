# CI Plan

**Status:** Implemented on `main`. The pipeline includes linting, unit tests, E2E tests, dependency audit, and Prettier formatting checks. The extended CI work from Sprint 4 T09 was merged in PR #83 on June 1, 2026.

---

## Goal

Run automated checks on every push and pull request to `main` so regressions are caught before merge.

---

## Current pipeline (`main`)

Workflow: `.github/workflows/ci.yml`

| Job | Command / tool |
|-----|----------------|
| Lint | `npm run lint` (ESLint, html-validate, Stylelint) |
| Dependency check | `npm audit --audit-level=critical` |
| Code formatting | `npx prettier@3.8.3 --check "src/**/*.{html,js,css}" "tests/**/*.js"` |
| Unit tests | `npm run test:unit` (Vitest) |
| E2E tests | `npm run test:e2e` (Playwright, Chromium) |

The CI jobs are ordered so linting, dependency checks, and formatting run before the test jobs. This catches simpler issues first before running the full test suite.

---

## Changelog

Changelog updates are handled through the team process and PR template (`docs/pr-template.md`). This is not currently enforced as a CI job. The Sprint 4 testing/CI update is included in `docs/specs/CHANGELOG.md`.

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