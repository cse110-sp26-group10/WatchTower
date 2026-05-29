// 1. Core Framework and State Engines (Load these first!)
import { dataStore } from './core/data-store.js';
import { deploymentScope } from './core/deployment-scope.js';

// 2. Base Components (Leaf nodes that others rely on)
import './components/signal-badge.js';
import './components/deployment-detail-box.js'; // Must load before filter!

// 3. Composite Components
import './components/deployment-filter.js';
import './components/app-topbar.js';
import './components/app-sidebar.js';
import './components/app-footer.js';
import './components/signal-panel.js';
import './components/grouped-error-panel.js';

// 4. Pages and Routing Matrix
import { createRouter } from './router.js';
import { HomePage } from './pages/home-page.js';
import { IssuePage } from './pages/issue-page.js';
import { PageNotFound } from './pages/not-found.js';
import { ErrorsPage } from './pages/errors-page.js';
import { FeedbackPage } from './pages/feedback-page.js';
import { ActivityPage } from './pages/activity-page.js';

// Apply saved theme flags before first render to avoid flash.
const flags = [];
if (localStorage.getItem('wt_dark') === '1')       flags.push('dark');
if (localStorage.getItem('wt_colorblind') === '1') flags.push('colorblind');
document.documentElement.dataset.theme = flags.join(' ');

const router = createRouter({
  routes: {
    '/': HomePage,
    '/errors': ErrorsPage,
    '/feedback': FeedbackPage,
    '/activity': ActivityPage,
    '/issue': IssuePage,
    '/notfound': PageNotFound,
  },
  outlet: () => document.getElementById('app-outlet'),
});

window.addEventListener('DOMContentLoaded', () => {
  router.start();
});