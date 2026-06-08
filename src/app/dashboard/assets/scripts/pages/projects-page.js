import { dataStore } from "../core/data-store.js";

function loadProjects() {
  return dataStore.getProjects();
}

function normalizeUrl(value) {
  const trimmed = value.trim();
  if (!trimmed) return "";
  if (/^https?:\/\//i.test(trimmed)) return trimmed;
  return `https://${trimmed}`;
}

function formatDate(value) {
  return new Intl.DateTimeFormat(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(value));
}

function escapeHtml(value) {
  return String(value).replace(
    /[&<>"']/g,
    (char) =>
      ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#39;",
      })[char],
  );
}

export class ProjectsPage extends HTMLElement {
  connectedCallback() {
    this.projects = loadProjects();
    this.render();
    this.bindEvents();
    this.updateProjectList();
  }

  render() {
    this.className = "dashboard-viewport";
    this.innerHTML = `
      <section class="projects-header">
        <div>
          <h1 class="dashboard-title">Projects</h1>
          <p class="dashboard-subtitle">Add the apps and websites you want WatchTower to monitor.</p>
        </div>
      </section>

      <section class="projects-layout">
        <form class="dashboard-surface form-stack project-form" id="project-form" novalidate>
          <div class="project-form-heading">
            <h2 class="dashboard-title">Add Project</h2>
            <span id="project-count"></span>
          </div>

          <label class="form-field project-field">
            <span>Name</span>
            <input class="form-input" id="project-name" name="name" type="text" placeholder="Example Project" autocomplete="off" required>
          </label>

          <label class="form-field project-field">
            <span>Website or App URL</span>
            <input class="form-input" id="project-url" name="url" type="url" placeholder="https://example.com" autocomplete="off" required>
          </label>

          <p class="form-error project-error" id="project-error" aria-live="polite" hidden></p>

          <button class="primary-action project-submit" type="submit">Add Project</button>
        </form>

        <div class="dashboard-surface projects-list-wrap">
          <div class="projects-list-heading">
            <h2 class="dashboard-title">Your Projects</h2>
          </div>
          <div class="projects-list" id="projects-list"></div>
        </div>
      </section>
`;
  }

  bindEvents() {
    const form = this.querySelector("#project-form");
    form?.addEventListener("submit", (event) => {
      event.preventDefault();
      this.addProject();
    });

    this.querySelector("#projects-list")?.addEventListener(
      "click",
      async (event) => {
        const removeButton = event.target.closest("[data-remove-project]");
        if (removeButton) {
          const error = await dataStore.deleteProject(
            Number.parseInt(removeButton.dataset.removeProject),
          );
          if (error) return;
          this.updatePageData();
          return;
        }
        const copyButton = event.target.closest("[data-copy-key]");
        if (copyButton) {
          clearTimeout(copyButton.dataset.timeoutId);
          try {
            await navigator.clipboard.writeText(copyButton.dataset.copyKey);
            console.log("API key successfully copied");
            copyButton.textContent = "Copied!";
            copyButton.classList.add("copy-success");
            copyButton.dataset.timeoutId = setTimeout(() => {
              delete copyButton.dataset.timeoutId;
              copyButton.textContent = copyButton.dataset.default;
              copyButton.classList.remove("copy-success");
            }, 1500);
          } catch (error) {
            console.log("Failed to copy API key:", error);
          }
          return;
        }
      },
    );
  }

  async addProject() {
    const nameInput = this.querySelector("#project-name");
    const urlInput = this.querySelector("#project-url");
    const errorEl = this.querySelector("#project-error");
    const name = nameInput.value.trim();
    const url = normalizeUrl(urlInput.value);

    nameInput.classList.remove("is-invalid");
    urlInput.classList.remove("is-invalid");
    errorEl.hidden = true;
    errorEl.textContent = "";

    if (!name || !url) {
      if (!name) nameInput.classList.add("is-invalid");
      if (!url) urlInput.classList.add("is-invalid");
      errorEl.textContent = "Please add a project name and URL.";
      errorEl.hidden = false;
      return;
    }

    try {
      new URL(url);
    } catch {
      urlInput.classList.add("is-invalid");
      errorEl.textContent = "Please enter a valid URL.";
      errorEl.hidden = false;
      return;
    }

    const error = await dataStore.createProject(name, url);
    if (error) {
      errorEl.textContent = "Project creation failed.";
      errorEl.hidden = false;
      return;
    }

    this.updatePageData();
    this.querySelector("#project-form").reset();
    nameInput.focus();
  }

  updateProjectList() {
    const list = this.querySelector("#projects-list");
    const count = this.querySelector("#project-count");
    count.textContent = `${this.projects.length} ${this.projects.length === 1 ? "project" : "projects"}`;

    if (!this.projects.length) {
      list.innerHTML =
        '<div class="dashboard-empty projects-empty">No projects yet. Add your first app or website to start monitoring.</div>';
      return;
    }

    list.innerHTML = this.projects
      .map((project) => {
        const name = escapeHtml(project.name);
        const url = escapeHtml(project.website_url);
        const created_at = escapeHtml(formatDate(project.created_at));

        return `
      <article class="dashboard-inset-surface project-card">
        <div class="project-card-header">
          <h3 class="dashboard-title">${name}</h3>
        </div>
        <a class="project-url" href="${url}" target="_blank" rel="noreferrer">${url}</a>
        <div class="project-meta">Added ${created_at}</div>
        <div class="project-card-actions">
          <button class="secondary-action project-remove" type="button" data-remove-project="${project.id}">Remove</button>
          <button class="secondary-action project-copy-key" type="button" data-copy-key="${project.api_key}" data-default="Copy API Key">Copy API Key</button>
        </div>
      </article>
    `;
      })
      .join("");
  }

  updatePageData() {
    this.projects = loadProjects();
    this.updateProjectList();
  }
}

customElements.define("projects-page", ProjectsPage);
