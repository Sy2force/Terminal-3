import { describe, it, expect } from "vitest";
import { isValidWoltUrl, normalizeWoltUrl, woltButtonLabel } from "./wolt";

describe("wolt", () => {
  it("accepte les URLs wolt.com et wolt.co.il en https", () => {
    expect(isValidWoltUrl("https://wolt.com/en/isr/product/123")).toBe(true);
    expect(isValidWoltUrl("https://www.wolt.co.il/fr/product/abc")).toBe(true);
    expect(isValidWoltUrl("https://restaurant.wolt.com/en/isr/venue/xyz")).toBe(true);
  });

  it("refuse http, données d’identification et domaines ressemblants", () => {
    expect(isValidWoltUrl("http://wolt.com/product/123")).toBe(false);
    expect(isValidWoltUrl("https://user:pass@wolt.com/product/123")).toBe(false);
    expect(isValidWoltUrl("https://wolt-phishing.com/product/123")).toBe(false);
    expect(isValidWoltUrl("javascript:alert(1)")).toBe(false);
    expect(isValidWoltUrl("")).toBe(false);
  });

  it("normalise une URL valide et rejoute l’invalide", () => {
    expect(normalizeWoltUrl("  https://wolt.com/en/isr/product/123  ")).toBe(
      "https://wolt.com/en/isr/product/123",
    );
    expect(normalizeWoltUrl("https://bad.com")).toBeNull();
  });

  it("choisit le libellé selon le lien disponible", () => {
    expect(woltButtonLabel("https://wolt.com/product/123", null)).toBe("Commander sur Wolt");
    expect(woltButtonLabel(null, "https://wolt.com/boutique")).toBe("Voir notre boutique sur Wolt");
    expect(woltButtonLabel(null, null)).toBeNull();
  });
});
