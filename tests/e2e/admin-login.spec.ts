import { test, expect, type Page } from "@playwright/test";

const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "";

async function openMobileAdminMenu(page: Page) {
  const menuButton = page.locator('button[aria-label="Ouvrir le menu"]').first();
  if (await menuButton.isVisible().catch(() => false)) {
    await menuButton.click();
  }
}

test.describe("admin login", () => {
  test("page loads with expected elements", async ({ page, context }) => {
    await context.clearCookies();
    await page.goto("/admin/login");
    await expect(page).toHaveTitle(/Connexion admin/);
    await expect(page.getByTestId("admin-login-title").first()).toBeVisible();
    await expect(page.locator('input[name="password"]').first()).toBeVisible();
    await expect(page.locator("button:has-text('Se connecter')").first()).toBeVisible();
    await expect(page.locator('a:has-text("Retour à la boutique")').first()).toBeVisible();
  });

  test("wrong password shows generic error", async ({ page, context }) => {
    await context.clearCookies();
    await page.goto("/admin/login");
    await page.locator('input[name="password"]').first().fill("bad-password");
    await page.locator("button:has-text('Se connecter')").first().click();
    await page.waitForURL(/\/admin\/login\?error=/, { timeout: 5000 });
    await expect(page.getByRole("alert").first()).toHaveText("Mot de passe incorrect ou accès refusé.");
  });

  test("successful login reaches admin dashboard", async ({ page, context }) => {
    test.skip(!ADMIN_PASSWORD, "ADMIN_PASSWORD not configured");
    await context.clearCookies();
    await page.goto("/admin/login");
    await page.locator('input[name="password"]').first().fill(ADMIN_PASSWORD);
    await page.locator("button:has-text('Se connecter')").first().click();
    await page.waitForURL("/admin", { waitUntil: "commit", timeout: 10000 });
    await expect(page.getByRole("heading", { name: "Vue d'ensemble" }).first()).toBeVisible({ timeout: 15000 });

    const cookies = await context.cookies();
    const adminCookie = cookies.find((c) => c.name === "admin_session");
    expect(adminCookie).toBeTruthy();
    expect(adminCookie?.httpOnly).toBe(true);
    expect(adminCookie?.sameSite).toBe("Strict");

    await page.reload();
    await expect(page.getByRole("heading", { name: "Vue d'ensemble" }).first()).toBeVisible({ timeout: 15000 });
  });

  test("logout and denied access", async ({ page, context }) => {
    test.skip(!ADMIN_PASSWORD, "ADMIN_PASSWORD not configured");
    await context.clearCookies();
    await page.goto("/admin/login");
    await page.locator('input[name="password"]').first().fill(ADMIN_PASSWORD);
    await page.locator("button:has-text('Se connecter')").first().click();
    await page.waitForURL("/admin", { waitUntil: "commit", timeout: 10000 });

    await openMobileAdminMenu(page);
    const logoutButton = page.locator("button:has-text('Déconnexion')").first();
    await expect(logoutButton).toBeVisible({ timeout: 10000 });
    await logoutButton.evaluate((el) => (el as HTMLElement).click());
    await page.waitForURL("/admin/login", { timeout: 5000 });

    await context.clearCookies();
    await page.goto("/admin");
    await page.waitForURL("/admin/login", { timeout: 5000 });
  });

  test("mobile admin login works", async ({ page, context }) => {
    test.skip(!ADMIN_PASSWORD, "ADMIN_PASSWORD not configured");
    await context.clearCookies();
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto("/admin/login");
    await expect(page.getByTestId("admin-login-title").first()).toBeVisible();
    await page.locator('input[name="password"]').first().fill(ADMIN_PASSWORD);
    await page.locator("button:has-text('Se connecter')").first().click();
    await page.waitForURL("/admin", { waitUntil: "commit", timeout: 10000 });
    await expect(page.getByRole("heading", { name: "Vue d'ensemble" }).first()).toBeVisible({ timeout: 15000 });

    const cookies = await context.cookies();
    const adminCookie = cookies.find((c) => c.name === "admin_session");
    expect(adminCookie).toBeTruthy();
    expect(adminCookie?.httpOnly).toBe(true);

    await context.clearCookies();
    await page.goto("/admin");
    await page.waitForURL("/admin/login", { timeout: 5000 });
  });
});
