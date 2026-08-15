/**
 * Maps a product's category slug (as stored in the database) to its
 * public catalog base path — the two differ for wine ("vin" vs
 * "/vins") and fish ("saumon-fume" vs "/poissons"). Falls back to the
 * generic product detail route for any category without a dedicated
 * catalog yet.
 */
const CATEGORY_BASE_PATHS: Record<string, string> = {
  vin: "/vins",
  spiritueux: "/spiritueux",
  charcuterie: "/charcuterie",
  "saumon-fume": "/poissons",
  "plateaux-saumon": "/plateaux",
};

export function categoryBasePath(categorySlug: string | null | undefined): string {
  if (!categorySlug) return "/products";
  return CATEGORY_BASE_PATHS[categorySlug] ?? "/products";
}
