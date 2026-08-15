"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireAdminPermission } from "@/lib/admin/auth";
import { logAudit } from "@/lib/admin/audit";
import { isMediaInUse, deleteMediaRecord, updateMediaMeta } from "@/lib/data/media";
import { createServiceRoleClient } from "@/lib/supabase/server";

export interface MediaActionResult {
  success: boolean;
  error?: string;
}

const metaSchema = z.object({
  alt: z.string().max(500).nullable().optional(),
  filename: z.string().min(1).max(255).optional(),
});

export async function updateMediaMetaAction(
  mediaId: string,
  input: unknown,
): Promise<MediaActionResult> {
  const session = await requireAdminPermission("catalog.media");
  try {
    const parsed = metaSchema.parse(input);
    await updateMediaMeta(mediaId, parsed);
    await logAudit({
      actor: session.userId,
      action: "updated",
      entityType: "media",
      entityId: mediaId,
      metadata: { ...parsed },
    });
    revalidatePath("/admin/medias");
    return { success: true };
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : "update_failed" };
  }
}

/**
 * Deletes a media file only if it's not referenced anywhere
 * (media_usage table). This prevents broken images/videos on the
 * public site or in other admin sections.
 */
export async function deleteMediaAction(
  mediaId: string,
  storagePath?: string,
  bucket?: string,
): Promise<MediaActionResult> {
  const session = await requireAdminPermission("catalog.media");

  const inUse = await isMediaInUse(mediaId);
  if (inUse) {
    return { success: false, error: "media_in_use" };
  }

  try {
    if (storagePath && bucket) {
      const supabase = createServiceRoleClient();
      await supabase.storage.from(bucket).remove([storagePath]);
    }
    await deleteMediaRecord(mediaId);
    await logAudit({
      actor: session.userId,
      action: "deleted",
      entityType: "media",
      entityId: mediaId,
    });
    revalidatePath("/admin/medias");
    return { success: true };
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : "delete_failed" };
  }
}
