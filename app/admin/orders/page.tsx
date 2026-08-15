import Link from "next/link";
import { requireAdminPermission } from "@/lib/admin/auth";
import { getOrdersForStaff } from "@/lib/data/orders-admin";
import { formatAgorot } from "@/lib/money";
import { orderStatusLabel } from "@/lib/order-status-labels";

export default async function AdminOrdersPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  await requireAdminPermission("sales.orders");
  const { status } = await searchParams;
  const filter = status as
    | "all"
    | "submitted"
    | "confirmed"
    | "ready"
    | "completed"
    | "cancelled"
    | undefined;
  const orders = await getOrdersForStaff(filter ?? "all");

  const statusOptions = [
    { value: "all", label: "Toutes" },
    { value: "submitted", label: "Reçues" },
    { value: "confirmed", label: "Confirmées" },
    { value: "ready", label: "Prêtes" },
    { value: "completed", label: "Terminées" },
    { value: "cancelled", label: "Annulées" },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="font-serif text-2xl text-ivory">Commandes</h1>
        <Link href="/admin/orders/kanban" className="text-sm text-champagne hover:text-soft-gold">
          Vue Kanban
        </Link>
      </div>

      <div className="flex flex-wrap gap-2">
        {statusOptions.map((option) => (
          <Link
            key={option.value}
            href={`/admin/orders?status=${option.value}`}
            className={`rounded-full border px-4 py-1.5 text-xs uppercase tracking-widest transition-colors ${
              (filter ?? "all") === option.value
                ? "border-champagne text-champagne"
                : "border-white/10 text-ivory/60 hover:border-white/30"
            }`}
          >
            {option.label}
          </Link>
        ))}
      </div>

      <div className="overflow-hidden rounded-sm border border-white/5">
        <table className="w-full text-left text-sm">
          <thead className="bg-graphite text-ivory/70">
            <tr>
              <th className="px-4 py-3 font-normal">N°</th>
              <th className="px-4 py-3 font-normal">Client</th>
              <th className="px-4 py-3 font-normal">Date</th>
              <th className="px-4 py-3 font-normal">Total</th>
              <th className="px-4 py-3 font-normal">Statut</th>
              <th className="px-4 py-3 font-normal text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {orders.map((order) => (
              <tr key={order.id} className="hover:bg-white/[0.02]">
                <td className="px-4 py-3 font-medium text-ivory">
                  {order.id.slice(0, 8)}
                </td>
                <td className="px-4 py-3 text-ivory/80">
                  {order.customer_name || order.customer_phone || "—"}
                </td>
                <td className="px-4 py-3 text-muted-grey">
                  {new Date(order.created_at).toLocaleString("fr-FR", {
                    dateStyle: "short",
                    timeStyle: "short",
                  })}
                </td>
                <td className="px-4 py-3 text-ivory/80">
                  {formatAgorot(order.total_agorot)}
                </td>
                <td className="px-4 py-3">
                  <StatusBadge status={order.status} />
                </td>
                <td className="px-4 py-3 text-right">
                  <Link
                    href={`/admin/orders/${order.id}`}
                    className="text-xs text-champagne hover:text-soft-gold"
                  >
                    Détails
                  </Link>
                </td>
              </tr>
            ))}
            {orders.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-muted-grey">
                  Aucune commande.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const label = orderStatusLabel(status);
  const styles: Record<string, string> = {
    submitted: "text-ivory",
    confirmed: "text-champagne",
    ready: "text-soft-gold",
    completed: "text-green-400",
    cancelled: "text-muted-grey",
  };
  return <span className={`text-xs ${styles[status] ?? "text-ivory"}`}>{label}</span>;
}
