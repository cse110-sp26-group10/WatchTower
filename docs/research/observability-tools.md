# Observability Tool Research

The main purpose of observability tools is to enable software developers to understand the internal state of the software so they could detect, diagnose, and resolve issues to improve reliability, minimize downtime, and enhance the user experience. Observability tools can be categorized into traditional observability and user-centric observability tools. Traditional observability tools focuses more on server logs, metrics, and distributed tracing, while user-centric observability tools focuses more on user experience and product behavior to bridge the gap between frontend behavior and backend performance.

## Traditional Observability Tools

### Popular Tools Overview

- Sentry: A tool that focuses on code-level health by monitoring the code, alerting when and where a function fails.
- Datadog: A powerful unified platform that excels that correlating data across the entire environment.
- New Relic: A pioneer in application performance monitoring that allows for great visibility on how the software performs.
- LogRocket: A session replay and product analytics tool that allows developers to understand user behavior before encountering an error.
- Honeycomb: A tool that allows developers to slice and dice through events by any attribute to locate unpredictable problems.

### Sentry
**Focus:** Error monitoring & performance tracing

- Automatic error capture with stack traces
- Groups duplicate errors by fingerprint to reduce noise
- Links errors to specific releases and deployments
- Distributed tracing with spans across services
- Alerting rules based on error thresholds
- Source maps for readable frontend stack traces

### PostHog
**Focus:** Product analytics & user behavior

- Event tracking (clicks, page views, custom actions)
- Funnels, retention charts, user paths
- Session replay (watch what users did before an error)
- Feature flags and A/B testing
- Heatmaps
- Self-hostable

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

- Error Tracking and Crash Reporting: Captures unhandled exceptions and crashes with detailed stack traces, environment details, and user context to help developers fix bugs.
- Application Performance Monitoring (APM): Provides visibility into request latency, throughput, and error rates at the code level.
- Infrastructure Monitoring: Tracks the health of the underlying hardware or cloud resources (e.g. CPU usage, memory, network throughput).
- Log Management: Aggregates and indexes text-based logs from various sources, allowing teams to search and filter events leading up to an issue.
- Session Replay: Reproduces user behavior in the browser (e.g. clicks, scrolls, text inputs) to visually debug frontend issues.
- Real User Monitoring (RUM): Captures metrics directly within the browser (e.g. page load times).
- High-Cardinality Analysis: Extracts data by specific attributes (e.g. user IDs, request IDs) without pre-aggregating the data.

### Tool Comparison

| Feature | Sentry | Datadog | New Relic | Log Rocket | Honeycomb |
| ------- | ------ | ------- | --------- | ---------- | --------- |
| Error Tracking and Crash Reporting | ✅ | ✅ | ✅ | ✅ | ✅ |
| Application Performance Monitoring (APM) | ✅ | ✅ | ✅ | ✅ | ✅ |
| Infrastructure Monitoring | ❌ | ✅ | ✅ | ❌ | ✅ |
| Log Management | ✅ | ✅ | ✅ | ✅ | ✅ |
| Session Replay | ✅ | ✅ | ❌ | ✅ | ❌ |
| Real User Monitoring (RUM) | ✅ | ✅ | ✅ | ✅ | ❌ |
| High-Cardinality Analysis | ❌ | ✅ | ✅ | ❌ | ✅ |

## User-Centric Observability Tools

### Popular Tools

- PostHog: An all-in-one tool that combines product analytics with feature flags, session recording, and A/B testing in one package and has the option to be self-hosted.
- Amplitude: A powerful tool aimed towards behavioral analysis, excelling at complex product data combined with AI-powered analytics.
- Mixpanel: A user-friendly tool focused heavily on event-driven behavioral analytics that can track metrics like user retention, funnels, and cohorts.
- Heap: A tool known for its autocapture feature which tracks every user interaction without manual setup, allowing for retrospective analysis without the need to code every event.
- Fullstory: A leading tool in digital experience with powerful session replays and AI-driven identification of user friction.
- Microsoft Clarity: A free tool for understanding user behavior that provides session recording and heatmaps.

### Features

- Event Capture: Tracks events like user interactions (e.g. clicks, taps, scrolls), network requests, and console errors.
- Session Recordings/Replays: Lets you see how users interact with the software through the playback of live user sessions.
- Heat Maps: Creates color-coded overlays that shows areas of high and low activity in the software.
- Surveys: Allows you to get feedback from users.
- Feature Flags: Allows you to toggle features on/off for part of the user base without needing to redeploy code.
- User Journey Visualization: Allows you to follow along the paths users take as they navigate through the software.

### Tool Comparison

| Feature | PostHog | Amplitude | Mixpanel | Heap | Fullstory | Microsoft Clarity |
| ------- | ------- | --------- | -------- | ---- | --------- | ----------------- |
| Event Capture | ✅ <br><br> ✨ 1,000,000 free events | ✅ | ✅ | ✅ <br><br> ✨ Automatic – tracks everything without manual setup <br><br> ⚠️ Historical data only goes back 6 months (free) or 1 year (paid) | ✅ | ✅ <br><br> ✨ Free |
| Session Recordings/Replays | ✅ <br><br> ✨ 5,000 free recordings | ❌ | ❌ | ✅ <br><br> ⚠️ Requires add-ons | ✅ | ✅ <br><br> ✨ Free |
| Heat Maps | ✅ | ✅ | ❌ | ✅ <br><br> ⚠️ Requires add-ons | ✅ | ✅ <br><br> ✨ Free |
| Surveys | ✅ | ✅ | ✅ <br><br> ⚠️ Integrates with third-party tools like Survicate | ✅ <br><br> ⚠️ Integrates with third-party tools like Chameleon | ✅ | ❌ |
| Feature Flags | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ |
| User Journey Visualization | ✅ | ✅ | ✅ | ✅ | ❌ | ❌ |

## Summary

### Realistic Features To Include

- Error Tracking and Crash Reporting: The most important feature of an observability tool, allowing developers to understand where problems occur within the software.
- Application Performance Monitoring: Metrics like latency, throughput, and error rates are all critical to the user experience.
- Log Management: Keeping a structured log is essential for extracting useful insight that can be displayed on the dashboard.
- Real User Monitoring / Event Capture: Tracking events in the browser can provide insight into which specific part of the software is not working. This serves as an implementation of error tracking and application performance monitoring.
- Surveys: It is an important aspect of software development to get feedback from users to improve the software.

### Features That Are Too Complex

- Infrastructure Monitoring: Requires additional server script to be injected into the target software to monitor those metrics.
- Session Replay: Requires collecting additional data on user actions and additional complexity for the dashboard to support session playback.
- High-Cardinality Analysis: Requires additional preprocessing and aggregation to reduce high-cardinality identifiers into lower-cardinality buckets.
- Heat Maps: Requires a great amount of mouse events to be logged and additional complexity for the dashboard to display the heat map.
- Feature Flags: Requires too much additional complexity.
- User Journey Visualization: Requires processing multiple events to form a chain of user navigation within the browser.
