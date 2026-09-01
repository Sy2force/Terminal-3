import "server-only";
import { createClient } from "@/lib/supabase/server";
import type { NavigationItemRow } from "@/types/database";

export interface NavMenu {
  key: string;
  name_fr: string;
  name_he: string | null;
  items: NavigationItemRow[];
}

const CACHE_TTL_MS = 30_000;
const cache = new Map<string, { value: NavMenu | null; expiresAt: number }>;

export async function getPublishedMenu(key: string): Promise<NavMenu | null> {
  const cached = cache.get(key);
  if (cached && cached.expiresAt > Date.now()) {
    return cached.value;
  }

  const supabase = await createClient();
  const { data: menu } = await supabase
    .from("navigation_menus")
    .select("*")
    .eq("key", key)
    .maybeSingle();

  if (!menu) {
    cache.set(key, { value: null, expiresAt: Date.now() + CACHE_TTL_MS });
    return null;
  }

  const { data: items } = await supabase
    .from("navigation_items")
    .select("*")
    .eq("menu_id", menu.id)
    .eq("is_active", true)
    .order("display_order", { ascending: true });

  const value: NavMenu = {
    ...menu,
    items: (items ?? []).filter((i) => {
      if (i.target === "_blank") {
        const href = i.href.toLowerCase();
        return !(href.startsWith("javascript:") || href.startsWith("data:"));
      }
      return true;
    }),
  };

  cache.set(key, { value, expiresAt: Date.now() + CACHE_TTL_MS });
  return value;
}
