import { defaultRules } from "./rules";
import {
  normalize,
  slugify,
  extractVolume,
  extractWeight,
  extractVintage,
  extractAge,
  generateKeywords,
  generateSuggestedSku,
} from "./parser";
import type {
  ClassificationResult,
  ClassificationConfidence,
  ClassifyOptions,
  MatchedRule,
} from "./types";

export * from "./types";
export * from "./parser";
export { defaultRules } from "./rules";

const FAMILY_BY_CATEGORY: Record<string, "Alcools" | "Épicerie fine"> = {
  vins: "Alcools",
  whiskies: "Alcools",
  tequilas: "Alcools",
  vodkas: "Alcools",
  rhums: "Alcools",
  gins: "Alcools",
  araks: "Alcools",
  cognacs: "Alcools",
  liqueurs: "Alcools",
  bieres: "Alcools",
  poissons: "Épicerie fine",
  charcuteries: "Épicerie fine",
  fromages: "Épicerie fine",
  olives: "Épicerie fine",
  huiles: "Épicerie fine",
  epices: "Épicerie fine",
  capres: "Épicerie fine",
};

function confidenceFromRules(
  bestRule: MatchedRule | undefined,
  conflicts: string[],
): ClassificationConfidence {
  if (conflicts.length > 0) return "low";
  if (!bestRule) return "unknown";
  if (bestRule.confidence === "high") return "high";
  if (bestRule.confidence === "medium") return "medium";
  if (bestRule.confidence === "low") return "low";
  return "unknown";
}

export function classifyProduct(
  rawName: string,
  options: ClassifyOptions = {},
): ClassificationResult {
  const { rules = defaultRules, lockedCategory, lockedSubcategory } = options;
  const normalizedName = normalize(rawName);

  const matchedRules = rules
    .filter((r) => r.isActive !== false)
    .filter((r) => normalizedName.includes(r.normalizedKeyword))
    .map(
      (r): MatchedRule => ({
        keyword: r.keyword,
        brand: r.brand,
        categorySlug: r.categorySlug,
        subcategorySlug: r.subcategorySlug,
        productType: r.productType,
        priority: r.priority,
        confidence: r.confidence,
      }),
    )
    .sort((a, b) => {
      if (a.priority !== b.priority) return b.priority - a.priority;
      return b.keyword.length - a.keyword.length;
    });

  const reasons: string[] = [];
  const conflicts: string[] = [];

  // Brand: highest priority rule with an explicit brand.
  const brandRule = matchedRules.find((r) => r.brand);
  const brand = brandRule?.brand ?? null;
  if (brand) reasons.push(`${brand} reconnu comme marque.`);

  // Category from the best matching rule that has one.
  const categoryRule = matchedRules.find((r) => r.categorySlug);
  let category = lockedCategory ?? categoryRule?.categorySlug ?? null;
  let subcategory = lockedSubcategory ?? categoryRule?.subcategorySlug ?? null;

  // Subcategory: pick the best rule that has a subcategory and does not conflict with brand.
  const subcategoryRule = matchedRules.find((r) => r.subcategorySlug);
  if (!lockedSubcategory && subcategoryRule?.subcategorySlug) {
    subcategory = subcategoryRule.subcategorySlug;
  }

  // Conflict detection: a brand rule says one category, but another rule says another category.
  if (brandRule && categoryRule && brandRule.categorySlug && categoryRule.categorySlug && brandRule.categorySlug !== categoryRule.categorySlug) {
    conflicts.push(
      `${brandRule.brand} est une marque de ${brandRule.categorySlug}, mais le mot ${categoryRule.keyword} évoque ${categoryRule.categorySlug}.`,
    );
    // Keep the brand's category unless the user has locked one.
    if (!lockedCategory) {
      category = brandRule.categorySlug;
    }
  }

  // Conflicting subcategory (e.g. brand whisky with "Blanco" tequila)
  if (brandRule?.categorySlug && subcategoryRule?.categorySlug && brandRule.categorySlug !== subcategoryRule.categorySlug) {
    conflicts.push(
      `La marque ${brandRule.brand} appartient à ${brandRule.categorySlug}, mais le mot ${subcategoryRule.keyword} évoque ${subcategoryRule.categorySlug}.`,
    );
  }

  const productType = brandRule?.productType ?? categoryRule?.productType ?? null;

  const volume = extractVolume(rawName);
  if (volume) reasons.push(`${volume} détecté comme volume.`);
  const weight = extractWeight(rawName);
  if (weight) reasons.push(`${weight} détecté comme poids.`);
  const vintage = extractVintage(rawName);
  if (vintage) reasons.push(`${vintage} détecté comme millésime.`);
  const age = extractAge(rawName);
  if (age) reasons.push(`${age} détecté comme âge.`);

  // Impossible vintage is a conflict.
  if (rawName.match(/\b(19|20)\d{2}\b/) && !vintage) {
    const bad = rawName.match(/\b(19|20)\d{2}\b/)![0];
    conflicts.push(`Le millésime ${bad} semble invalide.`);
  }

  const family: ClassificationResult["family"] =
    category && FAMILY_BY_CATEGORY[category] ? FAMILY_BY_CATEGORY[category] : "Autres";

  if (category) reasons.push(`${subcategory ?? category} proposé selon la règle ${brandRule?.keyword ?? categoryRule?.keyword}.`);

  const bestRule = matchedRules[0];
  const confidence = confidenceFromRules(bestRule, conflicts);

  const keywords = generateKeywords({
    brand,
    category,
    subcategory,
    vintage,
    age,
    volume,
    weight,
  });

  const slug = slugify(rawName);
  const suggestedSku = generateSuggestedSku(rawName, brand, category);

  return {
    confidence,
    matchedRules,
    family,
    category,
    subcategory,
    brand,
    productType,
    volume,
    weight,
    vintage,
    age,
    keywords,
    slug,
    suggestedSku,
    reasons,
    conflicts,
  };
}
