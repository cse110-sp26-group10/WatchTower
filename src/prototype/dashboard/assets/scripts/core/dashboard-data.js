import { dataStore } from './data-store.js';
import { deploymentScope } from './deployment-scope.js';
import { relativeTime } from './formatters.js';

/**
 * Return the currently selected deployment id.
 */
export function getCurrentDeploymentId() {
  if (!deploymentScope) return 'all';
  if (deploymentScope.id) return deploymentScope.id;
  if (deploymentScope.deployment?.id) return deploymentScope.deployment.id;
  return 'all';
}

/**
 * Return events filtered to the selected deployment scope.
 */
export function getScopedEvents(deploymentId = getCurrentDeploymentId()) {
  const events = dataStore.getEvents() || [];
  const scopedEvents = (!deploymentId || deploymentId === 'all')
    ? events
    : events.filter((event) => event.deployment?.id === deploymentId);

  return sortEventsByTimestamp(scopedEvents);
}

/**
 * Find one event by id.
 */
export function getEventById(eventId, deploymentId = getCurrentDeploymentId()) {
  if (!eventId) return null;
  return getScopedEvents(deploymentId).find((event) => event.id === eventId) || null;
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
    errors: events.filter((event) => event.event_type === 'error'),
    pageLoads: events.filter((event) => event.event_type === 'page_load'),
    clicks: events.filter((event) => event.event_type === 'click'),
    surveys: events.filter((event) => event.event_type === 'survey'),
  };
}

/**
 * Calculate the average page-load latency in milliseconds.
 */
export function calculateAverageLatency(pageLoads) {
  if (!pageLoads.length) return 0;
  const totalLatency = pageLoads.reduce((sum, event) => sum + (event.metadata?.load_time || 0), 0);
  return Math.round(totalLatency / pageLoads.length);
}

/**
 * Count events by pathname.
 */
export function groupEventsByPath(events) {
  return events.reduce((counts, event) => {
    const path = event.pathname || '-';
    counts[path] = (counts[path] || 0) + 1;
    return counts;
  }, {});
}

/**
 * Count error events by severity.
 */
export function getErrorSeverityCounts(errors) {
  return errors.reduce((counts, error) => {
    const severity = error.metadata?.severity?.toLowerCase();
    if (severity === 'warning') {
      counts.warnings += 1;
    } else {
      counts.critical += 1;
    }
    return counts;
  }, { total: errors.length, critical: 0, warnings: 0 });
}

/**
 * Build the data model used by the home dashboard.
 */
export function getHomeDashboardData(deploymentId = getCurrentDeploymentId()) {
  const events = getScopedEvents(deploymentId);
  const { errors, pageLoads, clicks, surveys } = splitEventsByType(events);
  const uptimeLog = dataStore.getUptimeLog();

  return {
    events,
    errors,
    pageLoads,
    clicks,
    surveys,
    uptime: buildUptimeSummary(uptimeLog),
    loadPaths: groupEventsByPath(pageLoads),
    clickPaths: groupEventsByPath(clicks),
    metrics: [
      { label: 'Errors', value: errors.length, state: 'danger' },
      { label: 'Avg Load Time', value: pageLoads.length ? `${calculateAverageLatency(pageLoads)}ms` : '-' },
      { label: 'Page Loads', value: pageLoads.length },
      { label: 'Clicks', value: clicks.length },
    ],
  };
}

/**
 * Build a compact uptime summary for the overview timeline card.
 */
function buildUptimeSummary(log) {
  const sorted = sortEventsByTimestamp(log).reverse();
  const latest = sorted[sorted.length - 1] || null;
  const checks = expandUptimeTimeline(sorted);
  const upCount = checks.filter((check) => check.is_up).length;
  const uptimePercent = checks.length ? Math.round((upCount / checks.length) * 100) : 0;
  const currentDeployment = deploymentScope?.deployment || dataStore.getDeployments()[0];

  return {
    name: currentDeployment?.name || 'Drape App',
    category: 'Production',
    url: 'drape.example.com',
    isHealthy: latest?.is_up !== false,
    latency: latest?.latency || 0,
    uptimePercent,
    checks,
    rangeStartLabel: (checks[0] && relativeTime(checks[0].timestamp)) || 'N/A',
    rangeEndLabel: (latest && relativeTime(latest.timestamp)) || 'N/A',
  };
}

function expandUptimeTimeline(log) {
  if (!log.length) return [];

  const pattern = log.flatMap((entry) => {
    const repeats = entry.is_up ? 1 : 1; // 5 : 2
    return Array.from({ length: repeats }, () => ({
      is_up: entry.is_up,
      latency: entry.latency,
      status: entry.status,
      timestamp: entry.timestamp,
    }));
  });

  while (pattern.length < 48) {
    pattern.unshift({
      ...pattern[pattern.length % log.length] // , is_up: pattern.length % 11 === 0 ? false : pattern[pattern.length % log.length].is_up,
    });
  }

  return pattern.slice(-48);
}

/**
 * Build the data model used by the errors dashboard.
 */
export function getErrorsDashboardData(deploymentId = getCurrentDeploymentId()) {
  const events = getScopedEvents(deploymentId);
  const { errors } = splitEventsByType(events);
  const severityCounts = getErrorSeverityCounts(errors);

  return {
    errors,
    metrics: [
      { label: 'Total Errors', value: severityCounts.total, state: 'danger' },
      { label: 'Critical Errors', value: severityCounts.critical, state: 'danger' },
      { label: 'Warnings', value: severityCounts.warnings, state: 'warning' },
    ],
  };
}

/**
 * Build the data model used by the feedback dashboard.
 */
export function getFeedbackDashboardData(deploymentId = getCurrentDeploymentId()) {
  const events = getScopedEvents(deploymentId);
  const { surveys } = splitEventsByType(events);
  const ratings = surveys
    .map((survey) => Number(survey.metadata?.rating || 0))
    .filter((rating) => rating > 0);
  const averageRating = ratings.length
    ? (ratings.reduce((sum, rating) => sum + rating, 0) / ratings.length).toFixed(1)
    : '-';

  return {
    surveys,
    metrics: [
      { label: 'Feedback Entries', value: surveys.length },
      { label: 'Avg Rating', value: averageRating === '-' ? '-' : `${averageRating}/5`, state: 'warning' },
      { label: 'Low Ratings', value: ratings.filter((rating) => rating <= 2).length, state: 'danger' },
      { label: 'High Ratings', value: ratings.filter((rating) => rating >= 4).length, state: 'success' },
    ],
  };
}

/**
 * Build the data model used by the activity dashboard.
 */
export function getActivityDashboardData(deploymentId = getCurrentDeploymentId()) {
  const events = getScopedEvents(deploymentId);
  const { pageLoads, clicks } = splitEventsByType(events);

  return {
    events,
    pageLoads,
    clicks,
    loadPaths: groupEventsByPath(pageLoads),
    clickPaths: groupEventsByPath(clicks),
    metrics: [
      { label: 'Total Activity', value: events.length },
      { label: 'Page Loads', value: pageLoads.length },
      { label: 'Clicks', value: clicks.length },
      { label: 'Avg Load Time', value: pageLoads.length ? `${calculateAverageLatency(pageLoads)}ms` : '-' },
    ],
  };
}
