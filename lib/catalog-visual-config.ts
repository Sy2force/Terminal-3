import type { CategoryRow, CategoryTheme } from "@/types/database";

export type CardStyle = "premium-food" | "packshot" | "lifestyle-large";
export type ImageFit = "contain" | "cover";

export interface CategoryVisualConfig {
  cardStyle: CardStyle;
  imageFit: ImageFit;
  columns: {
    mobile: number;
    tablet: number;
    desktop: number;
  };
  heroLabel: string;
}

const DEFAULT_CONFIG: CategoryVisualConfig = {
  cardStyle: "premium-food",
  imageFit: "cover",
  columns: { mobile: 1, tablet: 2, desktop: 4 },
  heroLabel: "Collection",
};

const THEME_CONFIGS: Record<CategoryTheme, Partial<CategoryVisualConfig>> = {
  DEFAULT: {},
  CELLAR: {
    cardStyle: "packshot",
    imageFit: "contain",
    columns: { mobile: 1, tablet: 2, desktop: 4 },
    heroLabel: "La Cave",
  },
  PACKSHOT: {
    cardStyle: "packshot",
    imageFit: "contain",
    columns: { mobile: 1, tablet: 2, desktop: 4 },
    heroLabel: "Collection",
  },
  GOURMET: {
    cardStyle: "premium-food",
    imageFit: "contain",
    columns: { mobile: 1, tablet: 2, desktop: 3 },
    heroLabel: "Terminal 3 Collection",
  },
  PLATTER: {
    cardStyle: "lifestyle-large",
    imageFit: "cover",
    columns: { mobile: 1, tablet: 2, desktop: 3 },
    heroLabel: "Terminal 3 Signature",
  },
  EDITORIAL: {
    cardStyle: "premium-food",
    imageFit: "cover",
    columns: { mobile: 1, tablet: 2, desktop: 3 },
    heroLabel: "Terminal 3 Collection",
  },
};

const SLUG_OVERRIDES: Record<string, Partial<CategoryVisualConfig>> = {
  "saumon-fume": {
    cardStyle: "premium-food",
    imageFit: "contain",
    columns: { mobile: 1, tablet: 2, desktop: 3 },
    heroLabel: "Terminal 3 Collection",
  },
  "plateaux-saumon": {
    cardStyle: "lifestyle-large",
    imageFit: "cover",
    columns: { mobile: 1, tablet: 2, desktop: 3 },
    heroLabel: "Terminal 3 Signature",
  },
  charcuterie: {
    cardStyle: "premium-food",
    imageFit: "contain",
    columns: { mobile: 1, tablet: 2, desktop: 3 },
    heroLabel: "Terminal 3 Collection",
  },
  vin: {
    cardStyle: "packshot",
    imageFit: "contain",
    columns: { mobile: 1, tablet: 2, desktop: 4 },
    heroLabel: "La Cave",
  },
  whisky: {
    cardStyle: "packshot",
    imageFit: "contain",
    columns: { mobile: 1, tablet: 2, desktop: 4 },
    heroLabel: "La Cave",
  },
  spiritueux: {
    cardStyle: "packshot",
    imageFit: "contain",
    columns: { mobile: 1, tablet: 2, desktop: 4 },
    heroLabel: "La Cave",
  },
};

export function getCategoryVisualConfig(
  category: CategoryRow | null,
): CategoryVisualConfig {
  if (!category) return DEFAULT_CONFIG;
  const themeConfig = category.theme ? THEME_CONFIGS[category.theme] : null;
  const slugConfig = SLUG_OVERRIDES[category.slug];
  return {
    ...DEFAULT_CONFIG,
    ...(themeConfig ?? {}),
    ...(slugConfig ?? {}),
  };
}

export function isSalmonCategory(slug: string): boolean {
  return slug === "saumon-fume" || slug === "plateaux-saumon";
}

export function getMediaFit(
  mediaKind: string | null | undefined,
  categorySlug: string | null | undefined,
): ImageFit {
  if (mediaKind === "LIFESTYLE") return "cover";
  if (mediaKind === "EDITORIAL") return "cover";
  const config = categorySlug ? SLUG_OVERRIDES[categorySlug] : null;
  return config?.imageFit ?? "cover";
}
