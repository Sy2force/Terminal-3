import type { Metadata } from "next";
import { Suspense } from "react";
import { getPublishedProducts } from "@/lib/data/catalog";
import { getFavoriteProductIds } from "@/lib/data/favorites";
import { FishCatalog } from "@/components/catalog/fish-catalog";
import { WineCardSkeleton } from "@/components/catalog/wine-card-skeleton";
import { CategoryCoverCta } from "@/components/catalog/category-cover-cta";
import { CategoryCover } from "@/components/catalog/category-cover";
import { getPublishedPageContent, buildPageMetadata } from "@/lib/data/page-contents";

export const revalidate = 60;

export async function generateMetadata(): Promise<Metadata> {
  return buildPageMetadata("poissons", {
    title: "Saumon fumé et poissons fins à Jérusalem | Terminal 3",
    description:
      "Saumons fumés, ventrèche de thon et anchois fins, sélectionnés pour vos apéritifs, vos plateaux et votre table de Shabbat. Découvrez la sélection de Terminal 3 à Jérusalem.",
    canonical: "/poissons",
  });
}

// The public route is /poissons (plural, general) but the real category
// slug in the database is the more specific "saumon-fume" — the two
// must never be confused when querying the catalog.
const FISH_CATEGORY_SLUG = "saumon-fume";

export default async function FishPage() {
  const [products, favoriteIds, pageContent] = await Promise.all([
    getPublishedProducts({ categorySlug: FISH_CATEGORY_SLUG }),
    getFavoriteProductIds(),
    getPublishedPageContent("poissons"),
  ]);

  const coverUrl = "/images/terminal-3/couvertures/poissons.webp";

  return (
    <div className="min-h-screen bg-fond-papier">
      {/* Cover */}
      <CategoryCover
        imageUrl={coverUrl}
        pretitle="Saumon fumé · Thon · Anchois · Sélection fine"
        title={pageContent?.title ?? "Nos poissons"}
        subtitle={
          pageContent?.subtitle ??
          "Saumons fumés, ventrèche de thon et anchois fins, sélectionnés pour vos apéritifs, vos plateaux et votre table de Shabbat."
        }
      >
        {products.length > 0 && (
          <p className="mt-6 text-xs uppercase tracking-widest text-texte-clair/50">
            {products.length} référence{products.length > 1 ? "s" : ""} disponible
            {products.length > 1 ? "s" : ""}
          </p>
        )}
        <CategoryCoverCta variant="sarfati" label="Voir tous les poissons" />
      </CategoryCover>

      <div id="catalogue">
        <Suspense fallback={<FishCatalogFallback />}>
          <FishCatalog products={products} favoriteIds={favoriteIds} />
        </Suspense>
      </div>
    </div>
  );
}

function FishCatalogFallback() {
  return (
    <div className="mx-auto max-w-[1440px] px-4 py-16 sm:px-6 lg:px-8">
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <WineCardSkeleton key={i} />
        ))}
      </div>
    </div>
  );
}
