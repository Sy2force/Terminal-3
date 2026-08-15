import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { CheckCircle2, Clock, Package, Truck, MapPin, Home } from "lucide-react";
import { getOrderById } from "@/lib/data/orders";
import { formatAgorot } from "@/lib/money";
import {
  ORDER_STATUS_LABELS,
  FOOD_STATUS_LABELS,
  ALCOHOL_STATUS_LABELS,
} from "@/lib/order-status-labels";
import type { OrderStatus } from "@/types/database";

export const metadata: Metadata = {
  title: "Suivi de commande | Terminal 3",
};

const ORDER_TIMELINE: { status: OrderStatus; label: string; icon: typeof Clock }[] = [
  { status: "submitted", label: "Commande reçue", icon: CheckCircle2 },
  { status: "confirmed", label: "Confirmée", icon: Clock },
  { status: "ready", label: "En préparation", icon: Package },
  { status: "completed", label: "Terminée", icon: Home },
];

export default async function OrderTrackingPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const order = await getOrderById(id);
  if (!order) notFound();

  const currentStepIndex = ORDER_TIMELINE.findIndex((s) => s.status === order.status);
  const isCancelled = order.status === "cancelled";

  // estimated_ready_at / estimated_delivery_at were added in migration 0022
  // and are not yet part of the generated Database type.
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const orderWithEstimates = order as any;
  const estimateIso =
    order.fulfillment_type === "delivery"
      ? orderWithEstimates.estimated_delivery_at
      : orderWithEstimates.estimated_ready_at;
  const estimatedTime = estimateIso
    ? new Date(estimateIso).toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })
    : null;

  return (
    <div className="mx-auto max-w-2xl px-6 py-16 lg:px-8">
      <div className="text-center">
        <span className="text-xs uppercase tracking-[0.3em] text-champagne">
          Suivi de commande
        </span>
        <h1 className="mt-2 font-serif text-3xl text-ivory">
          Réf. {order.id.slice(0, 8).toUpperCase()}
        </h1>
        <p className="mt-2 text-sm text-muted-grey">
          {ORDER_STATUS_LABELS[order.status]}
        </p>
      </div>

      {/* Timeline */}
      <div className="mt-12">
        {isCancelled ? (
          <div className="rounded-sm border border-red-400/30 bg-red-400/10 px-6 py-8 text-center">
            <p className="font-serif text-lg text-red-400">Commande annulée</p>
          </div>
        ) : (
          <div className="relative">
            <div className="absolute left-5 top-0 h-full w-px bg-white/10" />
            <div
              className="absolute left-5 top-0 w-px bg-champagne transition-all duration-500"
              style={{
                height: `${(currentStepIndex / (ORDER_TIMELINE.length - 1)) * 100}%`,
              }}
            />
            <div className="space-y-8">
              {ORDER_TIMELINE.map((step, index) => {
                const isDone = index <= currentStepIndex;
                const isCurrent = index === currentStepIndex;
                const Icon = step.icon;
                return (
                  <div key={step.status} className="relative flex items-center gap-4">
                    <div
                      className={`relative z-10 flex h-10 w-10 items-center justify-center rounded-full border-2 transition-colors ${
                        isDone
                          ? "border-champagne bg-champagne text-obsidian"
                          : "border-white/10 bg-graphite text-muted-grey"
                      }`}
                    >
                      <Icon className="h-4 w-4" />
                    </div>
                    <div>
                      <span
                        className={`text-sm font-medium ${
                          isDone ? "text-ivory" : "text-muted-grey"
                        }`}
                      >
                        {step.label}
                      </span>
                      {isCurrent && (
                        <span className="ml-2 text-xs text-champagne">En cours</span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Delivery info */}
      <div className="mt-12 rounded-sm border border-white/5 bg-graphite p-6">
        <h2 className="font-serif text-lg text-ivory">Détails</h2>
        <div className="mt-4 space-y-3 text-sm">
          <div className="flex items-center gap-2 text-ivory/70">
            {order.fulfillment_type === "delivery" ? (
              <>
                <Truck className="h-4 w-4 text-champagne" />
                <span>Livraison</span>
              </>
            ) : (
              <>
                <MapPin className="h-4 w-4 text-champagne" />
                <span>Retrait en magasin</span>
              </>
            )}
          </div>
          {order.delivery_address && (
            <p className="pl-6 text-ivory/60">{order.delivery_address}</p>
          )}
          {!isCancelled && order.status !== "completed" && estimatedTime && (
            <p className="flex items-center gap-2 text-champagne">
              <Clock className="h-4 w-4" />
              {order.fulfillment_type === "delivery"
                ? `Livraison estimée vers ${estimatedTime}`
                : `Prêt vers ${estimatedTime}`}
            </p>
          )}
          <p className="text-ivory/60">
            Paiement {order.fulfillment_type === "delivery" ? "auprès du livreur" : "sur place"}
          </p>
        </div>
      </div>

      {/* Items */}
      <div className="mt-6 rounded-sm border border-white/5 bg-graphite p-6">
        {order.fulfillment_groups.map((group) => (
          <div key={group.id} className="mb-4 last:mb-0">
            <div className="flex items-center justify-between">
              <h3 className="text-xs uppercase tracking-widest text-champagne">
                {group.group_type === "AGE_RESTRICTED" ? "Produits 18+" : "Produits"}
              </h3>
              <span className="text-xs text-muted-grey">
                {group.group_type === "AGE_RESTRICTED"
                  ? ALCOHOL_STATUS_LABELS[group.alcohol_status!]
                  : FOOD_STATUS_LABELS[group.food_status!]}
              </span>
            </div>
            <ul className="mt-3 space-y-2">
              {group.items.map((item) => (
                <li
                  key={item.id}
                  className="flex items-center justify-between text-sm text-ivory/80"
                >
                  <span>
                    {item.quantity}× {item.product_name_snapshot}
                    {item.variant_label_snapshot && (
                      <span className="text-muted-grey"> ({item.variant_label_snapshot})</span>
                    )}
                  </span>
                  <span className="text-champagne">
                    {formatAgorot(item.final_price_agorot_snapshot * item.quantity)}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        ))}

        <div className="mt-4 flex flex-col gap-1 border-t border-white/5 pt-4">
          {order.discount_agorot > 0 && (
            <div className="flex justify-between text-sm text-champagne">
              <span>{order.discount_label ?? "Réduction"}</span>
              <span>-{formatAgorot(order.discount_agorot)}</span>
            </div>
          )}
          <div className="flex items-center justify-between">
            <span className="text-sm text-ivory/70">Total</span>
            <span className="font-serif text-xl text-champagne">
              {formatAgorot(order.total_agorot)}
            </span>
          </div>
        </div>
      </div>

      <div className="mt-8 flex flex-wrap justify-center gap-4">
        <a
          href={`/api/orders/${order.id}/recap`}
          target="_blank"
          rel="noopener noreferrer"
          className="rounded-full border border-champagne/40 px-6 py-3 text-sm font-medium text-champagne transition-colors hover:bg-champagne/10"
        >
          Télécharger le récapitulatif
        </a>
        <Link
          href="/account/orders"
          className="rounded-full border border-white/10 px-6 py-3 text-sm text-ivory/80 transition-colors hover:border-champagne hover:text-champagne"
        >
          Mes commandes
        </Link>
        <Link
          href="/"
          className="rounded-full bg-champagne px-6 py-3 text-sm font-semibold text-obsidian transition-colors hover:bg-soft-gold"
        >
          Continuer mes achats
        </Link>
      </div>
    </div>
  );
}
