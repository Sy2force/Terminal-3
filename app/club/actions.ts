"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export interface JoinClubResult {
  success: boolean;
  error?: string;
}

export async function joinClub(): Promise<JoinClubResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, error: "Vous devez être connecté." };
  }

  const { error } = await supabase.from("club_memberships").insert({
    user_id: user.id,
    status: "active",
    source: "web",
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
