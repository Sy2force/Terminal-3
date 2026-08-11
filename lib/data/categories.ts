import "server-only";
import { createClient } from "@/lib/supabase/server";
import type { CategoryRow } from "@/types/database";
import { isDemoMode } from "@/lib/demo-mode";
import { mockGetCategories } from "@/lib/data/mock-catalog";

export type CategoryInput = {
  slug: string;
  name_he: string;
  name_fr?: string | null;
  name_en?: string | null;
  parent_id?: string | null;
  display_order?: number;
  is_active?: boolean;
  is_featured?: boolean;
  cover_image?: string | null;
  icon?: string | null;
  short_description?: string | null;
  description?: string | null;
};

export async function getAllCategories(): Promise<CategoryRow[]> {
  if (isDemoMode()) return mockGetCategories();
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("categories")
    .select("*")
    .order("display_order", { ascending: true })
    .order("name_he", { ascending: true });

  if (error || !data) return [];
  return data;
}

export async function getCategoryById(id: string): Promise<CategoryRow | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("categories")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (error || !data) return null;
  return data;
}

export async function getCategoryBySlug(
  slug: string,
): Promise<CategoryRow | null> {
  if (isDemoMode())
    return mockGetCategories().find((c) => c.slug === slug) ?? null;
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("categories")
    .select("*")
    .eq("slug", slug)
    .maybeSingle();

  if (error || !data) return null;
  return data;
}

export async function createCategory(
  input: CategoryInput,
): Promise<CategoryRow> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("categories")
    .insert({
      slug: input.slug,
      name_he: input.name_he,
      name_fr: input.name_fr ?? null,
      name_en: input.name_en ?? null,
      parent_id: input.parent_id ?? null,
      display_order: input.display_order ?? 0,
      is_active: input.is_active ?? true,
      is_featured: input.is_featured ?? false,
      cover_image: input.cover_image ?? null,
      icon: input.icon ?? null,
      short_description: input.short_description ?? null,
      description: input.description ?? null,
      updated_at: new Date().toISOString(),
    })
    .select()
    .single();

  if (error || !data) {
    throw new Error(error?.message ?? "create_category_failed");
  }
  return data;
}

export async function updateCategory(
  id: string,
  input: Partial<CategoryInput>,
): Promise<CategoryRow> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("categories")
    .update({
      ...input,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id)
    .select()
    .single();

  if (error || !data) {
    throw new Error(error?.message ?? "update_category_failed");
  }
  return data;
}

/**
 * Prefer deactivation over deletion to preserve historical product links.
 */
export async function archiveCategory(id: string): Promise<void> {
  const supabase = await createClient();
  const { error } = await supabase
    .from("categories")
    .update({ is_active: false, updated_at: new Date().toISOString() })
    .eq("id", id);

  if (error) throw new Error(error.message ?? "archive_category_failed");
}

export async function deleteCategory(id: string): Promise<void> {
  const supabase = await createClient();
  const { count, error: countError } = await supabase
    .from("products")
    .select("*", { count: "exact", head: true })
    .eq("category_id", id);

  if (countError) throw new Error("check_products_failed");
  if ((count ?? 0) > 0) {
    throw new Error("category_has_products");
  }

  const { error } = await supabase.from("categories").delete().eq("id", id);
  if (error) throw new Error(error.message ?? "delete_category_failed");
}
