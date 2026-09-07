import { test, expect, type Page } from "@playwright/test";

const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "";

const productName = `Produit test E2E ${Math.random().toString(36).slice(2, 8)}`;

// Petit PNG 1x1 transparent valide.
const testPngBase64 =
  "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=";
const testImage = {
  name: "test.png",
  mimeType: "image/png",
  buffer: Buffer.from(testPngBase64, "base64"),
};

async function loginAsAdmin(page: Page) {
  await page.goto("/admin/login");
  await page.locator('input[name="password"]').first().fill(ADMIN_PASSWORD);
  await page.locator("button:has-text('Se connecter')").first().click();
  await page.waitForURL("/admin", { waitUntil: "commit", timeout: 10000 });
}

test.describe("admin product workflow", () => {
  test.skip(!ADMIN_PASSWORD, "ADMIN_PASSWORD not configured");

  test("creates, displays, edits and deletes a real product", async ({ page }) => {
    await loginAsAdmin(page);

    await page.goto("/admin/products/new");
    await expect(page.getByText("Informations principales").first()).toBeVisible();

    await page.locator('input[name="name_fr"]').first().fill(productName);
    await page.locator('input[name="brand"]').first().fill("Sarfati");
    await page.locator('select[name="category_id"]').first().selectOption({ label: "Charcuterie" });

    await page.locator('input[name="base_price"]').first().fill("49.90");

    // Variante : poids et stock
    await page.locator('input[aria-label="Variante 1 - Label"]').first().fill("100 g");
    await page.locator('input[aria-label="Variante 1 - Stock"]').first().fill("5");

    // Upload photo
    const fileInput = page.locator('input[aria-label="Ajouter une image"]').first();
    await fileInput.setInputFiles(testImage);
    await expect(page.locator('img[alt="Image produit"]').first()).toBeVisible({ timeout: 30000 });

    await page.locator('button[value="publish"]').first().click();
    await page.waitForURL("/admin/products?success=created", { timeout: 15000 });
    await expect(page.getByText("Produit publié avec succès.").first()).toBeVisible();

    // Public catalog
    await page.goto("/charcuterie");
    const productLink = page.locator(`a:has-text("${productName}")`).first();
    await expect(productLink).toBeVisible({ timeout: 15000 });
    await expect(page.getByText(/49\.90/).first()).toBeVisible();

    const productHref = await productLink.getAttribute("href");
    expect(productHref).toBeTruthy();
    await page.goto(productHref!);
    await page.waitForLoadState("domcontentloaded");
    await expect(page.getByText(/49\.90/).first()).toBeVisible();

    // Edit from admin
    await page.goto("/admin/products");
    await page.locator('input[placeholder*="Rechercher"]').first().fill(productName);
    await expect(page.locator(`text=${productName}`).first()).toBeVisible();
    await page.locator("a:has-text('Modifier')").first().click();

    await page.locator('input[name="base_price"]').first().fill("59.90");
    await page.locator('button[value="publish"]').first().click();
    await page.waitForURL("/admin/products?success=updated", { timeout: 15000 });

    // Verify updated price on public page
    await page.goto("/charcuterie");
    await expect(page.locator(`a:has-text("${productName}")`).first()).toBeVisible();
    await expect(page.getByText(/59\.90/).first()).toBeVisible();
    await page.locator(`a:has-text("${productName}")`).first().click();
    await expect(page.getByText(/59\.90/).first()).toBeVisible();

    // Delete
    await page.goto("/admin/products");
    await page.locator('input[placeholder*="Rechercher"]').first().fill(productName);
    await expect(page.locator(`text=${productName}`).first()).toBeVisible();

    page.on("dialog", (dialog) => dialog.accept());
    await page.locator("button:has-text('Supprimer')").first().click();
    await page.waitForURL(/success=deleted/, { timeout: 15000 });
    await expect(page.locator(`text=${productName}`)).not.toBeVisible({ timeout: 15000 });

    await page.goto("/charcuterie");
    await page.waitForLoadState("domcontentloaded");
    await expect(page.locator(`text=${productName}`)).not.toBeVisible();
  });

  test("out of stock disables add to cart", async ({ page }) => {
    await loginAsAdmin(page);

    const oosName = `Produit rupture E2E ${Math.random().toString(36).slice(2, 8)}`;
    await page.goto("/admin/products/new");
    await page.locator('input[name="name_fr"]').first().fill(oosName);
    await page.locator('input[name="brand"]').first().fill("Sarfati");
    await page.locator('select[name="category_id"]').first().selectOption({ label: "Charcuterie" });
    await page.locator('input[name="base_price"]').first().fill("30.00");
    await page.locator('input[aria-label="Variante 1 - Stock"]').first().fill("0");
    await page.locator('button[value="publish"]').first().click();
    await page.waitForURL("/admin/products?success=created", { timeout: 15000 });

    await page.goto("/charcuterie");
    const oosLink = page.locator(`a:has-text("${oosName}")`).first();
    await expect(oosLink).toBeVisible({ timeout: 15000 });
    const oosHref = await oosLink.getAttribute("href");
    expect(oosHref).toBeTruthy();
    await page.goto(oosHref!);
    await page.waitForLoadState("domcontentloaded");
    await expect(page.getByText("Rupture de stock").first()).toBeVisible();

    // Cleanup
    await page.goto("/admin/products");
    await page.locator('input[placeholder*="Rechercher"]').first().fill(oosName);
    await expect(page.locator(`text=${oosName}`).first()).toBeVisible({ timeout: 10000 });
    page.on("dialog", (dialog) => dialog.accept());
    await page.locator("button:has-text('Supprimer')").first().click();
    await page.waitForURL(/success=deleted/, { timeout: 15000 });
  });
});
