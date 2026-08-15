"use server";

import { revalidatePath } from "next/cache";
import { requireAdminPermission } from "@/lib/admin/auth";
import { logAudit } from "@/lib/admin/audit";
import { updateDeliveryStatus, collectPayment } from "@/lib/data/deliveries";
import { createClient } from "@/lib/supabase/server";
import type { DeliveryRow } from "@/types/database";

export interface DeliveryActionResult {
  success: boolean;
  error?: string;
}

export async function updateDeliveryStatusAction(
  deliveryId: string,
  status: DeliveryRow["status"],
): Promise<DeliveryActionResult> {
  const session = await requireAdminPermission("sales.orders");
  try {
    await updateDeliveryStatus(deliveryId, status);
    await logAudit({
      actor: session.userId,
      action: "delivery_assigned",
      entityType: "delivery",
      entityId: deliveryId,
      metadata: { status },
    });
    revalidatePath("/admin/livraisons");
    return { success: true };
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : "update_failed" };
  }
}

/**
 * Assigns a delivery_driver (the new admin-managed roster) to a
 * delivery. This is distinct from the legacy `courier_user_id`
 * (an authenticated app user) — a driver here doesn't need a login.
 */
export async function assignDeliveryDriverAction(
  deliveryId: string,
  driverId: string,
): Promise<DeliveryActionResult> {
  const session = await requireAdminPermission("sales.orders");
  try {
    const supabase = await createClient();
    const { error } = await supabase
      .from("deliveries")
      .update({ delivery_driver_id: driverId, status: "ASSIGNED", updated_at: new Date().toISOString() })
      .eq("id", deliveryId);
    if (error) throw new Error(error.message);

    await logAudit({
      actor: session.userId,
      action: "delivery_assigned",
      entityType: "delivery",
      entityId: deliveryId,
      metadata: { driver_id: driverId },
    });
    revalidatePath("/admin/livraisons");
    return { success: true };
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : "assign_failed" };
  }
}

export async function collectDeliveryPaymentAction(
  deliveryId: string,
  method: string,
): Promise<DeliveryActionResult> {
  const session = await requireAdminPermission("sales.orders");
  try {
    await collectPayment(deliveryId, method);
    await logAudit({
      actor: session.userId,
      action: "status_changed",
      entityType: "delivery",
      entityId: deliveryId,
      metadata: { payment_method: method },
    });
    revalidatePath("/admin/livraisons");
    return { success: true };
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : "payment_failed" };
  }
}

export async function reportDeliveryFailureAction(
  deliveryId: string,
  reason: "CUSTOMER_ABSENT" | "WRONG_ADDRESS" | "AGE_VERIFICATION_REFUSED" | "PAYMENT_NOT_RECEIVED" | "OTHER",
): Promise<DeliveryActionResult> {
  const session = await requireAdminPermission("sales.orders");
  try {
    const supabase = await createClient();
    const { error } = await supabase
      .from("deliveries")
      .update({
        status: "FAILED",
        failure_reason: reason,
        failed_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq("id", deliveryId);
    if (error) throw new Error(error.message);

    await logAudit({
      actor: session.userId,
      action: "status_changed",
      entityType: "delivery",
      entityId: deliveryId,
      metadata: { failure_reason: reason },
    });
    revalidatePath("/admin/livraisons");
    return { success: true };
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : "report_failure_failed" };
  }
}

