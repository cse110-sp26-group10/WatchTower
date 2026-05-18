# Build Signals in Observability: Research for WatchTower

The main purpose for build signals is to summarizes how deployment and build signals help engineering teams identify when problems began, and proposes how WatchTower should integrate those signals without overcomplicating the system. The goal is to build just enough observability to know when something breaks and why, without overbuilding for problems the project doesn't have yet.

## 1. Why Build Signals Matter for Incident Investigation

WWhen an application or product breaks, a good engineer doesn’t just look at the error. They ask what changed right before it happened. Our project is built to help answer that question quickly and confidently.

### The Core Problem: Change Causes Most Outages

Most outages happen because something recently changed, whether it’s a new code deployment, a configuration update that changes how the application behaves, or an infrastructure change such as updating servers or cloud resources. 

Without a clear record of these changes, engineers are often left piecing together timelines from logs and memory, which is slow and unreliable. Build signals solve this by placing deployment history directly alongside your errors and metrics, making it easier to see what changed and exactly when it happened.

### The Site Reliability Engineer (SRE) Mental Model

When something goes wrong, the person responsible for keeping the app running will instinctively look at what changed in the minutes before the problem started. Incident responders naturally focus on the window just before an issue begins, searching for any recent changes that might have triggered it.

Tools such as Instana, New Relic, and Datadog help automate this process by collecting deployments, configuration updates, and scaling events around the time of an incident, then highlighting which changes most closely line up with when the issue started.

Without this automation, on-call engineers are left manually scrolling through deployment histories and trying to line up timelines under pressure, which is both slow and easy to get wrong.

## 2. What "Build Signals" Actually Means

Build signals are structured data emitted during the CI/CD pipeline that describe *what was deployed, when, and by whom*. They sit in the category of **change events** alongside configuration drifts and infrastructure scaling events.

### Minimum Useful Data Per Signal

| Field | Why It Matters |
|---|---|
| `timestamp` | Anchor point for correlating with error/performance timelines |
| `version` / `commit_sha` | Links the deployed artifact to a specific code state |
| `environment` | Distinguishes staging from production incidents |
| `author` / `triggered_by` | Identifies the person who made the change |
| `status` | `success`, `failure`, or `in_progress` — a failed deploy itself is an incident |
| `workflow_name` | Distinguishes deploy runs from test-only runs |

These six fields are the minimum needed to answer "which deployment started the fire." Every field beyond this should earn its place.

### How Signals Flow in Practice

In a GitHub Actions–based workflow, every CI run emits a `workflow_run` event that contains this metadata. A WatchTower-compatible implementation could receive these events via a webhook and store them alongside error events and performance samples. The webhook approach requires no additional dependencies — GitHub sends a POST request on each workflow completion, and the receiving endpoint logs it.

## 3. How Industry Tools Represent Build Signals

Understanding the patterns used by mature tools helps WatchTower adopt the right abstraction without copying their scale.

### Deployment Markers on Timelines

The dominant pattern across New Relic, Datadog, Dynatrace, and others is the **deployment marker**: a vertical line or annotated point plotted on the same time axis as error rate, latency, and throughput graphs. Engineers can click a marker to see the commit SHA, author, and linked PR, then immediately read whether performance changed before or after that point.

New Relic describes the value succinctly: change tracking connects deployments directly to performance data, eliminating time-consuming log searches. Cross-team visibility is a key benefit — if a fix in one service degrades a downstream service, the marker appears on both services' charts automatically.

### Event Enrichment, Not Separate Systems

A recurring architectural principle is that build signals should *enrich* existing incident context rather than live in a separate tool. When an alert fires, best practice is to automatically attach recent deployment info to the alert notification so the on-call engineer arrives with context, not just an error message.

### The Correlation Engine Approach (What WatchTower Should Avoid for Now)

Enterprise tools build ML-backed correlation engines that link traces, metrics, logs, and change events automatically. This is powerful but complex. For WatchTower's MVP, this is out of scope. The simpler alternative — displaying deployment events on the same timeline as errors — delivers 80% of the value with far less implementation risk.

## 4. Build Signals and DORA Metrics

Build signals are also the raw material for DORA (DevOps Research and Assessment) metrics, which measure delivery process health:

- **Deployment Frequency** — How often are builds reaching production?
- **Change Failure Rate** — What percentage of deployments cause an incident?
- **Mean Time to Recovery (MTTR)** — How quickly does the team resolve production failures?

WatchTower does not need to compute these at MVP, but storing clean build signal records now means the team can derive them later without retrofitting data collection. Capturing a `status` field (success/failure) and linking it to subsequent error spikes is the foundational step.

## 5. WatchTower Integration: Principles and Constraints

### Project Constraints Recap

WatchTower must:
- Run on Cloudflare or GitHub Pages (no server frameworks)
- Use vanilla JavaScript only (no frameworks)
- Maintain operational stability as its first priority
- Add features only with clear justification — more features equal more risk

These constraints shape every design choice below.

### What WatchTower Should Do (MVP)

**1. Expose a `/api/deploy` ingest endpoint**

A single POST endpoint that accepts a JSON payload containing the minimum build signal fields listed in Section 2. This endpoint is called by a GitHub Actions step at the end of a deploy workflow:

```yaml
# .github/workflows/deploy.yml (example step)
- name: Notify WatchTower
  run: |
    curl -X POST ${{ secrets.WATCHTOWER_URL }}/api/deploy \
      -H "Content-Type: application/json" \
      -d '{
        "version": "${{ github.sha }}",
        "environment": "production",
        "author": "${{ github.actor }}",
        "status": "success",
        "workflow": "${{ github.workflow }}",
        "timestamp": "${{ github.run_started_at }}"
      }'
```

No GitHub webhook configuration is needed. A direct `curl` step in the Actions workflow is simpler, more explicit, and easier to debug — especially important at the start of a project when the pipeline itself may be unstable.

**2. Display deployment events on the error/performance timeline**

WatchTower already captures error events and (eventually) performance samples. Build signals should appear on the same shared time axis, not on a separate page. A vertical marker styled distinctly from error markers is sufficient. On hover or click, it should display: version, author, environment, and status.

This answers the question "did this error rate spike start before or after the last deployment?" without requiring any correlation logic — a human can see it instantly.

**3. Store build signals the same way as other events**

WatchTower's existing event storage (whatever shape that takes — a simple append-only log, a KV store) should accept build signal records using the same schema conventions as error records. This avoids building a separate pipeline and reduces surface area for bugs.

**4. Surface build failure as an incident signal**

If a deploy returns `"status": "failure"`, WatchTower should surface that in the same view as errors. A failed deployment is often the first sign something went wrong. Teams that only watch application errors can miss a situation where the build itself is the problem.

### What WatchTower Should Not Do (MVP)

- **No automatic correlation.** Do not attempt to algorithmically link deployments to errors. Display both on a shared timeline and let the engineer draw conclusions.
- **No pipeline metrics dashboard.** Build duration, queue time, and test coverage are useful but belong in a later sprint. They don't answer the question WatchTower is here to answer: "what is my software doing right now?"
- **No GitHub webhook integration.** GitHub webhooks require a persistent listener, HMAC verification, and retries for missed events. The `curl` step approach is more reliable at this stage and keeps WatchTower's ingest surface minimal.
- **No DORA metric computation.** Store the raw data correctly now; compute aggregate metrics when there is enough history to make them meaningful.

---

## 6. Suggested Data Schema

```json
{
  "type": "deploy",
  "timestamp": "2026-05-18T14:32:00Z",
  "version": "a3f9c21",
  "environment": "production",
  "author": "jsmith",
  "status": "success",
  "workflow": "deploy-production",
  "url": "https://github.com/org/repo/actions/runs/12345"
}
```

The `type: "deploy"` field distinguishes these records from `type: "error"` and `type: "feedback"` records that WatchTower already collects, while keeping them in the same store. The optional `url` field lets a developer jump directly from the WatchTower UI to the GitHub Actions run log, closing the investigation loop quickly.

---

## 7. Stability Considerations

WatchTower is operational-facing software. Every integration decision must account for what happens when it fails.

- **The ingest endpoint must fail silently from the pipeline's perspective.** If WatchTower is down, a deploy should still succeed. The `curl` step in GitHub Actions should use `|| true` or equivalent to prevent a WatchTower outage from blocking releases.
- **Build signal ingest must not block UI rendering.** Signals should be loaded asynchronously; if the store returns slowly, the error timeline should render first.
- **Volume is low.** A student project deploys a handful of times per day. There is no scaling concern for this feature. Do not over-engineer the storage or ingest path.

## 8. Summary

Build signals are the bridge between code changes and production incidents. The most valuable thing they enable is a shared timeline where a developer can see "the error rate went up, and we deployed 8 minutes before that." Enterprise tools build elaborate correlation engines on top of this foundation, but the foundation itself is simple: record what was deployed, when, and whether it succeeded, then show it next to the other signals.

For WatchTower, the implementation is:

1. A single POST endpoint to receive deploy events from GitHub Actions.
2. A vertical marker on the existing error/performance timeline.
3. Shared record storage with the rest of WatchTower's event types.
4. Fail-safe integration so WatchTower downtime never blocks a deploy.

That is the full scope for MVP. Correlation logic, DORA dashboards, and webhook integrations are documented here as future directions but explicitly deferred until the core system is stable.
