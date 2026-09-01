"use server";

import { createClient, createServiceRoleClient } from "@/lib/supabase/server";
import { getPresenceStats } from "@/lib/data/presence";

const MIN_PING_INTERVAL_MS = 30_000;
const SESSION_ID_MAX_LENGTH = 64;

export async function pingPresence(sessionId: string): Promise<void> {
  if (!sessionId || sessionId.length > SESSION_ID_MAX_LENGTH) return;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const service = createServiceRoleClient();
  const now = new Date().toISOString();
  const userId = user?.id ?? null;

  // Simple server-side rate limit: skip if the session pinged < 30s ago.
  const { data: existing } = await service
    .from("user_presence")
    .select("last_seen_at")
    .eq("session_id", sessionId)
    .maybeSingle();

  if (existing?.last_seen_at) {
    const last = new Date(existing.last_seen_at).getTime();
    if (Date.now() - last < MIN_PING_INTERVAL_MS) return;
  }

  await service.from("user_presence").upsert(
    {
      session_id: sessionId,
      user_id: userId,
      anonymous: !userId,
      last_seen_at: now,
    },
    { onConflict: "session_id" },
  );
}

export async function fetchPresenceStats() {
  return getPresenceStats();
}
