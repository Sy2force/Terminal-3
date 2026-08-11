"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { updateFulfillmentStatusAction } from "@/app/admin/orders/actions";
import { fulfillmentStatusLabel } from "@/lib/order-status-labels";
import type {
  FoodFulfillmentStatus,
  AlcoholFulfillmentStatus,
} from "@/types/database";

const FOOD_STATUSES: FoodFulfillmentStatus[] = [
  "SUBMITTED",
  "CONFIRMED",
  "READY",
  "COMPLETED",
  "CANCELLED",
];

const ALCOHOL_STATUSES: AlcoholFulfillmentStatus[] = [
  "SUBMITTED",
  "PENDING_AGE_VERIFICATION",
  "AGE_VERIFIED",
  "READY",
  "COMPLETED",
  "AGE_VERIFICATION_FAILED",
  "CANCELLED",
];

export function FulfillmentStatusUpdater({
  groupId,
  type,
  currentStatus,
  compact = false,
}: {
  groupId: string;
  type: "food" | "alcohol";
  currentStatus: string | null;
  compact?: boolean;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const statuses = type === "alcohol" ? ALCOHOL_STATUSES : FOOD_STATUSES;

  function handleChange(status: string) {
    if (status === currentStatus) return;
    startTransition(async () => {
      await updateFulfillmentStatusAction(groupId, type, status as never);
      router.refresh();
    });
  }

  if (compact) {
    const compactStatuses = type === "alcohol" 
      ? ["SUBMITTED", "AGE_VERIFIED", "READY", "COMPLETED"]
      : ["SUBMITTED", "CONFIRMED", "READY", "COMPLETED"];
    
    return (
      <div className="flex gap-1">
        {compactStatuses.map((status) => (
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
            {fulfillmentStatusLabel(type, status).slice(0, 3)}
          </button>
        ))}
      </div>
    );
  }

  return (
    <select
      disabled={isPending}
      defaultValue={currentStatus ?? ""}
      onChange={(e) => handleChange(e.target.value)}
      className="rounded-sm border border-white/10 bg-graphite px-3 py-1.5 text-xs text-ivory outline-none focus:border-champagne disabled:opacity-50"
    >
      {statuses.map((status) => (
        <option key={status} value={status}>
          {fulfillmentStatusLabel(type, status)}
        </option>
      ))}
    </select>
  );
}
