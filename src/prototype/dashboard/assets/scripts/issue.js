/**
 * Issue-detail rendering logic.
 *
 * Reads ?id=evt_XXX from the URL, looks up the matching event via
 * window.WatchTowerData, and populates the page sections: header banner,
 * primary detail (message/comment), context block, deployment block, and
 * a list of related signals (same pathname + deployment, within 30 min).
 */

/**
 * Format an ISO timestamp as a short relative string like "3m ago".
 * @param {string} iso
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
 * Escape user-supplied text before inserting into innerHTML.
 * @param {*} value
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
 * Map an event onto a banner level so error severity / low ratings get
 * visually flagged consistently with the dashboard banner.
 * @param {Object} event
 * @returns {'ok'|'degraded'|'down'}
 */
function bannerLevel(event) {
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
 * One-line summary of an event, used in the Related Signals feed.
 * @param {Object} e
 */
function summarizeEvent(e) {
  switch (e.event_type) {
    case 'error':
      return `[${e.metadata.severity}] ${e.metadata.message}`;
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
 * Render a key/value row inside a .kv-list.
 * @param {string} key
 * @param {string} value
 * @param {{mono?: boolean}} [opts]
 */
function kvRow(key, value, opts = {}) {
  const cls = opts.mono ? 'dep-val mono' : 'dep-val';
  return `<li class="kv-row"><span class="dep-key">${escapeHtml(key)}</span><span class="${cls}">${escapeHtml(value)}</span></li>`;
}

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

document.addEventListener('DOMContentLoaded', async () => {
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
