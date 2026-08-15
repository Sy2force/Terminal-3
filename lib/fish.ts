/**
 * Shared fish subcategory + packaging labels. Kept in a plain (non "use
 * client") module — same reasoning as lib/spirits.ts and
 * lib/charcuterie.ts — so it can be safely imported from both server
 * components (app/poissons/[slug]/page.tsx) and client components
 * (components/catalog/fish-card.tsx, fish-catalog-config.tsx).
 */
export const FISH_SUBCATEGORY_LABELS: Record<string, string> = {
  SAUMON_FUME: "Saumon fumé",
  SAUMON_HERBES: "Saumon aux herbes",
  ANCHOIS: "Anchois",
  VENTRECHE_THON: "Ventrèche de thon",
  FILET_THON: "Filet de thon",
  PLATEAUX: "Plateaux",
};

export const FISH_PACKAGING_LABELS: Record<string, string> = {
  GLASS: "Verre",
  CAN: "Conserve",
  VACUUM: "Sous vide",
  BULK: "Format professionnel",
  PLASTIC: "Plastique",
};
