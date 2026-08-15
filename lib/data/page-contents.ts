import "server-only";
import { createClient } from "@/lib/supabase/server";
import type { Metadata } from "next";
import type { PageContentRow, ContentRevisionRow } from "@/types/database";
import { isDemoMode } from "@/lib/demo-mode";

export type PageBlockType = "hero" | "text" | "cta" | "image" | "video";

export interface PageBlock {
  id: string;
  type: PageBlockType;
  visible?: boolean;
  heading?: string;
  subheading?: string;
  body?: string;
  buttonLabel?: string;
  buttonHref?: string;
  mediaUrl?: string;
  mediaAlt?: string;
}

/**
 * Fetches the PUBLISHED version of a page for the public site. Returns
 * null if the page has never been published — callers should fall back
 * to their existing static content in that case, never show a blank
 * page or crash.
 */
export async function getPublishedPageContent(slug: string): Promise<PageContentRow | null> {
  if (isDemoMode()) return null;
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("page_contents")
    .select("*")
    .eq("slug", slug)
    .eq("status", "published")
    .maybeSingle();
  if (error || !data) return null;
  return data;
}

/**
 * Fetches a page for admin editing, including any unpublished draft.
 */
export async function getPageContentForAdmin(slug: string): Promise<PageContentRow | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("page_contents")
    .select("*")
    .eq("slug", slug)
    .maybeSingle();
  if (error || !data) return null;
  return data;
}

export interface PageDraftInput {
  title?: string | null;
  subtitle?: string | null;
  description?: string | null;
  meta_title?: string | null;
  meta_description?: string | null;
  og_image_url?: string | null;
  scheduled_at?: string | null;
  draft_blocks: PageBlock[];
}

export async function upsertPageDraft(
  slug: string,
  pageType: string,
  input: PageDraftInput,
): Promise<PageContentRow> {
  const supabase = await createClient();
  const { data: existing } = await supabase
    .from("page_contents")
    .select("id")
    .eq("slug", slug)
    .maybeSingle();

  const payload = {
    title: input.title,
    subtitle: input.subtitle,
    description: input.description,
    meta_title: input.meta_title,
    meta_description: input.meta_description,
    og_image_url: input.og_image_url,
    draft_blocks: input.draft_blocks,
    scheduled_at: input.scheduled_at,
    status: "draft" as const,
    updated_at: new Date().toISOString(),
  };

  if (existing) {
    const { data, error } = await supabase
      .from("page_contents")
      .update(payload)
      .eq("id", existing.id)
      .select()
      .single();
    if (error || !data) throw new Error(error?.message ?? "save_draft_failed");
    return data;
  }

  const { data, error } = await supabase
    .from("page_contents")
    .insert({
      slug,
      page_type: pageType,
      ...payload,
      blocks: [],
    })
    .select()
    .single();
  if (error || !data) throw new Error(error?.message ?? "create_draft_failed");
  return data;
}

/**
 * Publishes the current draft: copies draft_blocks → blocks, marks the
 * page as published, and records who/when. The public site reads only
 * `blocks` on published rows, so this is the single moment a change
 * becomes visible — never the draft save itself.
 */
export async function publishPageContent(slug: string, publishedBy: string): Promise<PageContentRow> {
  const supabase = await createClient();
  const { data: existing, error: fetchError } = await supabase
    .from("page_contents")
    .select("*")
    .eq("slug", slug)
    .maybeSingle();

  if (fetchError || !existing) throw new Error("page_not_found");

  const newBlocks = existing.draft_blocks ?? existing.blocks ?? [];
  const previous = existing.blocks ?? [];

  await supabase.from("content_revisions").insert({
    entity_type: "page_content",
    entity_id: existing.id,
    author_id: publishedBy,
    action: "published",
    previous_value: previous,
    new_value: newBlocks,
    is_published: true,
  });

  const { data, error } = await supabase
    .from("page_contents")
    .update({
      blocks: newBlocks,
      status: "published",
      published_at: new Date().toISOString(),
      published_by: publishedBy,
      scheduled_at: null,
      updated_at: new Date().toISOString(),
    })
    .eq("id", existing.id)
    .select()
    .single();

  if (error || !data) throw new Error(error?.message ?? "publish_failed");
  return data;
}

/**
 * Discards the unpublished draft, reverting draft_blocks back to the
 * last published `blocks` snapshot.
 */
export async function revertPageDraft(slug: string): Promise<PageContentRow> {
  const supabase = await createClient();
  const { data: existing, error: fetchError } = await supabase
    .from("page_contents")
    .select("*")
    .eq("slug", slug)
    .maybeSingle();

  if (fetchError || !existing) throw new Error("page_not_found");

  const { data, error } = await supabase
    .from("page_contents")
    .update({
      draft_blocks: existing.blocks,
      updated_at: new Date().toISOString(),
    })
    .eq("id", existing.id)
    .select()
    .single();

  if (error || !data) throw new Error(error?.message ?? "revert_failed");
  return data;
}

export interface PageContentDefaults {
  title: string;
  description: string;
  canonical: string;
}

export async function buildPageMetadata(
  slug: string,
  defaults: PageContentDefaults,
): Promise<Metadata> {
  const page = await getPublishedPageContent(slug);
  const title = page?.meta_title?.trim() || page?.title?.trim() || defaults.title;
  const description =
    page?.meta_description?.trim() || page?.subtitle?.trim() || defaults.description;

  return {
    title,
    description,
    alternates: { canonical: defaults.canonical },
    openGraph: {
      title,
      description,
      ...(page?.og_image_url ? { images: [{ url: page.og_image_url }] } : {}),
    },
  };
}

export async function archivePageContent(slug: string, archivedBy: string): Promise<PageContentRow> {
  const supabase = await createClient();
  const { data: existing, error: fetchError } = await supabase
    .from("page_contents")
    .select("*")
    .eq("slug", slug)
    .maybeSingle();

  if (fetchError || !existing) throw new Error("page_not_found");

  await supabase.from("content_revisions").insert({
    entity_type: "page_content",
    entity_id: existing.id,
    author_id: archivedBy,
    action: "archived",
    previous_value: { status: existing.status, blocks: existing.blocks },
    new_value: { status: "archived", blocks: existing.blocks },
    is_published: false,
  });

  const { data, error } = await supabase
    .from("page_contents")
    .update({
      status: "archived",
      updated_at: new Date().toISOString(),
    })
    .eq("id", existing.id)
    .select()
    .single();

  if (error || !data) throw new Error(error?.message ?? "archive_failed");
  return data;
}

export async function schedulePageContent(
  slug: string,
  scheduledBy: string,
  scheduledAt: string,
): Promise<PageContentRow> {
  const supabase = await createClient();
  const { data: existing, error: fetchError } = await supabase
    .from("page_contents")
    .select("*")
    .eq("slug", slug)
    .maybeSingle();

  if (fetchError || !existing) throw new Error("page_not_found");

  await supabase.from("content_revisions").insert({
    entity_type: "page_content",
    entity_id: existing.id,
    author_id: scheduledBy,
    action: "scheduled",
    previous_value: { status: existing.status, scheduled_at: existing.scheduled_at },
    new_value: { status: existing.status, scheduled_at: scheduledAt },
    is_published: false,
  });

  const { data, error } = await supabase
    .from("page_contents")
    .update({
      status: "scheduled",
      scheduled_at: scheduledAt,
      updated_at: new Date().toISOString(),
    })
    .eq("id", existing.id)
    .select()
    .single();

  if (error || !data) throw new Error(error?.message ?? "schedule_failed");
  return data;
}

export async function getContentRevisions(pageId: string): Promise<ContentRevisionRow[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("content_revisions")
    .select("*")
    .eq("entity_type", "page_content")
    .eq("entity_id", pageId)
    .order("created_at", { ascending: false })
    .limit(50);

  if (error || !data) return [];
  return data as unknown as ContentRevisionRow[];
}

export async function restoreContentRevision(
  slug: string,
  revisionId: string,
  restoredBy: string,
): Promise<PageContentRow> {
  const supabase = await createClient();
  const { data: existing, error: fetchError } = await supabase
    .from("page_contents")
    .select("*")
    .eq("slug", slug)
    .maybeSingle();

  if (fetchError || !existing) throw new Error("page_not_found");

  const { data: revision, error: revError } = await supabase
    .from("content_revisions")
    .select("*")
    .eq("id", revisionId)
    .maybeSingle();

  if (revError || !revision) throw new Error("revision_not_found");

  const restoredBlocks = revision.new_value as PageBlock[];

  await supabase.from("content_revisions").insert({
    entity_type: "page_content",
    entity_id: existing.id,
    author_id: restoredBy,
    action: "restored",
    previous_value: existing.draft_blocks,
    new_value: restoredBlocks,
    is_published: false,
  });

  const { data, error } = await supabase
    .from("page_contents")
    .update({
      draft_blocks: restoredBlocks,
      status: "draft",
      updated_at: new Date().toISOString(),
    })
    .eq("id", existing.id)
    .select()
    .single();

  if (error || !data) throw new Error(error?.message ?? "restore_failed");
  return data;
}
