import Link from "next/link";
import { notFound } from "next/navigation";
import { requireAdminPermission } from "@/lib/admin/auth";
import { createServiceRoleClient } from "@/lib/supabase/server";
import { formatAgorot } from "@/lib/money";
import { ORDER_STATUS_LABELS } from "@/lib/order-status-labels";

export default async function AdminClientDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireAdminPermission("customers.view");
  const { id } = await params;
  const supabase = createServiceRoleClient();

  const [{ data: profile }, { data: orders }, { data: loyaltyAccount }, { data: addresses }] =
    await Promise.all([
      // eslint-disable-next-line @typescript-eslint/no-explicit-any -- client_number/verification columns not yet in generated Database type
      supabase.from("profiles").select("*" as any).eq("id", id).maybeSingle(),
      supabase.from("orders").select("*").eq("user_id", id).order("created_at", { ascending: false }),
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (supabase as any).from("loyalty_accounts").select("*").eq("user_id", id).maybeSingle(),
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (supabase as any).from("customer_addresses").select("*").eq("user_id", id),
    ]);

  if (!profile) notFound();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const p = profile as any;

  const totalSpent = (orders ?? []).reduce((sum, o) => sum + o.total_agorot, 0);

  return (
    <div className="space-y-6">
      <div>
        <Link href="/admin/clients" className="text-xs text-champagne hover:underline">
          ← Clients
        </Link>
        <h1 className="mt-2 font-serif text-2xl text-ivory">
          {p.first_name} {p.last_name}
        </h1>
        <p className="text-sm text-muted-grey">{p.client_number ?? "—"} · {p.email} · {p.phone}</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-sm border border-white/5 bg-graphite p-5">
          <p className="text-xs uppercase tracking-widest text-muted-grey">Statut</p>
          <p className="mt-2 text-ivory">{p.verification_status}</p>
        </div>
        <div className="rounded-sm border border-white/5 bg-graphite p-5">
          <p className="text-xs uppercase tracking-widest text-muted-grey">Total dépensé</p>
          <p className="mt-2 font-serif text-xl text-champagne">{formatAgorot(totalSpent)}</p>
        </div>
        <div className="rounded-sm border border-white/5 bg-graphite p-5">
          <p className="text-xs uppercase tracking-widest text-muted-grey">Points fidélité</p>
          <p className="mt-2 font-serif text-xl text-ivory">{loyaltyAccount?.points_balance ?? 0}</p>
        </div>
      </div>

      <div>
        <h2 className="font-serif text-lg text-ivory">Adresses</h2>
        {!addresses || addresses.length === 0 ? (
          <p className="mt-2 text-sm text-muted-grey">Aucune adresse enregistrée.</p>
        ) : (
          <ul className="mt-3 flex flex-col gap-2">
            {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
            {(addresses as any[]).map((a) => (
              <li key={a.id} className="rounded-sm border border-white/5 bg-graphite p-4 text-sm text-ivory/80">
                {a.street} {a.building_number}, {a.city} {a.postal_code ?? ""}
                {a.is_default && <span className="ml-2 text-xs text-champagne">Par défaut</span>}
              </li>
            ))}
          </ul>
        )}
      </div>

      <div>
        <h2 className="font-serif text-lg text-ivory">Commandes</h2>
        {!orders || orders.length === 0 ? (
          <p className="mt-2 text-sm text-muted-grey">Aucune commande.</p>
        ) : (
          <div className="mt-3 overflow-x-auto rounded-sm border border-white/5">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-white/5 text-xs uppercase tracking-wide text-muted-grey">
                  <th className="px-4 py-3">Référence</th>
                  <th className="px-4 py-3">Statut</th>
                  <th className="px-4 py-3">Total</th>
                  <th className="px-4 py-3">Date</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((o) => (
                  <tr key={o.id} className="border-b border-white/5 last:border-0 hover:bg-graphite/40">
                    <td className="px-4 py-3">
                      <Link href={`/admin/orders/${o.id}`} className="text-champagne hover:underline">
                        {o.id.slice(0, 8).toUpperCase()}
                      </Link>
                    </td>
                    <td className="px-4 py-3 text-ivory/70">{ORDER_STATUS_LABELS[o.status]}</td>
                    <td className="px-4 py-3 text-champagne">{formatAgorot(o.total_agorot)}</td>
                    <td className="px-4 py-3 text-xs text-muted-grey">
                      {new Date(o.created_at).toLocaleDateString("fr-FR")}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
