import { dataStore } from '../core/data-store.js';
import { deploymentScope } from '../core/deployment-scope.js';

export class HomePage extends HTMLElement {
  connectedCallback() {
    this.render();

    if (deploymentScope && typeof deploymentScope.subscribe === 'function') {
      this.unsubscribe = deploymentScope.subscribe(() => {
        this.updateDashboardData();
      });
    }

    this.updateDashboardData();
    this.setupModalListeners();
  }

  disconnectedCallback() {
    this.unsubscribe?.();
  }

  render() {
    this.className = "dashboard-viewport";
    this.innerHTML = `
      <section class="deployment-banner-strip">
        <div class="status-indicator-block">
          <span class="status-indicator-dot online"></span>
          <strong style="color: var(--wt-success); font-size: 13px; letter-spacing: 0.05em;">ONLINE</strong>
        </div>
        <div class="disruption-announcement">System Live</div>
      </section>

      <section class="metrics-summary-grid">
        <div class="metric-card-tile danger-state">
          <span class="metric-card-title">Errors</span>
          <span class="metric-card-value" id="summary-errors">0</span>
        </div>
        <div class="metric-card-tile">
          <span class="metric-card-title">Avg Load Time</span>
          <span class="metric-card-value" id="summary-page-loads">—</span>
        </div>
        <div class="metric-card-tile">
          <span class="metric-card-title">Page Loads</span>
          <span class="metric-card-value" id="summary-load-count">0</span>
        </div>
        <div class="metric-card-tile">
          <span class="metric-card-title">Clicks</span>
          <span class="metric-card-value" id="summary-clicks">0</span>
        </div>
      </section>

      <section class="dashboard-double-row">
        <article class="workspace-panel-card">
          <header class="workspace-panel-header">
            <h2 class="workspace-panel-title">Errors</h2>
            <span style="font-size: 11px; color: var(--wt-text-3);">click an error row for full details</span>
          </header>
          <div class="data-list-container" id="errors-list"></div>
        </article>

        <article class="workspace-panel-card">
          <header class="workspace-panel-header">
            <h2 class="workspace-panel-title">User Feedback</h2>
            <span style="font-size: 11px; color: var(--wt-text-3);">most recent first</span>
          </header>
          <div class="data-list-container" id="feedback-list"></div>
        </article>
      </section>

      <section class="dashboard-double-row" id="section-activity-top" style="margin-bottom: 20px;">
        <div class="workspace-panel-card">
          <header class="workspace-panel-header">
            <h2 class="workspace-panel-title">Page Loads</h2>
            <span style="font-size: 11px; color: var(--wt-text-3);">grouped by path</span>
          </header>
          <div class="data-list-container" id="page-loads-list"></div>
        </div>

        <div class="workspace-panel-card">
          <header class="workspace-panel-header">
            <h2 class="workspace-panel-title">Clicks</h2>
            <span style="font-size: 11px; color: var(--wt-text-3);">grouped by path</span>
          </header>
          <div class="data-list-container" id="clicks-list"></div>
        </div>
      </section>

      <section class="workspace-panel-card" id="section-activity-bottom">
        <header class="workspace-panel-header">
          <h2 class="workspace-panel-title">Recent Activity</h2>
          <span style="font-size: 11px; color: var(--wt-text-3);">all signal types — most recent first</span>
        </header>
        <div class="data-list-container" id="activity-list" style="display: flex; flex-direction: column; gap: 8px;"></div>
      </section>

      <div id="error-detail-modal" style="display: none; position: fixed; z-index: 10000; left: 0; top: 0; width: 100%; height: 100%; background-color: rgba(0,0,0,0.6); backdrop-filter: blur(3px); align-items: center; justify-content: center;">
        <div class="workspace-panel-card" style="width: 100%; max-width: 600px; background-color: var(--wt-surface); border: 1px solid var(--wt-border); box-shadow: 0 10px 25px -5px rgba(0,0,0,0.35); position: relative; animation: modalSlideUp 0.2s ease-out;">
          <header class="workspace-panel-header" style="border-bottom: 1px solid var(--wt-border); padding-bottom: 12px; margin-bottom: 4px;">
            <h2 class="workspace-panel-title" style="font-size: 16px; display: flex; align-items: center; gap: 8px;">
              <span id="modal-severity-badge"></span>
              <span id="modal-error-title">Error Logs Detail</span>
            </h2>
            <button id="modal-close-btn" style="background: none; border: none; color: var(--wt-text-3); font-size: 20px; cursor: pointer; padding: 0 4px; line-height: 1;">&times;</button>
          </header>
          
          <div style="display: flex; flex-direction: column; gap: 14px; padding-top: 8px;">
            <div>
              <span style="font-size: 11px; text-transform: uppercase; color: var(--wt-text-3); font-weight: 600; display: block; margin-bottom: 4px;">Error Message</span>
              <div id="modal-error-message" style="background-color: var(--wt-surface-2); color: var(--wt-text); padding: 12px; border-radius: var(--wt-radius-md); font-family: monospace; font-size: 13px; border: 1px solid var(--wt-border); white-space: pre-wrap; word-break: break-all;"></div>
            </div>

            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px;">
              <div>
                <span style="font-size: 11px; text-transform: uppercase; color: var(--wt-text-3); font-weight: 600; display: block; margin-bottom: 2px;">Target Path</span>
                <span id="modal-error-path" style="font-family: monospace; font-weight: 600; color: var(--wt-text);"></span>
              </div>
              <div>
                <span style="font-size: 11px; text-transform: uppercase; color: var(--wt-text-3); font-weight: 600; display: block; margin-bottom: 2px;">Timestamp</span>
                <span id="modal-error-time" style="color: var(--wt-text-2);"></span>
              </div>
            </div>

            <div id="modal-deployment-info-block" style="border-top: 1px solid var(--wt-border); padding-top: 12px; margin-top: 4px;">
              <span style="font-size: 11px; text-transform: uppercase; color: var(--wt-text-3); font-weight: 600; display: block; margin-bottom: 6px;">Triggered Deployment Scope</span>
              <div id="modal-deployment-badges" style="display: flex; flex-wrap: wrap; gap: 8px; font-family: monospace; font-size: 11px;"></div>
            </div>
          </div>
        </div>
      </div>

      <style>
        @keyframes modalSlideUp {
          from { transform: translateY(15px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
        .error-click-target-btn {
          width: 100%;
          text-align: left;
          background: var(--wt-surface-2);
          border: 1px solid transparent;
          cursor: pointer;
          font-family: inherit;
        }
        .error-click-target-btn:hover {
          background-color: var(--wt-border) !important;
          border-color: var(--wt-text-3);
        }
        .error-click-target-btn:focus-visible {
          outline: 2px solid var(--wt-info);
        }
      </style>
    `;
  }

  updateDashboardData() {
    const unfilteredEvents = dataStore.getEvents() || [];
    
    let currentId = 'all';
    if (deploymentScope) {
      if (deploymentScope.id) {
        currentId = deploymentScope.id;
      } else if (deploymentScope.deployment && deploymentScope.deployment.id) {
        currentId = deploymentScope.deployment.id;
      }
    }

    const events = (!currentId || currentId === 'all')
      ? unfilteredEvents
      : unfilteredEvents.filter(e => e.deployment && e.deployment.id === currentId);
    
    const errors = events.filter(e => e.event_type === 'error');
    const pageLoads = events.filter(e => e.event_type === 'page_load');
    const clicks = events.filter(e => e.event_type === 'click');
    const surveys = events.filter(e => e.event_type === 'survey');

    const avgLatency = pageLoads.length 
      ? Math.round(pageLoads.reduce((acc, curr) => acc + (curr.metadata?.load_time || 0), 0) / pageLoads.length)
      : 0;

    // Summary counters
    const errEl = this.querySelector('#summary-errors');
    if (errEl) errEl.textContent = errors.length;

    const latEl = this.querySelector('#summary-page-loads');
    if (latEl) latEl.textContent = pageLoads.length ? `${avgLatency}ms` : '—';

    const loadEl = this.querySelector('#summary-load-count');
    if (loadEl) loadEl.textContent = pageLoads.length;

    const clickEl = this.querySelector('#summary-clicks');
    if (clickEl) clickEl.textContent = clicks.length;

    // --- RENDER ERRORS LIST AS CLICKABLE BUTTONS ---
    const errorsList = this.querySelector('#errors-list');
    if (errorsList) {
      errorsList.innerHTML = errors.length === 0
        ? `<div style="padding: 12px; text-align: center; color: var(--wt-text-3);">No active system errors found.</div>`
        : errors.map(err => `
            <button class="interactive-data-row error-click-target-btn" data-error-id="${err.id}">
              <div class="row-left-group">
                <span style="color: var(--wt-danger); font-weight: 700; font-family: monospace; font-size: 11px;">
                  [${err.metadata?.severity?.toUpperCase() || 'CRITICAL'}]
                </span>
                <div class="row-details-wrapper">
                  <span class="row-primary-text">${err.metadata?.message || 'Error Event'}</span>
                  <span class="row-secondary-text">Path: ${err.pathname}</span>
                </div>
              </div>
              <span class="row-right-timestamp">2m ago</span>
            </button>
          `).join('');
    }

    // Feedback list
    const feedbackList = this.querySelector('#feedback-list');
    if (feedbackList) {
      feedbackList.innerHTML = surveys.length === 0
        ? `<div style="padding: 12px; text-align: center; color: var(--wt-text-3);">No user feedback entries.</div>`
        : surveys.map(surv => `
            <div class="interactive-data-row">
              <div class="row-left-group">
                <div class="row-details-wrapper">
                  <span style="color: var(--wt-warning); font-weight: 700; font-size: 12px; letter-spacing: 2px;">${'★'.repeat(surv.metadata?.rating || 0)}</span>
                  <span class="row-primary-text" style="font-style: italic; font-weight: 500;">"${surv.metadata?.comment || 'No text comment provided.'}"</span>
                </div>
              </div>
            </div>
          `).join('');
    }

    // Activity breakdown aggregations
    const groupPaths = (acc, item) => {
      acc[item.pathname] = (acc[item.pathname] || 0) + 1;
      return acc;
    };
    const loadPaths = pageLoads.reduce(groupPaths, {});
    const clickPaths = clicks.reduce(groupPaths, {});

    const pageLoadsList = this.querySelector('#page-loads-list');
    if (pageLoadsList) {
      pageLoadsList.innerHTML = Object.entries(loadPaths).map(([path, val]) => `
        <div class="interactive-data-row" style="padding: 8px 12px;">
          <span class="row-primary-text" style="font-family: monospace; font-size: 12px;">${path}</span>
          <span style="background: var(--wt-surface); color: var(--wt-text); font-weight: 700; font-size: 11px; padding: 2px 6px; border-radius: var(--wt-radius-sm); border: 1px solid var(--wt-border);">${val}</span>
        </div>
      `).join('') || '<div style="color: var(--wt-text-3); font-size: 12px;">No page loads tracked</div>';
    }

    const clicksList = this.querySelector('#clicks-list');
    if (clicksList) {
      clicksList.innerHTML = Object.entries(clickPaths).map(([path, val]) => `
        <div class="interactive-data-row" style="padding: 8px 12px;">
          <span class="row-primary-text" style="font-family: monospace; font-size: 12px;">${path}</span>
          <span style="background: var(--wt-surface); color: var(--wt-text); font-weight: 700; font-size: 11px; padding: 2px 6px; border-radius: var(--wt-radius-sm); border: 1px solid var(--wt-border);">${val}</span>
        </div>
      `).join('') || '<div style="color: var(--wt-text-3); font-size: 12px;">No interaction clicks tracked</div>';
    }

    const activityList = this.querySelector('#activity-list');
    if (activityList) {
      activityList.innerHTML = events.slice(0, 4).map(evt => {
        let typeColor = 'var(--wt-info)';
        let isErr = evt.event_type === 'error';
        if (isErr) typeColor = 'var(--wt-danger)';
        if (evt.event_type === 'page_load') typeColor = 'var(--wt-success)';
        if (evt.event_type === 'survey') typeColor = 'var(--wt-warning)';

        // If it's an error in the global activity tracker stream, also wrap it as a functional button
        if (isErr) {
          return `
            <button class="interactive-data-row error-click-target-btn" data-error-id="${evt.id}" style="padding: 8px 12px;">
              <div style="display: flex; align-items: center; gap: 8px; min-width: 0;">
                <span style="width: 6px; height: 6px; background-color: ${typeColor}; border-radius: 50%; flex-shrink: 0;"></span>
                <span class="row-primary-text" style="font-size: 12px;"><b style="color: ${typeColor};">ERROR</b>: ${evt.metadata?.message || evt.pathname}</span>
              </div>
            </button>
          `;
        }

        return `
          <div class="interactive-data-row" style="padding: 8px 12px;">
            <div style="display: flex; align-items: center; gap: 8px; min-width: 0;">
              <span style="width: 6px; height: 6px; background-color: ${typeColor}; border-radius: 50%; flex-shrink: 0;"></span>
              <span class="row-primary-text" style="font-size: 12px;"><b style="color: ${typeColor};">${evt.event_type.toUpperCase()}</b>: ${evt.pathname}</span>
            </div>
          </div>
        `;
      }).join('') || '<div style="color: var(--wt-text-3); font-size: 12px;">No recent activity logs stream</div>';
    }
  }

  setupModalListeners() {
    const modal = this.querySelector('#error-detail-modal');
    const closeBtn = this.querySelector('#modal-close-btn');
    if (!modal || !closeBtn) return;

    // Use event delegation to intercept clicks on any current or future error buttons
    this.addEventListener('click', (event) => {
      const btn = event.target.closest('.error-click-target-btn');
      if (!btn) return;

      const errorId = btn.getAttribute('data-error-id');
      const allEvents = dataStore.getEvents() || [];
      const errorData = allEvents.find(e => e.id === errorId);

      if (errorData) {
        this.openErrorModal(errorData, modal);
      }
    });

    // Close button click
    closeBtn.addEventListener('click', () => { modal.style.display = 'none'; });

    // Click outside modal content box to dismiss
    modal.addEventListener('click', (e) => {
      if (e.target === modal) modal.style.display = 'none';
    });
  }

  openErrorModal(err, modalElement) {
    const severityBadge = modalElement.querySelector('#modal-severity-badge');
    const title = modalElement.querySelector('#modal-error-title');
    const msg = modalElement.querySelector('#modal-error-message');
    const path = modalElement.querySelector('#modal-error-path');
    const time = modalElement.querySelector('#modal-error-time');
    const badges = modalElement.querySelector('#modal-deployment-badges');

    const severity = err.metadata?.severity?.toUpperCase() || 'CRITICAL';
    
    // Format UI styling fields
    severityBadge.textContent = severity;
    severityBadge.style = `
      font-size: 10px;
      font-family: monospace;
      padding: 2px 6px;
      border-radius: var(--wt-radius-sm);
      font-weight: 700;
      background-color: ${severity === 'WARNING' ? 'var(--color-warn-bg)' : 'var(--color-crit-bg)'};
      color: ${severity === 'WARNING' ? 'var(--color-warn-text)' : 'var(--color-crit-text)'};
    `;

    title.textContent = `Event ID: ${err.id}`;
    msg.textContent = err.metadata?.message || 'No extended message trace provided.';
    path.textContent = err.pathname;
    time.textContent = err.timestamp ? new Date(err.timestamp).toLocaleString() : 'Recent';

    // Populate metadata details if available
    if (err.deployment) {
      badges.innerHTML = `
        <span style="background: var(--wt-surface-2); padding: 4px 8px; border-radius: var(--wt-radius-sm); border: 1px solid var(--wt-border);">ID: <b>${err.deployment.id}</b></span>
        <span style="background: var(--wt-surface-2); padding: 4px 8px; border-radius: var(--wt-radius-sm); border: 1px solid var(--wt-border);">Version: <b>${err.deployment.version || 'unknown'}</b></span>
        <span style="background: var(--wt-surface-2); padding: 4px 8px; border-radius: var(--wt-radius-sm); border: 1px solid var(--wt-border);">Hash: <b>${err.deployment.commit_hash || 'HEAD'}</b></span>
      `;
    } else {
      badges.innerHTML = `<span style="color: var(--wt-text-3); font-style: italic;">No specific deployment tag attached</span>`;
    }

    // Unveil modal
    modalElement.style.display = 'flex';
  }
}

customElements.define('home-page', HomePage);