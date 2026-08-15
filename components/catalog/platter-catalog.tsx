"use client";

import type { ProductWithMedia } from "@/lib/data/catalog";
import { ProductCatalog } from "@/components/catalog/product-catalog";
import { platterCatalogConfig } from "@/components/catalog/platter-catalog-config";

export function PlatterCatalog({
  products,
  favoriteIds,
}: {
  products: ProductWithMedia[];
  favoriteIds: Set<string>;
}) {
  return <ProductCatalog products={products} favoriteIds={favoriteIds} config={platterCatalogConfig} />;
}
