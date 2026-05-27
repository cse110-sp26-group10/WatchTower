import { relativeTime } from '../core/formatters.js';

export class GroupedErrorPanel extends HTMLElement {
  set group(value) {
    this._group = value;
    this.render();
  }

  render() {
    this.replaceChildren();
    if (!this._group) return;

    const group = this._group;
    const signal = group.latestSignal;
    const details = document.createElement('details');
    details.className = 'panel';

    const summary = document.createElement('summary');
    summary.className = 'event-link';

    const badge = document.createElement('signal-badge');
    badge.signal = signal;

    const body = document.createElement('div');
    body.className = 'event-body';

    const message = document.createElement('div');
    message.className = 'event-message';
    message.textContent = `${group.message}${group.count > 1 ? ` x${group.count}` : ''}`;

    const meta = document.createElement('div');
    meta.className = 'event-meta';
    meta.textContent = `${signal.pathname || '-'} - last ${relativeTime(signal.timestamp)}`;

    body.append(message, meta);
    summary.append(badge, body);
    details.append(summary);
    this.append(details);
  }
}

customElements.define('grouped-error-panel', GroupedErrorPanel);
