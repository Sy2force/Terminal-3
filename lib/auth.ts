import "server-only";
import type { User } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/server";
import { isDemoMode } from "@/lib/demo-mode";

/**
 * Returns the current authenticated user, or `null` — including in demo
 * mode, where there is no live Supabase project to authenticate against.
 * Every page that needs to know "is someone logged in" should go
 * through this instead of calling `createClient().auth.getUser()`
 * directly, so local/demo preview never crashes with "Your project's
 * URL and Key are required" just because a visitor opened an
 * account-gated page.
 */
export async function getCurrentUser(): Promise<User | null> {
  if (isDemoMode()) return null;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user;
}
