import "server-only";
import { createClient } from "@/lib/supabase/server";

export async function getCmsLabels(): Promise<Record<string, string>> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("section_translations")
    .select("key, label")
    .eq("lang", "fr");

  const map: Record<string, string> = {};
  for (const row of data ?? []) {
    if (row.label) map[row.key] = row.label;
  }
  return map;
}
