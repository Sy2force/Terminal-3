import "server-only";
import { createClient } from "@/lib/supabase/server";
import type {
  ContentPostRow,
  ContentSectionRow,
  ContentStatus,
} from "@/types/database";

export interface ContentPostAdmin extends ContentPostRow {
  section_count: number;
}

export async function getAllPostsForAdmin(): Promise<ContentPostAdmin[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("content_posts")
    .select(
      "*, section_count:content_sections(count)",
    )
    .order("updated_at", { ascending: false });

  if (error || !data) return [];

  return data.map((row) => {
    const anyRow = row as unknown as Record<string, unknown>;
    const sectionCount = anyRow.section_count as { count?: number } | undefined;
    return {
      ...anyRow,
      section_count: sectionCount?.count ?? 0,
    } as ContentPostAdmin;
  });
}

export async function getPostByIdForAdmin(
  id: string,
): Promise<ContentPostRow | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("content_posts")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (error || !data) return null;
  return data;
}

export async function createPost(input: {
  slug: string;
  title: string;
  subtitle?: string;
  hero_image_url?: string;
  category?: string;
  body?: string;
  status?: ContentStatus;
}): Promise<ContentPostRow> {
  const supabase = await createClient();
  const nowIso = new Date().toISOString();
  const status = input.status ?? "draft";

  const { data, error } = await supabase
    .from("content_posts")
    .insert({
      slug: input.slug,
      title: input.title,
      subtitle: input.subtitle ?? null,
      hero_image_url: input.hero_image_url ?? null,
      category: input.category ?? null,
      body: input.body ?? null,
      status,
      published_at: status === "published" ? nowIso : null,
    })
    .select("*")
    .single();

  if (error) throw new Error(error.message ?? "create_post_failed");
  return data;
}

export async function updatePost(
  id: string,
  input: Partial<{
    slug: string;
    title: string;
    subtitle: string | null;
    hero_image_url: string | null;
    category: string | null;
    body: string | null;
    status: ContentStatus;
  }>,
): Promise<void> {
  const supabase = await createClient();
  const nowIso = new Date().toISOString();

  const updates: Partial<ContentPostRow> & { updated_at: string; published_at?: string | null } = {
    ...input,
    updated_at: nowIso,
  };

  if (input.status === "published") {
    updates.published_at = nowIso;
  }

  const { error } = await supabase
    .from("content_posts")
    .update(updates)
    .eq("id", id);

  if (error) throw new Error(error.message ?? "update_post_failed");
}

export async function deletePost(id: string): Promise<void> {
  const supabase = await createClient();
  const { error } = await supabase
    .from("content_posts")
    .delete()
    .eq("id", id);

  if (error) throw new Error(error.message ?? "delete_post_failed");
}

export async function getPostSections(
  postId: string,
): Promise<ContentSectionRow[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("content_sections")
    .select("*")
    .eq("post_id", postId)
    .order("sort_order", { ascending: true });

  if (error || !data) return [];
  return data;
}
