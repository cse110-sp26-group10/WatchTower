# Changelog
All team members must document any notable changes to the WatchTower project in this file and use [Semantic Versioning](https://semver.org/): `MAJOR.MINOR.PATCH`

## [0.3.0] - 2026-06-03

### Added
- Restructured frontend to a Single Page Application (SPA) with a JavaScript router, per-page JS modules, and reusable web components (sidebar, topbar, uptime card, error list, feedback list, summary metrics, modals).
- New dashboard UI matching the updated Figma hi-fi wireframes, including dark/light mode support and CSS token usage throughout.
- Collapsible sidebar with hamburger navigation for small screens and mobile responsiveness across all pages.
- Login and sign-up pages using Supabase built-in authentication (email/password).
- Projects page for creating, selecting, and deleting monitored projects; project selection scopes all dashboard data.
- Browser type detection in the WatchTower tracker — `parseBrowser()` reads the `userAgent` string and attaches browser name and version to every outgoing event.
- Browser field stored as a JSONB column in the events table and displayed in the issue detail Context panel.
- Error deduplication: identical errors (matched by message and stack signature) are grouped into collections with occurrence counts.
- Error resolve functionality: users can mark errors as resolved from the dashboard; status is persisted to the database.
- Notification system: users receive alerts via email (NodeMailer over Gmail SMTP) and push notifications (ntfy) when monitored sites go down or error thresholds are exceeded.
- Manual error trigger buttons on all four test app pages (home, shop, product, cart) for generating specific error types on demand during development — TypeError, ReferenceError, RangeError, URIError, and unhandled Promise rejections.
- Unit tests for user authentication and login flows.
- Unit tests for the notification system (email and ntfy delivery paths).
- Unit tests for uptime check behavior.
- Dependency security audit step in the CI pipeline (`npm audit --audit-level=high`).
- Prettier code formatting check in the CI pipeline.
- ADR 007 documenting the decision to use email and ntfy for user notifications.

### Changed
- Relaxed `Event.js` validation: `user_id` and top-level `browser` are no longer required from the tracker payload; the server sets `project_id` via `setField`.
- Playwright E2E tests updated to target the new SPA dashboard structure (hash routes `/#/errors`, `/#/activity`, auth-gated login check).
- Event unit tests refreshed to reflect current ingest and validation behavior.
- Playwright `webServer` timeout increased to 30 s for CI stability on slower runners.
- Updated Figma wireframes in `docs/design/`.
- Uptime monitoring refactored to use the registered user instead of a raw URL as the lookup key.

### Fixed
- Fixed E2E tests that targeted the old multi-page dashboard structure after the SPA refactor.
- Fixed code formatting issues across multiple files to satisfy Prettier, ESLint, and Stylelint checks in CI.
- Fixed CORS configuration and added logout handling in the server.
- Fixed sidebar UI positioning and uptime card margin issues.
- Fixed browser script loader so `export` keyword does not break in a browser context.

## [0.2.1] - 2026-05-27

### Added
- Added dependency checking to the CI pipeline.
- Added code formatting checks to the CI pipeline.
- Added unit tests for uptime check behavior.
- Added user-facing error message support.

### Changed
- Refactored parts of the frontend code into more modular functions.
- Updated Twilio-related information in the README.
- Refactored website monitoring logic to use user-based input instead of only URL-based input.

### Fixed
- Fixed issues related to uptime check testing and behavior.
- Fixed outdated Twilio documentation after implementation changes.

### Removed
- Removed Twilio from the current implementation.
- Removed `init-db.js` and the `db:init` command.

## [0.2.0] - 2026-05-23

### Added
- Added dashboard prototype
- Added issue detail page
- Added uptime card and sidebar to the dashboard
- Added basic server and tracker prototype
- Added browser script loader for integrating WatchTower into client pages
- Added event logging for page loads, errors, clicks, uptime checks and signals
- Added signal processing support
- Added backend connection to the dashboard
- Added database support for storing and retrieving event data
- Added Supabase migration for backend/database support
- Added deployment-related fields for event tracking
- Added basic prototype filtering
- Added simple feedback signal prototype
- Added GitHub Actions CI workflow for linting, unit tests and E2E tests
- Added Vitest unit test setup
- Added Playwright E2E test setup
- Added ESLint, HTML validation, and Stylelint configuration
- Added error event monitoring for Promise rejections and failed fetch requests.

### Changed
- Updated frontend event handling to attach server/database event IDs
- Updated WatchTower script loading to use jsDelivr
- Updated uptime monitoring target to the deployed website
- Updated server file structure
- Updated dashboard colors, layout, and UI styling
- Updated Supabase README documentation
- Updated README with development setup instructions
- Updated signal structure documentation
- Renamed data fields for consistency

### Fixed
- Fixed class name parsing
- Fixed script source/reference issues
- Fixed event update flow
- Fixed uptime check behavior
- Fixed validation issues related to signal structure
- Fixed mock data naming mismatch
- Improved dashboard error highlighting
- Fixed JavaScript, HTML and CSS linting/validation issues

### Removed
- Removed redundant code and mock survey content
- Reverted earlier mock data branch changes where needed

## [0.1.0] - 2026-05-11
### Added
- Initial project structure and folder scaffold
- Sprint 1 research, ADRs, CI plan, and prototype file structure
- MVP definition and technical specification
- Observability tool research
- Early testing plan
