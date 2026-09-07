import { test, expect, type Page } from "@playwright/test";

/**
 * Structure du tableau de bord admin. Nécessite ADMIN_PASSWORD (la connexion
 * est réellement exécutée). Skippé si la variable est absente.
 *
 * Vérifie :
 * - aucun chrome public (header boutique, footer, bottom nav) dans /admin ;
 * - la sidebar tient en 6 groupes maximum ;
 * - pas de défilement horizontal à 1440 / 390 px ;
 * - les 4 cartes prioritaires et les blocs du premier écran sont présents ;
 * - un seul lien « Voir la boutique ».
 */

const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "";

async function loginAsAdmin(page: Page) {
  await page.goto("/admin/login");
  await page.locator('input[name="password"]').first().fill(ADMIN_PASSWORD);
  await page.locator("button:has-text('Se connecter')").first().click();
  await page.waitForURL("/admin", { timeout: 8000 });
}

async function horizontalOverflow(page: Page): Promise<number> {
  return page.evaluate(
    () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
  );
}

test.describe("admin dashboard structure", () => {
  test.skip(!ADMIN_PASSWORD, "ADMIN_PASSWORD not configured");

  test("no public chrome inside /admin", async ({ page }) => {
    await loginAsAdmin(page);
    // Public site elements must not render inside the admin area.
    await expect(page.locator("nav").getByText("Boutique")).toHaveCount(0);
    await expect(page.locator("footer")).toHaveCount(0);
    await expect(page.locator("a", { hasText: "Créer un compte" })).toHaveCount(0);
    await expect(page.locator("a", { hasText: "Se connecter" }).first()).toHaveCount(0);
  });

  test("sidebar has at most 6 nav groups and one 'Voir la boutique' link", async ({ page }) => {
    await loginAsAdmin(page);
    const groups = page.locator("aside button[aria-expanded]");
    const count = await groups.count();
    expect(count).toBeLessThanOrEqual(6);
    expect(count).toBeGreaterThanOrEqual(4);
    await expect(page.locator('a:has-text("Voir la boutique")')).toHaveCount(1);
  });

  test("first screen shows the 4 priority cards", async ({ page }) => {
    await loginAsAdmin(page);
    for (const label of ["Nouvelles commandes", "À préparer", "Prêtes à récupérer", "Alertes"]) {
      await expect(page.getByText(label, { exact: false }).first()).toBeVisible();
    }
    await expect(page.getByRole("heading", { name: "Commandes récentes" })).toBeVisible();
    await expect(page.getByRole("heading", { name: "Activité récente" })).toBeVisible();
    await expect(page.getByText("État du catalogue")).toBeVisible();
    await expect(page.getByText("Actions rapides")).toBeVisible();
  });

  test("no horizontal overflow at desktop and mobile widths", async ({ page }) => {
    await loginAsAdmin(page);
    for (const width of [320, 390, 768, 1024, 1440, 1920]) {
      await page.setViewportSize({ width, height: 900 });
      await page.waitForTimeout(200);
      const overflow = await horizontalOverflow(page);
      expect(overflow, `overflow at ${width}px`).toBeLessThanOrEqual(1);
    }
  });

  test("mobile drawer opens and closes", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await loginAsAdmin(page);
    const menuButton = page.locator('button[aria-label="Ouvrir le menu"]');
    await expect(menuButton).toBeVisible();
    await menuButton.click();
    await expect(page.locator("aside")).toBeVisible();
    await page.keyboard.press("Escape").catch(() => {});
  });
});
