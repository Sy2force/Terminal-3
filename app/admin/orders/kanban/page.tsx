import Link from "next/link";
import { requireAdminPermission } from "@/lib/admin/auth";
import { getOrdersForStaff } from "@/lib/data/orders-admin";
import { OrdersKanban } from "@/components/admin/orders-kanban";

export default async function OrdersKanbanPage() {
  await requireAdminPermission("sales.orders");
  const orders = await getOrdersForStaff("all");

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-serif text-2xl text-noir-profond">Commandes — Kanban</h1>
          <p className="mt-1 text-sm text-gris-chaud">
            Glissez une commande vers une autre colonne pour changer son statut.
          </p>
        </div>
        <Link href="/admin/orders" className="text-sm text-or-principal hover:text-soft-gold">
          Vue tableau
        </Link>
      </div>

      <OrdersKanban initialOrders={orders} />
    </div>
  );
}
