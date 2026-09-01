import type { Metadata } from "next";
import { buildPageMetadata } from "@/lib/data/page-contents";
import { CategoryRoutePage } from "@/components/catalog/category-route-page";

export const revalidate = 60;

const PUBLIC_SLUG = "bieres";
const CATEGORY_SLUG = "bieres";

export async function generateMetadata(): Promise<Metadata> {
  return buildPageMetadata(PUBLIC_SLUG, {
    title: "Bières à Jérusalem | Terminal 3",
    description:
      "Bières craft, blondes, brunes, blanches et IPA pour toutes les envies. Découvrez la sélection de bières de Terminal 3 à Jérusalem.",
    canonical: "/bieres",
  });
}

export default function BeersPage() {
  return (
    <CategoryRoutePage
      publicSlug={PUBLIC_SLUG}
      categorySlug={CATEGORY_SLUG}
      pretitle="Blonde · Brune · Craft · IPA"
      fallbackTitle="Nos bières"
      fallbackSubtitle="Des classiques rafraîchissantes aux craft beers les plus audacieuses."
      fallbackCoverUrl=""
      ctaLabel="Voir toutes les bières"
      ctaVariant="dark"
    />
  );
}
