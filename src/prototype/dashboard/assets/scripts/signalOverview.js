/**
 * Signal overview page rendering.
 *
 * Mirrors the dashboard Errors / User Feedback panels, but expands each signal
 * into a detailed issue summary. Feedback mode follows issue.js' survey branch.
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

let activeDeploymentId = 'all';
const openPanelIds = new Set();

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
  if (!d) {
    box.hidden = true;
    return;
  }

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
  return '\u2605\u2605\u2605\u2605\u2605'.slice(0, filled) + '\u2606\u2606\u2606\u2606\u2606'.slice(0, 5 - filled);
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
  document.getElementById('errors-updated').textContent =
    `Updated ${new Date().toLocaleTimeString()}`;

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
  if (signal.event_type === 'survey') {
    return signal.metadata.comment || '(no comment)';
  }

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
          <header class="panel-header">
            <h2>Context</h2>
            <span class="panel-hint">where it happened</span>
          </header>
          <ul class="kv-list">${detailRows.join('')}</ul>
        </article>

        <article>
          <header class="panel-header">
            <h2>Deployment</h2>
            <span class="panel-hint">build attached to error</span>
          </header>
          <ul class="kv-list">${deploymentRows}</ul>
        </article>
      </section>
    </details>`;
}

function renderSignals() {
  const list = document.getElementById('errors-list');
  syncPanelState();

  const signals = getSignals().sort(
    (a, b) =>
      severityRank(b.metadata.severity) - severityRank(a.metadata.severity) ||
      new Date(b.timestamp) - new Date(a.timestamp)
  );

  renderHeader(signals);
  renderDeploymentDetail();

  if (signals.length === 0) {
    list.innerHTML = `<div class="empty">${pageConfig.emptyLabel}</div>`;
    return;
  }

  list.innerHTML = signals.map(renderSignalPanel).join('');
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
