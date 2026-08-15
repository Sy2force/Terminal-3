/**
 * Shared spirits subcategory labels. Kept in a plain (non "use client")
 * module so it can be safely imported from both server components
 * (app/spiritueux/[slug]/page.tsx) and client components
 * (components/catalog/spirit-card.tsx, spirit-catalog-config.tsx) —
 * importing a plain object export from a "use client" file into a
 * Server Component silently strips it to an empty object.
 */
export const SUBCATEGORY_LABELS: Record<string, string> = {
  WHISKY: "Whisky",
  ARAK: "Arak",
  COGNAC: "Cognac",
  VODKA: "Vodka",
  GIN: "Gin",
  RHUM: "Rhum",
  TEQUILA: "Tequila",
  LIQUEUR: "Liqueur",
  APERITIF: "Apéritif",
  PREMIUM: "Spiritueux premium",
};
