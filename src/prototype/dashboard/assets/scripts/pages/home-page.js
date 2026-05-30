import { dataStore } from '../core/data-store.js';
import { deploymentScope } from '../core/deployment-scope.js';
import '../components/home-activity-list.js';
import '../components/home-dashboard-banner.js';
import '../components/home-dashboard-styles.js';
import '../components/home-error-detail-modal.js';
import '../components/home-error-list.js';
import '../components/home-feedback-list.js';
import '../components/home-panel-section.js';
import '../components/home-path-count-list.js';
import '../components/home-summary-metrics.js';

export class HomePage extends HTMLElement {
  constructor() {
    super();
    this.handleErrorSelected = (event) => {
      this.openErrorModal(event.detail?.errorId);
    };
  }

  connectedCallback() {
    this.render();

    if (deploymentScope && typeof deploymentScope.subscribe === 'function') {
      this.unsubscribe = deploymentScope.subscribe(() => {
        this.updateDashboardData();
      });
    }

    this.addEventListener('home-error-selected', this.handleErrorSelected);

    this.updateDashboardData();
  }

  disconnectedCallback() {
    this.unsubscribe?.();
    this.removeEventListener('home-error-selected', this.handleErrorSelected);
  }

  render() {
    this.className = 'dashboard-viewport';
    this.innerHTML = `
      <home-dashboard-banner></home-dashboard-banner>
      <home-summary-metrics></home-summary-metrics>

      <section class="dashboard-double-row">
        <home-panel-section heading="Errors" subheading="click an error row for full details">
          <home-error-list></home-error-list>
        </home-panel-section>

        <home-panel-section heading="User Feedback" subheading="most recent first">
          <home-feedback-list></home-feedback-list>
        </home-panel-section>
      </section>

      <section class="dashboard-double-row" id="section-activity-top" style="margin-bottom: 20px;">
        <home-panel-section heading="Page Loads" subheading="grouped by path">
          <home-path-count-list empty-message="No page loads tracked"></home-path-count-list>
        </home-panel-section>

        <home-panel-section heading="Clicks" subheading="grouped by path">
          <home-path-count-list empty-message="No interaction clicks tracked"></home-path-count-list>
        </home-panel-section>
      </section>

      <home-panel-section id="section-activity-bottom" heading="Recent Activity" subheading="all signal types - most recent first">
        <home-activity-list></home-activity-list>
      </home-panel-section>

      <home-error-detail-modal></home-error-detail-modal>
      <home-dashboard-styles></home-dashboard-styles>
    `;
  }

  updateDashboardData() {
    const unfilteredEvents = dataStore.getEvents() || [];
    const currentId = this.getCurrentDeploymentId();
    const events = currentId === 'all'
      ? unfilteredEvents
      : unfilteredEvents.filter((event) => event.deployment?.id === currentId);

    const errors = events.filter((event) => event.event_type === 'error');
    const pageLoads = events.filter((event) => event.event_type === 'page_load');
    const clicks = events.filter((event) => event.event_type === 'click');
    const surveys = events.filter((event) => event.event_type === 'survey');
    const avgLatency = this.calculateAverageLatency(pageLoads);

    this.querySelector('home-summary-metrics').metrics = {
      errors: errors.length,
      avgLatency,
      pageLoads: pageLoads.length,
      clicks: clicks.length,
    };

    this.querySelector('home-error-list').errors = errors;
    this.querySelector('home-feedback-list').surveys = surveys;
    this.querySelectorAll('home-path-count-list')[0].pathCounts = this.groupEventsByPath(pageLoads);
    this.querySelectorAll('home-path-count-list')[1].pathCounts = this.groupEventsByPath(clicks);
    this.querySelector('home-activity-list').events = events;
  }

  getCurrentDeploymentId() {
    if (!deploymentScope) return 'all';
    if (deploymentScope.id) return deploymentScope.id;
    if (deploymentScope.deployment?.id) return deploymentScope.deployment.id;
    return 'all';
  }

  calculateAverageLatency(pageLoads) {
    if (!pageLoads.length) return 0;
    const totalLatency = pageLoads.reduce((sum, event) => sum + (event.metadata?.load_time || 0), 0);
    return Math.round(totalLatency / pageLoads.length);
  }

  groupEventsByPath(events) {
    return events.reduce((counts, event) => {
      const path = event.pathname || '-';
      counts[path] = (counts[path] || 0) + 1;
      return counts;
    }, {});
  }

  openErrorModal(errorId) {
    const errorData = (dataStore.getEvents() || []).find((event) => event.id === errorId);
    this.querySelector('home-error-detail-modal')?.open(errorData);
  }
}

customElements.define('home-page', HomePage);
