"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

const profileSchema = z.object({
  firstName: z.string().trim().max(100),
  lastName: z.string().trim().max(100),
  phone: z.string().trim().max(50),
});

export interface UpdateProfileResult {
  success: boolean;
  error?: string;
}

export async function updateProfile(
  input: z.infer<typeof profileSchema>,
): Promise<UpdateProfileResult> {
  const parsed = profileSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: "Formulaire invalide." };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { success: false, error: "Non connecté." };

  const { error } = await supabase
    .from("profiles")
    .update({
      first_name: parsed.data.firstName || null,
      last_name: parsed.data.lastName || null,
      phone: parsed.data.phone || null,
      updated_at: new Date().toISOString(),
    })
    .eq("id", user.id);

  if (error) return { success: false, error: "Impossible d'enregistrer." };

  revalidatePath("/compte");
  revalidatePath("/compte/profil");
  return { success: true };
}
