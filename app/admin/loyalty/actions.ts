"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { requireAdminPermission } from "@/lib/admin/auth";
import { createServiceRoleClient } from "@/lib/supabase/server";
import { logAudit } from "@/lib/admin/audit";

const tierSchema = z.object({
  id: z.string().uuid(),
  minSpendAgorot: z.coerce.number().int().min(0),
  pointsMultiplier: z.coerce.number().min(0.1).max(10),
  isActive: z.boolean(),
});

export async function updateLoyaltyTier(
  input: z.infer<typeof tierSchema>,
): Promise<{ success: boolean; error?: string }> {
  const parsed = tierSchema.safeParse(input);
  if (!parsed.success) return { success: false, error: "Formulaire invalide." };

  const session = await requireAdminPermission("loyalty.manage");
  const supabase = createServiceRoleClient();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any -- loyalty_tiers not yet in generated Database type
  const db = supabase as any;

  const { error } = await db
    .from("loyalty_tiers")
    .update({
      min_spend_agorot: parsed.data.minSpendAgorot,
      points_multiplier: parsed.data.pointsMultiplier,
      is_active: parsed.data.isActive,
      updated_at: new Date().toISOString(),
    })
    .eq("id", parsed.data.id);

  if (error) return { success: false, error: "Impossible de mettre à jour ce niveau." };

  await logAudit({
    actor: session.userId,
    action: "settings_changed",
    entityType: "loyalty",
    entityId: parsed.data.id,
  });

  revalidatePath("/admin/loyalty");
  return { success: true };
}

const adjustSchema = z.object({
  email: z.string().trim().email(),
  deltaPoints: z.coerce.number().int(),
  reason: z.string().trim().min(3).max(500),
});

/**
 * Manually adjusts a customer's point balance. Always requires a reason
 * and is always recorded in loyalty_transactions with origin=administrative
 * plus a full before/after snapshot — the client can never modify its own
 * points.
 */
export async function adjustLoyaltyPoints(
  input: z.infer<typeof adjustSchema>,
): Promise<{ success: boolean; error?: string }> {
  const parsed = adjustSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: "Le motif est obligatoire (minimum 3 caractères)." };
  }

  const session = await requireAdminPermission("loyalty.manage");
  const supabase = createServiceRoleClient();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any -- loyalty tables not yet in generated Database type
  const db = supabase as any;

  const { data: profile } = await supabase.from("profiles").select("id").eq("email", parsed.data.email).maybeSingle();
  if (!profile) return { success: false, error: "Aucun client trouvé avec cet email." };

  const { data: account } = await db.from("loyalty_accounts").select("*").eq("user_id", profile.id).maybeSingle();
  const balanceBefore = account?.points_balance ?? 0;
  const balanceAfter = balanceBefore + parsed.data.deltaPoints;

  await db.from("loyalty_accounts").upsert(
    {
      user_id: profile.id,
      points_balance: balanceAfter,
      lifetime_points: Math.max(account?.lifetime_points ?? 0, 0) + Math.max(parsed.data.deltaPoints, 0),
      total_spent_agorot: account?.total_spent_agorot ?? 0,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "user_id" },
  );

  await db.from("loyalty_transactions").insert({
    user_id: profile.id,
    delta_points: parsed.data.deltaPoints,
    balance_before: balanceBefore,
    balance_after: balanceAfter,
    reason: parsed.data.reason,
    origin: "administrative",
    created_by: session.userId,
  });

  await logAudit({
    actor: session.userId,
    action: "points_adjusted",
    entityType: "loyalty",
    entityId: profile.id,
    targetUserId: profile.id,
    reason: parsed.data.reason,
    metadata: { deltaPoints: parsed.data.deltaPoints, balanceBefore, balanceAfter },
  });

  revalidatePath("/admin/loyalty");
  return { success: true };
}
