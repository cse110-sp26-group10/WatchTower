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

export class SignUpPage extends HTMLElement {
  connectedCallback() {
    this.render();
    this.bindEvents();
  }

  render() {
    this.innerHTML = `
      <div class="login-shell">
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
            id="signup-theme-toggle"
            class="auth-theme-toggle"
            aria-label="Toggle theme"
          >
            <span id="theme-icon-sun" class="auth-theme-icon">${SUN_SVG}</span>
            <span id="theme-icon-moon" class="auth-theme-icon">${MOON_SVG}</span>
          </button>
        </nav>

        <div class="login-body">
          <div class="login-hero" aria-hidden="true">
            <div class="login-hero-inner">
              <div class="login-tower-graphic">
                <img src="public/logo.svg" alt="WatchTower" />
              </div>
              <p class="login-tagline">See what's on fire<br>before your users do.</p>
            </div>
          </div>

          <div class="login-card-wrap">
            <div class="dashboard-surface login-card" role="main">
              <h1 class="dashboard-title login-card-title">Sign Up</h1>

              <div class="form-stack login-form" id="signup-form" novalidate>
                <div class="form-field login-field">
                  <label class="sr-only" for="signup-email">Email</label>
                  <input
                    class="form-input login-input"
                    type="email"
                    id="signup-email"
                    name="email"
                    placeholder="Email"
                    autocomplete="email"
                    required
                  />
                </div>

                <div class="form-field login-field">
                  <label class="sr-only" for="signup-password">Password</label>
                  <input
                    class="form-input login-input"
                    type="password"
                    id="signup-password"
                    name="password"
                    placeholder="Password"
                    autocomplete="new-password"
                    required
                  />
                </div>

                <div class="form-field login-field">
                  <label class="sr-only" for="signup-confirm-password">Confirm Password</label>
                  <input
                    class="form-input login-input"
                    type="password"
                    id="signup-confirm-password"
                    name="confirm-password"
                    placeholder="Confirm Password"
                    autocomplete="new-password"
                    required
                  />
                </div>

                <p class="form-error login-error" id="signup-error" aria-live="polite" hidden></p>

                <button class="primary-action login-submit" id="signup-submit" type="button">
                  <span class="login-submit-label">Create Account</span>
                  <span class="login-submit-spinner" hidden aria-hidden="true"></span>
                </button>

                <p class="login-auth-switch">
                  Already have an account?
                  <a href="#">Sign in</a>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
`;
  }

  bindEvents() {
    const form = this.querySelector("#signup-form");
    const submitBtn = this.querySelector("#signup-submit");
    const errorEl = this.querySelector("#signup-error");
    const emailInput = this.querySelector("#signup-email");
    const passwordInput = this.querySelector("#signup-password");
    const confirmPasswordInput = this.querySelector("#signup-confirm-password");
    const themeBtn = this.querySelector("#signup-theme-toggle");

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

    updateToggleUI(document.documentElement.dataset.theme?.includes("dark"));

    const setLoading = (isLoading) => {
      submitBtn.disabled = isLoading;
      submitBtn.querySelector(".login-submit-label").textContent = isLoading
        ? "Creating account..."
        : "Create Account";
      submitBtn.querySelector(".login-submit-spinner").hidden = !isLoading;
    };

    const showError = (message, fields = []) => {
      errorEl.textContent = message;
      errorEl.hidden = false;
      fields.forEach((field) => field.classList.add("is-invalid"));
      fields[0]?.focus();
    };

    const handleSubmit = async () => {
      errorEl.hidden = true;
      errorEl.textContent = "";
      [emailInput, passwordInput, confirmPasswordInput].forEach((field) =>
        field.classList.remove("is-invalid"),
      );

      const email = emailInput.value.trim();
      const password = passwordInput.value;
      const confirmPassword = confirmPasswordInput.value;
      const emailIsValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

      if (!email || !password || !confirmPassword) {
        showError(
          "Please fill in all fields.",
          [emailInput, passwordInput, confirmPasswordInput].filter(
            (field) => !field.value,
          ),
        );
        return;
      }

      if (!emailIsValid) {
        showError("Please enter a valid email address.", [emailInput]);
        return;
      }

      if (password.length < 6) {
        showError("Password must be at least 6 characters.", [passwordInput]);
        return;
      }

      if (password !== confirmPassword) {
        showError("Passwords do not match.", [
          passwordInput,
          confirmPasswordInput,
        ]);
        confirmPasswordInput.value = "";
        return;
      }

      const error = await dataStore.signUp(email, password);
      if (error) {
        showError("Sign up failed");
        return;
      }

      setLoading(true);

      setTimeout(() => {
        localStorage.setItem("wt-auth", "1");
        window.location.hash = "#/";
        window.location.reload();
      }, 0);
    };

    submitBtn?.addEventListener("click", handleSubmit);

    form?.addEventListener("keydown", (e) => {
      if (e.key === "Enter") handleSubmit();
    });
  }
}

customElements.define("signup-page", SignUpPage);
