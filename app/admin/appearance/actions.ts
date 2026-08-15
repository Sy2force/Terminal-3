"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { requireAdminPermission } from "@/lib/admin/auth";

export interface ThemeValue {
  primaryColor?: string;
  secondaryColor?: string;
  accentColor?: string;
  bgDark?: string;
  bgLight?: string;
  textLight?: string;
  textDark?: string;
  headingFont?: string;
  bodyFont?: string;
  borderRadius?: string;
  maxContentWidth?: string;
}

export async function saveThemeAction(values: ThemeValue): Promise<{ success: boolean; error?: string }> {
  await requireAdminPermission("store.settings");
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return { success: false, error: "Non authentifié." };
  }

  const { data: existing } = await supabase.from("theme_settings").select("id").eq("key", "theme").maybeSingle();

  if (existing) {
    await supabase
      .from("theme_settings")
      .update({ value: values as Record<string, unknown>, updated_by: user.id })
      .eq("id", existing.id);
  } else {
    await supabase.from("theme_settings").insert({
      key: "theme",
      value: values as Record<string, unknown>,
      updated_by: user.id,
    });
  }

  revalidatePath("/admin/appearance");
  return { success: true };
}

export async function getThemeAction(): Promise<ThemeValue | null> {
  await requireAdminPermission("store.settings");
  const supabase = await createClient();
  const { data } = await supabase.from("theme_settings").select("value").eq("key", "theme").maybeSingle();
  if (!data) return null;
  return data.value as unknown as ThemeValue;
}
