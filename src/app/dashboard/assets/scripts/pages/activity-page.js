import { projectScope } from "../core/project-scope.js";
import { deploymentScope } from "../core/deployment-scope.js";
import { getActivityDashboardData } from "../core/dashboard-data.js";
import "../components/activity-list.js";
import "../components/dashboard-styles.js";
import "../components/panel-section.js";
import "../components/path-count-list.js";
import "../components/summary-metrics.js";

export class ActivityPage extends HTMLElement {
  set route(value) {
    this._route = value;
  }

  connectedCallback() {
    this.render();
    this.cacheElements();
    if (projectScope && typeof projectScope.subscribe === "function") {
      this.projectUnsubscribe = projectScope.subscribe(() =>
        this.updatePageData(),
      );
    }
    if (deploymentScope && typeof deploymentScope.subscribe === "function") {
      this.deploymentUnsubscribe = deploymentScope.subscribe(() =>
        this.updatePageData(),
      );
    }
    this.updatePageData();
  }

  disconnectedCallback() {
    this.projectUnsubscribe?.();
    this.deploymentUnsubscribe?.();
  }

  render() {
    this.className = "dashboard-viewport";
    this.innerHTML = `
      <summary-metrics></summary-metrics>

      <section class="dashboard-double-row" style="margin-bottom: 20px;">
        <panel-section heading="Page Loads" subheading="grouped by path">
          <path-count-list id="activity-load-paths" empty-message="No page loads tracked"></path-count-list>
        </panel-section>

        <panel-section heading="Clicks" subheading="grouped by path">
          <path-count-list id="activity-click-paths" empty-message="No interaction clicks tracked"></path-count-list>
        </panel-section>
      </section>

      <panel-section heading="Recent Activity" subheading="all signal types - most recent first">
        <activity-list id="activity-events"></activity-list>
      </panel-section>

      <dashboard-styles></dashboard-styles>
    `;
  }

  cacheElements() {
    this.metrics = this.querySelector("summary-metrics");
    this.loadPaths = this.querySelector("#activity-load-paths");
    this.clickPaths = this.querySelector("#activity-click-paths");
    this.activityList = this.querySelector("#activity-events");
  }

  updatePageData() {
    const data = getActivityDashboardData();
    this.metrics.items = data.metrics;
    this.loadPaths.pathCounts = data.loadPaths;
    this.clickPaths.pathCounts = data.clickPaths;
    this.activityList.events = data.events;
  }
}

customElements.define("activity-page", ActivityPage);
