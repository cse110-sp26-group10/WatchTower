import { deploymentScope } from "../core/deployment-scope.js";
import { relativeTime } from "../core/formatters.js";

/**
 * App topbar. Has selectors for project and deployment information.
 * Theme toggle and logout have moved to the Settings page.
 */
export class AppTopbar extends HTMLElement {
  connectedCallback() {
    this.render();

    // Broadcast a custom event across the global DOM when clicked
    const menuBtn = this.querySelector("#mobile-menu-trigger");
    menuBtn?.addEventListener("click", () => {
      document.dispatchEvent(new CustomEvent("watchtower:menu-toggle"));
    });

    if (deploymentScope && typeof deploymentScope.subscribe === "function") {
      this.unsubscribe = deploymentScope.subscribe(() => {
        this.updateActiveMetadata();
      });
    }
    this.updateActiveMetadata();
  }

  disconnectedCallback() {
    this.unsubscribe?.();
  }

  render() {
    this.innerHTML = `
      <header class="topbar">
        <div class="topbar-left">
          <button class="menu-toggle-btn" id="mobile-menu-trigger" aria-label="Toggle navigation menu">
            <span class="menu-toggle-line"></span>
            <span class="menu-toggle-line"></span>
            <span class="menu-toggle-line"></span>
          </button>

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
      </header>
    `;
  }

  updateActiveMetadata() {
    const metaContainer = this.querySelector("#header-metadata-strip");
    if (!metaContainer) return;

    const currentDep = deploymentScope.deployment;
    if (!currentDep || deploymentScope.id === "all") {
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

customElements.define("app-topbar", AppTopbar);
