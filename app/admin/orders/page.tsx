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
        <h1 className="font-serif text-2xl text-noir-profond">Commandes</h1>
        <div className="flex items-center gap-3">
          <a
            href="/api/admin/export/orders"
            download
            className="rounded-full border border-or-principal/40 px-5 py-2 text-sm font-medium text-or-principal transition-colors hover:bg-or-principal hover:text-noir-profond"
          >
            Export CSV
          </a>
          <Link href="/admin/orders/kanban" className="text-sm text-or-principal hover:text-soft-gold">
            Vue Kanban
          </Link>
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        {statusOptions.map((option) => (
          <Link
            key={option.value}
            href={`/admin/orders?status=${option.value}`}
            className={`rounded-full border px-4 py-1.5 text-xs uppercase tracking-widest transition-colors ${
              (filter ?? "all") === option.value
                ? "border-champagne text-or-principal"
                : "border-beige-fonce text-noir-profond/60 hover:border-white/30"
            }`}
          >
            {option.label}
          </Link>
        ))}
      </div>

      <div className="overflow-hidden rounded-sm border border-beige-fonce">
        <table className="w-full text-left text-sm">
          <thead className="bg-white text-noir-profond/70">
            <tr>
              <th className="px-4 py-3 font-normal">N°</th>
              <th className="px-4 py-3 font-normal">Client</th>
              <th className="px-4 py-3 font-normal">Date</th>
              <th className="px-4 py-3 font-normal">Total</th>
              <th className="px-4 py-3 font-normal">Statut</th>
              <th className="px-4 py-3 font-normal text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-beige-fonce">
            {orders.map((order) => (
              <tr key={order.id} className="hover:bg-white/[0.02]">
                <td className="px-4 py-3 font-medium text-noir-profond">
                  {order.id.slice(0, 8)}
                </td>
                <td className="px-4 py-3 text-noir-profond/80">
                  {order.customer_name || order.customer_phone || "—"}
                </td>
                <td className="px-4 py-3 text-gris-chaud">
                  {new Date(order.created_at).toLocaleString("fr-FR", {
                    dateStyle: "short",
                    timeStyle: "short",
                  })}
                </td>
                <td className="px-4 py-3 text-noir-profond/80">
                  {formatAgorot(order.total_agorot)}
                </td>
                <td className="px-4 py-3">
                  <StatusBadge status={order.status} />
                </td>
                <td className="px-4 py-3 text-right">
                  <Link
                    href={`/admin/orders/${order.id}`}
                    className="text-xs text-or-principal hover:text-soft-gold"
                  >
                    Détails
                  </Link>
                </td>
              </tr>
            ))}
            {orders.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-gris-chaud">
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
    submitted: "text-noir-profond",
    confirmed: "text-or-principal",
    ready: "text-soft-gold",
    completed: "text-green-400",
    cancelled: "text-gris-chaud",
  };
  return <span className={`text-xs ${styles[status] ?? "text-noir-profond"}`}>{label}</span>;
}
