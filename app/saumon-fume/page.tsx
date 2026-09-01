import type { Metadata } from "next";
import { buildPageMetadata } from "@/lib/data/page-contents";
import { CategoryRoutePage } from "@/components/catalog/category-route-page";

export const revalidate = 60;

const PUBLIC_SLUG = "saumon-fume";
const CATEGORY_SLUG = "saumon-fume";

export async function generateMetadata(): Promise<Metadata> {
  return buildPageMetadata(PUBLIC_SLUG, {
    title: "Saumon fumé à Jérusalem | Terminal 3",
    description:
      "Saumon fumé premium, tranché fin ou en pavé, pour vos apéritifs et plateaux. Découvrez la sélection de Terminal 3 à Jérusalem.",
    canonical: "/saumon-fume",
  });
}

export default function SmokedSalmonPage() {
  return (
    <CategoryRoutePage
      publicSlug={PUBLIC_SLUG}
      categorySlug={CATEGORY_SLUG}
      pretitle="Fumé · Tranché fin · Premium"
      fallbackTitle="Nos saumons fumés"
      fallbackSubtitle="Saumon fumé et poissons fins, sélectionnés pour vos apéritifs et plateaux."
      fallbackCoverUrl=""
      ctaLabel="Voir tous les saumons fumés"
      ctaVariant="sarfati"
    />
  );
}
