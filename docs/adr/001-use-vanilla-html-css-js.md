# Use Vanilla HTML, CSS, and JavaScript

## Context and Problem Statement

WatchTower needs a frontend stack for building the prototype and eventually the production dashboard. The team needs to decide whether to use a modern frontend framework (React, Vue, Svelte, etc.) or standards-based HTML, CSS, and vanilla JavaScript. The choice affects complexity, learning curve, tooling requirements, and long-term maintainability for a course project.

## Considered Options

* Vanilla HTML, CSS, and JavaScript (no framework, no bundler)
* React with a build toolchain (Vite or Create React App)
* Vue.js with a build toolchain

## Decision Outcome

Chosen option: **Vanilla HTML, CSS, and JavaScript**, because the course explicitly prohibits JavaScript frameworks and requires standards-based web development. This also reduces tooling complexity and keeps the prototype accessible to all team members regardless of framework experience.

### Consequences

* Good, because no build step or bundler is required — files can be opened directly in a browser.
* Good, because all team members can contribute without framework-specific knowledge.
* Good, because the output is easy to deploy on GitHub Pages or Cloudflare Pages without configuration.
* Bad, because scaling to a large, component-heavy UI will require more manual DOM management.
* Bad, because state management must be handled manually without the reactive primitives frameworks provide.
