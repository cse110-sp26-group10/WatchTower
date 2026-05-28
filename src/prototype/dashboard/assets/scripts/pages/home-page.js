import { dataStore } from '../core/data-store.js';
import { deploymentScope } from '../core/deployment-scope.js';
import { resolvedSignals } from '../core/resolved-signals.js';

export class HomePage extends HTMLElement {
  connectedCallback() {
    this.unsubscribe = deploymentScope.subscribe(() => this.render());
  }

  disconnectedCallback() {
    this.unsubscribe?.();
  }

  render() {
    const events = dataStore.getEvents({ deploymentId: deploymentScope.id });
    const visibleErrors = events.filter((event) => (
      event.event_type === 'error' && !resolvedSignals.isResolved(event)
    ));

    const page = document.createElement('div');
    page.className = 'page-stack';

    const filter = document.createElement('deployment-filter');
    const header = document.createElement('section');
    header.className = 'status-banner';
    header.dataset.level = visibleErrors.some((event) => event.metadata?.severity === 'critical')
      ? 'down'
      : visibleErrors.length > 0 ? 'degraded' : 'ok';
    header.textContent = visibleErrors.length > 0
      ? `${visibleErrors.length} active errors`
      : 'System operational';

    const summary = document.createElement('section');
    summary.className = 'panel';
    summary.textContent = 'Dashboard page skeleton: summary tiles, uptime, activity, and signal previews will compose here.';

    page.append(filter, header, summary);
    this.replaceChildren(page);
  }
}

customElements.define('home-page', HomePage);
