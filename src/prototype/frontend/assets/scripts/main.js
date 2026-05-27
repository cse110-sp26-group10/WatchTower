import './components/app-topbar.js';
import './components/app-sidebar.js';
import './components/app-footer.js';
import './components/deployment-detail-box.js';
import './components/deployment-filter.js';
import './components/signal-badge.js';
import './components/signal-panel.js';
import './components/grouped-error-panel.js';

import { createRouter } from './router.js';
import { DashboardPage } from './pages/dashboard-page.js';
import { SignalsPage } from './pages/signals-page.js';
import { IssuePage } from './pages/issue-page.js';

const router = createRouter({
  routes: {
    '/': DashboardPage,
    '/errors': SignalsPage,
    '/feedback': SignalsPage,
    '/activity': DashboardPage,
    '/issue': IssuePage,
  },
  outlet: () => document.getElementById('app-outlet'),
});

window.addEventListener('DOMContentLoaded', () => {
  router.start();
});
