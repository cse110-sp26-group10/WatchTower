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

For detailed database setup and migration instructions see [`src/app/server/README.md`](src/app/server/README.md).

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

- **HTML5** — standards-based markup
- **CSS3** — no frameworks
- **Vanilla JavaScript (ES6+)** — no frameworks
- **Node.js** — backend server
- **Supabase (PostgreSQL)** — database and auth
- **NodeMailer** — email notifications via Gmail SMTP
- **ntfy** — push notifications
- **Vitest** — unit testing
- **Playwright** — end-to-end testing
- **ESLint / html-validate / Stylelint** — linting and validation
- **GitHub Actions** — CI/CD
- **JSDoc** — code documentation
- **MADR** — architecture decision records
