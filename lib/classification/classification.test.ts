import { describe, it, expect } from "vitest";
import { classifyProduct } from "./index";

describe("classifyProduct", () => {
  it("classifie Glenfiddich 12 ans 700 ml", () => {
    const result = classifyProduct("Glenfiddich 12 ans 700 ml");
    expect(result.brand).toBe("Glenfiddich");
    expect(result.category).toBe("whiskies");
    expect(result.subcategory).toBe("Single malt");
    expect(result.age).toBe("12 ans");
    expect(result.volume).toBe("700ml");
    expect(result.confidence).toBe("high");
    expect(result.family).toBe("Alcools");
    expect(result.conflicts).toHaveLength(0);
  });

  it("classifie Chivas Regal 12 ans", () => {
    const result = classifyProduct("Chivas Regal 12 ans");
    expect(result.brand).toBe("Chivas Regal");
    expect(result.category).toBe("whiskies");
    expect(result.subcategory).toBe("Blended whisky");
    expect(result.age).toBe("12 ans");
    expect(result.confidence).toBe("high");
  });

  it("classifie Don Julio Blanco 700 ml", () => {
    const result = classifyProduct("Don Julio Blanco 700 ml");
    expect(result.brand).toBe("Don Julio");
    expect(result.category).toBe("tequilas");
    expect(result.subcategory).toBe("Blanco");
    expect(result.volume).toBe("700ml");
    expect(result.confidence).toBe("high");
  });

  it("classifie Don Julio Reposado", () => {
    const result = classifyProduct("Don Julio Reposado");
    expect(result.brand).toBe("Don Julio");
    expect(result.category).toBe("tequilas");
    expect(result.subcategory).toBe("Reposado");
    expect(result.confidence).toBe("high");
  });

  it("classifie Yarden Cabernet Sauvignon 2022", () => {
    const result = classifyProduct("Yarden Cabernet Sauvignon 2022");
    expect(result.brand).toBe("Yarden");
    expect(result.category).toBe("vins");
    expect(result.subcategory).toBe("Vin rouge");
    expect(result.vintage).toBe("2022");
    expect(result.confidence).toBe("high");
  });

  it("classifie Gamla Chardonnay 2023", () => {
    const result = classifyProduct("Gamla Chardonnay 2023");
    expect(result.brand).toBe("Gamla");
    expect(result.category).toBe("vins");
    expect(result.subcategory).toBe("Vin blanc");
    expect(result.vintage).toBe("2023");
    expect(result.confidence).toBe("high");
  });

  it("classifie Saumon fumé 100 g", () => {
    const result = classifyProduct("Saumon fumé 100 g");
    expect(result.category).toBe("poissons");
    expect(result.subcategory).toBe("Saumon fumé");
    expect(result.weight).toBe("100g");
    expect(result.confidence).toBe("high");
    expect(result.family).toBe("Épicerie fine");
  });

  it("classifie Thon Ventresca 300 g", () => {
    const result = classifyProduct("Thon Ventresca 300 g");
    expect(result.category).toBe("poissons");
    expect(result.subcategory).toBe("Ventresca");
    expect(result.weight).toBe("300g");
    expect(result.confidence).toBe("high");
  });

  it("classifie Anchois à l'huile", () => {
    const result = classifyProduct("Anchois à l'huile");
    expect(result.category).toBe("poissons");
    expect(result.subcategory).toBe("Anchois");
    expect(result.confidence).toBe("high");
  });

  it("classifie Rosette artisanale 100 g", () => {
    const result = classifyProduct("Rosette artisanale 100 g");
    expect(result.category).toBe("charcuteries");
    expect(result.subcategory).toBe("Rosette");
    expect(result.weight).toBe("100g");
    expect(result.confidence).toBe("high");
  });

  it("classifie Saucisson français", () => {
    const result = classifyProduct("Saucisson français");
    expect(result.category).toBe("charcuteries");
    expect(result.subcategory).toBe("Saucisson");
    expect(result.confidence).toBe("high");
  });

  it("classifie Pâté au vin blanc", () => {
    const result = classifyProduct("Pâté au vin blanc");
    expect(result.category).toBe("charcuteries");
    expect(result.subcategory).toBe("Pâté");
    expect(result.confidence).toBe("high");
  });

  it("classifie Camembert", () => {
    const result = classifyProduct("Camembert");
    expect(result.category).toBe("fromages");
    expect(result.subcategory).toBe("Camembert");
    expect(result.confidence).toBe("high");
    expect(result.family).toBe("Épicerie fine");
  });

  it("détecte un produit inconnu", () => {
    const result = classifyProduct("Produit à identifier");
    expect(result.confidence).toBe("unknown");
    expect(result.category).toBeNull();
    expect(result.brand).toBeNull();
  });

  it("signale un conflit Bushmills Blanco", () => {
    const result = classifyProduct("Bushmills Blanco");
    expect(result.brand).toBe("Bushmills");
    expect(result.category).toBe("whiskies");
    expect(result.conflicts.length).toBeGreaterThan(0);
    expect(result.confidence).toBe("low");
  });

  it("signale un millésime impossible", () => {
    const result = classifyProduct("Merlot 2037");
    expect(result.vintage).toBeUndefined();
    expect(result.conflicts.some((c) => c.includes("2037"))).toBe(true);
    expect(result.confidence).toBe("low");
  });

  it("respecte un verrouillage de catégorie", () => {
    const result = classifyProduct("Bushmills Blanco", {
      lockedCategory: "tequilas",
      lockedSubcategory: "Blanco",
    });
    expect(result.category).toBe("tequilas");
    expect(result.subcategory).toBe("Blanco");
  });
});
