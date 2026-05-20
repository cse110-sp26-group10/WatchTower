/* global updateEvents */

/**
 * Dashboard rendering logic for the WatchTower prototype.
 *
 * Reads mock events from window.WatchTowerData, derives summary counts and a
 * system status, then populates the four signal panels (errors, page loads,
 * user feedback, clicks) plus a recent-activity feed. Events follow the
 * trimmed schema; we read only fields that schema guarantees.
 */

const DASHBOARD_UPDATE_INTERVAL = 5;

/** Currently selected deployment filter; 'all' means no filter. */
let activeDeploymentId = 'all';

/**
 * Format an ISO timestamp as a short relative string like "3m ago".
 * @param {string} iso
 * @returns {string}
 */
function relativeTime(iso) {
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
function deriveStatus(events) {
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
function averageRating(events) {
  const surveys = events.filter((e) => e.event_type === 'survey' && e.metadata.rating != null);
  if (surveys.length === 0) return 0;
  const total = surveys.reduce((sum, e) => sum + Number(e.metadata.rating || 0), 0);
  return Math.round((total / surveys.length) * 10) / 10;
}

/**
 * Render the status banner and the summary tiles.
 * @param {Array<Object>} events
 */
function renderHeader(events) {
  const status = deriveStatus(events);
  const banner = document.getElementById('status-banner');
  banner.textContent = status.label;
  banner.dataset.level = status.level;

  const counts = {
    error: events.filter((e) => e.event_type === 'error').length,
    page_load: events.filter((e) => e.event_type === 'page_load').length,
    survey: events.filter((e) => e.event_type === 'survey').length,
    click: events.filter((e) => e.event_type === 'click').length,
  };

  document.getElementById('summary-errors').textContent = counts.error;
  document.getElementById('summary-page-loads').textContent = counts.page_load;
  document.getElementById('summary-avg-rating').textContent =
    averageRating(events) > 0 ? `${averageRating(events)} / 5` : '—';
  document.getElementById('summary-clicks').textContent = counts.click;
}

/**
 * Populate the Errors panel with recent error events.
 * @param {Array<Object>} events
 */
function renderErrors(events) {
  const list = document.getElementById('errors-list');
  const errors = events
    .filter((e) => e.event_type === 'error')
    .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

  if (errors.length === 0) {
    list.innerHTML = '<li class="empty">No errors recorded.</li>';
    return;
  }

  list.innerHTML = errors
    .map(
      (e) => `
        <li class="event-row">
          <a class="event-link" href="issue.html?id=${encodeURIComponent(e.id)}">
            <span class="severity-badge sev-${escapeHtml(e.metadata.severity)}">${escapeHtml(e.metadata.severity)}</span>
            <div class="event-body">
              <div class="event-message">${escapeHtml(e.metadata.message)}</div>
              <div class="event-meta">${escapeHtml(e.pathname)} • ${relativeTime(e.timestamp)}</div>
            </div>
          </a>
        </li>`
    )
    .join('');
}

/**
 * Populate the Page Loads panel — a recent list grouped by pathname.
 * @param {Array<Object>} events
 */
function renderPageLoads(events) {
  const list = document.getElementById('page-loads-list');
  const loads = events.filter((e) => e.event_type === 'page_load');

  if (loads.length === 0) {
    list.innerHTML = '<li class="empty">No page loads recorded.</li>';
    return;
  }

  const groups = new Map();
  for (const e of loads) {
    const key = e.pathname || '(unknown)';
    const g = groups.get(key) || { pathname: key, count: 0, last: e.timestamp };
    g.count += 1;
    if (new Date(e.timestamp) > new Date(g.last)) g.last = e.timestamp;
    groups.set(key, g);
  }

  const rows = Array.from(groups.values()).sort((a, b) => b.count - a.count);

  list.innerHTML = rows
    .map(
      (g) => `
        <li class="event-row click-row">
          <div class="click-head">
            <span class="click-id">${escapeHtml(g.pathname)}</span>
            <span class="click-count">${g.count}×</span>
          </div>
          <div class="event-meta">last ${relativeTime(g.last)}</div>
        </li>`
    )
    .join('');
}

/**
 * Populate the User Feedback panel with survey responses.
 * @param {Array<Object>} events
 */
function renderFeedback(events) {
  const list = document.getElementById('feedback-list');
  const surveys = events
    .filter((e) => e.event_type === 'survey')
    .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

  if (surveys.length === 0) {
    list.innerHTML = '<li class="empty">No survey responses yet.</li>';
    return;
  }

  list.innerHTML = surveys
    .map((e) => {
      const rating = Number(e.metadata.rating || 0);
      const stars = '★★★★★'.slice(0, rating) + '☆☆☆☆☆'.slice(0, 5 - rating);
      const tone = rating <= 2 ? 'rating-low' : rating >= 4 ? 'rating-high' : 'rating-mid';
      return `
        <li class="event-row">
          <a class="event-link" href="issue.html?id=${encodeURIComponent(e.id)}">
            <span class="rating-badge ${tone}" title="${rating}/5">${stars}</span>
            <div class="event-body">
              <div class="event-message">${escapeHtml(e.metadata.comment || '(no comment)')}</div>
              <div class="event-meta">${escapeHtml(e.pathname)} • ${relativeTime(e.timestamp)}</div>
            </div>
          </a>
        </li>`;
    })
    .join('');
}

/**
 * Populate the Clicks panel — grouped by pathname with counts.
 * @param {Array<Object>} events
 */
function renderClicks(events) {
  const list = document.getElementById('clicks-list');
  const clicks = events.filter((e) => e.event_type === 'click');

  if (clicks.length === 0) {
    list.innerHTML = '<li class="empty">No click events recorded.</li>';
    return;
  }

  const groups = new Map();
  for (const c of clicks) {
    const key = c.pathname || '(unknown)';
    const g = groups.get(key) || { pathname: key, count: 0, last: c.timestamp };
    g.count += 1;
    if (new Date(c.timestamp) > new Date(g.last)) g.last = c.timestamp;
    groups.set(key, g);
  }

  const rows = Array.from(groups.values()).sort((a, b) => b.count - a.count);

  list.innerHTML = rows
    .map(
      (g) => `
        <li class="event-row click-row">
          <div class="click-head">
            <span class="click-id">${escapeHtml(g.pathname)}</span>
            <span class="click-count">${g.count}×</span>
          </div>
          <div class="event-meta">last ${relativeTime(g.last)}</div>
        </li>`
    )
    .join('');
}

/**
 * Populate the recent-activity feed with the newest events across all types.
 * @param {Array<Object>} events
 */
function renderActivity(events) {
  const list = document.getElementById('activity-list');
  const recent = events
    .slice()
    .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
    .slice(0, 8);

  list.innerHTML = recent
    .map((e) => {
      const summary = summarizeEvent(e);
      return `
        <li class="activity-row">
          <span class="type-pill type-${escapeHtml(e.event_type)}">${escapeHtml(e.event_type)}</span>
          <span class="activity-text">${escapeHtml(summary)}</span>
          <span class="activity-time">${relativeTime(e.timestamp)}</span>
        </li>`;
    })
    .join('');
}

/**
 * Produce a one-line summary for a single event, depending on its type.
 * @param {Object} e
 * @returns {string}
 */
function summarizeEvent(e) {
  switch (e.event_type) {
    case 'error':
      return `[${e.metadata.severity}] ${e.metadata.message} (${e.pathname})`;
    case 'page_load':
      return `${e.pathname} loaded`;
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
function escapeHtml(value) {
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
function populateDeploymentFilter() {
  const select = document.getElementById('deployment-filter');
  const deployments = window.WatchTowerData.getDeployments();
  for (const d of deployments) {
    const opt = document.createElement('option');
    opt.value = d.id;
    opt.textContent = `${d.version} — ${d.id} (${d.commit_hash})`;
    select.appendChild(opt);
  }
  select.addEventListener('change', (e) => {
    activeDeploymentId = e.target.value || 'all';
    render();
  });
}

/**
 * Render the deployment-detail panel when a specific deployment is selected.
 */
function renderDeploymentDetail() {
  const box = document.getElementById('deployment-detail');
  if (activeDeploymentId === 'all') {
    box.hidden = true;
    box.innerHTML = '';
    return;
  }
  const d = window.WatchTowerData.getDeployment(activeDeploymentId);
  if (!d) {
    box.hidden = true;
    return;
  }
  box.hidden = false;
  box.innerHTML = `
    <div class="dep-field"><span class="dep-key">id</span><span class="dep-val">${escapeHtml(d.id)}</span></div>
    <div class="dep-field"><span class="dep-key">version</span><span class="dep-val">${escapeHtml(d.version)}</span></div>
    <div class="dep-field"><span class="dep-key">commit</span><span class="dep-val mono">${escapeHtml(d.commit_hash)}</span></div>
    <div class="dep-field"><span class="dep-key">author</span><span class="dep-val">${escapeHtml(d.author)}</span></div>
    <div class="dep-field"><span class="dep-key">deployed</span><span class="dep-val">${relativeTime(d.deployed_at)}</span></div>
  `;
}

/**
 * Render every section of the dashboard, scoped to the active deployment.
 */
function render() {
  const events = window.WatchTowerData.getEvents({ deploymentId: activeDeploymentId });
  renderHeader(events);
  renderErrors(events);
  renderPageLoads(events);
  renderFeedback(events);
  renderClicks(events);
  renderActivity(events);
  renderDeploymentDetail();

  const topbarInfo = document.getElementById('deployment-info');
  if (activeDeploymentId === 'all') {
    const total = window.WatchTowerData.getDeployments().length;
    topbarInfo.textContent = `${total} deployments`;
  } else {
    const d = window.WatchTowerData.getDeployment(activeDeploymentId);
    topbarInfo.textContent = d ? `deployment ${d.version} (${d.commit_hash})` : 'deployment —';
  }
  document.getElementById('updated-at').textContent =
    `Updated ${new Date().toLocaleTimeString()}`;
}

document.addEventListener('DOMContentLoaded', () => {
  populateDeploymentFilter();
  render();
});

setInterval(async function() {
  await updateEvents();
  render();
}, DASHBOARD_UPDATE_INTERVAL * 1000);