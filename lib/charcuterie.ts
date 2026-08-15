/**
 * Shared charcuterie subcategory labels. Kept in a plain (non "use
 * client") module — same reasoning as lib/spirits.ts — so it can be
 * safely imported from both server components
 * (app/charcuterie/[slug]/page.tsx) and client components
 * (components/catalog/charcuterie-card.tsx, charcuterie-catalog-config.tsx).
 */
export const CHARCUTERIE_SUBCATEGORY_LABELS: Record<string, string> = {
  FRANCAIS: "Français",
  ROSETTE: "Rosette",
  SINTA: "Sinta",
  PASTRAMI: "Pastrami",
  ROASTBEEF: "Roast-beef",
  KABANOS: "Kabanos",
  PATES: "Pâtés",
  BATONS: "Bâtons",
  SAUCISSES: "Saucisses",
  VOLAILLE: "Volaille",
  PLATEAUX: "Plateaux",
};
