import { dataStore } from './core/data-store.js';
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

const DATA_UPDATE_INTERVAL = 10;

// Apply saved theme flags before first render to avoid flash.
const flags = [];
if (localStorage.getItem('wt_dark') === '1')       flags.push('dark');
if (localStorage.getItem('wt_colorblind') === '1') flags.push('colorblind');
document.documentElement.dataset.theme = flags.join(' ');

async function updateData() {
  const error = await dataStore.update();
  if (typeof error === "number" && error === 401) { // Access token expired
    const refreshError = await dataStore.refreshSession();
    if (typeof refreshError === "number" && refreshError === 401) { // Refresh token expired
      localStorage.removeItem("wt-auth");
      await dataStore.logOut();
      window.location.reload();
    }
  }
  if (error) { console.log("Data update failed:", error); return; }
  console.log("Data updated");
}

window.addEventListener('DOMContentLoaded', async () => {
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

  await updateData();
  setInterval(updateData, DATA_UPDATE_INTERVAL * 1000);

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