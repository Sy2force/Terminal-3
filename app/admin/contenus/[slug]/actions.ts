"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireAdminPermission } from "@/lib/admin/auth";
import { logAudit } from "@/lib/admin/audit";
import {
  upsertPageDraft,
  publishPageContent,
  revertPageDraft,
  archivePageContent,
  schedulePageContent,
  restoreContentRevision,
  getContentRevisions,
} from "@/lib/data/page-contents";
import type { ContentRevisionRow } from "@/types/database";
import { isDemoMode } from "@/lib/demo-mode";

export interface PageContentActionResult {
  success: boolean;
  error?: string;
}

const blockSchema = z.object({
  id: z.string(),
  type: z.enum(["hero", "text", "cta", "image", "video"]),
  visible: z.boolean().optional(),
  heading: z.string().max(300).optional(),
  subheading: z.string().max(300).optional(),
  body: z.string().max(10000).optional(),
  buttonLabel: z.string().max(100).optional(),
  buttonHref: z.string().max(500).optional(),
  mediaUrl: z.string().max(1000).optional(),
  mediaAlt: z.string().max(300).optional(),
});

const draftSchema = z.object({
  title: z.string().max(300).nullable().optional(),
  subtitle: z.string().max(300).nullable().optional(),
  description: z.string().max(2000).nullable().optional(),
  meta_title: z.string().max(300).nullable().optional(),
  meta_description: z.string().max(1000).nullable().optional(),
  og_image_url: z.string().max(1000).nullable().optional(),
  scheduled_at: z.string().nullable().optional(),
  blocks: z.array(blockSchema).max(50),
});

// Public routes this page-content editor is allowed to revalidate. The
// list lives in lib/admin/page-slugs.ts (shared with the editor UI) and
// prevents an arbitrary path from being passed to revalidatePath.
import { publicPathForSlug } from "@/lib/admin/page-slugs";

export async function savePageDraftAction(
  slug: string,
  pageType: string,
  input: unknown,
): Promise<PageContentActionResult> {
  const session = await requireAdminPermission("marketing.content");

  if (isDemoMode()) {
    return { success: false, error: "demo_mode_read_only" };
  }

  try {
    const parsed = draftSchema.parse(input);
    const page = await upsertPageDraft(slug, pageType, {
      title: parsed.title,
      subtitle: parsed.subtitle,
      description: parsed.description,
      meta_title: parsed.meta_title,
      meta_description: parsed.meta_description,
      og_image_url: parsed.og_image_url,
      scheduled_at: parsed.scheduled_at,
      draft_blocks: parsed.blocks,
    });

    await logAudit({
      actor: session.userId,
      action: "updated",
      entityType: "site_setting",
      entityId: page.id,
      metadata: { type: "page_content_draft", slug },
    });

    revalidatePath(`/admin/contenus/${slug}`);
    return { success: true };
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : "save_draft_failed" };
  }
}

export async function publishPageContentAction(slug: string): Promise<PageContentActionResult> {
  const session = await requireAdminPermission("marketing.content");

  if (isDemoMode()) {
    return { success: false, error: "demo_mode_read_only" };
  }

  try {
    await publishPageContent(slug, session.userId);

    await logAudit({
      actor: session.userId,
      action: "published",
      entityType: "site_setting",
      entityId: slug,
      metadata: { type: "page_content", slug },
    });

    revalidatePath(`/admin/contenus/${slug}`);
    const publicPath = publicPathForSlug(slug);
    if (publicPath) revalidatePath(publicPath);

    return { success: true };
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : "publish_failed" };
  }
}

export async function revertPageDraftAction(slug: string): Promise<PageContentActionResult> {
  const session = await requireAdminPermission("marketing.content");

  if (isDemoMode()) {
    return { success: false, error: "demo_mode_read_only" };
  }

  try {
    await revertPageDraft(slug);
    await logAudit({
      actor: session.userId,
      action: "updated",
      entityType: "site_setting",
      entityId: slug,
      metadata: { type: "page_content_reverted", slug },
    });
    revalidatePath(`/admin/contenus/${slug}`);
    return { success: true };
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : "revert_failed" };
  }
}

export async function archivePageContentAction(slug: string): Promise<PageContentActionResult> {
  const session = await requireAdminPermission("marketing.content");
  if (isDemoMode()) {
    return { success: false, error: "demo_mode_read_only" };
  }

  try {
    const page = await archivePageContent(slug, session.userId);
    await logAudit({
      actor: session.userId,
      action: "archived",
      entityType: "site_setting",
      entityId: page.id,
      metadata: { type: "page_content_archived", slug },
    });
    revalidatePath(`/admin/contenus/${slug}`);
    const publicPath = publicPathForSlug(slug);
    if (publicPath) revalidatePath(publicPath);
    return { success: true };
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : "archive_failed" };
  }
}

export async function schedulePageContentAction(
  slug: string,
  scheduledAt: string,
): Promise<PageContentActionResult> {
  const session = await requireAdminPermission("marketing.content");
  if (isDemoMode()) {
    return { success: false, error: "demo_mode_read_only" };
  }

  try {
    const page = await schedulePageContent(slug, session.userId, scheduledAt);
    await logAudit({
      actor: session.userId,
      action: "scheduled",
      entityType: "site_setting",
      entityId: page.id,
      metadata: { type: "page_content_scheduled", slug, scheduled_at: scheduledAt },
    });
    revalidatePath(`/admin/contenus/${slug}`);
    return { success: true };
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : "schedule_failed" };
  }
}

export async function getContentRevisionsAction(slug: string): Promise<{
  success: boolean;
  revisions?: ContentRevisionRow[];
  error?: string;
}> {
  await requireAdminPermission("marketing.content");
  try {
    const supabase = await import("@/lib/supabase/server").then((m) => m.createClient());
    const { data: page } = await supabase
      .from("page_contents")
      .select("id")
      .eq("slug", slug)
      .maybeSingle();
    if (!page) return { success: true, revisions: [] };
    const revisions = await getContentRevisions(page.id);
    return { success: true, revisions };
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : "revisions_failed" };
  }
}

export async function restoreContentRevisionAction(
  slug: string,
  revisionId: string,
): Promise<PageContentActionResult> {
  const session = await requireAdminPermission("marketing.content");
  if (isDemoMode()) {
    return { success: false, error: "demo_mode_read_only" };
  }

  try {
    const page = await restoreContentRevision(slug, revisionId, session.userId);
    await logAudit({
      actor: session.userId,
      action: "restored",
      entityType: "site_setting",
      entityId: page.id,
      metadata: { type: "page_content_restored", slug, revision_id: revisionId },
    });
    revalidatePath(`/admin/contenus/${slug}`);
    return { success: true };
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : "restore_failed" };
  }
}
