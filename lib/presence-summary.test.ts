import { describe, it, expect } from "vitest";
import { summarizePresenceRows } from "./presence-summary";

describe("summarizePresenceRows", () => {
  it("counts anonymous sessions as an aggregate only", () => {
    const summary = summarizePresenceRows([
      { user_id: null, anonymous: true, last_seen_at: "2026-09-07T10:00:00Z" },
      { user_id: null, anonymous: true, last_seen_at: "2026-09-07T10:01:00Z" },
    ]);
    expect(summary.anonymousSessions).toBe(2);
    expect(summary.authenticatedUsers).toBe(0);
    expect(summary.total).toBe(2);
    expect(summary.lastSeenByUser.size).toBe(0);
  });

  it("deduplicates multiple sessions of the same authenticated user", () => {
    const summary = summarizePresenceRows([
      { user_id: "u1", anonymous: false, last_seen_at: "2026-09-07T10:00:00Z" },
      { user_id: "u1", anonymous: false, last_seen_at: "2026-09-07T10:05:00Z" },
      { user_id: "u2", anonymous: false, last_seen_at: "2026-09-07T10:02:00Z" },
    ]);
    expect(summary.authenticatedUsers).toBe(2);
    expect(summary.lastSeenByUser.get("u1")).toBe("2026-09-07T10:05:00Z");
    expect(summary.lastSeenByUser.get("u2")).toBe("2026-09-07T10:02:00Z");
  });

  it("treats rows with anonymous flag but a user_id as anonymous", () => {
    const summary = summarizePresenceRows([
      { user_id: "u1", anonymous: true, last_seen_at: "2026-09-07T10:00:00Z" },
    ]);
    expect(summary.anonymousSessions).toBe(1);
    expect(summary.authenticatedUsers).toBe(0);
  });

  it("keeps the latest last_seen_at per user", () => {
    const summary = summarizePresenceRows([
      { user_id: "u1", anonymous: false, last_seen_at: "2026-09-07T10:09:00Z" },
      { user_id: "u1", anonymous: false, last_seen_at: "2026-09-07T10:00:00Z" },
    ]);
    expect(summary.lastSeenByUser.get("u1")).toBe("2026-09-07T10:09:00Z");
  });
});
