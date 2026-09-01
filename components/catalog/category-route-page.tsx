import { Suspense } from "react";
import { notFound } from "next/navigation";
import { getCategoryBySlug } from "@/lib/data/categories";
import { getPublishedProducts } from "@/lib/data/catalog";
import { getFavoriteProductIds } from "@/lib/data/favorites";
import { getPublishedPageContent } from "@/lib/data/page-contents";
import { CategoryCover } from "@/components/catalog/category-cover";
import { CategoryCoverCta } from "@/components/catalog/category-cover-cta";
import { CategoryFilters } from "@/components/commerce/category-filters";
import { isSalmonCategory } from "@/lib/catalog-visual-config";
import { WineCardSkeleton } from "@/components/catalog/wine-card-skeleton";

export interface CategoryRoutePageProps {
  publicSlug: string;
  categorySlug: string;
  pretitle: string;
  fallbackTitle: string;
  fallbackSubtitle: string;
  fallbackCoverUrl: string;
  ctaLabel: string;
  ctaVariant?: "dark" | "sarfati" | "gold";
}

export async function CategoryRoutePage({
  publicSlug,
  categorySlug,
  pretitle,
  fallbackTitle,
  fallbackSubtitle,
  fallbackCoverUrl,
  ctaLabel,
  ctaVariant = "dark",
}: CategoryRoutePageProps) {
  const [category, products, favoriteIds, pageContent] = await Promise.all([
    getCategoryBySlug(categorySlug),
    getPublishedProducts({ categorySlug }),
    getFavoriteProductIds(),
    getPublishedPageContent(publicSlug),
  ]);

  if (!category) notFound();

  const title = pageContent?.title ?? fallbackTitle;
  const subtitle = pageContent?.subtitle ?? fallbackSubtitle;
  const coverUrl = pageContent?.og_image_url ?? fallbackCoverUrl;

  return (
    <div className="min-h-screen bg-fond-papier">
      <CategoryCover
        contentSlug={publicSlug}
        imageUrl={coverUrl}
        pretitle={pretitle}
        title={title}
        subtitle={subtitle}
      >
        {products.length > 0 && (
          <p className="mt-6 text-xs uppercase tracking-widest text-texte-clair/50">
            {products.length} référence{products.length > 1 ? "s" : ""} disponible
            {products.length > 1 ? "s" : ""}
          </p>
        )}
        <CategoryCoverCta variant={ctaVariant} label={ctaLabel} />
      </CategoryCover>

      <div id="catalogue" className="mx-auto max-w-[1440px] px-4 py-16 sm:px-6 lg:px-8">
        <Suspense fallback={<CategoryCatalogFallback />}>
          <CategoryFilters
            products={products}
            favoriteIds={favoriteIds}
            useSalmonCard={isSalmonCategory(categorySlug)}
          />
        </Suspense>
      </div>
    </div>
  );
}

function CategoryCatalogFallback() {
  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {Array.from({ length: 8 }).map((_, i) => (
        <WineCardSkeleton key={i} />
      ))}
    </div>
  );
}
