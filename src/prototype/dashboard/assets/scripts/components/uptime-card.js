export class UptimeCard extends HTMLElement {
  set uptime(value) {
    this._uptime = value;
    this.render();
  }

  connectedCallback() {
    this.render();
  }

  render() {
    const uptime = this._uptime;
    this.replaceChildren();

    if (!uptime) {
      const empty = document.createElement("div");
      empty.className = "uptime-empty";
      empty.textContent = "No uptime checks tracked.";
      this.append(empty, this.styles());
      return;
    }

    const card = document.createElement("section");
    card.className = "uptime-card";
    card.innerHTML = `
      <div class="uptime-panel-header">
        <h2>Uptime</h2>
        <span>${uptime.uptimePercent}% online</span>
      </div>

      <div class="uptime-card-top">
        <div class="uptime-identity">
          <h3>${uptime.name}</h3>
          <p>${uptime.category} <span aria-hidden="true">•</span> ${uptime.url}</p>
        </div>
        <span class="uptime-status ${uptime.isHealthy ? "is-healthy" : "is-down"}">
          <span class="uptime-status-dot"></span>
          ${uptime.isHealthy ? "Healthy" : "Down"}
        </span>
      </div>

      <div class="uptime-latency">~${uptime.latency}ms</div>

      <div class="uptime-bars" aria-label="${uptime.uptimePercent}% uptime over the last 9 hours">
        ${uptime.checks
          .map(
            (check) => `
          <span
            class="uptime-bar ${check.is_up ? "is-up" : "is-down"}"
            title="${check.is_up ? "Up" : "Down"} - ${check.status || "unknown"}"
          ></span>
        `,
          )
          .join("")}
      </div>

      <div class="uptime-range">
        <span>${uptime.rangeStartLabel}</span>
        <span>${uptime.rangeEndLabel}</span>
      </div>
    `;

    this.append(card, this.styles());
  }

  styles() {
    const style = document.createElement("style");
    style.textContent = `
      :host {
        display: block;
      }

      .uptime-card {
        background: var(--wt-surface);
        border: 1px solid var(--wt-border);
        border-radius: var(--wt-radius-md);
        padding: 1.25rem;
        display: flex;
        flex-direction: column;
        gap: 0.85rem;
        min-height: 100%;
      }

      .uptime-panel-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 1rem;
        padding-bottom: 0.25rem;
      }

      .uptime-panel-header h2 {
        margin: 0;
        color: var(--wt-text);
        font-size: 0.875rem;
        font-weight: 700;
      }

      .uptime-panel-header span {
        color: var(--wt-text-3);
        font-size: 0.6875rem;
      }

      .uptime-card-top {
        display: flex;
        align-items: flex-start;
        justify-content: space-between;
        gap: 1rem;
      }

      .uptime-identity h3 {
        margin: 0;
        color: var(--wt-text);
        font-size: 1rem;
        line-height: 1.2;
      }

      .uptime-identity p {
        margin: 0.25rem 0 0;
        color: var(--wt-text-2);
        font-size: 0.8125rem;
        font-weight: 600;
      }

      .uptime-status {
        display: inline-flex;
        align-items: center;
        gap: 0.45rem;
        border-radius: 999px;
        color: #fff;
        font-size: 0.75rem;
        font-weight: 800;
        line-height: 1;
        padding: 0.45rem 0.65rem;
        white-space: nowrap;
      }

      .uptime-status.is-healthy {
        background: var(--wt-success);
      }

      .uptime-status.is-down {
        background: var(--wt-danger);
      }

      .uptime-status-dot {
        width: 0.55rem;
        height: 0.55rem;
        border-radius: 50%;
        background: rgba(255, 255, 255, 0.3);
      }

      .uptime-latency {
        align-self: flex-end;
        color: var(--wt-text-2);
        font-size: 0.75rem;
        font-weight: 700;
        margin-bottom: -0.25rem;
      }

      .uptime-bars {
        display: grid;
        grid-template-columns: repeat(48, minmax(0, 1fr));
        gap: 0.2rem;
        min-height: 1.75rem;
        align-items: end;
      }

      .uptime-bar {
        display: block;
        min-width: 0.25rem;
        height: 1.75rem;
        border-radius: 999px;
      }

      .uptime-bar.is-up {
        background: var(--wt-success);
      }

      .uptime-bar.is-down {
        background: var(--wt-danger);
      }

      .uptime-range {
        display: flex;
        justify-content: space-between;
        gap: 1rem;
        color: var(--wt-text-2);
        font-size: 0.75rem;
        font-weight: 700;
      }

      .uptime-empty {
        padding: 1rem;
        color: var(--wt-text-3);
        text-align: center;
      }

      @media (max-width: 40rem) {
        .uptime-card {
          padding: 1rem;
        }

        .uptime-card-top {
          align-items: stretch;
          flex-direction: column;
        }

        .uptime-status {
          align-self: flex-start;
        }

        .uptime-bars {
          gap: 0.18rem;
        }
      }
    `;
    return style;
  }
}

customElements.define("uptime-card", UptimeCard);
