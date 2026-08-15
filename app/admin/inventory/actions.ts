"use server";

import { revalidatePath } from "next/cache";
import { createClient, createServiceRoleClient } from "@/lib/supabase/server";
import { requireAdminPermission } from "@/lib/admin/auth";

export interface AdjustInventoryInput {
  variantId: string;
  branchId: string;
  adjustment: number;
  reason: string;
}

export async function adjustInventory(input: AdjustInventoryInput): Promise<{ success: boolean; error?: string }> {
  await requireAdminPermission("catalog.products");
  const { variantId, branchId, adjustment, reason } = input;
  if (!reason.trim()) {
    return { success: false, error: "Un motif est obligatoire." };
  }

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return { success: false, error: "Non authentifié." };
  }

  const sr = createServiceRoleClient();

  const { data: row } = await sr
    .from("inventory")
    .select("id, quantity")
    .eq("variant_id", variantId)
    .eq("branch_id", branchId)
    .maybeSingle();

  const before = row?.quantity ?? 0;
  const after = before + adjustment;
  if (after < 0) {
    return { success: false, error: "Le stock ne peut pas devenir négatif." };
  }

  if (row) {
    await sr.from("inventory").update({ quantity: after }).eq("id", row.id);
  } else {
    await sr.from("inventory").insert({
      variant_id: variantId,
      branch_id: branchId,
      quantity: after,
    });
  }

  await sr.from("inventory_movements").insert({
    variant_id: variantId,
    branch_id: branchId,
    movement_type: "adjustment",
    quantity: adjustment,
    quantity_before: before,
    quantity_after: after,
    reason: reason.trim(),
    created_by: user.id,
    metadata: { source: "admin-inventory-adjustment" },
  });

  await sr.from("audit_logs").insert({
    actor_user_id: user.id,
    action: "inventory_adjustment",
    entity_type: "inventory",
    entity_id: variantId,
    metadata: { branchId, adjustment, before, after, reason },
  });

  revalidatePath("/admin/inventory");
  return { success: true };
}
