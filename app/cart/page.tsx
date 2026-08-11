"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { Minus, Plus, Trash2, AlertTriangle, Sparkles } from "lucide-react";
import { useCart } from "@/lib/cart/cart-context";
import { formatAgorot } from "@/lib/money";
import { EmptyState } from "@/components/ui/empty-state";
import { getFirstPurchaseDiscountPreview } from "@/app/checkout/actions";

export default function CartPage() {
  const { lines, subtotalAgorot, hasAgeRestrictedItem, updateQuantity, removeItem } =
    useCart();
  const [discount, setDiscount] = useState<{ eligible: boolean; percent: number }>(
    { eligible: false, percent: 0 },
  );

  useEffect(() => {
    getFirstPurchaseDiscountPreview().then(setDiscount);
  }, []);

  return (
    <div className="mx-auto max-w-4xl px-6 py-16 lg:px-8">
      <h1 className="font-serif text-3xl text-ivory sm:text-4xl">
        Votre panier
      </h1>

      {lines.length === 0 ? (
        <div className="mt-10">
          <EmptyState message="Votre panier est vide pour le moment." />
          <div className="mt-6 flex justify-center">
            <Link
              href="/new"
              className="rounded-full border border-champagne/50 px-6 py-3 text-sm text-champagne transition-colors hover:bg-champagne hover:text-obsidian"
            >
              Découvrir la boutique
            </Link>
          </div>
        </div>
      ) : (
        <>
          <div className="mt-8 flex flex-col divide-y divide-white/5 border-y border-white/5">
            {lines.map((line) => (
              <div key={line.variantId} className="flex items-center gap-4 py-5">
                <div className="relative h-20 w-16 shrink-0 overflow-hidden rounded-sm bg-warm-black">
                  {line.imageUrl && (
                    <Image
                      src={line.imageUrl}
                      alt={line.productName}
                      fill
                      sizes="64px"
                      className="object-cover"
                    />
                  )}
                </div>

                <div className="flex-1">
                  <Link
                    href={`/products/${line.productSlug}`}
                    className="font-serif text-base text-ivory hover:text-champagne"
                  >
                    {line.productName}
                  </Link>
                  {line.variantLabel && (
                    <p className="text-xs text-muted-grey">{line.variantLabel}</p>
                  )}
                  {line.ageRestricted && (
                    <p className="mt-1 flex items-center gap-1 text-xs text-amber-300">
                      <AlertTriangle className="h-3 w-3" aria-hidden />
                      18+
                    </p>
                  )}
                </div>

                <div className="flex items-center rounded-full border border-white/10">
                  <button
                    type="button"
                    aria-label="Diminuer"
                    onClick={() =>
                      updateQuantity(line.variantId, line.quantity - 1)
                    }
                    className="p-2 text-ivory/70 hover:text-champagne"
                  >
                    <Minus className="h-3.5 w-3.5" aria-hidden />
                  </button>
                  <span className="w-6 text-center text-sm text-ivory">
                    {line.quantity}
                  </span>
                  <button
                    type="button"
                    aria-label="Augmenter"
                    onClick={() =>
                      updateQuantity(line.variantId, line.quantity + 1)
                    }
                    className="p-2 text-ivory/70 hover:text-champagne"
                  >
                    <Plus className="h-3.5 w-3.5" aria-hidden />
                  </button>
                </div>

                <span className="w-20 text-right text-sm text-champagne">
                  {line.displayPriceAgorot != null
                    ? formatAgorot(line.displayPriceAgorot * line.quantity)
                    : "—"}
                </span>

                <button
                  type="button"
                  aria-label="Retirer du panier"
                  onClick={() => removeItem(line.variantId)}
                  className="p-2 text-muted-grey hover:text-amber-400"
                >
                  <Trash2 className="h-4 w-4" aria-hidden />
                </button>
              </div>
            ))}
          </div>

          <div className="mt-8 flex flex-col items-end gap-4">
            {discount.eligible && (
              <div className="flex items-center gap-2 self-stretch rounded-sm border border-champagne/40 bg-champagne/5 px-4 py-3 text-sm text-champagne">
                <Sparkles className="h-4 w-4 shrink-0" aria-hidden />
                -{discount.percent}% automatique sur votre première commande
              </div>
            )}
            <div className="flex items-baseline gap-3 text-lg">
              <span className="text-ivory/70">Sous-total</span>
              <span className="font-serif text-2xl text-champagne">
                {formatAgorot(subtotalAgorot)}
              </span>
            </div>
            {hasAgeRestrictedItem && (
              <p className="max-w-sm text-right text-xs text-amber-300">
                Ce panier contient un produit 18+. Une pièce d&rsquo;identité
                sera demandée au retrait ou à la livraison.
              </p>
            )}
            <p className="text-xs text-muted-grey">
              Paiement au retrait ou à la livraison — aucun paiement en ligne.
            </p>
            <Link
              href="/checkout"
              data-analytics-event="begin_checkout"
              className="rounded-full bg-champagne px-8 py-3 text-sm font-semibold tracking-wide text-obsidian transition-colors hover:bg-soft-gold"
            >
              Passer la commande
            </Link>
          </div>
        </>
      )}
    </div>
  );
}
