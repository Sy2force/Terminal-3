"use client";

import { memo, useCallback, useMemo, useState, useTransition } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Heart, Star, ShoppingBag, Check } from "lucide-react";
import { useCart } from "@/lib/cart/cart-context";
import { toggleFavorite } from "@/app/favorites/actions";
import { formatAgorot, formatUnitPrice, savingPercent } from "@/lib/money";
import { WoltButton, WoltDisclaimer } from "@/components/commerce/wolt-button";
import { useWoltSettings } from "@/components/commerce/wolt-settings-provider";
import { getMediaFit } from "@/lib/catalog-visual-config";
import type { ProductWithMedia } from "@/lib/data/catalog";

function isNew(product: ProductWithMedia): boolean {
  if (!product.new_until) return false;
  return new Date(product.new_until).getTime() > Date.now();
}

function resolveBadge(product: ProductWithMedia): string | null {
  if (product.badge) return product.badge;
  if (product.availability_status === "OUT_OF_STOCK") return null;
  if (product.compare_at_price_agorot) return "Promotion";
  if (isNew(product)) return "Nouveau";
  if (product.is_best_seller) return "Best-seller";
  if (product.is_featured) return "Coup de cœur";
  return null;
}

export interface ProductCardConfig {
  /** e.g. "/vins" or "/spiritueux" */
  basePath: string;
  /** e.g. "Rouge · Judean Hills" or "Whisky · Écosse" */
  getSubtitleLine: (product: ProductWithMedia) => string;
  /** e.g. "2020" (vintage), "12 ans" (age), or "Tranché · 200 g" (charcuterie) — shown next to the review count */
  getSecondaryLine: (product: ProductWithMedia) => string | null;
  /** When true, shows the Hebrew name as a muted secondary line under the French title (charcuterie). */
  showHebrewName?: boolean;
}

function ProductCardInner({
  product,
  initialFavorited,
  config,
}: {
  product: ProductWithMedia;
  initialFavorited: boolean;
  config: ProductCardConfig;
}) {
  const router = useRouter();
  const { addItem, lines } = useCart();
  const { enabled: woltEnabled, storeUrl } = useWoltSettings();
  const [favorited, setFavorited] = useState(initialFavorited);
  const [isFavPending, startFavTransition] = useTransition();
  const [added, setAdded] = useState(false);

  const name = useMemo(
    () => product.name_fr || product.name_he || "Produit",
    [product.name_fr, product.name_he],
  );

  const cover = useMemo(() => product.media?.[0], [product.media]);

  const defaultVariant = useMemo(
    () => product.variants?.find((v) => v.is_default) ?? product.variants?.[0],
    [product.variants],
  );

  const priceAgorot = useMemo(
    () => defaultVariant?.regular_price_agorot ?? product.base_price_agorot ?? null,
    [defaultVariant?.regular_price_agorot, product.base_price_agorot],
  );

  const compareAgorot = product.compare_at_price_agorot;
  const discount = useMemo(
    () => (compareAgorot && priceAgorot ? savingPercent(compareAgorot, priceAgorot) : 0),
    [compareAgorot, priceAgorot],
  );

  const outOfStock = useMemo(
    () =>
      product.availability_status === "OUT_OF_STOCK" ||
      defaultVariant?.availability_status === "OUT_OF_STOCK",
    [product.availability_status, defaultVariant?.availability_status],
  );

  const lowStock = useMemo(
    () =>
      product.availability_status === "LOW_STOCK" ||
      defaultVariant?.availability_status === "LOW_STOCK",
    [product.availability_status, defaultVariant?.availability_status],
  );

  const badge = useMemo(() => resolveBadge(product), [product]);

  const alreadyInCart = useMemo(
    () => (defaultVariant ? lines.some((l) => l.variantId === defaultVariant.id) : false),
    [defaultVariant, lines],
  );

  const detailHref = useMemo(
    () => `${config.basePath}/${product.slug}`,
    [config.basePath, product.slug],
  );

  const imageFit = useMemo(
    () => getMediaFit(cover?.kind, product.category?.slug ?? null),
    [cover?.kind, product.category?.slug],
  );

  const handleFavoriteClick = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
      const next = !favorited;
      setFavorited(next);
      startFavTransition(async () => {
        try {
          const result = await toggleFavorite(product.id);
          if (!result.success) {
            setFavorited(!next);
            if (result.error?.includes("connecté")) {
              router.push(`/login?redirect=${config.basePath}`);
            }
            return;
          }
          setFavorited(result.favorited);
        } catch {
          setFavorited(!next);
        }
      });
    },
    [favorited, product.id, router, config.basePath],
  );

  const handleAddToCart = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
      if (!defaultVariant || outOfStock) return;
      addItem({
        variantId: defaultVariant.id,
        productId: product.id,
        productSlug: product.slug,
        productName: name,
        variantLabel: defaultVariant.label,
        displayPriceAgorot: priceAgorot,
        imageUrl: cover?.url ?? null,
        ageRestricted: product.age_restricted,
      });
      setAdded(true);
      setTimeout(() => setAdded(false), 1800);
    },
    [defaultVariant, outOfStock, addItem, product, name, priceAgorot, cover?.url],
  );

  return (
    <div className="group relative flex flex-col overflow-hidden rounded-sm border border-brun-cave/40 bg-[#FAF7F0] transition-all duration-300 ease-out hover:-translate-y-1.5 hover:border-or-principal/40 hover:shadow-xl hover:shadow-noir-profond/10">
      <Link
        href={detailHref}
        aria-label={name}
        className="relative aspect-[3/4] w-full overflow-hidden bg-[#FAF7F0]"
      >
        {cover?.url ? (
          <Image
            src={cover.url}
            alt={cover.alt ?? name}
            fill
            sizes="(min-width: 1280px) 23vw, (min-width: 1024px) 30vw, (min-width: 640px) 46vw, 90vw"
            loading="lazy"
            decoding="async"
            className={`${imageFit === "contain" ? "object-contain p-6" : "object-cover"} transition-transform duration-300 ease-out group-hover:scale-[1.04]`}
          />
        ) : (
          <div className="flex h-full items-center justify-center px-4">
            <span className="text-center text-xs uppercase tracking-widest text-brun-cave/50">
              Photo à venir
            </span>
          </div>
        )}

        {/* Badge */}
        {badge && (
          <span className="absolute left-3 top-3 rounded-sm bg-bordeaux-principal px-2.5 py-1 text-[10px] font-medium uppercase tracking-widest text-texte-clair">
            {badge}
          </span>
        )}
        {!badge && discount > 0 && (
          <span className="absolute left-3 top-3 rounded-sm bg-or-principal px-2.5 py-1 text-[10px] font-bold uppercase tracking-widest text-noir-profond">
            -{discount}%
          </span>
        )}
      </Link>

      {/* Favorite button */}
      <button
        type="button"
        onClick={handleFavoriteClick}
        disabled={isFavPending}
        aria-pressed={favorited}
        aria-label={favorited ? "Retirer des favoris" : "Ajouter aux favoris"}
        className={`absolute right-3 top-3 rounded-full bg-fond-papier/90 p-2 shadow-sm backdrop-blur-sm transition-colors hover:text-bordeaux-principal ${
          favorited ? "text-bordeaux-principal" : "text-brun-cave/60"
        }`}
      >
        <Heart className="h-4 w-4" fill={favorited ? "currentColor" : "none"} aria-hidden />
      </button>

      {/* Info */}
      <div className="flex flex-1 flex-col gap-2 p-5">
        <div className="flex items-center justify-between gap-2">
          <span className="text-[11px] uppercase tracking-widest text-gris-chaud">
            {config.getSubtitleLine(product)}
          </span>
          {product.rating != null && (
            <span className="flex shrink-0 items-center gap-1 text-or-principal">
              <Star className="h-3 w-3 fill-current" aria-hidden />
              <span className="text-xs font-medium">{product.rating.toFixed(1)}</span>
            </span>
          )}
        </div>

        <Link href={detailHref}>
          <h3 className="font-serif text-lg leading-snug text-noir-profond transition-colors group-hover:text-bordeaux-principal">
            {name}
          </h3>
        </Link>

        {config.showHebrewName && product.name_fr && product.name_he && (
          <p dir="rtl" className="text-xs text-gris-chaud/70">
            {product.name_he}
          </p>
        )}

        {product.brand && <p className="text-sm text-gris-chaud">{product.brand}</p>}

        <div className="flex items-center justify-between text-xs text-gris-chaud/80">
          <span>{config.getSecondaryLine(product) ?? ""}</span>
          {product.review_count > 0 && <span>{product.review_count} avis</span>}
        </div>

        {(product.tasting_notes || product.nose_notes || product.composition_text) && (
          <p className="line-clamp-2 text-xs text-gris-chaud/70">
            {product.tasting_notes || product.nose_notes || product.composition_text}
          </p>
        )}

        {outOfStock ? (
          <p className="mt-1 text-xs font-medium uppercase tracking-wider text-bordeaux-principal">
            Rupture de stock
          </p>
        ) : lowStock ? (
          <p className="mt-1 text-xs font-medium uppercase tracking-wider text-or-principal">
            Stock faible
          </p>
        ) : null}

        {/* Price + actions */}
        <div className="mt-auto flex flex-col gap-3 pt-3 border-t border-brun-cave/15">
          <div className="flex items-baseline gap-2">
            {compareAgorot && (
              <span className="text-sm text-gris-chaud/50 line-through">
                {formatAgorot(compareAgorot)}
              </span>
            )}
            <span className="font-serif text-xl text-bordeaux-principal">
              {priceAgorot != null
                ? formatUnitPrice(priceAgorot, defaultVariant?.pricing_unit)
                : "Prix en magasin"}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <Link
              href={detailHref}
              className="flex-1 rounded-sm border border-brun-cave/30 px-3 py-2.5 text-center text-xs font-medium uppercase tracking-widest text-noir-profond transition-colors hover:border-bordeaux-principal hover:text-bordeaux-principal"
            >
              Découvrir
            </Link>
            <button
              type="button"
              onClick={handleAddToCart}
              disabled={outOfStock || !defaultVariant}
              aria-label="Ajouter au panier"
              className="flex flex-1 items-center justify-center gap-1.5 rounded-sm bg-bordeaux-principal px-3 py-2.5 text-xs font-medium uppercase tracking-widest text-texte-clair transition-colors hover:bg-bordeaux-fonce disabled:cursor-not-allowed disabled:opacity-40"
            >
              {added ? (
                <>
                  <Check className="h-3.5 w-3.5" aria-hidden />
                  Ajouté
                </>
              ) : (
                <>
                  <ShoppingBag className="h-3.5 w-3.5" aria-hidden />
                  {alreadyInCart ? "Ajouter encore" : "Ajouter"}
                </>
              )}
            </button>
          </div>

          {woltEnabled && (defaultVariant?.wolt_url || storeUrl) && (
            <div className="space-y-1.5 pt-1">
              <WoltButton url={defaultVariant?.wolt_url} storeUrl={storeUrl} />
              {woltEnabled && (defaultVariant?.wolt_url || storeUrl) && <WoltDisclaimer />}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export const ProductCard = memo(ProductCardInner);
