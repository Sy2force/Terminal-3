import type { Metadata } from "next";
import { Suspense } from "react";
import { getPublishedProducts } from "@/lib/data/catalog";
import { getFavoriteProductIds } from "@/lib/data/favorites";
import { WineCatalog } from "@/components/catalog/wine-catalog";
import { WineCardSkeleton } from "@/components/catalog/wine-card-skeleton";
import { CategoryCoverCta } from "@/components/catalog/category-cover-cta";
import { CategoryCover } from "@/components/catalog/category-cover";
import { getPublishedPageContent, buildPageMetadata } from "@/lib/data/page-contents";

export const revalidate = 60;

export async function generateMetadata(): Promise<Metadata> {
  return buildPageMetadata("vins", {
    title: "Vins casher à Jérusalem | Terminal 3",
    description:
      "Grands domaines israéliens, cuvées confidentielles et bouteilles à ouvrir sans attendre. Découvrez la sélection de vins casher de Terminal 3 à Jérusalem.",
    canonical: "/vins",
  });
}

// The real category slug in the database is "vin" (singular) — the public
// route is the plural "/vins" for readability, but the two must never be
// confused when querying the catalog.
const WINE_CATEGORY_SLUG = "vin";

export default async function WinesPage() {
  const [products, favoriteIds, pageContent] = await Promise.all([
    getPublishedProducts({ categorySlug: WINE_CATEGORY_SLUG }),
    getFavoriteProductIds(),
    getPublishedPageContent("vins"),
  ]);

  const coverUrl = "/images/terminal-3/couvertures/vins.webp";

  return (
    <div className="min-h-screen bg-fond-papier">
      {/* Cover */}
      <CategoryCover
        contentSlug="vins"
        imageUrl={pageContent?.og_image_url ?? coverUrl}
        pretitle="La cave Terminal 3"
        title={pageContent?.title ?? "Nos vins"}
        subtitle={
          pageContent?.subtitle ??
          "Grands domaines israéliens, cuvées confidentielles et bouteilles à ouvrir sans attendre."
        }
      >
        {products.length > 0 && (
          <p className="mt-6 text-xs uppercase tracking-widest text-texte-clair/50">
            Plus de {products.length} référence{products.length > 1 ? "s" : ""} sélectionnée
            {products.length > 1 ? "s" : ""}
          </p>
        )}
        <CategoryCoverCta variant="gold" label="Voir tous les vins" />
      </CategoryCover>

      <div id="catalogue">
        <Suspense fallback={<WineCatalogFallback />}>
          <WineCatalog products={products} favoriteIds={favoriteIds} />
        </Suspense>
      </div>
    </div>
  );
}

function WineCatalogFallback() {
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
