import type { Metadata } from "next";
import { Suspense } from "react";
import Link from "next/link";
import { getPlatterProducts } from "@/lib/data/catalog";
import { getFavoriteProductIds } from "@/lib/data/favorites";
import { PlatterCatalog } from "@/components/catalog/platter-catalog";
import { WineCardSkeleton } from "@/components/catalog/wine-card-skeleton";
import { CategoryCoverCta } from "@/components/catalog/category-cover-cta";
import { CategoryCover } from "@/components/catalog/category-cover";
import { getPublishedPageContent, buildPageMetadata } from "@/lib/data/page-contents";

export const revalidate = 60;

export async function generateMetadata(): Promise<Metadata> {
  return buildPageMetadata("plateaux", {
    title: "Plateaux pour vos réceptions à Jérusalem | Terminal 3",
    description:
      "Plateaux de saumon fumé, charcuterie et apéritif, composés pour vos réceptions et votre table de Shabbat. Découvrez la sélection de Terminal 3 à Jérusalem.",
    canonical: "/plateaux",
  });
}

export default async function PlatterPage() {
  const [products, favoriteIds, pageContent] = await Promise.all([
    getPlatterProducts(),
    getFavoriteProductIds(),
    getPublishedPageContent("plateaux"),
  ]);

  const coverUrl = "/images/terminal-3/couvertures/plateaux.webp";

  return (
    <div className="min-h-screen bg-fond-papier">
      <CategoryCover
        contentSlug="plateaux"
        imageUrl={pageContent?.og_image_url ?? coverUrl}
        pretitle="Réceptions · Apéritifs · Shabbat"
        title={pageContent?.title ?? "Nos plateaux"}
        subtitle={
          pageContent?.subtitle ??
          "Saumon fumé, charcuterie et apéritif, composés pour vos réceptions et votre table de Shabbat."
        }
      >
        <div className="mt-6 flex flex-wrap items-center gap-4">
          {products.length > 0 && (
            <p className="text-xs uppercase tracking-widest text-texte-clair/50">
              {products.length} plateau{products.length > 1 ? "x" : ""} disponible
              {products.length > 1 ? "s" : ""}
            </p>
          )}
          <Link
            href="/plateaux/composer"
            className="rounded-sm border border-or-principal/50 px-5 py-2.5 text-xs uppercase tracking-widest text-or-principal transition-colors hover:bg-or-principal hover:text-noir-profond"
          >
            Composer mon plateau
          </Link>
        </div>
        <CategoryCoverCta variant="gold" label="Voir tous les plateaux" />
      </CategoryCover>

      <div id="catalogue">
        <Suspense fallback={<PlatterCatalogFallback />}>
          <PlatterCatalog products={products} favoriteIds={favoriteIds} />
        </Suspense>
      </div>
    </div>
  );
}

function PlatterCatalogFallback() {
  return (
    <div className="mx-auto max-w-[1440px] px-4 py-16 sm:px-6 lg:px-8">
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <WineCardSkeleton key={i} />
        ))}
      </div>
    </div>
  );
}
