import { relativeTime } from '../core/formatters.js';

export class HomeErrorList extends HTMLElement {
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
      this.appendEmptyState('No active system errors found.');
      return;
    }

    for (const error of this._errors) {
      const row = document.createElement('button');
      row.className = 'interactive-data-row error-click-target-btn';
      row.type = 'button';
      row.dataset.errorId = error.id;
      row.addEventListener('click', () => this.dispatchErrorSelected(error.id));

      const left = document.createElement('div');
      left.className = 'row-left-group';

      const severity = document.createElement('span');
      severity.style.color = 'var(--wt-danger)';
      severity.style.fontWeight = '700';
      severity.style.fontFamily = 'monospace';
      severity.style.fontSize = '11px';
      severity.textContent = `[${error.metadata?.severity?.toUpperCase() || 'CRITICAL'}]`;

      const details = document.createElement('div');
      details.className = 'row-details-wrapper';

      const message = document.createElement('span');
      message.className = 'row-primary-text';
      message.textContent = error.metadata?.message || 'Error Event';

      const path = document.createElement('span');
      path.className = 'row-secondary-text';
      path.textContent = `Path: ${error.pathname || '-'}`;

      const timestamp = document.createElement('span');
      timestamp.className = 'row-right-timestamp';
      timestamp.textContent = relativeTime(error.timestamp);

      details.append(message, path);
      left.append(severity, details);
      row.append(left, timestamp);
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

  dispatchErrorSelected(errorId) {
    this.dispatchEvent(new CustomEvent('home-error-selected', {
      bubbles: true,
      detail: { errorId },
    }));
  }
}

customElements.define('home-error-list', HomeErrorList);
