import { deploymentScope } from '../core/deployment-scope.js';
import { relativeTime } from '../core/formatters.js';

const SUN_SVG = `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
  <circle cx="12" cy="12" r="5"/>
  <line x1="12" y1="1" x2="12" y2="3"/>
  <line x1="12" y1="21" x2="12" y2="23"/>
  <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/>
  <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/>
  <line x1="1" y1="12" x2="3" y2="12"/>
  <line x1="21" y1="12" x2="23" y2="12"/>
  <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/>
  <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>
</svg>`;

const MOON_SVG = `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
  <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
</svg>`;

/**
 * App topbar. Has selectors for project and deployment information, as well as light/dark mode
 */
export class AppTopbar extends HTMLElement {
  connectedCallback() {
    this.render();
    this.setupThemeToggle();

    // Broadcast a custom event across the global DOM when clicked
    const menuBtn = this.querySelector('#mobile-menu-trigger');
    menuBtn?.addEventListener('click', () => {
      document.dispatchEvent(new CustomEvent('watchtower:menu-toggle'));
    });

    if (deploymentScope && typeof deploymentScope.subscribe === 'function') {
      this.unsubscribe = deploymentScope.subscribe(() => {
        this.updateActiveMetadata();
      });
    }
    this.updateActiveMetadata();
  }

  disconnectedCallback() {
    this.unsubscribe?.();
  }

  setupThemeToggle() {
    const themeBtn = this.querySelector('#theme-btn');
    if (!themeBtn) return;

    const updateToggleUI = (theme) => {
      const sun = this.querySelector('#theme-icon-sun');
      const moon = this.querySelector('#theme-icon-moon');
      if (!sun || !moon) return;

      if (theme === 'dark') {
        moon.style.background = 'var(--wt-surface)';
        moon.style.color = 'var(--wt-text)';
        sun.style.background = 'transparent';
        sun.style.color = 'var(--wt-text-3)';
      } else {
        sun.style.background = 'var(--wt-surface)';
        sun.style.color = 'var(--wt-text)';
        moon.style.background = 'transparent';
        moon.style.color = 'var(--wt-text-3)';
      }
    };

    themeBtn.addEventListener('click', () => {
      const currentTheme = document.documentElement.getAttribute('data-theme') || 'light';
      const next = currentTheme === 'dark' ? 'light' : 'dark';
      document.documentElement.setAttribute('data-theme', next);
      updateToggleUI(next);
    });

    const initialTheme = document.documentElement.getAttribute('data-theme') || 'light';
    updateToggleUI(initialTheme);
  }

  render() {
    this.innerHTML = `
      <header class="topbar">
        <div class="topbar-left">
          <button class="menu-toggle-btn" id="mobile-menu-trigger" aria-label="Toggle navigation menu">☰</button>
          
          <a href="#/" class="brand-name" style="display: flex; align-items: center; gap: 0.5rem; text-decoration: none;">
            <img src="/src/app/dashboard/public/logo.svg" alt="WatchTower logo" style="height: 1.75rem; width: auto;">
            <span style="color: var(--wt-text); font-weight: 700; font-size: 1.15rem;">WatchTower</span>
          </a>

          <div style="display: flex; align-items: center; gap: 0.5rem; margin-left: 1rem;">
            <label style="font-weight: 600; color: var(--wt-text-2); font-size: 0.8125rem;">Project:</label>
            <project-filter></project-filter>
          </div>
          
          <div style="display: flex; align-items: center; gap: 0.5rem; margin-left: 1rem;">
            <label style="font-weight: 600; color: var(--wt-text-2); font-size: 0.8125rem;">Deployment:</label>
            <deployment-filter></deployment-filter>
            <span id="header-metadata-strip" style="display: inline-flex; align-items: center; gap: 0.75rem; margin-left: 0.75rem; font-family: monospace; font-size: 0.75rem; color: var(--wt-text-2);"></span>
          </div>
        </div>

        <div class="topbar-right">
          <button id="theme-btn" style="display: flex; align-items: center; background: var(--wt-surface-2); border: 1px solid var(--wt-border); border-radius: 62.4375rem; padding: 0.25rem; cursor: pointer; gap: 0.125rem;">
            <span id="theme-icon-sun" style="display: flex; align-items: center; justify-content: center; width: 2rem; height: 2rem; border-radius: 50%; transition: background 0.15s ease; color: var(--wt-text-3);">${SUN_SVG}</span>
            <span id="theme-icon-moon" style="display: flex; align-items: center; justify-content: center; width: 2rem; height: 2rem; border-radius: 50%; transition: background 0.15s ease; color: var(--wt-text-3);">${MOON_SVG}</span>
          </button>
        </div>
      </header>
    `;
  }

  updateActiveMetadata() {
    const metaContainer = this.querySelector('#header-metadata-strip');
    if (!metaContainer) return;

    const currentDep = deploymentScope.deployment;
    if (!currentDep || deploymentScope.id === 'all') {
      metaContainer.innerHTML = `<span style="color: var(--wt-text-3); font-style: italic;">All active clusters monitored</span>`;
      return;
    }

    metaContainer.innerHTML = `
      <span style="background: var(--wt-surface-2); padding: 0.125rem 0.375rem; border-radius: var(--wt-radius-sm); border: 1px solid var(--wt-border);">version: <b>${currentDep.version}</b></span>
      <span style="background: var(--wt-surface-2); padding: 0.125rem 0.375rem; border-radius: var(--wt-radius-sm); border: 1px solid var(--wt-border);">commit: <b>${currentDep.commit_hash}</b></span>
      <span style="background: var(--wt-surface-2); padding: 0.125rem 0.375rem; border-radius: var(--wt-radius-sm); border: 1px solid var(--wt-border);">deployed: <b>${relativeTime(currentDep.deployed_at)}</b></span>
    `;
  }
}

customElements.define('app-topbar', AppTopbar);