import type { Metadata } from "next";
import { Suspense } from "react";
import { getPublishedProducts } from "@/lib/data/catalog";
import { getFavoriteProductIds } from "@/lib/data/favorites";
import { SpiritCatalog } from "@/components/catalog/spirit-catalog";
import { WineCardSkeleton } from "@/components/catalog/wine-card-skeleton";
import { CategoryCoverCta } from "@/components/catalog/category-cover-cta";
import { CategoryCover } from "@/components/catalog/category-cover";
import { getPublishedPageContent, buildPageMetadata } from "@/lib/data/page-contents";

export const revalidate = 60;

export async function generateMetadata(): Promise<Metadata> {
  return buildPageMetadata("spiritueux", {
    title: "Spiritueux, whiskies et arak à Jérusalem | Terminal 3",
    description:
      "Des classiques incontournables aux bouteilles de dégustation : whisky, arak, cognac, vodka, gin et spiritueux premium. Découvrez la sélection de Terminal 3 à Jérusalem.",
    canonical: "/spiritueux",
  });
}

const SPIRITS_CATEGORY_SLUG = "spiritueux";

export default async function SpiritsPage() {
  const [products, favoriteIds, pageContent] = await Promise.all([
    getPublishedProducts({ categorySlug: SPIRITS_CATEGORY_SLUG }),
    getFavoriteProductIds(),
    getPublishedPageContent("spiritueux"),
  ]);

  const coverUrl = "/images/terminal-3/couvertures/spiritueux.webp";

  return (
    <div className="min-h-screen bg-fond-papier">
      {/* Cover */}
      <CategoryCover
        contentSlug="spiritueux"
        imageUrl={pageContent?.og_image_url ?? coverUrl}
        pretitle="Whisky · Arak · Cognac · Sélection premium"
        title={pageContent?.title ?? "Nos spiritueux"}
        subtitle={
          pageContent?.subtitle ??
          "Des classiques incontournables aux bouteilles de dégustation, une sélection choisie pour chaque palais et chaque occasion."
        }
      >
        {products.length > 0 && (
          <p className="mt-6 text-xs uppercase tracking-widest text-texte-clair/50">
            {products.length} référence{products.length > 1 ? "s" : ""} disponible
            {products.length > 1 ? "s" : ""}
          </p>
        )}
        <CategoryCoverCta variant="dark" label="Voir tous les spiritueux" />
      </CategoryCover>

      <div id="catalogue">
        <Suspense fallback={<SpiritCatalogFallback />}>
          <SpiritCatalog products={products} favoriteIds={favoriteIds} />
        </Suspense>
      </div>
    </div>
  );
}

function SpiritCatalogFallback() {
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
