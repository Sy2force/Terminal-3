"use client";

import { useState } from "react";
import { LayoutGrid, Check } from "lucide-react";
import { useCart } from "@/lib/cart/cart-context";

/**
 * "Ajouter à mon plateau" — connects to the existing cart, exactly like
 * the regular add-to-cart action, so the selection is preserved until a
 * dedicated platter-composition flow exists. Only rendered when the
 * product is actually flagged `is_available_for_platter` by the caller.
 * Shared between charcuterie and fish detail pages.
 */
export function AddToPlatterButton({
  productId,
  productSlug,
  productName,
  variantId,
  variantLabel,
  priceAgorot,
  imageUrl,
}: {
  productId: string;
  productSlug: string;
  productName: string;
  variantId: string | null;
  variantLabel: string | null;
  priceAgorot: number | null;
  imageUrl: string | null;
}) {
  const { addItem } = useCart();
  const [added, setAdded] = useState(false);

  if (!variantId) return null;

  function handleClick() {
    if (!variantId) return;
    addItem({
      variantId,
      productId,
      productSlug,
      productName,
      variantLabel,
      displayPriceAgorot: priceAgorot,
      imageUrl,
      ageRestricted: false,
    });
    setAdded(true);
    setTimeout(() => setAdded(false), 1800);
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      className="flex items-center justify-center gap-2 rounded-sm border border-brun-cave/25 px-6 py-3 text-sm font-medium uppercase tracking-widest text-noir-profond transition-colors hover:border-bordeaux-principal hover:text-bordeaux-principal"
    >
      {added ? (
        <>
          <Check className="h-4 w-4" aria-hidden />
          Ajouté à votre plateau
        </>
      ) : (
        <>
          <LayoutGrid className="h-4 w-4" aria-hidden />
          Ajouter à mon plateau
        </>
      )}
    </button>
  );
}
