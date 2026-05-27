import { dataStore } from '../core/data-store.js';
import { relativeTime } from '../core/formatters.js';

export class IssuePage extends HTMLElement {
  set route(value) {
    this._route = value;
  }

  connectedCallback() {
    this.render();
  }

  render() {
    const id = this._route?.params.get('id');
    const event = id ? dataStore.getEvent(id) : null;

    const page = document.createElement('div');
    page.className = 'page-stack';

    const back = document.createElement('a');
    back.className = 'back-link';
    back.href = '#/errors';
    back.textContent = 'back to signals';

    const panel = document.createElement('section');
    panel.className = 'panel';

    if (!event) {
      panel.textContent = 'Signal not found.';
    } else {
      const title = document.createElement('h1');
      title.textContent = event.metadata?.message || event.metadata?.comment || event.event_type;

      const meta = document.createElement('p');
      meta.className = 'event-meta';
      meta.textContent = `${event.pathname || '-'} - ${relativeTime(event.timestamp)} - ${event.id}`;

      panel.append(title, meta);
    }

    page.append(back, panel);
    this.replaceChildren(page);
  }
}

customElements.define('issue-page', IssuePage);
