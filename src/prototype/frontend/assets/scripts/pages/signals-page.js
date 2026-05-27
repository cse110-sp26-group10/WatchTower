import { dataStore } from '../core/data-store.js';
import { deploymentScope } from '../core/deployment-scope.js';
import { resolvedSignals } from '../core/resolved-signals.js';
import { groupErrors } from '../core/signal-groups.js';

export class SignalsPage extends HTMLElement {
  set route(value) {
    this._route = value;
  }

  connectedCallback() {
    this.unsubscribe = deploymentScope.subscribe(() => this.render());
  }

  disconnectedCallback() {
    this.unsubscribe?.();
  }

  get mode() {
    return this._route?.path === '/feedback' ? 'feedback' : 'errors';
  }

  render() {
    const eventType = this.mode === 'feedback' ? 'survey' : 'error';
    const signals = dataStore
      .getEvents({ deploymentId: deploymentScope.id })
      .filter((event) => event.event_type === eventType)
      .filter((event) => this.mode !== 'errors' || !resolvedSignals.isResolved(event));

    const page = document.createElement('div');
    page.className = 'page-stack';

    const filter = document.createElement('deployment-filter');
    const title = document.createElement('header');
    title.className = 'panel-header';
    title.textContent = this.mode === 'feedback' ? 'User Feedback' : 'Errors';

    const list = document.createElement('section');
    list.className = 'panel';

    if (signals.length === 0) {
      list.textContent = this.mode === 'feedback' ? 'No survey responses yet.' : 'No errors recorded.';
    } else if (this.mode === 'errors') {
      for (const group of groupErrors(signals)) {
        const panel = document.createElement('grouped-error-panel');
        panel.group = group;
        list.append(panel);
      }
    } else {
      for (const signal of signals) {
        const panel = document.createElement('signal-panel');
        panel.signal = signal;
        list.append(panel);
      }
    }

    page.append(filter, title, list);
    this.replaceChildren(page);
  }
}

customElements.define('signals-page', SignalsPage);
