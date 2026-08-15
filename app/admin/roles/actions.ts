"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/admin/auth";
import { createServiceRoleClient, createClient } from "@/lib/supabase/server";
import { logAudit } from "@/lib/admin/audit";
import type { AdminRoleType } from "@/types/database";

export interface AdminUserRow {
  userId: string;
  email: string | null;
  firstName: string | null;
  lastName: string | null;
  role: AdminRoleType;
  assignedAt: string;
}

export async function listAdminUsers(): Promise<AdminUserRow[]> {
  await requireAdmin();
  const supabase = createServiceRoleClient();

  const { data: roles } = await supabase
    .from("admin_roles")
    .select("user_id, role, created_at")
    .order("created_at", { ascending: true });

  if (!roles || roles.length === 0) return [];

  const { data: profiles } = await supabase
    .from("profiles")
    .select("id, email, first_name, last_name")
    .in("id", roles.map((r) => r.user_id));

  const profileById = new Map((profiles ?? []).map((p) => [p.id, p]));

  return roles.map((r) => {
    const profile = profileById.get(r.user_id);
    return {
      userId: r.user_id,
      email: profile?.email ?? null,
      firstName: profile?.first_name ?? null,
      lastName: profile?.last_name ?? null,
      role: r.role as AdminRoleType,
      assignedAt: r.created_at,
    };
  });
}

/**
 * Assigns or changes an admin role for a user, identified by email. Only
 * OWNER can call this — enforced here AND by the `admin_roles_owner_write`
 * RLS policy (0002_rls.sql), so even a compromised server action can't
 * bypass it via a non-owner session.
 */
export async function assignRole(
  email: string,
  role: AdminRoleType,
): Promise<{ success: boolean; error?: string }> {
  const session = await requireAdmin();
  if (session.role !== "OWNER") {
    return { success: false, error: "Seul le propriétaire peut attribuer un rôle." };
  }

  const service = createServiceRoleClient();
  const { data: profile } = await service
    .from("profiles")
    .select("id")
    .eq("email", email.trim().toLowerCase())
    .maybeSingle();

  if (!profile) {
    return { success: false, error: "Aucun utilisateur trouvé avec cet email." };
  }

  // Use the caller's own (RLS-bound) client for the actual write, so the
  // database itself re-verifies the OWNER-only policy independently of the
  // application-level check above.
  const supabase = await createClient();
  const { data: existing } = await supabase
    .from("admin_roles")
    .select("id, role")
    .eq("user_id", profile.id)
    .maybeSingle();

  const oldRole = existing?.role ?? null;

  const { error } = existing
    ? await supabase.from("admin_roles").update({ role }).eq("id", existing.id)
    : await supabase.from("admin_roles").insert({ user_id: profile.id, role });

  if (error) {
    return { success: false, error: "Impossible d'attribuer ce rôle." };
  }

  await logAudit({
    actor: session.userId,
    action: "staff_role_changed",
    entityType: "staff_role",
    entityId: profile.id,
    targetUserId: profile.id,
    metadata: { oldRole, newRole: role },
  });

  revalidatePath("/admin/roles");
  return { success: true };
}

export async function revokeRole(userId: string): Promise<{ success: boolean; error?: string }> {
  const session = await requireAdmin();
  if (session.role !== "OWNER") {
    return { success: false, error: "Seul le propriétaire peut retirer un rôle." };
  }
  if (userId === session.userId) {
    return { success: false, error: "Vous ne pouvez pas retirer votre propre rôle." };
  }

  const supabase = await createClient();
  const { data: existing } = await supabase
    .from("admin_roles")
    .select("id, role")
    .eq("user_id", userId)
    .maybeSingle();

  const { error } = await supabase.from("admin_roles").delete().eq("user_id", userId);
  if (error) {
    return { success: false, error: "Impossible de retirer ce rôle." };
  }

  await logAudit({
    actor: session.userId,
    action: "staff_role_changed",
    entityType: "staff_role",
    entityId: userId,
    targetUserId: userId,
    metadata: { oldRole: existing?.role ?? null, newRole: null },
  });

  revalidatePath("/admin/roles");
  return { success: true };
}
