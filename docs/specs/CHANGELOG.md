# Changelog
All team members must document any notable changes to the WatchTower project in this file and use [Semantic Versioning](https://semver.org/): `MAJOR.MINOR.PATCH`

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
