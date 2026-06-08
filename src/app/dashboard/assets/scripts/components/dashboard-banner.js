/**
 * Component banner that indicates overall system status.
 */
export class DashboardBanner extends HTMLElement {
  // Defaults to healthy until the page feeds it real uptime data.
  set healthy(value) {
    this._healthy = value !== false;
    this.render();
  }

  connectedCallback() {
    this.render();
  }

  render() {
    const healthy = this._healthy !== false;
    const stateClass = healthy ? "is-live" : "is-down";
    const label = healthy ? "ONLINE" : "OFFLINE";
    const message = healthy ? "System Live" : "System Down";
    this.innerHTML = `
      <section class="dashboard-surface deployment-banner-strip ${stateClass}">
        <div class="status-indicator-block">
          <span class="status-indicator-dot"></span>
          <strong class="status-indicator-label">${label}</strong>
        </div>
        <div class="disruption-announcement">${message}</div>
      </section>
    `;
  }
}

customElements.define("dashboard-banner", DashboardBanner);
