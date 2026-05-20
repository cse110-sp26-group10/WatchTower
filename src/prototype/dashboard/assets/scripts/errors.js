/**
 * Error overview page rendering.
 *
 * Mirrors the dashboard Errors panel, but expands each error into a detailed
 * issue summary using helpers from issue.js where those helpers already exist.
 */

import {
    kvRow,
    relativeTime,
    escapeHtml,
    summarizeEvent,
    populateDeploymentFilter
} from './helpers.js'

const ERRORS_UPDATE_INTERVAL = 5;

let activeDeploymentId = 'all';
const openPanelIds = new Set();

function syncPanelState() {
  document.querySelectorAll('#errors-list details[data-error-id]').forEach((panel) => {
    if (panel.open) {
      openPanelIds.add(panel.dataset.errorId);
    } else {
      openPanelIds.delete(panel.dataset.errorId);
    }
  });
}

function trackPanelState() {
  document.querySelectorAll('#errors-list details[data-error-id]').forEach((panel) => {
    panel.addEventListener('toggle', () => {
      if (panel.open) {
        openPanelIds.add(panel.dataset.errorId);
      } else {
        openPanelIds.delete(panel.dataset.errorId);
      }
    });
  });
}

function getErrors() {
  return window.WatchTowerData
    .getEvents({ deploymentId: activeDeploymentId })
    .filter((e) => e.event_type === 'error')
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

function renderHeader(errors) {
  const banner = document.getElementById('errors-banner');
  const criticalCount = errors.filter((e) => e.metadata.severity === 'critical').length;
  const warningCount = errors.filter((e) => e.metadata.severity === 'warning').length;

  banner.dataset.level = criticalCount > 0 ? 'down' : warningCount > 0 ? 'degraded' : 'ok';
  banner.textContent =
    errors.length === 0
      ? 'No Errors Recorded'
      : `${errors.length} Error${errors.length === 1 ? '' : 's'} Recorded`;

  document.getElementById('errors-count').textContent =
    `${criticalCount} critical / ${warningCount} warning`;
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


function renderErrorPanel(error) {
  const dep = error.deployment;
  const fullDep = dep && window.WatchTowerData.getDeployment(dep.id);
  const isOpen = openPanelIds.has(error.id) ? 'open' : '';
  const detailRows = [
    kvRow('pathname', error.pathname || '-', { mono: true }),
    kvRow('page url', error.metadata.pageUrl || '-', { mono: true }),
    kvRow('ip', error.ip || '-', { mono: true }),
    kvRow('observed', `${relativeTime(error.timestamp)} (${new Date(error.timestamp).toLocaleString()})`),
    kvRow('received', `${relativeTime(error.created_at)} (${new Date(error.created_at).toLocaleString()})`),
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
    <details class="panel" data-error-id="${escapeHtml(error.id)}" ${isOpen}>
      <summary class="event-link">
        <span class="severity-badge sev-${escapeHtml(error.metadata.severity)}">${escapeHtml(error.metadata.severity)}</span>
        <div class="event-body">
          <div class="event-message">${escapeHtml(error.metadata.message || '(no message)')}</div>
          <div class="event-meta">${escapeHtml(error.pathname || '-')} &bull; ${relativeTime(error.timestamp)} &bull; ${escapeHtml(error.id)}</div>
        </div>
      </summary>
        
      <p><a href="issue.html?id=${encodeURIComponent(error.id)}">Open issue detail</a></p>

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

function renderErrors() {
  const list = document.getElementById('errors-list');
  syncPanelState();

  const errors = getErrors().sort(
    (a, b) =>
      severityRank(b.metadata.severity) - severityRank(a.metadata.severity) ||
      new Date(b.timestamp) - new Date(a.timestamp)
  );

  renderHeader(errors);
  renderDeploymentDetail();

  if (errors.length === 0) {
    list.innerHTML = '<div class="empty">No errors recorded.</div>';
    return;
  }

  list.innerHTML = errors.map(renderErrorPanel).join('');
  trackPanelState();
}

async function update() {
  await updateEvents();
  renderErrors();
}

document.addEventListener('DOMContentLoaded', () => {
  populateDeploymentFilter((deploymentId) => {
    activeDeploymentId = deploymentId;
    renderErrors();
  });
  renderErrors();
  update();
  setInterval(update, ERRORS_UPDATE_INTERVAL * 1000);
});
