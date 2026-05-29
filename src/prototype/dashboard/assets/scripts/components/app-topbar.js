import { dataStore } from '../core/data-store.js';
import { deploymentScope } from '../core/deployment-scope.js';

/** Announce a message to screen readers via the global live region. */
export function announce(message) {
  const el = document.getElementById('aria-announcer');
  if (!el) return;
  // Clear first so repeated identical messages still fire.
  el.textContent = '';
  requestAnimationFrame(() => { el.textContent = message; });
}

/** Apply or remove the colorblind theme on <html> and persist the choice. */
function applyTheme(colorblind) {
  document.documentElement.dataset.theme = colorblind ? 'colorblind' : '';
  localStorage.setItem('wt_colorblind', colorblind ? '1' : '');
}

export class AppTopbar extends HTMLElement {
  connectedCallback() {
    this.render();
    this.unsubscribe = deploymentScope.subscribe(() => this.updateMeta());
    // Restore saved theme preference on page load.
    applyTheme(!!localStorage.getItem('wt_colorblind'));
    this._updateToggleLabel();
  }

  disconnectedCallback() {
    this.unsubscribe?.();
  }

  render() {
    this.replaceChildren();

    const header = document.createElement('header');
    header.className = 'topbar';
    header.setAttribute('role', 'banner');

    const brand = document.createElement('a');
    brand.className = 'brand-name';
    brand.href = '#/';
    brand.textContent = 'WatchTower';
    brand.setAttribute('aria-label', 'WatchTower — go to dashboard home');

    const meta = document.createElement('div');
    meta.className = 'topbar-meta';

    this.deploymentInfo = document.createElement('span');
    this.deploymentInfo.setAttribute('aria-label', 'Active deployment info');

    this.updatedAt = document.createElement('span');
    // aria-live here so "Updated HH:MM:SS" is announced on each refresh.
    this.updatedAt.setAttribute('aria-live', 'polite');
    this.updatedAt.setAttribute('aria-atomic', 'true');

    const dot = document.createElement('span');
    dot.className = 'dot';
    dot.setAttribute('aria-hidden', 'true');
    dot.textContent = '-';

    this.themeToggle = document.createElement('button');
    this.themeToggle.className = 'theme-toggle';
    this.themeToggle.setAttribute('type', 'button');
    this.themeToggle.addEventListener('click', () => this._toggleTheme());

    meta.append(this.deploymentInfo, dot, this.updatedAt, this.themeToggle);
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

  _toggleTheme() {
    const isColorblind = document.documentElement.dataset.theme === 'colorblind';
    applyTheme(!isColorblind);
    this._updateToggleLabel();
    announce(!isColorblind ? 'Colorblind-safe theme enabled' : 'Default theme restored');
  }

  _updateToggleLabel() {
    const isColorblind = document.documentElement.dataset.theme === 'colorblind';
    this.themeToggle.textContent = isColorblind ? '🎨 Colorblind: ON' : '🎨 Colorblind: OFF';
    this.themeToggle.setAttribute(
      'aria-pressed', isColorblind ? 'true' : 'false'
    );
    this.themeToggle.setAttribute(
      'aria-label',
      isColorblind ? 'Colorblind-safe theme is on — click to disable' : 'Colorblind-safe theme is off — click to enable'
    );
  }
}

customElements.define('app-topbar', AppTopbar);
