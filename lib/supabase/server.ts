import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";
import type { Database } from "@/types/database";

/**
 * Server-side Supabase client (Server Components, Route Handlers, Server
 * Actions). Uses the anon key + the request's cookies so Row Level Security
 * is enforced per the authenticated user. Never use the service role key
 * here.
 */
export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options),
            );
          } catch {
            // Called from a Server Component without a mutable response;
            // safe to ignore when middleware refreshes sessions.
          }
        },
      },
    },
  );
}

/**
 * Admin/service-role client. ONLY for trusted server-side code that must
 * bypass RLS (e.g. scheduled jobs activating promotions, staff age
 * verification writes). NEVER expose this client or its key to the browser.
 */
export function createServiceRoleClient() {
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!serviceKey) {
    throw new Error(
      "SUPABASE_SERVICE_ROLE_KEY is not set. Required for privileged server-side operations.",
    );
  }
  return createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    serviceKey,
    {
      cookies: {
        getAll() {
          return [];
        },
        setAll() {
          // no-op: service role client is not tied to a user session
        },
      },
    },
  );
}
