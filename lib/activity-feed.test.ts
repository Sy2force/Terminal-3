import { describe, it, expect } from "vitest";
import { buildActivityFeed } from "./activity-feed";

describe("buildActivityFeed", () => {
  it("maps a new order to a feed entry with ref, total and link", () => {
    const feed = buildActivityFeed({
      orders: [
        {
          id: "ord-1",
          public_order_number: "T3-1042",
          customer_name: "David Cohen",
          total_agorot: 18600,
          status: "submitted",
          item_count: 2,
          created_at: "2026-09-07T14:32:00Z",
        },
      ],
      profiles: [],
      bars: [],
      auditLogs: [],
      lowStock: [],
    });
    expect(feed).toHaveLength(1);
    expect(feed[0].kind).toBe("order");
    expect(feed[0].text).toContain("T3-1042");
    expect(feed[0].text).toContain("David Cohen");
    expect(feed[0].href).toBe("/admin/orders/ord-1");
  });

  it("labels personal vs business accounts", () => {
    const feed = buildActivityFeed({
      orders: [],
      profiles: [
        {
          id: "p1",
          first_name: "David",
          last_name: "Cohen",
          email: "david@example.com",
          account_type: "personal",
          created_at: "2026-09-07T09:00:00Z",
        },
        {
          id: "p2",
          first_name: null,
          last_name: null,
          email: "bar@example.com",
          account_type: "business",
          created_at: "2026-09-07T09:30:00Z",
        },
      ],
      bars: [],
      auditLogs: [],
      lowStock: [],
    });
    expect(feed[0].text).toContain("Professionnel");
    expect(feed[1].text).toContain("Particulier");
    expect(feed[0].href).toBe("/admin/clients/p2");
  });

  it("sorts all sources chronologically, most recent first", () => {
    const feed = buildActivityFeed({
      orders: [
        {
          id: "ord-1",
          public_order_number: null,
          customer_name: null,
          total_agorot: null,
          status: "submitted",
          item_count: 0,
          created_at: "2026-09-07T10:00:00Z",
        },
      ],
      profiles: [
        {
          id: "p1",
          first_name: null,
          last_name: null,
          email: "a@b.c",
          account_type: "personal",
          created_at: "2026-09-07T11:00:00Z",
        },
      ],
      bars: [
        { id: "b1", business_name: "Bar Exemple", created_at: "2026-09-07T12:00:00Z" },
      ],
      auditLogs: [],
      lowStock: [],
    });
    expect(feed.map((i) => i.kind)).toEqual(["lead", "account", "order"]);
    expect(feed[0].text).toContain("Bar Exemple");
    expect(feed[0].href).toBe("/admin/bars/b1");
  });

  it("translates audit actions to French labels and resolves links", () => {
    const feed = buildActivityFeed({
      orders: [],
      profiles: [],
      bars: [],
      auditLogs: [
        {
          id: "a1",
          action: "published",
          entity_type: "page_content",
          entity_id: null,
          actor_name: "Admin",
          created_at: "2026-09-07T10:00:00Z",
        },
        {
          id: "a2",
          action: "status_changed",
          entity_type: "order",
          entity_id: "ord-9",
          actor_name: null,
          created_at: "2026-09-07T09:00:00Z",
        },
      ],
      lowStock: [],
    });
    expect(feed[0].text).toContain("Publication");
    expect(feed[0].text).toContain("par Admin");
    expect(feed[1].text).toContain("Changement de statut");
    expect(feed[1].href).toBe("/admin/orders/ord-9");
  });

  it("never includes secrets in feed text", () => {
    const feed = buildActivityFeed({
      orders: [],
      profiles: [
        {
          id: "p1",
          first_name: "X",
          last_name: "Y",
          email: "x@y.z",
          account_type: "personal",
          created_at: "2026-09-07T10:00:00Z",
        },
      ],
      bars: [],
      auditLogs: [],
      lowStock: [],
    });
    const serialized = JSON.stringify(feed);
    expect(serialized).not.toMatch(/password|token|cookie|secret/i);
  });
});
