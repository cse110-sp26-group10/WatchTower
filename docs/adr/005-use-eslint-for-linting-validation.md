# Use ESLint for Linting and Validation

## Context and Problem Statement

The CI pipeline needs automated code quality checks to catch issues before they land in main. The team uses vanilla JavaScript, HTML, and CSS, so we need a tool that can cover at least JS linting. Adding a new dependency like this requires an ADR because it needs TA sign-off.

## Considered Options

* ESLint
* Biome

## Decision Outcome

Chosen option: "ESLint", because it has plugins for JSDoc validation and works alongside html-validate and Stylelint for HTML and CSS checks. The broader plugin ecosystem and existing documentation made it easier to configure for our specific setup than Biome, which is newer and has less coverage for JSDoc enforcement.

### Consequences

* Good, because ESLint handles JavaScript linting and JSDoc validation in one tool
* Good, because it integrates cleanly into GitHub Actions alongside html-validate and Stylelint
* Good, because the configuration is plain JS, so it's easy for everyone to read and adjust
* Bad, because it adds a dev dependency that needs TA approval
* Bad, because configuring plugins for JSDoc can be fiddly when the project mixes ES modules and CommonJS
