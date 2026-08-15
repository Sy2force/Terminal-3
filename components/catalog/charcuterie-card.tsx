"use client";

import { ProductCard, type ProductCardConfig } from "@/components/catalog/product-card";
import type { ProductWithMedia } from "@/lib/data/catalog";
import { CHARCUTERIE_SUBCATEGORY_LABELS } from "@/lib/charcuterie";

const charcuterieCardConfig: ProductCardConfig = {
  basePath: "/charcuterie",
  showHebrewName: true,
  getSubtitleLine: (product) =>
    [
      product.subcategory ? CHARCUTERIE_SUBCATEGORY_LABELS[product.subcategory] ?? product.subcategory : product.category?.name_fr,
      product.meat_type,
    ]
      .filter(Boolean)
      .join(" · "),
  getSecondaryLine: (product) => {
    const defaultVariant = product.variants?.find((v) => v.is_default) ?? product.variants?.[0];
    return defaultVariant?.label ?? null;
  },
};

export function CharcuterieCard({
  product,
  initialFavorited,
}: {
  product: ProductWithMedia;
  initialFavorited: boolean;
}) {
  return <ProductCard product={product} initialFavorited={initialFavorited} config={charcuterieCardConfig} />;
}
