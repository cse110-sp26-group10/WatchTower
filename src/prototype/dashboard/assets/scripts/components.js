class AppTopbar extends HTMLElement {
    connectedCallback() {
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

class AppSidebar extends HTMLElement {
    connectedCallback() {
        const isDashboard = window.location.pathname.endsWith('/') ||
            window.location.pathname.endsWith('/index.html');
        const currentView = isDashboard
            ? new URLSearchParams(window.location.search).get('view') || 'overview'
            : '';
        const isActive = (view) => view === currentView ? ' is-active' : '';

        this.innerHTML = `
            <nav class="sidebar" aria-label="Dashboard sections">
                <ul class="sidebar-list">
                    <li><a class="sidebar-link${isActive('overview')}" href="index.html">Overview</a></li>
                    <li><a class="sidebar-link${isActive('errors')}" href="index.html?view=errors">Errors</a></li>
                    <li><a class="sidebar-link${isActive('feedback')}" href="index.html?view=feedback">Feedback</a></li>
                    <li><a class="sidebar-link${isActive('activity')}" href="index.html?view=activity">Activity</a></li>
                </ul>
            </nav>
        `;
    }
}

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
