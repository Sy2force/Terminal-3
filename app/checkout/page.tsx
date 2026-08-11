"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { AlertTriangle, Sparkles } from "lucide-react";
import { useCart } from "@/lib/cart/cart-context";
import { formatAgorot } from "@/lib/money";
import { submitOrder, getFirstPurchaseDiscountPreview, getDeliveryFee } from "@/app/checkout/actions";

export default function CheckoutPage() {
  const router = useRouter();
  const { lines, subtotalAgorot, hasAgeRestrictedItem, clear } = useCart();

  const [fulfillmentType, setFulfillmentType] = useState<"pickup" | "delivery">(
    "pickup",
  );
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [deliveryAddress, setDeliveryAddress] = useState("");
  const [customerNotes, setCustomerNotes] = useState("");
  const [ageSelfDeclared, setAgeSelfDeclared] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [discount, setDiscount] = useState<{ eligible: boolean; percent: number }>(
    { eligible: false, percent: 0 },
  );
  const [deliveryFeeAgorot, setDeliveryFeeAgorot] = useState(0);

  useEffect(() => {
    getFirstPurchaseDiscountPreview().then(setDiscount);
    getDeliveryFee().then(setDeliveryFeeAgorot);
  }, []);

  const discountAgorot = discount.eligible
    ? Math.round((subtotalAgorot * discount.percent) / 100)
    : 0;
  const totalAfterDiscount = subtotalAgorot - discountAgorot;
  const deliveryAgorot = fulfillmentType === "delivery" ? deliveryFeeAgorot : 0;
  const grandTotal = totalAfterDiscount + deliveryAgorot;

  if (lines.length === 0) {
    return (
      <div className="mx-auto max-w-lg px-6 py-24 text-center">
        <p className="font-serif text-xl text-ivory">Votre panier est vide.</p>
        <Link
          href="/new"
          className="mt-6 inline-block rounded-full border border-champagne/50 px-6 py-3 text-sm text-champagne transition-colors hover:bg-champagne hover:text-obsidian"
        >
          Découvrir la boutique
        </Link>
      </div>
    );
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (hasAgeRestrictedItem && !ageSelfDeclared) {
      setError("Merci de confirmer que vous avez 18 ans ou plus.");
      return;
    }
    if (fulfillmentType === "delivery" && !deliveryAddress.trim()) {
      setError("Merci d'indiquer une adresse de livraison.");
      return;
    }

    setSubmitting(true);
    const result = await submitOrder({
      fulfillmentType,
      deliveryAddress: deliveryAddress || undefined,
      customerName,
      customerPhone,
      customerNotes: customerNotes || undefined,
      ageSelfDeclared,
      lines: lines.map((l) => ({
        variantId: l.variantId,
        quantity: l.quantity,
      })),
    });
    setSubmitting(false);

    if (!result.success || !result.orderId) {
      setError(result.error ?? "Une erreur est survenue.");
      return;
    }

    clear();
    router.push(`/orders/${result.orderId}`);
  }

  return (
    <div className="mx-auto max-w-3xl px-6 py-16 lg:px-8">
      <h1 className="font-serif text-3xl text-ivory sm:text-4xl">
        Finaliser la commande
      </h1>
      <p className="mt-2 text-sm text-muted-grey">
        Paiement au retrait en magasin ou directement auprès du livreur —
        aucun paiement n&rsquo;est effectué sur le site.
      </p>

      <form onSubmit={handleSubmit} className="mt-10 flex flex-col gap-8">
        <fieldset className="flex flex-col gap-3">
          <legend className="font-serif text-lg text-ivory">
            Mode de réception
          </legend>
          <div className="flex gap-3">
            {(["pickup", "delivery"] as const).map((type) => (
              <button
                key={type}
                type="button"
                onClick={() => setFulfillmentType(type)}
                className={`flex-1 rounded-sm border px-4 py-3 text-sm transition-colors ${
                  fulfillmentType === type
                    ? "border-champagne text-champagne"
                    : "border-white/10 text-ivory/70 hover:border-white/30"
                }`}
              >
                {type === "pickup" ? "Retrait en magasin" : "Livraison"}
              </button>
            ))}
          </div>
        </fieldset>

        {fulfillmentType === "delivery" && (
          <label className="flex flex-col gap-2 text-sm text-ivory/80">
            Adresse de livraison
            <textarea
              required
              rows={2}
              value={deliveryAddress}
              onChange={(e) => setDeliveryAddress(e.target.value)}
              className="rounded-sm border border-white/10 bg-graphite px-4 py-3 text-ivory outline-none focus:border-champagne"
              placeholder="Rue, numéro, étage, ville"
            />
          </label>
        )}

        <div className="grid gap-4 sm:grid-cols-2">
          <label className="flex flex-col gap-2 text-sm text-ivory/80">
            Nom complet
            <input
              type="text"
              required
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              className="rounded-sm border border-white/10 bg-graphite px-4 py-3 text-ivory outline-none focus:border-champagne"
            />
          </label>
          <label className="flex flex-col gap-2 text-sm text-ivory/80">
            Téléphone
            <input
              type="tel"
              required
              value={customerPhone}
              onChange={(e) => setCustomerPhone(e.target.value)}
              className="rounded-sm border border-white/10 bg-graphite px-4 py-3 text-ivory outline-none focus:border-champagne"
            />
          </label>
        </div>

        <label className="flex flex-col gap-2 text-sm text-ivory/80">
          Note pour le staff (optionnel)
          <textarea
            rows={2}
            value={customerNotes}
            onChange={(e) => setCustomerNotes(e.target.value)}
            className="rounded-sm border border-white/10 bg-graphite px-4 py-3 text-ivory outline-none focus:border-champagne"
            placeholder="Créneau souhaité, instructions particulières..."
          />
        </label>

        {hasAgeRestrictedItem && (
          <label className="flex items-start gap-3 rounded-sm border border-amber-400/40 bg-amber-400/5 px-4 py-4 text-sm text-amber-200">
            <input
              type="checkbox"
              checked={ageSelfDeclared}
              onChange={(e) => setAgeSelfDeclared(e.target.checked)}
              className="mt-0.5 h-4 w-4"
            />
            <span className="flex items-start gap-2">
              <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
              Je certifie avoir 18 ans ou plus. Une pièce d&rsquo;identité
              pourra être demandée au retrait ou à la livraison.
            </span>
          </label>
        )}

        {discount.eligible && (
          <div className="flex items-center gap-2 rounded-sm border border-champagne/40 bg-champagne/5 px-4 py-3 text-sm text-champagne">
            <Sparkles className="h-4 w-4 shrink-0" aria-hidden />
            Réduction de bienvenue -{discount.percent}% appliquée
            automatiquement sur cette première commande.
          </div>
        )}

        <div className="flex flex-col gap-1 border-t border-white/5 pt-6">
          {discount.eligible && (
            <div className="flex items-center justify-between text-sm text-ivory/60">
              <span>Sous-total</span>
              <span>{formatAgorot(subtotalAgorot)}</span>
            </div>
          )}
          {discount.eligible && (
            <div className="flex items-center justify-between text-sm text-champagne">
              <span>Réduction bienvenue</span>
              <span>-{formatAgorot(discountAgorot)}</span>
            </div>
          )}
          {deliveryAgorot > 0 && (
            <div className="flex items-center justify-between text-sm text-ivory/60">
              <span>Livraison</span>
              <span>{formatAgorot(deliveryAgorot)}</span>
            </div>
          )}
          <div className="flex items-center justify-between">
            <span className="text-sm text-ivory/70">Total</span>
            <span className="font-serif text-2xl text-champagne">
              {formatAgorot(grandTotal)}
            </span>
          </div>
        </div>

        {error && <p className="text-sm text-amber-400">{error}</p>}

        <button
          type="submit"
          disabled={submitting}
          className="rounded-full bg-champagne px-8 py-3 text-sm font-semibold tracking-wide text-obsidian transition-colors hover:bg-soft-gold disabled:opacity-50"
        >
          {submitting ? "Envoi..." : "Confirmer la commande"}
        </button>
      </form>
    </div>
  );
}
