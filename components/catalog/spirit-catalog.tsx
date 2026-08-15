"use client";

import type { ProductWithMedia } from "@/lib/data/catalog";
import { ProductCatalog } from "@/components/catalog/product-catalog";
import { spiritCatalogConfig } from "@/components/catalog/spirit-catalog-config";

/**
 * Thin spirits-flavoured wrapper around the shared catalog engine — same
 * search/filter/sort/pagination behaviour as the wine catalog, only the
 * spirits-specific quick categories, advanced filter fields, and card
 * rendering differ (see `spirit-catalog-config.tsx`).
 */
export function SpiritCatalog({
  products,
  favoriteIds,
}: {
  products: ProductWithMedia[];
  favoriteIds: Set<string>;
}) {
  return <ProductCatalog products={products} favoriteIds={favoriteIds} config={spiritCatalogConfig} />;
}
