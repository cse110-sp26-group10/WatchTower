# WatchTower 

A centralized observability system for tracking errors, performance degradation,
and upset user signals. Built for CSE 110 Spring 2026 at UC San Diego.

## Important Links

**Deployment**: https://cse110-sp26-group10.github.io/WatchTower/src/app/dashboard/

**Videos**
- **Final Project Video (Public)**: https://youtu.be/0o0enaMbSOI
- **Final Project Video (Private)**: https://youtu.be/iuB-03OBbPw
- **Team Status Video**: https://youtu.be/1RdMwzMQqv8
  
**Resources**
- **Wiki Page**: https://github.com/cse110-sp26-group10/WatchTower/wiki
- **Onboarding Doc**: https://github.com/cse110-sp26-group10/WatchTower/wiki/Onboarding
- **Figma Link**: https://tinyurl.com/4hcp36yr

## How to Run Locally

**Prerequisites:** Node.js 20+, Docker Desktop (running)

```bash
# 1. Install dependencies
npm install                        # repo root
cd src/app/server && npm install   # server dependencies

# 2. Start local Supabase (first run downloads Docker images)
cd ../../..                        # back to repo root
npx supabase start
npx supabase status                # copy the local URLs and keys

# 3. Configure environment
cp src/app/server/.env.example src/app/server/.env
# Edit src/app/server/.env with the SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY
# from `npx supabase status` (use the secret/service_role key, not the anon key)

# 4. Run the server
cd src/app/server && npm start     # listening on http://localhost:8080

# 5. Open the dashboard
# Open src/app/dashboard/index.html in a browser, or use VS Code Live Server
```

For detailed database setup and migration instructions see [`supabase/README.md`](supabase/README.md).

## Repository Structure

```
WatchTower/
├── .github/
│   └── workflows/                # GitHub Actions CI workflow
├── admin/
│   ├── feedback/                 # Team feedback and retrospectives
│   ├── sprints/                  # Sprint planning and status documents
│   └── pr-template.md            # Pull request template
├── archive/                      # Archived prototypes and legacy code
├── docs/
│   ├── adr/                      # Architecture Decision Records
│   ├── design/                   # Design plans and artifacts
│   ├── questions/                # Questions and notes for stakeholders
│   ├── research/                 # Research and competitive analysis
│   ├── specs/                    # MVP, technical specifications, changelog
│   ├── testing/                  # Testing plans and CI strategy
│   └── user/                     # User documentation and personas
├── src/
│   ├── app/                      # Main WatchTower application
│   ├── test-app/                 # Sample application used for testing
│   └── filters.js
├── supabase/
│   ├── migrations/               # Database schema migrations
│   └── seed.sql                  # Seed data
├── tests/
│   ├── e2e/                      # Playwright end-to-end tests
│   └── unit/                     # Vitest unit tests
├── .gitignore
├── .htmlvalidate.json            # HTML validation configuration
├── .stylelintrc.json             # Stylelint configuration
├── eslint.config.js              # ESLint configuration
├── package.json                  # Project dependencies and scripts
├── package-lock.json
├── playwright.config.js          # Playwright configuration
├── vitest.config.js              # Vitest configuration
└── README.md                     # Project overview and setup guide
```
## Tech Stack
WatchTower intentionally avoids heavy third-party frameworks to maintain low performance overhead and high transparency.

| Layer | Technology | Notes |
| :--- | :--- | :--- |
| **Markup** | HTML5 | Semantically structured markup. |
| **Styling** | CSS3 | Native styling patterns (no UI frameworks or preprocessors). |
| **Logic** | Vanilla JavaScript | Clean ES6+ implementation without bundler dependencies. |
| **Backend** | Node.js | HTTP server handling all API routes, event ingestion, and uptime monitoring. |
| **Database** | Supabase / PostgreSQL | Managed backend layer with strict schema definitions. |
| **Auth** | Supabase Auth | Email/password login with session management. |
| **Notifications** | NodeMailer, ntfy | Email alerts via Gmail SMTP and push notifications via ntfy. |
| **Testing** | Vitest, Playwright | Unit validation alongside end-to-end user flow automation. |
| **Linting** | ESLint, html-validate, Stylelint | JS, HTML, and CSS validation enforced in CI. |
| **CI/CD** | GitHub Actions | Automated linting, testing, and security audit pipelines. |
| **Docs** | JSDoc, MADR | Code-level documentation paired with Architecture Decision Records. |

## Key Documentation
For more details, be sure to check out our [Wiki](https://github.com/cse110-sp26-group10/WatchTower/wiki) page. 
| Document | Description |
|----------|-------------|
| [MVP Definition](https://github.com/cse110-sp26-group10/WatchTower/blob/main/docs/specs/MVP_DEFINITION.md) | Scope and feature boundaries for the minimum viable product |
| [Technical Spec](https://github.com/cse110-sp26-group10/WatchTower/blob/main/docs/specs/TECHNICAL_SPEC.md) | Full stack, architecture, and process requirements |
| [Changelog](https://github.com/cse110-sp26-group10/WatchTower/blob/main/docs/specs/CHANGELOG.md) | Version history using Semantic Versioning |
| [GenAI Disclosure Log](https://github.com/cse110-sp26-group10/WatchTower/blob/main/docs/specs/GENAI.md) | All AI-assisted code and content disclosed here |
| [ADRs](https://github.com/cse110-sp26-group10/WatchTower/tree/main/docs/adr) | Architecture Decision Records in MADR format |
| [Sprint Docs](https://github.com/cse110-sp26-group10/WatchTower/tree/main/admin/sprints) | Sprint planning, stand-ups, reviews, and retrospectives |
| [Tracker Integration Guide](https://github.com/cse110-sp26-group10/WatchTower/blob/main/docs/user/tracker-integration.md) | How to embed the WatchTower tracker in a web app |
| [Testing Plan](https://github.com/cse110-sp26-group10/WatchTower/blob/main/docs/testing/testing-plan.md) | Unit and E2E testing strategy |
| [API Reference](https://github.com/cse110-sp26-group10/WatchTower/blob/main/docs/specs/API_REFERENCE.md) | API reference doc for all endpoints |

## Team 10 Roster
Built by our amazing 10x developers below! :)
| Name | GitHub |
|------|--------|
| Nicole Sutedja | [@nicolesutedja](https://github.com/nicolesutedja) |
| Evan Marriott | [@evangmarriott](https://github.com/evangmarriott) |
| Aron Wu | [@arw008-droid](https://github.com/arw008-droid) |
| Bethany Miyamoto | [@b3-m0](https://github.com/b3-m0) |
| Jensen Guo | [@jguo55](https://github.com/jguo55) |
| Kaley Chung | [@chungkaley](https://github.com/chungkaley) |
| Xuanye Wang | [@KeeevinW](https://github.com/KeeevinW) |
| Benedict Luis | [@bluis1](https://github.com/bluis1) |
| Han Yang-Lin | [@hyanglin0](https://github.com/hyanglin0) |
| Prakhar Shah | [@prs-016](https://github.com/prs-016) |

