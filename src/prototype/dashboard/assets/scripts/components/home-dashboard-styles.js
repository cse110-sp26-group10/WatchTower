export class HomeDashboardStyles extends HTMLElement {
  connectedCallback() {
    this.innerHTML = `
      <style>
        @keyframes modalSlideUp {
          from { transform: translateY(15px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
        .error-click-target-btn {
          width: 100%;
          text-align: left;
          background: var(--wt-surface-2);
          border: 1px solid transparent;
          cursor: pointer;
          font-family: inherit;
        }
        .error-click-target-btn:hover {
          background-color: var(--wt-border) !important;
          border-color: var(--wt-text-3);
        }
        .error-click-target-btn:focus-visible {
          outline: 2px solid var(--wt-info);
        }
        home-panel-section,
        home-error-list,
        home-feedback-list,
        home-path-count-list,
        home-activity-list {
          display: flex;
          flex-direction: column;
        }
        home-error-list,
        home-feedback-list,
        home-path-count-list,
        home-activity-list {
          gap: 0.5rem;
        }
      </style>
    `;
  }
}

customElements.define('home-dashboard-styles', HomeDashboardStyles);
