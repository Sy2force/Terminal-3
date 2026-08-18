"use server";

import { revalidatePath } from "next/cache";
import { requireAdminPermission } from "@/lib/admin/auth";
import { logAudit } from "@/lib/admin/audit";
import { createClient } from "@/lib/supabase/server";

export interface SaveFieldInput {
  slug: string;
  pageType?: string;
  field: "title" | "subtitle" | "description" | "og_image_url";
  value: string;
}

export async function savePageContentFieldAction(input: SaveFieldInput) {
  const session = await requireAdminPermission("marketing.content");
  const supabase = await createClient();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const pageContents = supabase.from("page_contents") as unknown as any;

  const { data: existing } = await supabase
    .from("page_contents")
    .select("id, slug, page_type")
    .eq("slug", input.slug)
    .maybeSingle();

  let pageContentId: string;
  const now = new Date().toISOString();

  if (existing) {
    const { error } = await pageContents
      .update({
        [input.field]: input.value,
        status: "published",
        updated_at: now,
        published_at: now,
      })
      .eq("id", existing.id);
    if (error) throw new Error(error.message);
    pageContentId = existing.id;
  } else {
    const { data, error } = await pageContents
      .insert({
        slug: input.slug,
        page_type: input.pageType ?? "page",
        [input.field]: input.value,
        blocks: [],
        draft_blocks: [],
        status: "published",
        updated_at: now,
        published_at: now,
      })
      .select("id")
      .single();
    if (error || !data) throw new Error(error?.message ?? "insert_failed");
    pageContentId = data.id;
  }

  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const db = supabase as any;
    await db.from("content_revisions").insert({
      page_content_id: pageContentId,
      user_id: session.userId,
      change_summary: `Mise à jour du champ ${input.field}`,
      snapshot: { [input.field]: input.value },
      created_at: now,
    });
  } catch {
    // best-effort revision log
  }

  await logAudit({
    actor: session.userId,
    action: "updated",
    entityType: "homepage_section",
    entityId: pageContentId,
    metadata: { slug: input.slug, field: input.field },
  });

  revalidatePath(input.slug === "home" ? "/" : `/${input.slug}`);
  return { success: true };
}
