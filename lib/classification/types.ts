export type ClassificationConfidence = "high" | "medium" | "low" | "unknown";
export type ClassificationFamily = "Alcools" | "Épicerie fine" | "Autres";

export interface ClassificationRuleInput {
  keyword: string;
  normalizedKeyword: string;
  brand?: string;
  categorySlug?: string;
  subcategorySlug?: string;
  productType?: string;
  priority: number;
  confidence: "high" | "medium" | "low";
  isActive?: boolean;
}

export interface MatchedRule {
  keyword: string;
  brand?: string;
  categorySlug?: string;
  subcategorySlug?: string;
  productType?: string;
  priority: number;
  confidence: "high" | "medium" | "low";
}

export interface ClassificationResult {
  confidence: ClassificationConfidence;
  matchedRules: MatchedRule[];
  family: ClassificationFamily;
  category: string | null;
  subcategory: string | null;
  brand: string | null;
  productType: string | null;
  volume?: string;
  weight?: string;
  vintage?: string;
  age?: string;
  keywords: string[];
  slug: string;
  suggestedSku: string;
  reasons: string[];
  conflicts: string[];
}

export interface ClassifyOptions {
  rules?: ClassificationRuleInput[];
  lockedCategory?: string | null;
  lockedSubcategory?: string | null;
}
