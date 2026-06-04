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
              src="/src/app/dashboard/public/logo.svg"
              alt="WatchTower logo"
              class="login-nav-logo"
              onerror="this.style.display='none'"
            />
            WatchTower
          </a>
          <button
            id="login-theme-toggle"
            aria-label="Toggle theme"
            style="
              display: flex;
              align-items: center;
              background: var(--wt-surface-2);
              border: 1px solid var(--wt-border);
              border-radius: 999px;
              padding: 4px;
              cursor: pointer;
              gap: 2px;
            "
          >
            <span id="theme-icon-sun" style="
              display: flex; align-items: center; justify-content: center;
              width: 32px; height: 32px; border-radius: 50%;
              transition: background 0.15s ease; color: var(--wt-text-3);
            ">${SUN_SVG}</span>
            <span id="theme-icon-moon" style="
              display: flex; align-items: center; justify-content: center;
              width: 32px; height: 32px; border-radius: 50%;
              transition: background 0.15s ease; color: var(--wt-text-3);
            ">${MOON_SVG}</span>
          </button>
        </nav>

        <!-- ── Main two-column layout ───────────────────────────────── -->
        <div class="login-body">

          <!-- Left: branding + tagline -->
          <div class="login-hero" aria-hidden="true">
            <div class="login-hero-inner">
              <div class="login-tower-graphic">
                <img src="/src/app/dashboard/public/logo.svg" alt="WatchTower" />
              </div>
              <p class="login-tagline">See what's on fire<br>before your users do.</p>
            </div>
          </div>

          <!-- Right: login card -->
          <div class="login-card-wrap">
            <div class="login-card" role="main">
              <h1 class="login-card-title">Login</h1>

              <div class="login-form" id="login-form" novalidate>

                <div class="login-field">
                  <label class="sr-only" for="login-email">Email</label>
                  <input
                    class="login-input"
                    type="text"
                    id="login-email"
                    name="email"
                    placeholder="Email"
                    autocomplete="email"
                    required
                  />
                </div>

                <div class="login-field">
                  <label class="sr-only" for="login-password">Password</label>
                  <div class="login-password-wrap">
                    <input
                      class="login-input"
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

                <p class="login-error" id="login-error" aria-live="polite" hidden></p>

                <button class="login-submit" id="login-submit" type="button">
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

      <style>
        /* ── Login Shell ─────────────────────────────────────────── */
        .login-shell {
          min-height: 100vh;
          display: flex;
          flex-direction: column;
          background-color: var(--wt-bg);
          color: var(--wt-text);
          font-family: var(--font-sans);
        }

        /* ── Nav ─────────────────────────────────────────────────── */
        .login-nav {
          display: flex;
          align-items: center;
          gap: 1.5rem;
          padding: 0.875rem 1.5rem;
          background-color: var(--wt-surface);
          border-bottom: 1px solid var(--wt-border);
        }

        .login-nav-brand {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-weight: 700;
          font-size: 1rem;
          color: var(--wt-text);
          text-decoration: none;
          margin-right: auto;
        }

        .login-nav-logo {
          width: 1.75rem;
          height: 1.75rem;
          object-fit: contain;
        }

        .login-nav-links {
          display: flex;
          list-style: none;
          margin: 0;
          padding: 0;
          gap: 1.5rem;
        }

        .login-nav-links a {
          color: var(--wt-text-2);
          text-decoration: none;
          font-size: 0.875rem;
          font-weight: 500;
          transition: color 0.15s;
        }

        .login-nav-links a:hover {
          color: var(--wt-text);
        }

        .login-theme-btn {
          /* reuses .theme-toggle from global styles.css */
          font-size: 0.8rem;
          letter-spacing: 0.05em;
        }

        /* ── Body layout ─────────────────────────────────────────── */
        .login-body {
          flex: 1;
          display: grid;
          grid-template-columns: 1fr 1fr;
          align-items: center;
          gap: 2rem;
          padding: 3rem 4rem;
          max-width: 75rem;
          width: 100%;
          margin: 0 auto;
          box-sizing: border-box;
        }

        @media (max-width: 48rem) {
          .login-body {
            grid-template-columns: 1fr;
            padding: 2rem 1.5rem;
          }
          .login-hero { display: none; }
        }

        /* ── Hero / Branding side ────────────────────────────────── */
        .login-hero {
          display: flex;
          justify-content: center;
          align-items: center;
        }

        .login-hero-inner {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 1.5rem;
          text-align: center;
        }

        .login-tower-graphic img {
          width: clamp(9rem, 20vw, 14rem);
          height: auto;
        }

        .login-tagline {
          font-size: 1.125rem;
          font-weight: 700;
          color: var(--wt-text);
          line-height: 1.4;
          margin: 0;
        }

        /* ── Login Card ──────────────────────────────────────────── */
        .login-card-wrap {
          display: flex;
          justify-content: center;
        }

        .login-card {
          background-color: var(--wt-surface);
          border: 1px solid var(--wt-border);
          border-radius: 0;
          padding: 2.5rem 2rem;
          width: 100%;
          max-width: 22rem;
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
        }

        .login-card-title {
          margin: 0;
          font-size: 1.5rem;
          font-weight: 700;
          color: var(--wt-text);
        }

        /* ── Form ────────────────────────────────────────────────── */
        .login-form {
          display: flex;
          flex-direction: column;
          gap: 0.875rem;
        }

        .login-field {
          display: flex;
          flex-direction: column;
        }

        .login-input {
          padding: 0.75rem 1rem;
          background-color: var(--wt-surface-2);
          border: 1px solid var(--wt-border);
          border-radius: var(--wt-radius-md);
          color: var(--wt-text);
          font-size: 0.875rem;
          font-family: var(--font-sans);
          outline: none;
          transition: border-color 0.15s, box-shadow 0.15s;
        }

        .login-input::placeholder {
          color: var(--wt-text-3);
        }

        .login-input:focus {
          border-color: var(--color-active);
          box-shadow: 0 0 0 3px var(--color-active-bg);
        }

        .login-input.is-invalid {
          border-color: var(--wt-danger);
          box-shadow: 0 0 0 3px var(--color-crit-bg);
        }

        /* ── Password show/hide toggle ───────────────────────────── */
        .login-password-wrap {
          position: relative;
          display: flex;
        }

        .login-password-wrap .login-input {
          flex: 1;
          padding-right: 2.75rem;            /* room for the eye button */
        }

        .login-password-toggle {
          position: absolute;
          top: 0;
          right: 0;
          height: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          width: 2.5rem;
          padding: 0;
          background: transparent;
          border: none;
          color: var(--wt-text-3);
          cursor: pointer;
          transition: color 0.15s;
        }

        .login-password-toggle:hover {
          color: var(--wt-text);
        }

        .login-password-toggle:focus-visible {
          outline: 2px solid var(--color-active);
          outline-offset: -2px;
          border-radius: var(--wt-radius-md);
        }

        /* ── Error message ───────────────────────────────────────── */
        .login-error {
          margin: 0;
          font-size: 0.8125rem;
          color: var(--wt-danger);
        }

        /* ── Submit button ───────────────────────────────────────── */
        .login-submit {
          margin-top: 0.5rem;
          padding: 0.75rem 1rem;
          background-color: var(--color-active);
          color: #fff;
          border: none;
          border-radius: var(--wt-radius-md);
          font-size: 0.9375rem;
          font-weight: 600;
          font-family: var(--font-sans);
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
          transition: opacity 0.15s, transform 0.1s;
        }

        .login-submit:hover:not(:disabled) {
          opacity: 0.88;
        }

        .login-submit:active:not(:disabled) {
          transform: scale(0.98);
        }

        .login-submit:disabled {
          opacity: 0.55;
          cursor: not-allowed;
        }

        /* Spinner */
        @keyframes login-spin {
          to { transform: rotate(360deg); }
        }

        .login-submit-spinner {
          width: 1rem;
          height: 1rem;
          border: 2px solid rgba(255,255,255,0.35);
          border-top-color: #fff;
          border-radius: 50%;
          animation: login-spin 0.65s linear infinite;
        }

        .login-auth-switch {
          margin: 0.25rem 0 0;
          color: var(--wt-text-2);
          font-size: 0.8125rem;
          text-align: center;
        }

        .login-auth-switch a {
          color: var(--color-active);
          font-weight: 600;
          text-decoration: none;
        }

        .login-auth-switch a:hover {
          text-decoration: underline;
        }
      </style>
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
        moon.style.background = "var(--wt-surface)";
        moon.style.color = "var(--wt-text)";
        sun.style.background = "transparent";
        sun.style.color = "var(--wt-text-3)";
      } else {
        sun.style.background = "var(--wt-surface)";
        sun.style.color = "var(--wt-text)";
        moon.style.background = "transparent";
        moon.style.color = "var(--wt-text-3)";
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
