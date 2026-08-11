"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export interface ToggleFavoriteResult {
  success: boolean;
  favorited: boolean;
  error?: string;
}

/**
 * Toggles a favorite for the current user. Requires login — the caller
 * (FavoriteButton) redirects to /login first if there's no session.
 */
export async function toggleFavorite(
  productId: string,
): Promise<ToggleFavoriteResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return {
      success: false,
      favorited: false,
      error: "Vous devez être connecté pour ajouter un favori.",
    };
  }

  const { data: existing } = await supabase
    .from("favorites")
    .select("id")
    .eq("user_id", user.id)
    .eq("product_id", productId)
    .maybeSingle();

  if (existing) {
    const { error } = await supabase
      .from("favorites")
      .delete()
      .eq("id", existing.id);
    if (error) return { success: false, favorited: true, error: "Erreur." };
    revalidatePath("/account/favorites");
    return { success: true, favorited: false };
  }

  const { error } = await supabase
    .from("favorites")
    .insert({ user_id: user.id, product_id: productId });
  if (error) return { success: false, favorited: false, error: "Erreur." };
  revalidatePath("/account/favorites");
  return { success: true, favorited: true };
}
