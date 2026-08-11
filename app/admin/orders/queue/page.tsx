import { requireAdminPermission } from "@/lib/admin/auth";
import { getOrdersForStaff } from "@/lib/data/orders-admin";
import { formatAgorot } from "@/lib/money";
import { orderStatusLabel } from "@/lib/order-status-labels";
import { OrderStatusUpdater } from "@/components/admin/order-status-updater";
import { FulfillmentStatusUpdater } from "@/components/admin/fulfillment-status-updater";
import { AgeVerificationAction } from "@/components/admin/age-verification-action";
import { Clock, Package, AlertTriangle, CheckCircle } from "lucide-react";

export default async function StaffQueuePage() {
  await requireAdminPermission("sales.orders");
  
  // Get active orders (submitted, confirmed, ready)
  const activeOrders = await getOrdersForStaff("all");
  const queueOrders = activeOrders.filter(
    (o) => o.status === "submitted" || o.status === "confirmed" || o.status === "ready"
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-serif text-2xl text-ivory">File de commande</h1>
          <p className="mt-1 text-sm text-muted-grey">
            {queueOrders.length} commande{queueOrders.length !== 1 ? "s" : ""} en cours
          </p>
        </div>
      </div>

      {queueOrders.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-sm border border-white/5 bg-graphite/30 py-20">
          <CheckCircle className="h-12 w-12 text-champagne/50" />
          <p className="mt-4 text-muted-grey">Aucune commande en cours</p>
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

function OrderCard({ order }: { order: any }) {
  const statusColors: Record<string, string> = {
    submitted: "border-ivory/30",
    confirmed: "border-champagne/50",
    ready: "border-soft-gold/50",
  };

  const statusIcons: Record<string, any> = {
    submitted: Clock,
    confirmed: Package,
    ready: CheckCircle,
  };

  const StatusIcon = statusIcons[order.status] || Clock;

  return (
    <div className={`rounded-sm border ${statusColors[order.status]} bg-graphite/50 p-5`}>
      <div className="mb-4 flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div className={`flex h-10 w-10 items-center justify-center rounded-full border ${
            order.status === "submitted" ? "border-ivory/30 text-ivory" :
            order.status === "confirmed" ? "border-champagne/50 text-champagne" :
            "border-soft-gold/50 text-soft-gold"
          }`}>
            <StatusIcon className="h-5 w-5" />
          </div>
          <div>
            <span className="text-xs uppercase tracking-widest text-muted-grey">
              #{order.id.slice(0, 8)}
            </span>
            <h3 className="font-serif text-lg text-ivory">
              {order.customer_name || "Client anonyme"}
            </h3>
          </div>
        </div>
        <OrderStatusUpdater orderId={order.id} currentStatus={order.status} compact />
      </div>

      <div className="mb-4 grid grid-cols-2 gap-2 text-sm">
        <div className="rounded-sm bg-white/5 p-2">
          <span className="text-xs text-muted-grey">Téléphone</span>
          <p className="text-ivory">{order.customer_phone || "—"}</p>
        </div>
        <div className="rounded-sm bg-white/5 p-2">
          <span className="text-xs text-muted-grey">Total</span>
          <p className="text-ivory">{formatAgorot(order.total_agorot)}</p>
        </div>
        <div className="rounded-sm bg-white/5 p-2">
          <span className="text-xs text-muted-grey">Type</span>
          <p className="text-ivory">
            {order.fulfillment_type === "pickup" ? "Retrait" : "Livraison"}
          </p>
        </div>
        <div className="rounded-sm bg-white/5 p-2">
          <span className="text-xs text-muted-grey">Statut</span>
          <p className="text-ivory">{orderStatusLabel(order.status)}</p>
        </div>
      </div>

      {order.customer_notes && (
        <div className="mb-4 rounded-sm border border-white/5 bg-white/5 p-3">
          <span className="text-xs text-muted-grey">Note client</span>
          <p className="mt-1 text-sm text-ivory/80">{order.customer_notes}</p>
        </div>
      )}

      <div className="space-y-3">
        {order.fulfillment_groups?.map((group: any) => (
          <div
            key={group.id}
            className={`rounded-sm border p-3 ${
              group.group_type === "AGE_RESTRICTED"
                ? "border-amber-400/30 bg-amber-400/5"
                : "border-white/5 bg-white/5"
            }`}
          >
            <div className="mb-2 flex items-center justify-between">
              <span className={`text-xs uppercase tracking-widest ${
                group.group_type === "AGE_RESTRICTED" ? "text-amber-400" : "text-champagne"
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
              {group.items?.map((item: any) => (
                <li key={item.id} className="flex justify-between text-ivory/80">
                  <span>
                    {item.quantity} × {item.product_name_snapshot}
                    {item.variant_label_snapshot && (
                      <span className="text-muted-grey"> ({item.variant_label_snapshot})</span>
                    )}
                  </span>
                  <span className="text-ivory/60">{formatAgorot(item.final_price_agorot_snapshot)}</span>
                </li>
              ))}
            </ul>

            {group.age_verification && (
              <div className="mt-2 pt-2 border-t border-white/10">
                <AgeVerificationAction
                  verificationId={group.age_verification.id}
                  currentStatus={group.age_verification.status}
                  orderId={order.id}
                />
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="mt-4 pt-4 border-t border-white/10 text-xs text-muted-grey">
        {new Date(order.created_at).toLocaleString("fr-FR", {
          dateStyle: "short",
          timeStyle: "short",
        })}
      </div>
    </div>
  );
}
