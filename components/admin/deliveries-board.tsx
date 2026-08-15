"use client";

import { useState } from "react";
import { MapPin, Phone, User, AlertTriangle, Check, X } from "lucide-react";
import {
  updateDeliveryStatusAction,
  assignDeliveryDriverAction,
  collectDeliveryPaymentAction,
  reportDeliveryFailureAction,
} from "@/app/admin/livraisons/actions";
import { formatAgorot } from "@/lib/money";
import type { DeliveryWithOrder } from "@/lib/data/deliveries";
import type { DeliveryDriverRow, DeliveryRow } from "@/types/database";

const STATUS_LABELS: Record<DeliveryRow["status"], string> = {
  ASSIGNED: "À assigner",
  ACCEPTED: "Assignée",
  PICKED_UP: "Prête au départ",
  IN_TRANSIT: "En route",
  ARRIVED: "Arrivée",
  DELIVERED: "Livrée",
  FAILED: "Échec",
};

const STATUS_ORDER: DeliveryRow["status"][] = [
  "ASSIGNED",
  "ACCEPTED",
  "PICKED_UP",
  "IN_TRANSIT",
  "ARRIVED",
  "DELIVERED",
  "FAILED",
];

export function DeliveriesBoard({
  initialDeliveries,
  drivers,
}: {
  initialDeliveries: DeliveryWithOrder[];
  drivers: DeliveryDriverRow[];
}) {
  const [deliveries, setDeliveries] = useState(initialDeliveries);
  const [filter, setFilter] = useState<"all" | DeliveryRow["status"]>("all");
  const [message, setMessage] = useState<string | null>(null);

  const filtered = filter === "all" ? deliveries : deliveries.filter((d) => d.status === filter);

  function patch(id: string, changes: Partial<DeliveryWithOrder>) {
    setDeliveries((prev) => prev.map((d) => (d.id === id ? { ...d, ...changes } : d)));
  }

  async function handleStatus(id: string, status: DeliveryRow["status"]) {
    patch(id, { status });
    const result = await updateDeliveryStatusAction(id, status);
    if (!result.success) setMessage("Échec de la mise à jour du statut.");
  }

  async function handleAssign(id: string, driverId: string) {
    patch(id, { delivery_driver_id: driverId, status: "ACCEPTED" });
    const result = await assignDeliveryDriverAction(id, driverId);
    if (!result.success) setMessage("Échec de l'assignation.");
  }

  async function handleCollectPayment(id: string, method: string) {
    if (!confirm("Confirmer l'encaissement à la livraison ?")) return;
    patch(id, { payment_collected: true, payment_method: method });
    const result = await collectDeliveryPaymentAction(id, method);
    if (!result.success) setMessage("Échec de l'enregistrement du paiement.");
  }

  async function handleFail(id: string, reason: "CUSTOMER_ABSENT" | "WRONG_ADDRESS" | "AGE_VERIFICATION_REFUSED" | "PAYMENT_NOT_RECEIVED" | "OTHER") {
    patch(id, { status: "FAILED", failure_reason: reason });
    const result = await reportDeliveryFailureAction(id, reason);
    if (!result.success) setMessage("Échec de l'enregistrement du problème.");
  }

  return (
    <div className="space-y-6">
      {message && (
        <div className="flex items-center justify-between rounded-sm border border-[#9B3444]/30 bg-[#9B3444]/10 px-4 py-2 text-sm text-[#9B3444]">
          {message}
          <button onClick={() => setMessage(null)} type="button"><X className="h-4 w-4" /></button>
        </div>
      )}

      <div className="flex flex-wrap gap-2">
        <FilterChip label="Toutes" active={filter === "all"} onClick={() => setFilter("all")} />
        {STATUS_ORDER.map((s) => (
          <FilterChip key={s} label={STATUS_LABELS[s]} active={filter === s} onClick={() => setFilter(s)} />
        ))}
      </div>

      <div className="grid gap-4 lg:grid-cols-2 xl:grid-cols-3">
        {filtered.map((delivery) => (
          <div key={delivery.id} className="rounded-sm border border-[#E7DECE] bg-white p-4 shadow-sm">
            <div className="mb-3 flex items-center justify-between">
              <span className="font-mono text-xs text-[#71695F]">#{delivery.order_id.slice(0, 8)}</span>
              <span className="rounded-sm bg-[#FBF8F1] px-2 py-0.5 text-[10px] uppercase tracking-wider text-[#692031]">
                {STATUS_LABELS[delivery.status]}
              </span>
            </div>

            <div className="mb-3 space-y-1 text-sm text-[#151411]">
              <p className="flex items-center gap-1.5"><User className="h-3.5 w-3.5 text-[#71695F]" /> {delivery.order.customer_name || "Client anonyme"}</p>
              {delivery.order.customer_phone && (
                <p className="flex items-center gap-1.5">
                  <Phone className="h-3.5 w-3.5 text-[#71695F]" />
                  <a href={`tel:${delivery.order.customer_phone}`} className="hover:underline">{delivery.order.customer_phone}</a>
                </p>
              )}
              <p className="flex items-center gap-1.5">
                <MapPin className="h-3.5 w-3.5 text-[#71695F]" />
                <a
                  href={`https://waze.com/ul?q=${encodeURIComponent(delivery.order.customer_phone ?? "")}`}
                  target="_blank"
                  rel="noreferrer"
                  className="hover:underline"
                >
                  Ouvrir dans Waze
                </a>
              </p>
              <p className="text-[#692031]">{formatAgorot(delivery.order.total_agorot)}</p>
              {delivery.customer_instructions && (
                <p className="text-xs italic text-[#71695F]">{delivery.customer_instructions}</p>
              )}
            </div>

            <div className="mb-3">
              <label className="mb-1 block text-xs text-[#71695F]">Livreur</label>
              <select
                defaultValue={delivery.delivery_driver_id ?? ""}
                onChange={(e) => e.target.value && handleAssign(delivery.id, e.target.value)}
                className="w-full rounded-sm border border-[#E7DECE] bg-[#FBF8F1] px-2 py-1.5 text-xs text-[#151411]"
              >
                <option value="">Non assigné</option>
                {drivers.map((d) => (
                  <option key={d.id} value={d.id}>{d.name}</option>
                ))}
              </select>
            </div>

            <div className="flex flex-wrap gap-1.5">
              {delivery.status !== "IN_TRANSIT" && delivery.status !== "DELIVERED" && (
                <button type="button" onClick={() => handleStatus(delivery.id, "IN_TRANSIT")} className="rounded-sm border border-[#3F6170]/40 px-2.5 py-1 text-[10px] text-[#3F6170] hover:bg-[#3F6170]/10">
                  En route
                </button>
              )}
              {delivery.status !== "DELIVERED" && (
                <button type="button" onClick={() => handleStatus(delivery.id, "DELIVERED")} className="flex items-center gap-1 rounded-sm border border-[#56705A]/40 px-2.5 py-1 text-[10px] text-[#56705A] hover:bg-[#56705A]/10">
                  <Check className="h-3 w-3" /> Livrée
                </button>
              )}
              {!delivery.payment_collected && delivery.status !== "FAILED" && (
                <button type="button" onClick={() => handleCollectPayment(delivery.id, "cash")} className="rounded-sm border border-[#C6A15B]/40 px-2.5 py-1 text-[10px] text-[#C6A15B] hover:bg-[#C6A15B]/10">
                  Paiement reçu
                </button>
              )}
              <button type="button" onClick={() => handleFail(delivery.id, "CUSTOMER_ABSENT")} className="flex items-center gap-1 rounded-sm border border-[#9B3444]/40 px-2.5 py-1 text-[10px] text-[#9B3444] hover:bg-[#9B3444]/10">
                <AlertTriangle className="h-3 w-3" /> Problème
              </button>
            </div>
          </div>
        ))}
        {filtered.length === 0 && (
          <p className="col-span-full py-12 text-center text-sm text-[#71695F]">Aucune livraison dans cette vue.</p>
        )}
      </div>
    </div>
  );
}

function FilterChip({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-sm border px-3 py-1.5 text-xs uppercase tracking-wider transition-colors ${
        active ? "border-[#692031] bg-[#692031] text-white" : "border-[#E7DECE] text-[#71695F] hover:border-[#C6A15B]"
      }`}
    >
      {label}
    </button>
  );
}
