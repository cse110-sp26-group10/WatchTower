const LINKS = [
  ['#/', 'Overview', '/'],
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

    nav.append(list);
    this.replaceChildren(nav);
    this.setActive(window.location.hash.slice(1) || '/');
  }

  setActive(path) {
    this.querySelectorAll('.sidebar-link').forEach((link) => {
      link.classList.toggle('is-active', link.dataset.route === path);
    });
  }
}

customElements.define('app-sidebar', AppSidebar);
