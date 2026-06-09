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
          <h1>Projects</h1>
          <p>Add the apps and websites you want WatchTower to monitor.</p>
        </div>
      </section>

      <section class="projects-layout">
        <form class="project-form" id="project-form" novalidate>
          <div class="project-form-heading">
            <h2>Add Project</h2>
            <span id="project-count"></span>
          </div>

          <label class="project-field">
            <span>Name</span>
            <input id="project-name" name="name" type="text" placeholder="Example Project" autocomplete="off" required>
          </label>

          <label class="project-field">
            <span>Website or App URL</span>
            <input id="project-url" name="url" type="url" placeholder="https://example.com" autocomplete="off" required>
          </label>

          <p class="project-error" id="project-error" aria-live="polite" hidden></p>

          <button class="project-submit" type="submit">Add Project</button>
        </form>

        <div class="projects-list-wrap">
          <div class="projects-list-heading">
            <h2>Your Projects</h2>
          </div>
          <div class="projects-list" id="projects-list"></div>
        </div>
      </section>

      <style>
        .projects-header {
          display: flex;
          align-items: flex-end;
          justify-content: space-between;
          gap: 1rem;
        }

        .projects-header h1,
        .project-form-heading h2,
        .projects-list-heading h2 {
          margin: 0;
          color: var(--wt-text);
        }

        .projects-header h1 {
          font-size: 1.5rem;
          line-height: 1.2;
        }

        .projects-header p {
          margin: 0.35rem 0 0;
          color: var(--wt-text-2);
        }

        .projects-layout {
          display: grid;
          grid-template-columns: minmax(18rem, 24rem) minmax(0, 1fr);
          gap: 1rem;
          align-items: start;
        }

        @media (max-width: 56rem) {
          .projects-layout {
            grid-template-columns: 1fr;
          }
        }

        .project-form,
        .projects-list-wrap {
          background: var(--wt-surface);
          border: 1px solid var(--wt-border);
          border-radius: var(--wt-radius-md);
          padding: 1rem;
        }

        .project-form {
          display: flex;
          flex-direction: column;
          gap: 0.875rem;
          position: sticky;
          top: 1rem;
        }

        @media (max-width: 56rem) {
          .project-form {
            position: static;
          }
        }

        .project-form-heading,
        .projects-list-heading {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 1rem;
          margin-bottom: 0.25rem;
        }

        .project-form-heading h2,
        .projects-list-heading h2 {
          font-size: 1rem;
        }

        #project-count {
          color: var(--wt-text-3);
          font-size: 0.75rem;
          white-space: nowrap;
        }

        .project-field {
          display: flex;
          flex-direction: column;
          gap: 0.375rem;
          color: var(--wt-text-2);
          font-size: 0.8125rem;
          font-weight: 600;
        }

        .project-field input {
          width: 100%;
          min-height: 2.625rem;
          border: 1px solid var(--wt-border);
          border-radius: var(--wt-radius-md);
          background: var(--wt-surface-2);
          color: var(--wt-text);
          font: inherit;
          font-weight: 400;
          padding: 0.625rem 0.75rem;
          outline: none;
        }

        .project-field input:focus {
          border-color: var(--color-active);
          box-shadow: 0 0 0 3px var(--color-active-bg);
        }

        .project-field input.is-invalid {
          border-color: var(--wt-danger);
          box-shadow: 0 0 0 3px var(--color-crit-bg);
        }

        .project-error {
          margin: 0;
          color: var(--wt-danger);
          font-size: 0.8125rem;
        }

        .project-submit {
          min-height: 2.625rem;
          border: 0;
          border-radius: var(--wt-radius-md);
          background: var(--color-active);
          color: #fff;
          cursor: pointer;
          font: inherit;
          font-weight: 700;
        }

        .project-submit:hover {
          opacity: 0.9;
        }

        .projects-list {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(16rem, 1fr));
          gap: 0.75rem;
          margin-top: 0.875rem;
        }

        .project-card {
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
          border: 1px solid var(--wt-border);
          border-radius: var(--wt-radius-md);
          background: var(--wt-surface-2);
          padding: 1rem;
        }

        .project-card-header {
          display: flex;
          justify-content: space-between;
          gap: 0.75rem;
          align-items: flex-start;
        }

        .project-card h3 {
          margin: 0;
          color: var(--wt-text);
          font-size: 1rem;
          line-height: 1.3;
          overflow-wrap: anywhere;
        }

        .project-url {
          color: var(--color-active);
          text-decoration: none;
          overflow-wrap: anywhere;
          font-size: 0.8125rem;
        }

        .project-url:hover {
          text-decoration: underline;
        }

        .project-meta {
          margin-top: auto;
          color: var(--wt-text-3);
          font-size: 0.75rem;
        }

        .project-remove {
          align-self: flex-start;
          border: 1px solid var(--wt-border);
          border-radius: var(--wt-radius-sm);
          background: var(--wt-surface);
          color: var(--wt-text-2);
          cursor: pointer;
          font: inherit;
          font-size: 0.75rem;
          font-weight: 700;
          padding: 0.35rem 0.55rem;
        }

        .project-remove:hover {
          color: var(--wt-danger);
          border-color: var(--wt-danger);
        }

        .projects-empty {
          border: 1px dashed var(--wt-border);
          border-radius: var(--wt-radius-md);
          color: var(--wt-text-2);
          padding: 1rem;
          text-align: center;
        }
      </style>
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
        const button = event.target.closest("[data-remove-project]");
        if (!button) return;
        const error = await dataStore.deleteProject(
          Number.parseInt(button.dataset.removeProject),
        );
        if (error) return;
        this.updatePageData();
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
        '<div class="projects-empty">No projects yet. Add your first app or website to start monitoring.</div>';
      return;
    }

    list.innerHTML = this.projects
      .map((project) => {
        const name = escapeHtml(project.name);
        const url = escapeHtml(project.website_url);
        const created_at = escapeHtml(formatDate(project.created_at));

        return `
      <article class="project-card">
        <div class="project-card-header">
          <h3>${name}</h3>
        </div>
        <a class="project-url" href="${url}" target="_blank" rel="noreferrer">${url}</a>
        <div class="project-meta">Added ${created_at}</div>
        <button class="project-remove" type="button" data-remove-project="${project.id}">Remove</button>
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
