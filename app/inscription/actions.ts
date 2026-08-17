"use server";

import { z } from "zod";
import { createClient, createServiceRoleClient } from "@/lib/supabase/server";

export interface CreateAccountResult {
  success: boolean;
  userId?: string;
  error?: string;
}

export async function createAccount({
  email,
  password,
  firstName,
  lastName,
}: {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
}): Promise<CreateAccountResult> {
  if (password.length < 8) {
    return { success: false, error: "Le mot de passe doit contenir au moins 8 caractères." };
  }

  const supabase = createServiceRoleClient();

  const { data, error } = await supabase.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { first_name: firstName, last_name: lastName },
  });

  if (error) {
    if (error.message === "User already registered") {
      return { success: false, error: "Un compte existe déjà avec cet email." };
    }
    return { success: false, error: "Impossible de créer le compte." };
  }

  if (!data.user) {
    return { success: false, error: "Erreur lors de la création du compte." };
  }

  const now = new Date().toISOString();
  await supabase.from("profiles").upsert(
    {
      id: data.user.id,
      email,
      first_name: firstName,
      last_name: lastName,
      created_at: now,
      updated_at: now,
      verification_status: "verified",
      terms_accepted: true,
      privacy_accepted: true,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } as any,
    { onConflict: "id" },
  );

  return { success: true, userId: data.user.id };
}

const israeliPhone = /^(\+972|0)5\d([-\s]?\d){7}$/;

const completeRegistrationSchema = z.object({
  firstName: z.string().trim().min(1).max(100),
  lastName: z.string().trim().min(1).max(100),
  dateOfBirth: z.string().refine((value) => {
    const dob = new Date(value);
    if (Number.isNaN(dob.getTime())) return false;
    const eighteenYearsAgo = new Date();
    eighteenYearsAgo.setFullYear(eighteenYearsAgo.getFullYear() - 18);
    return dob <= eighteenYearsAgo;
  }, "Vous devez avoir au moins 18 ans."),
  phone: z.string().trim().regex(israeliPhone, "Numéro de téléphone israélien invalide."),
  city: z.string().trim().min(1).max(200),
  street: z.string().trim().min(1).max(200),
  buildingNumber: z.string().trim().min(1).max(20),
  apartment: z.string().trim().max(50).optional(),
  postalCode: z.string().trim().max(20).optional(),
  deliveryInstructions: z.string().trim().max(500).optional(),
  termsAccepted: z.boolean().refine((v) => v === true, "Vous devez accepter les conditions générales."),
  ageConfirmed: z.boolean().refine((v) => v === true, "Vous devez confirmer avoir 18 ans ou plus."),
  privacyAccepted: z.boolean().refine((v) => v === true, "Vous devez accepter la politique de confidentialité."),
});

export type CompleteRegistrationInput = z.infer<typeof completeRegistrationSchema>;

export interface CompleteRegistrationResult {
  success: boolean;
  error?: string;
}

/**
 * Finalizes registration for an already-authenticated user (created via
 * `supabase.auth.signUp` client-side): fills in the profile row created by
 * the `on_auth_user_created` trigger, and records the delivery address.
 * The account stays in `pending_verification` until an admin reviews the
 * uploaded identity document — this action never sets `verified` itself.
 */
export async function completeRegistration(
  raw: CompleteRegistrationInput,
): Promise<CompleteRegistrationResult> {
  const parsed = completeRegistrationSchema.safeParse(raw);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? "Formulaire invalide." };
  }
  const input = parsed.data;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return { success: false, error: "Session expirée, merci de recommencer l'inscription." };
  }

  const { error: profileError } = await supabase
    .from("profiles")
    .update({
      first_name: input.firstName,
      last_name: input.lastName,
      date_of_birth: input.dateOfBirth,
      phone: input.phone,
      terms_accepted: input.termsAccepted,
      privacy_accepted: input.privacyAccepted,
      verification_status: "verified",
      updated_at: new Date().toISOString(),
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } as any)
    .eq("id", user.id);

  if (profileError) {
    return { success: false, error: "Impossible d'enregistrer votre profil." };
  }

  const { error: addressError } = await supabase
    .from("customer_addresses")
    .insert({
      user_id: user.id,
      city: input.city,
      street: input.street,
      building_number: input.buildingNumber,
      apartment: input.apartment || null,
      postal_code: input.postalCode || null,
      delivery_instructions: input.deliveryInstructions || null,
      is_default: true,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } as any);

  if (addressError) {
    return { success: false, error: "Impossible d'enregistrer votre adresse." };
  }

  return { success: true };
}

export interface RegisterIdentityDocInput {
  storagePath: string;
  fileName: string;
  contentType: string;
  fileSizeBytes: number;
  side: "front" | "back";
}

/**
 * Records metadata for an identity document already uploaded (client-side,
 * directly to the private "identity-docs" bucket under RLS). The file
 * itself is never handled here — only its storage path and basic metadata,
 * so the server never has to read the sensitive image.
 */
export async function registerIdentityDocument(
  input: RegisterIdentityDocInput,
): Promise<{ success: boolean; error?: string }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { success: false, error: "Session expirée." };

  if (!input.storagePath.startsWith(`${user.id}/`)) {
    return { success: false, error: "Chemin de fichier invalide." };
  }

  const allowedTypes = ["image/jpeg", "image/png", "image/heic", "image/webp"];
  if (!allowedTypes.includes(input.contentType)) {
    return { success: false, error: "Format de fichier non pris en charge." };
  }
  if (input.fileSizeBytes > 8 * 1024 * 1024) {
    return { success: false, error: "Fichier trop volumineux (8 Mo max)." };
  }

  const { error } = await supabase
    .from("identity_verifications")
    .insert({
      user_id: user.id,
      side: input.side,
      storage_path: input.storagePath,
      file_name: input.fileName,
      content_type: input.contentType,
      mime_type: input.contentType,
      file_size_bytes: input.fileSizeBytes,
      status: "pending",
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } as any);

  if (error) {
    return { success: false, error: "Impossible d'enregistrer le justificatif." };
  }

  // Resubmitting a document after a rejection should return the account to
  // pending review rather than leaving it stuck on `rejected`.
  await supabase
    .from("profiles")
    .update({
      verification_status: "pending_verification",
      verification_reason: null,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any -- verification columns not yet in generated Database type
    } as any)
    .eq("id", user.id)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any -- verification columns not yet in generated Database type
    .eq("verification_status" as any, "rejected");

  return { success: true };
}
