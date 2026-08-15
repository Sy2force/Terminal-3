import Link from "next/link";
import { requireAdminPermission } from "@/lib/admin/auth";
import { createServiceRoleClient } from "@/lib/supabase/server";
import { formatAgorot } from "@/lib/money";

const STATUS_LABELS: Record<string, string> = {
  pending_verification: "En attente",
  verified: "Vérifié",
  rejected: "Refusé",
  suspended: "Suspendu",
};

export default async function AdminClientsPage() {
  await requireAdminPermission("customers.view");
  const supabase = createServiceRoleClient();

  const [{ data: profiles }, { data: loyaltyAccounts }, { data: orders }] = await Promise.all([
    supabase
      .from("profiles")
      // eslint-disable-next-line @typescript-eslint/no-explicit-any -- client_number/verification columns not yet in generated Database type
      .select("*" as any)
      .order("created_at", { ascending: false })
      .limit(200),
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (supabase as any).from("loyalty_accounts").select("*"),
    supabase.from("orders").select("id, user_id, total_agorot"),
  ]);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const loyaltyByUser = new Map(((loyaltyAccounts ?? []) as any[]).map((a) => [a.user_id, a]));
  const ordersByUser = new Map<string, { count: number; total: number }>();
  for (const order of orders ?? []) {
    if (!order.user_id) continue;
    const entry = ordersByUser.get(order.user_id) ?? { count: 0, total: 0 };
    entry.count += 1;
    entry.total += order.total_agorot;
    ordersByUser.set(order.user_id, entry);
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const rows = ((profiles ?? []) as any[]).map((p) => {
    const orderStats = ordersByUser.get(p.id) ?? { count: 0, total: 0 };
    const loyalty = loyaltyByUser.get(p.id);
    return {
      id: p.id,
      clientNumber: p.client_number,
      name: `${p.first_name ?? ""} ${p.last_name ?? ""}`.trim() || "—",
      email: p.email,
      phone: p.phone,
      status: p.verification_status ?? "pending_verification",
      createdAt: p.created_at,
      ordersCount: orderStats.count,
      totalSpent: orderStats.total,
      points: loyalty?.points_balance ?? 0,
    };
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-serif text-2xl text-ivory">Clients</h1>
        <p className="mt-1 text-sm text-muted-grey">{rows.length} client{rows.length > 1 ? "s" : ""}</p>
      </div>

      <div className="overflow-x-auto rounded-sm border border-white/5">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-white/5 text-xs uppercase tracking-wide text-muted-grey">
              <th className="px-4 py-3">Client</th>
              <th className="px-4 py-3">Contact</th>
              <th className="px-4 py-3">Statut</th>
              <th className="px-4 py-3">Commandes</th>
              <th className="px-4 py-3">Total dépensé</th>
              <th className="px-4 py-3">Points</th>
              <th className="px-4 py-3">Inscrit le</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.id} className="border-b border-white/5 last:border-0 hover:bg-graphite/40">
                <td className="px-4 py-3">
                  <Link href={`/admin/clients/${row.id}`} className="text-champagne hover:underline">
                    {row.name}
                  </Link>
                  <p className="text-xs text-muted-grey">{row.clientNumber ?? "—"}</p>
                </td>
                <td className="px-4 py-3 text-ivory/70">
                  <p>{row.email}</p>
                  <p className="text-xs text-muted-grey">{row.phone}</p>
                </td>
                <td className="px-4 py-3">
                  <span className="rounded-full bg-white/5 px-2.5 py-0.5 text-xs text-ivory/80">
                    {STATUS_LABELS[row.status] ?? row.status}
                  </span>
                </td>
                <td className="px-4 py-3 text-ivory/70">{row.ordersCount}</td>
                <td className="px-4 py-3 text-champagne">{formatAgorot(row.totalSpent)}</td>
                <td className="px-4 py-3 text-ivory/70">{row.points}</td>
                <td className="px-4 py-3 text-xs text-muted-grey">
                  {new Date(row.createdAt).toLocaleDateString("fr-FR")}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
