import "server-only";
import { createClient } from "@/lib/supabase/server";
import type { NavigationItemRow } from "@/types/database";

export interface NavMenu {
  key: string;
  name_fr: string;
  name_he: string | null;
  items: NavigationItemRow[];
}

export async function getPublishedMenu(key: string): Promise<NavMenu | null> {
  const supabase = await createClient();
  const { data: menu } = await supabase
    .from("navigation_menus")
    .select("*")
    .eq("key", key)
    .maybeSingle();

  if (!menu) return null;

  const { data: items } = await supabase
    .from("navigation_items")
    .select("*")
    .eq("menu_id", menu.id)
    .eq("is_active", true)
    .order("display_order", { ascending: true });

  return {
    ...menu,
    items: (items ?? []).filter((i) => {
      if (i.target === "_blank") {
        const href = i.href.toLowerCase();
        return !(href.startsWith("javascript:") || href.startsWith("data:"));
      }
      return true;
    }),
  };
}
