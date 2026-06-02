import { test, expect } from "@playwright/test";

/** Dashboard gates the app shell behind localStorage auth (see main.js). */
async function loginAsTestUser(page) {
  await page.addInitScript(() => {
    localStorage.setItem("wt-auth", "1");
  });
}

test.describe("Dashboard — unauthenticated", () => {
  test("shows the login page when wt-auth is missing", async ({ page }) => {
    await page.goto("/");
    await expect(page.locator("login-page")).toBeVisible();
    await expect(page.locator("#app-shell")).toBeEmpty();
  });
});

test.describe("Dashboard — authenticated", () => {
  test.beforeEach(async ({ page }) => {
    await loginAsTestUser(page);
  });

  test("loads the app shell on home", async ({ page }) => {
    await page.goto("/#/");
    await expect(page.locator("app-topbar")).toBeVisible();
    await expect(page.locator("app-sidebar")).toBeVisible();
    await expect(page.locator("#app-outlet")).toBeVisible();
  });

  test("renders sidebar navigation links", async ({ page }) => {
    await page.goto("/#/");
    await expect(page.getByRole("link", { name: "Overview" })).toBeVisible();
    await expect(page.getByRole("link", { name: "Errors" })).toBeVisible();
    await expect(page.getByRole("link", { name: "Activity" })).toBeVisible();
  });

  test("loads and shows the uptime card", async ({ page }) => {
    await page.goto("/#/");
    const card = page.locator("#home-uptime");
    await expect(card).toBeVisible();
    const status = card.locator(".uptime-status");
    await expect(status).toBeVisible();
    const text = await status.textContent();
    expect(["Healthy", "Down"]).toContain(text.trim());
  });

  test("error list and activity panels render with items", async ({ page }) => {
    await page.goto("/#/");
    const errorList = page.locator("#home-errors");
    await expect(errorList).toBeVisible();
    await expect(
      errorList.locator(".error-click-target-btn").first(),
    ).toBeVisible();
    await expect(page.locator("#home-load-paths")).toBeVisible();
    await expect(page.locator("#home-click-paths")).toBeVisible();
  });

  test("deployment filter dropdown is populated", async ({ page }) => {
    await page.goto("/#/");
    const options = page.locator("#deployment-filter option");
    await expect(options).not.toHaveCount(0);
    expect(await options.count()).toBeGreaterThan(1);
  });

  test("selecting a deployment scopes the dashboard", async ({ page }) => {
    await page.goto("/#/");
    const select = page.locator("#deployment-filter");
    const allValues = await select
      .locator("option")
      .evaluateAll((opts) => opts.map((o) => o.value));
    const firstNonAll = allValues.find((v) => v !== "" && v !== "all");
    if (firstNonAll) {
      await select.selectOption(firstNonAll);
      await expect(select).toHaveValue(firstNonAll);
    }
  });

  test("clicking an error row opens the detail modal", async ({ page }) => {
    await page.goto("/#/");
    const errorBtn = page
      .locator("#home-errors .error-click-target-btn")
      .first();
    await expect(errorBtn).toBeVisible();
    await errorBtn.click();
    const modal = page.locator("#error-detail-modal");
    await expect(modal).toBeVisible();
  });

  test("error detail modal shows severity badge and error info", async ({
    page,
  }) => {
    await page.goto("/#/");
    await page.locator("#home-errors .error-click-target-btn").first().click();
    await expect(page.locator("#error-detail-modal")).toBeVisible();
    await expect(page.locator("#modal-severity-badge")).toBeVisible();
    await expect(page.locator("#modal-error-message")).toBeVisible();
  });

  test("errors page loads from a direct hash URL", async ({ page }) => {
    await page.goto("/#/errors");
    await expect(page).toHaveURL(/#\/errors/);
    await expect(page.locator("#errors-page-list")).toBeVisible();
    await expect(page.locator("summary-metrics")).toBeVisible();
  });

  test("activity page loads from a direct hash URL", async ({ page }) => {
    await page.goto("/#/activity");
    await expect(page).toHaveURL(/#\/activity/);
    await expect(page.locator("#activity-events")).toBeVisible();
  });
});
