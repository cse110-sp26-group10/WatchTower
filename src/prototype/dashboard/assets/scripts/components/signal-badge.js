import { starsForRating } from '../core/formatters.js';

export class SignalBadge extends HTMLElement {
  set signal(value) {
    this._signal = value;
    this.render();
  }

  render() {
    this.replaceChildren();
    if (!this._signal) return;

    if (this._signal.event_type === 'survey') {
      const rating = Number(this._signal.metadata?.rating || 0);
      this.className = `rating-badge ${rating <= 2 ? 'rating-low' : rating >= 4 ? 'rating-high' : 'rating-mid'}`;
      this.title = `${rating}/5`;
      this.textContent = starsForRating(rating);
      return;
    }

    const severity = this._signal.metadata?.severity || 'info';
    this.className = `severity-badge sev-${severity}`;
    this.textContent = severity;
  }
}

customElements.define('signal-badge', SignalBadge);
