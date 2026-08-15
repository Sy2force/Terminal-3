"use client";

import { ProductCard, type ProductCardConfig } from "@/components/catalog/product-card";
import type { ProductWithMedia } from "@/lib/data/catalog";

const platterCardConfig: ProductCardConfig = {
  basePath: "/plateaux",
  getSubtitleLine: (product) => product.category?.name_fr ?? "Plateau",
  getSecondaryLine: (product) => {
    if (product.serves_min && product.serves_max) {
      return `${product.serves_min} à ${product.serves_max} personnes`;
    }
    return null;
  },
};

export function PlatterCard({
  product,
  initialFavorited,
}: {
  product: ProductWithMedia;
  initialFavorited: boolean;
}) {
  return <ProductCard product={product} initialFavorited={initialFavorited} config={platterCardConfig} />;
}
