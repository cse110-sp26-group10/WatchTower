import { dataStore } from "../core/data-store.js";

const LINKS = [
  ["#/", "Overview", "/"],
  ["#/projects", "Projects", "/projects"],
  ["#/errors", "Errors", "/errors"],
  ["#/feedback", "Feedback", "/feedback"],
  ["#/activity", "Activity", "/activity"],
  ["#/settings", "Settings", "/settings"],
];

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
      link.textContent = label;
      item.append(link);
      list.append(item);
    }

    nav.append(list);

    // Logout button, pinned to the bottom of the sidebar
    const logoutBtn = document.createElement("button");
    logoutBtn.type = "button";
    logoutBtn.className = "sidebar-logout";
    logoutBtn.textContent = "Log out";
    logoutBtn.addEventListener("click", () => this.handleLogout(logoutBtn));
    nav.append(logoutBtn);

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

    // Check if we are currently running on desktop view or small viewport mobile view
    const isMobileViewport = window.innerWidth <= 900;

    if (isMobileViewport) {
      nav.classList.toggle("is-open");
      backdrop?.classList.toggle("is-open");
    } else {
      // Regular sizing viewport toggle profile
      nav.classList.toggle("is-collapsed");
    }
  }

  async handleLogout(btn) {
    btn.disabled = true;
    // Clear server session (cookies) then the client-side auth flag.
    await dataStore.logOut();
    localStorage.removeItem("wt-auth");
    window.location.reload();
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
    this.querySelectorAll(".sidebar-link").forEach((link) => {
      const active = link.dataset.route === path;
      link.classList.toggle("is-active", active);
      if (active) {
        link.setAttribute("aria-current", "page");
      } else {
        link.removeAttribute("aria-current");
      }
    });
  }
}

customElements.define("app-sidebar", AppSidebar);
