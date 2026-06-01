/**
 * @file filters.js
 * Basic prototype filtering utilities for WatchTower MVP.
 * Used for dashboard dropdowns, search, and timeline filtering.
 */

/* -------------------------------------------------------------------------- */
/* BASIC FILTERS                                                              */
/* -------------------------------------------------------------------------- */

/**
 * Filters session or telemetry events by event type.
 *
 * @param {Array<{ eventType?: string }>} events
 * @param {"error"|"survey"} eventType
 * @returns {Array}
 */
export function filterByEventType(events, eventType) {
  return events.filter((e) => e.eventType === eventType);
}

/**
 * Filters events by deployment ID.
 *
 * @param {Array<{ deployment?: { id: string } }>} events
 * @param {string} deploymentId
 * @returns {Array}
 */
export function filterByDeployment(events, deploymentId) {
  return events.filter(
    (e) => e.deployment?.id === deploymentId
  );
}

/**
 * Filters by severity level.
 *
 * @param {Array<{ metadata?: { severity: string }, severity?: string }>} events
 * @param {"critical"|"high"|"medium"|"low"|"signal"} severity
 * @returns {Array}
 */
export function filterBySeverity(events, severity) {
  return events.filter((e) => {
    const level = e.metadata?.severity ?? e.severity;
    return level === severity;
  });
}

/**
 * Filters issues by status.
 *
 * @param {Array<{ status?: string }>} issues
 * @param {"open"|"resolved"} status
 * @returns {Array}
 */
export function filterByStatus(issues, status) {
  return issues.filter((i) => i.status === status);
}

/**
 * Filters events by recent time window.
 *
 * @param {Array<{ timestamp: string }>} events
 * @param {number} minutes
 * @returns {Array}
 */
export function filterByRecency(events, minutes) {
  const cutoff = new Date(Date.now() - minutes * 60 * 1000);

  return events.filter(
    (e) => new Date(e.timestamp) >= cutoff
  );
}

/**
 * Filters events by ISO date range.
 *
 * @param {Array<{ timestamp: string }>} events
 * @param {string} from
 * @param {string} to
 * @returns {Array}
 */
export function filterByDateRange(events, from, to) {
  const start = new Date(from);
  const end = new Date(to);

  return events.filter((e) => {
    const ts = new Date(e.timestamp);
    return ts >= start && ts <= end;
  });
}

/* -------------------------------------------------------------------------- */
/* COMPOUND FILTER                                                            */
/* -------------------------------------------------------------------------- */

/**
 * Applies multiple optional filters to a dataset.
 * Used by dashboard UI (dropdowns, search, timeline controls).
 *
 * @param {Array} events
 * @param {Object} [criteria]
 * @param {string} [criteria.deploymentId]
 * @param {"critical"|"high"|"medium"|"low"|"signal"} [criteria.severity]
 * @param {"error"|"survey"} [criteria.eventType]
 * @param {"open"|"resolved"} [criteria.status]
 * @param {number} [criteria.recentMinutes]
 * @param {string} [criteria.from]
 * @param {string} [criteria.to]
 * @returns {Array}
 */
export function applyFilters(events, criteria = {}) {
  let result = [...events];

  if (criteria.deploymentId)
    result = filterByDeployment(result, criteria.deploymentId);

  if (criteria.severity)
    result = filterBySeverity(result, criteria.severity);

  if (criteria.eventType)
    result = filterByEventType(result, criteria.eventType);

  if (criteria.status)
    result = filterByStatus(result, criteria.status);

  if (criteria.recentMinutes)
    result = filterByRecency(result, criteria.recentMinutes);

  if (criteria.from || criteria.to)
    result = filterByDateRange(
      result,
      criteria.from,
      criteria.to
    );

  return result;
}