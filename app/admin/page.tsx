import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { isDemoMode } from "@/lib/demo-mode";
import { getAdminSession } from "@/lib/admin/auth";
import { signOutAdmin } from "@/app/admin/logout/actions";
import {
  AdminDashboardClient,
  type DashboardPeriod,
  type DashboardStats,
  type DashboardOrder,
  type DashboardClient,
} from "@/components/admin/dashboard-stats";
import { getPresenceStats, type PresenceOnlineUser } from "@/lib/data/presence";
import { buildActivityFeed, type ActivityItem } from "@/lib/activity-feed";

export const metadata: Metadata = {
  title: "Tableau de bord | Terminal 3 Admin",
};

export const dynamic = "force-dynamic";

const EMPTY_STATS: DashboardStats = {
  onlineVisitors: 0,
  onlineUsers: 0,
  newAccounts: 0,
  ordersInPeriod: 0,
  toConfirmCount: 0,
  inPrepCount: 0,
  readyCount: 0,
  stockAlertsCount: 0,
  newBarLeadsCount: 0,
  ageChecksPending: 0,
  paidPeriodAgorot: 0,
  unpaidPeriodAgorot: 0,
};

function periodStart(period: DashboardPeriod): string {
  const now = Date.now();
  if (period === "7j") return new Date(now - 7 * 24 * 60 * 60 * 1000).toISOString();
  if (period === "30j") return new Date(now - 30 * 24 * 60 * 60 * 1000).toISOString();
  // "jour" — start of the current day (server timezone kept deliberately
  // simple: ISO date boundary at UTC midnight).
  return new Date().toISOString().slice(0, 10) + "T00:00:00.000Z";
}

function parsePeriod(raw: string | undefined): DashboardPeriod {
  return raw === "7j" || raw === "30j" ? raw : "jour";
}

export default async function AdminDashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ periode?: string }>;
}) {
  const session = await getAdminSession();
  const { periode } = await searchParams;
  const period = parsePeriod(periode);

  if (!session) {
    return (
      <div className="mx-auto max-w-lg space-y-6 rounded-sm border border-[#E7DECE] bg-white p-8 text-center shadow-sm">
        <h1 className="font-serif text-2xl text-[#151411]">Accès réservé aux administrateurs</h1>
        <p className="text-sm text-[#71695F]">
          Ce compte n&apos;est pas reconnu comme administrateur, ou vous n&apos;êtes pas connecté.
        </p>
        <div className="flex items-center justify-center gap-3">
          <a href="/admin/login" className="rounded-sm bg-[#C6A15B] px-4 py-2 text-sm font-medium text-[#151411]">
            Connexion admin
          </a>
          <form action={signOutAdmin}>
            <button
              type="submit"
              className="rounded-sm border border-[#E7DECE] px-4 py-2 text-sm text-[#151411]"
            >
              Se déconnecter
            </button>
          </form>
        </div>
      </div>
    );
  }

  const supabase = isDemoMode() ? null : await createClient();

  if (!supabase) {
    return (
      <AdminDashboardClient
        period={period}
        stats={EMPTY_STATS}
        activity={[]}
        recentOrders={[]}
        newClients={[]}
        onlineUsers={[]}
      />
    );
  }

  const since = periodStart(period);

  // Presence: service-role read, admin-only. Failure must not break the dashboard.
  let onlineVisitors = 0;
  let onlineUsers: PresenceOnlineUser[] = [];
  try {
    const presence = await getPresenceStats();
    onlineVisitors = presence.anonymousSessions;
    onlineUsers = presence.onlineUsers;
  } catch {
    onlineVisitors = 0;
    onlineUsers = [];
  }

  const [
    { count: newAccounts },
    { count: ordersInPeriod },
    { count: toConfirmCount },
    { count: inPrepCount },
    { count: readyCount },
    { count: stockAlertsCount },
    { count: newBarLeads },
    { count: newProspectLeads },
    { count: ageChecksPending },
    { data: paidPeriod },
    { data: unpaidPeriod },
    { data: recentOrdersRaw },
    { data: newClientsRaw },
    { data: recentBars },
    { data: auditLogs },
    { data: lowStockProducts },
  ] = await Promise.all([
    supabase.from("profiles").select("*", { count: "exact", head: true }).gte("created_at", since),
    supabase.from("orders").select("*", { count: "exact", head: true }).gte("created_at", since),
    supabase.from("orders").select("*", { count: "exact", head: true }).in("status", ["submitted", "received", "reviewing"]),
    supabase.from("orders").select("*", { count: "exact", head: true }).in("status", ["confirmed", "accepted", "preparing"]),
    supabase.from("orders").select("*", { count: "exact", head: true }).eq("status", "ready"),
    supabase.from("products").select("*", { count: "exact", head: true }).in("availability_status", ["LOW_STOCK", "OUT_OF_STOCK"]),
    supabase.from("bar_profiles").select("*", { count: "exact", head: true }).eq("status", "new"),
    supabase.from("leads").select("*", { count: "exact", head: true }).eq("status", "new"),
    supabase.from("age_verifications").select("*", { count: "exact", head: true }).eq("status", "PENDING"),
    supabase.from("orders").select("total_agorot").gte("created_at", since).in("status", ["completed", "collected", "ready"]),
    supabase.from("orders").select("total_agorot").gte("created_at", since).in("status", ["submitted", "received", "reviewing", "confirmed", "accepted", "preparing"]),
    supabase
      .from("orders")
      .select("id, public_order_number, customer_name, customer_phone, total_agorot, status, created_at, user_id")
      .order("created_at", { ascending: false })
      .limit(6),
    // `verification_status` and `account_type` exist in the DB (migrations
    // 0021/0043) but are missing from the generated Database types — cast.
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (supabase.from("profiles") as any)
      .select("id, first_name, last_name, email, phone, created_at, account_type, verification_status")
      .order("created_at", { ascending: false })
      .limit(6) as Promise<{
      data: {
        id: string;
        first_name: string | null;
        last_name: string | null;
        email: string | null;
        phone: string | null;
        created_at: string;
        account_type: string | null;
        verification_status: string | null;
      }[] | null;
    }>,
    supabase
      .from("bar_profiles")
      .select("id, business_name, created_at")
      .order("created_at", { ascending: false })
      .limit(5),
    supabase
      .from("audit_logs")
      .select("id, action, entity_type, entity_id, actor_user_id, created_at")
      .order("created_at", { ascending: false })
      .limit(10),
    supabase
      .from("products")
      .select("id, name_fr")
      .eq("availability_status", "LOW_STOCK")
      .limit(5),
  ]);

  const orders = recentOrdersRaw ?? [];
  const orderIds = orders.map((o) => o.id);
  const orderUserIds = [...new Set(orders.map((o) => o.user_id).filter(Boolean))] as string[];

  const clients = newClientsRaw ?? [];
  const clientIds = clients.map((c) => c.id);

  const actorIds = [
    ...new Set((auditLogs ?? []).map((l) => l.actor_user_id).filter(Boolean)),
  ] as string[];

  const [
    { data: orderItems },
    { data: orderProfiles },
    { data: orderAgeVerifications },
    { data: clientOrders },
    { data: clientPresence },
    { data: actorProfiles },
  ] = await Promise.all([
    orderIds.length
      ? supabase
          .from("order_items")
          .select("order_id, product_name_snapshot, variant_label_snapshot, quantity")
          .in("order_id", orderIds)
      : Promise.resolve({ data: [] as { order_id: string; product_name_snapshot: string; variant_label_snapshot: string | null; quantity: number }[] }),
    orderUserIds.length
      ? supabase.from("profiles").select("id, email").in("id", orderUserIds)
      : Promise.resolve({ data: [] as { id: string; email: string | null }[] }),
    orderIds.length
      ? supabase.from("age_verifications").select("order_id, status").in("order_id", orderIds)
      : Promise.resolve({ data: [] as { order_id: string; status: string }[] }),
    clientIds.length
      ? (supabase.from("orders").select("user_id").in("user_id", clientIds) as unknown as Promise<{
          data: { user_id: string | null }[];
        }>)
      : Promise.resolve({ data: [] as { user_id: string | null }[] }),
    clientIds.length
      ? (supabase.from("user_presence").select("user_id, last_seen_at").in("user_id", clientIds).order("last_seen_at", { ascending: false }) as unknown as Promise<{
          data: { user_id: string | null; last_seen_at: string }[];
        }>)
      : Promise.resolve({ data: [] as { user_id: string | null; last_seen_at: string }[] }),
    actorIds.length
      ? supabase.from("profiles").select("id, first_name, last_name, email").in("id", actorIds)
      : Promise.resolve({ data: [] as { id: string; first_name: string | null; last_name: string | null; email: string | null }[] }),
  ]);

  const emailByUserId = new Map((orderProfiles ?? []).map((p) => [p.id, p.email]));
  const actorNameById = new Map(
    (actorProfiles ?? []).map((p) => [
      p.id,
      [p.first_name, p.last_name].filter(Boolean).join(" ").trim() || p.email || null,
    ]),
  );
  const orderCountByUserId = new Map<string, number>();
  for (const row of clientOrders ?? []) {
    if (!row.user_id) continue;
    orderCountByUserId.set(row.user_id, (orderCountByUserId.get(row.user_id) ?? 0) + 1);
  }
  const lastSeenByUserId = new Map<string, string>();
  for (const row of clientPresence ?? []) {
    if (!row.user_id || lastSeenByUserId.has(row.user_id)) continue;
    lastSeenByUserId.set(row.user_id, row.last_seen_at);
  }

  const recentOrders: DashboardOrder[] = orders.map((order) => {
    const items = (orderItems ?? []).filter((i) => i.order_id === order.id);
    const ageRows = (orderAgeVerifications ?? []).filter((av) => av.order_id === order.id);
    const ageStatus: DashboardOrder["ageStatus"] = ageRows.some((av) => av.status === "VERIFIED")
      ? "confirmed"
      : ageRows.length > 0
        ? "pending"
        : "none";
    return {
      id: order.id,
      ref: order.public_order_number ?? `#${order.id.slice(0, 8)}`,
      customerName: order.customer_name,
      customerPhone: order.customer_phone,
      customerEmail: order.user_id ? (emailByUserId.get(order.user_id) ?? null) : null,
      totalAgorot: order.total_agorot,
      status: order.status,
      createdAt: order.created_at,
      items: items.map((i) => ({
        name: i.product_name_snapshot,
        variant: i.variant_label_snapshot,
        quantity: i.quantity,
      })),
      ageStatus,
    };
  });

  const newClients: DashboardClient[] = clients.map((c) => ({
    id: c.id,
    name: [c.first_name, c.last_name].filter(Boolean).join(" ").trim() || c.email || "Client",
    email: c.email,
    phone: c.phone,
    accountType: (c as { account_type?: string | null }).account_type ?? null,
    verificationStatus: (c as { verification_status?: string | null }).verification_status ?? null,
    orderCount: orderCountByUserId.get(c.id) ?? 0,
    lastSeenAt: lastSeenByUserId.get(c.id) ?? null,
    createdAt: c.created_at,
  }));

  const activity: ActivityItem[] = buildActivityFeed({
    orders: orders.map((o) => ({
      id: o.id,
      public_order_number: o.public_order_number,
      customer_name: o.customer_name,
      total_agorot: o.total_agorot,
      status: o.status,
      item_count: (orderItems ?? []).filter((i) => i.order_id === o.id).length,
      created_at: o.created_at,
    })),
    profiles: clients.map((c) => ({
      id: c.id,
      first_name: c.first_name,
      last_name: c.last_name,
      email: c.email,
      account_type: (c as { account_type?: string | null }).account_type ?? null,
      created_at: c.created_at,
    })),
    bars: (recentBars ?? []).map((b) => ({
      id: b.id,
      business_name: b.business_name,
      created_at: b.created_at,
    })),
    auditLogs: (auditLogs ?? []).map((l) => ({
      id: l.id,
      action: l.action,
      entity_type: l.entity_type,
      entity_id: l.entity_id,
      actor_name: l.actor_user_id ? (actorNameById.get(l.actor_user_id) ?? null) : null,
      created_at: l.created_at,
    })),
    lowStock: (lowStockProducts ?? []).map((p) => ({ id: p.id, name: p.name_fr ?? "Produit" })),
    limit: 15,
  });

  const stats: DashboardStats = {
    onlineVisitors,
    onlineUsers: onlineUsers.length,
    newAccounts: newAccounts ?? 0,
    ordersInPeriod: ordersInPeriod ?? 0,
    toConfirmCount: toConfirmCount ?? 0,
    inPrepCount: inPrepCount ?? 0,
    readyCount: readyCount ?? 0,
    stockAlertsCount: stockAlertsCount ?? 0,
    newBarLeadsCount: (newBarLeads ?? 0) + (newProspectLeads ?? 0),
    ageChecksPending: ageChecksPending ?? 0,
    paidPeriodAgorot: (paidPeriod ?? []).reduce((sum, row) => sum + (row.total_agorot ?? 0), 0),
    unpaidPeriodAgorot: (unpaidPeriod ?? []).reduce((sum, row) => sum + (row.total_agorot ?? 0), 0),
  };

  return (
    <AdminDashboardClient
      period={period}
      stats={stats}
      activity={activity}
      recentOrders={recentOrders}
      newClients={newClients}
      onlineUsers={onlineUsers}
    />
  );
}
