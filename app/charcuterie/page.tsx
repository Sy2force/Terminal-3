import type { Metadata } from "next";
import { Suspense } from "react";
import { getPublishedProducts } from "@/lib/data/catalog";
import { getFavoriteProductIds } from "@/lib/data/favorites";
import { CharcuterieCatalog } from "@/components/catalog/charcuterie-catalog";
import { WineCardSkeleton } from "@/components/catalog/wine-card-skeleton";
import { CategoryCoverCta } from "@/components/catalog/category-cover-cta";
import { CategoryCover } from "@/components/catalog/category-cover";
import { getPublishedPageContent, buildPageMetadata } from "@/lib/data/page-contents";

export const revalidate = 60;

export async function generateMetadata(): Promise<Metadata> {
  return buildPageMetadata("charcuterie", {
    title: "Charcuterie casher à Jérusalem | Terminal 3",
    description:
      "Rosette, pastrami, spécialités fumées et pâtés fins, sélectionnés avec soin pour vos apéritifs et vos plateaux. Découvrez la charcuterie de Terminal 3 à Jérusalem.",
    canonical: "/charcuterie",
  });
}

const CHARCUTERIE_CATEGORY_SLUG = "charcuterie";

export default async function CharcuteriePage() {
  const [products, favoriteIds, pageContent] = await Promise.all([
    getPublishedProducts({ categorySlug: CHARCUTERIE_CATEGORY_SLUG }),
    getFavoriteProductIds(),
    getPublishedPageContent("charcuterie"),
  ]);

  const coverUrl = "/images/terminal-3/couvertures/charcuterie.webp";

  return (
    <div className="min-h-screen bg-fond-papier">
      {/* Cover */}
      <CategoryCover
        imageUrl={coverUrl}
        pretitle="Découpée à la demande · Sélection artisanale"
        title={pageContent?.title ?? "Nos charcuteries"}
        subtitle={
          pageContent?.subtitle ??
          "Rosette, pastrami, spécialités fumées et pâtés fins, sélectionnés avec soin pour vos apéritifs et vos plateaux."
        }
      >
        {products.length > 0 && (
          <p className="mt-6 text-xs uppercase tracking-widest text-texte-clair/50">
            {products.length} référence{products.length > 1 ? "s" : ""} disponible
            {products.length > 1 ? "s" : ""}
          </p>
        )}
        <CategoryCoverCta variant="delicatess" label="Voir toutes les charcuteries" />
      </CategoryCover>

      <div id="catalogue">
        <Suspense fallback={<CharcuterieCatalogFallback />}>
          <CharcuterieCatalog products={products} favoriteIds={favoriteIds} />
        </Suspense>
      </div>
    </div>
  );
}

function CharcuterieCatalogFallback() {
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
