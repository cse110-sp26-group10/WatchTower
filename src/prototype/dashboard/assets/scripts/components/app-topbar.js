import { dataStore } from '../core/data-store.js';
import { deploymentScope } from '../core/deployment-scope.js';

export class AppTopbar extends HTMLElement {
  connectedCallback() {
    this.render();
    this.unsubscribe = deploymentScope.subscribe(() => this.updateMeta());
  }

  disconnectedCallback() {
    this.unsubscribe?.();
  }

  render() {
    this.replaceChildren();

    const header = document.createElement('header');
    header.className = 'topbar';

    const brand = document.createElement('a');
    brand.className = 'brand-name';
    brand.href = '#/';
    brand.textContent = 'WatchTower';

    const meta = document.createElement('div');
    meta.className = 'topbar-meta';

    this.deploymentInfo = document.createElement('span');
    this.updatedAt = document.createElement('span');
    const dot = document.createElement('span');
    dot.className = 'dot';
    dot.textContent = '-';

    meta.append(this.deploymentInfo, dot, this.updatedAt);
    header.append(brand, meta);
    this.append(header);
  }

  updateMeta() {
    const deployment = deploymentScope.deployment;
    this.deploymentInfo.textContent = deployment
      ? `deployment ${deployment.version} (${deployment.commit_hash})`
      : `${dataStore.getDeployments().length} deployments`;
    this.updatedAt.textContent = `Updated ${new Date().toLocaleTimeString()}`;
  }
}

customElements.define('app-topbar', AppTopbar);
