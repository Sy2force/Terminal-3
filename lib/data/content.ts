import "server-only";
import { createClient } from "@/lib/supabase/server";
import type {
  ContentPostRow,
  ContentSectionRow,
  ProductRow,
} from "@/types/database";
import { isDemoMode } from "@/lib/demo-mode";

export interface ContentPostWithDetails extends ContentPostRow {
  sections: ContentSectionRow[];
  featuredProducts: ProductRow[];
}

export async function getPublishedPosts(limit = 24): Promise<ContentPostRow[]> {
  if (isDemoMode()) return [];
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("content_posts")
    .select("*")
    .eq("status", "published")
    .order("published_at", { ascending: false })
    .limit(limit);

  if (error || !data) return [];
  return data;
}

export async function getPostBySlug(
  slug: string,
): Promise<ContentPostWithDetails | null> {
  if (isDemoMode()) return null;
  const supabase = await createClient();
  const { data: post, error } = await supabase
    .from("content_posts")
    .select("*")
    .eq("slug", slug)
    .eq("status", "published")
    .maybeSingle();

  if (error || !post) return null;

  const [{ data: sections }, { data: contentProducts }] = await Promise.all([
    supabase
      .from("content_sections")
      .select("*")
      .eq("post_id", post.id)
      .order("sort_order", { ascending: true }),
    supabase
      .from("content_products")
      .select("sort_order, product:products(*)")
      .eq("post_id", post.id)
      .order("sort_order", { ascending: true }),
  ]);

  const featuredProducts = (
    (contentProducts ?? []) as unknown as { product: ProductRow }[]
  )
    .map((row) => row.product)
    .filter((p): p is ProductRow => Boolean(p) && p.status === "published");

  return {
    ...post,
    sections: sections ?? [],
    featuredProducts,
  };
}
