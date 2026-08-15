"use client";

import { ProductCard, type ProductCardConfig } from "@/components/catalog/product-card";
import type { ProductWithMedia } from "@/lib/data/catalog";

const WINE_TYPE_LABELS: Record<string, string> = {
  ROUGE: "Rouge",
  BLANC: "Blanc",
  ROSE: "Rosé",
  EFFERVESCENT: "Effervescent",
  DOUX: "Doux",
};

const wineCardConfig: ProductCardConfig = {
  basePath: "/vins",
  getSubtitleLine: (product) =>
    [product.wine_type ? WINE_TYPE_LABELS[product.wine_type] : product.category?.name_fr, product.region]
      .filter(Boolean)
      .join(" · "),
  getSecondaryLine: (product) => {
    const vintage = (product.variants?.find((v) => v.is_default) ?? product.variants?.[0])?.vintage;
    return vintage ? String(vintage) : null;
  },
};

export function WineCard({
  product,
  initialFavorited,
}: {
  product: ProductWithMedia;
  initialFavorited: boolean;
}) {
  return <ProductCard product={product} initialFavorited={initialFavorited} config={wineCardConfig} />;
}
