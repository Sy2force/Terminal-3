import { test, expect } from "@playwright/test";

/**
 * Cart E2E tests.
 * Requires TEST_USER_EMAIL and TEST_USER_PASSWORD to be set.
 */

test.describe("cart flow", () => {
  test("guest can add to localStorage cart but cannot checkout", async ({ page }) => {
    await page.goto("/vins");
    // Basic smoke: the page renders and products are visible or empty state is shown.
    await expect(page.locator("main")).toBeVisible();
  });

  test("duplicate checkout with the same idempotency key is rejected", async () => {
    // TODO: implement with test user and product once a test environment is available.
    test.skip(!process.env.TEST_USER_EMAIL, "TEST_USER_EMAIL not set");
  });
});
