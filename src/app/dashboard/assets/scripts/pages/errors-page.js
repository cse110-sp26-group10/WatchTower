import { projectScope } from "../core/project-scope.js";
import { deploymentScope } from "../core/deployment-scope.js";
import {
  getErrorsDashboardData,
  getEventById,
} from "../core/dashboard-data.js";
import "../components/dashboard-styles.js";
import "../components/error-detail-modal.js";
import "../components/error-list.js";
import "../components/panel-section.js";
import "../components/summary-metrics.js";

export class ErrorsPage extends HTMLElement {
  constructor() {
    super();
    this.handleErrorSelected = (event) => {
      this.openErrorModal(event.detail?.errorId);
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
  }

  disconnectedCallback() {
    this.projectUnsubscribe?.();
    this.deploymentUnsubscribe?.();
    this.removeEventListener("error-selected", this.handleErrorSelected);
  }

  render() {
    this.className = "dashboard-viewport";
    this.innerHTML = `
      <summary-metrics></summary-metrics>

      <panel-section heading="Errors" subheading="click an error row for full details">
        <error-list id="errors-page-list"></error-list>
      </panel-section>

      <error-detail-modal id="errors-page-modal"></error-detail-modal>
      <dashboard-styles></dashboard-styles>
    `;
  }

  cacheElements() {
    this.metrics = this.querySelector("summary-metrics");
    this.errorList = this.querySelector("#errors-page-list");
    this.errorModal = this.querySelector("#errors-page-modal");
  }

  updatePageData() {
    const data = getErrorsDashboardData();
    this.metrics.items = data.metrics;
    this.errorList.errors = data.errors;
  }

  openErrorModal(errorId) {
    this.errorModal?.open(getEventById(errorId));
  }
}

customElements.define("errors-page", ErrorsPage);
