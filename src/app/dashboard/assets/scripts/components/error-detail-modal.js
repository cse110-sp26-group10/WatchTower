export class ErrorDetailModal extends HTMLElement {
  connectedCallback() {
    this.render();
    this.modal = this.querySelector('#error-detail-modal');
    this.querySelector('#modal-close-btn')?.addEventListener('click', () => this.close());
    this.modal?.addEventListener('click', (event) => {
      if (event.target === this.modal) this.close();
    });
  }

  render() {
    this.innerHTML = `
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
              <div id="modal-error-message" style="background-color: var(--wt-surface-2); color: var(--wt-text); padding: 12px; border-radius: 0; font-family: monospace; font-size: 13px; border: 1px solid var(--wt-border); white-space: pre-wrap; word-break: break-all;"></div>
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
    `;
  }

  open(error) {
    if (!error || !this.modal) return;

    const severityBadge = this.querySelector('#modal-severity-badge');
    const title = this.querySelector('#modal-error-title');
    const message = this.querySelector('#modal-error-message');
    const path = this.querySelector('#modal-error-path');
    const time = this.querySelector('#modal-error-time');
    const badges = this.querySelector('#modal-deployment-badges');
    const severity = error.metadata?.severity?.toUpperCase() || 'CRITICAL';

    severityBadge.textContent = severity;
    severityBadge.style.fontSize = '10px';
    severityBadge.style.fontFamily = 'monospace';
    severityBadge.style.padding = '2px 6px';
    severityBadge.style.borderRadius = 'var(--wt-radius-sm)';
    severityBadge.style.fontWeight = '700';
    severityBadge.style.backgroundColor = severity === 'WARNING' ? 'var(--color-warn-bg)' : 'var(--color-crit-bg)';
    severityBadge.style.color = severity === 'WARNING' ? 'var(--color-warn-text)' : 'var(--color-crit-text)';

    title.textContent = `Event ID: ${error.id}`;
    message.textContent = error.metadata?.message || 'No extended message trace provided.';
    path.textContent = error.pathname || '-';
    time.textContent = error.timestamp ? new Date(error.timestamp).toLocaleString() : 'Recent';

    this.renderDeploymentBadges(badges, error.deployment);
    this.modal.style.display = 'flex';
  }

  close() {
    if (this.modal) this.modal.style.display = 'none';
  }

  renderDeploymentBadges(container, deployment) {
    container.replaceChildren();

    if (!deployment) {
      const empty = document.createElement('span');
      empty.style.color = 'var(--wt-text-3)';
      empty.style.fontStyle = 'italic';
      empty.textContent = 'No specific deployment tag attached';
      container.append(empty);
      return;
    }

    const rows = [
      ['ID', deployment.id],
      ['Version', deployment.version || 'unknown'],
      ['Hash', deployment.commit_hash || 'HEAD'],
    ];

    for (const [label, value] of rows) {
      const badge = document.createElement('span');
      badge.style.background = 'var(--wt-surface-2)';
      badge.style.padding = '4px 8px';
      badge.style.borderRadius = 'var(--wt-radius-sm)';
      badge.style.border = '1px solid var(--wt-border)';
      badge.append(`${label}: `);

      const strong = document.createElement('b');
      strong.textContent = value;
      badge.append(strong);
      container.append(badge);
    }
  }
}

customElements.define('error-detail-modal', ErrorDetailModal);
