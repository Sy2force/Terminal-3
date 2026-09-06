"use server";

import { revalidatePath } from "next/cache";
import { requireAdminPermission } from "@/lib/admin/auth";
import { logAudit } from "@/lib/admin/audit";
import {
  createPost,
  updatePost,
  deletePost,
} from "@/lib/data/content-admin";
import type { ContentStatus } from "@/types/database";

export interface ContentActionResult {
  success: boolean;
  error?: string;
}

export interface ContentFormData {
  slug: string;
  title: string;
  subtitle: string;
  hero_image_url: string;
  category: string;
  body: string;
  status: ContentStatus;
}

export async function createPostAction(
  data: ContentFormData,
): Promise<ContentActionResult> {
  const session = await requireAdminPermission("marketing.content");
  try {
    const post = await createPost({
      slug: data.slug,
      title: data.title,
      subtitle: data.subtitle || undefined,
      hero_image_url: data.hero_image_url || undefined,
      category: data.category || undefined,
      body: data.body || undefined,
      status: data.status,
    });
    await logAudit({
      actor: session.userId,
      action: "created",
      entityType: "homepage_section",
      entityId: post.id,
      metadata: { type: "content_post", slug: data.slug },
    });
    revalidatePath("/inspirations");
    revalidatePath(`/inspirations/${data.slug}`);
    revalidatePath("/admin/content");
    return { success: true };
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : "create_failed" };
  }
}

export async function updatePostAction(
  id: string,
  data: ContentFormData,
): Promise<ContentActionResult> {
  const session = await requireAdminPermission("marketing.content");
  try {
    await updatePost(id, {
      slug: data.slug,
      title: data.title,
      subtitle: data.subtitle || null,
      hero_image_url: data.hero_image_url || null,
      category: data.category || null,
      body: data.body || null,
      status: data.status,
    });
    await logAudit({
      actor: session.userId,
      action: "updated",
      entityType: "homepage_section",
      entityId: id,
      metadata: { type: "content_post" },
    });
    revalidatePath("/inspirations");
    revalidatePath(`/inspirations/${data.slug}`);
    revalidatePath("/admin/content");
    return { success: true };
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : "update_failed" };
  }
}

export async function deletePostAction(
  id: string,
): Promise<ContentActionResult> {
  const session = await requireAdminPermission("marketing.content");
  try {
    await deletePost(id);
    await logAudit({
      actor: session.userId,
      action: "deleted",
      entityType: "homepage_section",
      entityId: id,
      metadata: { type: "content_post" },
    });
    revalidatePath("/inspirations");
    revalidatePath("/admin/content");
    return { success: true };
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : "delete_failed" };
  }
}
