import { test, expect } from "@playwright/test";

/**
 * Auth smoke tests.
 * These require a dedicated test Supabase project and test accounts.
 * DO NOT run against production.
 */

test.describe("authentication", () => {
  test("public homepage loads", async ({ page }) => {
    await page.goto("/");
    await expect(page).toHaveTitle(/Terminal 3/);
  });

  test("compte redirects anonymous to login", async ({ page }) => {
    await page.goto("/compte");
    await expect(page).toHaveURL(/.*login.*/);
  });

  test("admin redirects anonymous to login", async ({ page }) => {
    await page.goto("/admin");
    await expect(page).toHaveURL(/.*login.*/);
  });
});
