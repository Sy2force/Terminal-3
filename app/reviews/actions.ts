"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export interface SubmitReviewResult {
  success: boolean;
  error?: string;
}

/**
 * Submits a customer review for a product. Requires login. The rating and
 * comment are validated server-side — never trust the client for the
 * content that ends up publicly displayed on a product page.
 */
export async function submitProductReview(
  pagePath: string,
  productId: string,
  formData: FormData,
): Promise<SubmitReviewResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, error: "Vous devez être connecté pour laisser un avis." };
  }

  const rating = Number(formData.get("rating"));
  const comment = String(formData.get("comment") ?? "").trim();

  if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
    return { success: false, error: "Merci de choisir une note entre 1 et 5." };
  }
  if (comment.length < 3) {
    return { success: false, error: "Votre commentaire est trop court." };
  }
  if (comment.length > 2000) {
    return { success: false, error: "Votre commentaire est trop long." };
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("first_name, last_name")
    .eq("id", user.id)
    .maybeSingle();

  const authorName =
    [profile?.first_name, profile?.last_name].filter(Boolean).join(" ").trim() ||
    "Client Terminal 3";

  const { error } = await supabase.from("product_reviews").insert({
    product_id: productId,
    user_id: user.id,
    author_name: authorName,
    rating,
    comment,
  });

  if (error) {
    return { success: false, error: "Une erreur est survenue, merci de réessayer." };
  }

  revalidatePath(pagePath);
  return { success: true };
}
