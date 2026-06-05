import { relativeTime } from "../core/formatters.js";

/**
 * Component that lists errors, grouping identical ones
 */
export class ErrorList extends HTMLElement {
  set errors(value) {
    this._errors = Array.isArray(value) ? value : [];
    this.render();
  }

  connectedCallback() {
    this.render();
  }

  render() {
    this.replaceChildren();

    if (!this._errors?.length) {
      this.appendEmptyState("No active system errors found.");
      return;
    }

    for (const group of this.groupErrors(this._errors)) {
      const { error, count } = group;
      const row = document.createElement("div");
      row.className = "interactive-data-row error-click-target-btn";
      row.setAttribute("role", "button");
      row.tabIndex = 0;
      row.dataset.errorId = error.id;
      row.addEventListener("click", () => this.dispatchErrorSelected(error.id));

      const left = document.createElement("div");
      left.className = "row-left-group";

      const severity = document.createElement("span");
      severity.className = `severity-label ${this.getSeverityClass(error)}`;
      severity.textContent = `[${error.metadata?.severity?.toUpperCase() || "CRITICAL"}]`;

      const details = document.createElement("div");
      details.className = "row-details-wrapper";

      const message = document.createElement("span");
      message.className = "row-primary-text";
      message.textContent = error.metadata?.message || "Error Event";

      const path = document.createElement("span");
      path.className = "row-secondary-text";
      path.textContent = `Path: ${error.pathname || "-"}`;

      details.append(message, path);
      left.append(severity, details);
      row.append(left);

      // Right-side group: occurrence count (when stacked) + latest timestamp
      const right = document.createElement("div");
      right.className = "row-inline-group";

      if (count > 1) {
        const countBadge = document.createElement("span");
        countBadge.className = "count-badge";
        countBadge.textContent = `×${count}`;
        countBadge.title = `${count} occurrences`;
        right.append(countBadge);
      }

      const timestamp = document.createElement("span");
      timestamp.className = "row-right-timestamp";
      timestamp.textContent = relativeTime(error.timestamp);
      right.append(timestamp);

      row.append(right);
      this.append(row);

      const fixBtn = document.createElement("button");
      fixBtn.type = "button";
      fixBtn.className = "fix-error-btn";
      fixBtn.textContent = "Mark as Fixed";
      fixBtn.addEventListener("click", (e) => {
        e.stopPropagation();
        this.resolveError(group);
      });
      right.append(fixBtn);
    }
  }

  // Collapse identical errors (same severity + message + path) into one row,
  // keeping the most recent occurrence as the representative and counting the rest.
  groupErrors(errors) {
    const groups = new Map();
    for (const error of errors) {
      const severity = error.metadata?.severity?.toLowerCase() || "critical";
      const message = error.metadata?.message || "Error Event";
      const key = `${severity}|${message}|${error.pathname || "-"}`;

      const existing = groups.get(key);
      if (!existing) {
        groups.set(key, { error, count: 1, ids: [error.id] });
      } else {
        existing.count += 1;
        existing.ids.push(error.id);
        // Keep whichever occurrence is newest as the representative.
        if (new Date(error.timestamp) > new Date(existing.error.timestamp)) {
          existing.error = error;
        }
      }
    }
    return [...groups.values()];
  }

  appendEmptyState(message) {
    const empty = document.createElement("div");
    empty.className = "list-empty";
    empty.textContent = message;
    this.append(empty);
  }

  getSeverityClass(error) {
    return error.metadata?.severity?.toLowerCase() === "warning"
      ? "is-warning"
      : "is-critical";
  }

  dispatchErrorSelected(errorId) {
    this.dispatchEvent(
      new CustomEvent("error-selected", {
        bubbles: true,
        detail: { errorId },
      }),
    );
  }

  // Resolve every occurrence in the group so the row does not reappear on the
  // next fetch. The errors page listens for this and calls the data store.
  resolveError(group) {
    this.dispatchEvent(
      new CustomEvent("error-resolve", {
        bubbles: true,
        detail: { ids: group.ids },
      }),
    );
  }
}

customElements.define("error-list", ErrorList);
