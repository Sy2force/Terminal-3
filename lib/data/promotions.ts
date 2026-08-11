import "server-only";
import { createClient } from "@/lib/supabase/server";
import type { PromotionRow, ProductRow, CategoryRow, ProductMediaRow } from "@/types/database";
import { isDemoMode } from "@/lib/demo-mode";

export interface PromotionWithProduct extends PromotionRow {
  product:
    | (ProductRow & { category: CategoryRow | null; media: ProductMediaRow[] })
    | null;
}

/**
 * Promotions that are genuinely live right now, per the database clock —
 * never per the browser's clock. A promotion must have `status = 'active'`
 * AND fall within [start_at, end_at) at the moment of the request. This
 * function is the single source of truth for "is this promo valid now" on
 * the public site; checkout/reservation logic must re-run an equivalent
 * server-side check independently before honoring any promo price.
 */
export async function getActivePromotions(options?: {
  featuredOnly?: boolean;
  limit?: number;
}): Promise<PromotionWithProduct[]> {
  if (isDemoMode()) return [];
  const supabase = await createClient();
  const nowIso = new Date().toISOString();

  let query = supabase
    .from("promotions")
    .select(
      "*, product:products(*, category:categories(*), media:product_media(*))",
    )
    .eq("status", "active")
    .lte("start_at", nowIso)
    .gt("end_at", nowIso)
    .order("featured", { ascending: false })
    .order("end_at", { ascending: true });

  if (options?.featuredOnly) {
    query = query.eq("featured", true);
  }
  if (options?.limit) {
    query = query.limit(options.limit);
  }

  const { data, error } = await query;
  if (error || !data) return [];
  return data as unknown as PromotionWithProduct[];
}

export async function getPromotionBySlug(
  slug: string,
): Promise<PromotionWithProduct | null> {
  if (isDemoMode()) return null;
  const supabase = await createClient();
  const nowIso = new Date().toISOString();

  const { data, error } = await supabase
    .from("promotions")
    .select(
      "*, product:products(*, category:categories(*), media:product_media(*))",
    )
    .eq("slug", slug)
    .eq("status", "active")
    .lte("start_at", nowIso)
    .gt("end_at", nowIso)
    .maybeSingle();

  if (error || !data) return null;
  return data as unknown as PromotionWithProduct;
}
