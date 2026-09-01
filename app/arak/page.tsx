import type { Metadata } from "next";
import { buildPageMetadata } from "@/lib/data/page-contents";
import { CategoryRoutePage } from "@/components/catalog/category-route-page";

export const revalidate = 60;

const PUBLIC_SLUG = "arak";
const CATEGORY_SLUG = "arak";

export async function generateMetadata(): Promise<Metadata> {
  return buildPageMetadata(PUBLIC_SLUG, {
    title: "Arak à Jérusalem | Terminal 3",
    description:
      "Arak israélien et libanais, tradition et anis pour vos apéritifs. Découvrez la sélection d’arak de Terminal 3 à Jérusalem.",
    canonical: "/arak",
  });
}

export default function ArakPage() {
  return (
    <CategoryRoutePage
      publicSlug={PUBLIC_SLUG}
      categorySlug={CATEGORY_SLUG}
      pretitle="Tradition · Anis · Terroir"
      fallbackTitle="Nos araks"
      fallbackSubtitle="L’arak dans ses plus belles expressions, du traditionnel aux plus raffinés."
      fallbackCoverUrl=""
      ctaLabel="Voir tous les araks"
      ctaVariant="dark"
    />
  );
}
