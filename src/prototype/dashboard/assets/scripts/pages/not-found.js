import { deploymentScope } from '../core/deployment-scope.js';

export class PageNotFound extends HTMLElement {
  connectedCallback() {
    this.unsubscribe = deploymentScope.subscribe(() => this.render());
  }

  disconnectedCallback() {
    this.unsubscribe?.();
  }

  render() {


    const page = document.createElement('div');
    page.className = 'page-stack';

    const summary = document.createElement('section');
    summary.className = 'panel';
    summary.textContent = 'Page Not Found';

    page.append(summary);
    this.replaceChildren(page);
  }
}

customElements.define('not-found-page', PageNotFound);
