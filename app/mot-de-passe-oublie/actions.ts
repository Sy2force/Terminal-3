"use server";

import { headers } from "next/headers";
import { createClient } from "@/lib/supabase/server";

export async function requestPasswordResetAction(email: string): Promise<{
  success: boolean;
  error?: string;
}> {
  const supabase = await createClient();
  const requestHeaders = await headers();
  const origin = requestHeaders.get("origin") ?? process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${origin}/mot-de-passe-reinitialiser`,
  });

  if (error) {
    return { success: false, error: error.message };
  }

  return { success: true };
}
