"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { AlertTriangle, Sparkles, ShoppingBag, CheckCircle, ShieldAlert, Clock } from "lucide-react";
import { useCart } from "@/lib/cart/cart-context";
import { formatAgorot } from "@/lib/money";
import { DEFAULT_BUSINESS_CONFIG } from "@/lib/config";
import {
  getFirstPurchaseDiscountPreview,
  getDeliveryFee,
  getMyCheckoutEligibility,
  submitOrder,
} from "@/app/checkout/actions";

const TIME_SLOTS = [
  "09:00 – 12:00",
  "12:00 – 15:00",
  "15:00 – 18:00",
  "18:00 – 20:00",
];

export default function CheckoutPage() {
  const router = useRouter();
  const { lines, subtotalAgorot, hasAgeRestrictedItem, clear } = useCart();
  const [eligibility, setEligibility] = useState<{
    authenticated: boolean;
    status: "pending_verification" | "verified" | "rejected" | "suspended" | null;
  } | null>(null);

  const [fulfillmentType, setFulfillmentType] = useState<"pickup" | "delivery">(
    "pickup",
  );
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [deliveryAddress, setDeliveryAddress] = useState("");
  const [city, setCity] = useState("");
  const [floor, setFloor] = useState("");
  const [entryCode, setEntryCode] = useState("");
  const [deliveryInstructions, setDeliveryInstructions] = useState("");
  const [desiredDate, setDesiredDate] = useState("");
  const [timeSlot, setTimeSlot] = useState("");
  const [customerNotes, setCustomerNotes] = useState("");
  const [ageSelfDeclared, setAgeSelfDeclared] = useState(false);
  const [idWillBeShown, setIdWillBeShown] = useState(false);
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [captchaA] = useState(() => Math.floor(Math.random() * 5) + 2);
  const [captchaB] = useState(() => Math.floor(Math.random() * 5) + 2);
  const [captchaInput, setCaptchaInput] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [discount, setDiscount] = useState<{ eligible: boolean; percent: number }>(
    { eligible: false, percent: 0 },
  );
  const [deliveryFeeAgorot, setDeliveryFeeAgorot] = useState(0);

  useEffect(() => {
    getFirstPurchaseDiscountPreview().then(setDiscount);
    getDeliveryFee().then(setDeliveryFeeAgorot);
    getMyCheckoutEligibility().then(setEligibility);
  }, []);

  const discountAgorot = discount.eligible
    ? Math.round((subtotalAgorot * discount.percent) / 100)
    : 0;
  const totalAfterDiscount = subtotalAgorot - discountAgorot;
  const deliveryAgorot = fulfillmentType === "delivery" ? deliveryFeeAgorot : 0;
  const grandTotal = totalAfterDiscount + deliveryAgorot;

  if (submitted) {
    return (
      <div className="min-h-screen bg-fond-papier">
        <div className="mx-auto flex max-w-lg flex-col items-center gap-6 px-6 py-24 text-center">
          <CheckCircle className="h-12 w-12 text-bordeaux-principal" aria-hidden />
          <h1 className="font-serif text-2xl text-noir-profond">Commande prête pour WhatsApp</h1>
          <p className="text-noir-profond/70">
            Une conversation WhatsApp a été ouverte avec Terminal 3. Envoyez le message pour finaliser
            votre commande. Le paiement se fera en espèces au magasin ou au livreur.
          </p>
          <Link
            href="/vins"
            className="rounded-sm bg-bordeaux-principal px-6 py-3 text-sm font-medium uppercase tracking-widest text-texte-clair transition-colors hover:bg-bordeaux-fonce"
          >
            Continuer mes achats
          </Link>
        </div>
      </div>
    );
  }

  if (lines.length === 0) {
    return (
      <div className="min-h-screen bg-fond-papier">
        <div className="mx-auto flex max-w-lg flex-col items-center gap-6 px-6 py-24 text-center">
          <ShoppingBag className="h-8 w-8 text-brun-cave/40" aria-hidden />
          <p className="font-serif text-xl text-noir-profond">Votre panier est vide.</p>
          <Link
            href="/vins"
            className="rounded-sm bg-bordeaux-principal px-6 py-3 text-sm font-medium uppercase tracking-widest text-texte-clair transition-colors hover:bg-bordeaux-fonce"
          >
            Découvrir la cave
          </Link>
        </div>
      </div>
    );
  }

  if (eligibility && !eligibility.authenticated) {
    return (
      <div className="min-h-screen bg-fond-papier">
        <div className="mx-auto flex max-w-lg flex-col items-center gap-6 px-6 py-24 text-center">
          <ShieldAlert className="h-10 w-10 text-bordeaux-principal" aria-hidden />
          <h1 className="font-serif text-2xl text-noir-profond">Connexion requise</h1>
          <p className="text-noir-profond/70">
            Créez un compte ou connectez-vous pour finaliser votre commande. Un compte vérifié est
            nécessaire pour commander sur Terminal 3.
          </p>
          <div className="flex gap-3">
            <Link href="/inscription?redirect=/checkout" className="rounded-sm bg-bordeaux-principal px-6 py-3 text-sm font-medium uppercase tracking-widest text-texte-clair transition-colors hover:bg-bordeaux-fonce">
              Créer un compte
            </Link>
            <Link href="/login?redirect=/checkout" className="rounded-sm border border-bordeaux-principal px-6 py-3 text-sm font-medium uppercase tracking-widest text-bordeaux-principal transition-colors hover:bg-bordeaux-principal/5">
              Se connecter
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (eligibility && eligibility.authenticated && eligibility.status !== "verified") {
    return (
      <div className="min-h-screen bg-fond-papier">
        <div className="mx-auto flex max-w-lg flex-col items-center gap-6 px-6 py-24 text-center">
          <Clock className="h-10 w-10 text-bordeaux-principal" aria-hidden />
          <h1 className="font-serif text-2xl text-noir-profond">
            {eligibility.status === "rejected" ? "Vérification à refaire" : "Compte en cours de vérification"}
          </h1>
          <p className="text-noir-profond/70">
            {eligibility.status === "rejected"
              ? "Votre justificatif d'identité a été refusé. Merci d'en envoyer un nouveau pour pouvoir commander."
              : "Votre compte doit être vérifié par notre équipe avant de pouvoir commander. Cela prend généralement moins de 24h ouvrées."}
          </p>
          <Link
            href="/compte/verification"
            className="rounded-sm bg-bordeaux-principal px-6 py-3 text-sm font-medium uppercase tracking-widest text-texte-clair transition-colors hover:bg-bordeaux-fonce"
          >
            Voir ma vérification
          </Link>
        </div>
      </div>
    );
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (Number(captchaInput) !== captchaA + captchaB) {
      setError("Vérification anti-robot incorrecte.");
      return;
    }
    if (hasAgeRestrictedItem && (!ageSelfDeclared || !idWillBeShown)) {
      setError("Pour tout achat d'alcool, vous devez confirmer être majeur et accepter de présenter une pièce d'identité valide.");
      return;
    }
    if (fulfillmentType === "delivery" && !deliveryAddress.trim()) {
      setError("Merci d'indiquer une adresse de livraison.");
      return;
    }
    if (!termsAccepted) {
      setError("Merci d'accepter les conditions pour continuer.");
      return;
    }

    setSubmitting(true);

    // The order is created and persisted in the database FIRST — the
    // WhatsApp message is only opened afterwards, using the real order id
    // and server-computed totals, so nothing is lost if the customer closes
    // the WhatsApp window.
    const result = await submitOrder({
      fulfillmentType,
      deliveryAddress: deliveryAddress || undefined,
      city: city || undefined,
      floor: floor || undefined,
      entryCode: entryCode || undefined,
      deliveryInstructions: deliveryInstructions || undefined,
      desiredDate: desiredDate || undefined,
      timeSlot: timeSlot || undefined,
      customerName,
      customerPhone,
      customerNotes: customerNotes || undefined,
      ageSelfDeclared,
      termsAccepted,
      lines: lines.map((l) => ({ variantId: l.variantId, quantity: l.quantity })),
    });

    if (!result.success || !result.orderId) {
      setSubmitting(false);
      setError(result.error ?? "Une erreur est survenue.");
      return;
    }

    const orderRef = result.orderId.slice(0, 8).toUpperCase();
    const linesText = lines
      .map(
        (l) =>
          `• ${l.productName}${l.variantLabel ? ` (${l.variantLabel})` : ""} — Qté ${l.quantity}`
      )
      .join("\n");

    const message = [
      `Bonjour ${DEFAULT_BUSINESS_CONFIG.STORE_NAME},`,
      `je souhaite confirmer la commande #${orderRef}.`,
      "",
      linesText,
      "",
      `Total : ${formatAgorot(result.totalAgorot ?? grandTotal)}`,
      `Mode : ${fulfillmentType === "pickup" ? "Retrait en magasin" : "Livraison"}`,
      fulfillmentType === "delivery" ? `Adresse : ${deliveryAddress}${city ? `, ${city}` : ""}` : null,
      timeSlot ? `Créneau demandé : ${timeSlot}` : null,
      "",
      "Merci de confirmer la disponibilité et le délai.",
    ]
      .filter(Boolean)
      .join("\n");

    const phone = DEFAULT_BUSINESS_CONFIG.STORE_WHATSAPP.replace(/[^\d]/g, "");
    const url = `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
    window.open(url, "_blank", "noopener,noreferrer");

    clear();
    setSubmitting(false);
    setSubmitted(true);
    router.push(`/orders/${result.orderId}`);
  }

  return (
    <div className="min-h-screen bg-fond-papier">
      <div className="border-b border-brun-cave/15 bg-noir-chaud py-14 sm:py-16">
        <div className="mx-auto max-w-[1440px] px-4 sm:px-6 lg:px-8">
          <p className="text-xs uppercase tracking-[0.3em] text-or-principal">Étape finale</p>
          <h1 className="mt-3 font-serif text-4xl leading-tight text-texte-clair sm:text-5xl">
            Finaliser la commande
          </h1>
          <p className="mt-2 max-w-lg text-sm text-texte-clair/70">
            Paiement comptant au retrait en boutique ou directement auprès du livreur.
            Une pièce d&rsquo;identité (Teudat Zehut ou passeport) sera vérifiée obligatoirement pour
            tout achat d&rsquo;alcool — aucun paiement en ligne n&rsquo;est effectué sur le site.
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="mx-auto max-w-3xl px-4 py-14 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-8">
          <fieldset className="flex flex-col gap-3">
            <legend className="font-serif text-lg text-noir-profond">Mode de réception</legend>
            <div className="flex gap-3">
              {(["pickup", "delivery"] as const).map((type) => (
                <button
                  key={type}
                  type="button"
                  onClick={() => setFulfillmentType(type)}
                  aria-pressed={fulfillmentType === type}
                  className={`flex-1 rounded-sm border px-4 py-3 text-sm transition-colors ${
                    fulfillmentType === type
                      ? "border-bordeaux-principal bg-bordeaux-principal text-texte-clair"
                      : "border-brun-cave/25 text-noir-profond hover:border-bordeaux-principal/60"
                  }`}
                >
                  {type === "pickup" ? "Retrait en magasin" : "Livraison à Jérusalem"}
                </button>
              ))}
            </div>
          </fieldset>

          {fulfillmentType === "delivery" && (
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="flex flex-col gap-2 text-sm text-noir-profond sm:col-span-2">
                Adresse de livraison
                <textarea
                  required
                  rows={2}
                  value={deliveryAddress}
                  onChange={(e) => setDeliveryAddress(e.target.value)}
                  className="rounded-sm border border-brun-cave/25 bg-white px-4 py-3 text-noir-profond outline-none focus:border-bordeaux-principal"
                  placeholder="Rue, numéro"
                />
              </label>
              <label className="flex flex-col gap-2 text-sm text-noir-profond">
                Ville
                <input
                  type="text"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  className="rounded-sm border border-brun-cave/25 bg-white px-4 py-3 text-noir-profond outline-none focus:border-bordeaux-principal"
                  placeholder="Jérusalem"
                />
              </label>
              <label className="flex flex-col gap-2 text-sm text-noir-profond">
                Étage (facultatif)
                <input
                  type="text"
                  value={floor}
                  onChange={(e) => setFloor(e.target.value)}
                  className="rounded-sm border border-brun-cave/25 bg-white px-4 py-3 text-noir-profond outline-none focus:border-bordeaux-principal"
                />
              </label>
              <label className="flex flex-col gap-2 text-sm text-noir-profond">
                Code d&rsquo;entrée (facultatif)
                <input
                  type="text"
                  value={entryCode}
                  onChange={(e) => setEntryCode(e.target.value)}
                  className="rounded-sm border border-brun-cave/25 bg-white px-4 py-3 text-noir-profond outline-none focus:border-bordeaux-principal"
                />
              </label>
              <label className="flex flex-col gap-2 text-sm text-noir-profond">
                Instructions de livraison (facultatif)
                <input
                  type="text"
                  value={deliveryInstructions}
                  onChange={(e) => setDeliveryInstructions(e.target.value)}
                  className="rounded-sm border border-brun-cave/25 bg-white px-4 py-3 text-noir-profond outline-none focus:border-bordeaux-principal"
                />
              </label>
            </div>
          )}

          <div className="grid gap-4 sm:grid-cols-2">
            <label className="flex flex-col gap-2 text-sm text-noir-profond">
              Date souhaitée (facultatif)
              <input
                type="date"
                value={desiredDate}
                onChange={(e) => setDesiredDate(e.target.value)}
                className="rounded-sm border border-brun-cave/25 bg-white px-4 py-3 text-noir-profond outline-none focus:border-bordeaux-principal"
              />
            </label>
            <label className="flex flex-col gap-2 text-sm text-noir-profond">
              Créneau souhaité (facultatif)
              <select
                value={timeSlot}
                onChange={(e) => setTimeSlot(e.target.value)}
                className="rounded-sm border border-brun-cave/25 bg-white px-4 py-3 text-noir-profond outline-none focus:border-bordeaux-principal"
              >
                <option value="">Sans préférence</option>
                {TIME_SLOTS.map((slot) => (
                  <option key={slot} value={slot}>
                    {slot}
                  </option>
                ))}
              </select>
            </label>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <label className="flex flex-col gap-2 text-sm text-noir-profond">
              Nom complet
              <input
                type="text"
                required
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                className="rounded-sm border border-brun-cave/25 bg-white px-4 py-3 text-noir-profond outline-none focus:border-bordeaux-principal"
              />
            </label>
            <label className="flex flex-col gap-2 text-sm text-noir-profond">
              Téléphone
              <input
                type="tel"
                required
                value={customerPhone}
                onChange={(e) => setCustomerPhone(e.target.value)}
                className="rounded-sm border border-brun-cave/25 bg-white px-4 py-3 text-noir-profond outline-none focus:border-bordeaux-principal"
              />
            </label>
          </div>

          <label className="flex flex-col gap-2 text-sm text-noir-profond">
            Commentaire (facultatif)
            <textarea
              rows={2}
              value={customerNotes}
              onChange={(e) => setCustomerNotes(e.target.value)}
              className="rounded-sm border border-brun-cave/25 bg-white px-4 py-3 text-noir-profond outline-none focus:border-bordeaux-principal"
              placeholder="Instructions particulières..."
            />
          </label>

          {hasAgeRestrictedItem && (
            <div className="rounded-sm border border-bordeaux-principal/30 bg-bordeaux-principal/5 p-4">
              <p className="mb-3 flex items-center gap-2 text-sm font-medium text-bordeaux-principal">
                <AlertTriangle className="h-4 w-4" aria-hidden />
                Vérification obligatoire pour les alcools
              </p>
              <div className="space-y-3">
                <label className="flex items-start gap-3 text-sm text-noir-profond">
                  <input
                    type="checkbox"
                    checked={ageSelfDeclared}
                    onChange={(e) => setAgeSelfDeclared(e.target.checked)}
                    className="mt-0.5 h-4 w-4"
                  />
                  <span>Je certifie avoir 18 ans ou plus.</span>
                </label>
                <label className="flex items-start gap-3 text-sm text-noir-profond">
                  <input
                    type="checkbox"
                    checked={idWillBeShown}
                    onChange={(e) => setIdWillBeShown(e.target.checked)}
                    className="mt-0.5 h-4 w-4"
                  />
                  <span>
                    J&rsquo;accepte de présenter ma pièce d&rsquo;identité en cours de validité
                    (Teudat Zehut ou passeport) au retrait ou à la livraison. Aucun alcool ne sera
                    remis sans ce contrôle.
                  </span>
                </label>
              </div>
            </div>
          )}

          <div>
            <label className="mb-1.5 block text-sm font-medium text-noir-profond">
              Vérification : combien font {captchaA} + {captchaB} ?
            </label>
            <input
              type="number"
              value={captchaInput}
              onChange={(e) => setCaptchaInput(e.target.value)}
              className="w-32 rounded-sm border border-brun-cave/25 bg-white px-4 py-3 text-noir-profond outline-none focus:border-bordeaux-principal"
              placeholder="Réponse"
            />
            <p className="mt-1 text-xs text-noir-profond/60">
              Cette vérification prouve que vous êtes une vraie personne.
            </p>
          </div>

          <label className="flex items-start gap-3 text-sm text-noir-profond">
            <input
              type="checkbox"
              checked={termsAccepted}
              onChange={(e) => setTermsAccepted(e.target.checked)}
              className="mt-0.5 h-4 w-4"
              required
            />
            <span>
              J&rsquo;accepte les{" "}
              <Link href="/conditions" className="text-bordeaux-principal underline-offset-2 hover:underline">
                conditions générales
              </Link>{" "}
              et je comprends que cette commande reste soumise à confirmation du magasin. Le règlement
              se fera en espèces au retrait en boutique ou au livreur, et une pièce d&rsquo;identité
              sera contrôlée pour tout achat d&rsquo;alcool.
            </span>
          </label>

          {discount.eligible && (
            <div className="flex items-center gap-2 rounded-sm border border-or-principal/40 bg-or-principal/5 px-4 py-3 text-sm text-noir-profond">
              <Sparkles className="h-4 w-4 shrink-0 text-or-principal" aria-hidden />
              Réduction de bienvenue -{discount.percent}% appliquée automatiquement sur cette
              première commande.
            </div>
          )}

          <div className="flex flex-col gap-1 border-t border-brun-cave/15 pt-6">
            {discount.eligible && (
              <div className="flex items-center justify-between text-sm text-gris-chaud">
                <span>Sous-total</span>
                <span>{formatAgorot(subtotalAgorot)}</span>
              </div>
            )}
            {discount.eligible && (
              <div className="flex items-center justify-between text-sm text-or-principal">
                <span>Réduction bienvenue</span>
                <span>-{formatAgorot(discountAgorot)}</span>
              </div>
            )}
            {deliveryAgorot > 0 && (
              <div className="flex items-center justify-between text-sm text-gris-chaud">
                <span>Livraison</span>
                <span>{formatAgorot(deliveryAgorot)}</span>
              </div>
            )}
            <div className="flex items-center justify-between">
              <span className="text-sm text-noir-profond/80">Total estimé</span>
              <span className="font-serif text-2xl text-bordeaux-principal">
                {formatAgorot(grandTotal)}
              </span>
            </div>
          </div>

          {error && <p className="text-sm text-bordeaux-principal">{error}</p>}

          <button
            type="submit"
            disabled={submitting}
            className="rounded-sm bg-bordeaux-principal px-8 py-3.5 text-sm font-medium uppercase tracking-widest text-texte-clair transition-colors hover:bg-bordeaux-fonce disabled:cursor-not-allowed disabled:opacity-50"
          >
            {submitting ? "Envoi..." : "Confirmer la commande"}
          </button>
        </div>
      </form>
    </div>
  );
}
