# WatchTower 

A centralized observability system for tracking errors, performance degradation,
and upset user signals. Built for CSE 110 Spring 2026 at UC San Diego.

## Team Status Video Link
https://youtu.be/1RdMwzMQqv8

## Team Roster

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

## Deployment
**Link**: 

## Repository Structure
```
WatchTower/
├── .github/
│   └── workflows/                # CI/CD GitHub Actions pipelines
├── admin/
│   └── sprints/                  # Sprint logs and planning docs
│       └── sprint-template.md
├── docs/
│   ├── adr/                      # Architecture Decision Records (MADR format)
│   │   └── ADR-00X-template.md
│   ├── design/                   # Design artifacts and wireframes
│   ├── specs/
│   │   ├── MVP_DEFINITION.md     # Minimal viable product scope
│   │   ├── TECHNICAL_SPECS.md   # Stack, structure, and process requirements
│   │   ├── CHANGELOG.md          # Version history
│   │   └── GENAI.md              # AI assistance disclosure log
│   ├── user/                     # User personas and user stories
│   └── pr-template.md            # Pull request template
├── src/
│   └── assets/                   # JS, CSS, images
├── tests/                        # Unit and E2E tests
├── .gitignore
├── .htmlvalidate.json             # HTML validation config
├── .stylelintrc.json              # CSS linting config
├── eslint.config.js               # JS linting config
├── package.json                   # Node dependencies and scripts
├── package-lock.json
├── playwright.config.js           # E2E test config
├── vitest.config.js               # Unit test config
└── README.md                      # You are here
```
## Tech Stack

- **HTML5** — standards-based markup
- **CSS3** — no frameworks
- **Vanilla JavaScript (ES6+)** — no frameworks
- **Jest** — unit testing
- **GitHub Actions** — CI/CD
- **JSDocs** — code documentation
- **MADR** — architecture decision records

## Process

- 3x weekly stand-ups
- Weekly TA meetings
- Human code reviews required for PRs > 300 lines
- Conventional Commits enforced

## Documentation

- [MVP Definition](docs/specs/MVP_DEFINITION.md)
- [Technical Specs](docs/specs/TECHNICAL_SPEC.md)
- [Changelog](docs/specs/CHANGELOG.md)
- [AI Disclosure](docs/specs/GENAI.md)

## How to Run (in the feat/dashboard–prototype branch)

1. Download PostgreSQL at <https://www.postgresql.org/download/>  
2. Go to the /src/prototype/server directory  
3. Run `npm install`  
3. Add the `.env`  file in the /src/prototype/server directory with the contents (replace `your_password` with the password you used in the PostgreSQL install):  
```env
# Database Configuration  
DB_USER=postgres  
DB_PASSWORD=your_password  
DB_HOST=localhost  
DB_PORT=5432  
DB_NAME=watchtower_db
```  
4. Run `npm run db:init` to create the database (only needs to be run once, or when you want to reset the database)
5. Run `npm start` to start the server
6. Start live server with "Go Live" in VSCode (need the LiveServer extension)
7. Open the test app in src/test-app/index.html
8. Start interacting with the test app (for some reason it seems like if the live server has not been opened recently, it can take about 20 seconds for tracker.js to be loaded)
9. Open the dashboard (Can switch the LiveServer by starting and stopping one at a time. Alternatively, keep the tabs open while opening/closing the port to switch sites in order to have both sites up simulaneously). Find the dashboard in src/prototype/dashboard/index.html

## Issues Running?
- If your shell is still using its old `libpq` client tools rather than the full PostgreSQL, run:
`echo 'export PATH="/opt/homebrew/opt/postgresql@15/bin:$PATH"' >> ~/.zshrc  
source ~/.zshrc`
Verify with `which initdb` and ideally start with '/opt/homebrew/opt/postgresql@15/bin/initdb'
Then restart with `brew services restart postgresql@15`
Make sure PostgreSQL is accepting connections by running `pg_isready`
