import "server-only";
import { createClient } from "@/lib/supabase/server";
import type { CategoryRow, ProductRow, ProductVariantRow, ProductMediaRow } from "@/types/database";
import { isDemoMode } from "@/lib/demo-mode";
import {
  mockGetCategories,
  mockGetNewArrivals,
  mockGetProductBySlug,
  mockGetPublishedProducts,
  mockGetPlatterProducts,
} from "@/lib/data/mock-catalog";
import { isProbablyDemoProduct } from "@/lib/data/demo-filter";

export interface ProductWithMedia extends ProductRow {
  variants: ProductVariantRow[];
  media: ProductMediaRow[];
  category: CategoryRow | null;
}

function filterVisibleProducts(products: ProductWithMedia[]): ProductWithMedia[] {
  return products.filter((p) => !isProbablyDemoProduct(p));
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
  return filterVisibleProducts(data as unknown as ProductWithMedia[]);
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
  return filterVisibleProducts(data as unknown as ProductWithMedia[]);
}

/**
 * Every product flagged as a platter (`product_type = "PLATTER"`),
 * across all categories — powers /plateaux. A charcuterie or fish
 * platter still belongs to its own category for browsing there, but
 * also surfaces here so "Plateaux" is one real, unified catalog rather
 * than a duplicate product list.
 */
export async function getPlatterProducts(): Promise<ProductWithMedia[]> {
  if (isDemoMode()) return mockGetPlatterProducts();
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("products")
    .select(
      "*, category:categories(*), variants:product_variants(*), media:product_media(*)",
    )
    .eq("status", "published")
    .eq("product_type", "PLATTER")
    .order("published_at", { ascending: false });

  if (error || !data) return [];
  return filterVisibleProducts(data as unknown as ProductWithMedia[]);
}

/**
 * Fetch a specific ordered set of products by id (e.g. for the homepage
 * hero bottle carousel picked manually in the admin). Missing/unpublished
 * ids are silently dropped rather than crashing the homepage.
 */
export async function getProductsByIds(ids: string[]): Promise<ProductWithMedia[]> {
  if (ids.length === 0) return [];
  if (isDemoMode()) {
    const all = mockGetPublishedProducts();
    const byId = new Map(all.map((p) => [p.id, p]));
    return ids.map((id) => byId.get(id)).filter((p): p is ProductWithMedia => Boolean(p));
  }
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("products")
    .select(
      "*, category:categories(*), variants:product_variants(*), media:product_media(*)",
    )
    .in("id", ids)
    .eq("status", "published");

  if (error || !data) return [];
  const visible = filterVisibleProducts(data as unknown as ProductWithMedia[]);
  const byId = new Map(visible.map((p) => [p.id, p]));
  return ids.map((id) => byId.get(id)).filter((p): p is ProductWithMedia => Boolean(p));
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
  const product = data as unknown as ProductWithMedia;
  if (isProbablyDemoProduct(product)) return null;
  return product;
}

function buildIlikeClause(field: string, pattern: string): string {
  return `${field}.ilike.${pattern}`;
}

export async function searchProducts(query: string): Promise<ProductWithMedia[]> {
  if (!query.trim()) return [];
  const supabase = await createClient();
  const q = query.trim().toLowerCase();
  const tokens = q.split(/\s+/).filter(Boolean);
  if (tokens.length === 0) return [];

  const joinedPattern = `%${tokens.join("%")}%`;

  const conditions: string[] = [
    buildIlikeClause("name_fr", joinedPattern),
    buildIlikeClause("name_he", joinedPattern),
    buildIlikeClause("name_en", joinedPattern),
    buildIlikeClause("brand", joinedPattern),
    buildIlikeClause("subcategory", joinedPattern),
    buildIlikeClause("wine_type", joinedPattern),
    buildIlikeClause("slug", joinedPattern),
    buildIlikeClause("description_fr", joinedPattern),
    buildIlikeClause("description_he", joinedPattern),
  ];

  for (const token of tokens) {
    const tokenPattern = `%${token}%`;
    conditions.push(buildIlikeClause("name_fr", tokenPattern));
    conditions.push(buildIlikeClause("name_he", tokenPattern));
    conditions.push(buildIlikeClause("name_en", tokenPattern));
    conditions.push(buildIlikeClause("brand", tokenPattern));
    conditions.push(buildIlikeClause("subcategory", tokenPattern));
    conditions.push(buildIlikeClause("wine_type", tokenPattern));
    conditions.push(buildIlikeClause("slug", tokenPattern));
  }

  const { data, error } = await supabase
    .from("products")
    .select(
      "*, category:categories(*), variants:product_variants(*), media:product_media(*)",
    )
    .eq("status", "published")
    .or(conditions.join(","))
    .order("published_at", { ascending: false })
    .limit(50);

  if (error || !data) {
    console.error("searchProducts error:", error);
    return [];
  }

  return filterVisibleProducts(data as unknown as ProductWithMedia[]);
}
