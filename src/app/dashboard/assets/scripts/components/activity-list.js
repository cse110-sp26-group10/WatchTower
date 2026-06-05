/**
 * Component that lists recent activity, such as page loads, clicks, and errors.
 */
export class ActivityList extends HTMLElement {
  set events(value) {
    this._events = Array.isArray(value) ? value : [];
    this.render();
  }

  connectedCallback() {
    this.render();
  }

  render() {
    this.replaceChildren();

    if (!this._events?.length) {
      const empty = document.createElement("div");
      empty.className = "activity-empty";
      empty.textContent = "No recent activity logs stream";
      this.append(empty);
      return;
    }

    for (const event of this._events.slice(0, 4)) {
      const isError = event.event_type === "error";
      const row = document.createElement(isError ? "button" : "div");
      row.className = "interactive-data-row is-compact";

      if (isError) {
        row.classList.add("error-click-target-btn");
        row.type = "button";
        row.dataset.errorId = event.id;
        row.addEventListener("click", () =>
          this.dispatchErrorSelected(event.id),
        );
      }

      const body = document.createElement("div");
      body.className = `activity-event-body ${this.getTypeClass(event.event_type)}`;

      const dot = document.createElement("span");
      dot.className = "activity-event-dot";

      const label = document.createElement("span");
      label.className = "row-primary-text activity-event-label";

      const type = document.createElement("b");
      type.className = "activity-event-type";
      type.textContent = event.event_type.toUpperCase();

      label.append(
        type,
        `: ${isError ? event.metadata?.message || event.pathname : event.pathname}`,
      );
      body.append(dot, label);
      row.append(body);
      this.append(row);
    }
  }

  getTypeClass(type) {
    if (type === "error") return "is-error";
    if (type === "page_load") return "is-page-load";
    if (type === "survey") return "is-survey";
    return "is-info";
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

customElements.define("activity-list", ActivityList);
