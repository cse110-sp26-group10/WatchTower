/**
 * Component banner that indicates overall system status.
 */
export class DashboardBanner extends HTMLElement {
  connectedCallback() {
    this.render();
  }

  render() {
    this.innerHTML = `
      <section class="deployment-banner-strip">
        <div class="status-indicator-block">
          <span class="status-indicator-dot online"></span>
          <strong class="status-indicator-label">ONLINE</strong>
        </div>
        <div class="disruption-announcement">System Live</div>
      </section>
    `;
  }
}

customElements.define("dashboard-banner", DashboardBanner);
