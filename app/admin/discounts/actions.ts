"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { requireAdminPermission } from "@/lib/admin/auth";
import { createServiceRoleClient } from "@/lib/supabase/server";
import { logAudit } from "@/lib/admin/audit";

const discountSchema = z.object({
  code: z.string().trim().max(50).optional(),
  nameFr: z.string().trim().min(1).max(200),
  discountType: z.enum(["percent", "fixed_amount"]),
  discountValue: z.coerce.number().positive(),
  minOrderAgorot: z.coerce.number().int().min(0).default(0),
  maxDiscountAgorot: z.coerce.number().int().min(0).optional(),
  maxUses: z.coerce.number().int().min(1).optional(),
  maxUsesPerCustomer: z.coerce.number().int().min(1).default(1),
  stackable: z.boolean().default(false),
});

export async function createDiscountRule(
  input: z.infer<typeof discountSchema>,
): Promise<{ success: boolean; error?: string }> {
  const parsed = discountSchema.safeParse(input);
  if (!parsed.success) return { success: false, error: "Formulaire invalide." };

  const session = await requireAdminPermission("discounts.manage");
  const supabase = createServiceRoleClient();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any -- discount_rules not yet in generated Database type
  const db = supabase as any;

  const { data, error } = await db
    .from("discount_rules")
    .insert({
      code: parsed.data.code || null,
      name_fr: parsed.data.nameFr,
      discount_type: parsed.data.discountType,
      discount_value: parsed.data.discountValue,
      min_order_agorot: parsed.data.minOrderAgorot,
      max_discount_agorot: parsed.data.maxDiscountAgorot ?? null,
      max_uses: parsed.data.maxUses ?? null,
      max_uses_per_customer: parsed.data.maxUsesPerCustomer,
      stackable: parsed.data.stackable,
    })
    .select("id")
    .single();

  if (error) return { success: false, error: "Impossible de créer la remise." };

  await logAudit({
    actor: session.userId,
    action: "promotion_created",
    entityType: "discount",
    entityId: data.id,
  });

  revalidatePath("/admin/discounts");
  return { success: true };
}

export async function toggleDiscountRule(id: string, isActive: boolean): Promise<{ success: boolean }> {
  const session = await requireAdminPermission("discounts.manage");
  const supabase = createServiceRoleClient();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any -- discount_rules not yet in generated Database type
  const db = supabase as any;

  await db.from("discount_rules").update({ is_active: isActive, updated_at: new Date().toISOString() }).eq("id", id);

  await logAudit({
    actor: session.userId,
    action: "promotion_edited",
    entityType: "discount",
    entityId: id,
    metadata: { isActive },
  });

  revalidatePath("/admin/discounts");
  return { success: true };
}
