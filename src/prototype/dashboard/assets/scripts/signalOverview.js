/**
 * Signal overview page rendering.
 *
 * Error mode groups repeated errors by message to reduce noise and supports
 * resolving individual occurrences or entire groups.
 */

import {
    kvRow,
    relativeTime,
    escapeHtml,
    populateDeploymentFilter
} from './helpers.js';

const OVERVIEW_UPDATE_INTERVAL = 5;
const MODE = window.location.pathname.endsWith('feedback.html') ? 'feedback' : 'error';
const CONFIG = {
  error: {
    eventType: 'error',
    bannerLabel: 'Errors',
    emptyLabel: 'No errors recorded.',
    panelTitle: 'Error Overview',
    countLabel: 'Error',
    hint: 'expand an issue for context',
  },
  feedback: {
    eventType: 'survey',
    bannerLabel: 'User Feedback',
    emptyLabel: 'No survey responses yet.',
    panelTitle: 'User Feedback',
    countLabel: 'Feedback Item',
    hint: 'expand a response for context',
  },
};
const pageConfig = CONFIG[MODE];
const SEVERITY_RANK_MAP = { critical: 0, warning: 1, info: 2 };

let activeDeploymentId = 'all';
const openPanelIds = new Set();

// Resolved state — persisted across refreshes.
// resolvedIds: Set of event IDs resolved individually (permanent).
// resolvedGroups: Map of message → ISO timestamp resolved at; events older
//   than that timestamp are hidden, newer ones reappear automatically.
const RESOLVED_IDS_KEY = 'wt_resolved_ids';
const RESOLVED_GROUPS_KEY = 'wt_resolved_groups';

function loadResolvedIds() {
  try { return new Set(JSON.parse(localStorage.getItem(RESOLVED_IDS_KEY) || '[]')); } catch { return new Set(); }
}
function loadResolvedGroups() {
  try { return new Map(Object.entries(JSON.parse(localStorage.getItem(RESOLVED_GROUPS_KEY) || '{}'))); } catch { return new Map(); }
}
function saveResolvedIds(set) {
  localStorage.setItem(RESOLVED_IDS_KEY, JSON.stringify([...set]));
}
function saveResolvedGroups(map) {
  localStorage.setItem(RESOLVED_GROUPS_KEY, JSON.stringify(Object.fromEntries(map)));
}

let resolvedIds = loadResolvedIds();
let resolvedGroups = loadResolvedGroups();
let lastRenderKey = null;

function isResolved(event) {
  if (resolvedIds.has(event.id)) return true;
  const resolvedAt = resolvedGroups.get(event.metadata.message || '');
  // Only hidden if it occurred before the resolve action
  return resolvedAt != null && new Date(event.timestamp) <= new Date(resolvedAt);
}

function resolveId(id) {
  resolvedIds.add(id);
  saveResolvedIds(resolvedIds);
}

function resolveGroup(message) {
  resolvedGroups.set(message, new Date().toISOString());
  saveResolvedGroups(resolvedGroups);
}

function syncPanelState() {
  document.querySelectorAll('#errors-list details[data-signal-id]').forEach((panel) => {
    if (panel.open) {
      openPanelIds.add(panel.dataset.signalId);
    } else {
      openPanelIds.delete(panel.dataset.signalId);
    }
  });
}

function trackPanelState() {
  document.querySelectorAll('#errors-list details[data-signal-id]').forEach((panel) => {
    panel.addEventListener('toggle', () => {
      if (panel.open) {
        openPanelIds.add(panel.dataset.signalId);
      } else {
        openPanelIds.delete(panel.dataset.signalId);
      }
    });
  });
}

function getSignals() {
  return window.WatchTowerData
    .getEvents({ deploymentId: activeDeploymentId })
    .filter((e) => e.event_type === pageConfig.eventType)
    .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
}

function severityRank(severity) {
  if (severity === 'critical') return 2;
  if (severity === 'warning') return 1;
  return 0;
}

function renderDeploymentDetail() {
  const box = document.getElementById('deployment-detail');
  if (activeDeploymentId === 'all') {
    box.hidden = true;
    box.innerHTML = '';
    return;
  }
  const d = window.WatchTowerData.getDeployment(activeDeploymentId);
  if (!d) { box.hidden = true; return; }
  box.hidden = false;
  box.innerHTML = `
    <div class="dep-field"><span class="dep-key">id</span><span class="dep-val">${escapeHtml(d.id)}</span></div>
    <div class="dep-field"><span class="dep-key">version</span><span class="dep-val">${escapeHtml(d.version)}</span></div>
    <div class="dep-field"><span class="dep-key">commit</span><span class="dep-val mono">${escapeHtml(d.commit_hash)}</span></div>
    <div class="dep-field"><span class="dep-key">author</span><span class="dep-val">${escapeHtml(d.author || '-')}</span></div>
    <div class="dep-field"><span class="dep-key">deployed</span><span class="dep-val">${d.deployed_at ? relativeTime(d.deployed_at) : '-'}</span></div>
  `;
}

function ratingTone(rating) {
  if (rating <= 2) return 'rating-low';
  if (rating >= 4) return 'rating-high';
  return 'rating-mid';
}

function starsForRating(rating) {
  const filled = Math.max(0, Math.min(5, Number(rating || 0)));
  return '★★★★★'.slice(0, filled) + '☆☆☆☆☆'.slice(0, 5 - filled);
}

function renderHeader(signals) {
  const banner = document.getElementById('errors-banner');
  const criticalCount = signals.filter((e) => e.metadata.severity === 'critical').length;
  const warningCount = signals.filter((e) => e.metadata.severity === 'warning').length;
  const lowRatingCount = signals.filter((e) => Number(e.metadata.rating || 0) > 0 && Number(e.metadata.rating || 0) <= 2).length;
  const midRatingCount = signals.filter((e) => Number(e.metadata.rating || 0) === 3).length;

  banner.dataset.level =
    MODE === 'error'
      ? criticalCount > 0 ? 'down' : warningCount > 0 ? 'degraded' : 'ok'
      : lowRatingCount > 0 ? 'down' : midRatingCount > 0 ? 'degraded' : 'ok';
  banner.textContent =
    signals.length === 0
      ? `No ${pageConfig.bannerLabel} Recorded`
      : `${signals.length} ${pageConfig.countLabel}${signals.length === 1 ? '' : 's'} Recorded`;

  document.getElementById('errors-count').textContent = MODE === 'error'
    ? `${criticalCount} critical / ${warningCount} warning`
    : `${lowRatingCount} low rating / ${midRatingCount} neutral`;
  document.getElementById('errors-updated').textContent = `Updated ${new Date().toLocaleTimeString()}`;

  const topbarInfo = document.getElementById('deployment-info');
  if (activeDeploymentId === 'all') {
    topbarInfo.textContent = `${window.WatchTowerData.getDeployments().length} deployments`;
  } else {
    const d = window.WatchTowerData.getDeployment(activeDeploymentId);
    topbarInfo.textContent = d ? `deployment ${d.version} (${d.commit_hash})` : 'deployment -';
  }
  document.getElementById('updated-at').textContent = `Updated ${new Date().toLocaleTimeString()}`;
}

function renderSignalBadge(signal) {
  if (signal.event_type === 'survey') {
    const rating = Number(signal.metadata.rating || 0);
    return `<span class="rating-badge ${ratingTone(rating)}" title="${rating}/5">${starsForRating(rating)}</span>`;
  }
  return `<span class="severity-badge sev-${escapeHtml(signal.metadata.severity)}">${escapeHtml(signal.metadata.severity)}</span>`;
}

function renderSignalMessage(signal) {
  if (signal.event_type === 'survey') return signal.metadata.comment || '(no comment)';
  return signal.metadata.message || '(no message)';
}

function renderPrimaryDetail(signal) {
  if (signal.event_type === 'survey') {
    const rating = Number(signal.metadata.rating || 0);
    return `
      <div class="issue-headline">${starsForRating(rating)} <span class="event-meta">(${rating}/5)</span></div>
      <div class="event-message">${escapeHtml(signal.metadata.comment || '(no comment)')}</div>
    `;
  }
  return `
    <div class="issue-headline">${escapeHtml(signal.metadata.message || '(no message)')}</div>
    <div class="event-meta">severity: <strong>${escapeHtml(signal.metadata.severity)}</strong></div>
  `;
}

function renderSignalPanel(signal) {
  const dep = signal.deployment;
  const fullDep = dep && window.WatchTowerData.getDeployment(dep.id);
  const isOpen = openPanelIds.has(signal.id) ? 'open' : '';
  const detailRows = [
    kvRow('pathname', signal.pathname || '-', { mono: true }),
    kvRow('page url', signal.metadata.pageUrl || '-', { mono: true }),
    kvRow('ip', signal.ip || '-', { mono: true }),
    kvRow('observed', `${relativeTime(signal.timestamp)} (${new Date(signal.timestamp).toLocaleString()})`),
    kvRow('received', `${relativeTime(signal.created_at)} (${new Date(signal.created_at).toLocaleString()})`),
  ];
  const deploymentRows = dep
    ? [
        kvRow('id', dep.id, { mono: true }),
        kvRow('version', dep.version, { mono: true }),
        kvRow('commit', dep.commit_hash, { mono: true }),
        fullDep ? kvRow('author', fullDep.author || '-') : '',
        fullDep && fullDep.deployed_at
          ? kvRow('deployed', `${relativeTime(fullDep.deployed_at)} (${new Date(fullDep.deployed_at).toLocaleString()})`)
          : '',
      ].join('')
    : '<li class="empty">No deployment attached.</li>';

  return `
    <details class="panel" data-signal-id="${escapeHtml(signal.id)}" ${isOpen}>
      <summary class="event-link">
        ${renderSignalBadge(signal)}
        <div class="event-body">
          <div class="event-message">${escapeHtml(renderSignalMessage(signal))}</div>
          <div class="event-meta">${escapeHtml(signal.pathname || '-')} &bull; ${relativeTime(signal.timestamp)} &bull; ${escapeHtml(signal.id)}</div>
        </div>
      </summary>
      <section class="issue-primary">
        ${renderPrimaryDetail(signal)}
        <p><a class="back-link" href="issue.html?id=${encodeURIComponent(signal.id)}">Open issue detail</a></p>
      </section>
      <section class="panel-grid">
        <article>
          <header class="panel-header"><h2>Context</h2><span class="panel-hint">where it happened</span></header>
          <ul class="kv-list">${detailRows.join('')}</ul>
        </article>
        <article>
          <header class="panel-header"><h2>Deployment</h2><span class="panel-hint">build attached to error</span></header>
          <ul class="kv-list">${deploymentRows}</ul>
        </article>
      </section>
    </details>`;
}

function groupErrors(signals) {
  const groups = new Map();
  for (const s of signals) {
    const key = s.metadata.message || '(unknown error)';
    const g = groups.get(key) || {
      message: key, count: 0, severity: s.metadata.severity,
      latestSignal: s, firstTs: s.timestamp, signals: [],
    };
    g.count += 1;
    g.signals.push(s);
    if ((SEVERITY_RANK_MAP[s.metadata.severity] ?? 99) < (SEVERITY_RANK_MAP[g.severity] ?? 99)) {
      g.severity = s.metadata.severity;
    }
    if (new Date(s.timestamp) > new Date(g.latestSignal.timestamp)) g.latestSignal = s;
    if (new Date(s.timestamp) < new Date(g.firstTs)) g.firstTs = s.timestamp;
    groups.set(key, g);
  }
  return Array.from(groups.values()).sort((a, b) => {
    const sevDiff = (SEVERITY_RANK_MAP[a.severity] ?? 99) - (SEVERITY_RANK_MAP[b.severity] ?? 99);
    return sevDiff !== 0 ? sevDiff : b.count - a.count;
  });
}

function renderGroupedErrorPanel(group) {
  const { message, severity, count, latestSignal: s, firstTs, signals } = group;
  const isOpen = openPanelIds.has(`group_${message}`) ? 'open' : '';
  const countBadge = count > 1 ? `<span class="error-count">\xd7${count}</span>` : '';
  const firstSeen = count > 1 ? ` • first ${relativeTime(firstTs)}` : '';

  const dep = s.deployment;
  const fullDep = dep && window.WatchTowerData.getDeployment(dep.id);

  const detailRows = [
    kvRow('pathname', s.pathname || '-', { mono: true }),
    kvRow('ip', s.ip || '-', { mono: true }),
    kvRow('last seen', `${relativeTime(s.timestamp)} (${new Date(s.timestamp).toLocaleString()})`),
    count > 1 ? kvRow('first seen', `${relativeTime(firstTs)} (${new Date(firstTs).toLocaleString()})`) : '',
    kvRow('occurrences', String(count)),
  ];

  const deploymentRows = dep
    ? [
        kvRow('id', dep.id, { mono: true }),
        kvRow('version', dep.version, { mono: true }),
        kvRow('commit', dep.commit_hash, { mono: true }),
        fullDep ? kvRow('author', fullDep.author || '-') : '',
        fullDep && fullDep.deployed_at
          ? kvRow('deployed', `${relativeTime(fullDep.deployed_at)} (${new Date(fullDep.deployed_at).toLocaleString()})`)
          : '',
      ].join('')
    : '<li class="empty">No deployment attached.</li>';

  const occurrencesSection = count > 1
    ? `<section class="panel">
        <header class="panel-header">
          <h2>All Occurrences</h2>
          <span class="panel-hint">${count} total, most recent first</span>
        </header>
        <ul class="event-list">${signals.map((occ) => `
          <li class="event-row">
            <a class="event-link" href="issue.html?id=${encodeURIComponent(occ.id)}">
              <span class="severity-badge sev-${escapeHtml(occ.metadata.severity)}">${escapeHtml(occ.metadata.severity)}</span>
              <div class="event-body">
                <div class="event-meta">${escapeHtml(occ.pathname || '-')} • ${relativeTime(occ.timestamp)} • ${escapeHtml(occ.id)}</div>
              </div>
            </a>
          </li>`).join('')}
        </ul>
      </section>`
    : '';

  return `<details class="panel" data-signal-id="group_${escapeHtml(message)}" ${isOpen}>
    <summary class="event-link">
      <span class="severity-badge sev-${escapeHtml(severity)}">${escapeHtml(severity)}</span>
      <div class="event-body">
        <div class="event-message">${escapeHtml(message)}${countBadge}</div>
        <div class="event-meta">${escapeHtml(s.pathname || '-')} • last ${relativeTime(s.timestamp)}${firstSeen}</div>
      </div>
      <button class="resolve-btn resolve-btn--group" data-resolve-group="${escapeHtml(message)}" title="Resolve this error">Resolve</button>
    </summary>
    <section class="issue-primary">
      <div class="issue-headline">${escapeHtml(message)}</div>
      <div class="event-meta">severity: <strong>${escapeHtml(severity)}</strong></div>
      <p><a class="back-link" href="issue.html?id=${encodeURIComponent(s.id)}">Open latest occurrence</a></p>
    </section>
    <section class="panel-grid">
      <article>
        <header class="panel-header"><h2>Context</h2><span class="panel-hint">most recent occurrence</span></header>
        <ul class="kv-list">${detailRows.join('')}</ul>
      </article>
      <article>
        <header class="panel-header"><h2>Deployment</h2><span class="panel-hint">build attached to error</span></header>
        <ul class="kv-list">${deploymentRows}</ul>
      </article>
    </section>
    ${occurrencesSection}
  </details>`;
}

function attachResolveHandlers() {
  document.getElementById('errors-list').addEventListener('click', (e) => {
    const btn = e.target.closest('[data-resolve-id], [data-resolve-group]');
    if (!btn) return;
    e.preventDefault();
    e.stopPropagation();

    if (btn.dataset.resolveGroup !== undefined) {
      resolveGroup(btn.dataset.resolveGroup);
    } else {
      resolveId(btn.dataset.resolveId);
    }
    lastRenderKey = null;
    renderSignals();
  }, { once: true });
}

function renderSignals({ force = false } = {}) {
  const list = document.getElementById('errors-list');
  syncPanelState();

  const allSignals = getSignals().sort(
    (a, b) =>
      severityRank(b.metadata.severity) - severityRank(a.metadata.severity) ||
      new Date(b.timestamp) - new Date(a.timestamp)
  );

  const signals = MODE === 'error' ? allSignals.filter((e) => !isResolved(e)) : allSignals;

  const renderKey = signals.map((e) => e.id + e.timestamp).join(',') + activeDeploymentId;
  if (!force && renderKey === lastRenderKey) return;
  lastRenderKey = renderKey;

  renderHeader(signals);
  renderDeploymentDetail();

  if (signals.length === 0) {
    list.innerHTML = `<div class="empty">${signals.length < allSignals.length ? 'All errors resolved. ✓' : pageConfig.emptyLabel}</div>`;
    return;
  }

  if (MODE === 'error') {
    list.innerHTML = groupErrors(signals).map(renderGroupedErrorPanel).join('');
    attachResolveHandlers();
  } else {
    list.innerHTML = signals.map(renderSignalPanel).join('');
  }

  trackPanelState();
}

async function update() {
  await window.WatchTowerData.updateEvents();
  renderSignals();
}

document.addEventListener('DOMContentLoaded', () => {
  document.title = `WatchTower - ${pageConfig.panelTitle}`;
  document.getElementById('errors-title').textContent = pageConfig.panelTitle;
  document.getElementById('errors-title').nextElementSibling.textContent = pageConfig.hint;
  document.getElementById('errors-banner').textContent = pageConfig.bannerLabel;

  populateDeploymentFilter((deploymentId) => {
    activeDeploymentId = deploymentId;
    renderSignals();
  });
  renderSignals();
  update();
  setInterval(update, OVERVIEW_UPDATE_INTERVAL * 1000);
});
