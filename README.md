# WatchTower 

A centralized observability system for tracking errors, performance degradation,
and upset user signals. Built for CSE 110 Spring 2026 at UC San Diego.
Please refer to the [Wiki](https://github.com/cse110-sp26-group10/WatchTower/wiki) for all relevant information, including onboarding, structure, and how to run it locally.

## Team Status Video Link
https://youtu.be/1RdMwzMQqv8

## Figma Link
https://tinyurl.com/4hcp36yr

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
**Link**: https://cse110-sp26-group10.github.io/WatchTower/src/app/dashboard/

## Repository Structure

```
WatchTower/
├── .github/
│   └── workflows/               # GitHub Actions CI workflow
├── admin/
│   ├── feedback/                # Team feedback and retrospectives
│   └── sprints/                 # Sprint planning and status documents
├── archive/                     # Archived prototypes and legacy code
├── docs/
│   ├── adr/                     # Architecture Decision Records
│   ├── design/                  # Design plans and artifacts
│       └──  lo-fi wireframes    # Lo-Fi Wireframes from Figma
│       └──  high-fi wireframes  # High-Fi Wireframes from Figma
│       └──  study guide         # Study Guide From Figma
│   ├── process/                 # Development process documentation
│   ├── questions/               # Questions and notes for stakeholders
│   ├── research/                # Research and competitive analysis
│       └──  research infographics # Research infographics from Figma 
│   ├── specs/                   # MVP, technical specifications, changelog
│   ├── superpowers/             # Team superpower planning documents
│   ├── testing/                 # Testing plans and strategy
│   ├── ucd/                     # User-centered design artifacts
│       └──  user persona infographics # User persona infographics from Figma 
│   ├── user/                    # User documentation
│   └── pr-template.md           # Pull request template
├── src/
│   ├── js/                      # Shared application scripts
│   ├── prototype/               # Main WatchTower prototype
│   │   ├── dashboard/           # Dashboard frontend
│   │   ├── server/              # Backend API and notification services
│   │   └── tracker/             # Client-side monitoring script
│   └── test-app/               # Sample application used for testing
├── supabase/
│   ├── migrations/             # Database schema migrations
│   └── seed.sql                # Seed data
├── tests/
│   ├── e2e/                    # Playwright end-to-end tests
│   └── unit/                   # Vitest unit tests
├── .gitignore
├── .htmlvalidate.json          # HTML validation configuration
├── .stylelintrc.json           # Stylelint configuration
├── eslint.config.js            # ESLint configuration
├── package.json                # Project dependencies and scripts
├── package-lock.json
├── playwright.config.js        # Playwright configuration
├── vitest.config.js            # Vitest configuration
└── README.md                   # Project overview and setup guide
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
