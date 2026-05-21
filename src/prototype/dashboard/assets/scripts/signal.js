/**
 * Issue-detail rendering logic.
 *
 * Reads ?id=evt_XXX from the URL, looks up the matching event via
 * window.WatchTowerData, and populates the page sections: header banner,
 * primary detail (message/comment), context block, deployment block, and
 * a list of related signals (same pathname + deployment, within 30 min).
 */

import {
  bannerLevel,
  relativeTime,
  escapeHtml,
  kvRow,
  summarizeEvent
} from './helpers.js';

/**
 * Populate the issue header (banner, type pill, time, path).
 * @param {Object} event
 */
function renderHeader(event) {
  const banner = document.getElementById('issue-banner');
  banner.dataset.level = bannerLevel(event);

  let title = 'Signal';
  if (event.event_type === 'error') {
    title = `${event.metadata.severity.charAt(0).toUpperCase() + event.metadata.severity.slice(1)} error`;
  } else if (event.event_type === 'survey') {
    title = `User feedback (${event.metadata.rating}/5)`;
  } else if (event.event_type === 'page_load') {
    title = 'Page load';
  } else if (event.event_type === 'click') {
    title = 'Click';
  }
  banner.textContent = title;

  document.getElementById('issue-type').textContent = event.event_type;
  document.getElementById('issue-type').className = `type-pill type-${event.event_type}`;
  document.getElementById('issue-when').textContent =
    `${relativeTime(event.timestamp)} • ${new Date(event.timestamp).toLocaleString()}`;
  document.getElementById('issue-path').textContent = event.pathname || '—';
  document.getElementById('issue-id').textContent = event.id;
}

/**
 * Render the primary body — varies by event type.
 * @param {Object} event
 */
function renderPrimary(event) {
  const box = document.getElementById('issue-primary-body');
  if (event.event_type === 'error') {
    box.innerHTML = `
      <div class="issue-headline">${escapeHtml(event.metadata.message || '(no message)')}</div>
      <div class="event-meta">severity: <strong>${escapeHtml(event.metadata.severity)}</strong></div>
    `;
  } else if (event.event_type === 'survey') {
    const r = Number(event.metadata.rating || 0);
    const stars = '★★★★★'.slice(0, r) + '☆☆☆☆☆'.slice(0, 5 - r);
    box.innerHTML = `
      <div class="issue-headline">${stars} <span class="event-meta">(${r}/5)</span></div>
      <div class="event-message">${escapeHtml(event.metadata.comment || '(no comment)')}</div>
    `;
  } else {
    box.innerHTML = `<div class="event-meta">No primary detail for this event type.</div>`;
  }
}

/**
 * Render the Context kv-list (path, full url, ip, created_at).
 * @param {Object} event
 */
function renderContext(event) {
  const list = document.getElementById('context-list');
  list.innerHTML = [
    kvRow('pathname', event.pathname || '—', { mono: true }),
    kvRow('page url', event.metadata.pageUrl || '—', { mono: true }),
    kvRow('ip', event.ip || '—', { mono: true }),
    kvRow('observed', `${relativeTime(event.timestamp)} (${new Date(event.timestamp).toLocaleString()})`),
    kvRow('received', `${relativeTime(event.created_at)} (${new Date(event.created_at).toLocaleString()})`),
  ].join('');
}

/**
 * Render the Deployment kv-list. Pulls extra fields (author, deployed_at)
 * from the deployments catalog since events only carry id/version/commit.
 * @param {Object} event
 */
function renderDeployment(event) {
  const list = document.getElementById('deployment-list');
  const dep = event.deployment;
  if (!dep) {
    list.innerHTML = '<li class="empty">No deployment attached.</li>';
    return;
  }
  const full = window.WatchTowerData.getDeployment(dep.id);
  const rows = [
    kvRow('id', dep.id, { mono: true }),
    kvRow('version', dep.version, { mono: true }),
    kvRow('commit', dep.commit_hash, { mono: true }),
  ];
  if (full) {
    rows.push(kvRow('author', full.author));
    rows.push(kvRow('deployed', `${relativeTime(full.deployed_at)} (${new Date(full.deployed_at).toLocaleString()})`));
  }
  list.innerHTML = rows.join('');
}

/**
 * Render the related-signals feed.
 * @param {Object} event
 */
function renderRelated(event) {
  const list = document.getElementById('related-list');
  const related = window.WatchTowerData.getRelatedEvents(event);
  if (related.length === 0) {
    list.innerHTML = '<li class="empty">No related signals in window.</li>';
    return;
  }
  list.innerHTML = related
    .map(
      (e) => `
        <li class="activity-row">
          <a class="event-link activity-link" href="issue.html?id=${encodeURIComponent(e.id)}">
            <span class="type-pill type-${escapeHtml(e.event_type)}">${escapeHtml(e.event_type)}</span>
            <span class="activity-text">${escapeHtml(summarizeEvent(e))}</span>
            <span class="activity-time">${relativeTime(e.timestamp)}</span>
          </a>
        </li>`
    )
    .join('');
}

/**
 * Render the "not found" empty state when the id is missing or invalid.
 */
function renderNotFound(id) {
  const banner = document.getElementById('issue-banner');
  banner.textContent = 'Issue not found';
  banner.dataset.level = 'down';
  document.getElementById('issue-primary-body').innerHTML =
    `<div class="event-meta">No event matches id <code>${escapeHtml(id || '(none)')}</code>.</div>`;
}


let topbar = document.querySelector('.topbar-meta');
if (topbar && document.getElementById('issue-banner')) {
  topbar.innerHTML = `<a href="index.html" class="back-link">&larr; back to dashboard</a>`;
}

document.addEventListener('DOMContentLoaded', async () => {
  if (!document.getElementById('issue-banner')) return;

  await window.WatchTowerData.updateEvents();
  const id = new URLSearchParams(window.location.search).get('id');
  const event = id ? window.WatchTowerData.getEvent(id) : null;

  if (!event) {
    renderNotFound(id);
    return;
  }

  renderHeader(event);
  renderPrimary(event);
  renderContext(event);
  renderDeployment(event);
  renderRelated(event);
});
