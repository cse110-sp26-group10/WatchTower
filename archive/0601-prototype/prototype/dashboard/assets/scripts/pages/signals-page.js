import { dataStore } from "../core/data-store.js";
import { deploymentScope } from "../core/deployment-scope.js";
import { resolvedSignals } from "../core/resolved-signals.js";
import { groupErrors } from "../core/signal-groups.js";

/**
 * THIS FILE IS ONLY FOR REFERENCE! Previously, the errors and feedback page just displayed the same content, except filtered
 * out to their type. In the new wireframes, the feedback and error pages are completely different and thus cannot use the
 * same js file anymore. This file remains just to display logic for getting signals, etc... and will be removed once the
 * other pages are built out.
 */
export class SignalsPage extends HTMLElement {
  set route(value) {
    this._route = value;
  }

  connectedCallback() {
    this.unsubscribe = deploymentScope.subscribe(() => this.render());
  }

  disconnectedCallback() {
    this.unsubscribe?.();
  }

  get mode() {
    return this._route?.path === "/feedback" ? "feedback" : "errors";
  }

  render() {
    const eventType = this.mode === "feedback" ? "survey" : "error";
    const signals = dataStore
      .getEvents({ deploymentId: deploymentScope.id })
      .filter((event) => event.event_type === eventType)
      .filter(
        (event) => this.mode !== "errors" || !resolvedSignals.isResolved(event),
      );

    const page = document.createElement("div");
    page.className = "page-stack";

    const filter = document.createElement("deployment-filter");
    const title = document.createElement("header");
    title.className = "panel-header";
    title.textContent = this.mode === "feedback" ? "User Feedback" : "Errors";

    const list = document.createElement("section");
    list.className = "panel";

    if (signals.length === 0) {
      list.textContent =
        this.mode === "feedback"
          ? "No survey responses yet."
          : "No errors recorded.";
    } else if (this.mode === "errors") {
      for (const group of groupErrors(signals)) {
        const item = document.createElement("article");
        item.className = "event-row";
        item.textContent = `${group.message}${group.count > 1 ? ` x${group.count}` : ""}`;
        list.append(item);
      }
    } else {
      for (const signal of signals) {
        const item = document.createElement("article");
        item.className = "event-row";
        item.textContent =
          signal.metadata?.comment ||
          signal.metadata?.message ||
          "(no message)";
        list.append(item);
      }
    }

    page.append(filter, title, list);
    this.replaceChildren(page);
  }
}

customElements.define("signals-page", SignalsPage);
