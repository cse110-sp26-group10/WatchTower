/**
 * Custom HTML Element to display the App Topbar, displayed on every page
 */
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

/**
 * Custom HTML Element to display the App Sidebar, displayed on every page
 */
class AppSidebar extends HTMLElement {
    connectedCallback() {
        const isDashboard = window.location.pathname.endsWith('/') ||
            window.location.pathname.endsWith('/index.html');
        const path = window.location.pathname.split('/').pop() || 'index.html';
        const queryView = new URLSearchParams(window.location.search).get('view');
        const currentView = path === 'errors.html'
            ? 'errors'
            : path === 'feedback.html'
                ? 'feedback'
                : isDashboard
                    ? queryView || 'overview'
                    : '';
        const isActive = (view) => view === currentView ? ' is-active' : '';

        this.innerHTML = `
            <nav class="sidebar" aria-label="Dashboard sections">
                <ul class="sidebar-list">
                    <li><a class="sidebar-link${isActive('overview')}" href="index.html">Overview</a></li>
                    <li><a class="sidebar-link${isActive('errors')}" href="errors.html">Errors</a></li>
                    <li><a class="sidebar-link${isActive('feedback')}" href="feedback.html">Feedback</a></li>
                    <li><a class="sidebar-link${isActive('activity')}" href="index.html?view=activity">Activity</a></li>
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
