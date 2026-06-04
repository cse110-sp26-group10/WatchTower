import { starsForRating } from '../core/formatters.js';

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
      this.appendEmptyState('No user feedback entries.');
      return;
    }

    for (const survey of this._surveys) {
      const row = document.createElement('div');
      row.className = 'interactive-data-row';

      const left = document.createElement('div');
      left.className = 'row-left-group';

      const details = document.createElement('div');
      details.className = 'row-details-wrapper';

      const stars = document.createElement('span');
      stars.style.color = 'var(--wt-warning)';
      stars.style.fontWeight = '700';
      stars.style.fontSize = '12px';
      stars.style.letterSpacing = '2px';
      stars.textContent = starsForRating(survey.metadata?.rating || 0);

      const comment = document.createElement('span');
      comment.className = 'row-primary-text';
      comment.style.fontStyle = 'italic';
      comment.style.fontWeight = '500';
      comment.textContent = `"${survey.metadata?.message || 'No text comment provided.'}"`;

      details.append(stars, comment);
      left.append(details);
      row.append(left);
      this.append(row);
    }
  }

  appendEmptyState(message) {
    const empty = document.createElement('div');
    empty.style.padding = '12px';
    empty.style.textAlign = 'center';
    empty.style.color = 'var(--wt-text-3)';
    empty.textContent = message;
    this.append(empty);
  }
}

customElements.define('feedback-list', FeedbackList);
