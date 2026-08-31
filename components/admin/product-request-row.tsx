"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { CheckCircle, Send, X } from "lucide-react";
import { updateProductRequestAction } from "@/app/admin/product-requests/actions";
import { formatAgorot } from "@/lib/money";
import type {
  ProductRequestStatus,
} from "@/types/database";
import type { ProductRequestWithProduct } from "@/lib/data/product-requests";

const STATUS_LABEL: Record<ProductRequestStatus, string> = {
  new: "Nouvelle",
  reviewing: "En étude",
  quoted: "Devis proposé",
  accepted: "Acceptée",
  declined: "Refusée",
  fulfilled: "Traitée",
  cancelled: "Annulée",
};

const STATUS_ORDER: ProductRequestStatus[] = [
  "new",
  "reviewing",
  "quoted",
  "accepted",
  "declined",
  "fulfilled",
];

export function ProductRequestRow({
  request,
}: {
  request: ProductRequestWithProduct;
}) {
  const [expanded, setExpanded] = useState(false);
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState<ProductRequestStatus>(request.status);
  const [quotePrice, setQuotePrice] = useState<string>(
    request.quote_price_agorot != null
      ? String(request.quote_price_agorot / 100)
      : "",
  );
  const [quoteNote, setQuoteNote] = useState(request.quote_note ?? "");
  const [adminResponse, setAdminResponse] = useState(request.admin_response ?? "");

  const title =
    request.kind === "in_catalog"
      ? request.product?.name_fr || request.product?.name_he || "Produit du catalogue"
      : `${request.requested_brand ?? ""} ${request.requested_name ?? ""}`.trim() || "Hors catalogue";

  function handleStatus(next: ProductRequestStatus) {
    setError(null);
    const previous = status;
    setStatus(next);
    startTransition(async () => {
      const result = await updateProductRequestAction({
        requestId: request.id,
        status: next,
      });
      if (!result.success) {
        setStatus(previous);
        setError(result.error ?? "Erreur");
      }
    });
  }

  function handleSaveQuote() {
    setError(null);
    startTransition(async () => {
      const price = quotePrice
        ? Math.round(Number(quotePrice) * 100)
        : null;
      const result = await updateProductRequestAction({
        requestId: request.id,
        quotePriceAgorot: price,
        quoteNote,
        adminResponse,
        status: price != null ? "quoted" : status,
      });
      if (!result.success) {
        setError(result.error ?? "Erreur");
      } else if (price != null) {
        setStatus("quoted");
      }
    });
  }

  return (
    <li className="rounded-sm border border-[#E7DECE] bg-white">
      <div className="flex items-start justify-between gap-4 p-4">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-baseline gap-x-2 gap-y-1">
            <span className="font-serif text-base text-[#151411]">{title}</span>
            <span className="text-xs text-[#71695F]">
              {request.public_reference} · Réf.
            </span>
            <span
              className={`rounded-sm px-2 py-0.5 text-[10px] font-semibold uppercase tracking-widest ${
                request.kind === "out_of_catalog"
                  ? "bg-amber-100 text-amber-800"
                  : "bg-[#C6A15B]/10 text-[#7C5129]"
              }`}
            >
              {request.kind === "out_of_catalog" ? "Hors catalogue" : "Catalogue"}
            </span>
          </div>
          <p className="mt-1 text-xs text-[#71695F]">
            Quantité : {request.requested_quantity}
            {request.requested_volume_ml ? ` · Volume : ${request.requested_volume_ml} ml` : ""}
            {request.requested_budget_agorot != null
              ? ` · Budget max : ${formatAgorot(request.requested_budget_agorot)}`
              : ""}
          </p>
          {request.comment && (
            <p className="mt-1 text-sm text-[#151411]/70 line-clamp-2">
              « {request.comment} »
            </p>
          )}
        </div>

        <div className="flex shrink-0 items-center gap-2">
          <select
            value={status}
            onChange={(e) => handleStatus(e.target.value as ProductRequestStatus)}
            disabled={pending}
            className="rounded-sm border border-[#E7DECE] px-2 py-1.5 text-xs text-[#151411] outline-none focus:border-[#C6A15B]"
          >
            {STATUS_ORDER.map((s) => (
              <option key={s} value={s}>
                {STATUS_LABEL[s]}
              </option>
            ))}
            {status === "cancelled" && <option value="cancelled">Annulée</option>}
          </select>
          <button
            type="button"
            onClick={() => setExpanded((e) => !e)}
            className="rounded-sm border border-[#E7DECE] px-3 py-1.5 text-xs text-[#151411] hover:border-[#C6A15B]"
          >
            {expanded ? "Fermer" : "Devis"}
          </button>
        </div>
      </div>

      {expanded && (
        <div className="grid gap-4 border-t border-[#E7DECE] bg-[#F4EFE5]/40 p-4 lg:grid-cols-3">
          <label className="flex flex-col gap-1 text-xs uppercase tracking-widest text-[#71695F]">
            Prix proposé en ₪
            <input
              type="number"
              value={quotePrice}
              onChange={(e) => setQuotePrice(e.target.value)}
              className="rounded-sm border border-[#E7DECE] bg-white px-3 py-2 text-sm text-[#151411] outline-none focus:border-[#C6A15B]"
            />
          </label>
          <label className="flex flex-col gap-1 text-xs uppercase tracking-widest text-[#71695F] lg:col-span-2">
            Note interne devis (optionnel)
            <input
              value={quoteNote}
              onChange={(e) => setQuoteNote(e.target.value)}
              className="rounded-sm border border-[#E7DECE] bg-white px-3 py-2 text-sm text-[#151411] outline-none focus:border-[#C6A15B]"
              placeholder="Ex : livraison sous 5 jours"
            />
          </label>
          <label className="flex flex-col gap-1 text-xs uppercase tracking-widest text-[#71695F] lg:col-span-3">
            Réponse pour le client
            <textarea
              rows={3}
              value={adminResponse}
              onChange={(e) => setAdminResponse(e.target.value)}
              className="rounded-sm border border-[#E7DECE] bg-white px-3 py-2 text-sm text-[#151411] outline-none focus:border-[#C6A15B]"
            />
          </label>
          <div className="lg:col-span-3 flex items-center gap-2">
            <button
              type="button"
              onClick={handleSaveQuote}
              disabled={pending}
              className="inline-flex items-center gap-1.5 rounded-sm bg-[#692031] px-4 py-2 text-xs font-medium uppercase tracking-widest text-[#F7F0E4] hover:bg-[#551525] disabled:opacity-50"
            >
              <Send className="h-3.5 w-3.5" /> Enregistrer le devis
            </button>
            <button
              type="button"
              onClick={() => handleStatus("declined")}
              disabled={pending}
              className="inline-flex items-center gap-1.5 rounded-sm border border-[#E7DECE] px-4 py-2 text-xs font-medium uppercase tracking-widest text-[#151411] hover:border-[#C6A15B] disabled:opacity-50"
            >
              <X className="h-3.5 w-3.5" /> Refuser
            </button>
            <button
              type="button"
              onClick={() => handleStatus("fulfilled")}
              disabled={pending}
              className="inline-flex items-center gap-1.5 rounded-sm border border-emerald-600 bg-emerald-50 px-4 py-2 text-xs font-medium uppercase tracking-widest text-emerald-800 hover:bg-emerald-100 disabled:opacity-50"
            >
              <CheckCircle className="h-3.5 w-3.5" /> Marquer traitée
            </button>
            {request.bar_profile_id && (
              <Link
                href={`/admin/bars/${request.bar_profile_id}`}
                className="ml-auto text-xs text-[#692031] hover:underline"
              >
                Voir le bar
              </Link>
            )}
          </div>
          {error && <p className="lg:col-span-3 text-xs text-amber-700">{error}</p>}
        </div>
      )}
    </li>
  );
}
