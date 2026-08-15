"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { requireAdminPermission } from "@/lib/admin/auth";
import type { NavigationItemRow, NavigationMenuRow } from "@/types/database";

export interface NavItemInput {
  id?: string;
  menu_id: string;
  parent_id?: string | null;
  label_fr: string;
  label_he?: string;
  href: string;
  target?: "_self" | "_blank";
  icon_url?: string;
  display_order?: number;
  is_active?: boolean;
}

export async function getNavigationMenus(): Promise<NavigationMenuRow[]> {
  await requireAdminPermission("marketing.content");
  const supabase = await createClient();
  const { data } = await supabase.from("navigation_menus").select("*").order("name_fr", { ascending: true });
  return data ?? [];
}

export async function getNavigationItems(menuId: string): Promise<NavigationItemRow[]> {
  await requireAdminPermission("marketing.content");
  const supabase = await createClient();
  const { data } = await supabase
    .from("navigation_items")
    .select("*")
    .eq("menu_id", menuId)
    .order("display_order", { ascending: true });
  return data ?? [];
}

export async function saveNavigationItem(
  input: NavItemInput,
): Promise<{ success: boolean; error?: string }> {
  await requireAdminPermission("marketing.content");
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { success: false, error: "Non authentifié" };

  const href = input.href.trim().toLowerCase();
  if (href.startsWith("javascript:") || href.startsWith("data:")) {
    return { success: false, error: "URL interdite." };
  }
  if (href.startsWith("/admin")) {
    return { success: false, error: "Les routes admin ne peuvent pas être liées." };
  }

  const payload = {
    menu_id: input.menu_id,
    parent_id: input.parent_id ?? null,
    label_fr: input.label_fr.trim(),
    label_he: input.label_he?.trim() ?? null,
    href: input.href.trim(),
    target: input.target ?? "_self",
    icon_url: input.icon_url?.trim() ?? null,
    display_order: input.display_order ?? 0,
    is_active: input.is_active ?? true,
  };

  if (input.id) {
    const { error } = await supabase.from("navigation_items").update(payload).eq("id", input.id);
    if (error) return { success: false, error: error.message };
  } else {
    const { error } = await supabase.from("navigation_items").insert(payload);
    if (error) return { success: false, error: error.message };
  }

  revalidatePath("/");
  revalidatePath("/admin/navigation");
  return { success: true };
}

export async function deleteNavigationItem(id: string): Promise<{ success: boolean; error?: string }> {
  await requireAdminPermission("marketing.content");
  const supabase = await createClient();
  const { data: children } = await supabase.from("navigation_items").select("id").eq("parent_id", id);
  if ((children ?? []).length > 0) {
    return { success: false, error: "Supprimez d'abord les sous-menus." };
  }
  const { error } = await supabase.from("navigation_items").delete().eq("id", id);
  if (error) return { success: false, error: error.message };
  revalidatePath("/");
  revalidatePath("/admin/navigation");
  return { success: true };
}

export async function reorderNavigationItems(
  menuId: string,
  orderedIds: string[],
): Promise<{ success: boolean; error?: string }> {
  await requireAdminPermission("marketing.content");
  const supabase = await createClient();
  for (let i = 0; i < orderedIds.length; i++) {
    await supabase.from("navigation_items").update({ display_order: i }).eq("id", orderedIds[i]);
  }
  revalidatePath("/");
  revalidatePath("/admin/navigation");
  return { success: true };
}
