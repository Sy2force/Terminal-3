import "server-only";
import { createClient } from "@/lib/supabase/server";
import type { ProductReviewRow } from "@/types/database";
import { isDemoMode } from "@/lib/demo-mode";

/**
 * Real customer reviews for a product. Returns an empty array whenever
 * there are none — the UI must show an honest "be the first to review"
 * state rather than ever fabricating review content.
 */
export async function getProductReviews(productId: string): Promise<ProductReviewRow[]> {
  if (isDemoMode()) return [];
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("product_reviews")
    .select("*")
    .eq("product_id", productId)
    .eq("is_published", true)
    .order("created_at", { ascending: false });

  if (error || !data) return [];
  return data;
}
