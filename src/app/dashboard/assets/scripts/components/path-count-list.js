/**
 * Component that lists the visits to each path on a tracked app
 */
export class PathCountList extends HTMLElement {
  static get observedAttributes() {
    return ["empty-message"];
  }

  set pathCounts(value) {
    this._pathCounts = value || {};
    this.render();
  }

  connectedCallback() {
    this.render();
  }

  attributeChangedCallback() {
    this.render();
  }

  render() {
    this.replaceChildren();
    const entries = Object.entries(this._pathCounts || {});

    if (!entries.length) {
      const empty = document.createElement("div");
      empty.className = "activity-empty";
      empty.textContent =
        this.getAttribute("empty-message") || "No activity tracked";
      this.append(empty);
      return;
    }

    for (const [path, count] of entries) {
      const row = document.createElement("div");
      row.className = "interactive-data-row is-compact";

      const label = document.createElement("span");
      label.className = "row-primary-text path-count-label";
      label.textContent = path;

      const badge = document.createElement("span");
      badge.className = "count-badge";
      badge.textContent = count;

      row.append(label, badge);
      this.append(row);
    }
  }
}

customElements.define("path-count-list", PathCountList);
