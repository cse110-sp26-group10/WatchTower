/**
 * Format an ISO timestamp as a short relative string like "3m ago".
 * @param {string} iso
 */
export function relativeTime(iso) {
  const diffSec = Math.max(0, Math.round((Date.now() - new Date(iso).getTime()) / 1000));
  if (diffSec < 60) return `${diffSec}s ago`;
  const min = Math.round(diffSec / 60);
  if (min < 60) return `${min}m ago`;
  const hr = Math.round(min / 60);
  return `${hr}h ago`;
}

/**
 * Derive an overall system status from the event list.
 * @param {Array<Object>} events
 * @returns {{label: string, level: 'ok'|'degraded'|'down'}}
 */
export function deriveStatus(events) {
  const criticalErrors = events.filter(
    (e) => e.event_type === 'error' && e.metadata.severity === 'critical'
  );
  const warnings = events.filter(
    (e) => e.event_type === 'error' && e.metadata.severity === 'warning'
  );

  if (criticalErrors.length >= 2) return { label: 'Service Disruption', level: 'down' };
  if (criticalErrors.length >= 1 || warnings.length >= 2) {
    return { label: 'Degraded Performance', level: 'degraded' };
  }
  return { label: 'System Operational', level: 'ok' };
}

/**
 * Average rating across survey events, on a 1-5 scale.
 * @param {Array<Object>} events
 * @returns {number}
 */
export function averageRating(events) {
  const surveys = events.filter((e) => e.event_type === 'survey' && e.metadata.rating != null);
  if (surveys.length === 0) return 0;
  const total = surveys.reduce((sum, e) => sum + Number(e.metadata.rating || 0), 0);
  return Math.round((total / surveys.length) * 10) / 10;
}

/**
 * Average page-load time in ms across page_load events, or null if none.
 * @param {Array<Object>} events
 * @returns {number|null}
 */
export function averageLoadTime(events) {
  const samples = events
    .filter((e) => e.event_type === 'page_load')
    .map((e) => Number(e.metadata && e.metadata.load_time))
    .filter((n) => Number.isFinite(n));
  if (samples.length === 0) return null;
  return Math.round(samples.reduce((s, n) => s + n, 0) / samples.length);
}

/**
 * Produce a one-line summary for a single event, depending on its type.
 * @param {Object} e
 * @returns {string}
 */
export function summarizeEvent(e) {
  switch (e.event_type) {
    case 'error':
      return `[${e.metadata.severity}] ${e.metadata.message} (${e.pathname})`;
    case 'page_load': {
      const t = Number(e.metadata && e.metadata.load_time);
      return Number.isFinite(t) ? `${e.pathname} loaded in ${t} ms` : `${e.pathname} loaded`;
    }
    case 'survey':
      return `Rating ${e.metadata.rating}/5${e.metadata.comment ? ` — ${e.metadata.comment}` : ''}`;
    case 'click':
      return `click on ${e.pathname}`;
    default:
      return e.event_type;
  }
}

/**
 * Escape user-supplied text before inserting into innerHTML.
 * @param {*} value
 * @returns {string}
 */
export function escapeHtml(value) {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

/**
 * Populate the deployment filter <select> from the known deployments.
 */
export function populateDeploymentFilter(onChange) {
  const select = document.getElementById('deployment-filter');
  const deployments = window.WatchTowerData.getDeployments();
  for (const d of deployments) {
    const opt = document.createElement('option');
    opt.value = d.id;
    opt.textContent = `${d.version} — ${d.id} (${d.commit_hash})`;
    select.appendChild(opt);
  }
  select.addEventListener('change', (e) => {
    onChange = e.target.value || 'all';
  });
}

/**
 * Map an event onto a banner level so error severity / low ratings get
 * visually flagged consistently with the dashboard banner.
 * @param {Object} event
 * @returns {'ok'|'degraded'|'down'}
 */
export function bannerLevel(event) {
  if (event.event_type === 'error') {
    return event.metadata.severity === 'critical' ? 'down' : 'degraded';
  }
  if (event.event_type === 'survey') {
    const r = Number(event.metadata.rating);
    if (r > 0 && r <= 2) return 'down';
    if (r === 3) return 'degraded';
  }
  return 'ok';
}

/**
 * Render a key/value row inside a .kv-list.
 * @param {string} key
 * @param {string} value
 * @param {{mono?: boolean}} [opts]
 */
export function kvRow(key, value, opts = {}) {
  const cls = opts.mono ? 'dep-val mono' : 'dep-val';
  return `<li class="kv-row"><span class="dep-key">${escapeHtml(key)}</span><span class="${cls}">${escapeHtml(value)}</span></li>`;
}