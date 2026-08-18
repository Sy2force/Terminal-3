import Link from "next/link";
import { requireAdminPermission } from "@/lib/admin/auth";
import { createServiceRoleClient } from "@/lib/supabase/server";

const KIND_LABELS: Record<string, string> = {
  order_summary: "Récapitulatif de commande",
  invoice: "Facture",
  receipt: "Reçu de paiement",
};

export default async function AdminInvoicesPage() {
  await requireAdminPermission("invoices.manage");
  const supabase = createServiceRoleClient();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any -- invoices not yet in generated Database type
  const db = supabase as any;

  const { data: invoices } = await db
    .from("invoices")
    .select("*")
    .order("issued_at", { ascending: false })
    .limit(200);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any -- invoices not yet in generated Database type
  const orderIds = [...new Set(((invoices ?? []) as any[]).map((i) => i.order_id))];
  const { data: orders } = orderIds.length
    ? await supabase.from("orders").select("id, customer_name").in("id", orderIds)
    : { data: [] };
  const orderById = new Map((orders ?? []).map((o) => [o.id, o]));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-serif text-2xl text-ivory">Factures et documents</h1>
        <p className="mt-1 text-sm text-muted-grey">
          Tant qu&rsquo;un paiement n&rsquo;est pas confirmé, seul un récapitulatif de commande est
          disponible — une vraie facture nécessite la configuration comptable et l&rsquo;encaissement
          confirmé.
        </p>
      </div>

      {!invoices || invoices.length === 0 ? (
        <div className="rounded-sm border border-white/5 bg-graphite p-12 text-center text-sm text-muted-grey">
          Aucun document généré pour le moment.
        </div>
      ) : (
        <div className="overflow-x-auto rounded-sm border border-white/5">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-white/5 text-xs uppercase tracking-wide text-muted-grey">
                <th className="px-4 py-3">N°</th>
                <th className="px-4 py-3">Client</th>
                <th className="px-4 py-3">Type</th>
                <th className="px-4 py-3">Statut paiement</th>
                <th className="px-4 py-3">Émis le</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody>
              {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
              {(invoices as any[]).map((inv) => (
                <tr key={inv.id} className="border-b border-white/5 last:border-0 hover:bg-graphite/40">
                  <td className="px-4 py-3 text-ivory">{inv.number}</td>
                  <td className="px-4 py-3 text-ivory/70">
                    {orderById.get(inv.order_id)?.customer_name ?? "—"}
                  </td>
                  <td className="px-4 py-3 text-ivory/70">{KIND_LABELS[inv.kind] ?? inv.kind}</td>
                  <td className="px-4 py-3 text-xs text-muted-grey">{inv.payment_status ?? "—"}</td>
                  <td className="px-4 py-3 text-xs text-muted-grey">
                    {new Date(inv.issued_at).toLocaleDateString("fr-FR")}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Link
                      href={`/admin/invoices/${inv.id}`}
                      className="text-xs text-champagne hover:underline"
                    >
                      Aperçu
                    </Link>
                    <a
                      href={`/api/orders/${inv.order_id}/recap`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="ml-3 text-xs text-champagne hover:underline"
                    >
                      Récap PDF
                    </a>
                    <Link
                      href={`/admin/orders/${inv.order_id}`}
                      className="ml-3 text-xs text-champagne hover:underline"
                    >
                      Commande
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
