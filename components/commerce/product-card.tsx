"use client";

import Image from "next/image";
import Link from "next/link";
import { AlertTriangle } from "lucide-react";
import { Badge } from "@/components/commerce/badge";
import { FavoriteButton } from "@/components/commerce/favorite-button";
import { WoltButton, WoltDisclaimer } from "@/components/commerce/wolt-button";
import { useWoltSettings } from "@/components/commerce/wolt-settings-provider";
import { formatAgorot } from "@/lib/money";
import { getMediaFit } from "@/lib/catalog-visual-config";
import type { ProductWithMedia } from "@/lib/data/catalog";

function isNew(product: ProductWithMedia): boolean {
  if (!product.new_until) return Boolean(product.published_at);
  return new Date(product.new_until).getTime() > Date.now();
}

export function ProductCard({
  product,
  isFavorited = false,
}: {
  product: ProductWithMedia;
  isFavorited?: boolean;
}) {
  const { enabled: woltEnabled, storeUrl } = useWoltSettings();
  const cover = product.media?.[0];
  const defaultVariant =
    product.variants?.find((v) => v.is_default) ?? product.variants?.[0];
  const name = product.name_fr || product.name_he;
  const imageFit = getMediaFit(cover?.kind, product.category?.slug ?? null);
  const hasCover = Boolean(cover?.url);

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
            className={`${imageFit === "contain" ? "object-contain p-4" : "object-cover"} transition-transform duration-500 ease-out group-hover:scale-[1.025]`}
          />
        ) : (
          <div className="flex h-full w-full flex-col items-center justify-center text-xs text-muted-grey">
            <span className="text-[10px] uppercase tracking-widest">Photo manquante</span>
          </div>
        )}

        <div className="absolute left-3 top-3 flex flex-col gap-2">
          {isNew(product) && <Badge>Nouveau</Badge>}
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
        <div className="mt-auto flex items-center justify-between pt-3">
          <span className="text-sm font-medium text-champagne">
            {defaultVariant?.regular_price_agorot != null
              ? formatAgorot(defaultVariant.regular_price_agorot)
              : "Prix en magasin"}
          </span>
          {defaultVariant?.label && (
            <span className="text-xs text-muted-grey">
              {defaultVariant.label}
            </span>
          )}
        </div>

        {woltEnabled && (defaultVariant?.wolt_url || storeUrl) && (
          <div className="mt-3 space-y-1.5">
            <WoltButton
              url={defaultVariant.wolt_url}
              storeUrl={storeUrl}
            />
            <WoltDisclaimer />
          </div>
        )}
      </div>
    </article>
  );
}
