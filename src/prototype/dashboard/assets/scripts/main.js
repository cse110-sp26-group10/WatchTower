//import { dataStore } from './core/data-store.js';
//import { deploymentScope } from './core/deployment-scope.js';

// Shared shell components
import './components/deployment-filter.js';
import './components/app-topbar.js';
import './components/app-sidebar.js';

// Pages and Routing Matrix
import { createRouter } from './router.js';
import { HomePage } from './pages/home-page.js';
import { IssuePage } from './pages/issue-page.js';
import { PageNotFound } from './pages/not-found.js';
import { ErrorsPage } from './pages/errors-page.js';
import { FeedbackPage } from './pages/feedback-page.js';
import { ActivityPage } from './pages/activity-page.js';
import { ProjectsPage } from './pages/projects-page.js';
import './pages/login-page.js';
import './pages/signup-page.js';

// Apply saved theme flags before first render to avoid flash.
const flags = [];
if (localStorage.getItem('wt_dark') === '1')       flags.push('dark');
if (localStorage.getItem('wt_colorblind') === '1') flags.push('colorblind');
document.documentElement.dataset.theme = flags.join(' ');

window.addEventListener('DOMContentLoaded', () => {
  const isLoggedIn = localStorage.getItem('wt-auth') === '1';

  if (!isLoggedIn) {
    const renderAuthPage = () => {
      const loginOutlet = document.getElementById('login-outlet');
      const isSignUpRoute = window.location.hash === '#/signup';
      loginOutlet.replaceChildren(document.createElement(isSignUpRoute ? 'signup-page' : 'login-page'));
    };

    // Mount auth pages standalone — no shell, no app router
    renderAuthPage();
    window.addEventListener('hashchange', renderAuthPage);
    return;
  }

  // User is authenticated — build the app shell dynamically
  const appShell = document.getElementById('app-shell');
  appShell.innerHTML = `
    <div class="app-container">
      <app-sidebar></app-sidebar>
      <div class="main-content">
        <app-topbar></app-topbar>
        <main id="app-outlet"></main>
      </div>
    </div>
  `;

  const router = createRouter({
    routes: {
      '/': HomePage,
      '/projects': ProjectsPage,
      '/errors': ErrorsPage,
      '/feedback': FeedbackPage,
      '/activity': ActivityPage,
      '/issue': IssuePage,
      '/notfound': PageNotFound,
    },
    outlet: () => document.getElementById('app-outlet'),
  });

  router.start();
});
