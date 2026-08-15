"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireAdminPermission } from "@/lib/admin/auth";
import { logAudit } from "@/lib/admin/audit";
import { confirmPayment, getPaymentSummary } from "@/lib/data/payments";
import { addOrderNote } from "@/lib/data/orders-admin";
import { isDemoMode } from "@/lib/demo-mode";
import type { PaymentMethod } from "@/types/database";

export interface OrderActionResult {
  success: boolean;
  error?: string;
}

const paymentSchema = z.object({
  orderId: z.string().uuid(),
  amount_agorot: z.coerce.number().int().positive(),
  method: z.enum(["cash_store", "cash_delivery", "card_store", "card_delivery", "manual"]),
  reference: z.string().max(200).optional(),
  notes: z.string().max(1000).optional(),
  idempotencyKey: z.string().min(1).max(64),
});

const noteSchema = z.object({
  orderId: z.string().uuid(),
  note: z.string().min(1).max(5000),
});

export async function confirmOrderPaymentAction(input: unknown): Promise<OrderActionResult> {
  const session = await requireAdminPermission("sales.orders");

  if (isDemoMode()) {
    return { success: false, error: "demo_mode_read_only" };
  }

  try {
    const parsed = paymentSchema.parse(input);
    const summary = await getPaymentSummary(parsed.orderId);
    if (parsed.amount_agorot > summary.remaining_agorot) {
      return { success: false, error: "amount_exceeds_remaining" };
    }

    await confirmPayment({
      orderId: parsed.orderId,
      amount_agorot: parsed.amount_agorot,
      method: parsed.method as PaymentMethod,
      reference: parsed.reference,
      notes: parsed.notes,
      collectedBy: session.userId,
      idempotencyKey: parsed.idempotencyKey,
    });

    await logAudit({
      actor: session.userId,
      action: "updated",
      entityType: "payment",
      entityId: parsed.orderId,
      metadata: { type: "payment_confirmed", method: parsed.method, amount_agorot: parsed.amount_agorot },
    });

    revalidatePath(`/admin/orders/${parsed.orderId}`);
    return { success: true };
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : "payment_failed" };
  }
}

export async function addOrderNoteAction(input: unknown): Promise<OrderActionResult> {
  const session = await requireAdminPermission("sales.orders");

  if (isDemoMode()) {
    return { success: false, error: "demo_mode_read_only" };
  }

  try {
    const parsed = noteSchema.parse(input);
    await addOrderNote(parsed.orderId, parsed.note, session.userId, session.email || "Staff");

    await logAudit({
      actor: session.userId,
      action: "updated",
      entityType: "order",
      entityId: parsed.orderId,
      metadata: { type: "order_note_added" },
    });

    revalidatePath(`/admin/orders/${parsed.orderId}`);
    return { success: true };
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : "note_failed" };
  }
}
