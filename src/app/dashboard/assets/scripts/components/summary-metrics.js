/**
 * Component that summarizes errors, load time, page loads, and clicks
 */
export class SummaryMetrics extends HTMLElement {
  set items(value) {
    this._items = Array.isArray(value) ? value : [];
    this.render();
  }

  set metrics(value) {
    this.items = [
      { label: "Errors", value: value?.errors || 0, state: "danger" },
      {
        label: "Avg Load Time",
        value: value?.pageLoads ? `${value.avgLatency}ms` : "-",
      },
      { label: "Page Loads", value: value?.pageLoads || 0 },
      { label: "Clicks", value: value?.clicks || 0 },
    ];
  }

  connectedCallback() {
    this.render();
  }

  render() {
    const items = this._items || [];
    this.replaceChildren();

    const grid = document.createElement("section");
    grid.className = "metrics-summary-grid";

    for (const item of items) {
      const card = document.createElement("div");
      const classes = ["metric-card-tile"];
      if (item.state === "danger") classes.push("danger-state");
      if (/errors?/i.test(item.label)) classes.push("error-metric");
      card.className = classes.join(" ");

      const title = document.createElement("span");
      title.className = "metric-card-title";
      title.textContent = item.label;

      const value = document.createElement("span");
      value.className = "metric-card-value";
      if (item.state === "warning") value.style.color = "var(--wt-warning)";
      value.textContent = item.value;

      card.append(title, value);
      grid.append(card);
    }

    this.append(grid);
  }
}

customElements.define("summary-metrics", SummaryMetrics);
