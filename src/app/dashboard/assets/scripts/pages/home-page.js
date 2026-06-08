import { projectScope } from "../core/project-scope.js";
import { deploymentScope } from "../core/deployment-scope.js";
import {
  getEventById,
  getHomeDashboardData,
  getActivityDashboardData,
} from "../core/dashboard-data.js";
import { dataStore } from "../core/data-store.js";
import "../components/activity-list.js";
import "../components/dashboard-banner.js";
import "../components/error-detail-modal.js";
import "../components/error-list.js";
import "../components/panel-section.js";
import "../components/path-count-list.js";
import "../components/summary-metrics.js";
import "../components/uptime-card.js";
import "../components/time-series-chart.js";

export class HomePage extends HTMLElement {
  constructor() {
    super();
    this.handleErrorSelected = (event) => {
      this.openErrorModal(event.detail?.errorId);
    };
    this.handleErrorResolve = (event) => {
      dataStore.resolveErrors(event.detail?.ids);
    };
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
    this.addEventListener("error-selected", this.handleErrorSelected);
    this.addEventListener("error-resolve", this.handleErrorResolve);
  }

  disconnectedCallback() {
    this.projectUnsubscribe?.();
    this.deploymentUnsubscribe?.();
    this.removeEventListener("error-selected", this.handleErrorSelected);
    this.removeEventListener("error-resolve", this.handleErrorResolve);
  }

  render() {
    this.className = "dashboard-viewport";
    this.innerHTML = `
      <dashboard-banner></dashboard-banner>
      
      <div class="home-top-overview-grid">
        <div class="home-metrics-stretch-wrapper">
          <summary-metrics></summary-metrics>
        </div>
        <div class="home-uptime-stretch-wrapper">
          <uptime-card id="home-uptime"></uptime-card>
        </div>
      </div>

      <section class="home-trends-row">
        <panel-section heading="Activity Over Time" subheading="All events bucketed by time">
          <time-series-chart id="home-activity-timeline" variant="bar" empty-message="No activity tracked"></time-series-chart>
        </panel-section>

        <panel-section heading="Avg Load Time Trend" subheading="Average latency over time">
          <time-series-chart id="home-activity-loadtrend" variant="line" unit="ms" empty-message="No page loads tracked"></time-series-chart>
        </panel-section>
      </section>

      <section class="home-breakdown-three-column-grid">
        <panel-section heading="Active System Errors" subheading="Click row for full trace">
          <div class="panel-scroll-container">
            <error-list id="home-errors"></error-list>
          </div>
        </panel-section>

        <panel-section heading="Page Loads" subheading="Grouped by path">
          <div class="panel-scroll-container">
            <path-count-list id="home-load-paths" empty-message="No page loads tracked"></path-count-list>
          </div>
        </panel-section>

        <panel-section heading="User Clicks" subheading="Grouped by path">
          <div class="panel-scroll-container">
            <path-count-list id="home-click-paths" empty-message="No interaction clicks tracked"></path-count-list>
          </div>
        </panel-section>
      </section>

      <panel-section id="section-activity-bottom" heading="Recent Signals Stream" subheading="All signal types - most recent first">
        <activity-list id="home-activity"></activity-list>
      </panel-section>

      <error-detail-modal id="home-error-modal"></error-detail-modal>

      <style>
        /* Top Row Master Split Grid Container */
        .home-top-overview-grid {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 1.25rem;
          margin-bottom: 1.25rem;
          align-items: stretch; /* Forces equal heights on the column wrapper boxes */
        }

        /* Wrappers to catch and equalize child block real estate */
        .home-metrics-stretch-wrapper,
        .home-uptime-stretch-wrapper {
          display: flex;
          flex-direction: column;
          align-self: stretch;
          min-height: 0;
        }

        /* Deep overrides to target the component root elements */
        .home-metrics-stretch-wrapper summary-metrics,
        .home-uptime-stretch-wrapper uptime-card {
          display: flex !important;
          flex-direction: column;
          width: 100%;
          height: 100% !important;
          flex: 1 1 auto;
        }

        /* Push internal metric layout elements to scale perfectly */
        .home-metrics-stretch-wrapper summary-metrics .metrics-summary-grid {
          display: grid !important;
          grid-template-columns: repeat(2, 1fr) !important;
          grid-template-rows: repeat(2, 1fr) !important;
          gap: 0.75rem !important;
          width: 100% !important;
          height: 100% !important;
          margin: 0 !important;
          flex: 1 1 auto;
        }

        /* Center-align textual values inside newly stretched boxes */
        .home-metrics-stretch-wrapper summary-metrics .metric-card-tile {
          height: 100% !important;
          display: flex !important;
          flex-direction: column !important;
          justify-content: center !important;
          padding: 1.25rem !important;
          box-sizing: border-box !important;
        }

        /* Ensure Uptime Card's panel stretches down to the base line */
        .home-uptime-stretch-wrapper uptime-card .workspace-panel-card {
          height: 100% !important;
          box-sizing: border-box;
        }

        /* Activity Charts Rows */
        .home-trends-row {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 1.25rem;
          margin-bottom: 1.25rem;
        }

        /* Three Column Operational Log Grid */
        .home-breakdown-three-column-grid {
          display: grid;
          grid-template-columns: repeat(3, minmax(0, 1fr));
          gap: 1.25rem;
          margin-bottom: 1.25rem;
          align-items: stretch;
        }

        .panel-scroll-container {
          max-height: 22rem;
          overflow-y: auto;
          padding-right: 0.25rem;
        }

        .panel-scroll-container::-webkit-scrollbar {
          width: 0.375rem;
        }
        .panel-scroll-container::-webkit-scrollbar-track {
          background: transparent;
        }
        .panel-scroll-container::-webkit-scrollbar-thumb {
          background: var(--wt-border, #cbd5e1);
          border-radius: 0.25rem;
        }

        /* Viewport Width Breakpoints Fallbacks */
        @media (max-width: 64rem) {
          .home-breakdown-three-column-grid {
            grid-template-columns: 1fr;
          }
        }

        @media (max-width: 48rem) {
          .home-top-overview-grid,
          .home-trends-row {
            grid-template-columns: 1fr;
          }
          .home-metrics-stretch-wrapper summary-metrics .metrics-summary-grid {
            grid-template-rows: auto !important;
          }
        }
      </style>
    `;
  }

  cacheElements() {
    this.banner = this.querySelector("dashboard-banner");
    this.metrics = this.querySelector("summary-metrics");
    this.uptimeCard = this.querySelector("#home-uptime");
    this.errorList = this.querySelector("#home-errors");
    this.loadPaths = this.querySelector("#home-load-paths");
    this.clickPaths = this.querySelector("#home-click-paths");
    this.activityList = this.querySelector("#home-activity");
    this.errorModal = this.querySelector("#home-error-modal");
    this.timeline = this.querySelector("#home-activity-timeline");
    this.loadTrend = this.querySelector("#home-activity-loadtrend");
  }

  updatePageData() {
    const data = getHomeDashboardData();
    const activityData = getActivityDashboardData();

    this.banner.healthy = data.uptime?.isHealthy;
    this.metrics.items = data.metrics;
    this.errorList.errors = data.errors;
    this.loadPaths.pathCounts = data.loadPaths;
    this.clickPaths.pathCounts = data.clickPaths;
    this.activityList.events = data.events;

    this.uptimeCard.projects = data.projects;
    this.uptimeCard.uptimeLog = data.rawUptimeLog;

    if (this.timeline && activityData?.activityOverTime) {
      this.timeline.series = activityData.activityOverTime;
    }
    if (this.loadTrend && activityData?.loadTimeTrend) {
      this.loadTrend.series = activityData.loadTimeTrend;
    }
  }

  openErrorModal(errorId) {
    this.errorModal?.open(getEventById(errorId));
  }
}

customElements.define("home-page", HomePage);
