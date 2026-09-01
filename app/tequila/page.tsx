import type { Metadata } from "next";
import { buildPageMetadata } from "@/lib/data/page-contents";
import { CategoryRoutePage } from "@/components/catalog/category-route-page";

export const revalidate = 60;

const PUBLIC_SLUG = "tequila";
const CATEGORY_SLUG = "tequila";

export async function generateMetadata(): Promise<Metadata> {
  return buildPageMetadata(PUBLIC_SLUG, {
    title: "Tequila à Jérusalem | Terminal 3",
    description:
      "Tequilas blancs, reposados et añejos sélectionnés avec soin. Découvrez la sélection de tequila de Terminal 3 à Jérusalem.",
    canonical: "/tequila",
  });
}

export default function TequilaPage() {
  return (
    <CategoryRoutePage
      publicSlug={PUBLIC_SLUG}
      categorySlug={CATEGORY_SLUG}
      pretitle="Blanco · Reposado · Añejo"
      fallbackTitle="Nos tequilas"
      fallbackSubtitle="De l’agave à votre verre : une sélection de tequilas authentiques et raffinées."
      fallbackCoverUrl=""
      ctaLabel="Voir toutes les tequilas"
      ctaVariant="dark"
    />
  );
}
