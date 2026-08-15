import { NextResponse } from "next/server";
import { getAdminSession } from "@/lib/admin/auth";
import { createServiceRoleClient } from "@/lib/supabase/server";
import { insertMediaRecord } from "@/lib/data/media";
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

    const extension = file.name.split(".").pop()?.toLowerCase() ?? "bin";
    const safeName = `${crypto.randomUUID()}.${extension}`;
    const path = `${session.userId}/${safeName}`;

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

    return NextResponse.json({ url: publicUrlData.publicUrl, path: data.path });
  } catch {
    return NextResponse.json({ error: "upload_failed" }, { status: 500 });
  }
}
