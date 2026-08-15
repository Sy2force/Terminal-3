"use client";

import { ProductCard, type ProductCardConfig } from "@/components/catalog/product-card";
import type { ProductWithMedia } from "@/lib/data/catalog";
import { SUBCATEGORY_LABELS } from "@/lib/spirits";

const spiritCardConfig: ProductCardConfig = {
  basePath: "/spiritueux",
  getSubtitleLine: (product) =>
    [
      product.subcategory ? SUBCATEGORY_LABELS[product.subcategory] ?? product.subcategory : product.category?.name_fr,
      product.country,
    ]
      .filter(Boolean)
      .join(" · "),
  getSecondaryLine: (product) => (product.age_years ? `${product.age_years} ans` : null),
};

export function SpiritCard({
  product,
  initialFavorited,
}: {
  product: ProductWithMedia;
  initialFavorited: boolean;
}) {
  return <ProductCard product={product} initialFavorited={initialFavorited} config={spiritCardConfig} />;
}
