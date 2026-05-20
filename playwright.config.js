import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: 'tests/e2e',
  timeout: 15000,
  use: {
    baseURL: 'http://localhost:3000',
    headless: true,
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
  webServer: {
    command: 'npx serve src/prototype/dashboard -p 3000 --no-clipboard',
    port: 3000,
    reuseExistingServer: !process.env.CI,
    timeout: 10000,
  },
  reporter: process.env.CI ? 'github' : 'list',
});
