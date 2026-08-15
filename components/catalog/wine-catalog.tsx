"use client";

import type { ProductWithMedia } from "@/lib/data/catalog";
import { ProductCatalog } from "@/components/catalog/product-catalog";
import { wineCatalogConfig } from "@/components/catalog/wine-catalog-config";
import { WineCardSkeleton } from "@/components/catalog/wine-card-skeleton";

/**
 * Thin wine-flavoured wrapper around the shared catalog engine — all the
 * search/filter/sort/pagination behaviour lives in `ProductCatalog`, only
 * the wine-specific quick filters, advanced filter fields, and card
 * rendering are supplied here (see `wine-catalog-config.tsx`).
 */
export function WineCatalog({
  products,
  favoriteIds,
}: {
  products: ProductWithMedia[];
  favoriteIds: Set<string>;
}) {
  return <ProductCatalog products={products} favoriteIds={favoriteIds} config={wineCatalogConfig} />;
}

export { WineCardSkeleton };
