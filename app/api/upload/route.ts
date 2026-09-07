import { NextResponse } from "next/server";
import { getAdminSession } from "@/lib/admin/auth";
import { createServiceRoleClient } from "@/lib/supabase/server";
import { insertMediaRecord } from "@/lib/data/media";
import {
  buildMediaStoragePath,
  imageMimeMatches,
  isMediaEntityType,
  isMediaRole,
  sniffImageMime,
  UNCLASSIFIED_PREFIX,
} from "@/lib/media-upload";
import type { MediaKind } from "@/types/database";

const MAX_IMAGE_SIZE = 5 * 1024 * 1024; // 5 MB
const MAX_VIDEO_SIZE = 50 * 1024 * 1024; // 50 MB
const ALLOWED_BUCKETS = ["product-images", "content-images", "brand-assets", "media-library"];
const ALLOWED_MIME_PREFIXES = ["image/", "video/"];

function mediaKindFromMime(mime: string): MediaKind {
  if (mime.startsWith("video/")) return "video";
  return "image";
}

export async function POST(request: Request) {
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  try {
    const formData = await request.formData();
    const file = formData.get("file");
    const bucket = formData.get("bucket") as string;
    const folder = (formData.get("folder") as string) || "general";
    // Optional destination metadata. When absent or ambiguous the file is
    // stored under `a-classer/` and must be associated manually — the route
    // never guesses an association from the original filename.
    const entityType = (formData.get("entity_type") as string) || null;
    const entityId = (formData.get("entity_id") as string) || null;
    const role = (formData.get("role") as string) || null;
    const altText = (formData.get("alt_text") as string) || null;

    if (!file || !(file instanceof File)) {
      return NextResponse.json({ error: "missing_file" }, { status: 400 });
    }

    if (!ALLOWED_BUCKETS.includes(bucket)) {
      return NextResponse.json({ error: "invalid_bucket" }, { status: 400 });
    }

    if (!ALLOWED_MIME_PREFIXES.some((prefix) => file.type.startsWith(prefix))) {
      return NextResponse.json({ error: "invalid_file_type" }, { status: 400 });
    }

    const maxSize = file.type.startsWith("video/") ? MAX_VIDEO_SIZE : MAX_IMAGE_SIZE;
    if (file.size > maxSize) {
      return NextResponse.json({ error: "file_too_large" }, { status: 400 });
    }

    // Verify the real file type from magic bytes for images. A spoofed
    // extension/MIME (e.g. a script renamed .png) is rejected here.
    if (file.type.startsWith("image/")) {
      const head = new Uint8Array(await file.slice(0, 16).arrayBuffer());
      const sniffed = sniffImageMime(head);
      if (!imageMimeMatches(file.type, sniffed)) {
        return NextResponse.json({ error: "invalid_file_type" }, { status: 400 });
      }
    }

    // Reject partially-specified destinations: entity without role (or the
    // reverse) is ambiguous and goes to the "à classer" queue.
    const hasPartialDestination =
      (entityType != null || entityId != null || role != null) &&
      !(entityType != null && entityId != null && role != null);
    const destinationValid =
      entityType != null && entityId != null && role != null &&
      isMediaEntityType(entityType) && isMediaRole(role);

    const mediaId = crypto.randomUUID();
    const extension = file.name.split(".").pop()?.toLowerCase() ?? "bin";
    const { path, classified } =
      destinationValid && !hasPartialDestination
        ? buildMediaStoragePath({
            entityType,
            entityId,
            role,
            mediaId,
            extension,
          })
        : buildMediaStoragePath({ mediaId, extension });

    const supabase = createServiceRoleClient();
    const { data, error } = await supabase.storage
      .from(bucket)
      .upload(path, file, { contentType: file.type, upsert: false });

    if (error || !data) {
      return NextResponse.json({ error: "upload_failed" }, { status: 500 });
    }

    const { data: publicUrlData } = supabase.storage.from(bucket).getPublicUrl(data.path);

    // Best-effort media library record — the upload itself already
    // succeeded, so a metadata insert failure shouldn't fail the request.
    // The extended columns (bucket/storage_path/entity/role/status) only
    // exist once migration 0046 is applied; fall back to the legacy insert.
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const mediaTable = supabase.from("media") as any;
      const { error: insertError } = await mediaTable.insert({
        id: mediaId,
        filename: file.name,
        original_url: publicUrlData.publicUrl,
        kind: mediaKindFromMime(file.type),
        mime_type: file.type,
        file_size_bytes: file.size,
        folder,
        uploaded_by: session.userId,
        bucket,
        storage_path: data.path,
        entity_type: classified ? entityType : null,
        entity_id: classified ? entityId : null,
        role: classified ? role : null,
        alt_text: altText,
        status: "ready",
      });
      if (insertError) throw insertError;
    } catch {
      try {
        await insertMediaRecord({
          filename: file.name,
          original_url: publicUrlData.publicUrl,
          kind: mediaKindFromMime(file.type),
          mime_type: file.type,
          file_size_bytes: file.size,
          folder,
          uploaded_by: session.userId,
        });
      } catch {
        // Non-fatal: the file is uploaded and usable even if the media
        // library row could not be created (e.g. table not migrated yet).
      }
    }

    // Link media_usage so "À classer" triage and orphan cleanup can rely on
    // explicit associations.
    if (classified) {
      try {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        await (supabase.from("media_usage") as any).insert({
          media_id: mediaId,
          entity_type: entityType,
          entity_id: entityId,
          field_path: role,
        });
      } catch {
        // best-effort
      }
    }

    return NextResponse.json({
      url: publicUrlData.publicUrl,
      path: data.path,
      mediaId,
      classified,
      queue: classified ? null : UNCLASSIFIED_PREFIX,
    });
  } catch {
    return NextResponse.json({ error: "upload_failed" }, { status: 500 });
  }
}
