import type { ClassificationRuleInput, ClassificationConfidence } from "./types";

export const CONFIDENCE_ORDER: ClassificationConfidence[] = ["high", "medium", "low", "unknown"];

// Built-in dictionary used until the database table is populated.
// These rules use French keywords and slugs for categories/subcategories.
export const defaultRules: ClassificationRuleInput[] = [
  // === Brands (highest priority) ===
  { keyword: "Glenfiddich", normalizedKeyword: "glenfiddich", brand: "Glenfiddich", categorySlug: "whiskies", subcategorySlug: "Single malt", productType: "WHISKY", priority: 100, confidence: "high" },
  { keyword: "Chivas", normalizedKeyword: "chivas", brand: "Chivas Regal", categorySlug: "whiskies", subcategorySlug: "Blended whisky", productType: "WHISKY", priority: 100, confidence: "high" },
  { keyword: "Jack Daniel's", normalizedKeyword: "jack daniels", brand: "Jack Daniel's", categorySlug: "whiskies", subcategorySlug: "American whiskey", productType: "WHISKY", priority: 100, confidence: "high" },
  { keyword: "Jack Daniel", normalizedKeyword: "jack daniel", brand: "Jack Daniel's", categorySlug: "whiskies", subcategorySlug: "American whiskey", productType: "WHISKY", priority: 100, confidence: "high" },
  { keyword: "Don Julio", normalizedKeyword: "don julio", brand: "Don Julio", categorySlug: "tequilas", productType: "TEQUILA", priority: 100, confidence: "high" },
  { keyword: "Yarden", normalizedKeyword: "yarden", brand: "Yarden", categorySlug: "vins", productType: "WINE", priority: 100, confidence: "high" },
  { keyword: "Gamla", normalizedKeyword: "gamla", brand: "Gamla", categorySlug: "vins", productType: "WINE", priority: 100, confidence: "high" },
  { keyword: "Castel", normalizedKeyword: "castel", brand: "Castel", categorySlug: "vins", productType: "WINE", priority: 100, confidence: "high" },
  { keyword: "Grey Goose", normalizedKeyword: "grey goose", brand: "Grey Goose", categorySlug: "vodkas", productType: "VODKA", priority: 100, confidence: "high" },
  { keyword: "Diplomático", normalizedKeyword: "diplomatico", brand: "Diplomático", categorySlug: "rhums", productType: "RHUM", priority: 100, confidence: "high" },
  { keyword: "Hennessy", normalizedKeyword: "hennessy", brand: "Hennessy", categorySlug: "cognacs", productType: "COGNAC", priority: 100, confidence: "high" },
  { keyword: "Remy Martin", normalizedKeyword: "remy martin", brand: "Remy Martin", categorySlug: "cognacs", productType: "COGNAC", priority: 100, confidence: "high" },
  { keyword: "Dewar's", normalizedKeyword: "dewars", brand: "Dewar's", categorySlug: "whiskies", subcategorySlug: "Blended whisky", productType: "WHISKY", priority: 100, confidence: "high" },
  { keyword: "Bushmills", normalizedKeyword: "bushmills", brand: "Bushmills", categorySlug: "whiskies", productType: "WHISKY", priority: 100, confidence: "high" },
  { keyword: "Jameson", normalizedKeyword: "jameson", brand: "Jameson", categorySlug: "whiskies", subcategorySlug: "Irish whiskey", productType: "WHISKY", priority: 100, confidence: "high" },
  { keyword: "Johnnie Walker", normalizedKeyword: "johnnie walker", brand: "Johnnie Walker", categorySlug: "whiskies", subcategorySlug: "Blended whisky", productType: "WHISKY", priority: 100, confidence: "high" },
  { keyword: "Ballantine's", normalizedKeyword: "ballantines", brand: "Ballantine's", categorySlug: "whiskies", productType: "WHISKY", priority: 100, confidence: "high" },
  { keyword: "Absolut", normalizedKeyword: "absolut", brand: "Absolut", categorySlug: "vodkas", productType: "VODKA", priority: 100, confidence: "high" },
  { keyword: "Kahlúa", normalizedKeyword: "kahlua", brand: "Kahlúa", categorySlug: "liqueurs", productType: "LIQUEUR", priority: 100, confidence: "high" },
  { keyword: "Grand Marnier", normalizedKeyword: "grand marnier", brand: "Grand Marnier", categorySlug: "liqueurs", productType: "LIQUEUR", priority: 100, confidence: "high" },
  { keyword: "Jägermeister", normalizedKeyword: "jagermeister", brand: "Jägermeister", categorySlug: "liqueurs", productType: "LIQUEUR", priority: 100, confidence: "high" },
  { keyword: "Campari", normalizedKeyword: "campari", brand: "Campari", categorySlug: "liqueurs", productType: "LIQUEUR", priority: 100, confidence: "high" },

  // === Wine types / cépages ===
  { keyword: "Cabernet Sauvignon", normalizedKeyword: "cabernet sauvignon", categorySlug: "vins", subcategorySlug: "Vin rouge", productType: "WINE", priority: 80, confidence: "high" },
  { keyword: "Merlot", normalizedKeyword: "merlot", categorySlug: "vins", subcategorySlug: "Vin rouge", productType: "WINE", priority: 80, confidence: "high" },
  { keyword: "Syrah", normalizedKeyword: "syrah", categorySlug: "vins", subcategorySlug: "Vin rouge", productType: "WINE", priority: 80, confidence: "high" },
  { keyword: "Chardonnay", normalizedKeyword: "chardonnay", categorySlug: "vins", subcategorySlug: "Vin blanc", productType: "WINE", priority: 80, confidence: "high" },
  { keyword: "Sauvignon Blanc", normalizedKeyword: "sauvignon blanc", categorySlug: "vins", subcategorySlug: "Vin blanc", productType: "WINE", priority: 80, confidence: "high" },
  { keyword: "Rosé", normalizedKeyword: "rose", categorySlug: "vins", subcategorySlug: "Vin rosé", productType: "WINE", priority: 80, confidence: "high" },
  { keyword: "Rouge", normalizedKeyword: "rouge", categorySlug: "vins", subcategorySlug: "Vin rouge", productType: "WINE", priority: 60, confidence: "medium" },
  { keyword: "Blanc", normalizedKeyword: "blanc", categorySlug: "vins", subcategorySlug: "Vin blanc", productType: "WINE", priority: 60, confidence: "medium" },

  // === Spirit subcategories ===
  { keyword: "Blanco", normalizedKeyword: "blanco", categorySlug: "tequilas", subcategorySlug: "Blanco", productType: "TEQUILA", priority: 80, confidence: "high" },
  { keyword: "Reposado", normalizedKeyword: "reposado", categorySlug: "tequilas", subcategorySlug: "Reposado", productType: "TEQUILA", priority: 80, confidence: "high" },
  { keyword: "Añejo", normalizedKeyword: "anejo", categorySlug: "tequilas", subcategorySlug: "Añejo", productType: "TEQUILA", priority: 80, confidence: "high" },
  { keyword: "Single malt", normalizedKeyword: "single malt", categorySlug: "whiskies", subcategorySlug: "Single malt", productType: "WHISKY", priority: 80, confidence: "high" },
  { keyword: "Blended", normalizedKeyword: "blended", categorySlug: "whiskies", subcategorySlug: "Blended whisky", productType: "WHISKY", priority: 70, confidence: "medium" },
  { keyword: "American whiskey", normalizedKeyword: "american whiskey", categorySlug: "whiskies", subcategorySlug: "American whiskey", productType: "WHISKY", priority: 80, confidence: "high" },

  // === Fish and delicatessen ===
  { keyword: "Saumon", normalizedKeyword: "saumon", categorySlug: "poissons", subcategorySlug: "Saumon", productType: "FISH", priority: 80, confidence: "high" },
  { keyword: "Saumon fumé", normalizedKeyword: "saumon fume", categorySlug: "poissons", subcategorySlug: "Saumon fumé", productType: "FISH", priority: 85, confidence: "high" },
  { keyword: "Gravlax", normalizedKeyword: "gravlax", categorySlug: "poissons", subcategorySlug: "Gravlax", productType: "FISH", priority: 80, confidence: "high" },
  { keyword: "Thon", normalizedKeyword: "thon", categorySlug: "poissons", subcategorySlug: "Thon", productType: "FISH", priority: 80, confidence: "high" },
  { keyword: "Ventresca", normalizedKeyword: "ventresca", categorySlug: "poissons", subcategorySlug: "Ventresca", productType: "FISH", priority: 80, confidence: "high" },
  { keyword: "Anchois", normalizedKeyword: "anchois", categorySlug: "poissons", subcategorySlug: "Anchois", productType: "FISH", priority: 80, confidence: "high" },
  { keyword: "Rosette", normalizedKeyword: "rosette", categorySlug: "charcuteries", subcategorySlug: "Rosette", productType: "CHARCUTERIE", priority: 80, confidence: "high" },
  { keyword: "Saucisson", normalizedKeyword: "saucisson", categorySlug: "charcuteries", subcategorySlug: "Saucisson", productType: "CHARCUTERIE", priority: 80, confidence: "high" },
  { keyword: "Pastrami", normalizedKeyword: "pastrami", categorySlug: "charcuteries", subcategorySlug: "Pastrami", productType: "CHARCUTERIE", priority: 80, confidence: "high" },
  { keyword: "Cabanos", normalizedKeyword: "cabanos", categorySlug: "charcuteries", subcategorySlug: "Cabanos", productType: "CHARCUTERIE", priority: 80, confidence: "high" },
  { keyword: "Pâté", normalizedKeyword: "pate", categorySlug: "charcuteries", subcategorySlug: "Pâté", productType: "CHARCUTERIE", priority: 80, confidence: "high" },
  { keyword: "Pâté au vin blanc", normalizedKeyword: "pate au vin blanc", categorySlug: "charcuteries", subcategorySlug: "Pâté", productType: "CHARCUTERIE", priority: 85, confidence: "high" },
  { keyword: "Camembert", normalizedKeyword: "camembert", categorySlug: "fromages", subcategorySlug: "Camembert", productType: "CHEESE", priority: 80, confidence: "high" },

  // === Generic families ===
  { keyword: "Whisky", normalizedKeyword: "whisky", categorySlug: "whiskies", productType: "WHISKY", priority: 50, confidence: "medium" },
  { keyword: "Whiskey", normalizedKeyword: "whiskey", categorySlug: "whiskies", productType: "WHISKY", priority: 50, confidence: "medium" },
  { keyword: "Tequila", normalizedKeyword: "tequila", categorySlug: "tequilas", productType: "TEQUILA", priority: 50, confidence: "medium" },
  { keyword: "Vodka", normalizedKeyword: "vodka", categorySlug: "vodkas", productType: "VODKA", priority: 50, confidence: "medium" },
  { keyword: "Rhum", normalizedKeyword: "rhum", categorySlug: "rhums", productType: "RHUM", priority: 50, confidence: "medium" },
  { keyword: "Cognac", normalizedKeyword: "cognac", categorySlug: "cognacs", productType: "COGNAC", priority: 50, confidence: "medium" },
  { keyword: "Liqueur", normalizedKeyword: "liqueur", categorySlug: "liqueurs", productType: "LIQUEUR", priority: 50, confidence: "medium" },
  { keyword: "Gin", normalizedKeyword: "gin", categorySlug: "gins", productType: "GIN", priority: 50, confidence: "medium" },
  { keyword: "Vin", normalizedKeyword: "vin", categorySlug: "vins", productType: "WINE", priority: 50, confidence: "medium" },
  { keyword: "Fromage", normalizedKeyword: "fromage", categorySlug: "fromages", productType: "CHEESE", priority: 50, confidence: "low" },
];

// Fast lookup by normalized keyword.
export const rulesByKeyword: Map<string, ClassificationRuleInput> = new Map(
  defaultRules.map((r) => [r.normalizedKeyword, r]),
);
