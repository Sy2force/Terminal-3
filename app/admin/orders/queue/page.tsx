import type { LucideIcon } from "lucide-react";
import { requireAdminPermission } from "@/lib/admin/auth";
import { getActiveOrdersWithDetailsForStaff, type OrderWithDetails } from "@/lib/data/orders-admin";
import { formatAgorot } from "@/lib/money";
import { orderStatusLabel } from "@/lib/order-status-labels";
import { OrderStatusUpdater } from "@/components/admin/order-status-updater";
import { FulfillmentStatusUpdater } from "@/components/admin/fulfillment-status-updater";
import { AgeVerificationAction } from "@/components/admin/age-verification-action";
import { Clock, Package, AlertTriangle, CheckCircle } from "lucide-react";

export default async function StaffQueuePage() {
  await requireAdminPermission("sales.orders");

  const queueOrders = await getActiveOrdersWithDetailsForStaff();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-serif text-2xl text-noir-profond">File de commande</h1>
          <p className="mt-1 text-sm text-gris-chaud">
            {queueOrders.length} commande{queueOrders.length !== 1 ? "s" : ""} en cours
          </p>
        </div>
      </div>

      {queueOrders.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-sm border border-beige-fonce bg-creme py-20">
          <CheckCircle className="h-12 w-12 text-or-principal/50" />
          <p className="mt-4 text-gris-chaud">Aucune commande en cours</p>
        </div>
      ) : (
        <div className="grid gap-4 lg:grid-cols-2 xl:grid-cols-3">
          {queueOrders.map((order) => (
            <OrderCard key={order.id} order={order} />
          ))}
        </div>
      )}
    </div>
  );
}

function OrderCard({ order }: { order: OrderWithDetails }) {
  const statusColors: Record<string, string> = {
    submitted: "border-ivory/30",
    confirmed: "border-champagne/50",
    ready: "border-soft-gold/50",
  };

  const statusIcons: Record<string, LucideIcon> = {
    submitted: Clock,
    confirmed: Package,
    ready: CheckCircle,
  };

  const StatusIcon = statusIcons[order.status] || Clock;

  return (
    <div className={`rounded-sm border ${statusColors[order.status]} bg-creme p-5`}>
      <div className="mb-4 flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div className={`flex h-10 w-10 items-center justify-center rounded-full border ${
            order.status === "submitted" ? "border-ivory/30 text-noir-profond" :
            order.status === "confirmed" ? "border-champagne/50 text-or-principal" :
            "border-soft-gold/50 text-soft-gold"
          }`}>
            <StatusIcon className="h-5 w-5" />
          </div>
          <div>
            <span className="text-xs uppercase tracking-widest text-gris-chaud">
              #{order.id.slice(0, 8)}
            </span>
            <h3 className="font-serif text-lg text-noir-profond">
              {order.customer_name || "Client anonyme"}
            </h3>
          </div>
        </div>
        <OrderStatusUpdater orderId={order.id} currentStatus={order.status} compact />
      </div>

      <div className="mb-4 grid grid-cols-2 gap-2 text-sm">
        <div className="rounded-sm bg-white/5 p-2">
          <span className="text-xs text-gris-chaud">Téléphone</span>
          <p className="text-noir-profond">{order.customer_phone || "—"}</p>
        </div>
        <div className="rounded-sm bg-white/5 p-2">
          <span className="text-xs text-gris-chaud">Total</span>
          <p className="text-noir-profond">{formatAgorot(order.total_agorot)}</p>
        </div>
        <div className="rounded-sm bg-white/5 p-2">
          <span className="text-xs text-gris-chaud">Type</span>
          <p className="text-noir-profond">
            {order.fulfillment_type === "pickup" ? "Retrait" : "Livraison"}
          </p>
        </div>
        <div className="rounded-sm bg-white/5 p-2">
          <span className="text-xs text-gris-chaud">Statut</span>
          <p className="text-noir-profond">{orderStatusLabel(order.status)}</p>
        </div>
      </div>

      {order.customer_notes && (
        <div className="mb-4 rounded-sm border border-beige-fonce bg-white/5 p-3">
          <span className="text-xs text-gris-chaud">Note client</span>
          <p className="mt-1 text-sm text-noir-profond/80">{order.customer_notes}</p>
        </div>
      )}

      <div className="space-y-3">
        {order.fulfillment_groups?.map((group) => (
          <div
            key={group.id}
            className={`rounded-sm border p-3 ${
              group.group_type === "AGE_RESTRICTED"
                ? "border-amber-300 bg-amber-50"
                : "border-beige-fonce bg-white/5"
            }`}
          >
            <div className="mb-2 flex items-center justify-between">
              <span className={`text-xs uppercase tracking-widest ${
                group.group_type === "AGE_RESTRICTED" ? "text-amber-700" : "text-or-principal"
              }`}>
                {group.group_type === "AGE_RESTRICTED" ? (
                  <span className="flex items-center gap-1">
                    <AlertTriangle className="h-3 w-3" />
                    Alcool (18+)
                  </span>
                ) : (
                  "Nourriture"
                )}
              </span>
              <FulfillmentStatusUpdater
                groupId={group.id}
                type={group.group_type === "AGE_RESTRICTED" ? "alcohol" : "food"}
                currentStatus={
                  group.group_type === "AGE_RESTRICTED"
                    ? group.alcohol_status
                    : group.food_status
                }
                compact
              />
            </div>

            <ul className="space-y-1 text-sm">
              {group.items?.map((item) => (
                <li key={item.id} className="flex justify-between text-noir-profond/80">
                  <span>
                    {item.quantity} × {item.product_name_snapshot}
                    {item.variant_label_snapshot && (
                      <span className="text-gris-chaud"> ({item.variant_label_snapshot})</span>
                    )}
                  </span>
                  <span className="text-noir-profond/60">{formatAgorot(item.final_price_agorot_snapshot)}</span>
                </li>
              ))}
            </ul>

            {group.age_verification && (
              <div className="mt-2 pt-2 border-t border-beige-fonce">
                <AgeVerificationAction
                  verificationId={group.age_verification.id}
                  currentStatus={group.age_verification.status}
                />
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="mt-4 pt-4 border-t border-beige-fonce text-xs text-gris-chaud">
        {new Date(order.created_at).toLocaleString("fr-FR", {
          dateStyle: "short",
          timeStyle: "short",
        })}
      </div>
    </div>
  );
}
