"use client";

import type { ProductWithMedia } from "@/lib/data/catalog";
import { ProductCatalog } from "@/components/catalog/product-catalog";
import { fishCatalogConfig } from "@/components/catalog/fish-catalog-config";

/**
 * Thin fish-flavoured wrapper around the shared catalog engine — same
 * search/filter/sort/pagination behaviour as the wine, spirits and
 * charcuterie catalogs, only the fish-specific quick categories,
 * advanced filter fields, and card rendering differ (see
 * `fish-catalog-config.tsx`).
 */
export function FishCatalog({
  products,
  favoriteIds,
}: {
  products: ProductWithMedia[];
  favoriteIds: Set<string>;
}) {
  return <ProductCatalog products={products} favoriteIds={favoriteIds} config={fishCatalogConfig} />;
}
