export class HomePathCountList extends HTMLElement {
  static get observedAttributes() {
    return ['empty-message'];
  }

  set pathCounts(value) {
    this._pathCounts = value || {};
    this.render();
  }

  connectedCallback() {
    this.render();
  }

  attributeChangedCallback() {
    this.render();
  }

  render() {
    this.replaceChildren();
    const entries = Object.entries(this._pathCounts || {});

    if (!entries.length) {
      const empty = document.createElement('div');
      empty.style.color = 'var(--wt-text-3)';
      empty.style.fontSize = '12px';
      empty.textContent = this.getAttribute('empty-message') || 'No activity tracked';
      this.append(empty);
      return;
    }

    for (const [path, count] of entries) {
      const row = document.createElement('div');
      row.className = 'interactive-data-row';
      row.style.padding = '8px 12px';

      const label = document.createElement('span');
      label.className = 'row-primary-text';
      label.style.fontFamily = 'monospace';
      label.style.fontSize = '12px';
      label.textContent = path;

      const badge = document.createElement('span');
      badge.style.background = 'var(--wt-surface)';
      badge.style.color = 'var(--wt-text)';
      badge.style.fontWeight = '700';
      badge.style.fontSize = '11px';
      badge.style.padding = '2px 6px';
      badge.style.borderRadius = 'var(--wt-radius-sm)';
      badge.style.border = '1px solid var(--wt-border)';
      badge.textContent = count;

      row.append(label, badge);
      this.append(row);
    }
  }
}

customElements.define('home-path-count-list', HomePathCountList);
