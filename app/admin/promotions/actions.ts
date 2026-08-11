"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireAdminPermission } from "@/lib/admin/auth";
import { logAudit } from "@/lib/admin/audit";
import {
  createPromotion,
  updatePromotion,
  deletePromotion,
} from "@/lib/data/promotions-admin";

const promotionSchema = z.object({
  slug: z.string().min(1).max(160).regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
  title: z.string().min(1).max(200),
  description: z.string().max(2000).nullable().optional(),
  product_id: z.string().uuid().nullable().optional(),
  variant_id: z.string().uuid().nullable().optional(),
  branch_id: z.string().uuid().nullable().optional(),
  regular_price_agorot: z.number().int().min(0),
  promo_price_agorot: z.number().int().min(0),
  start_at: z.string().datetime(),
  end_at: z.string().datetime(),
  quantity_limit: z.number().int().min(1).nullable().optional(),
  members_only: z.boolean().default(false),
  featured: z.boolean().default(false),
  status: z.enum(["draft", "scheduled", "active", "expired", "paused"]).default("draft"),
});

export type PromotionFormData = z.infer<typeof promotionSchema>;

export interface PromotionActionResult {
  success: boolean;
  error?: string;
}

export async function createPromotionAction(
  input: unknown,
): Promise<PromotionActionResult> {
  const session = await requireAdminPermission("marketing.promotions");
  const parsed = promotionSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: "Formulaire invalide." };
  }

  try {
    const promotion = await createPromotion(parsed.data);
    await logAudit({
      actor: session.userId,
      action: "promotion_created",
      entityType: "promotion",
      entityId: promotion.id,
      metadata: { slug: promotion.slug },
    });
    revalidatePath("/admin/promotions");
    revalidatePath("/promotions");
    revalidatePath("/");
    return { success: true };
  } catch (err) {
    const message = err instanceof Error ? err.message : "create_failed";
    return { success: false, error: message };
  }
}

export async function updatePromotionAction(
  id: string,
  input: unknown,
): Promise<PromotionActionResult> {
  const session = await requireAdminPermission("marketing.promotions");
  const parsed = promotionSchema.partial().safeParse(input);
  if (!parsed.success || Object.keys(parsed.data ?? {}).length === 0) {
    return { success: false, error: "Formulaire invalide." };
  }

  try {
    const promotion = await updatePromotion(id, parsed.data);
    await logAudit({
      actor: session.userId,
      action: "promotion_edited",
      entityType: "promotion",
      entityId: promotion.id,
      metadata: { slug: promotion.slug },
    });
    revalidatePath("/admin/promotions");
    revalidatePath(`/admin/promotions/${id}`);
    revalidatePath("/promotions");
    revalidatePath("/");
    return { success: true };
  } catch (err) {
    const message = err instanceof Error ? err.message : "update_failed";
    return { success: false, error: message };
  }
}

export async function deletePromotionAction(
  id: string,
): Promise<PromotionActionResult> {
  const session = await requireAdminPermission("marketing.promotions");
  try {
    await deletePromotion(id);
    await logAudit({
      actor: session.userId,
      action: "deleted",
      entityType: "promotion",
      entityId: id,
    });
    revalidatePath("/admin/promotions");
    revalidatePath("/promotions");
    revalidatePath("/");
    return { success: true };
  } catch (err) {
    const message = err instanceof Error ? err.message : "delete_failed";
    return { success: false, error: message };
  }
}
