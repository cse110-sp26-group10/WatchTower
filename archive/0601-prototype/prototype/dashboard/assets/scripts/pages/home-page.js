import { deploymentScope } from "../core/deployment-scope.js";
import { getEventById, getHomeDashboardData } from "../core/dashboard-data.js";
import "../components/activity-list.js";
import "../components/dashboard-banner.js";
import "../components/dashboard-styles.js";
import "../components/error-detail-modal.js";
import "../components/error-list.js";
import "../components/panel-section.js";
import "../components/path-count-list.js";
import "../components/summary-metrics.js";
import "../components/uptime-card.js";

export class HomePage extends HTMLElement {
  constructor() {
    super();
    this.handleErrorSelected = (event) => {
      this.openErrorModal(event.detail?.errorId);
    };
  }

  connectedCallback() {
    this.render();
    this.cacheElements();

    if (deploymentScope && typeof deploymentScope.subscribe === "function") {
      this.unsubscribe = deploymentScope.subscribe(() => {
        this.updatePageData();
      });
    } else {
      this.updatePageData();
    }

    this.addEventListener("error-selected", this.handleErrorSelected);
  }

  disconnectedCallback() {
    this.unsubscribe?.();
    this.removeEventListener("error-selected", this.handleErrorSelected);
  }

  render() {
    this.className = "dashboard-viewport";
    this.innerHTML = `
      <dashboard-banner></dashboard-banner>
      <summary-metrics></summary-metrics>

      <section class="dashboard-double-row">
        <panel-section heading="Errors" subheading="click an error row for full details">
          <error-list id="home-errors"></error-list>
        </panel-section>

        <uptime-card id="home-uptime"></uptime-card>
      </section>

      <section class="dashboard-double-row" id="section-activity-top" style="margin-bottom: 20px;">
        <panel-section heading="Page Loads" subheading="grouped by path">
          <path-count-list id="home-load-paths" empty-message="No page loads tracked"></path-count-list>
        </panel-section>

        <panel-section heading="Clicks" subheading="grouped by path">
          <path-count-list id="home-click-paths" empty-message="No interaction clicks tracked"></path-count-list>
        </panel-section>
      </section>

      <panel-section id="section-activity-bottom" heading="Recent Activity" subheading="all signal types - most recent first">
        <activity-list id="home-activity"></activity-list>
      </panel-section>

      <error-detail-modal id="home-error-modal"></error-detail-modal>
      <dashboard-styles></dashboard-styles>
    `;
  }

  cacheElements() {
    this.metrics = this.querySelector("summary-metrics");
    this.uptimeCard = this.querySelector("#home-uptime");
    this.errorList = this.querySelector("#home-errors");
    this.loadPaths = this.querySelector("#home-load-paths");
    this.clickPaths = this.querySelector("#home-click-paths");
    this.activityList = this.querySelector("#home-activity");
    this.errorModal = this.querySelector("#home-error-modal");
  }

  updatePageData() {
    const data = getHomeDashboardData();

    this.metrics.items = data.metrics;
    this.uptimeCard.uptime = data.uptime;
    this.errorList.errors = data.errors;
    this.loadPaths.pathCounts = data.loadPaths;
    this.clickPaths.pathCounts = data.clickPaths;
    this.activityList.events = data.events;
  }

  openErrorModal(errorId) {
    this.errorModal?.open(getEventById(errorId));
  }
}

customElements.define("home-page", HomePage);
