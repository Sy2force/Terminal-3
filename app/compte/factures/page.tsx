import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { listOrdersForCurrentUser } from "@/lib/data/orders";
import { formatAgorot } from "@/lib/money";
import { EmptyState } from "@/components/ui/empty-state";

const KIND_LABELS: Record<string, string> = {
  order_summary: "Récapitulatif de commande",
  invoice: "Facture",
  receipt: "Reçu de paiement",
};

export default async function CompteFacturesPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login?redirect=/compte/factures");

  const orders = await listOrdersForCurrentUser();

  return (
    <div className="mx-auto max-w-3xl px-6 py-16 lg:px-8">
      <span className="text-xs uppercase tracking-[0.3em] text-champagne">Mon compte</span>
      <h1 className="mt-2 font-serif text-3xl text-ivory">Mes factures</h1>
      <p className="mt-2 text-sm text-muted-grey">
        Avant l&rsquo;encaissement du paiement, seul un {KIND_LABELS.order_summary.toLowerCase()} est
        disponible. Une véritable facture est émise par notre équipe une fois le paiement confirmé.
      </p>

      {orders.length === 0 ? (
        <EmptyState className="mt-8" message="Aucun document pour le moment." />
      ) : (
        <div className="mt-8 flex flex-col divide-y divide-white/5 border-y border-white/5">
          {orders.map((order) => (
            <div key={order.id} className="flex items-center justify-between py-5">
              <div>
                <p className="font-serif text-base text-ivory">
                  Réf. {order.id.slice(0, 8).toUpperCase()}
                </p>
                <p className="text-xs text-muted-grey">
                  {new Date(order.created_at).toLocaleDateString("fr-FR", {
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                  })}{" "}
                  · {KIND_LABELS.order_summary}
                </p>
              </div>
              <div className="flex items-center gap-4">
                <a
                  href={`/api/orders/${order.id}/recap`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-champagne transition-colors hover:text-soft-gold"
                >
                  Télécharger
                </a>
                <span className="text-sm text-champagne">{formatAgorot(order.total_agorot)}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
