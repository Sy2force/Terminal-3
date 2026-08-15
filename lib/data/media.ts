import "server-only";
import { createClient } from "@/lib/supabase/server";
import type { MediaRow, MediaKind } from "@/types/database";

export interface MediaWithUsage extends MediaRow {
  usage_count: number;
}

export async function listMedia(options?: {
  folder?: string;
  kind?: MediaKind;
  search?: string;
}): Promise<MediaWithUsage[]> {
  const supabase = await createClient();
  let query = supabase
    .from("media")
    .select("*, media_usage(count)")
    .order("created_at", { ascending: false });

  if (options?.folder) query = query.eq("folder", options.folder);
  if (options?.kind) query = query.eq("kind", options.kind);
  if (options?.search) query = query.ilike("filename", `%${options.search}%`);

  const { data, error } = await query;
  if (error || !data) return [];

  return (data as unknown as (MediaRow & { media_usage: { count: number }[] })[]).map((row) => ({
    ...row,
    usage_count: row.media_usage?.[0]?.count ?? 0,
  }));
}

export async function isMediaInUse(mediaId: string): Promise<boolean> {
  const supabase = await createClient();
  const { count } = await supabase
    .from("media_usage")
    .select("id", { count: "exact", head: true })
    .eq("media_id", mediaId);
  return (count ?? 0) > 0;
}

export async function deleteMediaRecord(mediaId: string): Promise<void> {
  const supabase = await createClient();
  const { error } = await supabase.from("media").delete().eq("id", mediaId);
  if (error) throw new Error(error.message ?? "delete_media_failed");
}

export async function updateMediaMeta(
  mediaId: string,
  input: { alt?: string | null; filename?: string; folder?: string },
): Promise<void> {
  const supabase = await createClient();
  const { error } = await supabase
    .from("media")
    .update({ ...input, updated_at: new Date().toISOString() })
    .eq("id", mediaId);
  if (error) throw new Error(error.message ?? "update_media_failed");
}

export async function insertMediaRecord(input: {
  filename: string;
  original_url: string;
  kind: MediaKind;
  mime_type: string | null;
  file_size_bytes: number | null;
  folder: string;
  uploaded_by: string;
}): Promise<MediaRow> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("media")
    .insert(input)
    .select()
    .single();
  if (error || !data) throw new Error(error?.message ?? "insert_media_failed");
  return data;
}
