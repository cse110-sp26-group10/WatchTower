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
      const row = document.createElement("button");
      row.className = "interactive-data-row error-click-target-btn";
      row.type = "button";
      row.dataset.errorId = error.id;
      row.addEventListener("click", () => this.dispatchErrorSelected(error.id));

      const left = document.createElement("div");
      left.className = "row-left-group";

      const severity = document.createElement("span");
      severity.style.color = this.getSeverityColor(error);
      severity.style.fontWeight = "700";
      severity.style.fontFamily = "monospace";
      severity.style.fontSize = "11px";
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
      right.style.display = "flex";
      right.style.alignItems = "center";
      right.style.gap = "8px";

      if (count > 1) {
        const countBadge = document.createElement("span");
        countBadge.style.background = "var(--wt-surface)";
        countBadge.style.color = "var(--wt-text)";
        countBadge.style.fontWeight = "700";
        countBadge.style.fontSize = "11px";
        countBadge.style.padding = "2px 6px";
        countBadge.style.borderRadius = "var(--wt-radius-sm)";
        countBadge.style.border = "1px solid var(--wt-border)";
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
        groups.set(key, { error, count: 1 });
      } else {
        existing.count += 1;
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
    empty.style.padding = "12px";
    empty.style.textAlign = "center";
    empty.style.color = "var(--wt-text-3)";
    empty.textContent = message;
    this.append(empty);
  }

  getSeverityColor(error) {
    return error.metadata?.severity?.toLowerCase() === "warning"
      ? "var(--wt-warning)"
      : "var(--wt-danger)";
  }

  dispatchErrorSelected(errorId) {
    this.dispatchEvent(
      new CustomEvent("error-selected", {
        bubbles: true,
        detail: { errorId },
      }),
    );
  }
}

customElements.define("error-list", ErrorList);
