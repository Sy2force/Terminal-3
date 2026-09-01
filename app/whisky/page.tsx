import type { Metadata } from "next";
import { buildPageMetadata } from "@/lib/data/page-contents";
import { CategoryRoutePage } from "@/components/catalog/category-route-page";

export const revalidate = 60;

const PUBLIC_SLUG = "whisky";
const CATEGORY_SLUG = "whisky";

export async function generateMetadata(): Promise<Metadata> {
  return buildPageMetadata(PUBLIC_SLUG, {
    title: "Whisky à Jérusalem | Terminal 3",
    description:
      "Single malts, blends écossais, bourbons et whiskies du monde entier. Découvrez la sélection de whiskies de Terminal 3 à Jérusalem.",
    canonical: "/whisky",
  });
}

export default function WhiskyPage() {
  return (
    <CategoryRoutePage
      publicSlug={PUBLIC_SLUG}
      categorySlug={CATEGORY_SLUG}
      pretitle="Single malt · Blend · Bourbon"
      fallbackTitle="Nos whiskies"
      fallbackSubtitle="Des single malts aux blends les plus prisés, une sélection pour les amateurs de whisky."
      fallbackCoverUrl=""
      ctaLabel="Voir tous les whiskies"
      ctaVariant="dark"
    />
  );
}
