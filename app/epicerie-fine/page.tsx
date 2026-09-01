import type { Metadata } from "next";
import { buildPageMetadata } from "@/lib/data/page-contents";
import { CategoryRoutePage } from "@/components/catalog/category-route-page";

export const revalidate = 60;

const PUBLIC_SLUG = "epicerie-fine";
const CATEGORY_SLUG = "epicerie-fine";

export async function generateMetadata(): Promise<Metadata> {
  return buildPageMetadata(PUBLIC_SLUG, {
    title: "Épicerie fine à Jérusalem | Terminal 3",
    description:
      "Charcuteries, fromages, huiles, olives et produits d’épicerie fine de qualité. Découvrez la sélection de Terminal 3 à Jérusalem.",
    canonical: "/epicerie-fine",
  });
}

export default function GourmetPage() {
  return (
    <CategoryRoutePage
      publicSlug={PUBLIC_SLUG}
      categorySlug={CATEGORY_SLUG}
      pretitle="Charcuterie · Fromage · Huile · Olive"
      fallbackTitle="Notre épicerie fine"
      fallbackSubtitle="Des produits d’exception pour composer vos plateaux et sublimer vos repas."
      fallbackCoverUrl=""
      ctaLabel="Voir toute l’épicerie fine"
      ctaVariant="sarfati"
    />
  );
}
