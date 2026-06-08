/**
 * Error detail card. Displays when a specific error is clicked
 */
export class ErrorDetailModal extends HTMLElement {
  connectedCallback() {
    this.render();
    this.modal = this.querySelector("#error-detail-modal");
    this.querySelector("#modal-close-btn")?.addEventListener("click", () =>
      this.close(),
    );
    this.modal?.addEventListener("click", (event) => {
      if (event.target === this.modal) this.close();
    });
  }

  render() {
    this.innerHTML = `
      <div id="error-detail-modal" class="error-detail-modal">
        <div class="dashboard-surface workspace-panel-card error-detail-card">
          <header class="workspace-panel-header error-detail-header">
            <h2 class="dashboard-title workspace-panel-title error-detail-title modal-title-row">
              <span id="modal-severity-badge"></span>
              <span id="modal-error-title">Error Logs Detail</span>
            </h2>
            <button id="modal-close-btn" class="modal-close-btn">&times;</button>
          </header>

          <div class="error-detail-body">
            <div>
              <span class="modal-field-label">Error Message</span>
              <div id="modal-error-message" class="modal-error-message"></div>
            </div>

            <div class="modal-detail-grid">
              <div>
                <span class="modal-field-label">Target Path</span>
                <span id="modal-error-path" class="modal-error-path"></span>
              </div>
              <div>
                <span class="modal-field-label">Timestamp</span>
                <span id="modal-error-time" class="modal-error-time"></span>
              </div>
            </div>

            <div id="modal-deployment-info-block" class="modal-deployment-info">
              <span class="modal-field-label">Triggered Deployment Scope</span>
              <div id="modal-deployment-badges" class="modal-deployment-badges"></div>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  open(error) {
    if (!error || !this.modal) return;

    const severityBadge = this.querySelector("#modal-severity-badge");
    const title = this.querySelector("#modal-error-title");
    const message = this.querySelector("#modal-error-message");
    const path = this.querySelector("#modal-error-path");
    const time = this.querySelector("#modal-error-time");
    const badges = this.querySelector("#modal-deployment-badges");
    const severity = error.metadata?.severity?.toUpperCase() || "CRITICAL";

    severityBadge.textContent = severity;
    severityBadge.className = `severity-badge ${
      severity === "WARNING" ? "is-warning" : "is-critical"
    }`;

    title.textContent = `Event ID: ${error.id}`;
    message.textContent =
      error.metadata?.message || "No extended message trace provided.";
    path.textContent = error.pathname || "-";
    time.textContent = error.timestamp
      ? new Date(error.timestamp).toLocaleString()
      : "Recent";

    this.renderDeploymentBadges(badges, error.deployment);
    this.modal.classList.add("is-open");
  }

  close() {
    this.modal?.classList.remove("is-open");
  }

  renderDeploymentBadges(container, deployment) {
    container.replaceChildren();

    if (!deployment) {
      const empty = document.createElement("span");
      empty.className = "deployment-empty-text";
      empty.textContent = "No specific deployment tag attached";
      container.append(empty);
      return;
    }

    const rows = [
      ["ID", deployment.id],
      ["Version", deployment.version || "unknown"],
      ["Hash", deployment.commit_hash || "HEAD"],
    ];

    for (const [label, value] of rows) {
      const badge = document.createElement("span");
      badge.className = "deployment-badge";
      badge.append(`${label}: `);

      const strong = document.createElement("b");
      strong.textContent = value;
      badge.append(strong);
      container.append(badge);
    }
  }
}

customElements.define("error-detail-modal", ErrorDetailModal);
