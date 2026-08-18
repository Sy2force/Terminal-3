import { describe, it, expect } from "vitest";
import { isProbablyDemoProduct } from "./demo-filter";

describe("isProbablyDemoProduct", () => {
  it("flags placeholder names", () => {
    expect(isProbablyDemoProduct({ name_fr: "Produit à identifier" })).toBe(true);
  });

  it("flags sequential index without brand", () => {
    expect(isProbablyDemoProduct({ name_fr: "Saumon fumé 0" })).toBe(true);
    expect(isProbablyDemoProduct({ name_fr: "Saucisson sec 1" })).toBe(true);
    expect(isProbablyDemoProduct({ name_fr: "Vin 47" })).toBe(true);
  });

  it("flags impossible vintages", () => {
    expect(isProbablyDemoProduct({ name_fr: "Rouge de Galilée 2027" })).toBe(true);
    expect(isProbablyDemoProduct({ name_fr: "Petit Castel 2034" })).toBe(true);
  });

  it("keeps branded products with age", () => {
    expect(isProbablyDemoProduct({ name_fr: "Chivas Regal 12", brand: "Chivas" })).toBe(false);
    expect(isProbablyDemoProduct({ name_fr: "Glenfiddich 18", brand: "Glenfiddich" })).toBe(false);
    expect(isProbablyDemoProduct({ name_fr: "Arak 40", brand: "Elite Arak" })).toBe(false);
  });

  it("keeps products with matching age or volume metadata", () => {
    expect(isProbablyDemoProduct({ name_fr: "Blend 12", age_years: 12 })).toBe(false);
    expect(isProbablyDemoProduct({ name_fr: "Vodka 700", variants: [{ volume_ml: 700 }] })).toBe(false);
    expect(isProbablyDemoProduct({ name_fr: "Saumon 100", variants: [{ weight_g: 100 }] })).toBe(false);
  });

  it("keeps products with valid vintages", () => {
    expect(isProbablyDemoProduct({ name_fr: "Yarden Cabernet Sauvignon 2022", brand: "Yarden" })).toBe(false);
    expect(isProbablyDemoProduct({ name_fr: "Petit Castel 2024", brand: "Petit Castel" })).toBe(false);
    expect(isProbablyDemoProduct({ name_fr: "Petit Castel 2026", brand: "Petit Castel" })).toBe(false);
  });

  it("keeps volume with unit", () => {
    expect(isProbablyDemoProduct({ name_fr: "Grey Goose 700 ml", brand: "Grey Goose" })).toBe(false);
    expect(isProbablyDemoProduct({ name_fr: "Don Julio 700 ml", brand: "Don Julio" })).toBe(false);
  });

  it("keeps weight with unit", () => {
    expect(isProbablyDemoProduct({ name_fr: "Saumon fumé 100 g", brand: "Saumonier" })).toBe(false);
    expect(isProbablyDemoProduct({ name_fr: "Rosette artisanale 100 g", brand: "Rosetier" })).toBe(false);
  });
});
