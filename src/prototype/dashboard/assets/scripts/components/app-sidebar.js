const LINKS = [
  ['#/', 'Overview', '/'],
  ['#/projects', 'Projects', '/projects'],
  ['#/errors', 'Errors', '/errors'],
  ['#/feedback', 'Feedback', '/feedback'],
  ['#/activity', 'Activity', '/activity'],
];

export class AppSidebar extends HTMLElement {
  connectedCallback() {
    this.render();
    this.onRouteChange = (event) => this.setActive(event.detail.path);
    document.addEventListener('watchtower:route-change', this.onRouteChange);
  }

  disconnectedCallback() {
    document.removeEventListener('watchtower:route-change', this.onRouteChange);
  }

  render() {
    const nav = document.createElement('nav');
    nav.className = 'sidebar';
    nav.setAttribute('aria-label', 'Dashboard sections');

    // Brand logo at the top of the sidebar
    const brand = document.createElement('a');
    brand.href = '#/';
    brand.className = 'sidebar-brand';
    brand.innerHTML = `
      <img src="/src/prototype/dashboard/public/logo.svg" alt="WatchTower logo" style="height: 32px; width: auto;">
      <span style="color: var(--wt-info); font-size: 1.15rem; font-weight: 700;">WatchTower</span>
    `;

    const list = document.createElement('ul');
    list.className = 'sidebar-list';

    for (const [href, label, route] of LINKS) {
      const item = document.createElement('li');
      const link = document.createElement('a');
      link.className = 'sidebar-link';
      link.href = href;
      link.dataset.route = route;
      link.textContent = label;
      item.append(link);
      list.append(item);
    }

    nav.append(brand, list);
    this.replaceChildren(nav);
    this.setActive(window.location.hash.slice(1) || '/');
  }

  setActive(path) {
    this.querySelectorAll('.sidebar-link').forEach((link) => {
      const active = link.dataset.route === path;
      link.classList.toggle('is-active', active);
      // aria-current="page" tells screen readers which link is the current page
      if (active) {
        link.setAttribute('aria-current', 'page');
      } else {
        link.removeAttribute('aria-current');
      }
    });
  }
}

customElements.define('app-sidebar', AppSidebar);
