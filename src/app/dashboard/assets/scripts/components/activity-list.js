/**
 * Component that lists recent activity, such as page loads, clicks, and errors.
 */
export class ActivityList extends HTMLElement {
  set events(value) {
    this._events = Array.isArray(value) ? value : [];
    this.render();
  }

  connectedCallback() {
    this.style.display = 'flex';
    this.style.flexDirection = 'column';
    this.style.gap = '8px';
    this.render();
  }

  render() {
    this.replaceChildren();

    if (!this._events?.length) {
      const empty = document.createElement('div');
      empty.style.color = 'var(--wt-text-3)';
      empty.style.fontSize = '12px';
      empty.textContent = 'No recent activity logs stream';
      this.append(empty);
      return;
    }

    for (const event of this._events.slice(0, 4)) {
      const isError = event.event_type === 'error';
      const row = document.createElement(isError ? 'button' : 'div');
      row.className = 'interactive-data-row';
      row.style.padding = '8px 12px';

      if (isError) {
        row.classList.add('error-click-target-btn');
        row.type = 'button';
        row.dataset.errorId = event.id;
        row.addEventListener('click', () => this.dispatchErrorSelected(event.id));
      }

      const body = document.createElement('div');
      body.style.display = 'flex';
      body.style.alignItems = 'center';
      body.style.gap = '8px';
      body.style.minWidth = '0';

      const typeColor = this.getTypeColor(event.event_type);
      const dot = document.createElement('span');
      dot.style.width = '6px';
      dot.style.height = '6px';
      dot.style.backgroundColor = typeColor;
      dot.style.borderRadius = '50%';
      dot.style.flexShrink = '0';

      const label = document.createElement('span');
      label.className = 'row-primary-text';
      label.style.fontSize = '12px';

      const type = document.createElement('b');
      type.style.color = typeColor;
      type.textContent = event.event_type.toUpperCase();

      label.append(type, `: ${isError ? event.metadata?.message || event.pathname : event.pathname}`);
      body.append(dot, label);
      row.append(body);
      this.append(row);
    }
  }

  getTypeColor(type) {
    if (type === 'error') return 'var(--wt-danger)';
    if (type === 'page_load') return 'var(--wt-success)';
    if (type === 'survey') return 'var(--wt-warning)';
    return 'var(--wt-info)';
  }

  dispatchErrorSelected(errorId) {
    this.dispatchEvent(new CustomEvent('error-selected', {
      bubbles: true,
      detail: { errorId },
    }));
  }
}

customElements.define('activity-list', ActivityList);
