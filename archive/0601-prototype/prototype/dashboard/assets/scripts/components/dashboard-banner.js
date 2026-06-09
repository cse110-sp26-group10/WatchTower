export class DashboardBanner extends HTMLElement {
  connectedCallback() {
    this.render();
  }

  render() {
    this.innerHTML = `
      <section class="deployment-banner-strip">
        <div class="status-indicator-block">
          <span class="status-indicator-dot online"></span>
          <strong style="color: var(--wt-success); font-size: 13px; letter-spacing: 0.05em;">ONLINE</strong>
        </div>
        <div class="disruption-announcement">System Live</div>
      </section>
    `;
  }
}

customElements.define("dashboard-banner", DashboardBanner);
