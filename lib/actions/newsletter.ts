"use server";

import { z } from "zod";
import { createServiceRoleClient } from "@/lib/supabase/server";

const newsletterSchema = z.object({
  email: z.string().trim().email(),
});

export async function subscribeToNewsletter(
  formData: FormData,
): Promise<{ success: boolean; error?: string }> {
  const parsed = newsletterSchema.safeParse({
    email: formData.get("email"),
  });

  if (!parsed.success) {
    return { success: false, error: "Veuillez entrer une adresse email valide." };
  }

  try {
    const supabase = createServiceRoleClient();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any -- leads not yet in generated Database type
    const db = supabase as any;

    const { data: existing } = await db
      .from("leads")
      .select("id")
      .eq("email", parsed.data.email)
      .eq("source", "newsletter")
      .maybeSingle();

    if (existing) {
      await db
        .from("leads")
        .update({ marketing_opt_in: true, updated_at: new Date().toISOString() })
        .eq("id", existing.id);
      return { success: true };
    }

    const { error } = await db.from("leads").insert({
      name: parsed.data.email,
      email: parsed.data.email,
      source: "newsletter",
      interest: "Newsletter",
      notes: "Inscription via site web",
      marketing_opt_in: true,
    });

    if (error) {
      return { success: false, error: "Une erreur est survenue. Veuillez réessayer." };
    }

    return { success: true };
  } catch {
    return { success: false, error: "Une erreur est survenue. Veuillez réessayer." };
  }
}
