# Changelog
All team members must document any notable changes to the WatchTower project in this file and use [Semantic Versioning](https://semver.org/): `MAJOR.MINOR.PATCH`

## [0.4.0] - 2026-06-03

### Added
- Settings page for managing notification preferences (email and ntfy), viewing the ntfy topic ID, and copying the project API key to clipboard.
- Project filter dropdown in the top bar, scoping all dashboard cards to the selected project.
- `src/app/` as the primary application directory, replacing `src/prototype/` references; the prototype directory is archived.
- Error notification cooldown: repeated identical errors no longer trigger redundant notifications within a configurable window.
- ntfy topic names now prefixed with `WatchTower/` for clearer channel identification in the ntfy app.
- Uptime card filtering by project, with layout and dropdown fixes.
- Supabase migration (`20260601043232_added_browser.sql`) adding the browser column to the events table in the hosted database.
- Test user and a deployed project added to `supabase/seed.sql` for local development setup.
- ADR 007 documenting the decision to use email (NodeMailer) and ntfy for user notifications.

### Changed
- Fully connected the new SPA frontend to the backend API (home, errors, feedback, activity, and projects pages all fetch live data).
- Login page updated to use email-only (username field removed to match Supabase auth requirements).
- Sidebar updated with CORS fix, logout button added to navigation.
- Moved server URL to a single top-level constant in the frontend for easier configuration.

### Fixed
- Fixed hamburger menu position and error emphasis on small screens.
- Fixed large monitor responsiveness layout issues.
- Fixed uptime card dropdown bug and margin.
- Fixed backend crash when the monitored server goes down and the uptime widget receives no response.
- Fixed CORS configuration on the server.
- Fixed survey message display.
- Removed unused pages and dead code from the dashboard.
- Fixed timeout duration inconsistency between the settings page and the server.

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
