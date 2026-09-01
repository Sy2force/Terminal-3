"use client";

import { useState, useTransition } from "react";
import { CheckCircle, Clock, ShieldAlert, ShieldCheck, XCircle } from "lucide-react";
import {
  markPaidInStoreAction,
  markIdCheckedAction,
  closeOrderAction,
  setReadyEstimateAction,
} from "@/app/admin/orders/[id]/pickup-actions";

const PRESET_ESTIMATES = [
  { label: "15 min", minutes: 15 },
  { label: "30 min", minutes: 30 },
  { label: "45 min", minutes: 45 },
  { label: "1 h", minutes: 60 },
  { label: "2 h", minutes: 120 },
];

const PAYMENT_METHODS = [
  { value: "cash", label: "Espèces" },
  { value: "card", label: "Carte" },
  { value: "bit", label: "Bit" },
  { value: "other", label: "Autre" },
] as const;

export function PickupClosurePanel({
  orderId,
  currentStatus,
  paymentStatus,
  paymentMethodActual,
  paidAt,
  idCheckedAt,
  hasAgeRestrictedItem,
  readyEstimateLabel,
}: {
  orderId: string;
  currentStatus: string;
  paymentStatus: string;
  paymentMethodActual: string | null;
  paidAt: string | null;
  idCheckedAt: string | null;
  hasAgeRestrictedItem: boolean;
  readyEstimateLabel: string | null;
}) {
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<"cash" | "card" | "bit" | "other">(
    (paymentMethodActual as "cash" | "card" | "bit" | "other" | null) ?? "cash",
  );

  const isCompleted = currentStatus === "completed" || currentStatus === "cancelled";
  const isPaid = paymentStatus === "paid_in_store";
  const isIdOk = !hasAgeRestrictedItem || Boolean(idCheckedAt);
  const canClose = !isCompleted && isPaid && isIdOk;

  function run(fn: () => Promise<{ success: boolean; error?: string }>, okMessage?: string) {
    setError(null);
    setNotice(null);
    startTransition(async () => {
      const result = await fn();
      if (!result.success) {
        setError(result.error ?? "Erreur.");
        return;
      }
      if (okMessage) setNotice(okMessage);
    });
  }

  function applyEstimate(minutes: number, label: string) {
    const at = new Date(Date.now() + minutes * 60_000);
    run(() =>
      setReadyEstimateAction({ orderId, label, atIso: at.toISOString() }),
      `Estimation "${label}" enregistrée.`,
    );
  }

  return (
    <section className="rounded-sm border border-[#E7DECE] bg-white p-6">
      <h3 className="font-serif text-lg text-[#151411]">
        Clôture au retrait
      </h3>
      <p className="mt-1 text-xs text-[#71695F]">
        Le paiement s&rsquo;effectue exclusivement en magasin. Pour les commandes
        contenant de l&rsquo;alcool, un contrôle physique de la pièce d&rsquo;identité est
        obligatoire avant remise.
      </p>

      {/* Ready estimate */}
      <div className="mt-4 border-t border-[#E7DECE] pt-4">
        <p className="text-xs uppercase tracking-widest text-[#71695F]">
          <Clock className="mr-1 inline h-3 w-3" /> Estimation
        </p>
        <p className="mt-1 text-sm text-[#151411]">
          {readyEstimateLabel ? (
            <>Estimation actuelle : <strong>{readyEstimateLabel}</strong></>
          ) : (
            "Aucune estimation communiquée au client."
          )}
        </p>
        <div className="mt-2 flex flex-wrap gap-1.5">
          {PRESET_ESTIMATES.map((p) => (
            <button
              key={p.label}
              type="button"
              disabled={pending || isCompleted}
              onClick={() => applyEstimate(p.minutes, p.label)}
              className="rounded-sm border border-[#E7DECE] px-3 py-1.5 text-xs text-[#151411] hover:border-[#C6A15B] disabled:opacity-50"
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      {/* Payment gate */}
      <div className="mt-4 border-t border-[#E7DECE] pt-4">
        <p className="text-xs uppercase tracking-widest text-[#71695F]">Paiement en magasin</p>
        {isPaid ? (
          <p className="mt-1 text-sm text-emerald-700">
            <CheckCircle className="mr-1 inline h-4 w-4" />
            Encaissé
            {paymentMethodActual && ` (${paymentMethodActual})`}
            {paidAt && ` le ${new Date(paidAt).toLocaleString("fr-FR")}`}
          </p>
        ) : (
          <>
            <div className="mt-2 flex flex-wrap items-center gap-2">
              {PAYMENT_METHODS.map((m) => (
                <label
                  key={m.value}
                  className={`flex cursor-pointer items-center gap-1.5 rounded-sm border px-3 py-1.5 text-xs ${
                    paymentMethod === m.value
                      ? "border-[#C6A15B] bg-[#C6A15B]/10 text-[#7C5129]"
                      : "border-[#E7DECE] text-[#151411]"
                  }`}
                >
                  <input
                    type="radio"
                    name={`pm-${orderId}`}
                    className="hidden"
                    checked={paymentMethod === m.value}
                    onChange={() => setPaymentMethod(m.value)}
                  />
                  {m.label}
                </label>
              ))}
              <button
                type="button"
                disabled={pending || isCompleted}
                onClick={() =>
                  run(
                    () =>
                      markPaidInStoreAction({ orderId, method: paymentMethod }),
                    "Paiement en magasin confirmé.",
                  )
                }
                className="ml-auto rounded-sm bg-[#692031] px-4 py-2 text-xs font-medium uppercase tracking-widest text-[#F7F0E4] hover:bg-[#551525] disabled:opacity-50"
              >
                Marquer payé
              </button>
            </div>
            <p className="mt-2 text-xs text-[#71695F]">
              Ne pas utiliser pour un paiement en ligne — Terminal 3 n&rsquo;encaisse pas via le site.
            </p>
          </>
        )}
      </div>

      {/* ID check gate */}
      {hasAgeRestrictedItem && (
        <div className="mt-4 border-t border-[#E7DECE] pt-4">
          <p className="text-xs uppercase tracking-widest text-[#71695F]">
            <ShieldAlert className="mr-1 inline h-3 w-3" /> Contrôle 18+
          </p>
          {isIdOk ? (
            <p className="mt-1 text-sm text-emerald-700">
              <ShieldCheck className="mr-1 inline h-4 w-4" />
              Pièce d&rsquo;identité contrôlée
              {idCheckedAt && ` le ${new Date(idCheckedAt).toLocaleString("fr-FR")}`}
            </p>
          ) : (
            <>
              <p className="mt-1 text-sm text-[#151411]">
                Vérifiez la Teudat Zehut ou le passeport du client (18 ans ou plus) avant remise.
              </p>
              <button
                type="button"
                disabled={pending || isCompleted}
                onClick={() =>
                  run(
                    () => markIdCheckedAction({ orderId }),
                    "Contrôle d'âge enregistré.",
                  )
                }
                className="mt-2 rounded-sm bg-[#692031] px-4 py-2 text-xs font-medium uppercase tracking-widest text-[#F7F0E4] hover:bg-[#551525] disabled:opacity-50"
              >
                Pièce d&rsquo;identité contrôlée — client 18+
              </button>
            </>
          )}
        </div>
      )}

      {/* Close order */}
      <div className="mt-4 border-t border-[#E7DECE] pt-4">
        <p className="text-xs uppercase tracking-widest text-[#71695F]">Récupération</p>
        <button
          type="button"
          disabled={pending || !canClose}
          onClick={() =>
            run(
              () => closeOrderAction({ orderId }),
              "Commande clôturée.",
            )
          }
          className="mt-2 inline-flex items-center gap-1.5 rounded-sm border border-emerald-600 bg-emerald-50 px-4 py-2 text-sm font-medium uppercase tracking-widest text-emerald-800 hover:bg-emerald-100 disabled:opacity-50"
        >
          <CheckCircle className="h-4 w-4" /> Marquer comme récupérée
        </button>
        {!canClose && !isCompleted && (
          <p className="mt-2 flex items-start gap-1.5 text-xs text-amber-700">
            <XCircle className="mt-0.5 h-3.5 w-3.5" />
            {!isPaid
              ? "Confirmez d'abord le paiement en magasin."
              : "Contrôlez d'abord la pièce d'identité (18+)."}
          </p>
        )}
      </div>

      {(error || notice) && (
        <div className="mt-4 rounded-sm border border-[#E7DECE] bg-[#F4EFE5] p-2 text-xs">
          {error && <p className="text-amber-700">{error}</p>}
          {notice && <p className="text-emerald-700">{notice}</p>}
        </div>
      )}
    </section>
  );
}
