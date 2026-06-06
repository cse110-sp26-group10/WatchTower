import { dataStore } from "../core/data-store.js";

const SUN_SVG = `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
  <circle cx="12" cy="12" r="5"/>
  <line x1="12" y1="1" x2="12" y2="3"/>
  <line x1="12" y1="21" x2="12" y2="23"/>
  <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/>
  <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/>
  <line x1="1" y1="12" x2="3" y2="12"/>
  <line x1="21" y1="12" x2="23" y2="12"/>
  <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/>
  <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>
</svg>`;

const MOON_SVG = `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
  <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
</svg>`;

const EYE_SVG = `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
  <path d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7-11-7-11-7z"/>
  <circle cx="12" cy="12" r="3"/>
</svg>`;

const EYE_OFF_SVG = `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
  <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-7-11-7a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 7 11 7a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/>
  <line x1="1" y1="1" x2="23" y2="23"/>
</svg>`;

/**
 * @class LoginPage
 * @extends HTMLElement
 * @description Full-screen login page for WatchTower. Mocks authentication
 * and redirects to the dashboard (hash route #/) on successful submit.
 *
 * Usage: Add <login-page></login-page> to your HTML, or render it via the
 * router before the main app-container is shown.
 */
export class LoginPage extends HTMLElement {
  connectedCallback() {
    this.render();
    this.bindEvents();
  }

  disconnectedCallback() {
    // Nothing async to clean up, but good practice to keep the hook
  }

  render() {
    this.innerHTML = `
      <div class="login-shell">

        <!-- ── Top nav bar (mirrors app topbar style) ────────────────── -->
        <nav class="login-nav">
          <a class="login-nav-brand" href="#">
            <img
              src="public/logo.svg"
              alt="WatchTower logo"
              class="login-nav-logo"
              onerror="this.hidden=true"
            />
            WatchTower
          </a>
          <button
            id="login-theme-toggle"
            class="auth-theme-toggle"
            aria-label="Toggle theme"
          >
            <span id="theme-icon-sun" class="auth-theme-icon">${SUN_SVG}</span>
            <span id="theme-icon-moon" class="auth-theme-icon">${MOON_SVG}</span>
          </button>
        </nav>

        <!-- ── Main two-column layout ───────────────────────────────── -->
        <div class="login-body">

          <!-- Left: branding + tagline -->
          <div class="login-hero" aria-hidden="true">
            <div class="login-hero-inner">
              <div class="login-tower-graphic">
                <img src="public/logo.svg" alt="WatchTower" />
              </div>
              <p class="login-tagline">See what's on fire<br>before your users do.</p>
            </div>
          </div>

          <!-- Right: login card -->
          <div class="login-card-wrap">
            <div class="dashboard-surface login-card" role="main">
              <h1 class="dashboard-title login-card-title">Login</h1>

              <div class="form-stack login-form" id="login-form" novalidate>

                <div class="form-field login-field">
                  <label class="sr-only" for="login-email">Email</label>
                  <input
                    class="form-input login-input"
                    type="text"
                    id="login-email"
                    name="email"
                    placeholder="Email"
                    autocomplete="email"
                    required
                  />
                </div>

                <div class="form-field login-field">
                  <label class="sr-only" for="login-password">Password</label>
                  <div class="login-password-wrap">
                    <input
                      class="form-input login-input"
                      type="password"
                      id="login-password"
                      name="password"
                      placeholder="Password"
                      autocomplete="current-password"
                      required
                    />
                    <button
                      class="login-password-toggle"
                      id="login-password-toggle"
                      type="button"
                      aria-label="Show password"
                      aria-pressed="false"
                    >${EYE_SVG}</button>
                  </div>
                </div>

                <p class="form-error login-error" id="login-error" aria-live="polite" hidden></p>

                <button class="primary-action login-submit" id="login-submit" type="button">
                  <span class="login-submit-label">Sign In</span>
                  <span class="login-submit-spinner" hidden aria-hidden="true"></span>
                </button>

                <p class="login-auth-switch">
                  Don't have an account?
                  <a href="#/signup">Create an account</a>
                </p>

              </div>
            </div>
          </div>

        </div>
      </div>
`;
  }

  bindEvents() {
    const form = this.querySelector("#login-form");
    const submitBtn = this.querySelector("#login-submit");
    const errorEl = this.querySelector("#login-error");
    const emailInput = this.querySelector("#login-email");
    const passwordInput = this.querySelector("#login-password");
    const passwordToggle = this.querySelector("#login-password-toggle");
    const themeBtn = this.querySelector("#login-theme-toggle");

    // ── Password show/hide toggle ─────────────────────────────────
    passwordToggle?.addEventListener("click", () => {
      const show = passwordInput.type === "password";
      passwordInput.type = show ? "text" : "password";
      passwordToggle.innerHTML = show ? EYE_OFF_SVG : EYE_SVG;
      passwordToggle.setAttribute("aria-pressed", String(show));
      passwordToggle.setAttribute(
        "aria-label",
        show ? "Hide password" : "Show password",
      );
      passwordInput.focus();
    });

    // ── Theme toggle (mirrors app behaviour) ──────────────────────
    const updateToggleUI = (isDark) => {
      const sun = this.querySelector("#theme-icon-sun");
      const moon = this.querySelector("#theme-icon-moon");
      if (!sun || !moon) return;
      if (isDark) {
        moon.classList.add("is-active");
        sun.classList.remove("is-active");
      } else {
        sun.classList.add("is-active");
        moon.classList.remove("is-active");
      }
    };

    themeBtn?.addEventListener("click", () => {
      const html = document.documentElement;
      const isDark = html.dataset.theme?.includes("dark");
      const flags = [];
      if (!isDark) flags.push("dark");
      if (localStorage.getItem("wt_colorblind") === "1")
        flags.push("colorblind");
      html.dataset.theme = flags.join(" ");
      localStorage.setItem("wt_dark", isDark ? "0" : "1");
      updateToggleUI(!isDark);
    });

    // Set initial icon state
    updateToggleUI(document.documentElement.dataset.theme?.includes("dark"));

    // ── Submit handler ─────────────────────────────────────────────
    const handleSubmit = () => {
      // Clear previous errors
      errorEl.hidden = true;
      errorEl.textContent = "";
      emailInput.classList.remove("is-invalid");
      passwordInput.classList.remove("is-invalid");

      const email = emailInput.value.trim();
      const password = passwordInput.value;

      // Basic client-side validation
      let valid = true;
      if (!email) {
        emailInput.classList.add("is-invalid");
        valid = false;
      }
      if (!password) {
        passwordInput.classList.add("is-invalid");
        valid = false;
      }
      if (!valid) {
        errorEl.textContent = "Please fill in all fields.";
        errorEl.hidden = false;
        return;
      }

      submitBtn.disabled = true;
      submitBtn.querySelector(".login-submit-label").textContent =
        "Signing in…";
      submitBtn.querySelector(".login-submit-spinner").hidden = false;

      setTimeout(async () => {
        // Mock: any non-empty credentials pass
        // Replace with: const ok = await authService.login(email, password);
        const error = await dataStore.logIn(email, password);

        if (!error) {
          localStorage.setItem("wt-auth", "1");
          window.location.reload();
        } else {
          submitBtn.disabled = false;
          submitBtn.querySelector(".login-submit-label").textContent =
            "Sign In";
          submitBtn.querySelector(".login-submit-spinner").hidden = true;

          errorEl.textContent = "Invalid email or password.";
          errorEl.hidden = false;
          passwordInput.classList.add("is-invalid");
          passwordInput.focus();
        }
      }, 0); // No real backend — redirect immediately
    };

    submitBtn?.addEventListener("click", handleSubmit);

    // Allow Enter key anywhere in the form
    form?.addEventListener("keydown", (e) => {
      if (e.key === "Enter") handleSubmit();
    });
  }
}

customElements.define("login-page", LoginPage);
