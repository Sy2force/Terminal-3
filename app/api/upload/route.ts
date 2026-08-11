import { NextResponse } from "next/server";
import { getAdminSession } from "@/lib/admin/auth";
import { createServiceRoleClient } from "@/lib/supabase/server";

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5 MB
const ALLOWED_BUCKETS = ["product-images", "content-images", "brand-assets"];
const ALLOWED_MIME_PREFIXES = ["image/"];

export async function POST(request: Request) {
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  try {
    const formData = await request.formData();
    const file = formData.get("file");
    const bucket = formData.get("bucket") as string;

    if (!file || !(file instanceof File)) {
      return NextResponse.json({ error: "missing_file" }, { status: 400 });
    }

    if (!ALLOWED_BUCKETS.includes(bucket)) {
      return NextResponse.json({ error: "invalid_bucket" }, { status: 400 });
    }

    if (!ALLOWED_MIME_PREFIXES.some((prefix) => file.type.startsWith(prefix))) {
      return NextResponse.json({ error: "invalid_file_type" }, { status: 400 });
    }

    if (file.size > MAX_FILE_SIZE) {
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

    return NextResponse.json({ url: publicUrlData.publicUrl, path: data.path });
  } catch {
    return NextResponse.json({ error: "upload_failed" }, { status: 500 });
  }
}
