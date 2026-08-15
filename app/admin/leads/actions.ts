"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { requireAdminPermission } from "@/lib/admin/auth";
import { createServiceRoleClient } from "@/lib/supabase/server";
import { logAudit } from "@/lib/admin/audit";

const LEAD_STATUSES = [
  "new",
  "to_contact",
  "contacted",
  "interested",
  "converting",
  "converted",
  "lost",
] as const;

const leadSchema = z.object({
  name: z.string().trim().min(1).max(200),
  phone: z.string().trim().max(50).optional(),
  email: z.string().trim().email().optional().or(z.literal("")),
  source: z.string().trim().max(100).default("manual"),
  interest: z.string().trim().max(500).optional(),
  categoryOfInterest: z.string().trim().max(200).optional(),
  notes: z.string().trim().max(2000).optional(),
});

export async function createLead(
  input: z.infer<typeof leadSchema>,
): Promise<{ success: boolean; error?: string }> {
  const parsed = leadSchema.safeParse(input);
  if (!parsed.success) return { success: false, error: "Formulaire invalide." };

  await requireAdminPermission("customers.view");
  const supabase = createServiceRoleClient();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any -- leads not yet in generated Database type
  const db = supabase as any;

  const { error } = await db.from("leads").insert({
    name: parsed.data.name,
    phone: parsed.data.phone || null,
    email: parsed.data.email || null,
    source: parsed.data.source,
    interest: parsed.data.interest || null,
    category_of_interest: parsed.data.categoryOfInterest || null,
    notes: parsed.data.notes || null,
  });

  if (error) return { success: false, error: "Impossible de créer le lead." };

  revalidatePath("/admin/leads");
  return { success: true };
}

const leadStatusSchema = z.enum(LEAD_STATUSES);

export async function updateLeadStatus(
  leadId: string,
  rawStatus: (typeof LEAD_STATUSES)[number],
): Promise<{ success: boolean; error?: string }> {
  const parsedStatus = leadStatusSchema.safeParse(rawStatus);
  if (!parsedStatus.success) return { success: false, error: "Statut invalide." };
  const status = parsedStatus.data;

  const session = await requireAdminPermission("customers.view");
  const supabase = createServiceRoleClient();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any -- leads not yet in generated Database type
  const db = supabase as any;

  const { error } = await db
    .from("leads")
    .update({ status, updated_at: new Date().toISOString() })
    .eq("id", leadId);

  if (error) return { success: false, error: "Impossible de mettre à jour le statut." };

  await logAudit({
    actor: session.userId,
    action: "status_changed",
    entityType: "lead",
    entityId: leadId,
    metadata: { leadStatus: status },
  });

  revalidatePath("/admin/leads");
  return { success: true };
}

/**
 * Converts a lead into a customer WITHOUT ever creating a duplicate
 * account: if a profile already exists with the same email or phone, the
 * lead is linked to it; otherwise the lead simply stays a lead until the
 * person actually registers (accounts are only ever created through real
 * signup — this never fabricates an auth.users row).
 */
export async function convertLead(leadId: string): Promise<{ success: boolean; error?: string }> {
  const session = await requireAdminPermission("customers.view");
  const supabase = createServiceRoleClient();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any -- leads not yet in generated Database type
  const db = supabase as any;

  const { data: lead } = await db.from("leads").select("*").eq("id", leadId).maybeSingle();
  if (!lead) return { success: false, error: "Lead introuvable." };

  let matchedProfile = null;
  if (lead.email) {
    const { data } = await supabase.from("profiles").select("id").eq("email", lead.email).maybeSingle();
    matchedProfile = data;
  }
  if (!matchedProfile && lead.phone) {
    const { data } = await supabase.from("profiles").select("id").eq("phone", lead.phone).maybeSingle();
    matchedProfile = data;
  }

  if (!matchedProfile) {
    return {
      success: false,
      error: "Aucun compte client existant avec cet email/téléphone. Le lead sera converti automatiquement dès son inscription.",
    };
  }

  await db
    .from("leads")
    .update({ status: "converted", converted_user_id: matchedProfile.id, updated_at: new Date().toISOString() })
    .eq("id", leadId);

  await logAudit({
    actor: session.userId,
    action: "status_changed",
    entityType: "lead",
    entityId: leadId,
    targetUserId: matchedProfile.id,
    metadata: { leadConverted: true },
  });

  revalidatePath("/admin/leads");
  return { success: true };
}
