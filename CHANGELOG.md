# Changelog
All team members must document any notable changes to the WatchTower project in this file and use [Semantic Versioning](https://semver.org/): `MAJOR.MINOR.PATCH`

## [0.2.0] - 2026-05-14
### Added
- Test app (`src/test-app/`) — 5-page vanilla JS clothing store for generating real WatchTower signals
- Home page with hero section and featured products grid
- Shop page with category filtering (Tops, Bottoms, Outerwear, Accessories)
- Product detail page with size picker and add-to-cart via localStorage
- Cart page with line items, quantities, subtotal, and remove functionality
- Checkout page with form validation, post-purchase star rating survey, and manual error trigger button
- Shared `escapeHtml` utility to prevent XSS across all dynamic DOM rendering
- WatchTower tracker embedded on all pages via script tag

## [0.1.0] - 2026-05-11
### Added
- Initial project structure and folder scaffold
- Sprint 1 research, ADRs, CI plan, and prototype file structure
- MVP definition and technical specification
- Observability tool research
- Early testing plan
