"use client";

import { useState } from "react";
import { confirmOrderPaymentAction, addOrderNoteAction } from "@/app/admin/orders/[id]/actions";
import { formatAgorot } from "@/lib/money";
import type { PaymentRow, PaymentStatusHistoryRow, OrderNoteRow, OrderStatusHistoryRow } from "@/types/database";
import type { PaymentMethod } from "@/types/database";
import { paymentMethodLabel } from "@/lib/payment-labels";
import { orderStatusLabel } from "@/lib/order-status-labels";

interface PaymentAndNotesProps {
  orderId: string;
  summary: { total_agorot: number; collected_agorot: number; remaining_agorot: number; status: string };
  payments: PaymentRow[];
  paymentHistory: PaymentStatusHistoryRow[];
  notes: OrderNoteRow[];
  statusHistory: OrderStatusHistoryRow[];
}

export function OrderPaymentAndNotes({
  orderId,
  summary,
  payments,
  paymentHistory,
  notes,
  statusHistory,
}: PaymentAndNotesProps) {
  const [paymentMessage, setPaymentMessage] = useState<string | null>(null);
  const [noteMessage, setNoteMessage] = useState<string | null>(null);
  const [amountNis, setAmountNis] = useState("");
  const [method, setMethod] = useState<PaymentMethod>("cash_store");
  const [reference, setReference] = useState("");
  const [note, setNote] = useState("");
  const [pending, setPending] = useState(false);

  const amountAgorot = Math.round(parseFloat(amountNis || "0") * 100);

  async function handlePayment(e: React.FormEvent) {
    e.preventDefault();
    setPending(true);
    setPaymentMessage(null);
    const idempotencyKey = `${orderId}-${Date.now()}`;
    const result = await confirmOrderPaymentAction({
      orderId,
      amount_agorot: amountAgorot,
      method,
      reference,
      notes: "",
      idempotencyKey,
    });
    setPending(false);
    setPaymentMessage(
      result.success
        ? "Encaissement enregistré."
        : result.error === "amount_exceeds_remaining"
          ? "Le montant dépasse le reste à payer."
          : result.error || "Échec de l'encaissement.",
    );
    if (result.success) {
      setAmountNis("");
      setReference("");
    }
  }

  async function handleNote(e: React.FormEvent) {
    e.preventDefault();
    setPending(true);
    setNoteMessage(null);
    const result = await addOrderNoteAction({ orderId, note });
    setPending(false);
    setNoteMessage(result.success ? "Note ajoutée." : result.error || "Échec de l'ajout.");
    if (result.success) setNote("");
  }

  return (
    <div className="space-y-8">
      <section className="rounded-sm border border-beige-fonce bg-creme p-4">
        <h2 className="font-serif text-xl text-noir-profond">Paiement</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-3">
          <div>
            <span className="text-xs uppercase tracking-widest text-gris-chaud">Total</span>
            <p className="text-noir-profond">{formatAgorot(summary.total_agorot)}</p>
          </div>
          <div>
            <span className="text-xs uppercase tracking-widest text-gris-chaud">Encaissé</span>
            <p className="text-green-400">{formatAgorot(summary.collected_agorot)}</p>
          </div>
          <div>
            <span className="text-xs uppercase tracking-widest text-gris-chaud">Reste</span>
            <p className="text-noir-profond">{formatAgorot(summary.remaining_agorot)}</p>
          </div>
        </div>

        {payments.length > 0 && (
          <ul className="mt-4 divide-y divide-beige-fonce">
            {payments.map((p) => (
              <li key={p.id} className="py-2 text-sm">
                <span className="text-noir-profond/80">{paymentMethodLabel(p.method)}</span>
                <span className="ml-2 text-noir-profond">{formatAgorot(p.amount_agorot)}</span>
                {p.reference && <span className="ml-2 text-gris-chaud">Ref: {p.reference}</span>}
              </li>
            ))}
          </ul>
        )}

        {summary.remaining_agorot > 0 && (
          <form onSubmit={handlePayment} className="mt-6 grid gap-3 sm:grid-cols-4">
            <input
              type="number"
              step="0.01"
              min="0.01"
              max={summary.remaining_agorot / 100}
              required
              value={amountNis}
              onChange={(e) => setAmountNis(e.target.value)}
              placeholder="Montant (₪)"
              className="rounded-sm border border-beige-fonce bg-noir-profond px-3 py-2 text-sm text-noir-profond"
            />
            <select
              value={method}
              onChange={(e) => setMethod(e.target.value as PaymentMethod)}
              className="rounded-sm border border-beige-fonce bg-noir-profond px-3 py-2 text-sm text-noir-profond"
            >
              <option value="cash_store">Espèces magasin</option>
              <option value="cash_delivery">Espèces livraison</option>
              <option value="card_store">Carte magasin</option>
              <option value="card_delivery">Carte livraison</option>
              <option value="manual">Autre</option>
            </select>
            <input
              type="text"
              value={reference}
              onChange={(e) => setReference(e.target.value)}
              placeholder="Référence (optionnel)"
              className="rounded-sm border border-beige-fonce bg-noir-profond px-3 py-2 text-sm text-noir-profond"
            />
            <button
              type="submit"
              disabled={pending}
              className="rounded-sm bg-bordeaux-principal px-4 py-2 text-sm text-noir-profond hover:bg-bordeaux-fonce disabled:opacity-50"
            >
              {pending ? "..." : "Confirmer"}
            </button>
          </form>
        )}
        {paymentMessage && <p className="mt-2 text-sm text-noir-profond/70">{paymentMessage}</p>}
      </section>

      <section className="rounded-sm border border-beige-fonce bg-creme p-4">
        <h2 className="font-serif text-xl text-noir-profond">Historique de paiement</h2>
        {paymentHistory.length === 0 ? (
          <p className="mt-2 text-sm text-gris-chaud">Aucun mouvement.</p>
        ) : (
          <ul className="mt-2 divide-y divide-beige-fonce">
            {paymentHistory.map((h) => (
              <li key={h.id} className="py-2 text-sm">
                <span className="text-gris-chaud">{new Date(h.created_at).toLocaleString("fr-FR")}</span>
                <span className="ml-2 text-noir-profond/80">
                  {h.old_status ?? "—"} → {h.new_status}
                </span>
                <span className="ml-2 text-noir-profond">{formatAgorot(h.amount_agorot)}</span>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="rounded-sm border border-beige-fonce bg-creme p-4">
        <h2 className="font-serif text-xl text-noir-profond">Notes internes</h2>
        <form onSubmit={handleNote} className="mt-4 grid gap-2">
          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            rows={3}
            placeholder="Ajouter une note interne..."
            className="rounded-sm border border-beige-fonce bg-noir-profond px-3 py-2 text-sm text-noir-profond"
          />
          <button
            type="submit"
            disabled={pending}
            className="w-fit rounded-sm bg-bordeaux-principal px-4 py-2 text-sm text-noir-profond hover:bg-bordeaux-fonce disabled:opacity-50"
          >
            {pending ? "..." : "Ajouter"}
          </button>
        </form>
        {noteMessage && <p className="mt-2 text-sm text-noir-profond/70">{noteMessage}</p>}
        {notes.length > 0 && (
          <ul className="mt-4 divide-y divide-beige-fonce">
            {notes.map((n) => (
              <li key={n.id} className="py-2 text-sm">
                <span className="text-gris-chaud">{new Date(n.created_at).toLocaleString("fr-FR")} — {n.author_name || "Staff"}</span>
                <p className="text-noir-profond/80">{n.note}</p>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="rounded-sm border border-beige-fonce bg-creme p-4">
        <h2 className="font-serif text-xl text-noir-profond">Historique des statuts</h2>
        {statusHistory.length === 0 ? (
          <p className="mt-2 text-sm text-gris-chaud">Aucun changement.</p>
        ) : (
          <ul className="mt-2 divide-y divide-beige-fonce">
            {statusHistory.map((h) => (
              <li key={h.id} className="py-2 text-sm">
                <span className="text-gris-chaud">{new Date(h.created_at).toLocaleString("fr-FR")}</span>
                <span className="ml-2 text-noir-profond/80">
                  {h.old_status ? orderStatusLabel(h.old_status) : "—"} → {orderStatusLabel(h.new_status)}
                </span>
                {h.changed_by_name && <span className="ml-2 text-gris-chaud">par {h.changed_by_name}</span>}
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
