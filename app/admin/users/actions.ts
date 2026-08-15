"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireAdmin } from "@/lib/admin/auth";
import { logAudit } from "@/lib/admin/audit";
import { createClient } from "@/lib/supabase/server";
import type { AdminRoleType } from "@/types/database";

export interface UserActionResult {
  success: boolean;
  error?: string;
}

const roleSchema = z.enum(["OWNER", "MANAGER", "CONTENT_EDITOR", "STAFF", "COURIER"]);

/**
 * Assigns or changes an admin role. Restricted to OWNER only — even a
 * MANAGER cannot grant themselves or others elevated access. This is
 * checked here (not just via requireAdminPermission's permission map)
 * since "admin.users" alone doesn't distinguish OWNER from MANAGER.
 */
export async function setUserRoleAction(
  userId: string,
  role: unknown,
): Promise<UserActionResult> {
  const session = await requireAdmin();
  if (session.role !== "OWNER") {
    return { success: false, error: "only_owner_can_manage_roles" };
  }

  try {
    const parsedRole = roleSchema.parse(role) as AdminRoleType;
    const supabase = await createClient();

    const { error } = await supabase
      .from("admin_roles")
      .upsert({ user_id: userId, role: parsedRole }, { onConflict: "user_id,role,branch_id" });

    if (error) throw new Error(error.message);

    await logAudit({
      actor: session.userId,
      action: "staff_role_changed",
      entityType: "staff_role",
      entityId: userId,
      metadata: { role: parsedRole },
    });

    revalidatePath("/admin/users");
    return { success: true };
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : "set_role_failed" };
  }
}

export async function revokeUserRoleAction(roleId: string): Promise<UserActionResult> {
  const session = await requireAdmin();
  if (session.role !== "OWNER") {
    return { success: false, error: "only_owner_can_manage_roles" };
  }

  try {
    const supabase = await createClient();
    const { error } = await supabase.from("admin_roles").delete().eq("id", roleId);
    if (error) throw new Error(error.message);

    await logAudit({
      actor: session.userId,
      action: "staff_role_changed",
      entityType: "staff_role",
      entityId: roleId,
      metadata: { revoked: true },
    });

    revalidatePath("/admin/users");
    return { success: true };
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : "revoke_role_failed" };
  }
}
