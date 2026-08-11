"use server";

import { revalidatePath } from "next/cache";
import { requireAdminPermission } from "@/lib/admin/auth";
import { logAudit } from "@/lib/admin/audit";
import {
  updateOrderStatus,
  updateFulfillmentStatus,
  updateAgeVerificationStatus,
} from "@/lib/data/orders-admin";
import type { OrderStatus, AgeVerificationStatus, FoodFulfillmentStatus, AlcoholFulfillmentStatus } from "@/types/database";

export interface OrderActionResult {
  success: boolean;
  error?: string;
}

export async function updateOrderStatusAction(
  orderId: string,
  status: OrderStatus,
): Promise<OrderActionResult> {
  const session = await requireAdminPermission("sales.orders");
  try {
    await updateOrderStatus(orderId, status);
    await logAudit({
      actor: session.userId,
      action: "status_changed",
      entityType: "order",
      entityId: orderId,
      metadata: { status },
    });
    revalidatePath("/admin/orders");
    revalidatePath(`/admin/orders/${orderId}`);
    return { success: true };
  } catch (err) {
    const message = err instanceof Error ? err.message : "update_failed";
    return { success: false, error: message };
  }
}

export async function updateFulfillmentStatusAction(
  groupId: string,
  type: "food" | "alcohol",
  status: FoodFulfillmentStatus | AlcoholFulfillmentStatus,
): Promise<OrderActionResult> {
  const session = await requireAdminPermission("sales.orders");
  try {
    await updateFulfillmentStatus(groupId, type, status);
    await logAudit({
      actor: session.userId,
      action: "status_changed",
      entityType: "order",
      entityId: groupId,
      metadata: { type, status },
    });
    revalidatePath("/admin/orders");
    return { success: true };
  } catch (err) {
    const message = err instanceof Error ? err.message : "update_failed";
    return { success: false, error: message };
  }
}

export async function verifyAgeAction(
  verificationId: string,
  status: AgeVerificationStatus,
): Promise<OrderActionResult> {
  const session = await requireAdminPermission("sales.age_verification");
  try {
    await updateAgeVerificationStatus(verificationId, session.userId, status);
    await logAudit({
      actor: session.userId,
      action: status === "VERIFIED" ? "age_verified" : "age_verification_failed",
      entityType: "age_verification",
      entityId: verificationId,
    });
    revalidatePath("/admin/age-verifications");
    revalidatePath("/admin/orders");
    return { success: true };
  } catch (err) {
    const message = err instanceof Error ? err.message : "update_failed";
    return { success: false, error: message };
  }
}
