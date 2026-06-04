const LINKS = [
  ["#/", "Overview", "/"],
  ["#/projects", "Projects", "/projects"],
  ["#/errors", "Errors", "/errors"],
  ["#/feedback", "Feedback", "/feedback"],
  ["#/activity", "Activity", "/activity"],
];

const ICONS = {
  "/": `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="3" y="3" width="7" height="9"></rect><rect x="14" y="3" width="7" height="5"></rect><rect x="14" y="12" width="7" height="9"></rect><rect x="3" y="16" width="7" height="5"></rect></svg>`,
  "/projects": `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"></path></svg>`,
  "/errors": `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>`,
  "/feedback": `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>`,
  "/activity": `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"></polyline></svg>`
};

const GEAR_SVG = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
  <circle cx="12" cy="12" r="3"/>
  <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/>
</svg>`;

/**
 * App sidebar used for page navigation
 */
export class AppSidebar extends HTMLElement {
  connectedCallback() {
    this.render();

    // Listen for layout changes across the app router
    this.onRouteChange = (event) => {
      this.setActive(event.detail.path);
      this.closeMobileMenu();
    };
    document.addEventListener("watchtower:route-change", this.onRouteChange);

    // Listen for the hamburger menu action dispatched from the topbar
    this.onToggleMenu = () => this.handleMenuToggleAction();
    document.addEventListener("watchtower:menu-toggle", this.onToggleMenu);
  }

  disconnectedCallback() {
    document.removeEventListener("watchtower:route-change", this.onRouteChange);
    document.removeEventListener("watchtower:menu-toggle", this.onToggleMenu);
  }

  render() {
    
    const nav = document.createElement("nav");
    nav.className = "sidebar";
    nav.id = "app-sidebar-nav";
    nav.setAttribute("aria-label", "Dashboard sections");

    const list = document.createElement("ul");
    list.className = "sidebar-list";

    for (const [href, label, route] of LINKS) {
      const item = document.createElement("li");
      const link = document.createElement("a");
      link.className = "sidebar-link";
      link.href = href;
      link.dataset.route = route;
      
      // Inject the matching route icon before the text snippet
      const iconSvg = ICONS[route] || "";
      link.innerHTML = `${iconSvg}<span class="sidebar-label">${label}</span>`;
      
      item.append(link);
      list.append(item);
    }

    nav.append(list);

    // Settings gear icon pinned to the bottom of the sidebar
    const settingsLink = document.createElement("a");
    settingsLink.href = "#/settings";
    settingsLink.className = "sidebar-settings-link";
    settingsLink.dataset.route = "/settings";
    settingsLink.setAttribute("aria-label", "Settings");
    settingsLink.innerHTML = `${GEAR_SVG}<span class="sidebar-settings-label">Settings</span>`;
    nav.append(settingsLink);

    // Mobile background click-to-close shroud overlay
    const backdrop = document.createElement("div");
    backdrop.className = "sidebar-backdrop";
    backdrop.id = "sidebar-shroud";
    backdrop.addEventListener("click", () => this.closeMobileMenu());

    this.replaceChildren(nav, backdrop);
    this.setActive(window.location.hash.slice(1) || "/");
  }

  handleMenuToggleAction() {
    const nav = this.querySelector("#app-sidebar-nav");
    const backdrop = this.querySelector("#sidebar-shroud");
    if (!nav) return;

    const isMobileViewport = window.innerWidth <= 900;

    if (isMobileViewport) {
      nav.classList.remove("is-collapsed");
      const isOpen = nav.classList.toggle("is-open");
      backdrop?.classList.toggle("is-open", isOpen);
    } else {
      nav.classList.remove("is-open");
      backdrop?.classList.remove("is-open");
      nav.classList.toggle("is-collapsed");
    }
  }

  closeMobileMenu() {
    const nav = this.querySelector("#app-sidebar-nav");
    const backdrop = this.querySelector("#sidebar-shroud");
    if (nav) {
      nav.classList.remove("is-open");
      backdrop?.classList.remove("is-open");
    }
  }

  setActive(path) {
    this.querySelectorAll(".sidebar-link, .sidebar-settings-link").forEach(
      (link) => {
        const active = link.dataset.route === path;
        link.classList.toggle("is-active", active);
        if (active) {
          link.setAttribute("aria-current", "page");
        } else {
          link.removeAttribute("aria-current");
        }
      },
    );
  }
}

customElements.define("app-sidebar", AppSidebar);