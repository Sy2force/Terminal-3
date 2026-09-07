import "server-only";
import { createClient } from "@/lib/supabase/server";
import {
  ALL_DESIGN_TOKENS,
  FALLBACK,
  normalizeThemeValues,
  themeToCssVars,
  type ThemeValues,
} from "@/lib/theme-tokens";

export type { ThemeValues };
export { ALL_DESIGN_TOKENS, FALLBACK, themeToCssVars };

let cache: { value: ThemeValues; expiresAt: number } | null = null;
const CACHE_TTL_MS = 30_000;

export async function getPublishedTheme(): Promise<ThemeValues> {
  if (cache && cache.expiresAt > Date.now()) {
    return cache.value;
  }

  const supabase = await createClient();
  const { data } = await supabase
    .from("theme_settings")
    .select("value")
    .eq("key", "theme")
    .maybeSingle();

  const value = normalizeThemeValues((data?.value as Record<string, string>) ?? {});
  cache = { value, expiresAt: Date.now() + CACHE_TTL_MS };
  return value;
}
