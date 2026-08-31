"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createClient, createServiceRoleClient } from "@/lib/supabase/server";

const israeliPhone = /^(\+972|0)5\d([-\s]?\d){7}$/;
// Accept any 7+ digit "phone-ish" string for whatsapp (international bars).
const anyPhone = /^[+\d][\d\s\-()]{5,}$/;

const barProfileSchema = z.object({
  businessName: z.string().trim().min(1, "Le nom du bar est requis.").max(200),
  legalName: z.string().trim().max(200).optional(),
  registrationNumber: z.string().trim().max(50).optional(),
  contactFirstName: z.string().trim().min(1, "Prénom requis.").max(100),
  contactLastName: z.string().trim().min(1, "Nom requis.").max(100),
  contactPhone: z
    .string()
    .trim()
    .regex(israeliPhone, "Numéro de téléphone israélien invalide."),
  whatsappNumber: z
    .string()
    .trim()
    .regex(anyPhone, "Numéro WhatsApp invalide.")
    .optional()
    .or(z.literal("")),
  contactEmail: z.string().trim().email("Email invalide.").optional().or(z.literal("")),
  address: z.string().trim().max(300).optional(),
  city: z.string().trim().max(100).optional(),
  postalCode: z.string().trim().max(20).optional(),
  preferredContactWindow: z.string().trim().max(120).optional(),
  pickupPreference: z
    .enum(["self", "delegate", "delivery_when_available"])
    .optional(),
  notes: z.string().trim().max(1000).optional(),
});

export type BarProfileInput = z.infer<typeof barProfileSchema>;

export interface BarProfileResult {
  success: boolean;
  barProfileId?: string;
  error?: string;
}

/**
 * Creates or updates the current user's bar profile. Also flips
 * `profiles.account_type` to `business` and pushes a lead into the
 * existing `leads` table (via service role, since customers don't have
 * insert rights on `leads`).
 */
export async function upsertMyBarProfile(
  raw: BarProfileInput,
): Promise<BarProfileResult> {
  const parsed = barProfileSchema.safeParse(raw);
  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.issues[0]?.message ?? "Formulaire invalide.",
    };
  }
  const input = parsed.data;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return { success: false, error: "Vous devez être connecté." };
  }

  // Look up existing profile so we know whether to insert or update
  // (unique(user_id) on bar_profiles guarantees at most one row per user).
  const { data: existing } = await supabase
    .from("bar_profiles")
    .select("id, status")
    .eq("user_id", user.id)
    .maybeSingle();

  const payload = {
    user_id: user.id,
    business_name: input.businessName,
    legal_name: input.legalName || null,
    registration_number: input.registrationNumber || null,
    contact_first_name: input.contactFirstName,
    contact_last_name: input.contactLastName,
    contact_phone: input.contactPhone,
    whatsapp_number: input.whatsappNumber || null,
    contact_email: input.contactEmail || null,
    address: input.address || null,
    city: input.city || null,
    postal_code: input.postalCode || null,
    preferred_contact_window: input.preferredContactWindow || null,
    pickup_preference: input.pickupPreference ?? "self",
    notes: input.notes || null,
  };

  let barProfileId: string;

  if (existing) {
    // Customers can update any field EXCEPT status (see DB trigger). We
    // never touch status here — the admin does it from /admin/bars.
    const { data, error } = await supabase
      .from("bar_profiles")
      .update(payload)
      .eq("id", existing.id)
      .select("id")
      .single();

    if (error || !data) {
      return { success: false, error: "Impossible d'enregistrer la fiche." };
    }
    barProfileId = data.id;
  } else {
    const { data, error } = await supabase
      .from("bar_profiles")
      .insert(payload)
      .select("id")
      .single();

    if (error || !data) {
      return { success: false, error: "Impossible d'enregistrer la fiche." };
    }
    barProfileId = data.id;

    // Mark the profile as business
    await supabase
      .from("profiles")
      .update({ account_type: "business" })
      .eq("id", user.id);

    // Push a lead into the existing leads table (RLS forbids customers
    // from writing there; use the service role client for this single
    // audit-friendly insert). `leads` isn't in the hand-written Database
    // type yet, so we cast this single call.
    try {
      const serviceClient = createServiceRoleClient();
      // eslint-disable-next-line @typescript-eslint/no-explicit-any -- leads table not yet in generated Database type
      await (serviceClient as any).from("leads").insert({
        name: `${input.businessName} — ${input.contactFirstName} ${input.contactLastName}`,
        phone: input.contactPhone,
        email: input.contactEmail || null,
        source: "bar_signup",
        status: "new",
        interest: "wholesale",
        bar_profile_id: barProfileId,
        marketing_opt_in: false,
      });
    } catch {
      // ignored — bar profile creation must succeed even if the lead
      // insert fails (missing service role key in dev, RLS conflict, ...).
    }
  }

  revalidatePath("/compte/bar");
  revalidatePath("/admin/bars");
  return { success: true, barProfileId };
}
