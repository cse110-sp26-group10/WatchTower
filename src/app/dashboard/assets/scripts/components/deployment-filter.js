import { dataStore } from "../core/data-store.js";
import { deploymentScope } from "../core/deployment-scope.js";

const ALL_ID = "all";

/**
 * Deployment select dropdown menu
 */
export class DeploymentFilter extends HTMLElement {
  connectedCallback() {
    // 1. Initial render build
    this.render();

    // 2. Safely follow state changes
    this.unsubscribe = deploymentScope.subscribe(() => {
      // If options haven't populated yet, force a full options redraw
      if (this.selectElement && this.selectElement.options.length <= 1) {
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
    select.id = "deployment-filter";
    select.className = "filter-select";
    select.setAttribute("aria-label", "Filter by deployment");

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
    allOption.textContent = "All deployments";
    select.append(allOption);

    // 4. Populate list from data store array
    const deployments = dataStore.getDeployments() || [];
    for (const deployment of deployments) {
      const option = document.createElement("option");
      option.value = deployment.id;
      // Keep dropdown names beautifully clean
      option.textContent = deployment.id;
      select.append(option);
    }

    // 5. Change update cycle execution loop
    select.addEventListener("change", () => {
      if (typeof deploymentScope.set === "function") {
        deploymentScope.set(select.value);
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
    const currentId = deploymentScope.id || ALL_ID;
    this.selectElement.value = currentId;
  }
}

customElements.define("deployment-filter", DeploymentFilter);
