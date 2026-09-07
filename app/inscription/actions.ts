/* eslint-disable @typescript-eslint/no-explicit-any */
"use server";

import { z } from "zod";
import { createServiceRoleClient } from "@/lib/supabase/server";

export interface CreateAccountResult {
  success: boolean;
  userId?: string;
  error?: string;
}

function israeliPhone(value: string | undefined) {
  if (!value) return true;
  return /^(\+972|0)5\d([-\s]?\d){7}$/.test(value);
}

const customerSignupSchema = z.object({
  accountType: z.literal("personal"),
  firstName: z.string().trim().min(1, "Le prénom est requis.").max(100),
  lastName: z.string().trim().min(1, "Le nom est requis.").max(100),
  email: z.string().trim().email("Email invalide.").max(250),
  phone: z
    .string()
    .trim()
    .max(30)
    .refine(israeliPhone, "Numéro de téléphone israélien invalide.")
    .optional()
    .or(z.literal("")),
  password: z.string().min(8, "Le mot de passe doit contenir au moins 8 caractères."),
  ageConfirmed: z.literal(true, { error: "Vous devez confirmer avoir 18 ans ou plus." }),
  termsAccepted: z.literal(true, { error: "Vous devez accepter les conditions générales." }),
  privacyAccepted: z.literal(true, { error: "Vous devez accepter la politique de confidentialité." }),
});

const barSignupSchema = z.object({
  accountType: z.literal("business"),
  businessName: z.string().trim().min(1, "Le nom de l'établissement est requis.").max(200),
  contactFirstName: z.string().trim().min(1, "Le prénom du responsable est requis.").max(100),
  contactLastName: z.string().trim().min(1, "Le nom du responsable est requis.").max(100),
  contactEmail: z.string().trim().email("Email invalide.").max(250),
  contactPhone: z.string().trim().regex(/^(\+972|0)5\d([-\s]?\d){7}$/, "Numéro israélien invalide."),
  whatsapp: z.string().trim().max(30).optional().or(z.literal("")),
  address: z.string().trim().max(300).optional().or(z.literal("")),
  city: z.string().trim().max(100).optional().or(z.literal("")),
  postalCode: z.string().trim().max(20).optional().or(z.literal("")),
  notes: z.string().trim().max(500).optional().or(z.literal("")),
  password: z.string().min(8, "Le mot de passe doit contenir au moins 8 caractères."),
  ageConfirmed: z.literal(true, { error: "Vous devez confirmer avoir 18 ans ou plus." }),
  termsAccepted: z.literal(true, { error: "Vous devez accepter les conditions générales." }),
  privacyAccepted: z.literal(true, { error: "Vous devez accepter la politique de confidentialité." }),
});

export async function createCustomerAccount(raw: unknown): Promise<CreateAccountResult> {
  const parsed = customerSignupSchema.safeParse(raw);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? "Formulaire invalide." };
  }
  const input = parsed.data;

  const supabase = createServiceRoleClient();

  const { data, error } = await supabase.auth.admin.createUser({
    email: input.email,
    password: input.password,
    email_confirm: true,
    user_metadata: { first_name: input.firstName, last_name: input.lastName, phone: input.phone || null },
  });

  if (error) {
    if (error.message.toLowerCase().includes("already registered")) {
      return { success: false, error: "Un compte existe déjà avec cet email." };
    }
    return { success: false, error: "Impossible de créer le compte." };
  }

  if (!data.user) {
    return { success: false, error: "Erreur lors de la création du compte." };
  }

  const { error: profileError } = await supabase.from("profiles").insert(
    {
      id: data.user.id,
      first_name: input.firstName,
      last_name: input.lastName,
      email: input.email,
      phone: input.phone || null,
      account_type: "personal",
      terms_accepted: input.termsAccepted,
      privacy_accepted: input.privacyAccepted,
      verification_status: "verified",
    } as any,
  );

  if (profileError) {
    await supabase.auth.admin.deleteUser(data.user.id);
    return { success: false, error: "Impossible d'enregistrer le profil. Le service est temporairement indisponible." };
  }

  return { success: true, userId: data.user.id };
}

export async function createBarAccount(raw: unknown): Promise<CreateAccountResult> {
  const parsed = barSignupSchema.safeParse(raw);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? "Formulaire invalide." };
  }
  const input = parsed.data;

  const supabase = createServiceRoleClient();

  const { data, error } = await supabase.auth.admin.createUser({
    email: input.contactEmail,
    password: input.password,
    email_confirm: true,
    user_metadata: {
      first_name: input.contactFirstName,
      last_name: input.contactLastName,
      phone: input.contactPhone,
      business_name: input.businessName,
    },
  });

  if (error) {
    if (error.message.toLowerCase().includes("already registered")) {
      return { success: false, error: "Un compte existe déjà avec cet email." };
    }
    return { success: false, error: "Impossible de créer le compte." };
  }

  if (!data.user) {
    return { success: false, error: "Erreur lors de la création du compte." };
  }

  const now = new Date().toISOString();

  const { error: profileError } = await supabase.from("profiles").insert(
    {
      id: data.user.id,
      first_name: input.contactFirstName,
      last_name: input.contactLastName,
      email: input.contactEmail,
      phone: input.contactPhone,
      account_type: "business",
      terms_accepted: input.termsAccepted,
      privacy_accepted: input.privacyAccepted,
      verification_status: "verified",
    } as any,
  );

  if (profileError) {
    await supabase.auth.admin.deleteUser(data.user.id);
    return { success: false, error: "Impossible d'enregistrer le profil." };
  }

  const { data: barProfile, error: barError } = await supabase
    .from("bar_profiles")
    .insert({
      user_id: data.user.id,
      business_name: input.businessName,
      contact_first_name: input.contactFirstName,
      contact_last_name: input.contactLastName,
      contact_phone: input.contactPhone,
      contact_email: input.contactEmail,
      whatsapp_number: input.whatsapp || null,
      address: input.address || null,
      city: input.city || null,
      postal_code: input.postalCode || null,
      notes: input.notes || null,
      status: "new",
      created_at: now,
      updated_at: now,
    } as any)
    .select("id")
    .single();

  if (barError) {
    await supabase.auth.admin.deleteUser(data.user.id);
    return { success: false, error: "Impossible d'enregistrer la fiche professionnelle." };
  }

  const { error: leadError } = await supabase.from("leads").insert({
    name: input.businessName,
    phone: input.contactPhone,
    email: input.contactEmail,
    source: "bar_signup",
    interest: input.notes || "Inscription bar",
    marketing_opt_in: false,
    converted_user_id: data.user.id,
    bar_profile_id: barProfile?.id || null,
  } as any);

  if (leadError) {
    // A lead failure is not fatal to the signup, so don't delete the user.
    // Log would go here in production; we ignore for now.
  }

  return { success: true, userId: data.user.id };
}

/**
 * @deprecated Kept for compatibility with identity-doc-upload component.
 * The new signup flow does not require document upload.
 */
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

  return { success: true, userId: data.user.id };
}

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
  phone: z.string().trim().regex(/^((\+972|0)5\d([-\s]?\d){7})$/, "Numéro de téléphone israélien invalide."),
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

export async function completeRegistration(
  raw: CompleteRegistrationInput,
): Promise<CompleteRegistrationResult> {
  const parsed = completeRegistrationSchema.safeParse(raw);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? "Formulaire invalide." };
  }
  const input = parsed.data;

  const supabase = await import("@/lib/supabase/server").then((m) => m.createClient());
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
    } as any)
    .eq("id", user.id);

  if (profileError) {
    return { success: false, error: "Impossible d'enregistrer votre profil." };
  }

  const { error: addressError } = await supabase.from("customer_addresses").insert({
    user_id: user.id,
    city: input.city,
    street: input.street,
    building_number: input.buildingNumber,
    apartment: input.apartment || null,
    postal_code: input.postalCode || null,
    delivery_instructions: input.deliveryInstructions || null,
    is_default: true,
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

export async function registerIdentityDocument(
  input: RegisterIdentityDocInput,
): Promise<{ success: boolean; error?: string }> {
  const supabase = await import("@/lib/supabase/server").then((m) => m.createClient());
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

  const { error } = await supabase.from("identity_verifications").insert({
    user_id: user.id,
    side: input.side,
    storage_path: input.storagePath,
    file_name: input.fileName,
    content_type: input.contentType,
    mime_type: input.contentType,
    file_size_bytes: input.fileSizeBytes,
    status: "pending",
  } as any);

  if (error) {
    return { success: false, error: "Impossible d'enregistrer le justificatif." };
  }

  await supabase
    .from("profiles")
    .update({
      verification_status: "pending_verification",
      verification_reason: null,
    } as any)
    .eq("id", user.id)
    .eq("verification_status" as any, "rejected");

  return { success: true };
}
