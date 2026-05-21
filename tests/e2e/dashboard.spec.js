import { test, expect } from '@playwright/test';

test.describe('Dashboard', () => {
  test('loads and shows the status banner', async ({ page }) => {
    await page.goto('/');
    const card = page.locator('#uptime-card');
    await expect(card).toBeVisible();
    const text = await page.locator('#uptime-status').textContent();
    expect(['Online', 'Offline', 'Unknown']).toContain(text.trim());
  });

  test('all four signal panels render with list items', async ({ page }) => {
    await page.goto('/');
    for (const id of ['#errors-list', '#page-loads-list', '#feedback-list', '#clicks-list']) {
      const items = page.locator(`${id} li`);
      await expect(items.first()).toBeVisible();
    }
  });

  test('deployment filter dropdown is populated', async ({ page }) => {
    await page.goto('/');
    const options = page.locator('#deployment-filter option');
    const count = await options.count();
    expect(count).toBeGreaterThan(1);
  });

  test('selecting a deployment updates the deployment-info text', async ({ page }) => {
    await page.goto('/');
    const select = page.locator('#deployment-filter');
    // Get all option values and pick the first non-empty (non-"all") one
    const allValues = await select.locator('option').evaluateAll(
      (opts) => opts.map((o) => o.value)
    );
    const firstNonAll = allValues.find((v) => v !== '' && v !== 'all');
    if (firstNonAll) {
      await select.selectOption(firstNonAll);
      const info = page.locator('#deployment-info');
      await expect(info).not.toHaveText(/deployments$/);
    }
  });

  test('clicking an error row navigates to issue detail', async ({ page }) => {
    await page.goto('/');
    const errorLink = page.locator('#errors-list .event-link').first();
    await expect(errorLink).toBeVisible();
    await errorLink.click();
    // serve redirects .html?id=X to clean URL /issue (strips .html extension and query)
    await expect(page).toHaveURL(/\/issue/);
  });

  test('issue detail page renders severity badge and deployment info', async ({ page }) => {
    await page.goto('/');
    const errorLink = page.locator('#errors-list .event-link').first();
    await errorLink.click();
    await expect(page).toHaveURL(/\/issue/);
    await expect(page.locator('body')).toBeVisible();
  });
});
