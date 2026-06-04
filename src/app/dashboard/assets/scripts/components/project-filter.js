import { dataStore } from "../core/data-store.js";
import { projectScope } from "../core/project-scope.js";

const ALL_ID = "all";

/**
 * Component that filters displayed values by project
 */
export class ProjectFilter extends HTMLElement {
  connectedCallback() {
    // 1. Initial render build
    this.render();

    // 2. Safely follow state changes
    this.unsubscribe = projectScope.subscribe(() => {
      // If options haven't populated yet, force a full options redraw
      if (this.selectElement && this.selectElement.options.length <= 1) {
        this.render();
      } else {
        this.syncSelectValue();
      }
    });

    document.addEventListener("watchtower:data-update", () => {
      const projects = new Set(
        dataStore.getProjects().map((project) => project.id),
      ).add(ALL_ID);
      const options = new Set(
        Array.from(this.selectElement.options).map((select) =>
          isNaN(select.value) ? select.value : Number(select.value),
        ),
      );
      if (projects.size === options.size && projects.isSubsetOf(options)) {
        // If the two sets are identical (no change occurred)
        return;
      }
      if (!projects.has(projectScope.id)) {
        // Selected project no longer exists
        projectScope.set(ALL_ID);
      }
      if (this.selectElement) {
        this.render();
      } else {
        this.syncSelectValue();
      }
    });
  }

  disconnectedCallback() {
    this.unsubscribe?.();
  }

  render() {
    // 1. Create the select dropdown menu
    const select = document.createElement("select");
    select.id = "project-filter";
    select.className = "filter-select";
    select.setAttribute("aria-label", "Filter by project");

    select.style = `
      padding: 4px 8px;
      font-size: 13px;
      font-weight: 600;
      color: var(--wt-text);
      background-color: var(--wt-surface-2);
      border: 1px solid var(--wt-border);
      border-radius: var(--wt-radius-sm, 4px);
      cursor: pointer;
    `;

    // 2. Save an instance property reference so syncSelectValue() can find it!
    this.selectElement = select;

    // 3. Add default item
    const allOption = document.createElement("option");
    allOption.value = ALL_ID;
    allOption.textContent = "All projects";
    select.append(allOption);

    // 4. Populate list from data store array
    const projects = dataStore.getProjects() || [];
    for (const project of projects) {
      const option = document.createElement("option");
      option.value = project.id;
      // Keep dropdown names beautifully clean
      option.textContent = `${project.name} (${project.id})`;
      select.append(option);
    }

    // 5. Change update cycle execution loop
    select.addEventListener("change", () => {
      if (typeof projectScope.set === "function") {
        projectScope.set(
          isNaN(select.value) ? select.value : Number(select.value),
        );
      }
    });

    // 6. Complete cleanup: clear out everything and append ONLY the dropdown element
    this.innerHTML = "";
    this.append(select);

    // Initial sync alignment step
    this.syncSelectValue();
  }

  syncSelectValue() {
    if (!this.selectElement) return;
    const currentId = projectScope.id || ALL_ID;
    this.selectElement.value = currentId;
  }
}

customElements.define("project-filter", ProjectFilter);
