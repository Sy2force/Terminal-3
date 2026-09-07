"use client";

import { useState } from "react";
import { Minus, Plus, ShoppingBag, Check } from "lucide-react";
import { useCart } from "@/lib/cart/cart-context";
import type { ProductAvailabilityStatus } from "@/types/database";

export function AddToCartButton({
  variantId,
  productId,
  productSlug,
  productName,
  variantLabel,
  displayPriceAgorot,
  imageUrl,
  ageRestricted,
  storeOnline,
  availabilityStatus,
  className,
}: {
  variantId: string;
  productId: string;
  productSlug: string;
  productName: string;
  variantLabel: string | null;
  displayPriceAgorot: number | null;
  imageUrl: string | null;
  ageRestricted: boolean;
  storeOnline: boolean;
  availabilityStatus?: ProductAvailabilityStatus | null;
  className?: string;
}) {
  const { addItem } = useCart();
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);

  if (!storeOnline) {
    return (
      <div
        className={`rounded-sm border border-white/10 bg-graphite px-4 py-3 text-center text-sm text-muted-grey ${className ?? ""}`}
      >
        Commandes en ligne momentanément fermées — appelez-nous.
      </div>
    );
  }

  if (availabilityStatus === "OUT_OF_STOCK") {
    return (
      <div
        className={`rounded-sm border border-red-400/20 bg-red-900/10 px-4 py-3 text-center text-sm text-red-200 ${className ?? ""}`}
      >
        Rupture de stock
      </div>
    );
  }

  function handleAdd() {
    addItem(
      {
        variantId,
        productId,
        productSlug,
        productName,
        variantLabel,
        displayPriceAgorot,
        imageUrl,
        ageRestricted,
      },
      quantity,
    );
    setAdded(true);
    setTimeout(() => setAdded(false), 1800);
  }

  return (
    <div className={`flex items-center gap-3 ${className ?? ""}`}>
      <div className="flex items-center rounded-full border border-white/10">
        <button
          type="button"
          aria-label="Diminuer la quantité"
          onClick={() => setQuantity((q) => Math.max(1, q - 1))}
          className="p-2.5 text-ivory/70 hover:text-champagne"
        >
          <Minus className="h-4 w-4" aria-hidden />
        </button>
        <span className="w-6 text-center text-sm text-ivory">{quantity}</span>
        <button
          type="button"
          aria-label="Augmenter la quantité"
          onClick={() => setQuantity((q) => q + 1)}
          className="p-2.5 text-ivory/70 hover:text-champagne"
        >
          <Plus className="h-4 w-4" aria-hidden />
        </button>
      </div>

      <button
        type="button"
        onClick={handleAdd}
        data-analytics-event="add_to_cart"
        className="flex flex-1 items-center justify-center gap-2 rounded-full bg-champagne px-6 py-3 text-sm font-semibold tracking-wide text-obsidian transition-colors hover:bg-soft-gold"
      >
        {added ? (
          <>
            <Check className="h-4 w-4" aria-hidden />
            Ajouté
          </>
        ) : (
          <>
            <ShoppingBag className="h-4 w-4" aria-hidden />
            Ajouter au panier
          </>
        )}
      </button>
    </div>
  );
}
