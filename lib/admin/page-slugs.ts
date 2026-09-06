/**
 * Maps admin content slugs (page_contents.slug) to their public route.
 * Single source shared by publish actions (revalidation) and the editor
 * ("Voir la page" link). Slugs without a public route return null.
 */
export const PUBLIC_PATH_BY_SLUG: Record<string, string> = {
  home: "/",
  vins: "/vins",
  spiritueux: "/spiritueux",
  charcuterie: "/charcuterie",
  poissons: "/poissons",
  plateaux: "/plateaux",
  nouveautes: "/nouveautes",
  promotions: "/promotions",
  inspirations: "/inspirations",
  club: "/club",
  "a-propos": "/a-propos",
  contact: "/contact",
  conditions: "/conditions",
  confidentialite: "/confidentialite",
  footer: "/",
};

export function publicPathForSlug(slug: string): string | null {
  return PUBLIC_PATH_BY_SLUG[slug] ?? null;
}
