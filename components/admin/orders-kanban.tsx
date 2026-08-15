"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { updateOrderStatusAction } from "@/app/admin/orders/actions";
import { formatAgorot } from "@/lib/money";
import type { OrderStatus } from "@/types/database";
import type { OrderListItem } from "@/lib/data/orders-admin";

const COLUMNS: { status: OrderStatus; label: string; accent: string }[] = [
  { status: "submitted", label: "Reçue", accent: "border-t-ivory/40" },
  { status: "confirmed", label: "Confirmée", accent: "border-t-[#C6A15B]" },
  { status: "ready", label: "Prête", accent: "border-t-[#56705A]" },
  { status: "completed", label: "Terminée", accent: "border-t-[#3F6170]" },
  { status: "cancelled", label: "Annulée", accent: "border-t-[#9B3444]" },
];

/**
 * Kanban board matching the real `order_status` enum in Postgres
 * (submitted / confirmed / ready / completed / cancelled). No
 * intermediate columns are invented beyond what the schema supports —
 * granular delivery sub-statuses live on the `deliveries` table and are
 * managed from /admin/livraisons instead.
 */
export function OrdersKanban({ initialOrders }: { initialOrders: OrderListItem[] }) {
  const [orders, setOrders] = useState(initialOrders);
  const [dragging, setDragging] = useState<string | null>(null);
  const [, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function handleDrop(status: OrderStatus) {
    if (!dragging) return;
    const orderId = dragging;
    setDragging(null);

    const previous = orders;
    setOrders((prev) => prev.map((o) => (o.id === orderId ? { ...o, status } : o)));

    startTransition(async () => {
      const result = await updateOrderStatusAction(orderId, status);
      if (!result.success) {
        setOrders(previous);
        setError(result.error ?? "Échec du changement de statut");
      }
    });
  }

  return (
    <div className="space-y-4">
      {error && (
        <div className="rounded-sm border border-red-400/30 bg-red-400/10 px-4 py-2 text-sm text-red-400">
          {error}
        </div>
      )}
      <div className="grid grid-cols-1 gap-4 overflow-x-auto sm:grid-cols-2 lg:grid-cols-5">
        {COLUMNS.map((col) => {
          const columnOrders = orders.filter((o) => o.status === col.status);
          return (
            <div
              key={col.status}
              onDragOver={(e) => e.preventDefault()}
              onDrop={() => handleDrop(col.status)}
              className={`min-h-[400px] rounded-sm border-t-4 bg-graphite/40 p-3 ${col.accent}`}
            >
              <div className="mb-3 flex items-center justify-between">
                <h3 className="text-sm font-medium text-ivory">{col.label}</h3>
                <span className="rounded-full bg-white/10 px-2 py-0.5 text-xs text-ivory/70">
                  {columnOrders.length}
                </span>
              </div>
              <div className="space-y-2">
                {columnOrders.map((order) => (
                  <div
                    key={order.id}
                    draggable
                    onDragStart={() => setDragging(order.id)}
                    className="cursor-grab rounded-sm border border-white/10 bg-warm-black p-3 text-sm shadow-sm active:cursor-grabbing"
                  >
                    <div className="mb-1 flex items-center justify-between">
                      <span className="font-mono text-xs text-muted-grey">#{order.id.slice(0, 8)}</span>
                      <span className="text-xs text-champagne">{formatAgorot(order.total_agorot)}</span>
                    </div>
                    <p className="truncate text-ivory">{order.customer_name || order.customer_phone || "Client anonyme"}</p>
                    <div className="mt-1 flex items-center justify-between text-[10px] text-muted-grey">
                      <span>{order.item_count} article(s)</span>
                      <Link href={`/admin/orders/${order.id}`} className="text-champagne hover:underline">
                        Détails
                      </Link>
                    </div>
                  </div>
                ))}
                {columnOrders.length === 0 && (
                  <p className="py-6 text-center text-xs text-muted-grey">Aucune commande</p>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
