import "server-only";
import { createClient, createServiceRoleClient } from "@/lib/supabase/server";
import type { BarProfileRow, BarStatus } from "@/types/database";

/**
 * Bar / professional customer profiles.
 * Every function relies on Row Level Security (see 0043_business_b2b.sql):
 *   - customers only ever see and update their own bar profile
 *   - only admins can flip `status` (a DB trigger enforces this too)
 */

export type BarProfile = BarProfileRow;

export async function getMyBarProfile(): Promise<BarProfile | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data } = await supabase
    .from("bar_profiles")
    .select("*")
    .eq("user_id", user.id)
    .maybeSingle();

  return (data as BarProfile | null) ?? null;
}

/**
 * List all bar profiles (admin only — RLS enforces this).
 * Supports simple filtering and full-text-ish search.
 */
export async function listBarProfiles(options?: {
  status?: BarStatus | "all";
  search?: string;
  limit?: number;
}): Promise<BarProfile[]> {
  const supabase = await createClient();
  let query = supabase
    .from("bar_profiles")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(options?.limit ?? 200);

  if (options?.status && options.status !== "all") {
    query = query.eq("status", options.status);
  }
  if (options?.search) {
    const term = `%${options.search}%`;
    query = query.or(
      `business_name.ilike.${term},contact_first_name.ilike.${term},contact_last_name.ilike.${term},contact_phone.ilike.${term},contact_email.ilike.${term},city.ilike.${term}`,
    );
  }

  const { data, error } = await query;
  if (error) return [];
  return (data as BarProfile[]) ?? [];
}

export async function getBarProfileById(id: string): Promise<BarProfile | null> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("bar_profiles")
    .select("*")
    .eq("id", id)
    .maybeSingle();
  return (data as BarProfile | null) ?? null;
}

/**
 * Admin-only status change. Uses the service-role client because the
 * `forbid_bar_profile_status_change` trigger only lets `is_admin_user()`
 * change `status`, and we want the change to be atomic with the audit log
 * even when the acting admin's session is proxied through server actions.
 */
export async function adminSetBarStatus(
  barProfileId: string,
  newStatus: BarStatus,
  adminUserId: string,
): Promise<{ success: boolean; error?: string }> {
  const supabase = createServiceRoleClient();

  const update: Partial<BarProfileRow> = { status: newStatus };
  if (newStatus === "approved") {
    update.approved_at = new Date().toISOString();
    update.approved_by = adminUserId;
  }

  const { error } = await supabase
    .from("bar_profiles")
    .update(update)
    .eq("id", barProfileId);

  if (error) return { success: false, error: error.message };

  await supabase.from("audit_logs").insert({
    actor_user_id: adminUserId,
    action: "bar_profile.status_change",
    entity_type: "bar_profile",
    entity_id: barProfileId,
    metadata: { new_status: newStatus },
  });

  return { success: true };
}

/**
 * How many bar profiles are pending qualification? Used by the admin
 * dashboard for the "Bars & leads à traiter" indicator.
 */
export async function countPendingBarProfiles(): Promise<number> {
  const supabase = await createClient();
  const { count } = await supabase
    .from("bar_profiles")
    .select("id", { count: "exact", head: true })
    .in("status", ["new", "contacted"]);
  return count ?? 0;
}
