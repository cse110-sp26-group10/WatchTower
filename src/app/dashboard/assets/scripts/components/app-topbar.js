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
          <a href="#/" class="brand-name" style="display: flex; align-items: center; gap: 0.5rem; text-decoration: none;">
            <img src="public/logo.svg" alt="WatchTower logo" style="height: 1.75rem; width: auto;">
            <span style="color: var(--wt-text); font-weight: 700; font-size: 1.15rem;">WatchTower</span>
          </a>

          <div class="topbar-filter-group">
            <label class="topbar-filter-label" for="project-filter">Project:</label>
            <project-filter></project-filter>
          </div>

          <div class="topbar-filter-group">
            <label class="topbar-filter-label" for="deployment-filter">Deployment:</label>
            <deployment-filter></deployment-filter>
            <span id="header-metadata-strip" class="topbar-metadata-strip"></span>
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
      metaContainer.innerHTML = `<span class="metadata-muted">All active clusters monitored</span>`;
      return;
    }

    metaContainer.innerHTML = `
      <span class="metadata-badge">version: <b>${currentDep.version}</b></span>
      <span class="metadata-badge">commit: <b>${currentDep.commit_hash}</b></span>
      <span class="metadata-badge">deployed: <b>${relativeTime(currentDep.deployed_at)}</b></span>
    `;
  }
}

customElements.define("app-topbar", AppTopbar);
