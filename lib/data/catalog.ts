import "server-only";
import { createClient } from "@/lib/supabase/server";
import type { CategoryRow, ProductRow, ProductVariantRow, ProductMediaRow } from "@/types/database";
import { isDemoMode } from "@/lib/demo-mode";
import {
  mockGetCategories,
  mockGetNewArrivals,
  mockGetProductBySlug,
  mockGetPublishedProducts,
} from "@/lib/data/mock-catalog";

export interface ProductWithMedia extends ProductRow {
  variants: ProductVariantRow[];
  media: ProductMediaRow[];
  category: CategoryRow | null;
}

export async function getCategories(): Promise<CategoryRow[]> {
  if (isDemoMode()) return mockGetCategories();
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("categories")
    .select("*")
    .eq("is_active", true)
    .order("display_order", { ascending: true });

  if (error || !data) return [];
  return data;
}

export async function getPublishedProducts(options?: {
  categorySlug?: string;
  limit?: number;
}): Promise<ProductWithMedia[]> {
  if (isDemoMode()) {
    const products = mockGetPublishedProducts(options?.categorySlug);
    return options?.limit ? products.slice(0, options.limit) : products;
  }
  const supabase = await createClient();
  let query = supabase
    .from("products")
    .select(
      "*, category:categories(*), variants:product_variants(*), media:product_media(*)",
    )
    .eq("status", "published")
    .order("published_at", { ascending: false });

  if (options?.categorySlug) {
    const { data: category } = await supabase
      .from("categories")
      .select("id")
      .eq("slug", options.categorySlug)
      .maybeSingle();
    if (category) {
      query = query.eq("category_id", category.id);
    }
  }

  if (options?.limit) {
    query = query.limit(options.limit);
  }

  const { data, error } = await query;
  if (error || !data) return [];
  return data as unknown as ProductWithMedia[];
}

/**
 * Products currently "new": published and, if `new_until` is set, still
 * within the configured window. The NEW badge disappears automatically
 * once `new_until` has passed — never left up manually.
 */
export async function getNewArrivals(limit = 24): Promise<ProductWithMedia[]> {
  if (isDemoMode()) return mockGetNewArrivals().slice(0, limit);
  const supabase = await createClient();
  const nowIso = new Date().toISOString();

  const { data, error } = await supabase
    .from("products")
    .select(
      "*, category:categories(*), variants:product_variants(*), media:product_media(*)",
    )
    .eq("status", "published")
    .or(`new_until.is.null,new_until.gte.${nowIso}`)
    .order("published_at", { ascending: false })
    .limit(limit);

  if (error || !data) return [];
  return data as unknown as ProductWithMedia[];
}

export async function getProductBySlug(
  slug: string,
): Promise<ProductWithMedia | null> {
  if (isDemoMode()) return mockGetProductBySlug(slug);
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("products")
    .select(
      "*, category:categories(*), variants:product_variants(*), media:product_media(*)",
    )
    .eq("slug", slug)
    .eq("status", "published")
    .maybeSingle();

  if (error || !data) return null;
  return data as unknown as ProductWithMedia;
}
