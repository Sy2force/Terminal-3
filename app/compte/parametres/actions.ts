"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

const preferencesSchema = z.object({
  preferredLanguage: z.enum(["fr", "he"]),
  marketingOptIn: z.boolean(),
});

export async function updatePreferences(
  input: z.infer<typeof preferencesSchema>,
): Promise<{ success: boolean; error?: string }> {
  const parsed = preferencesSchema.safeParse(input);
  if (!parsed.success) return { success: false, error: "Formulaire invalide." };

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { success: false, error: "Non connecté." };

  const { error } = await supabase
    .from("profiles")
    .update({
      preferred_language: parsed.data.preferredLanguage,
      marketing_opt_in: parsed.data.marketingOptIn,
      updated_at: new Date().toISOString(),
      // eslint-disable-next-line @typescript-eslint/no-explicit-any -- preference columns added in 0025, not yet in generated Database type
    } as any)
    .eq("id", user.id);

  if (error) return { success: false, error: "Impossible d'enregistrer." };

  revalidatePath("/compte/parametres");
  return { success: true };
}

/**
 * Records a deletion request timestamp — actual account/data deletion or
 * anonymization is a manual, audited step performed by an administrator,
 * not an instant self-service action (to prevent accidental/abusive
 * deletion and to preserve records required for accounting/legal reasons).
 */
export async function requestAccountDeletion(): Promise<{ success: boolean }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { success: false };

  await supabase
    .from("profiles")
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    .update({ account_deletion_requested_at: new Date().toISOString() } as any)
    .eq("id", user.id);

  revalidatePath("/compte/parametres");
  return { success: true };
}
