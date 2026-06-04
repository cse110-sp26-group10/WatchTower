import { dataStore } from "../core/data-store.js";

const METHODS = [
  ["push", "Push notifications", "Browser/device push alerts."],
  ["email", "Email", "Alerts sent to your account email."],
];
const NTFY_PREFIX = "WatchTower/";

/**
 * @class SettingsPage
 * @extends HTMLElement
 * @description Lets the user choose how they want to be notified.
 * Persists the selection via dataStore.updateNotifyMethods().
 */
export class SettingsPage extends HTMLElement {
  set route(value) {
    this._route = value;
  }

  connectedCallback() {
    this.render();
    this.bindEvents();
  }

  render() {
    this.className = "dashboard-viewport";
    const profile = dataStore.getProfile() || {};
    const selected = new Set(profile.notify_methods || []);
    const alertId = profile.alert_id || "";

    this.innerHTML = `
      <div class="settings-card">
        <h1 class="settings-title">Notification settings</h1>
        <p class="settings-subtitle">Choose how you want to be notified about alerts.</p>

        ${
          alertId
            ? `
          <div class="settings-ntfy">
            <span class="settings-ntfy-label">Your ntfy topic</span>
            <div class="settings-ntfy-row">
              <code class="settings-ntfy-topic" id="settings-ntfy-topic">${NTFY_PREFIX + alertId}</code>
              <button class="settings-ntfy-copy" id="settings-ntfy-copy" type="button">Copy</button>
            </div>
            <p class="settings-ntfy-hint">Subscribe to this topic in the ntfy app to receive push alerts.</p>
          </div>
        `
            : ""
        }

        <fieldset class="settings-methods">
          <legend class="sr-only">Notification methods</legend>
          ${METHODS.map(
            ([id, label, desc]) => `
            <label class="settings-method" for="notify-${id}">
              <input
                type="checkbox"
                id="notify-${id}"
                value="${id}"
                ${selected.has(id) ? "checked" : ""}
              />
              <span class="settings-method-text">
                <span class="settings-method-label">${label}</span>
                <span class="settings-method-desc">${desc}</span>
              </span>
            </label>
          `,
          ).join("")}
        </fieldset>

        <p class="settings-status" id="settings-status" aria-live="polite" hidden></p>

        <button class="settings-save" id="settings-save" type="button">
          <span class="settings-save-label">Save preferences</span>
        </button>
      </div>

      <style>
        /* Center the card within the page (scoped to this element only) */
        settings-page.dashboard-viewport {
          align-items: center;
          justify-content: center;
          min-height: calc(100vh - 3.5rem);
        }

        .settings-card {
          width: 100%;
          max-width: 32rem;
          background-color: var(--wt-surface);
          border: 1px solid var(--wt-border);
          border-radius: 0;
          padding: 1.5rem;
        }

        .settings-title {
          margin: 0;
          font-size: 1.25rem;
          color: var(--wt-text);
        }

        .settings-subtitle {
          margin: 0.25rem 0 1.25rem;
          font-size: 0.875rem;
          color: var(--wt-text-2);
        }

        .settings-ntfy {
          margin-bottom: 1.25rem;
          padding: 0.875rem 1rem;
          border: 1px solid var(--wt-border);
          border-radius: 0;
          background-color: var(--wt-surface-2);
        }

        .settings-ntfy-label {
          display: block;
          font-size: 0.8125rem;
          font-weight: 500;
          color: var(--wt-text-2);
          margin-bottom: 0.5rem;
        }

        .settings-ntfy-row {
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .settings-ntfy-topic {
          flex: 1;
          min-width: 0;
          overflow-wrap: anywhere;
          font-family: var(--font-mono, monospace);
          font-size: 0.8125rem;
          color: var(--wt-text);
        }

        .settings-ntfy-copy {
          flex-shrink: 0;
          padding: 0.375rem 0.75rem;
          border: 1px solid var(--wt-border);
          border-radius: var(--wt-radius-md);
          background: transparent;
          color: var(--wt-text-2);
          font: inherit;
          font-size: 0.8125rem;
          cursor: pointer;
          transition: all 0.15s ease;
        }

        .settings-ntfy-copy:hover {
          background-color: var(--color-active-bg);
          color: var(--color-active-text);
        }

        .settings-ntfy-hint {
          margin: 0.5rem 0 0;
          font-size: 0.8125rem;
          color: var(--wt-text-3);
        }

        .settings-methods {
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
          margin: 0;
          padding: 0;
          border: none;
        }

        .settings-method {
          display: flex;
          align-items: flex-start;
          gap: 0.75rem;
          padding: 0.875rem 1rem;
          border: 1px solid var(--wt-border);
          border-radius: 0;
          background-color: var(--wt-surface-2);
          cursor: pointer;
          transition: border-color 0.15s, box-shadow 0.15s;
        }

        .settings-method:hover {
          border-color: var(--color-active);
        }

        .settings-method input {
          margin-top: 0.15rem;
          width: 1rem;
          height: 1rem;
          accent-color: var(--color-active);
          cursor: pointer;
        }

        .settings-method-text {
          display: flex;
          flex-direction: column;
        }

        .settings-method-label {
          font-weight: 500;
          color: var(--wt-text);
        }

        .settings-method-desc {
          font-size: 0.8125rem;
          color: var(--wt-text-3);
        }

        /* Mirrors the .login-error convention used elsewhere */
        .settings-status {
          margin: 0.75rem 0 0;
          font-size: 0.8125rem;
          color: var(--wt-danger);
        }

        .settings-status.is-success { color: var(--wt-success); }

        .settings-save {
          margin-top: 1.25rem;
          padding: 0.625rem 1.25rem;
          border: none;
          border-radius: var(--wt-radius-md);
          background-color: var(--color-active);
          color: #fff;
          font: inherit;
          font-weight: 600;
          cursor: pointer;
          transition: opacity 0.15s;
        }

        .settings-save:hover { opacity: 0.9; }
        .settings-save:disabled { opacity: 0.6; cursor: default; }
      </style>
    `;
  }

  bindEvents() {
    const copyBtn = this.querySelector("#settings-ntfy-copy");
    copyBtn?.addEventListener("click", async () => {
      const topic =
        this.querySelector("#settings-ntfy-topic")?.textContent || "";
      try {
        await navigator.clipboard.writeText(topic);
        copyBtn.textContent = "Copied";
        setTimeout(() => {
          copyBtn.textContent = "Copy";
        }, 1500);
      } catch {
        copyBtn.textContent = "Copy failed";
        setTimeout(() => {
          copyBtn.textContent = "Copy";
        }, 1500);
      }
    });

    const saveBtn = this.querySelector("#settings-save");
    const statusEl = this.querySelector("#settings-status");
    const labelEl = saveBtn.querySelector(".settings-save-label");

    const setStatus = (text, kind) => {
      statusEl.textContent = text;
      statusEl.classList.toggle("is-success", kind === "success");
      statusEl.hidden = false;
    };

    saveBtn.addEventListener("click", async () => {
      const methods = [
        ...this.querySelectorAll('input[type="checkbox"]:checked'),
      ].map((input) => input.value);

      saveBtn.disabled = true;
      labelEl.textContent = "Saving…";
      statusEl.hidden = true;

      const error = await dataStore.updateNotifyMethods(methods);

      saveBtn.disabled = false;
      labelEl.textContent = "Save preferences";

      if (error) {
        setStatus(
          "Could not save your preferences. Please try again.",
          "error",
        );
      } else {
        setStatus(
          methods.length ? "Preferences saved." : "Notifications turned off.",
          "success",
        );
      }
    });
  }
}

customElements.define("settings-page", SettingsPage);
