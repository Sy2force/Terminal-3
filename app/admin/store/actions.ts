"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { normalizeWhatsAppNumber } from "@/lib/whatsapp";
import { isValidWoltUrl } from "@/lib/wolt";

export async function setStoreOnline(online: boolean): Promise<void> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("unauthenticated");

  // RLS restricts writes on `site_settings` to OWNER/MANAGER roles — this
  // insert simply fails (and the UI shows nothing changed) for anyone else.
  const { error } = await supabase
    .from("site_settings")
    .upsert({ key: "STORE_ONLINE", value: online, updated_by: user.id });

  if (error) throw new Error("update_failed");

  revalidatePath("/", "layout");
  revalidatePath("/admin/store");
}

export async function setWeeklyPromoMessage(message: string): Promise<void> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("unauthenticated");

  const trimmed = message.trim();
  const { error } = await supabase.from("site_settings").upsert({
    key: "WEEKLY_PROMO_MESSAGE",
    value: trimmed || null,
    updated_by: user.id,
  });

  if (error) throw new Error("update_failed");

  revalidatePath("/", "layout");
  revalidatePath("/admin/store");
}

export async function setLogoUrl(url: string): Promise<void> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("unauthenticated");

  const { error } = await supabase.from("site_settings").upsert({
    key: "LOGO_URL",
    value: url,
    updated_by: user.id,
  });

  if (error) throw new Error("update_failed");

  revalidatePath("/", "layout");
  revalidatePath("/admin/store");
}

export async function saveWoltSettings({
  enabled,
  storeUrl,
}: {
  enabled: boolean;
  storeUrl: string | null;
}): Promise<void> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("unauthenticated");

  if (storeUrl && !isValidWoltUrl(storeUrl)) {
    throw new Error("wolt_url_invalide");
  }

  const { error: enabledError } = await supabase.from("site_settings").upsert({
    key: "WOLT_ENABLED",
    value: enabled,
    updated_by: user.id,
  });

  const { error: urlError } = await supabase.from("site_settings").upsert({
    key: "WOLT_STORE_URL",
    value: storeUrl,
    updated_by: user.id,
  });

  if (enabledError || urlError) throw new Error("update_failed");

  revalidatePath("/", "layout");
  revalidatePath("/admin/store");
}

export async function saveStoreWhatsApp(raw: string): Promise<string> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("unauthenticated");

  const normalized = normalizeWhatsAppNumber(raw);
  if (raw.trim() && !normalized) throw new Error("numero_invalide");

  const { error } = await supabase.from("site_settings").upsert({
    key: "STORE_WHATSAPP",
    value: normalized,
    updated_by: user.id,
  });

  if (error) throw new Error("update_failed");

  revalidatePath("/", "layout");
  revalidatePath("/admin/store");
  return normalized ?? "";
}

export async function setSalmonGalleryImages(urls: string[]): Promise<void> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("unauthenticated");

  const images = urls
    .map((url) => url.trim())
    .filter(Boolean)
    .slice(0, 10)
    .map((url) => ({ url }));

  const { error } = await supabase.from("site_settings").upsert({
    key: "SALMON_GALLERY_IMAGES",
    value: images,
    updated_by: user.id,
  });

  if (error) throw new Error("update_failed");

  revalidatePath("/", "layout");
  revalidatePath("/admin/store");
}
