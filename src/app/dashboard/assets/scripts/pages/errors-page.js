import { projectScope } from "../core/project-scope.js";
import { deploymentScope } from "../core/deployment-scope.js";
import {
  getErrorsDashboardData,
  getEventById,
} from "../core/dashboard-data.js";
import { dataStore } from "../core/data-store.js";
import "../components/error-detail-modal.js";
import "../components/error-list.js";
import "../components/panel-section.js";
import "../components/summary-metrics.js";
import "../components/error-trends-card.js"; 
import "../components/error-distribution-chart.js";

export class ErrorsPage extends HTMLElement {
  constructor() {
    super();
    this.handleErrorSelected = (event) => {
      this.openErrorModal(event.detail?.errorId);
    };
    this.handleErrorResolve = (event) => {
      dataStore.resolveErrors(event.detail?.ids);
    };
  }

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
      <section class="projects-header">
        <div>
          <h1 class="dashboard-title">Errors</h1>
          <p class="dashboard-subtitle">Track and resolve errors caught across your monitored projects.</p>
        </div>
      </section>
    
      <div class="errors-layout-row-grid">
        
        <div class="errors-metrics-column-holder">
          <summary-metrics></summary-metrics>
        </div>

        <div class="errors-trends-panel-holder">
          <error-trends-card id="errors-page-trends"></error-trends-card>
        </div>

      </div>

      <div class="errors-layout-row-grid spec-workspace-offset">
        
        <div class="errors-list-column-wrapper">
          <panel-section heading="Active System Errors" subheading="Click a row for full event log trace details">
            <div class="errors-scrollable-log-frame">
              <error-list id="errors-page-list"></error-list>
            </div>
          </panel-section>
        </div>

        <div class="errors-analytics-column-wrapper">
          <error-distribution-chart id="errors-page-distribution"></error-distribution-chart>
        </div>

      </div>

      <error-detail-modal id="errors-page-modal"></error-detail-modal>

      <style>
        /* Shared Master Row Definitions: Forces perfectly equal 50/50 dashboard columns */
        .errors-layout-row-grid {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 1.25rem;
          margin-bottom: 1.25rem;
          align-items: stretch;
          width: 100%;
        }

        .errors-layout-row-grid.spec-workspace-offset {
          margin-bottom: 0;
        }

        /* Wrappers ensuring consistent block alignment heights */
        .errors-metrics-column-holder,
        .errors-trends-panel-holder,
        .errors-list-column-wrapper,
        .errors-analytics-column-wrapper {
          display: flex;
          flex-direction: column;
          min-width: 0;
          align-self: stretch;
        }

        .errors-metrics-column-holder summary-metrics,
        .errors-trends-panel-holder error-trends-card,
        .errors-list-column-wrapper panel-section,
        .errors-analytics-column-wrapper error-distribution-chart {
          display: flex !important;
          flex-direction: column;
          width: 100%;
          height: 100% !important;
          flex: 1 1 auto;
        }

        /* Cleans up summary header layout metadata bounds if present */
        .errors-metrics-column-holder summary-metrics .workspace-panel-header {
          display: none !important;
        }

        /* Splitting metrics container internally: Left Total Errors box expanded, Right stacked twins */
        .errors-metrics-column-holder summary-metrics .metrics-summary-grid {
          display: grid !important;
          grid-template-columns: 1fr 1fr !important;
          gap: 1rem !important;
          width: 100% !important;
          height: 100% !important;
          margin: 0 !important;
        }

        /* Target first tile child item ([Total Errors]) to expand full vertical height */
        .errors-metrics-column-holder summary-metrics .metric-card-tile:nth-child(1) {
          grid-row: span 2 !important;
          height: 100% !important;
          display: flex !important;
          flex-direction: column !important;
          justify-content: center !important;
          padding: 1.75rem 1.5rem !important;
        }

        .errors-metrics-column-holder summary-metrics .metric-card-tile:nth-child(1) .metric-card-value {
          font-size: 2.75rem !important;
          margin-top: 0.5rem;
        }

        /* Target stacked secondary elements (Critical & Warnings) on the right */
        .errors-metrics-column-holder summary-metrics .metric-card-tile:nth-child(2),
        .errors-metrics-column-holder summary-metrics .metric-card-tile:nth-child(3) {
          padding: 1rem 1.25rem !important;
          display: flex !important;
          flex-direction: column !important;
          justify-content: center;
        }

        .errors-metrics-column-holder summary-metrics .metric-card-tile:nth-child(2) .metric-card-value,
        .errors-metrics-column-holder summary-metrics .metric-card-tile:nth-child(3) .metric-card-value {
          font-size: 1.75rem !important;
        }

        /* Adjust internal trend panel component wrapper properties safely */
        .errors-trends-panel-holder error-trends-card .workspace-panel-card {
          margin: 0 !important;
          height: 100% !important;
          box-sizing: border-box;
        }

        /* Target path strings strictly inside the chart row grid layout to keep subheadings normal */
        #errors-page-distribution .pie-legend-text {
          color: var(--wt-text) !important;
          font-weight: 600 !important;
        }

        /* Makes the metric log count metrics prominent and distinct on the right boundary side */
        #errors-page-distribution .pie-legend-value,
        #errors-page-distribution .pie-tip-metric strong {
          color: var(--brand-aqua, #00c8ff) !important;
          font-weight: 800 !important;
          font-size: 0.9375rem !important;
        }

        /* Enforce clean highlight with NO rounded corners and a prominent Blue/Aqua outline border */
        #errors-page-distribution .pie-legend-item {
          border-radius: 0px !important; /* Strips rounded corners */
          border: 1px solid transparent !important; /* Setup layout layer shift mitigation anchor */
          transition: background 0.1s ease, border-color 0.1s ease !important;
        }

        /* Highlight state triggers perfectly when hovering items directly or via sync-state events */
        #errors-page-distribution .pie-legend-item:hover,
        #errors-page-distribution .pie-legend-item.is-svg-hovered {
          background: var(--brand-indigo-soft, #e9eef8) !important;
          border-color: var(--brand-aqua, #00c8ff) !important;
        }

        /* Scroll limit framework handling inside error logs */
        .errors-scrollable-log-frame {
          max-height: 25.5rem;
          overflow-y: auto;
          padding-right: 0.25rem;
          box-sizing: border-box;
        }

        .errors-scrollable-log-frame::-webkit-scrollbar {
          width: 0.375rem;
        }
        .errors-scrollable-log-frame::-webkit-scrollbar-track {
          background: transparent;
        }
        .errors-scrollable-log-frame::-webkit-scrollbar-thumb {
          background: var(--wt-border, #cbd5e1);
          border-radius: 0.25rem;
        }

        /* Viewport width responsive collapse adaptations for smaller screen views */
        @media (max-width: 76rem) {
          .errors-layout-row-grid {
            grid-template-columns: 1fr;
          }
          .errors-scrollable-log-frame {
            max-height: auto;
            overflow-y: visible;
          }
        }
        
        @media (max-width: 48rem) {
          .errors-metrics-column-holder summary-metrics .metrics-summary-grid {
            grid-template-columns: 1fr !important;
          }
          .errors-metrics-column-holder summary-metrics .metric-card-tile:nth-child(1) {
            grid-row: span 1 !important;
          }
        }
      </style>
    `;
  }

  cacheElements() {
    this.metrics = this.querySelector("summary-metrics");
    this.errorList = this.querySelector("#errors-page-list");
    this.errorModal = this.querySelector("#errors-page-modal");
    this.errorTrends = this.querySelector("#errors-page-trends"); 
    this.errorDistribution = this.querySelector("#errors-page-distribution");
  }

  updatePageData() {
    const data = getErrorsDashboardData();
    this.metrics.items = data.metrics;
    this.errorList.errors = data.errors;
    
    if (this.errorTrends) {
      this.errorTrends.errors = data.errors;
    }

    if (this.errorDistribution) {
      this.errorDistribution.errors = data.errors;
    }
  }

  openErrorModal(errorId) {
    this.errorModal?.open(getEventById(errorId));
  }
}

customElements.define("errors-page", ErrorsPage);