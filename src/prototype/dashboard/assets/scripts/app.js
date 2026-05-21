/**
 * Dashboard rendering logic for the WatchTower prototype.
 *
 * Reads mock events from window.WatchTowerData, derives summary counts and a
 * system status, then populates the four signal panels (errors, page loads,
 * user feedback, clicks) plus a recent-activity feed. Events follow the
 * trimmed schema; we read only fields that schema guarantees.
 */

import {
  relativeTime,
  populateDeploymentFilter,
  deriveStatus,
  averageLoadTime,
  averageRating,
  escapeHtml,
  summarizeEvent
 } from './helpers.js';

const DASHBOARD_UPDATE_INTERVAL = 5;
const DASHBOARD_VIEWS = new Set(['overview', 'errors', 'feedback', 'activity']);

/** Currently selected deployment filter; 'all' means no filter. */
let activeDeploymentId = 'all';
let activeDashboardView = 'overview';

/**
 * Read and normalize the dashboard page requested by the sidebar.
 * @returns {string}
 */
function getDashboardView() {
  const requested = new URLSearchParams(window.location.search).get('view') || 'overview';
  return DASHBOARD_VIEWS.has(requested) ? requested : 'overview';
}

/**
 * Show only the card sections that belong to the current dashboard page.
 */
function applyDashboardView() {
  document.querySelectorAll('[data-dashboard-view]').forEach((section) => {
    const views = (section.dataset.dashboardView || '').split(/\s+/);
    section.hidden = !views.includes(activeDashboardView);
  });

  document.querySelectorAll('[data-dashboard-card]').forEach((card) => {
    const cardView = card.dataset.dashboardCard;
    card.hidden = activeDashboardView !== 'overview' && cardView !== activeDashboardView;
  });

  const labels = {
    overview: 'Dashboard Overview',
    errors: 'Errors',
    feedback: 'User Feedback',
    activity: 'Activity',
  };
  document.title = `WatchTower — ${labels[activeDashboardView]}`;
}

/**
 * Render the unified status card: uptime probe is the headline, the
 * error-derived health label appears as the sub-line, with probe stats on
 * the right. Uptime is global (not deployment-scoped); the health sub IS
 * deployment-scoped via the events arg.
 * @param {Array<Object>} events deployment-filtered event list
 */
function renderUptime(events) {
  const log = (window.WatchTowerData.getUptimeLog && window.WatchTowerData.getUptimeLog()) || [];
  const card = document.getElementById('uptime-card');
  const statusEl = document.getElementById('uptime-status');
  const subEl = document.getElementById('uptime-sub');
  const respEl = document.getElementById('uptime-response');
  const pctEl = document.getElementById('uptime-percent');
  const lastEl = document.getElementById('uptime-last');

  const health = deriveStatus(events || []);

  if (log.length === 0) {
    card.dataset.status = 'unknown';
    card.dataset.health = health.level;
    statusEl.textContent = 'Unknown';
    subEl.textContent = 'no probes yet';
    respEl.textContent = '—';
    pctEl.textContent = '—';
    lastEl.textContent = '—';
    return;
  }

  const latest = log[0];
  const isUp = latest.is_up;
  card.dataset.status = isUp ? 'up' : 'down';
  card.dataset.health = isUp ? health.level : 'down';
  statusEl.textContent = isUp ? 'Online' : 'Offline';

  if (!isUp) {
    subEl.textContent = 'Service unreachable';
  } else {
    const crit = (events || []).filter((e) => e.event_type === 'error' && e.metadata.severity === 'critical').length;
    const warn = (events || []).filter((e) => e.event_type === 'error' && e.metadata.severity === 'warning').length;
    if (health.level === 'ok') {
      subEl.textContent = 'All systems operational';
    } else {
      const parts = [];
      if (crit > 0) parts.push(`${crit} critical error${crit === 1 ? '' : 's'}`);
      if (warn > 0) parts.push(`${warn} warning${warn === 1 ? '' : 's'}`);
      subEl.textContent = `${health.label} — ${parts.join(', ')}`;
    }
  }

  const recent = log.slice(0, 20);
  const upCount = recent.filter((p) => p.is_up).length;
  const pct = Math.round((upCount / recent.length) * 100);

  respEl.textContent = isUp ? `${latest.latency} ms` : '—';
  pctEl.textContent = `${pct}% (${recent.length} checks)`;
  lastEl.textContent = relativeTime(latest.timestamp);
}

/**
 * Render the status banner and the summary tiles.
 * @param {Array<Object>} events
 */
function renderHeader(events) {
  const counts = {
    error: events.filter((e) => e.event_type === 'error').length,
    page_load: events.filter((e) => e.event_type === 'page_load').length,
    survey: events.filter((e) => e.event_type === 'survey').length,
    click: events.filter((e) => e.event_type === 'click').length,
  };

  document.getElementById('summary-errors').textContent = counts.error;
  const avgLoad = averageLoadTime(events);
  document.getElementById('summary-page-loads').textContent =
    avgLoad != null ? `${avgLoad} ms` : '—';
  document.getElementById('summary-load-count').textContent = counts.page_load;
  document.getElementById('summary-clicks').textContent = counts.click;
}

const SEVERITY_RANK = { critical: 0, warning: 1, info: 2 };

/**
 * Populate the Errors panel, grouping repeated errors by message so a
 * single recurring error doesn't flood the list. Each group shows a ×N
 * count, the worst severity seen, and first-seen time for recurring issues.
 * Sorted: critical first, then by occurrence count descending.
 * @param {Array<Object>} events
 */
function renderErrors(events) {
  const list = document.getElementById('errors-list');
  const errors = events.filter((e) => e.event_type === 'error');

  if (errors.length === 0) {
    list.innerHTML = '<li class="empty">No errors recorded.</li>';
    return;
  }

  const groups = new Map();
  for (const e of errors) {
    const key = e.metadata.message || '(unknown error)';
    const g = groups.get(key) || {
      message: key,
      count: 0,
      severity: e.metadata.severity,
      latestId: e.id,
      latestTs: e.timestamp,
      firstTs: e.timestamp,
      pathname: e.pathname,
    };
    g.count += 1;
    if ((SEVERITY_RANK[e.metadata.severity] ?? 99) < (SEVERITY_RANK[g.severity] ?? 99)) {
      g.severity = e.metadata.severity;
    }
    if (new Date(e.timestamp) > new Date(g.latestTs)) {
      g.latestTs = e.timestamp;
      g.latestId = e.id;
      g.pathname = e.pathname;
    }
    if (new Date(e.timestamp) < new Date(g.firstTs)) {
      g.firstTs = e.timestamp;
    }
    groups.set(key, g);
  }

  const sorted = Array.from(groups.values()).sort((a, b) => {
    const sevDiff = (SEVERITY_RANK[a.severity] ?? 99) - (SEVERITY_RANK[b.severity] ?? 99);
    return sevDiff !== 0 ? sevDiff : b.count - a.count;
  });

  const rows = sorted.map((g) => {
    const countBadge = g.count > 1 ? `<span class="error-count">\xd7${g.count}</span>` : '';
    const firstSeen = g.count > 1
      ? ` • <span class="event-meta-extra">first ${relativeTime(g.firstTs)}</span>`
      : '';
    return `<li class="event-row"><a class="event-link" href="issue.html?id=${encodeURIComponent(g.latestId)}"><span class="severity-badge sev-${escapeHtml(g.severity)}">${escapeHtml(g.severity)}</span><div class="event-body"><div class="event-message">${escapeHtml(g.message)}${countBadge}</div><div class="event-meta">${escapeHtml(g.pathname)} • last ${relativeTime(g.latestTs)}${firstSeen}</div></div></a></li>`;
  });

  list.innerHTML = rows.join('');
}

const SLOW_LOAD_MS = 1500;
const PERF_BAR_MAX_MS = 3000;

/**
 * Populate the Page Loads panel — grouped by pathname with avg load time.
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
    const g = groups.get(key) || { pathname: key, count: 0, totalMs: 0, samples: 0, last: e.timestamp };
    g.count += 1;
    const t = Number(e.metadata && e.metadata.load_time);
    if (Number.isFinite(t)) {
      g.totalMs += t;
      g.samples += 1;
    }
    if (new Date(e.timestamp) > new Date(g.last)) g.last = e.timestamp;
    groups.set(key, g);
  }

  const rows = Array.from(groups.values())
    .map((g) => ({ ...g, avgMs: g.samples > 0 ? Math.round(g.totalMs / g.samples) : null }))
    .sort((a, b) => (b.avgMs ?? -1) - (a.avgMs ?? -1));

  list.innerHTML = rows
    .map((g) => {
      const hasTime = g.avgMs != null;
      const slow = hasTime && g.avgMs >= SLOW_LOAD_MS;
      const pct = hasTime ? Math.min(100, Math.round((g.avgMs / PERF_BAR_MAX_MS) * 100)) : 0;
      const timeLabel = hasTime ? `${g.avgMs} ms` : '—';
      return `
        <li class="event-row perf-row">
          <div class="perf-head">
            <span class="perf-path">${escapeHtml(g.pathname)}</span>
            <span class="perf-time ${slow ? 'is-slow' : ''}">${timeLabel}</span>
          </div>
          <div class="perf-bar">
            <div class="perf-bar-fill ${slow ? 'is-slow' : ''}" style="width: ${pct}%"></div>
          </div>
          <div class="event-meta">${g.count}\xd7 • last ${relativeTime(g.last)}</div>
        </li>`;
    })
    .join('');
}

/**
 * Populate the User Feedback panel with survey responses.
 * @param {Array<Object>} events
 */
function renderFeedback(events) {
  const list = document.getElementById('feedback-list');
  if (!list) return;
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
            <span class="click-count">${g.count}\xd7</span>
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
  activeDashboardView = getDashboardView();
  applyDashboardView();

  const events = window.WatchTowerData.getEvents({ deploymentId: activeDeploymentId });
  renderUptime(events);
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

/**
 * Retrieve data from the server and render the dashboard
 */
async function update() {
  render();
  await Promise.all([
    window.WatchTowerData.updateEvents(),
    window.WatchTowerData.updateUptimeLog(),
  ]);
  render();
}

document.addEventListener('DOMContentLoaded', () => {
  populateDeploymentFilter((deploymentId) => {
  activeDeploymentId = deploymentId;
  render();
  });
  update();
  setInterval(update, DASHBOARD_UPDATE_INTERVAL * 1000);
});
