"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { requireAdminPermission } from "@/lib/admin/auth";
import { normalizeThemeValues, type ThemeValues } from "@/lib/theme-tokens";

export type { ThemeValues };

export async function saveThemeAction(values: ThemeValues): Promise<{ success: boolean; error?: string }> {
  await requireAdminPermission("store.settings");
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return { success: false, error: "Non authentifié." };
  }

  const normalized = normalizeThemeValues(values as Record<string, string>);

  const { data: existing } = await supabase.from("theme_settings").select("id").eq("key", "theme").maybeSingle();

  if (existing) {
    await supabase
      .from("theme_settings")
      .update({ value: normalized as Record<string, unknown>, updated_by: user.id })
      .eq("id", existing.id);
  } else {
    await supabase.from("theme_settings").insert({
      key: "theme",
      value: normalized as Record<string, unknown>,
      updated_by: user.id,
    });
  }

  revalidatePath("/admin/appearance");
  return { success: true };
}

export async function getThemeAction(): Promise<ThemeValues | null> {
  await requireAdminPermission("store.settings");
  const supabase = await createClient();
  const { data } = await supabase.from("theme_settings").select("value").eq("key", "theme").maybeSingle();
  if (!data) return null;
  return normalizeThemeValues(data.value as Record<string, string>);
}
