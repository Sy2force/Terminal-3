"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";

export interface JoinClubResult {
  success: boolean;
  error?: string;
}

const joinClubSchema = z.object({
  firstName: z.string().trim().min(1, "Le prénom est requis.").max(100),
  lastName: z.string().trim().min(1, "Le nom est requis.").max(100),
  phone: z
    .string()
    .trim()
    .regex(/^[0-9+()\s-]{7,20}$/, "Numéro de téléphone invalide."),
  email: z.string().trim().email("Adresse e-mail invalide."),
  dateOfBirth: z.string().trim().max(20).optional(),
  preferredLanguage: z.enum(["fr", "he", "en"]).optional(),
  preferences: z.array(z.enum(["vins", "whisky", "charcuterie", "poissons"])).default([]),
  marketingConsent: z.boolean().default(false),
  privacyAccepted: z.literal(true, {
    message: "Merci d'accepter la politique de confidentialité.",
  }),
});

export type JoinClubInput = z.infer<typeof joinClubSchema>;

/**
 * Joins the club for the currently authenticated user. Requires an
 * account (the storefront's existing auth model — no anonymous writes)
 * so membership can never be forged: `user_id` always comes from the
 * server-verified session, never from client input. The duplicate
 * (user_id) constraint means a second join attempt is treated as
 * "already a member" rather than an error.
 */
export async function joinClub(rawInput: unknown): Promise<JoinClubResult> {
  const parsed = joinClubSchema.safeParse(rawInput);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? "Formulaire invalide." };
  }
  const input = parsed.data;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, error: "Vous devez être connecté." };
  }

  const { error: profileError } = await supabase
    .from("profiles")
    .update({
      first_name: input.firstName,
      last_name: input.lastName,
      phone: input.phone,
      email: input.email,
      updated_at: new Date().toISOString(),
    })
    .eq("id", user.id);
  if (profileError) {
    return { success: false, error: "Impossible d'enregistrer vos informations." };
  }

  const { error } = await supabase.from("club_memberships").insert({
    user_id: user.id,
    status: "active",
    source: "web",
    date_of_birth: input.dateOfBirth || null,
    preferred_language: input.preferredLanguage ?? "fr",
    preferences: input.preferences,
    marketing_consent: input.marketingConsent,
    privacy_accepted: input.privacyAccepted,
  });

  // Unique (user_id) constraint means a second join attempt errors — that's
  // fine, it just means they're already a member.
  if (error && !error.message.includes("duplicate")) {
    return { success: false, error: "Impossible de rejoindre le club." };
  }

  revalidatePath("/club");
  revalidatePath("/account");
  return { success: true };
}
