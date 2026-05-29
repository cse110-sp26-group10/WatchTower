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
      // aria-label replaces title for screen readers; title stays for sighted mouse users
      this.setAttribute('aria-label', `Rating: ${rating} out of 5`);
      this.title = `${rating}/5`;
      // Wrap stars in aria-hidden so the symbol string isn't read out literally
      const stars = document.createElement('span');
      stars.setAttribute('aria-hidden', 'true');
      stars.textContent = starsForRating(rating);
      this.append(stars);
      return;
    }

    const severity = this._signal.metadata?.severity || 'info';
    this.className = `severity-badge sev-${severity}`;
    this.setAttribute('aria-label', `Severity: ${severity}`);
    this.textContent = severity;
  }
}

customElements.define('signal-badge', SignalBadge);
