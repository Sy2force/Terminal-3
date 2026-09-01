"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireAdminPermission } from "@/lib/admin/auth";
import { updateOrderStatus } from "@/lib/data/orders-admin";
import {
  loadClosureContext,
  markOrderPaidInStore,
  markIdChecked,
  setReadyEstimate,
  canCloseOrder,
} from "@/lib/data/pickup-closure";

const markPaidSchema = z.object({
  orderId: z.string().uuid(),
  method: z.enum(["cash", "card", "bit", "other"]),
  amountAgorot: z.number().int().min(0).optional(),
});

export async function markPaidInStoreAction(
  raw: z.infer<typeof markPaidSchema>,
): Promise<{ success: boolean; error?: string }> {
  const session = await requireAdminPermission("payments.confirm");
  const parsed = markPaidSchema.safeParse(raw);
  if (!parsed.success) return { success: false, error: "Formulaire invalide." };

  const result = await markOrderPaidInStore(
    parsed.data.orderId,
    parsed.data.method,
    session.userId,
    parsed.data.amountAgorot,
  );
  if (!result.success) return result;

  revalidatePath(`/admin/orders/${parsed.data.orderId}`);
  return { success: true };
}

const markIdCheckedSchema = z.object({
  orderId: z.string().uuid(),
});

export async function markIdCheckedAction(
  raw: z.infer<typeof markIdCheckedSchema>,
): Promise<{ success: boolean; error?: string }> {
  const session = await requireAdminPermission("sales.age_verification");
  const parsed = markIdCheckedSchema.safeParse(raw);
  if (!parsed.success) return { success: false, error: "Formulaire invalide." };

  const result = await markIdChecked(parsed.data.orderId, session.userId);
  if (!result.success) return result;

  revalidatePath(`/admin/orders/${parsed.data.orderId}`);
  return { success: true };
}

const setEstimateSchema = z.object({
  orderId: z.string().uuid(),
  label: z.string().min(1).max(80),
  atIso: z.string().datetime(),
});

export async function setReadyEstimateAction(
  raw: z.infer<typeof setEstimateSchema>,
): Promise<{ success: boolean; error?: string }> {
  const session = await requireAdminPermission("sales.orders");
  const parsed = setEstimateSchema.safeParse(raw);
  if (!parsed.success) return { success: false, error: "Formulaire invalide." };

  const at = new Date(parsed.data.atIso);
  if (Number.isNaN(at.getTime())) {
    return { success: false, error: "Date invalide." };
  }

  const result = await setReadyEstimate(
    parsed.data.orderId,
    { at, label: parsed.data.label },
    session.userId,
  );
  if (!result.success) return result;

  revalidatePath(`/admin/orders/${parsed.data.orderId}`);
  return { success: true };
}

const closeSchema = z.object({
  orderId: z.string().uuid(),
});

export async function closeOrderAction(
  raw: z.infer<typeof closeSchema>,
): Promise<{ success: boolean; error?: string }> {
  const session = await requireAdminPermission("sales.orders");
  const parsed = closeSchema.safeParse(raw);
  if (!parsed.success) return { success: false, error: "Formulaire invalide." };

  const ctx = await loadClosureContext(parsed.data.orderId);
  if (!ctx) return { success: false, error: "Commande introuvable." };

  const gate = canCloseOrder(ctx);
  if (!gate.ok) return { success: false, error: gate.reason };

  await updateOrderStatus(
    parsed.data.orderId,
    "completed",
    session.userId,
    session.email ?? "Staff",
    "Commande récupérée au magasin — paiement et contrôle d'âge validés.",
  );

  revalidatePath(`/admin/orders/${parsed.data.orderId}`);
  return { success: true };
}
