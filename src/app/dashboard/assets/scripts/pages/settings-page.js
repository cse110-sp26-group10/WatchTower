import { dataStore } from "../core/data-store.js";

const METHODS = [
  ["push", "Push notifications", "Browser/device push alerts."],
  ["email", "Email", "Alerts sent to your account email."],
];
const NTFY_PREFIX = "WatchTower_";

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
      <div class="dashboard-surface settings-card">
        <h1 class="dashboard-title settings-title">Notification settings</h1>
        <p class="dashboard-subtitle settings-subtitle">Choose how you want to be notified about alerts.</p>

        ${
          alertId
            ? `
          <div class="dashboard-inset-surface settings-ntfy">
            <span class="settings-ntfy-label">Your ntfy topic</span>
            <div class="settings-ntfy-row">
              <code class="settings-ntfy-topic" id="settings-ntfy-topic">${NTFY_PREFIX + alertId}</code>
              <button class="secondary-action settings-ntfy-copy" id="settings-ntfy-copy" type="button">Copy</button>
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
            <label class="dashboard-inset-surface settings-method" for="notify-${id}">
              <input
                type="checkbox"
                id="notify-${id}"
                value="${id}"
                ${selected.has(id) ? "checked" : ""}
              />
              <span class="form-stack settings-method-text">
                <span class="settings-method-label">${label}</span>
                <span class="settings-method-desc">${desc}</span>
              </span>
            </label>
          `,
          ).join("")}
        </fieldset>

        <p class="form-error settings-status" id="settings-status" aria-live="polite" hidden></p>

        <button class="primary-action settings-save" id="settings-save" type="button">
          <span class="settings-save-label">Save preferences</span>
        </button>

        <hr class="settings-divider" />

        <div class="settings-section">
          <h2 class="dashboard-title settings-section-title">Appearance</h2>
          <div class="settings-row">
            <div>
              <span class="settings-row-label">Theme</span>
              <span class="dashboard-subtitle settings-row-desc">Switch between light and dark mode.</span>
            </div>
            <button class="secondary-action settings-theme-btn" id="settings-theme-btn" type="button">
              <span id="settings-theme-label">Light</span>
            </button>
          </div>
        </div>

        <hr class="settings-divider" />

        <div class="settings-section">
          <h2 class="dashboard-title settings-section-title">Account</h2>
          <div class="settings-row">
            <div>
              <span class="settings-row-label">Log out</span>
              <span class="dashboard-subtitle settings-row-desc">Sign out of your WatchTower account.</span>
            </div>
            <button class="secondary-action settings-logout-btn" id="settings-logout-btn" type="button">Log out</button>
          </div>
        </div>
      </div>
`;
  }

  bindEvents() {
    // Theme toggle
    const themeBtn = this.querySelector("#settings-theme-btn");
    const themeLabel = this.querySelector("#settings-theme-label");
    const updateThemeLabel = () => {
      const html = document.documentElement;
      const isDark = html.dataset.theme?.includes("dark");
      themeLabel.textContent = isDark ? "Dark" : "Light";
    };
    updateThemeLabel();
    themeBtn?.addEventListener("click", () => {
      const html = document.documentElement;
      const isDark = html.dataset.theme?.includes("dark");
      const flags = [];
      if (!isDark) flags.push("dark");
      if (localStorage.getItem("wt_colorblind") === "1")
        flags.push("colorblind");
      html.dataset.theme = flags.join(" ");
      localStorage.setItem("wt_dark", isDark ? "0" : "1");
      updateThemeLabel();
    });

    // Logout
    const logoutBtn = this.querySelector("#settings-logout-btn");
    logoutBtn?.addEventListener("click", async () => {
      logoutBtn.disabled = true;
      logoutBtn.textContent = "Logging out…";
      await dataStore.logOut();
      localStorage.removeItem("wt-auth");
      window.location.reload();
    });

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
