/**
 * Pure presence aggregation — extracted from lib/data/presence.ts so it can
 * be unit-tested without a Supabase client.
 *
 * Privacy contract:
 * - anonymous sessions are only ever counted, never identified;
 * - authenticated sessions are deduplicated per user_id and keep only the
 *   latest `last_seen_at`.
 */

export interface PresenceRowLike {
  user_id: string | null;
  anonymous: boolean;
  last_seen_at: string;
}

export interface PresenceSummary {
  /** Total active sessions (anonymous + authenticated). */
  total: number;
  /** Anonymous sessions — aggregate count only, no identity. */
  anonymousSessions: number;
  /** Distinct authenticated users currently online. */
  authenticatedUsers: number;
  /** user_id → latest last_seen_at for authenticated users. */
  lastSeenByUser: Map<string, string>;
}

export function summarizePresenceRows(rows: PresenceRowLike[]): PresenceSummary {
  const lastSeenByUser = new Map<string, string>();
  let anonymousSessions = 0;

  for (const row of rows) {
    if (row.anonymous || !row.user_id) {
      anonymousSessions += 1;
      continue;
    }
    const existing = lastSeenByUser.get(row.user_id);
    if (!existing || row.last_seen_at > existing) {
      lastSeenByUser.set(row.user_id, row.last_seen_at);
    }
  }

  return {
    total: rows.length,
    anonymousSessions,
    authenticatedUsers: lastSeenByUser.size,
    lastSeenByUser,
  };
}
