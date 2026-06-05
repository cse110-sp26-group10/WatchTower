import { starsForRating } from "../core/formatters.js";

/**
 * Component that lists feedback, grouping identical ones
 */
export class FeedbackList extends HTMLElement {
  set surveys(value) {
    this._surveys = Array.isArray(value) ? value : [];
    this.render();
  }

  connectedCallback() {
    this.render();
  }

  render() {
    this.replaceChildren();

    if (!this._surveys?.length) {
      this.appendEmptyState("No user feedback entries.");
      return;
    }

    for (const survey of this._surveys) {
      const row = document.createElement("div");
      row.className = "interactive-data-row";

      const left = document.createElement("div");
      left.className = "row-left-group";

      const details = document.createElement("div");
      details.className = "row-details-wrapper";

      const stars = document.createElement("span");
      stars.className = "feedback-stars";
      stars.textContent = starsForRating(survey.metadata?.rating || 0);

      const comment = document.createElement("span");
      comment.className = "row-primary-text feedback-comment";
      comment.textContent = `"${survey.metadata?.message || "No text comment provided."}"`;

      details.append(stars, comment);
      left.append(details);
      row.append(left);
      this.append(row);
    }
  }

  appendEmptyState(message) {
    const empty = document.createElement("div");
    empty.className = "list-empty";
    empty.textContent = message;
    this.append(empty);
  }
}

customElements.define("feedback-list", FeedbackList);
