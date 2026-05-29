import { deploymentScope } from '../core/deployment-scope.js';

export class AppTopbar extends HTMLElement {
  connectedCallback() {
    this.render();

    // 1. SETUP THE THEME TOGGLE LISTENER
    const themeBtn = this.querySelector('#theme-btn');
    if (themeBtn) {
      themeBtn.addEventListener('click', () => {
        const currentTheme = document.documentElement.getAttribute('data-theme') || 'light';
        
        if (currentTheme === 'dark') {
          document.documentElement.setAttribute('data-theme', 'light');
          themeBtn.textContent = '🌙 Dark';
        } else {
          document.documentElement.setAttribute('data-theme', 'dark');
          themeBtn.textContent = '☀️ Light';
        }
      });
      
      // Sync the button text immediately on page load based on current state
      const initialTheme = document.documentElement.getAttribute('data-theme') || 'light';
      themeBtn.textContent = initialTheme === 'dark' ? '☀️ Light' : '🌙 Dark';
    }

    // Subscribe to state changes so the top metadata string live-updates
    if (deploymentScope && typeof deploymentScope.subscribe === 'function') {
      this.unsubscribe = deploymentScope.subscribe(() => {
        this.updateActiveMetadata();
      });
    }
  }

  disconnectedCallback() {
    this.unsubscribe?.();
  }

  render() {
    this.innerHTML = `
      <header class="topbar">
        <div class="topbar-left">
          <a href="#" class="brand-name">WatchTower</a>
          
          <div style="display: flex; align-items: center; gap: 8px; margin-left: 16px;">
            <label style="font-weight: 600; color: var(--wt-text-2); font-size: 13px;">Deployment:</label>
            
            <deployment-filter></deployment-filter>
            
            <span id="header-metadata-strip" style="display: inline-flex; align-items: center; gap: 12px; margin-left: 12px; font-family: monospace; font-size: 12px; color: var(--wt-text-2);">
            </span>
          </div>
        </div>

        <div class="topbar-right">
          <button class="theme-toggle" id="theme-btn">🌙 Dark</button>
        </div>
      </header>
    `;
  }

  updateActiveMetadata() {
    const metaContainer = this.querySelector('#header-metadata-strip');
    if (!metaContainer) return;

    // Get active deployment object from scope
    const currentDep = deploymentScope.deployment;

    // If 'All deployments' is selected, clear or hide the extra metrics
    if (!currentDep || deploymentScope.id === 'all') {
      metaContainer.innerHTML = `<span style="color: var(--wt-text-3); font-style: italic;">All active clusters monitored</span>`;
      return;
    }

    // Format the keys cleanly with crisp spacing badges
    metaContainer.innerHTML = `
      <span style="background: var(--wt-surface-2); padding: 2px 6px; border-radius: var(--wt-radius-sm); border: 1px solid var(--wt-border);">id: <b>${currentDep.id}</b></span>
      <span style="background: var(--wt-surface-2); padding: 2px 6px; border-radius: var(--wt-radius-sm); border: 1px solid var(--wt-border);">version: <b>${currentDep.version}</b></span>
      <span style="background: var(--wt-surface-2); padding: 2px 6px; border-radius: var(--wt-radius-sm); border: 1px solid var(--wt-border);">commit: <b>${currentDep.commit_hash}</b></span>
      <span style="background: var(--wt-surface-2); padding: 2px 6px; border-radius: var(--wt-radius-sm); border: 1px solid var(--wt-border);">author: <b>${currentDep.author || 'system'}</b></span>
      <span style="color: var(--wt-text-3); font-size: 11px; margin-left: 4px;">deployed 45m ago</span>
    `;
  }
}

customElements.define('app-topbar', AppTopbar);