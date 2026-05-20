/**
 * Custom HTML Element to display the App Topbar, displayed on every page
 */
class AppTopbar extends HTMLElement {
    connectedCallback() {
        const variant = this.getAttribute('variant');
        
        this.innerHTML = `
            <header class="topbar">
                <div class="brand">
                <a class="brand-name" href="./">WatchTower</a>
                </div>
                <div class="topbar-meta">
                <span id="deployment-info">deployment —</span>
                <span class="dot">•</span>
                <span id="updated-at">Updated —</span>
                </div>
            </header>
        `;
    }
}

/**
 * Custom HTML Element to display the App Sidebar, displayed on every page
 */
class AppSidebar extends HTMLElement {
    connectedCallback() {
        this.innerHTML = `
            <nav class="sidebar" aria-label="Dashboard sections">
                <ul class="sidebar-list">
                    <li><a class="sidebar-link" href="./index.html">Overview</a></li>
                    <li><a class="sidebar-link" href="./errors.html">Errors</a></li>
                    <li><a class="sidebar-link">Page Loads</a></li>
                    <li><a class="sidebar-link">Feedback</a></li>
                    <li><a class="sidebar-link">Clicks</a></li>
                    <li><a class="sidebar-link">Activity</a></li>
                </ul>
            </nav>
        `;
    }
}

/**
 * Custom HTML Element to display the App Footer, displayed on every page
 */
class AppFooter extends HTMLElement {
    connectedCallback() {
        this.innerHTML = `
            <footer class="footer">
                <span>WatchTower prototype • mock data • frontend-only</span>
            </footer>
        `;
    }
}


customElements.define('app-topbar', AppTopbar);
customElements.define('app-sidebar', AppSidebar);
customElements.define('app-footer', AppFooter);