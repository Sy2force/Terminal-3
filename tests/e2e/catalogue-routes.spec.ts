import { test, expect } from "@playwright/test";

const CATEGORY_ROUTES = [
  "/whisky",
  "/gin",
  "/tequila",
  "/arak",
  "/bieres",
  "/saumon-fume",
  "/epicerie-fine",
];

test.describe("Routes catalogue dédiées", () => {
  for (const route of CATEGORY_ROUTES) {
    test(`${route} charge sans erreur serveur`, async ({ page }) => {
      const response = await page.goto(route);
      // Without real categories in the database these may render the
      // not-found page; we only guarantee a non-5xx response in this smoke.
      expect(response?.status()).toBeLessThan(500);
    });
  }
});
