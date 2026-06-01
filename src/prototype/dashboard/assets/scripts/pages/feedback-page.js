import { deploymentScope } from '../core/deployment-scope.js';
import { getFeedbackDashboardData } from '../core/dashboard-data.js';
import '../components/dashboard-styles.js';
import '../components/feedback-list.js';
import '../components/panel-section.js';
import '../components/summary-metrics.js';

export class FeedbackPage extends HTMLElement {
  set route(value) {
    this._route = value;
  }

  connectedCallback() {
    this.render();
    this.cacheElements();
    if (deploymentScope && typeof deploymentScope.subscribe === 'function') {
      this.unsubscribe = deploymentScope.subscribe(() => this.updatePageData());
    } else {
      this.updatePageData();
    }
  }

  disconnectedCallback() {
    this.unsubscribe?.();
  }

  render() {
    this.className = 'dashboard-viewport';
    this.innerHTML = `
      <summary-metrics></summary-metrics>

      <panel-section heading="User Feedback" subheading="most recent first">
        <feedback-list id="feedback-page-list"></feedback-list>
      </panel-section>

      <dashboard-styles></dashboard-styles>
    `;
  }

  cacheElements() {
    this.metrics = this.querySelector('summary-metrics');
    this.feedbackList = this.querySelector('#feedback-page-list');
  }

  updatePageData() {
    const data = getFeedbackDashboardData();
    this.metrics.items = data.metrics;
    this.feedbackList.surveys = data.surveys;
  }
}

customElements.define('feedback-page', FeedbackPage);
