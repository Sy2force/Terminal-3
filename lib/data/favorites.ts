import "server-only";
import { createClient } from "@/lib/supabase/server";
import type { ProductWithMedia } from "@/lib/data/catalog";
import { isDemoMode } from "@/lib/demo-mode";

export async function getFavoriteProductIds(): Promise<Set<string>> {
  if (isDemoMode()) return new Set();
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return new Set();

  const { data, error } = await supabase
    .from("favorites")
    .select("product_id")
    .eq("user_id", user.id);

  if (error || !data) return new Set();
  return new Set(data.map((row) => row.product_id));
}

export async function getFavoriteProducts(): Promise<ProductWithMedia[]> {
  if (isDemoMode()) return [];
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return [];

  const { data, error } = await supabase
    .from("favorites")
    .select(
      "created_at, product:products(*, category:categories(*), variants:product_variants(*), media:product_media(*))",
    )
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  if (error || !data) return [];

  const rows = data as unknown as { product: ProductWithMedia | null }[];
  return rows
    .map((row) => row.product)
    .filter((p): p is ProductWithMedia => Boolean(p));
}
