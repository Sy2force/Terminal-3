"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import Image from "next/image";
import { X, ShoppingBag, Check } from "lucide-react";
import { useCart } from "@/lib/cart/cart-context";
import { toggleFavorite } from "@/app/favorites/actions";
import { formatUnitPrice, savingPercent } from "@/lib/money";
import { categoryBasePath } from "@/lib/category-paths";
import type { ProductWithMedia } from "@/lib/data/catalog";

export function FavoriteCard({
  product,
  showRemove = true,
}: {
  product: ProductWithMedia;
  /** Hidden when this card is reused outside the favorites page (e.g. search results). */
  showRemove?: boolean;
}) {
  const { addItem, lines } = useCart();
  const [removed, setRemoved] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [added, setAdded] = useState(false);

  const name = product.name_fr || product.name_he;
  const cover = product.media?.[0];
  const defaultVariant = product.variants?.find((v) => v.is_default) ?? product.variants?.[0];
  const priceAgorot = defaultVariant?.regular_price_agorot ?? product.base_price_agorot ?? null;
  const compareAgorot = product.compare_at_price_agorot;
  const discount = compareAgorot && priceAgorot ? savingPercent(compareAgorot, priceAgorot) : 0;
  const outOfStock =
    product.availability_status === "OUT_OF_STOCK" ||
    defaultVariant?.availability_status === "OUT_OF_STOCK";
  const alreadyInCart = defaultVariant ? lines.some((l) => l.variantId === defaultVariant.id) : false;
  const detailHref = `${categoryBasePath(product.category?.slug)}/${product.slug}`;

  if (removed) return null;

  function handleRemove() {
    startTransition(async () => {
      const result = await toggleFavorite(product.id);
      if (result.success) setRemoved(true);
    });
  }

  function handleAddToCart() {
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
  }

  return (
    <div className="group relative flex flex-col overflow-hidden rounded-sm border border-brun-cave/40 bg-[#FAF7F0] transition-shadow hover:shadow-lg hover:shadow-noir-profond/5">
      {showRemove && (
        <button
          type="button"
          onClick={handleRemove}
          disabled={isPending}
          aria-label={`Retirer ${name} des favoris`}
          className="absolute right-3 top-3 z-10 rounded-full bg-fond-papier/90 p-2 text-brun-cave/60 shadow-sm backdrop-blur-sm transition-colors hover:text-bordeaux-principal"
        >
          <X className="h-4 w-4" aria-hidden />
        </button>
      )}

      <Link href={detailHref} className="relative aspect-[3/4] w-full overflow-hidden bg-[#FAF7F0]">
        {cover?.url ? (
          <Image
            src={cover.url}
            alt={cover.alt ?? name}
            fill
            sizes="(min-width: 1280px) 23vw, (min-width: 1024px) 30vw, (min-width: 640px) 46vw, 90vw"
            className="object-contain p-6"
          />
        ) : (
          <div className="flex h-full items-center justify-center px-4">
            <span className="text-center text-xs uppercase tracking-widest text-brun-cave/50">
              Photo à venir
            </span>
          </div>
        )}
        {product.badge && (
          <span className="absolute left-3 top-3 rounded-sm bg-bordeaux-principal px-2.5 py-1 text-[10px] font-medium uppercase tracking-widest text-texte-clair">
            {product.badge}
          </span>
        )}
        {!product.badge && discount > 0 && (
          <span className="absolute left-3 top-3 rounded-sm bg-or-principal px-2.5 py-1 text-[10px] font-bold uppercase tracking-widest text-noir-profond">
            -{discount}%
          </span>
        )}
      </Link>

      <div className="flex flex-1 flex-col gap-2 p-5">
        <span className="text-[11px] uppercase tracking-widest text-gris-chaud">
          {product.category?.name_fr ?? ""}
        </span>
        <Link href={detailHref}>
          <h3 className="font-serif text-lg leading-snug text-noir-profond transition-colors group-hover:text-bordeaux-principal">
            {name}
          </h3>
        </Link>

        {outOfStock && (
          <p className="text-xs font-medium uppercase tracking-wider text-bordeaux-principal">
            Rupture de stock
          </p>
        )}

        <div className="mt-auto flex flex-col gap-3 pt-3 border-t border-brun-cave/15">
          <div className="flex items-baseline gap-2">
            {compareAgorot && (
              <span className="text-sm text-gris-chaud/50 line-through">
                {formatUnitPrice(compareAgorot, defaultVariant?.pricing_unit)}
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
              Voir
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
        </div>
      </div>
    </div>
  );
}
