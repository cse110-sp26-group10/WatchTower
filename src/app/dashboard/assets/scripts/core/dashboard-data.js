import { dataStore } from "./data-store.js";
import { projectScope } from "./project-scope.js";
import { deploymentScope } from "./deployment-scope.js";
import { relativeTime } from "./formatters.js";

/**
 * Return the currently selected project id.
 */
export function getCurrentProjectId() {
  if (!projectScope) return "all";
  if (projectScope.id) return projectScope.id;
  if (projectScope.project?.id) return projectScope.project.id;
  return "all";
}

/**
 * Return the currently selected deployment id.
 */
export function getCurrentDeploymentId() {
  if (!deploymentScope) return "all";
  if (deploymentScope.id) return deploymentScope.id;
  if (deploymentScope.deployment?.id) return deploymentScope.deployment.id;
  return "all";
}

/**
 * Return events filtered to the selected deployment scope.
 */
export function getScopedEvents(
  deploymentId = getCurrentDeploymentId(),
  projectId = getCurrentProjectId(),
) {
  const events = dataStore.getEvents() || [];
  const projectScopedEvents =
    !projectId || projectId === "all"
      ? events
      : events.filter((event) => event.project_id === projectId);
  const scopedEvents =
    !deploymentId || deploymentId === "all"
      ? projectScopedEvents
      : projectScopedEvents.filter(
          (event) => event.deployment?.id === deploymentId,
        );

  return sortEventsByTimestamp(scopedEvents);
}

/**
 * Find one event by id.
 */
export function getEventById(
  eventId,
  deploymentId = getCurrentDeploymentId(),
  projectId = getCurrentProjectId(),
) {
  if (!eventId) return null;
  return (
    getScopedEvents(deploymentId, projectId).find(
      (event) => event.id === eventId,
    ) || null
  );
}

/**
 * Sort newest events first without mutating the source array.
 */
export function sortEventsByTimestamp(events) {
  return [...events].sort((a, b) => getEventTime(b) - getEventTime(a));
}

function getEventTime(event) {
  return new Date(event.timestamp || event.created_at || 0).getTime();
}

/**
 * Split dashboard events into the event groups used by pages.
 */
export function splitEventsByType(events) {
  return {
    errors: events.filter((event) => event.event_type === "error"),
    pageLoads: events.filter((event) => event.event_type === "page_load"),
    clicks: events.filter((event) => event.event_type === "click"),
    surveys: events.filter((event) => event.event_type === "survey"),
  };
}

/**
 * Calculate the average page-load latency in milliseconds.
 */
export function calculateAverageLatency(pageLoads) {
  if (!pageLoads.length) return 0;
  const totalLatency = pageLoads.reduce(
    (sum, event) => sum + (event.metadata?.load_time || 0),
    0,
  );
  return Math.round(totalLatency / pageLoads.length);
}

// Avg-load-time color thresholds (ms). load_time is full page navigation time:
// under ~1s feels snappy, over ~3s is where users start to bail. Tune here.
const LOAD_TIME_GOOD_MS = 1000;
const LOAD_TIME_BAD_MS = 3000;

/**
 * Map an average load time (ms) to a card state: green below the good
 * threshold, red above the bad threshold, yellow in between.
 */
export function loadTimeState(ms) {
  if (ms < LOAD_TIME_GOOD_MS) return "success";
  if (ms > LOAD_TIME_BAD_MS) return "danger";
  return "warning";
}

/**
 * Count events by pathname.
 */
export function groupEventsByPath(events) {
  return events.reduce((counts, event) => {
    const path = event.pathname || "-";
    counts[path] = (counts[path] || 0) + 1;
    return counts;
  }, {});
}

const ACTIVITY_BUCKET_COUNT = 12;
const ONE_DAY_MS = 86400000;

/**
 * Format a bucket's start time. Uses a date label for ranges spanning more
 * than a couple of days, otherwise a clock time.
 */
function formatBucketLabel(time, spanMs) {
  const date = new Date(time);
  if (spanMs > 2 * ONE_DAY_MS) {
    return date.toLocaleDateString([], { month: "short", day: "numeric" });
  }
  return date.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
}

/**
 * Split the events' time range into evenly sized buckets and summarize each.
 * Returns an array (oldest first) of { label, count, avgLoadTime }, where
 * avgLoadTime is null for buckets without page loads. Empty array when there
 * are no timestamped events.
 */
export function bucketActivityOverTime(
  events,
  pageLoads,
  bucketCount = ACTIVITY_BUCKET_COUNT,
) {
  const times = events.map(getEventTime).filter((time) => time > 0);
  if (!times.length) return [];

  const min = Math.min(...times);
  const max = Math.max(...times);
  const span = max - min;
  const size = span > 0 ? span / bucketCount : 1;

  const buckets = Array.from({ length: bucketCount }, (_, i) => ({
    start: min + i * size,
    count: 0,
    loadSum: 0,
    loadCount: 0,
  }));

  const indexFor = (time) =>
    span > 0 ? Math.min(bucketCount - 1, Math.floor((time - min) / size)) : 0;

  for (const event of events) {
    const time = getEventTime(event);
    if (time > 0) buckets[indexFor(time)].count += 1;
  }
  for (const load of pageLoads) {
    const time = getEventTime(load);
    const loadTime = load.metadata?.load_time;
    if (time > 0 && typeof loadTime === "number") {
      const bucket = buckets[indexFor(time)];
      bucket.loadSum += loadTime;
      bucket.loadCount += 1;
    }
  }

  return buckets.map((bucket) => ({
    label: formatBucketLabel(bucket.start, span),
    count: bucket.count,
    avgLoadTime: bucket.loadCount
      ? Math.round(bucket.loadSum / bucket.loadCount)
      : null,
  }));
}

/**
 * Count error events by severity.
 */
export function getErrorSeverityCounts(errors) {
  return errors.reduce(
    (counts, error) => {
      const severity = error.metadata?.severity?.toLowerCase();
      if (severity === "warning") {
        counts.warnings += 1;
      } else {
        counts.critical += 1;
      }
      return counts;
    },
    { total: errors.length, critical: 0, warnings: 0 },
  );
}

/**
 * Build the data model used by the home dashboard.
 *
 * Now exposes:
 *   - rawUptimeLog  → the unprocessed uptime_log rows for the uptime-card filter dropdowns
 *   - projects      → [{ id, name, website_url }] for the project filter dropdown labels
 *   - uptime        → legacy pre-processed summary (kept for backward compat)
 */
export function getHomeDashboardData(
  deploymentId = getCurrentDeploymentId(),
  projectId = getCurrentProjectId(),
) {
  const events = getScopedEvents(deploymentId, projectId);
  const { errors, pageLoads, clicks, surveys } = splitEventsByType(events);
  const uptimeLog = dataStore.getUptimeLog() || [];

  // Projects: dataStore.getProjects() should return [{ id, name, website_url }, ...]
  // Falls back gracefully to [] if the method doesn't exist yet.
  const projects = dataStore.getProjects?.() || [];

  return {
    events,
    errors,
    pageLoads,
    clicks,
    surveys,

    // Raw log + projects list — consumed by uptime-card's filter dropdowns
    rawUptimeLog: uptimeLog,
    projects,

    // Legacy pre-processed summary — kept so any code still reading .uptime keeps working
    uptime: buildUptimeSummary(uptimeLog),

    loadPaths: groupEventsByPath(pageLoads),
    clickPaths: groupEventsByPath(clicks),
    metrics: [
      {
        label: "Errors",
        value: errors.length,
        state: errors.length ? "danger" : "success",
      },
      {
        label: "Avg Load Time",
        value: pageLoads.length
          ? `${calculateAverageLatency(pageLoads)}ms`
          : "-",
        state: pageLoads.length
          ? loadTimeState(calculateAverageLatency(pageLoads))
          : undefined,
        fill: true,
      },
      { label: "Page Loads", value: pageLoads.length },
      { label: "Clicks", value: clicks.length },
    ],
  };
}

/**
 * Build a compact uptime summary for the overview timeline card.
 * Kept for backward compatibility — uptime-card now prefers rawUptimeLog.
 */
function buildUptimeSummary(log) {
  const sorted = sortEventsByTimestamp(log).reverse();
  const latest = sorted[sorted.length - 1] || null;
  const checks = expandUptimeTimeline(sorted);
  const upCount = checks.filter((check) => check.is_up).length;
  const uptimePercent = checks.length
    ? Math.round((upCount / checks.length) * 100)
    : 0;
  const currentProject = projectScope?.project;

  return {
    name: currentProject?.name || "N/A",
    category: "Production",
    url: "drape.example.com",
    isHealthy: latest?.is_up !== false,
    latency: latest?.latency || 0,
    uptimePercent,
    checks,
    rangeStartLabel: (checks[0] && relativeTime(checks[0].timestamp)) || "N/A",
    rangeEndLabel: (latest && relativeTime(latest.timestamp)) || "N/A",
  };
}

function expandUptimeTimeline(log) {
  if (!log.length) return [];

  const pattern = log.flatMap((entry) => {
    const repeats = entry.is_up ? 1 : 1;
    return Array.from({ length: repeats }, () => ({
      is_up: entry.is_up,
      latency: entry.latency,
      status: entry.status,
      timestamp: entry.timestamp,
    }));
  });

  while (pattern.length < 48) {
    pattern.unshift({
      ...pattern[pattern.length % log.length],
    });
  }

  return pattern.slice(-48);
}

/**
 * Build the data model used by the errors dashboard.
 */
export function getErrorsDashboardData(
  deploymentId = getCurrentDeploymentId(),
  projectId = getCurrentProjectId(),
) {
  const events = getScopedEvents(deploymentId, projectId);
  const { errors } = splitEventsByType(events);
  const severityCounts = getErrorSeverityCounts(errors);

  return {
    errors,
    metrics: [
      {
        label: "Total Errors",
        value: severityCounts.total,
        state: severityCounts.total ? "danger" : "success",
      },
      {
        label: "Critical Errors",
        value: severityCounts.critical,
        state: severityCounts.critical ? "danger" : "success",
      },
      { label: "Warnings", value: severityCounts.warnings, state: "warning" },
    ],
  };
}

/**
 * Build the data model used by the feedback dashboard.
 */
export function getFeedbackDashboardData(
  deploymentId = getCurrentDeploymentId(),
  projectId = getCurrentProjectId(),
) {
  const events = getScopedEvents(deploymentId, projectId);
  const { surveys } = splitEventsByType(events);
  const ratings = surveys
    .map((survey) => Number(survey.metadata?.rating || 0))
    .filter((rating) => rating > 0);
  const averageRating = ratings.length
    ? (
        ratings.reduce((sum, rating) => sum + rating, 0) / ratings.length
      ).toFixed(1)
    : "-";

  const lowRatings = ratings.filter((rating) => rating <= 2).length;
  const highRatings = ratings.filter((rating) => rating >= 4).length;

  return {
    surveys,
    metrics: [
      { label: "Feedback Entries", value: surveys.length },
      {
        label: "Avg Rating",
        value: averageRating === "-" ? "-" : `${averageRating}/5`,
        state: averageRating === "-" ? undefined : "warning",
      },
      {
        label: "Low Ratings",
        value: lowRatings,
        state: lowRatings ? "danger" : undefined,
      },
      {
        label: "High Ratings",
        value: highRatings,
        state: highRatings ? "success" : undefined,
      },
    ],
  };
}

/**
 * Build the data model used by the activity dashboard.
 */
export function getActivityDashboardData(
  deploymentId = getCurrentDeploymentId(),
  projectId = getCurrentProjectId(),
) {
  const events = getScopedEvents(deploymentId, projectId);
  const { pageLoads, clicks } = splitEventsByType(events);
  const timeline = bucketActivityOverTime(events, pageLoads);

  return {
    events,
    pageLoads,
    clicks,
    loadPaths: groupEventsByPath(pageLoads),
    clickPaths: groupEventsByPath(clicks),
    activityOverTime: timeline.map((bucket) => ({
      label: bucket.label,
      value: bucket.count,
    })),
    loadTimeTrend: timeline.map((bucket) => ({
      label: bucket.label,
      value: bucket.avgLoadTime,
    })),
    metrics: [
      { label: "Total Activity", value: events.length },
      { label: "Page Loads", value: pageLoads.length },
      { label: "Clicks", value: clicks.length },
      {
        label: "Avg Load Time",
        value: pageLoads.length
          ? `${calculateAverageLatency(pageLoads)}ms`
          : "-",
        state: pageLoads.length
          ? loadTimeState(calculateAverageLatency(pageLoads))
          : undefined,
        fill: true,
      },
    ],
  };
}
