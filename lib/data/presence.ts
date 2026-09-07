import "server-only";
import { createServiceRoleClient } from "@/lib/supabase/server";
import { summarizePresenceRows } from "@/lib/presence-summary";

export interface PresenceOnlineUser {
  userId: string;
  displayName: string;
  email: string | null;
  accountType: string | null;
  lastSeenAt: string;
}

export interface PresenceStats {
  total: number;
  anonymousSessions: number;
  authenticatedUsers: number;
  /**
   * Authenticated users currently online. Anonymous visitors are never
   * listed — only counted. Admin-only data: this helper is only called
   * from admin-guarded server code.
   */
  onlineUsers: PresenceOnlineUser[];
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

  const summary = summarizePresenceRows(data);
  const userIds = [...summary.lastSeenByUser.keys()];

  const onlineUsers: PresenceOnlineUser[] = [];
  if (userIds.length > 0) {
    const { data: profiles } = await service
      .from("profiles")
      .select("id, first_name, last_name, email, account_type")
      .in("id", userIds);

    for (const profile of profiles ?? []) {
      const name = [profile.first_name, profile.last_name].filter(Boolean).join(" ").trim();
      onlineUsers.push({
        userId: profile.id,
        displayName: name || profile.email || "Utilisateur",
        email: profile.email,
        accountType: (profile as { account_type?: string | null }).account_type ?? null,
        lastSeenAt: summary.lastSeenByUser.get(profile.id) ?? since,
      });
    }
    onlineUsers.sort((a, b) => (a.lastSeenAt < b.lastSeenAt ? 1 : -1));
  }

  return {
    total: summary.total,
    anonymousSessions: summary.anonymousSessions,
    authenticatedUsers: summary.authenticatedUsers,
    onlineUsers,
    refreshedAt: new Date().toISOString(),
  };
}
