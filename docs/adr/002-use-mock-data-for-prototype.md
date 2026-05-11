# Use Static Mock Data for Sprint 1 Prototype

## Context and Problem Statement

The Sprint 1 prototype needs data to demonstrate WatchTower's core concepts: errors, performance degradations, upset user signals, and deployment/build events. The team must decide whether to build real data infrastructure early or use static mock data to validate the design first. Adding a real backend or live data source in Sprint 1 would require significant setup before the team has validated whether the design direction is correct.

## Considered Options

* Static mock data defined in `data.js` (no backend required)
* Lightweight local server with a JSON file as a pseudo-database
* Real data source from the start (e.g., a live error listener or GitHub Actions webhook)

## Decision Outcome

Chosen option: **Static mock data defined in `data.js`**, because it lets the team validate the MVP design and UCD direction before committing to infrastructure decisions. The prototype's goal is to explore and demonstrate concepts, not to handle real production data.

### Consequences

* Good, because the prototype can be built and run without any server setup.
* Good, because mock data is easy to control, making it straightforward to demonstrate all four signal types reliably.
* Good, because design and layout decisions can be made independently of data pipeline complexity.
* Bad, because the prototype cannot demonstrate real-time or dynamic data behavior.
* Bad, because transitioning from mock data to a real data source will require a future refactor in Sprint 2 or later.
