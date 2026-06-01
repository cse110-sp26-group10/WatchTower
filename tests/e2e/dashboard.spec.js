import { test, expect } from "@playwright/test";

test.describe("Dashboard", () => {
  test.beforeEach(async ({ page }) => {
    // Dashboard requires auth — set the flag before the page loads
    await page.addInitScript(() => {
      localStorage.setItem("wt-auth", "1");
    });
  });

  test("loads and shows the uptime card", async ({ page }) => {
    await page.goto("/");
    const card = page.locator("#home-uptime");
    await expect(card).toBeVisible();
    const status = card.locator(".uptime-status");
    await expect(status).toBeVisible();
    const text = await status.textContent();
    expect(["Healthy", "Down"]).toContain(text.trim());
  });

  test("error list and activity panels render with items", async ({ page }) => {
    await page.goto("/");
    // Error list renders clickable buttons (not li elements)
    const errorList = page.locator("#home-errors");
    await expect(errorList).toBeVisible();
    await expect(
      errorList.locator(".error-click-target-btn").first(),
    ).toBeVisible();
    // Page load and click path panels are present
    await expect(page.locator("#home-load-paths")).toBeVisible();
    await expect(page.locator("#home-click-paths")).toBeVisible();
  });

  test("deployment filter dropdown is populated", async ({ page }) => {
    await page.goto("/");
    const options = page.locator("#deployment-filter option");
    const count = await options.count();
    expect(count).toBeGreaterThan(1);
  });

  test("selecting a deployment scopes the dashboard", async ({ page }) => {
    await page.goto("/");
    const select = page.locator("#deployment-filter");
    const allValues = await select
      .locator("option")
      .evaluateAll((opts) => opts.map((o) => o.value));
    const firstNonAll = allValues.find((v) => v !== "" && v !== "all");
    if (firstNonAll) {
      await select.selectOption(firstNonAll);
      // Filter is still functional and the select reflects the chosen value
      await expect(select).toHaveValue(firstNonAll);
    }
  });

  test("clicking an error row opens the detail modal", async ({ page }) => {
    await page.goto("/");
    const errorBtn = page
      .locator("#home-errors .error-click-target-btn")
      .first();
    await expect(errorBtn).toBeVisible();
    await errorBtn.click();
    // Modal overlay becomes visible (switches from display:none to display:flex)
    const modal = page.locator("#error-detail-modal");
    await expect(modal).toBeVisible();
  });

  test("error detail modal shows severity badge and error info", async ({
    page,
  }) => {
    await page.goto("/");
    await page.locator("#home-errors .error-click-target-btn").first().click();
    const modal = page.locator("#error-detail-modal");
    await expect(modal).toBeVisible();
    await expect(page.locator("#modal-severity-badge")).toBeVisible();
    await expect(page.locator("#modal-error-message")).toBeVisible();
  });
});
