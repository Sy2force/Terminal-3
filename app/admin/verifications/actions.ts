"use server";

import { revalidatePath } from "next/cache";
import { requireAdminPermission } from "@/lib/admin/auth";
import { createServiceRoleClient } from "@/lib/supabase/server";
import { logAudit } from "@/lib/admin/audit";
import { getSignedIdentityDocUrl } from "@/lib/data/verification";

export interface PendingVerificationRow {
  userId: string;
  firstName: string | null;
  lastName: string | null;
  email: string | null;
  phone: string | null;
  status: string;
  createdAt: string;
  documentId: string | null;
  documentSide: string | null;
  documentCreatedAt: string | null;
}

/**
 * Lists customers whose verification is pending, rejected or suspended,
 * along with their most recent identity document. Requires
 * `customers.verify` (OWNER/MANAGER/STAFF).
 */
export async function listVerificationRequests(
  search?: string,
): Promise<PendingVerificationRow[]> {
  await requireAdminPermission("customers.verify");
  const supabase = createServiceRoleClient();

  let query = supabase
    .from("profiles")
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    .select("id, first_name, last_name, email, phone, verification_status, created_at" as any)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    .in("verification_status" as any, ["pending_verification", "rejected", "suspended"])
    .order("created_at", { ascending: true });

  if (search) {
    query = query.or(
      `first_name.ilike.%${search}%,last_name.ilike.%${search}%,email.ilike.%${search}%,phone.ilike.%${search}%`,
    );
  }

  const { data: profiles } = await query;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const rows = (profiles ?? []) as any[];
  if (rows.length === 0) return [];

  const { data: docs } = await supabase
    .from("identity_verifications")
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    .select("id, user_id, side, created_at" as any)
    .in(
      "user_id",
      rows.map((r) => r.id),
    )
    .order("created_at", { ascending: false });

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const docsByUser = new Map<string, any>();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  for (const doc of (docs ?? []) as any[]) {
    if (!docsByUser.has(doc.user_id)) docsByUser.set(doc.user_id, doc);
  }

  return rows.map((row) => {
    const doc = docsByUser.get(row.id);
    return {
      userId: row.id,
      firstName: row.first_name,
      lastName: row.last_name,
      email: row.email,
      phone: row.phone,
      status: row.verification_status,
      createdAt: row.created_at,
      documentId: doc?.id ?? null,
      documentSide: doc?.side ?? null,
      documentCreatedAt: doc?.created_at ?? null,
    };
  });
}

export async function getIdentityDocSignedUrl(documentId: string): Promise<string | null> {
  await requireAdminPermission("customers.verify");
  const supabase = createServiceRoleClient();
  const { data: doc } = await supabase
    .from("identity_verifications")
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    .select("storage_path" as any)
    .eq("id", documentId)
    .maybeSingle();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const storagePath = (doc as any)?.storage_path;
  if (!storagePath) return null;
  return getSignedIdentityDocUrl(storagePath);
}

export async function approveVerification(userId: string): Promise<{ success: boolean; error?: string }> {
  const session = await requireAdminPermission("customers.verify");
  const supabase = createServiceRoleClient();

  const { error } = await supabase
    .from("profiles")
    .update({
      verification_status: "verified",
      verification_decided_at: new Date().toISOString(),
      verification_decided_by: session.userId,
      verification_reason: null,
      updated_at: new Date().toISOString(),
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } as any)
    .eq("id", userId);

  if (error) return { success: false, error: "Impossible de valider ce compte." };

  await logAudit({
    actor: session.userId,
    action: "identity_verified",
    entityType: "identity_verification",
    entityId: userId,
    targetUserId: userId,
  });

  revalidatePath("/admin/verifications");
  return { success: true };
}

export async function rejectVerification(
  userId: string,
  reason: string,
): Promise<{ success: boolean; error?: string }> {
  if (!reason.trim()) {
    return { success: false, error: "Un motif de refus est obligatoire." };
  }
  const session = await requireAdminPermission("customers.verify");
  const supabase = createServiceRoleClient();

  const { error } = await supabase
    .from("profiles")
    .update({
      verification_status: "rejected",
      verification_decided_at: new Date().toISOString(),
      verification_decided_by: session.userId,
      verification_reason: reason.trim(),
      updated_at: new Date().toISOString(),
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } as any)
    .eq("id", userId);

  if (error) return { success: false, error: "Impossible de refuser ce compte." };

  await logAudit({
    actor: session.userId,
    action: "identity_rejected",
    entityType: "identity_verification",
    entityId: userId,
    targetUserId: userId,
    reason: reason.trim(),
  });

  revalidatePath("/admin/verifications");
  return { success: true };
}

export async function requestNewDocument(
  userId: string,
): Promise<{ success: boolean; error?: string }> {
  const session = await requireAdminPermission("customers.verify");
  const supabase = createServiceRoleClient();

  const { error } = await supabase
    .from("profiles")
    .update({
      verification_status: "rejected",
      verification_reason: "Document illisible ou incomplet — merci d'en envoyer un nouveau.",
      verification_decided_at: new Date().toISOString(),
      verification_decided_by: session.userId,
      updated_at: new Date().toISOString(),
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } as any)
    .eq("id", userId);

  if (error) return { success: false, error: "Action impossible." };

  await logAudit({
    actor: session.userId,
    action: "identity_resubmission_requested",
    entityType: "identity_verification",
    entityId: userId,
    targetUserId: userId,
  });

  revalidatePath("/admin/verifications");
  return { success: true };
}

export interface VerificationAuditRow {
  id: string;
  action: string;
  reason: string | null;
  createdAt: string;
  actorEmail: string | null;
}

export async function listVerificationHistory(userId: string): Promise<VerificationAuditRow[]> {
  await requireAdminPermission("customers.verify");
  const supabase = createServiceRoleClient();
  const { data } = await supabase
    .from("audit_logs")
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    .select("id, action, reason, created_at, actor_user_id" as any)
    .eq("entity_type", "identity_verification")
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    .eq("target_user_id" as any, userId)
    .order("created_at", { ascending: false });

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const rows = (data ?? []) as any[];
  if (rows.length === 0) return [];

  const actorIds = [...new Set(rows.map((r) => r.actor_user_id).filter(Boolean))];
  const { data: actors } = actorIds.length
    ? await supabase.from("profiles").select("id, email").in("id", actorIds)
    : { data: [] };
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const emailById = new Map(((actors ?? []) as any[]).map((a) => [a.id, a.email]));

  return rows.map((r) => ({
    id: r.id,
    action: r.action,
    reason: r.reason,
    createdAt: r.created_at,
    actorEmail: emailById.get(r.actor_user_id) ?? null,
  }));
}
