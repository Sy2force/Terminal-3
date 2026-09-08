"use client";

import { memo, useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
import { AlertTriangle } from "lucide-react";
import { Badge } from "@/components/commerce/badge";
import { FavoriteButton } from "@/components/commerce/favorite-button";
import { WoltButton, WoltDisclaimer } from "@/components/commerce/wolt-button";
import { useWoltSettings } from "@/components/commerce/wolt-settings-provider";
import { formatAgorot, formatUnitPrice, savingPercent } from "@/lib/money";
import { getMediaFit } from "@/lib/catalog-visual-config";
import type { ProductWithMedia } from "@/lib/data/catalog";

function isNew(product: ProductWithMedia): boolean {
  if (!product.new_until) return Boolean(product.published_at);
  return new Date(product.new_until).getTime() > Date.now();
}

const availabilityLabels: Record<string, string> = {
  IN_STOCK: "En stock",
  LOW_STOCK: "Stock faible",
  OUT_OF_STOCK: "Rupture",
  PREORDER: "Précommande",
  ON_REQUEST: "Sur commande",
};

function ProductCardInner({
  product,
  isFavorited = false,
}: {
  product: ProductWithMedia;
  isFavorited?: boolean;
}) {
  const { enabled: woltEnabled, storeUrl } = useWoltSettings();

  const cover = useMemo(() => product.media?.[0], [product.media]);
  const defaultVariant = useMemo(
    () => product.variants?.find((v) => v.is_default) ?? product.variants?.[0],
    [product.variants],
  );
  const name = useMemo(
    () => product.name_fr || product.name_he || "Produit",
    [product.name_fr, product.name_he],
  );
  const imageFit = useMemo(
    () => getMediaFit(cover?.kind, product.category?.slug ?? null),
    [cover?.kind, product.category?.slug],
  );
  const hasCover = useMemo(() => Boolean(cover?.url), [cover?.url]);
  const isNewProduct = useMemo(() => isNew(product), [product]);

  const displayPrice =
    defaultVariant?.regular_price_agorot ?? product.base_price_agorot ?? null;
  const comparePrice = product.compare_at_price_agorot;
  const hasPromo = comparePrice != null && displayPrice != null && comparePrice > displayPrice;
  const discount = hasPromo ? savingPercent(comparePrice, displayPrice) : 0;
  const availability = defaultVariant?.availability_status ?? "IN_STOCK";

  return (
    <article className="group flex flex-col overflow-hidden rounded-sm border border-white/5 bg-graphite transition-colors hover:border-champagne/30">
      <Link
        href={`/products/${product.slug}`}
        data-analytics-event="view_product"
        className="relative aspect-[4/5] w-full overflow-hidden bg-warm-black"
      >
        {hasCover && cover ? (
          <Image
            src={cover.url}
            alt={cover.alt ?? name}
            fill
            sizes="(min-width: 1024px) 25vw, (min-width: 640px) 33vw, 50vw"
            loading="lazy"
            decoding="async"
            className={`${imageFit === "contain" ? "object-contain p-4" : "object-cover"} transition-transform duration-500 ease-out group-hover:scale-[1.025]`}
          />
        ) : (
          <div className="flex h-full w-full flex-col items-center justify-center text-xs text-muted-grey">
            <span className="text-[10px] uppercase tracking-widest">Photo manquante</span>
          </div>
        )}

        <div className="absolute left-3 top-3 flex flex-col gap-2">
          {isNewProduct && <Badge>Nouveau</Badge>}
          {hasPromo && (
            <Badge variant="ivory" className="border-amber-400/60 text-amber-300">
              -{discount}%
            </Badge>
          )}
          {product.age_restricted && (
            <Badge variant="amber">
              <AlertTriangle className="mr-1 h-3 w-3" aria-hidden />
              18+
            </Badge>
          )}
        </div>

        <FavoriteButton
          productId={product.id}
          initialFavorited={isFavorited}
          className="absolute right-3 top-3"
        />
      </Link>

      <div className="flex flex-1 flex-col gap-1 p-4">
        {product.brand && (
          <span className="text-[11px] uppercase tracking-widest text-muted-grey">
            {product.brand}
          </span>
        )}
        <h3 className="font-serif text-base leading-snug text-ivory">
          <Link
            href={`/products/${product.slug}`}
            className="hover:text-champagne focus:outline-none focus-visible:underline"
          >
            {name}
          </Link>
        </h3>

        <div className="mt-auto flex flex-wrap items-center justify-between gap-2 pt-3">
          <div className="flex flex-wrap items-baseline gap-2">
            <span className="text-sm font-medium text-champagne">
              {displayPrice != null
                ? formatUnitPrice(displayPrice, defaultVariant?.pricing_unit)
                : "Prix en magasin"}
            </span>
            {hasPromo && (
              <span className="text-xs text-muted-grey line-through">
                {formatAgorot(comparePrice)}
              </span>
            )}
          </div>
          {defaultVariant?.label && (
            <span className="text-xs text-muted-grey">{defaultVariant.label}</span>
          )}
        </div>

        {availability !== "IN_STOCK" && (
          <span
            className={`mt-2 w-fit rounded-full px-2 py-0.5 text-[10px] font-medium uppercase tracking-widest ${
              availability === "OUT_OF_STOCK"
                ? "border-red-400/60 text-red-300"
                : availability === "LOW_STOCK"
                  ? "border-amber-400/60 text-amber-300"
                  : "border-champagne/30 text-champagne/80"
            }`}
          >
            {availabilityLabels[availability] ?? availability}
          </span>
        )}

        {woltEnabled && (defaultVariant?.wolt_url || storeUrl) && (
          <div className="mt-3 space-y-1.5">
            <WoltButton url={defaultVariant?.wolt_url} storeUrl={storeUrl} />
            <WoltDisclaimer />
          </div>
        )}
      </div>
    </article>
  );
}

export const ProductCard = memo(ProductCardInner);
