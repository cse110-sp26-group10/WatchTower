# Observability Tool Research

The main purpose of observability tools is to enable software developers to understand the internal state of the software so they could detect, diagnose, and resolve issues to improve reliability, minimize downtime, and enhance the user experience. Observability tools can be categorized into traditional observability and user-centric observability tools. Traditional observability tools focus more on server logs, metrics, and distributed tracing, while user-centric observability tools focus more on user experience and product behavior to bridge the gap between frontend behavior and backend performance.

## Traditional Observability Tools

### Popular Tools

- **Sentry:** A tool that focuses on code-level health by monitoring the code, alerting when and where a function fails.
- **Datadog:** A powerful unified platform that excels at correlating data across the entire environment.
- **New Relic:** A pioneer in application performance monitoring that allows for great visibility on how the software performs.
- **LogRocket:** A session replay and product analytics tool that allows developers to understand user behavior before encountering an error.
- **Honeycomb:** A tool that allows developers to slice and dice through events by any attribute to locate unpredictable problems.

### Sentry

**Focus:** Error monitoring & performance tracing

- Automatic error capture with stack traces
- Groups duplicate errors by fingerprint to reduce noise
- Links errors to specific releases and deployments
- Distributed tracing with spans across services
- Alerting rules based on error thresholds
- Source maps for readable frontend stack traces

### Datadog

**Focus:** Infrastructure & full-stack observability

- Metrics, logs, and traces in one platform
- Host-level monitoring (CPU, memory, disk)
- APM with automatic service maps
- Log aggregation and search
- Dashboards and alerting
- Very broad integration surface (500+ integrations)

### New Relic

**Focus:** Application performance monitoring (APM)

- Agent-based instrumentation for app performance
- Transaction tracing and slow query detection
- Log management & infrastructure monitoring
- Dashboards and alerting
- AI-powered anomaly detection

### LogRocket

**Focus:** Frontend session replay & debugging

- Session replay tied to errors and network requests
- Console log and network request capture
- Redux/state inspection
- Error grouping with user context
- Funnel and conversion analysis

### Features

- **Error Tracking and Crash Reporting:** Captures unhandled exceptions and crashes with detailed stack traces, environment details, and user context to help developers fix bugs.
- **Application Performance Monitoring (APM):** Provides visibility into request latency, throughput, and error rates at the code level.
- **Infrastructure Monitoring:** Tracks the health of the underlying hardware or cloud resources (e.g. CPU usage, memory, network throughput).
- **Log Management:** Aggregates and indexes text-based logs from various sources, allowing teams to search and filter events leading up to an issue.
- **Session Replay:** Reproduces user behavior in the browser (e.g. clicks, scrolls, text inputs) to visually debug frontend issues.
- **Real User Monitoring (RUM):** Captures metrics directly within the browser (e.g. page load times).
- **High-Cardinality Analysis:** Extracts data by specific attributes (e.g. user IDs, request IDs) without pre-aggregating the data.

### Tool Comparison

| Feature | Sentry | Datadog | New Relic | LogRocket | Honeycomb |
| ------- | ------ | ------- | --------- | --------- | --------- |
| Error Tracking and Crash Reporting | Yes | Yes | Yes | Yes | Yes |
| Application Performance Monitoring (APM) | Yes | Yes | Yes | Yes | Yes |
| Infrastructure Monitoring | No | Yes | Yes | No | Yes |
| Log Management | Yes | Yes | Yes | Yes | Yes |
| Session Replay | Yes | Yes | No | Yes | No |
| Real User Monitoring (RUM) | Yes | Yes | Yes | Yes | No |
| High-Cardinality Analysis | No | Yes | Yes | No | Yes |

## User-Centric Observability Tools

### Popular Tools

- **PostHog:** An all-in-one tool that combines product analytics with feature flags, session recording, and A/B testing in one package and has the option to be self-hosted.
- **Amplitude:** A powerful tool aimed towards behavioral analysis, excelling at complex product data combined with AI-powered analytics.
- **Mixpanel:** A user-friendly tool focused heavily on event-driven behavioral analytics that can track metrics like user retention, funnels, and cohorts.
- **Heap:** A tool known for its autocapture feature which tracks every user interaction without manual setup, allowing for retrospective analysis without the need to code every event.
- **Fullstory:** A leading tool in digital experience with powerful session replays and AI-driven identification of user friction.
- **Microsoft Clarity:** A free tool for understanding user behavior that provides session recording and heatmaps.

### Features

- **Event Capture:** Tracks events like user interactions (e.g. clicks, taps, scrolls), network requests, and console errors.
- **Session Recordings/Replays:** Lets you see how users interact with the software through the playback of live user sessions.
- **Heat Maps:** Creates color-coded overlays that show areas of high and low activity in the software.
- **Surveys:** Allows you to get feedback from users.
- **Feature Flags:** Allows you to toggle features on/off for part of the user base without needing to redeploy code.
- **User Journey Visualization:** Allows you to follow along the paths users take as they navigate through the software.

### Tool Comparison

| Feature | PostHog | Amplitude | Mixpanel | Heap | Fullstory | Microsoft Clarity |
| ------- | ------- | --------- | -------- | ---- | --------- | ----------------- |
| Event Capture | Yes - 1,000,000 free events | Yes | Yes | Yes Yes - Automatic tracking; historical data limited to 6 months (free) or 1 year (paid) | Yes | Yes - Free |
| Session Recordings/Replays | Yes - 5,000 free recordings | No | No | Yes - Requires add-ons | Yes | Yes - Free |
| Heat Maps | Yes | Yes | No | Yes - Requires add-ons | Yes | Yes - Free |
| Surveys | Yes | Yes | Yes - Integrates with third-party tools like Survicate | Yes - Integrates with third-party tools like Chameleon | Yes | No |
| Feature Flags | Yes | Yes | No | No | No | No |
| User Journey Visualization | Yes | Yes | Yes | Yes | No | No |

## Summary

### Realistic Features to Include

- **Error Tracking and Crash Reporting:** The most important feature of an observability tool, allowing developers to understand where problems occur within the software.
- **Application Performance Monitoring:** Metrics like latency, throughput, and error rates are all critical to the user experience.
- **Log Management:** Keeping a structured log is essential for extracting useful insight that can be displayed on the dashboard.
- **Real User Monitoring / Event Capture:** Tracking events in the browser can provide insight into which specific part of the software is not working. This serves as an implementation of error tracking and application performance monitoring.
- **Surveys:** It is an important aspect of software development to get feedback from users to improve the software.

### Features That Are Too Complex

- **Infrastructure Monitoring:** Requires additional server script to be injected into the target software to monitor those metrics.
- **Session Replay:** Requires collecting additional data on user actions and additional complexity for the dashboard to support session playback.
- **High-Cardinality Analysis:** Requires additional preprocessing and aggregation to reduce high-cardinality identifiers into lower-cardinality buckets.
- **Heat Maps:** Requires a great amount of mouse events to be logged and additional complexity for the dashboard to display the heat map.
- **Feature Flags:** Requires too much additional complexity.
- **User Journey Visualization:** Requires processing multiple events to form a chain of user navigation within the browser.

## WatchTower MVP Scope

### Core Philosophy

The main purpose of WatchTower is to enable small, early-stage teams to detect and respond to problems fast. Observability must act as an enabler of velocity — not a tax on engineering time. For teams of 4–6 developers, the system must be high signal, low noise.

**The Four Golden Signals** — WatchTower focuses exclusively on Latency, Traffic, Errors, and Saturation. If an anomaly does not impact one of these four pillars, it should not trigger a page.

**The Dashboard Graveyard** — A common anti-pattern is building complex dashboards that track everything, leading to a situation where nobody knows what to look at during an incident. WatchTower avoids this by focusing only on actionable metrics.

**Alert Fatigue** — Constant pages for non-critical issues lead to burnout. Alerts must be reserved strictly for situations requiring human intervention — user-facing 500 errors, broken checkout flows.

**The Observability Tax** — High-cardinality indexing and storing 100% of network traces is financially unviable for an early-stage startup. WatchTower relies on intelligent sampling and short data retention windows.

### Jobs to Be Done

Observability tools in startups aren't just monitors — they are hired to complete specific developer jobs:

- "Alert me when there is a problem." — System Health, Threshold Alerts, Error Rate
- "Explain why the problem happened." — Error Stack Traces, Grouped by Fingerprint
- "Show me the blast radius." — User Feedback, Affected Session Count
- "Tell me what changed." — Deployment Tags, Git Commit Correlation

Deployment correlation is WatchTower's core differentiator. In a startup shipping code multiple times a day, the vast majority of incidents are caused by recent deployments. WatchTower must immediately answer: "Did the code we pushed 10 minutes ago cause this?"

### What is Realistic for WatchTower

- **Automatic error capture** — catch unhandled exceptions server-side without manual logging
- **Error grouping by fingerprint** — bucket errors by type and message so duplicates don't flood the view; a simple hash is enough, no ML needed
- **Deployment tagging** — attach a build ID or git commit to errors so you can see which deploy introduced a problem
- **Basic performance signals** — track response times and flag degradations, no need for full distributed tracing
- **User feedback collection** — simple rating widget or form that ties a signal to a session or page
- **Threshold-based alerting** — notify when error rate spikes or response time crosses a limit
- **A simple dashboard** — show recent errors, error counts over time, and performance trends in one view

### What to Avoid

- **Session replay** — high data volume, privacy concerns, and significant frontend instrumentation overhead
- **Distributed tracing with full span propagation** — useful at scale, but requires injecting trace headers across every service boundary; too much surface area early on
- **ML-based anomaly detection** — hard to debug, and requires enough historical data to be useful
- **Heatmaps and funnel analysis** — product analytics, not operational monitoring
- **Infrastructure-level monitoring** — host metrics, container stats, and cloud billing dashboards are a different problem; keep WatchTower focused on the app layer
- **Feature flags and A/B testing** — product tooling that belongs in a different system
