"use client";

import { useState } from "react";
import { AddToCartButton } from "@/components/commerce/add-to-cart-button";
import { WoltButton, WoltDisclaimer } from "@/components/commerce/wolt-button";
import { useWoltSettings } from "@/components/commerce/wolt-settings-provider";
import { formatAgorot, formatUnitPrice, savingPercent } from "@/lib/money";
import type { ProductVariantRow } from "@/types/database";

const availabilityLabels: Record<string, string> = {
  IN_STOCK: "En stock",
  LOW_STOCK: "Stock faible",
  OUT_OF_STOCK: "Rupture",
  PREORDER: "Précommande",
  ON_REQUEST: "Sur commande",
};

export function ProductPurchasePanel({
  productId,
  productSlug,
  productName,
  imageUrl,
  ageRestricted,
  variants,
  basePriceAgorot,
  compareAtPriceAgorot,
  storeOnline,
}: {
  productId: string;
  productSlug: string;
  productName: string;
  imageUrl: string | null;
  ageRestricted: boolean;
  variants: ProductVariantRow[];
  basePriceAgorot: number | null;
  compareAtPriceAgorot: number | null;
  storeOnline: boolean;
}) {
  const [selectedId, setSelectedId] = useState(
    () => variants.find((v) => v.is_default)?.id ?? variants[0]?.id,
  );
  const selected = variants.find((v) => v.id === selectedId) ?? variants[0];
  const { enabled: woltEnabled, storeUrl } = useWoltSettings();

  if (!selected) {
    return (
      <p className="text-sm text-muted-grey">
        Disponibilité et prix en magasin uniquement pour le moment.
      </p>
    );
  }

  const displayPrice = selected.regular_price_agorot ?? basePriceAgorot ?? null;
  const comparePrice = compareAtPriceAgorot;
  const hasPromo = comparePrice != null && displayPrice != null && comparePrice > displayPrice;
  const discount = hasPromo ? savingPercent(comparePrice, displayPrice) : 0;

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-wrap items-baseline gap-3">
        <span className="font-serif text-2xl text-champagne">
          {displayPrice != null
            ? formatUnitPrice(displayPrice, selected.pricing_unit)
            : "Prix en magasin"}
        </span>
        {hasPromo && (
          <>
            <span className="text-sm text-muted-grey line-through">
              {formatAgorot(comparePrice)}
            </span>
            <span className="rounded-sm bg-amber-900/30 px-2 py-0.5 text-xs text-amber-300">
              -{discount}%
            </span>
          </>
        )}
      </div>

      {selected.availability_status && selected.availability_status !== "IN_STOCK" && (
        <span
          className={`w-fit rounded-full border px-3 py-1 text-[10px] font-medium uppercase tracking-widest ${
            selected.availability_status === "OUT_OF_STOCK"
              ? "border-red-400/60 text-red-300"
              : selected.availability_status === "LOW_STOCK"
                ? "border-amber-400/60 text-amber-300"
                : "border-champagne/30 text-champagne"
          }`}
        >
          {availabilityLabels[selected.availability_status] ?? selected.availability_status}
        </span>
      )}

      {variants.length > 1 && (
        <div className="flex flex-wrap gap-2">
          {variants.map((variant) => (
            <button
              key={variant.id}
              type="button"
              onClick={() => setSelectedId(variant.id)}
              className={`rounded-full border px-4 py-1.5 text-xs uppercase tracking-widest transition-colors ${
                variant.id === selectedId
                  ? "border-champagne text-champagne"
                  : "border-white/10 text-ivory/60 hover:border-white/30"
              }`}
            >
              {variant.label}
            </button>
          ))}
        </div>
      )}

      <AddToCartButton
        variantId={selected.id}
        productId={productId}
        productSlug={productSlug}
        productName={productName}
        variantLabel={selected.label}
        displayPriceAgorot={displayPrice}
        imageUrl={imageUrl}
        ageRestricted={ageRestricted}
        storeOnline={storeOnline && displayPrice != null}
        availabilityStatus={selected.availability_status}
      />

      {woltEnabled && (selected.wolt_url || storeUrl) && (
        <div className="space-y-1.5">
          <WoltButton url={selected.wolt_url} storeUrl={storeUrl} />
          <WoltDisclaimer />
        </div>
      )}
    </div>
  );
}
