import "server-only";
import type { User } from "@supabase/supabase-js";
import { cookies } from "next/headers";
import { createClient } from "@/lib/supabase/server";
import { isDemoMode } from "@/lib/demo-mode";

/**
 * Returns the current authenticated user, or `null` — including in demo
 * mode, where there is no live Supabase project to authenticate against.
 * Skips the Supabase network call when no auth cookie is present, keeping
 * public pages fast.
 */
export async function getCurrentUser(): Promise<User | null> {
  if (isDemoMode()) return null;

  const cookieStore = await cookies();
  if (
    !cookieStore.get("sb-access-token") &&
    !cookieStore.get("sb-refresh-token")
  ) {
    return null;
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user;
}
