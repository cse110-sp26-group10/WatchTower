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
      {
        label: "Errors",
        value: value?.errors || 0,
        state: value?.errors ? "danger" : "success",
      },
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
      const classes = ["dashboard-surface", "metric-card-tile"];
      if (item.state === "danger") classes.push("danger-state");
      if (item.state === "success") classes.push("success-state");
      const isError = /errors?/i.test(item.label);
      // Headline cards tint the whole card: the errors tiles, plus any card that
      // opts in with `fill` (e.g. Avg Load Time). Everything else just colors the
      // number. Red whole-card stays reserved for the errors tiles.
      const fillCard = isError || item.fill;
      if (fillCard && item.state === "success") classes.push("success-metric");
      if (isError && item.state === "danger") classes.push("error-metric");
      card.className = classes.join(" ");

      // Errors tile opens the errors page; the rest open the activity page.
      const isWarning = /warnings?/i.test(item.label);
      const targetHash = (isError || isWarning) ? "#/errors" : "#/activity";
      card.setAttribute("role", "link");
      card.tabIndex = 0;
      const navigate = () => {
        window.location.hash = targetHash;
      };
      card.addEventListener("click", navigate);
      card.addEventListener("keydown", (event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          navigate();
        }
      });

      const title = document.createElement("span");
      title.className = "metric-card-title";
      title.textContent = item.label;

      const value = document.createElement("span");
      value.className = "metric-card-value";
      if (item.state === "warning") card.classList.add("warning-state");
      value.textContent = item.value;

      card.append(title, value);
      grid.append(card);
    }

    this.append(grid);
  }
}

customElements.define("summary-metrics", SummaryMetrics);
