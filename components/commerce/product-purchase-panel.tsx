"use client";

import { useState } from "react";
import { AddToCartButton } from "@/components/commerce/add-to-cart-button";
import { formatAgorot } from "@/lib/money";
import type { ProductVariantRow } from "@/types/database";

export function ProductPurchasePanel({
  productId,
  productSlug,
  productName,
  imageUrl,
  ageRestricted,
  variants,
  storeOnline,
}: {
  productId: string;
  productSlug: string;
  productName: string;
  imageUrl: string | null;
  ageRestricted: boolean;
  variants: ProductVariantRow[];
  storeOnline: boolean;
}) {
  const [selectedId, setSelectedId] = useState(
    () => variants.find((v) => v.is_default)?.id ?? variants[0]?.id,
  );
  const selected = variants.find((v) => v.id === selectedId) ?? variants[0];

  if (!selected) {
    return (
      <p className="text-sm text-muted-grey">
        Disponibilité et prix en magasin uniquement pour le moment.
      </p>
    );
  }

  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-baseline gap-3">
        <span className="font-serif text-2xl text-champagne">
          {selected.regular_price_agorot != null
            ? formatAgorot(selected.regular_price_agorot)
            : "Prix en magasin"}
        </span>
      </div>

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
        displayPriceAgorot={selected.regular_price_agorot}
        imageUrl={imageUrl}
        ageRestricted={ageRestricted}
        storeOnline={storeOnline && selected.regular_price_agorot != null}
      />
    </div>
  );
}
