"use client";

import { useRef } from "react";
import { Printer } from "lucide-react";
import { formatAgorot } from "@/lib/money";
import type { InvoiceRow } from "@/lib/data/invoices";
import type { OrderWithDetails } from "@/lib/data/orders-admin";

interface InvoicePreviewProps {
  invoice: InvoiceRow;
  order: OrderWithDetails;
}

export function InvoicePreview({ invoice, order }: InvoicePreviewProps) {
  const printRef = useRef<HTMLDivElement>(null);

  const items = order.fulfillment_groups.flatMap((g) => g.items);
  const isDraft = invoice.payment_status !== "paid";
  const totals = invoice.totals ?? { total_agorot: order.total_agorot, discount_agorot: order.discount_agorot };
  const discount = totals.discount_agorot ?? 0;
  const subtotal = items.reduce((sum, item) => sum + item.final_price_agorot_snapshot * item.quantity, 0);
  const delivery = Math.max(0, (totals.total_agorot ?? order.total_agorot) + discount - subtotal);
  const total = totals.total_agorot ?? order.total_agorot;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between print:hidden">
        <h1 className="font-serif text-2xl text-noir-profond">Aperçu facture {invoice.number}</h1>
        <button
          type="button"
          onClick={handlePrint}
          className="inline-flex items-center gap-2 rounded-sm border border-or-principal/40 px-4 py-2 text-sm font-medium text-or-principal transition-colors hover:bg-or-principal hover:text-noir-profond"
        >
          <Printer className="h-4 w-4" aria-hidden />
          Imprimer
        </button>
      </div>

      <div
        ref={printRef}
        className="rounded-sm border border-beige-fonce bg-white p-8 text-noir-profond shadow-sm print:w-full print:border-0 print:shadow-none print:p-0"
      >
        {isDraft && (
          <div className="mb-6 rounded-sm border border-amber-400/40 bg-amber-50 p-3 text-center text-sm font-medium text-amber-700">
            APERÇU — Ce document n&apos;est pas une facture fiscale finale tant que le paiement n&apos;est pas confirmé.
          </div>
        )}

        <div className="flex flex-col justify-between gap-4 sm:flex-row">
          <div>
            <h2 className="font-serif text-2xl font-bold">Terminal 3</h2>
            <p className="text-sm text-gris-chaud">Cave à vin et épicerie fine — Jérusalem</p>
          </div>
          <div className="text-right">
            <p className="font-serif text-xl font-bold">{invoice.number}</p>
            <p className="text-sm text-gris-chaud">
              Émise le {new Date(invoice.issued_at).toLocaleDateString("fr-FR")}
            </p>
            <p className="text-sm text-gris-chaud">Statut : {invoice.payment_status}</p>
          </div>
        </div>

        <div className="mt-8 grid gap-4 sm:grid-cols-2">
          <div>
            <h3 className="text-xs font-bold uppercase tracking-widest text-gris-chaud">Client</h3>
            <p className="mt-1 font-medium">{order.customer_name || "—"}</p>
            <p className="text-sm text-gris-chaud">{order.customer_phone || "—"}</p>
          </div>
          <div>
            <h3 className="text-xs font-bold uppercase tracking-widest text-gris-chaud">Adresse / Retrait</h3>
            <p className="mt-1 text-sm">
              {order.fulfillment_type === "delivery"
                ? [order.delivery_address, order.city].filter(Boolean).join(", ") || "—"
                : "Retrait au magasin"}
            </p>
          </div>
        </div>

        <table className="mt-8 w-full text-left text-sm">
          <thead>
            <tr className="border-b border-brun-cave/20 text-gris-chaud">
              <th className="py-2 font-normal">Produit</th>
              <th className="py-2 text-right font-normal">Qté</th>
              <th className="py-2 text-right font-normal">Prix unit.</th>
              <th className="py-2 text-right font-normal">Total</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item) => (
              <tr key={item.id} className="border-b border-brun-cave/10">
                <td className="py-2">
                  {item.product_name_snapshot}
                  {item.variant_label_snapshot ? ` — ${item.variant_label_snapshot}` : ""}
                </td>
                <td className="py-2 text-right">{item.quantity}</td>
                <td className="py-2 text-right">{formatAgorot(item.final_price_agorot_snapshot)}</td>
                <td className="py-2 text-right">{formatAgorot(item.final_price_agorot_snapshot * item.quantity)}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="mt-8 flex flex-col items-end gap-1 text-sm">
          <div className="flex w-full max-w-xs justify-between">
            <span className="text-gris-chaud">Sous-total</span>
            <span>{formatAgorot(subtotal)}</span>
          </div>
          {discount > 0 && (
            <div className="flex w-full max-w-xs justify-between text-green-700">
              <span>Réduction</span>
              <span>-{formatAgorot(discount)}</span>
            </div>
          )}
          <div className="flex w-full max-w-xs justify-between">
            <span className="text-gris-chaud">Livraison</span>
            <span>{formatAgorot(delivery)}</span>
          </div>
          <div className="mt-2 flex w-full max-w-xs justify-between border-t border-brun-cave/20 pt-2 font-bold">
            <span>Total</span>
            <span>{formatAgorot(total)}</span>
          </div>
        </div>

        <div className="mt-10 border-t border-brun-cave/10 pt-4 text-xs text-gris-chaud">
          <p>TVA et mentions fiscales selon la configuration officielle du magasin.</p>
          <p>Commande réf. {order.id.slice(0, 8).toUpperCase()}</p>
        </div>
      </div>
    </div>
  );
}
