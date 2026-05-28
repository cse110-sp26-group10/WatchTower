import { dataStore } from '../core/data-store.js';
import { deploymentScope } from '../core/deployment-scope.js';

export class DeploymentFilter extends HTMLElement {
  connectedCallback() {
    this.render();
    this.unsubscribe = deploymentScope.subscribe(() => this.syncDetail());
  }

  disconnectedCallback() {
    this.unsubscribe?.();
  }

  render() {
    const section = document.createElement('section');
    section.className = 'filter-section';

    const label = document.createElement('label');
    label.className = 'filter-label';
    label.htmlFor = 'deployment-filter';
    label.textContent = 'Deployment';

    const select = document.createElement('select');
    select.id = 'deployment-filter';
    select.className = 'filter-select';
    select.setAttribute('aria-label', 'Filter by deployment');

    const allOption = document.createElement('option');
    allOption.value = 'all';
    allOption.textContent = 'All deployments';
    select.append(allOption);

    for (const deployment of dataStore.getDeployments()) {
      const option = document.createElement('option');
      option.value = deployment.id;
      option.textContent = `${deployment.version} - ${deployment.id} (${deployment.commit_hash})`;
      select.append(option);
    }

    select.addEventListener('change', () => deploymentScope.set(select.value));

    this.detailBox = document.createElement('deployment-detail-box');
    section.append(label, select, this.detailBox);
    this.replaceChildren(section);
  }

  syncDetail() {
    this.detailBox.deployment = deploymentScope.deployment;
  }
}

customElements.define('deployment-filter', DeploymentFilter);
