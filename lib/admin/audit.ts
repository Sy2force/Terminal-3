"use server";

import { createServiceRoleClient } from "@/lib/supabase/server";

export type AuditEntity =
  | "product"
  | "product_variant"
  | "category"
  | "promotion"
  | "order"
  | "age_verification"
  | "site_setting"
  | "staff_role"
  | "homepage_section"
  | "delivery"
  | "membership"
  | "media"
  | "payment"
  | "identity_verification"
  | "lead"
  | "loyalty"
  | "discount";

export type AuditAction =
  | "created"
  | "updated"
  | "deleted"
  | "published"
  | "archived"
  | "price_changed"
  | "stock_changed"
  | "status_changed"
  | "promotion_created"
  | "promotion_edited"
  | "settings_changed"
  | "staff_role_changed"
  | "age_verified"
  | "age_verification_failed"
  | "homepage_section_created"
  | "homepage_section_edited"
  | "homepage_section_deleted"
  | "homepage_section_toggled"
  | "delivery_assigned"
  | "scheduled"
  | "restored"
  | "identity_verified"
  | "identity_rejected"
  | "identity_resubmission_requested"
  | "points_adjusted"
  | "reward_granted"
  | "payment_confirmed"
  | "payment_refunded"
  | "export_generated";

export interface AuditPayload {
  actor: string;
  action: AuditAction;
  entityType: AuditEntity;
  entityId?: string;
  metadata?: Record<string, unknown>;
  targetUserId?: string;
  reason?: string;
}

/**
 * Writes an immutable audit log row. Uses the service-role client because
 * regular users and even staff do not have INSERT privileges on audit_logs.
 */
export async function logAudit(payload: AuditPayload): Promise<void> {
  try {
    const supabase = createServiceRoleClient();
    await supabase.from("audit_logs").insert({
      actor_user_id: payload.actor,
      action: payload.action,
      entity_type: payload.entityType,
      entity_id: payload.entityId ?? null,
      metadata: payload.metadata ?? {},
      // eslint-disable-next-line @typescript-eslint/no-explicit-any -- target_user_id/reason added in 0021, not yet in generated Database type
      ...({ target_user_id: payload.targetUserId ?? null, reason: payload.reason ?? null } as any),
    });
  } catch {
    // Audit logging must never break user-facing operations.
  }
}
