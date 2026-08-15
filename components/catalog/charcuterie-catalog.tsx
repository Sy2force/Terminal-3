"use client";

import type { ProductWithMedia } from "@/lib/data/catalog";
import { ProductCatalog } from "@/components/catalog/product-catalog";
import { charcuterieCatalogConfig } from "@/components/catalog/charcuterie-catalog-config";

/**
 * Thin charcuterie-flavoured wrapper around the shared catalog engine —
 * same search/filter/sort/pagination behaviour as the wine and spirits
 * catalogs, only the charcuterie-specific quick categories, advanced
 * filter fields, and card rendering differ (see
 * `charcuterie-catalog-config.tsx`).
 */
export function CharcuterieCatalog({
  products,
  favoriteIds,
}: {
  products: ProductWithMedia[];
  favoriteIds: Set<string>;
}) {
  return <ProductCatalog products={products} favoriteIds={favoriteIds} config={charcuterieCatalogConfig} />;
}
