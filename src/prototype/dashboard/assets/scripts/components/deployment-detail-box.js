import { relativeTime } from '../core/formatters.js';

export class DeploymentDetailBox extends HTMLElement {
  set deployment(value) {
    this._deployment = value;
    this.render();
  }

  connectedCallback() {
    this.render();
  }

  render() {
    this.replaceChildren();
    this.hidden = !this._deployment;
    if (!this._deployment) return;

    const rows = [
      ['id', this._deployment.id],
      ['version', this._deployment.version],
      ['commit', this._deployment.commit_hash, true],
      ['author', this._deployment.author || '-'],
      ['deployed', this._deployment.deployed_at ? relativeTime(this._deployment.deployed_at) : '-'],
    ];

    for (const [key, value, mono] of rows) {
      const field = document.createElement('div');
      field.className = 'dep-field';

      const keyEl = document.createElement('span');
      keyEl.className = 'dep-key';
      keyEl.textContent = key;

      const valueEl = document.createElement('span');
      valueEl.className = mono ? 'dep-val mono' : 'dep-val';
      valueEl.textContent = value || '-';

      field.append(keyEl, valueEl);
      this.append(field);
    }
  }
}

customElements.define('deployment-detail-box', DeploymentDetailBox);
