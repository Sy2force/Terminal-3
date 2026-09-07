"use client";

import { memo, useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Badge } from "@/components/commerce/badge";
import { FavoriteButton } from "@/components/commerce/favorite-button";
import { formatAgorot } from "@/lib/money";
import { getMediaFit } from "@/lib/catalog-visual-config";
import type { ProductWithMedia } from "@/lib/data/catalog";

function isNew(product: ProductWithMedia): boolean {
  if (!product.new_until) return false;
  return new Date(product.new_until).getTime() > Date.now();
}

function SalmonProductCardInner({
  product,
  isFavorited = false,
}: {
  product: ProductWithMedia;
  isFavorited?: boolean;
}) {
  const cover = useMemo(() => product.media?.[0], [product.media]);
  const defaultVariant = useMemo(
    () => product.variants?.find((v) => v.is_default) ?? product.variants?.[0],
    [product.variants],
  );
  const name = useMemo(
    () => product.name_fr || product.name_he || "Produit",
    [product.name_fr, product.name_he],
  );
  const newProduct = useMemo(() => isNew(product), [product]);
  const hasPromo = useMemo(
    () =>
      product.compare_at_price_agorot != null &&
      product.base_price_agorot != null &&
      product.compare_at_price_agorot > product.base_price_agorot,
    [product.compare_at_price_agorot, product.base_price_agorot],
  );
  const imageFit = useMemo(
    () => getMediaFit(cover?.kind, product.category?.slug ?? null),
    [cover?.kind, product.category?.slug],
  );
  const hasCover = useMemo(() => Boolean(cover?.url), [cover?.url]);

  return (
    <Link
      href={`/products/${product.slug}`}
      data-analytics-event="view_product"
      className="group flex flex-col"
    >
      <div className="relative aspect-[4/5] w-full overflow-hidden rounded-sm bg-warm-black">
        {hasCover && cover ? (
          <Image
            src={cover.url}
            alt={cover.alt ?? name}
            fill
            sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
            loading="lazy"
            decoding="async"
            className={`${imageFit === "contain" ? "object-contain p-6" : "object-cover"} transition-transform duration-500 ease-out group-hover:scale-[1.025]`}
            priority={false}
          />
        ) : (
          <div className="flex h-full w-full flex-col items-center justify-center gap-2 text-xs text-muted-grey">
            <span className="text-[10px] uppercase tracking-widest">Photo manquante</span>
          </div>
        )}

        <div className="absolute left-3 top-3 flex flex-col gap-2">
          {newProduct && <Badge>Nouveau</Badge>}
          {hasPromo && <Badge variant="gold">Promo</Badge>}
        </div>

        <FavoriteButton
          productId={product.id}
          initialFavorited={isFavorited}
          className="absolute right-3 top-3"
        />
      </div>

      <div className="mt-4 flex flex-col gap-2">
        {product.brand && (
          <span className="text-[11px] uppercase tracking-widest text-muted-grey">
            {product.brand}
          </span>
        )}
        <h3 className="font-serif text-lg leading-snug text-ivory transition-colors group-hover:text-champagne">
          {name}
        </h3>
        {(product.description_fr || product.description_he) && (
          <p className="line-clamp-2 text-sm leading-relaxed text-ivory/60">
            {product.description_fr || product.description_he}
          </p>
        )}
        <div className="mt-auto flex items-center justify-between pt-3">
          <span className="text-base font-medium text-ivory">
            {defaultVariant?.regular_price_agorot != null
              ? formatAgorot(defaultVariant.regular_price_agorot)
              : "Prix en magasin"}
          </span>
          {defaultVariant?.label && (
            <span className="text-xs text-muted-grey">{defaultVariant.label}</span>
          )}
        </div>
        <span className="mt-2 inline-flex items-center gap-1 text-sm font-medium text-champagne transition-transform duration-300 group-hover:translate-x-1">
          Découvrir <ArrowRight className="h-4 w-4" />
        </span>
      </div>
    </Link>
  );
}

export const SalmonProductCard = memo(SalmonProductCardInner);
