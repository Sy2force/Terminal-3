import Link from "next/link";
import { requireAdminPermission } from "@/lib/admin/auth";
import { createServiceRoleClient } from "@/lib/supabase/server";
import { formatAgorot } from "@/lib/money";
import { paymentMethodLabel } from "@/lib/payment-labels";

const STATUS_LABELS: Record<string, string> = {
  unpaid: "Non payé",
  cash_store_expected: "Espèces magasin attendues",
  card_store_expected: "Carte magasin attendue",
  cash_delivery_expected: "Espèces livraison attendues",
  card_delivery_expected: "Carte livraison attendue",
  partially_paid: "Partiellement payé",
  paid: "Payé",
  refunded: "Remboursé",
  refused: "Refusé",
  cancelled: "Annulé",
};

export default async function AdminPaymentsPage() {
  await requireAdminPermission("payments.confirm");
  const supabase = createServiceRoleClient();

  const { data: payments } = await supabase
    .from("payments")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(200);

  const orderIds = [...new Set((payments ?? []).map((p) => p.order_id))];
  const { data: orders } = orderIds.length
    ? await supabase.from("orders").select("id, customer_name, customer_phone, total_agorot").in("id", orderIds)
    : { data: [] };
  const orderById = new Map((orders ?? []).map((o) => [o.id, o]));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-serif text-2xl text-noir-profond">Paiements</h1>
        <p className="mt-1 text-sm text-gris-chaud">
          {payments?.length ?? 0} paiement{(payments?.length ?? 0) > 1 ? "s" : ""} enregistré{(payments?.length ?? 0) > 1 ? "s" : ""}
        </p>
      </div>

      {!payments || payments.length === 0 ? (
        <div className="rounded-sm border border-beige-fonce bg-white p-12 text-center text-sm text-gris-chaud">
          Aucun paiement enregistré pour le moment. Les paiements sont confirmés depuis la fiche
          de chaque commande (/admin/orders/[id]).
        </div>
      ) : (
        <div className="overflow-x-auto rounded-sm border border-beige-fonce">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-beige-fonce text-xs uppercase tracking-wide text-gris-chaud">
                <th className="px-4 py-3">Commande</th>
                <th className="px-4 py-3">Client</th>
                <th className="px-4 py-3">Montant</th>
                <th className="px-4 py-3">Mode</th>
                <th className="px-4 py-3">Statut</th>
                <th className="px-4 py-3">Référence</th>
                <th className="px-4 py-3">Date</th>
              </tr>
            </thead>
            <tbody>
              {payments.map((p) => {
                const order = orderById.get(p.order_id);
                return (
                  <tr key={p.id} className="border-b border-beige-fonce last:border-0 hover:bg-creme">
                    <td className="px-4 py-3">
                      <Link href={`/admin/orders/${p.order_id}`} className="text-or-principal hover:underline">
                        {p.order_id.slice(0, 8).toUpperCase()}
                      </Link>
                    </td>
                    <td className="px-4 py-3 text-noir-profond/70">{order?.customer_name ?? "—"}</td>
                    <td className="px-4 py-3 text-or-principal">{formatAgorot(p.amount_agorot)}</td>
                    <td className="px-4 py-3 text-noir-profond/70">{p.method ? paymentMethodLabel(p.method) : "—"}</td>
                    <td className="px-4 py-3">
                      <span className="rounded-full bg-white/5 px-2.5 py-0.5 text-xs text-noir-profond/80">
                        {STATUS_LABELS[p.status] ?? p.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-xs text-gris-chaud">{p.reference ?? "—"}</td>
                    <td className="px-4 py-3 text-xs text-gris-chaud">
                      {new Date(p.created_at).toLocaleDateString("fr-FR")}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
