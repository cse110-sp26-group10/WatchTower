# Use ESLint for Linting and Validation

## Context and Problem Statement

The CI pipeline consists of multiple filters to maintain code quality. To begin, a small and important stepping stone would be to add linting and validation capabilities. In this case, there are different options to consider using for linting and validation purposes. 

## Considered Options

* ESLint
* Biome

## Decision Outcome

Chosen option: **ESLint** because it would be able to handle JavaScript linting and HTML & CSS validation with more flexibility on the criteria for the respective linting and validation goals. 

### Consequences

* Good, because handles linting and validation all in one
* Good, because it integrates cleanly into GitHub Actions alongside html-validate and Stylelint
* Good, because the configuration is plain JS, so it's easy for everyone to read and adjust
* Bad, because it adds a dev dependency that needs TA approval
* Bad, because configuring plugins for JSDoc can be fiddly when the project mixes ES modules and CommonJS