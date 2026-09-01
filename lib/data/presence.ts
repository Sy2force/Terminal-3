import "server-only";
import { createServiceRoleClient } from "@/lib/supabase/server";

export interface PresenceStats {
  total: number;
  anonymousSessions: number;
  authenticatedUsers: number;
  refreshedAt: string;
}

const ACTIVE_WINDOW_MS = 5 * 60 * 1000;

export async function getPresenceStats(): Promise<PresenceStats> {
  const service = createServiceRoleClient();
  const since = new Date(Date.now() - ACTIVE_WINDOW_MS).toISOString();

  const { data, error } = await service
    .from("user_presence")
    .select("id, user_id, anonymous, last_seen_at")
    .gte("last_seen_at", since);

  if (error || !data) {
    throw new Error(error?.message ?? "presence_stats_failed");
  }

  const total = data.length;
  const anonymousSessions = data.filter((r) => r.anonymous).length;
  const authenticatedUserIds = new Set(
    data.filter((r) => !r.anonymous && r.user_id).map((r) => r.user_id),
  );

  return {
    total,
    anonymousSessions,
    authenticatedUsers: authenticatedUserIds.size,
    refreshedAt: new Date().toISOString(),
  };
}
