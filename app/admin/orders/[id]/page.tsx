import { notFound } from "next/navigation";
import { requireAdminPermission } from "@/lib/admin/auth";
import { getOrderDetailsForStaff, getOrderNotes, getOrderStatusHistory } from "@/lib/data/orders-admin";
import { getOrderPaymentSummary } from "@/lib/data/payments";
import { loadClosureContext } from "@/lib/data/pickup-closure";
import { formatAgorot } from "@/lib/money";
import { OrderStatusUpdater } from "@/components/admin/order-status-updater";
import { FulfillmentStatusUpdater } from "@/components/admin/fulfillment-status-updater";
import { OrderPaymentAndNotes } from "@/components/admin/order-payment-and-notes";
import { CreateInvoiceFromOrder } from "@/components/admin/create-invoice-from-order";
import { PickupClosurePanel } from "@/components/admin/pickup-closure-panel";
import type { OrderRow } from "@/types/database";

export default async function AdminOrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireAdminPermission("sales.orders");
  const { id } = await params;
  const [order, { summary, payments, history: paymentHistory }, notes, statusHistory, closureCtx] = await Promise.all([
    getOrderDetailsForStaff(id),
    getOrderPaymentSummary(id),
    getOrderNotes(id),
    getOrderStatusHistory(id),
    loadClosureContext(id),
  ]);
  if (!order) notFound();

  const orderExt = order as OrderRow & {
    payment_status?: string;
    payment_method_actual?: string | null;
    paid_at?: string | null;
    id_checked_at?: string | null;
    ready_estimate_label?: string | null;
    public_order_number?: string | null;
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <span className="text-xs uppercase tracking-widest text-gris-chaud">
            Commande {order.id.slice(0, 8)}
          </span>
          <h1 className="font-serif text-2xl text-noir-profond">
            {order.customer_name || "Client anonyme"}
          </h1>
        </div>
        <OrderStatusUpdater orderId={order.id} currentStatus={order.status} />
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Detail label="Téléphone" value={order.customer_phone || "—"} />
        <Detail label="Total" value={formatAgorot(order.total_agorot)} />
        <Detail
          label="Date"
          value={new Date(order.created_at).toLocaleString("fr-FR", {
            dateStyle: "short",
            timeStyle: "short",
          })}
        />
        <Detail label="Type de retrait" value={order.fulfillment_type} />
      </div>

      {order.customer_notes && (
        <div className="rounded-sm border border-beige-fonce bg-creme p-4">
          <span className="text-xs uppercase tracking-widest text-gris-chaud">
            Note client
          </span>
          <p className="mt-2 text-sm text-noir-profond/80">{order.customer_notes}</p>
        </div>
      )}

      <div className="space-y-4">
        <h2 className="font-serif text-xl text-noir-profond">Groupes de préparation</h2>
        {order.fulfillment_groups.map((group) => (
          <div
            key={group.id}
            className="rounded-sm border border-beige-fonce bg-creme p-4"
          >
            <div className="mb-4 flex items-center justify-between">
              <span className="text-xs uppercase tracking-widest text-or-principal">
                {group.group_type === "AGE_RESTRICTED" ? "Alcool (18+)" : "Nourriture"}
              </span>
              <FulfillmentStatusUpdater
                groupId={group.id}
                type={group.group_type === "AGE_RESTRICTED" ? "alcohol" : "food"}
                currentStatus={
                  group.group_type === "AGE_RESTRICTED"
                    ? group.alcohol_status
                    : group.food_status
                }
              />
            </div>
            <ul className="divide-y divide-beige-fonce">
              {group.items.map((item) => (
                <li
                  key={item.id}
                  className="flex items-center justify-between py-2 text-sm"
                >
                  <span className="text-noir-profond/80">
                    {item.quantity} × {item.product_name_snapshot}
                    {item.variant_label_snapshot && (
                      <span className="text-gris-chaud">
                        {" "}
                        ({item.variant_label_snapshot})
                      </span>
                    )}
                  </span>
                  <span className="text-noir-profond/60">
                    {formatAgorot(item.final_price_agorot_snapshot)}
                  </span>
                </li>
              ))}
            </ul>
            {group.age_verification && (
              <div className="mt-4 rounded-sm border border-amber-400/20 bg-amber-50 p-3 text-sm">
                <span className="text-amber-700">
                  Vérification d’âge :{" "}
                  {group.age_verification.status === "PENDING"
                    ? "En attente"
                    : group.age_verification.status === "VERIFIED"
                      ? "Vérifiée"
                      : "Échouée"}
                </span>
              </div>
            )}
          </div>
        ))}
      </div>

      {closureCtx && (
        <PickupClosurePanel
          orderId={order.id}
          currentStatus={order.status}
          paymentStatus={closureCtx.order.payment_status}
          paymentMethodActual={closureCtx.order.payment_method_actual}
          paidAt={closureCtx.order.paid_at}
          idCheckedAt={closureCtx.order.id_checked_at}
          hasAgeRestrictedItem={closureCtx.hasAgeRestrictedItem}
          readyEstimateLabel={orderExt.ready_estimate_label ?? null}
        />
      )}

      <OrderPaymentAndNotes
        orderId={order.id}
        summary={summary}
        payments={payments}
        paymentHistory={paymentHistory}
        notes={notes}
        statusHistory={statusHistory}
      />

      <CreateInvoiceFromOrder orderId={order.id} />
    </div>
  );
}

function Detail({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-sm border border-beige-fonce bg-creme p-4">
      <span className="text-xs uppercase tracking-widest text-gris-chaud">
        {label}
      </span>
      <p className="mt-1 text-noir-profond">{value}</p>
    </div>
  );
}
