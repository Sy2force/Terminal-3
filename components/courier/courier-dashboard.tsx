"use client";

import { useState, useTransition } from "react";
import { Package, Truck, MapPin, CheckCircle2, XCircle, DollarSign } from "lucide-react";
import type { DeliveryStatus } from "@/types/database";
import type { DeliveryWithOrder } from "@/lib/data/deliveries";
import { formatAgorot } from "@/lib/money";
import {
  updateDeliveryStatusAction,
  collectPaymentAction,
} from "@/app/courier/actions";

const STATUS_LABELS: Record<DeliveryStatus, string> = {
  ASSIGNED: "Assignée",
  ACCEPTED: "Acceptée",
  PICKED_UP: "Récupérée",
  IN_TRANSIT: "En route",
  ARRIVED: "Arrivée",
  DELIVERED: "Livrée",
  FAILED: "Échec",
};

const STATUS_FLOW: { status: DeliveryStatus; label: string; icon: typeof Package }[] = [
  { status: "ACCEPTED", label: "Accepter", icon: CheckCircle2 },
  { status: "PICKED_UP", label: "Récupérée", icon: Package },
  { status: "IN_TRANSIT", label: "En route", icon: Truck },
  { status: "ARRIVED", label: "Arrivée", icon: MapPin },
  { status: "DELIVERED", label: "Livrée", icon: CheckCircle2 },
];

export function CourierDashboard({
  activeDeliveries,
  completedDeliveries,
}: {
  activeDeliveries: DeliveryWithOrder[];
  completedDeliveries: DeliveryWithOrder[];
}) {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-serif text-2xl text-ivory">Livraisons</h1>
        <p className="mt-1 text-sm text-muted-grey">
          {activeDeliveries.length} livraison{activeDeliveries.length > 1 ? "s" : ""} en cours
        </p>
      </div>

      {activeDeliveries.length === 0 && completedDeliveries.length === 0 ? (
        <div className="rounded-sm border border-white/5 bg-graphite p-12 text-center text-sm text-muted-grey">
          Aucune livraison assignée pour le moment.
        </div>
      ) : (
        <>
          <div className="flex flex-col gap-4">
            {activeDeliveries.map((delivery) => (
              <DeliveryCard key={delivery.id} delivery={delivery} />
            ))}
          </div>

          {completedDeliveries.length > 0 && (
            <div className="mt-8">
              <h2 className="mb-4 font-serif text-lg text-ivory">Historique</h2>
              <div className="flex flex-col gap-2">
                {completedDeliveries.map((delivery) => (
                  <div
                    key={delivery.id}
                    className="flex items-center justify-between rounded-sm border border-white/5 bg-graphite px-4 py-3"
                  >
                    <div>
                      <span className="text-sm text-ivory">
                        Commande #{delivery.order.id.slice(0, 8).toUpperCase()}
                      </span>
                      <span className="ml-2 text-xs text-muted-grey">
                        {STATUS_LABELS[delivery.status]}
                      </span>
                    </div>
                    <span className="text-sm text-champagne">
                      {formatAgorot(delivery.order.total_agorot)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}

function DeliveryCard({ delivery }: { delivery: DeliveryWithOrder }) {
  const [pending, startTransition] = useTransition();
  const [showPayment, setShowPayment] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState("cash");

  const order = delivery.order;
  const hasAgeRestricted = order.age_self_declared === true;

  const currentIndex = STATUS_FLOW.findIndex((s) => s.status === delivery.status);
  const nextStep = currentIndex >= 0 && currentIndex < STATUS_FLOW.length - 1
    ? STATUS_FLOW[currentIndex + 1]
    : null;

  function handleAdvance() {
    if (!nextStep) return;
    startTransition(async () => {
      await updateDeliveryStatusAction(delivery.id, nextStep.status);
    });
  }

  function handleFail() {
    startTransition(async () => {
      await updateDeliveryStatusAction(delivery.id, "FAILED");
    });
  }

  function handleCollectPayment() {
    startTransition(async () => {
      await collectPaymentAction(delivery.id, paymentMethod);
      setShowPayment(false);
    });
  }

  return (
    <div className="rounded-sm border border-white/5 bg-graphite p-5">
      <div className="flex items-start justify-between">
        <div>
          <span className="text-xs uppercase tracking-widest text-champagne">
            {STATUS_LABELS[delivery.status]}
          </span>
          <h3 className="mt-1 font-serif text-lg text-ivory">
            Commande #{order.id.slice(0, 8).toUpperCase()}
          </h3>
          <p className="mt-1 text-sm text-ivory/70">
            {order.customer_name ?? "Client"}
            {order.customer_phone && ` · ${order.customer_phone}`}
          </p>
          {order.delivery_address && (
            <p className="mt-2 text-sm text-ivory/60">
              <MapPin className="mr-1 inline h-3.5 w-3.5" />
              {order.delivery_address}
            </p>
          )}
        </div>
        <span className="font-serif text-xl text-champagne">
          {formatAgorot(order.total_agorot)}
        </span>
      </div>

      <div className="mt-4 border-t border-white/5 pt-4">
        <h4 className="text-xs uppercase tracking-widest text-muted-grey">Articles</h4>
        <ul className="mt-2 space-y-1">
          {order.items?.map((item) => (
            <li key={item.id} className="flex justify-between text-sm text-ivory/80">
              <span>
                {item.quantity}× {item.product_name_snapshot}
                {item.variant_label_snapshot && (
                  <span className="text-muted-grey"> ({item.variant_label_snapshot})</span>
                )}
              </span>
            </li>
          ))}
        </ul>
      </div>

      {hasAgeRestricted && (
        <div className="mt-3 rounded-sm border border-amber-400/30 bg-amber-400/10 px-3 py-2 text-xs text-amber-400">
          ⚠ Contient des produits 18+ — vérification d&apos;âge requise à la livraison
        </div>
      )}

      <div className="mt-4 flex flex-wrap gap-2">
        {nextStep && (
          <button
            onClick={handleAdvance}
            disabled={pending}
            className="inline-flex items-center gap-2 rounded-full bg-champagne px-5 py-2.5 text-sm font-semibold text-obsidian transition-colors hover:bg-soft-gold disabled:opacity-50"
          >
            <nextStep.icon className="h-4 w-4" />
            {nextStep.label}
          </button>
        )}
        <button
          onClick={handleFail}
          disabled={pending}
          className="inline-flex items-center gap-2 rounded-full border border-red-400/30 px-5 py-2.5 text-sm text-red-400 transition-colors hover:bg-red-400/10 disabled:opacity-50"
        >
          <XCircle className="h-4 w-4" />
          Échec
        </button>
        {!delivery.payment_collected && delivery.status === "DELIVERED" && (
          <button
            onClick={() => setShowPayment(!showPayment)}
            disabled={pending}
            className="inline-flex items-center gap-2 rounded-full border border-champagne/40 px-5 py-2.5 text-sm text-champagne transition-colors hover:bg-champagne/10 disabled:opacity-50"
          >
            <DollarSign className="h-4 w-4" />
            Encaisser
          </button>
        )}
      </div>

      {delivery.payment_collected && (
        <div className="mt-3 text-xs text-champagne">
          ✓ Paiement encaissé ({delivery.payment_method ?? "—"})
        </div>
      )}

      {showPayment && (
        <div className="mt-3 flex flex-col gap-2 rounded-sm border border-white/10 bg-warm-black p-3">
          <label className="text-xs text-muted-grey">Mode de paiement</label>
          <select
            value={paymentMethod}
            onChange={(e) => setPaymentMethod(e.target.value)}
            className="rounded-sm border border-white/10 bg-graphite px-3 py-2 text-sm text-ivory"
          >
            <option value="cash">Espèces</option>
            <option value="card">Carte</option>
          </select>
          <button
            onClick={handleCollectPayment}
            disabled={pending}
            className="self-start rounded-full bg-champagne px-4 py-2 text-xs font-semibold text-obsidian disabled:opacity-50"
          >
            Confirmer l&apos;encaissement
          </button>
        </div>
      )}
    </div>
  );
}
