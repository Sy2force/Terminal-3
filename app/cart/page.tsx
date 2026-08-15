"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { Minus, Plus, Trash2, AlertTriangle, Sparkles, ShoppingBag } from "lucide-react";
import { useCart } from "@/lib/cart/cart-context";
import { formatAgorot } from "@/lib/money";
import { getFirstPurchaseDiscountPreview } from "@/app/checkout/actions";

export default function CartPage() {
  const { lines, subtotalAgorot, hasAgeRestrictedItem, updateQuantity, removeItem, clear } =
    useCart();
  const [discount, setDiscount] = useState<{ eligible: boolean; percent: number }>(
    { eligible: false, percent: 0 },
  );
  const [confirmingClear, setConfirmingClear] = useState(false);

  useEffect(() => {
    getFirstPurchaseDiscountPreview().then(setDiscount);
  }, []);

  const discountAgorot = discount.eligible
    ? Math.round((subtotalAgorot * discount.percent) / 100)
    : 0;

  return (
    <div className="min-h-screen bg-fond-papier">
      <div className="border-b border-brun-cave/15 bg-noir-chaud py-14 sm:py-16">
        <div className="mx-auto max-w-[1440px] px-4 sm:px-6 lg:px-8">
          <p className="text-xs uppercase tracking-[0.3em] text-or-principal">Votre sélection</p>
          <h1 className="mt-3 font-serif text-4xl leading-tight text-texte-clair sm:text-5xl">
            Votre panier
          </h1>
        </div>
      </div>

      <div className="mx-auto max-w-4xl px-4 py-14 sm:px-6 lg:px-8">
        {lines.length === 0 ? (
          <div className="flex flex-col items-center gap-6 rounded-sm border border-brun-cave/15 bg-white/40 px-6 py-20 text-center">
            <ShoppingBag className="h-8 w-8 text-brun-cave/40" aria-hidden />
            <p className="font-serif text-xl text-noir-profond">Votre panier est vide pour le moment.</p>
            <Link
              href="/vins"
              className="rounded-sm bg-bordeaux-principal px-6 py-3 text-sm font-medium uppercase tracking-widest text-texte-clair transition-colors hover:bg-bordeaux-fonce"
            >
              Découvrir la cave
            </Link>
          </div>
        ) : (
          <>
            <div className="flex flex-col divide-y divide-brun-cave/10 border-y border-brun-cave/15">
              {lines.map((line) => (
                <div key={line.variantId} className="flex items-center gap-4 py-5">
                  <div className="relative h-20 w-16 shrink-0 overflow-hidden rounded-sm border border-brun-cave/10 bg-[#F1EADC]">
                    {line.imageUrl && (
                      <Image
                        src={line.imageUrl}
                        alt={line.productName}
                        fill
                        sizes="64px"
                        className="object-contain p-1.5"
                      />
                    )}
                  </div>

                  <div className="flex-1">
                    <Link
                      href={`/products/${line.productSlug}`}
                      className="font-serif text-base text-noir-profond hover:text-bordeaux-principal"
                    >
                      {line.productName}
                    </Link>
                    {line.variantLabel && (
                      <p className="text-xs text-gris-chaud">{line.variantLabel}</p>
                    )}
                    {line.ageRestricted && (
                      <p className="mt-1 flex items-center gap-1 text-xs text-bordeaux-principal">
                        <AlertTriangle className="h-3 w-3" aria-hidden />
                        18+
                      </p>
                    )}
                  </div>

                  <div className="flex items-center rounded-sm border border-brun-cave/25">
                    <button
                      type="button"
                      aria-label="Diminuer la quantité"
                      onClick={() => updateQuantity(line.variantId, line.quantity - 1)}
                      className="p-2 text-noir-profond/70 hover:text-bordeaux-principal"
                    >
                      <Minus className="h-3.5 w-3.5" aria-hidden />
                    </button>
                    <span className="w-8 text-center text-sm text-noir-profond" aria-live="polite">
                      {line.quantity}
                    </span>
                    <button
                      type="button"
                      aria-label="Augmenter la quantité"
                      onClick={() => updateQuantity(line.variantId, line.quantity + 1)}
                      className="p-2 text-noir-profond/70 hover:text-bordeaux-principal"
                    >
                      <Plus className="h-3.5 w-3.5" aria-hidden />
                    </button>
                  </div>

                  <span className="w-20 text-right text-sm font-medium text-bordeaux-principal">
                    {line.displayPriceAgorot != null
                      ? formatAgorot(line.displayPriceAgorot * line.quantity)
                      : "—"}
                  </span>

                  <button
                    type="button"
                    aria-label={`Retirer ${line.productName} du panier`}
                    onClick={() => removeItem(line.variantId)}
                    className="p-2 text-gris-chaud hover:text-bordeaux-principal"
                  >
                    <Trash2 className="h-4 w-4" aria-hidden />
                  </button>
                </div>
              ))}
            </div>

            <div className="mt-6 flex justify-between">
              <Link href="/vins" className="text-sm text-bordeaux-principal underline-offset-2 hover:underline">
                Continuer mes achats
              </Link>
              {confirmingClear ? (
                <div className="flex items-center gap-3 text-sm">
                  <span className="text-gris-chaud">Vider le panier ?</span>
                  <button
                    type="button"
                    onClick={() => {
                      clear();
                      setConfirmingClear(false);
                    }}
                    className="font-medium text-bordeaux-principal hover:underline"
                  >
                    Confirmer
                  </button>
                  <button
                    type="button"
                    onClick={() => setConfirmingClear(false)}
                    className="text-gris-chaud hover:underline"
                  >
                    Annuler
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => setConfirmingClear(true)}
                  className="text-sm text-gris-chaud hover:text-bordeaux-principal hover:underline"
                >
                  Vider le panier
                </button>
              )}
            </div>

            <div className="mt-8 flex flex-col items-end gap-4">
              {discount.eligible && (
                <div className="flex items-center gap-2 self-stretch rounded-sm border border-or-principal/40 bg-or-principal/5 px-4 py-3 text-sm text-noir-profond">
                  <Sparkles className="h-4 w-4 shrink-0 text-or-principal" aria-hidden />
                  -{discount.percent}% automatique sur votre première commande
                </div>
              )}
              <div className="flex w-full flex-col gap-1 border-t border-brun-cave/15 pt-4 text-right">
                <div className="flex items-baseline justify-end gap-3">
                  <span className="text-sm text-gris-chaud">Sous-total</span>
                  <span className="font-serif text-2xl text-bordeaux-principal">
                    {formatAgorot(subtotalAgorot)}
                  </span>
                </div>
                {discount.eligible && (
                  <p className="text-xs text-or-principal">
                    Économie estimée : -{formatAgorot(discountAgorot)}
                  </p>
                )}
              </div>
              {hasAgeRestrictedItem && (
                <p className="max-w-sm text-right text-xs text-gris-chaud">
                  Ce panier contient un produit réservé aux personnes de 18 ans et plus. Une pièce
                  d&rsquo;identité valide sera contrôlée au retrait ou à la livraison.
                </p>
              )}
              <p className="text-xs text-gris-chaud">
                Paiement en espèces au retrait ou à la livraison — aucun paiement en ligne.
              </p>
              <Link
                href="/checkout"
                data-analytics-event="begin_checkout"
                className="rounded-sm bg-bordeaux-principal px-8 py-3.5 text-sm font-medium uppercase tracking-widest text-texte-clair transition-colors hover:bg-bordeaux-fonce"
              >
                Passer la commande
              </Link>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
