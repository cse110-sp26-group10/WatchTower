export class HomeSummaryMetrics extends HTMLElement {
  set metrics(value) {
    this._metrics = value || {};
    this.render();
  }

  connectedCallback() {
    this.render();
  }

  render() {
    const metrics = this._metrics || {};
    const pageLoadValue = metrics.pageLoads ? `${metrics.avgLatency}ms` : '-';

    this.innerHTML = `
      <section class="metrics-summary-grid">
        <div class="metric-card-tile danger-state">
          <span class="metric-card-title">Errors</span>
          <span class="metric-card-value">${metrics.errors || 0}</span>
        </div>
        <div class="metric-card-tile">
          <span class="metric-card-title">Avg Load Time</span>
          <span class="metric-card-value">${pageLoadValue}</span>
        </div>
        <div class="metric-card-tile">
          <span class="metric-card-title">Page Loads</span>
          <span class="metric-card-value">${metrics.pageLoads || 0}</span>
        </div>
        <div class="metric-card-tile">
          <span class="metric-card-title">Clicks</span>
          <span class="metric-card-value">${metrics.clicks || 0}</span>
        </div>
      </section>
    `;
  }
}

customElements.define('home-summary-metrics', HomeSummaryMetrics);
