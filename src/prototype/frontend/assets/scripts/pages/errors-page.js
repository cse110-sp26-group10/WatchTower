import { dataStore } from '../core/data-store.js';
import { deploymentScope } from '../core/deployment-scope.js';
import { resolvedSignals } from '../core/resolved-signals.js';
import { groupErrors } from '../core/signal-groups.js';


export class ErrorsPage extends HTMLElement {
  set route(value) {
    this._route = value;
  }

  connectedCallback() {
    this.unsubscribe = deploymentScope.subscribe(() => this.render());
  }

  disconnectedCallback() {
    this.unsubscribe?.();
  }

  render() {
    const page = document.createElement('div');
    page.className = 'page-stack';

    this.replaceChildren(page);
  }
}

customElements.define('errors-page', ErrorsPage);
