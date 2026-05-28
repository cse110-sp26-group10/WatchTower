import './components/app-topbar.js';
import './components/app-sidebar.js';
import './components/app-footer.js';
import './components/deployment-detail-box.js';
import './components/deployment-filter.js';
import './components/signal-badge.js';
import './components/signal-panel.js';
import './components/grouped-error-panel.js';

import { createRouter } from './router.js';
import { HomePage } from './pages/home-page.js';
import { SignalsPage } from './pages/signals-page.js';
import { IssuePage } from './pages/issue-page.js';
import { PageNotFound } from './pages/not-found.js';
import { ErrorsPage } from './pages/errors-page.js';
import { FeedbackPage } from './pages/feedback-page.js';
import { ActivityPage } from './pages/activity-page.js'

const router = createRouter({
  routes: {
    '/': HomePage,
    '/errors': ErrorsPage,
    '/feedback': FeedbackPage,
    '/activity': ActivityPage,
    '/issue': IssuePage,
  },
  outlet: () => document.getElementById('app-outlet'),
});

window.addEventListener('DOMContentLoaded', () => {
  router.start();
});
