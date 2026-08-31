import { test, expect } from "@playwright/test";

/**
 * B2B / bar parcours E2E smoke tests.
 *
 * These check the public accessibility of the new B2B routes and their
 * auth gates. Full user-flow tests (signup → bar profile → request →
 * admin quote) require TEST_USER_EMAIL / TEST_USER_PASSWORD and a live
 * Supabase project, and are skipped when those are not set.
 */

test.describe("B2B parcours", () => {
  test("bar-profile page is auth-gated", async ({ page }) => {
    const response = await page.goto("/compte/bar");
    // With no session the middleware/route redirects to /login. Either the
    // final URL is /login... or the response was a 3xx that Playwright
    // already followed.
    await expect(page).toHaveURL(/\/login/);
    expect(response?.status()).toBeLessThan(500);
  });

  test("product-request page is auth-gated", async ({ page }) => {
    await page.goto("/demande-produit");
    await expect(page).toHaveURL(/\/login/);
  });

  test("my-requests page is auth-gated", async ({ page }) => {
    await page.goto("/compte/demandes");
    await expect(page).toHaveURL(/\/login/);
  });

  test("admin bars page is admin-gated", async ({ page }) => {
    await page.goto("/admin/bars");
    // Without an admin session the admin layout redirects to /admin/login
    // or /. Both are non-200 for the requested URL.
    await expect(page).toHaveURL(/(\/admin\/login|\/$)/);
  });

  test("admin product-requests page is admin-gated", async ({ page }) => {
    await page.goto("/admin/product-requests");
    await expect(page).toHaveURL(/(\/admin\/login|\/$)/);
  });

  test.describe("authenticated flow", () => {
    test.skip(
      !process.env.TEST_USER_EMAIL || !process.env.TEST_USER_PASSWORD,
      "TEST_USER_EMAIL and TEST_USER_PASSWORD required",
    );

    // TODO: once test users can be provisioned, this should:
    // 1. sign in
    // 2. visit /compte/bar and fill the form
    // 3. visit /demande-produit and file an out-of-catalog request
    // 4. verify the entry appears in /compte/demandes
    test("customer can submit an out-of-catalog product request", async () => {
      test.fixme(true, "requires a provisioned test user");
    });
  });
});
