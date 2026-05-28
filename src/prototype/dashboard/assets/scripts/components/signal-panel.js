import { relativeTime } from '../core/formatters.js';

export class SignalPanel extends HTMLElement {
  set signal(value) {
    this._signal = value;
    this.render();
  }

  render() {
    this.replaceChildren();
    if (!this._signal) return;

    const signal = this._signal;
    const row = document.createElement('article');
    row.className = 'event-row';

    const link = document.createElement('a');
    link.className = 'event-link';
    link.href = `#/issue?id=${encodeURIComponent(signal.id)}`;

    const badge = document.createElement('signal-badge');
    badge.signal = signal;

    const body = document.createElement('div');
    body.className = 'event-body';

    const message = document.createElement('div');
    message.className = 'event-message';
    message.textContent = signal.metadata?.comment || signal.metadata?.message || '(no message)';

    const meta = document.createElement('div');
    meta.className = 'event-meta';
    meta.textContent = `${signal.pathname || '-'} - ${relativeTime(signal.timestamp)} - ${signal.id}`;

    body.append(message, meta);
    link.append(badge, body);
    row.append(link);
    this.append(row);
  }
}

customElements.define('signal-panel', SignalPanel);
