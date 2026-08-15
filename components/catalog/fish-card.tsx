"use client";

import { ProductCard, type ProductCardConfig } from "@/components/catalog/product-card";
import type { ProductWithMedia } from "@/lib/data/catalog";
import { FISH_SUBCATEGORY_LABELS } from "@/lib/fish";

const fishCardConfig: ProductCardConfig = {
  basePath: "/poissons",
  showHebrewName: true,
  getSubtitleLine: (product) =>
    [
      product.subcategory ? FISH_SUBCATEGORY_LABELS[product.subcategory] ?? product.subcategory : product.category?.name_fr,
      product.fish_type,
    ]
      .filter(Boolean)
      .join(" · "),
  getSecondaryLine: (product) => {
    const defaultVariant = product.variants?.find((v) => v.is_default) ?? product.variants?.[0];
    return defaultVariant?.label ?? null;
  },
};

export function FishCard({
  product,
  initialFavorited,
}: {
  product: ProductWithMedia;
  initialFavorited: boolean;
}) {
  return <ProductCard product={product} initialFavorited={initialFavorited} config={fishCardConfig} />;
}
