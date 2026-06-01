import { dataStore } from '../core/data-store.js';

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
              src="/src/app/dashboard/public/logo.svg"
              alt="WatchTower logo"
              class="login-nav-logo"
              onerror="this.style.display='none'"
            />
            WatchTower
          </a>
          <button
            id="signup-theme-toggle"
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

        <div class="login-body">
          <div class="login-hero" aria-hidden="true">
            <div class="login-hero-inner">
              <div class="login-tower-graphic">
                <img src="/src/app/dashboard/public/logo.svg" alt="WatchTower" />
              </div>
              <p class="login-tagline">See what's on fire<br>before your users do.</p>
            </div>
          </div>

          <div class="login-card-wrap">
            <div class="login-card" role="main">
              <h1 class="login-card-title">Sign Up</h1>

              <div class="login-form" id="signup-form" novalidate>
                <div class="login-field">
                  <label class="sr-only" for="signup-email">Email</label>
                  <input
                    class="login-input"
                    type="email"
                    id="signup-email"
                    name="email"
                    placeholder="Email"
                    autocomplete="email"
                    required
                  />
                </div>

                <div class="login-field">
                  <label class="sr-only" for="signup-password">Password</label>
                  <input
                    class="login-input"
                    type="password"
                    id="signup-password"
                    name="password"
                    placeholder="Password"
                    autocomplete="new-password"
                    required
                  />
                </div>

                <div class="login-field">
                  <label class="sr-only" for="signup-confirm-password">Confirm Password</label>
                  <input
                    class="login-input"
                    type="password"
                    id="signup-confirm-password"
                    name="confirm-password"
                    placeholder="Confirm Password"
                    autocomplete="new-password"
                    required
                  />
                </div>

                <p class="login-error" id="signup-error" aria-live="polite" hidden></p>

                <button class="login-submit" id="signup-submit" type="button">
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

      <style>
        .login-shell {
          min-height: 100vh;
          display: flex;
          flex-direction: column;
          background-color: var(--wt-bg);
          color: var(--wt-text);
          font-family: var(--font-sans);
        }

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

        .login-card-wrap {
          display: flex;
          justify-content: center;
        }

        .login-card {
          background-color: var(--wt-surface);
          border: 1px solid var(--wt-border);
          border-radius: var(--wt-radius-md);
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

        .login-error {
          margin: 0;
          font-size: 0.8125rem;
          color: var(--wt-danger);
        }

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
    const form = this.querySelector('#signup-form');
    const submitBtn = this.querySelector('#signup-submit');
    const errorEl = this.querySelector('#signup-error');
    const emailInput = this.querySelector('#signup-email');
    const passwordInput = this.querySelector('#signup-password');
    const confirmPasswordInput = this.querySelector('#signup-confirm-password');
    const themeBtn = this.querySelector('#signup-theme-toggle');

    const updateToggleUI = (isDark) => {
      const sun = this.querySelector('#theme-icon-sun');
      const moon = this.querySelector('#theme-icon-moon');
      if (!sun || !moon) return;
      if (isDark) {
        moon.style.background = 'var(--wt-surface)';
        moon.style.color = 'var(--wt-text)';
        sun.style.background = 'transparent';
        sun.style.color = 'var(--wt-text-3)';
      } else {
        sun.style.background = 'var(--wt-surface)';
        sun.style.color = 'var(--wt-text)';
        moon.style.background = 'transparent';
        moon.style.color = 'var(--wt-text-3)';
      }
    };

    themeBtn?.addEventListener('click', () => {
      const html = document.documentElement;
      const isDark = html.dataset.theme?.includes('dark');
      const flags = [];
      if (!isDark) flags.push('dark');
      if (localStorage.getItem('wt_colorblind') === '1') flags.push('colorblind');
      html.dataset.theme = flags.join(' ');
      localStorage.setItem('wt_dark', isDark ? '0' : '1');
      updateToggleUI(!isDark);
    });

    updateToggleUI(document.documentElement.dataset.theme?.includes('dark'));

    const setLoading = (isLoading) => {
      submitBtn.disabled = isLoading;
      submitBtn.querySelector('.login-submit-label').textContent = isLoading ? 'Creating account...' : 'Create Account';
      submitBtn.querySelector('.login-submit-spinner').hidden = !isLoading;
    };

    const showError = (message, fields = []) => {
      errorEl.textContent = message;
      errorEl.hidden = false;
      fields.forEach((field) => field.classList.add('is-invalid'));
      fields[0]?.focus();
    };

    const handleSubmit = async () => {
      errorEl.hidden = true;
      errorEl.textContent = '';
      [emailInput, passwordInput, confirmPasswordInput].forEach((field) => field.classList.remove('is-invalid'));

      const email = emailInput.value.trim();
      const password = passwordInput.value;
      const confirmPassword = confirmPasswordInput.value;
      const emailIsValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

      if (!email || !password || !confirmPassword) {
        showError('Please fill in all fields.', [emailInput, passwordInput, confirmPasswordInput].filter((field) => !field.value));
        return;
      }

      if (!emailIsValid) {
        showError('Please enter a valid email address.', [emailInput]);
        return;
      }

      if (password.length < 6) {
        showError('Password must be at least 6 characters.', [passwordInput]);
        return;
      }

      if (password !== confirmPassword) {
        showError('Passwords do not match.', [passwordInput, confirmPasswordInput]);
        confirmPasswordInput.value = '';
        return;
      }

      const error = await dataStore.signUp(email, password);
      if (error) {
        showError('Sign up failed');
        return;
      }

      setLoading(true);

      setTimeout(() => {
        localStorage.setItem('wt-auth', '1');
        window.location.hash = '#/';
        window.location.reload();
      }, 0);
    };

    submitBtn?.addEventListener('click', handleSubmit);

    form?.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') handleSubmit();
    });
  }
}

customElements.define('signup-page', SignUpPage);
