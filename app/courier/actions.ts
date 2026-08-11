"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/admin/auth";
import { logAudit } from "@/lib/admin/audit";
import {
  updateDeliveryStatus,
  assignDelivery,
  collectPayment,
} from "@/lib/data/deliveries";
import type { DeliveryStatus } from "@/types/database";

export interface DeliveryActionResult {
  success: boolean;
  error?: string;
}

export async function updateDeliveryStatusAction(
  deliveryId: string,
  status: DeliveryStatus,
): Promise<DeliveryActionResult> {
  const session = await requireAdmin();
  try {
    await updateDeliveryStatus(deliveryId, status);
    await logAudit({
      actor: session.userId,
      action: "status_changed",
      entityType: "delivery",
      entityId: deliveryId,
      metadata: { status },
    });
    revalidatePath("/courier");
    revalidatePath("/admin/orders");
    return { success: true };
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : "update_failed" };
  }
}

export async function assignDeliveryAction(
  deliveryId: string,
  courierUserId: string,
): Promise<DeliveryActionResult> {
  const session = await requireAdmin();
  try {
    await assignDelivery(deliveryId, courierUserId);
    await logAudit({
      actor: session.userId,
      action: "delivery_assigned",
      entityType: "delivery",
      entityId: deliveryId,
      metadata: { courier: courierUserId },
    });
    revalidatePath("/courier");
    revalidatePath("/admin/orders");
    return { success: true };
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : "assign_failed" };
  }
}

export async function collectPaymentAction(
  deliveryId: string,
  method: string,
): Promise<DeliveryActionResult> {
  const session = await requireAdmin();
  try {
    await collectPayment(deliveryId, method);
    await logAudit({
      actor: session.userId,
      action: "status_changed",
      entityType: "delivery",
      entityId: deliveryId,
      metadata: { payment_collected: true, method },
    });
    revalidatePath("/courier");
    revalidatePath("/admin/orders");
    return { success: true };
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : "payment_failed" };
  }
}
