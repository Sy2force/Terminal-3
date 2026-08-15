"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Minus, Plus, ShoppingBag, Check, Heart, MessageCircle } from "lucide-react";
import { useCart } from "@/lib/cart/cart-context";
import { toggleFavorite } from "@/app/favorites/actions";
import { formatAgorot, formatUnitPrice } from "@/lib/money";
import type { ProductAvailabilityStatus, PricingUnit } from "@/types/database";

const STOCK_LABELS: Record<ProductAvailabilityStatus, { label: string; tone: string }> = {
  IN_STOCK: { label: "En stock", tone: "text-green-800" },
  LOW_STOCK: { label: "Stock limité — dépêchez-vous", tone: "text-or-principal" },
  OUT_OF_STOCK: { label: "Rupture de stock", tone: "text-bordeaux-principal" },
  PREORDER: { label: "Disponible en précommande", tone: "text-noir-profond" },
  ON_REQUEST: { label: "Disponible sur demande", tone: "text-noir-profond" },
};

export interface PurchaseVariantOption {
  id: string;
  label: string;
  priceAgorot: number | null;
  compareAgorot?: number | null;
  pricingUnit?: PricingUnit | null;
  availability: ProductAvailabilityStatus;
}

export function WinePurchasePanel({
  productId,
  productSlug,
  productName,
  domaine,
  extraDetail,
  imageUrl,
  variantId,
  variantLabel,
  priceAgorot,
  compareAgorot,
  pricingUnit,
  availability,
  whatsapp,
  pageUrl,
  initialFavorited,
  basePath = "/vins",
  variants,
  onVariantChange,
}: {
  productId: string;
  productSlug: string;
  productName: string;
  domaine: string | null;
  /** e.g. "Millésime 2020" or "Âge : 12 ans" — appended to the WhatsApp order message. */
  extraDetail?: string | null;
  imageUrl: string | null;
  variantId: string | null;
  variantLabel: string | null;
  priceAgorot: number | null;
  compareAgorot: number | null;
  /** How to read `priceAgorot` — null/"FIXED" behaves exactly like before (e.g. wine/spirits). */
  pricingUnit?: PricingUnit | null;
  availability: ProductAvailabilityStatus;
  whatsapp: string;
  pageUrl: string;
  initialFavorited: boolean;
  /** e.g. "/vins" or "/spiritueux" — used for the login redirect. */
  basePath?: string;
  /**
   * Optional format/weight selection (e.g. charcuterie "100 g" / "200 g" /
   * "Entier"). When provided with more than one option, a selector is
   * shown and price/stock switch immediately with the selection — the
   * scalar `variantId`/`priceAgorot`/etc. props above are then only used
   * as the initial selection. Omit entirely for single-format products
   * (wine, spirits) to keep their existing behaviour unchanged.
   */
  variants?: PurchaseVariantOption[];
  /** Notified with the newly selected variant id — lets a parent (e.g. the gallery) stay in sync. */
  onVariantChange?: (variantId: string) => void;
}) {
  const router = useRouter();
  const { addItem, lines } = useCart();
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);
  const [favorited, setFavorited] = useState(initialFavorited);
  const [isFavPending, startFavTransition] = useTransition();
  const [selectedVariantId, setSelectedVariantId] = useState(
    () => variants?.find((v) => v.id === variantId)?.id ?? variants?.[0]?.id ?? variantId,
  );

  const selected = variants?.find((v) => v.id === selectedVariantId);
  const activeVariantId = variants ? selected?.id ?? null : variantId;
  const activeVariantLabel = variants ? selected?.label ?? null : variantLabel;
  const activePriceAgorot = variants ? selected?.priceAgorot ?? null : priceAgorot;
  const activeCompareAgorot = variants ? selected?.compareAgorot ?? null : compareAgorot;
  const activePricingUnit = variants ? selected?.pricingUnit : pricingUnit;
  const activeAvailability = variants ? selected?.availability ?? "OUT_OF_STOCK" : availability;

  const outOfStock = activeAvailability === "OUT_OF_STOCK" || !activeVariantId;
  const maxQuantity = activeAvailability === "LOW_STOCK" ? 3 : 24;
  const stockInfo = STOCK_LABELS[activeAvailability];

  const alreadyInCartQty = useMemo(
    () => lines.find((l) => l.variantId === activeVariantId)?.quantity ?? 0,
    [lines, activeVariantId],
  );

  function handleAddToCart() {
    if (!activeVariantId || outOfStock) return;
    addItem(
      {
        variantId: activeVariantId,
        productId,
        productSlug,
        productName,
        variantLabel: activeVariantLabel,
        displayPriceAgorot: activePriceAgorot,
        imageUrl,
        ageRestricted: true,
      },
      quantity,
    );
    setAdded(true);
    setTimeout(() => setAdded(false), 1800);
  }

  function handleFavoriteClick() {
    const next = !favorited;
    setFavorited(next);
    startFavTransition(async () => {
      try {
        const result = await toggleFavorite(productId);
        if (!result.success) {
          setFavorited(!next);
          if (result.error?.includes("connecté")) {
            router.push(`/login?redirect=${basePath}/${productSlug}`);
          }
          return;
        }
        setFavorited(result.favorited);
      } catch {
        setFavorited(!next);
      }
    });
  }

  const whatsappHref = useMemo(() => {
    if (!whatsapp) return null;
    const digits = whatsapp.replace(/[^\d+]/g, "").replace(/^\+/, "");
    const total = activePriceAgorot != null ? activePriceAgorot * quantity : null;
    const lines = [
      "Bonjour Terminal 3, je souhaite commander :",
      `${productName}${domaine ? ` — ${domaine}` : ""}${extraDetail ? ` (${extraDetail})` : ""}`,
      activeVariantLabel ? `Format : ${activeVariantLabel}` : null,
      `Quantité : ${quantity}`,
      activePriceAgorot != null ? `Prix unitaire : ${formatUnitPrice(activePriceAgorot, activePricingUnit)}` : null,
      total != null ? `Total : ${formatAgorot(total)}` : null,
      pageUrl,
    ].filter(Boolean);
    return `https://wa.me/${digits}?text=${encodeURIComponent(lines.join("\n"))}`;
  }, [
    whatsapp,
    activePriceAgorot,
    activePricingUnit,
    activeVariantLabel,
    quantity,
    productName,
    domaine,
    extraDetail,
    pageUrl,
  ]);

  return (
    <div className="flex flex-col gap-5">
      {/* Format / weight selection */}
      {variants && variants.length > 1 && (
        <fieldset>
          <legend className="text-xs font-medium uppercase tracking-widest text-bordeaux-principal">
            Format
          </legend>
          <div className="mt-3 flex flex-wrap gap-2" role="radiogroup" aria-label="Choisir un format">
            {variants.map((v) => (
              <button
                key={v.id}
                type="button"
                role="radio"
                aria-checked={v.id === selectedVariantId}
                disabled={v.availability === "OUT_OF_STOCK"}
                onClick={() => {
                  setSelectedVariantId(v.id);
                  setQuantity(1);
                  onVariantChange?.(v.id);
                }}
                className={`rounded-sm border px-4 py-2 text-sm transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-bordeaux-principal disabled:cursor-not-allowed disabled:opacity-40 ${
                  v.id === selectedVariantId
                    ? "border-bordeaux-principal bg-bordeaux-principal text-texte-clair"
                    : "border-brun-cave/25 text-noir-profond hover:border-bordeaux-principal/60"
                }`}
              >
                {v.label}
                {v.availability === "OUT_OF_STOCK" && " (rupture)"}
              </button>
            ))}
          </div>
        </fieldset>
      )}

      {/* Price */}
      <div className="flex flex-wrap items-baseline gap-3">
        {activeCompareAgorot && activePriceAgorot && (
          <span className="text-base text-gris-chaud/60 line-through">
            {formatAgorot(activeCompareAgorot)}
          </span>
        )}
        <span className="font-serif text-3xl text-bordeaux-principal">
          {activePriceAgorot != null ? formatUnitPrice(activePriceAgorot, activePricingUnit) : "Sur demande"}
        </span>
        {activeCompareAgorot && activePriceAgorot && (
          <span className="rounded-sm bg-bordeaux-principal px-2 py-1 text-xs font-bold uppercase text-texte-clair">
            -{Math.round((1 - activePriceAgorot / activeCompareAgorot) * 100)}%
          </span>
        )}
      </div>
      {activePriceAgorot != null && (
        <p className="-mt-3 text-xs text-gris-chaud">Prix TTC, hors frais de livraison éventuels.</p>
      )}
      {activePriceAgorot == null && (
        <p className="-mt-3 text-xs text-gris-chaud">
          Contactez-nous pour connaître la disponibilité et le tarif de ce produit.
        </p>
      )}

      {/* Stock */}
      <p className={`text-sm font-medium ${stockInfo.tone}`}>
        <span aria-hidden>● </span>
        {stockInfo.label}
      </p>

      {/* Quantity + add to cart */}
      {!outOfStock && activePriceAgorot != null && (
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="flex items-center rounded-sm border border-brun-cave/25">
            <button
              type="button"
              aria-label="Diminuer la quantité"
              onClick={() => setQuantity((q) => Math.max(1, q - 1))}
              className="p-3 text-noir-profond/70 hover:text-bordeaux-principal"
            >
              <Minus className="h-4 w-4" aria-hidden />
            </button>
            <span className="w-10 text-center text-sm text-noir-profond" aria-live="polite">
              {quantity}
            </span>
            <button
              type="button"
              aria-label="Augmenter la quantité"
              onClick={() => setQuantity((q) => Math.min(maxQuantity, q + 1))}
              className="p-3 text-noir-profond/70 hover:text-bordeaux-principal"
            >
              <Plus className="h-4 w-4" aria-hidden />
            </button>
          </div>

          <button
            type="button"
            onClick={handleAddToCart}
            className="flex flex-1 items-center justify-center gap-2 rounded-sm bg-bordeaux-principal px-6 py-3.5 text-sm font-medium uppercase tracking-widest text-texte-clair transition-colors hover:bg-bordeaux-fonce"
          >
            {added ? (
              <>
                <Check className="h-4 w-4" aria-hidden />
                Ajouté au panier
              </>
            ) : (
              <>
                <ShoppingBag className="h-4 w-4" aria-hidden />
                Ajouter au panier
                {alreadyInCartQty > 0 && ` (${alreadyInCartQty} déjà)`}
              </>
            )}
          </button>

          <button
            type="button"
            onClick={handleFavoriteClick}
            disabled={isFavPending}
            aria-pressed={favorited}
            aria-label={favorited ? "Retirer des favoris" : "Ajouter aux favoris"}
            className={`flex shrink-0 items-center justify-center rounded-sm border border-brun-cave/25 p-3.5 transition-colors hover:border-bordeaux-principal ${
              favorited ? "text-bordeaux-principal" : "text-noir-profond/60"
            }`}
          >
            <Heart className="h-5 w-5" fill={favorited ? "currentColor" : "none"} aria-hidden />
          </button>
        </div>
      )}

      {outOfStock && (
        <button
          type="button"
          disabled
          className="w-full rounded-sm border border-brun-cave/20 px-6 py-3.5 text-sm uppercase tracking-widest text-gris-chaud"
        >
          Indisponible pour le moment
        </button>
      )}

      {/* WhatsApp order */}
      {whatsappHref && (
        <a
          href={whatsappHref}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center gap-2 rounded-sm border border-bordeaux-principal px-6 py-3.5 text-sm font-medium uppercase tracking-widest text-bordeaux-principal transition-colors hover:bg-bordeaux-principal hover:text-texte-clair"
        >
          <MessageCircle className="h-4 w-4" aria-hidden />
          Commander sur WhatsApp
        </a>
      )}
    </div>
  );
}
