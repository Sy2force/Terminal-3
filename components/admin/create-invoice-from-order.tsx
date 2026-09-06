"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { createInvoiceFromOrderAction } from "@/app/admin/invoices/actions";

export function CreateInvoiceFromOrder({ orderId }: { orderId: string }) {
  const [result, setResult] = useState<{ success: boolean; invoiceId?: string; error?: string } | null>(null);
  const [isPending, startTransition] = useTransition();

  const handleClick = () => {
    setResult(null);
    startTransition(async () => {
      const res = await createInvoiceFromOrderAction(orderId);
      setResult(res);
    });
  };

  return (
    <div className="rounded-sm border border-beige-fonce bg-creme p-4">
      <h2 className="font-serif text-lg text-noir-profond">Facture</h2>
      <p className="text-sm text-noir-profond/60">
        Créer un brouillon de facture associé à cette commande.
      </p>
      <div className="mt-3 flex items-center gap-3">
        <button
          type="button"
          onClick={handleClick}
          disabled={isPending}
          className="rounded-sm border border-or-principal/40 px-4 py-2 text-sm font-medium text-or-principal transition-colors hover:bg-or-principal hover:text-noir-profond disabled:opacity-50"
        >
          {isPending ? "Création…" : "Créer une facture"}
        </button>
        {result?.success && result.invoiceId && (
          <Link
            href={`/admin/invoices/${result.invoiceId}`}
            className="text-sm text-or-principal hover:underline"
          >
            Voir l&apos;aperçu
          </Link>
        )}
      </div>
      {result?.error && <p className="mt-2 text-sm text-red-300">{result.error}</p>}
      {result?.success && !result.error && (
        <p className="mt-2 text-sm text-green-300">Brouillon de facture créé.</p>
      )}
    </div>
  );
}
