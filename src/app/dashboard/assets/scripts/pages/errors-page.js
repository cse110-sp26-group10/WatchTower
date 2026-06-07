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
    
      <summary-metrics></summary-metrics>

      <error-trends-card id="errors-page-trends"></error-trends-card>

      <panel-section heading="Errors" subheading="click an error row for full details">
        <error-list id="errors-page-list"></error-list>
      </panel-section>

      <error-detail-modal id="errors-page-modal"></error-detail-modal>
    `;
  }

  cacheElements() {
    this.metrics = this.querySelector("summary-metrics");
    this.errorList = this.querySelector("#errors-page-list");
    this.errorModal = this.querySelector("#errors-page-modal");
    // 3. Cache component selector reference reference
    this.errorTrends = this.querySelector("#errors-page-trends"); 
  }

  updatePageData() {
    const data = getErrorsDashboardData();
    this.metrics.items = data.metrics;
    this.errorList.errors = data.errors;
    
    // 4. Pass errors forward into trend compiler
    if (this.errorTrends) {
      this.errorTrends.errors = data.errors;
    }
  }

  openErrorModal(errorId) {
    this.errorModal?.open(getEventById(errorId));
  }
}

customElements.define("errors-page", ErrorsPage);