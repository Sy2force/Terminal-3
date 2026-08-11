"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { updateOrderStatusAction } from "@/app/admin/orders/actions";
import { orderStatusLabel } from "@/lib/order-status-labels";
import type { OrderStatus } from "@/types/database";

const STATUSES: OrderStatus[] = [
  "submitted",
  "confirmed",
  "ready",
  "completed",
  "cancelled",
];

export function OrderStatusUpdater({
  orderId,
  currentStatus,
  compact = false,
}: {
  orderId: string;
  currentStatus: OrderStatus;
  compact?: boolean;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  function handleChange(status: OrderStatus) {
    if (status === currentStatus) return;
    startTransition(async () => {
      await updateOrderStatusAction(orderId, status);
      router.refresh();
    });
  }

  if (compact) {
    return (
      <div className="flex gap-1">
        {STATUSES.filter(s => s !== "cancelled").map((status) => (
          <button
            key={status}
            disabled={isPending || status === currentStatus}
            onClick={() => handleChange(status)}
            className={`px-2 py-1 text-xs rounded border transition-colors ${
              status === currentStatus
                ? "border-champagne text-champagne bg-champagne/10"
                : "border-white/10 text-ivory/60 hover:border-white/30"
            } disabled:opacity-50`}
          >
            {orderStatusLabel(status).slice(0, 3)}
          </button>
        ))}
      </div>
    );
  }

  return (
    <select
      disabled={isPending}
      defaultValue={currentStatus}
      onChange={(e) => handleChange(e.target.value as OrderStatus)}
      className="rounded-sm border border-white/10 bg-graphite px-4 py-2 text-sm text-ivory outline-none focus:border-champagne disabled:opacity-50"
    >
      {STATUSES.map((status) => (
        <option key={status} value={status}>
          {orderStatusLabel(status)}
        </option>
      ))}
    </select>
  );
}
