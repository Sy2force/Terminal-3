import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Package, Plus } from "lucide-react";
import { getCurrentUser } from "@/lib/auth";
import { getMyProductRequests } from "@/lib/data/product-requests";
import { formatAgorot } from "@/lib/money";
import type { ProductRequestStatus } from "@/types/database";

export const metadata: Metadata = {
  title: "Mes demandes | Terminal 3",
  description: "Demandes de produits (catalogue et hors catalogue).",
};

const STATUS_LABEL: Record<ProductRequestStatus, string> = {
  new: "Reçue",
  reviewing: "En cours d'étude",
  quoted: "Devis proposé",
  accepted: "Acceptée",
  declined: "Refusée",
  fulfilled: "Traitée",
  cancelled: "Annulée",
};

const STATUS_COLOR: Record<ProductRequestStatus, string> = {
  new: "text-champagne",
  reviewing: "text-champagne",
  quoted: "text-amber-400",
  accepted: "text-emerald-400",
  declined: "text-red-400",
  fulfilled: "text-emerald-400",
  cancelled: "text-muted-grey",
};

export default async function CompteDemandesPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login?redirect=/compte/demandes");

  const requests = await getMyProductRequests();

  return (
    <div className="mx-auto max-w-4xl px-6 py-16 lg:px-8">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-widest text-champagne">Espace client</p>
          <h1 className="mt-2 font-serif text-3xl text-ivory">Mes demandes de produits</h1>
          <p className="mt-2 text-sm text-ivory/70">
            Retrouvez toutes vos demandes de produits, catalogues ou hors catalogue,
            avec le statut de traitement.
          </p>
        </div>
        <Link
          href="/demande-produit"
          className="flex shrink-0 items-center gap-2 rounded-full bg-champagne px-5 py-2.5 text-sm font-semibold text-obsidian transition-colors hover:bg-soft-gold"
        >
          <Plus className="h-4 w-4" /> Nouvelle demande
        </Link>
      </div>

      {requests.length === 0 ? (
        <div className="mt-10 rounded-sm border border-white/5 bg-graphite/40 p-8 text-center">
          <Package className="mx-auto h-10 w-10 text-muted-grey" />
          <p className="mt-3 font-serif text-lg text-ivory">Aucune demande pour l&rsquo;instant.</p>
          <p className="mt-2 text-sm text-muted-grey">
            Vous cherchez un produit spécifique, un vin rare ou un alcool absent du
            catalogue ? Faites-en la demande, nous vous répondrons rapidement.
          </p>
          <Link
            href="/demande-produit"
            className="mt-6 inline-flex items-center gap-2 rounded-full bg-champagne px-6 py-3 text-sm font-semibold text-obsidian transition-colors hover:bg-soft-gold"
          >
            <Plus className="h-4 w-4" /> Faire une demande
          </Link>
        </div>
      ) : (
        <ul className="mt-8 flex flex-col divide-y divide-white/5 border-y border-white/5">
          {requests.map((r) => {
            const title = r.kind === "in_catalog"
              ? r.product?.name_fr || r.product?.name_he || "Produit du catalogue"
              : `${r.requested_brand ?? ""} ${r.requested_name ?? ""}`.trim() || "Produit hors catalogue";
            return (
              <li key={r.id} className="flex flex-col gap-2 py-5 sm:flex-row sm:items-start sm:justify-between">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-baseline gap-x-2 gap-y-1">
                    <span className="font-serif text-lg text-ivory">{title}</span>
                    <span className="text-xs text-muted-grey">
                      {r.public_reference} · {new Date(r.created_at).toLocaleDateString("fr-FR")}
                    </span>
                  </div>
                  <p className="mt-1 text-sm text-ivory/70">
                    Quantité : {r.requested_quantity}
                    {r.requested_volume_ml ? ` · Volume : ${r.requested_volume_ml} ml` : ""}
                    {r.kind === "out_of_catalog" ? " · Hors catalogue" : ""}
                  </p>
                  {r.quote_price_agorot != null && (
                    <p className="mt-1 text-sm text-champagne">
                      Devis : {formatAgorot(r.quote_price_agorot)}
                      {r.quote_note ? ` — ${r.quote_note}` : ""}
                    </p>
                  )}
                  {r.admin_response && (
                    <p className="mt-1 text-sm text-ivory/60">Réponse de la boutique : {r.admin_response}</p>
                  )}
                </div>
                <span className={`shrink-0 text-xs font-medium uppercase tracking-widest ${STATUS_COLOR[r.status]}`}>
                  {STATUS_LABEL[r.status]}
                </span>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
