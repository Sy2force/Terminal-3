import type { Metadata } from "next";
import { buildPageMetadata } from "@/lib/data/page-contents";
import { CategoryRoutePage } from "@/components/catalog/category-route-page";

export const revalidate = 60;

const PUBLIC_SLUG = "gin";
const CATEGORY_SLUG = "gin";

export async function generateMetadata(): Promise<Metadata> {
  return buildPageMetadata(PUBLIC_SLUG, {
    title: "Gin à Jérusalem | Terminal 3",
    description:
      "Gins secs, aromatisés et premium pour vos cocktails ou dégustations. Découvrez la sélection de gin de Terminal 3 à Jérusalem.",
    canonical: "/gin",
  });
}

export default function GinPage() {
  return (
    <CategoryRoutePage
      publicSlug={PUBLIC_SLUG}
      categorySlug={CATEGORY_SLUG}
      pretitle="Dry · Aromatisé · Premium"
      fallbackTitle="Nos gins"
      fallbackSubtitle="Des classiques londoniens aux créations botaniques, le gin dans toutes ses expressions."
      fallbackCoverUrl=""
      ctaLabel="Voir tous les gins"
      ctaVariant="dark"
    />
  );
}
