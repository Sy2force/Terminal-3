import type { Metadata } from "next";
import { Suspense } from "react";
import { getAdminSession } from "@/lib/admin/auth";
import { signOutAdmin } from "@/app/admin/logout/actions";
import {
  AdminDashboardClient,
  type DashboardPeriod,
  type DashboardStats,
  type DashboardOrder,
  type DashboardClient,
} from "@/components/admin/dashboard-stats";
import { getPresenceStats } from "@/lib/data/presence";
import { buildActivityFeed, type ActivityItem } from "@/lib/activity-feed";
import { createClient } from "@/lib/supabase/server";
import { isDemoMode } from "@/lib/demo-mode";

export const metadata: Metadata = {
  title: "Tableau de bord | Terminal 3 Admin",
};

export const dynamic = "force-dynamic";

const EMPTY_STATS: DashboardStats = {
  onlineTotal: 0,
  onlineUsers: 0,
  newOrdersCount: 0,
  toPrepareCount: 0,
  readyCount: 0,
  alertsCount: 0,
  catalogTotal: 0,
  catalogPublished: 0,
  catalogLowStock: 0,
  catalogMissingPhotos: 0,
};

function periodStart(period: DashboardPeriod): string {
  const now = Date.now();
  if (period === "7j") return new Date(now - 7 * 24 * 60 * 60 * 1000).toISOString();
  if (period === "30j") return new Date(now - 30 * 24 * 60 * 60 * 1000).toISOString();
  return new Date().toISOString().slice(0, 10) + "T00:00:00.000Z";
}

function parsePeriod(raw: string | undefined): DashboardPeriod {
  return raw === "7j" || raw === "30j" ? raw : "jour";
}

async function DashboardContent({ period }: { period: DashboardPeriod }) {
  const refreshedAt = new Date().toISOString();
  const supabase = isDemoMode() ? null : await createClient();

  if (!supabase) {
    return (
      <AdminDashboardClient
        period={period}
        stats={EMPTY_STATS}
        activity={[]}
        recentOrders={[]}
        newClients={[]}
        refreshedAt={refreshedAt}
      />
    );
  }

  const since = periodStart(period);

  let onlineTotal = 0;
  let onlineUsers = 0;
  try {
    const presence = await getPresenceStats();
    onlineTotal = presence.total;
    onlineUsers = presence.authenticatedUsers;
  } catch {
    onlineTotal = 0;
    onlineUsers = 0;
  }

  const [
    { count: newOrdersCount },
    { count: toPrepareCount },
    { count: readyCount },
    { count: ageChecksPending },
    { count: lowStockCount },
    { count: outOfStockCount },
    { count: missingPhotosCount },
    { count: catalogTotal },
    { count: catalogPublished },
    { data: recentOrdersRaw },
    { data: newClientsRaw },
    { data: recentProfiles },
    { data: recentBars },
    { data: auditLogs },
    { data: lowStockProducts },
  ] = await Promise.all([
    supabase.from("orders").select("*", { count: "exact", head: true }).gte("created_at", since),
    supabase
      .from("orders")
      .select("*", { count: "exact", head: true })
      .in("status", ["submitted", "received", "reviewing", "confirmed", "accepted", "preparing"]),
    supabase.from("orders").select("*", { count: "exact", head: true }).eq("status", "ready"),
    supabase.from("age_verifications").select("*", { count: "exact", head: true }).eq("status", "PENDING"),
    supabase.from("products").select("*", { count: "exact", head: true }).eq("availability_status", "LOW_STOCK"),
    supabase.from("products").select("*", { count: "exact", head: true }).eq("availability_status", "OUT_OF_STOCK"),
    supabase
      .from("products")
      .select("id", { count: "exact", head: true })
      .not("id", "in", "(select product_id from product_media where kind = 'COVER')"),
    supabase.from("products").select("*", { count: "exact", head: true }),
    supabase.from("products").select("*", { count: "exact", head: true }).eq("status", "published"),
    supabase
      .from("orders")
      .select("id, public_order_number, customer_name, total_agorot, status, created_at")
      .order("created_at", { ascending: false })
      .limit(5),
    // `verification_status` and `account_type` exist in the DB (migrations
    // 0021/0043) but are missing from the generated Database types — cast.
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (supabase.from("profiles") as any)
      .select("id, first_name, last_name, email, created_at, account_type, verification_status")
      .order("created_at", { ascending: false })
      .limit(5) as Promise<{
      data: {
        id: string;
        first_name: string | null;
        last_name: string | null;
        email: string | null;
        created_at: string;
        account_type: string | null;
        verification_status: string | null;
      }[] | null;
    }>,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (supabase.from("profiles") as any)
      .select("id, first_name, last_name, email, created_at, account_type")
      .order("created_at", { ascending: false })
      .limit(8) as Promise<{
      data: {
        id: string;
        first_name: string | null;
        last_name: string | null;
        email: string | null;
        created_at: string;
        account_type: string | null;
      }[] | null;
    }>,
    supabase.from("bar_profiles").select("id, business_name, created_at").order("created_at", { ascending: false }).limit(5),
    supabase
      .from("audit_logs")
      .select("id, action, entity_type, entity_id, actor_user_id, created_at")
      .order("created_at", { ascending: false })
      .limit(10),
    supabase.from("products").select("id, name_fr").eq("availability_status", "LOW_STOCK").limit(5),
  ]);

  const orders = recentOrdersRaw ?? [];
  const orderIds = orders.map((o) => o.id);
  const actorIds = [
    ...new Set((auditLogs ?? []).map((l) => l.actor_user_id).filter(Boolean)),
  ] as string[];

  const [
    { data: orderItems },
    { data: orderAgeVerifications },
    { data: actorProfiles },
  ] = await Promise.all([
    orderIds.length
      ? supabase
          .from("order_items")
          .select("order_id, product_name_snapshot, variant_label_snapshot, quantity")
          .in("order_id", orderIds)
      : Promise.resolve({ data: [] as { order_id: string; product_name_snapshot: string; variant_label_snapshot: string | null; quantity: number }[] }),
    orderIds.length
      ? supabase.from("age_verifications").select("order_id, status").in("order_id", orderIds)
      : Promise.resolve({ data: [] as { order_id: string; status: string }[] }),
    actorIds.length
      ? supabase.from("profiles").select("id, first_name, last_name, email").in("id", actorIds)
      : Promise.resolve({ data: [] as { id: string; first_name: string | null; last_name: string | null; email: string | null }[] }),
  ]);

  const actorNameById = new Map(
    (actorProfiles ?? []).map((p) => [
      p.id,
      [p.first_name, p.last_name].filter(Boolean).join(" ").trim() || p.email || null,
    ]),
  );

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

  const newClients: DashboardClient[] = (newClientsRaw ?? []).map((c) => ({
    id: c.id,
    name: [c.first_name, c.last_name].filter(Boolean).join(" ").trim() || c.email || "Client",
    email: c.email,
    accountType: c.account_type ?? null,
    verificationStatus: c.verification_status ?? null,
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
    profiles: (recentProfiles ?? []).map((c) => ({
      id: c.id,
      first_name: c.first_name,
      last_name: c.last_name,
      email: c.email,
      account_type: c.account_type ?? null,
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
    limit: 12,
  });

  const stats: DashboardStats = {
    onlineTotal,
    onlineUsers,
    newOrdersCount: newOrdersCount ?? 0,
    toPrepareCount: toPrepareCount ?? 0,
    readyCount: readyCount ?? 0,
    alertsCount: (ageChecksPending ?? 0) + (lowStockCount ?? 0) + (outOfStockCount ?? 0) + (missingPhotosCount ?? 0),
    catalogTotal: catalogTotal ?? 0,
    catalogPublished: catalogPublished ?? 0,
    catalogLowStock: (lowStockCount ?? 0) + (outOfStockCount ?? 0),
    catalogMissingPhotos: missingPhotosCount ?? 0,
  };

  return (
    <AdminDashboardClient
      period={period}
      stats={stats}
      activity={activity}
      recentOrders={recentOrders}
      newClients={newClients}
      refreshedAt={refreshedAt}
    />
  );
}

function DashboardSkeleton() {
  return (
    <div className="mx-auto max-w-6xl space-y-6" aria-busy="true" aria-label="Chargement du tableau de bord">
      <section className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-serif text-2xl text-[#151411]">Vue d&apos;ensemble</h1>
          <div className="mt-0.5 h-3 w-48 animate-pulse rounded-sm bg-[#E7DECE]" />
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <div className="h-9 w-48 animate-pulse rounded-sm bg-[#E7DECE]" />
          <div className="h-9 w-28 animate-pulse rounded-sm bg-[#E7DECE]" />
          <div className="h-9 w-32 animate-pulse rounded-sm bg-[#E7DECE]" />
        </div>
      </section>

      <section className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {["Nouvelles commandes", "À préparer", "Prêtes à récupérer", "Alertes"].map((label) => (
          <div key={label} className="rounded-sm border border-[#E7DECE] bg-white p-4 shadow-sm">
            <p className="text-xs text-[#71695F]">{label}</p>
            <div className="mt-2 h-8 w-16 animate-pulse rounded-sm bg-[#E7DECE]" />
          </div>
        ))}
      </section>

      <div className="grid gap-4 lg:grid-cols-2">
        <section className="rounded-sm border border-[#E7DECE] bg-white shadow-sm">
          <header className="border-b border-[#E7DECE] px-4 py-3">
            <h2 className="font-serif text-base text-[#151411]">Commandes récentes</h2>
          </header>
          <div className="space-y-3 p-4">
            <div className="h-16 animate-pulse rounded-sm bg-[#E7DECE]" />
            <div className="h-16 animate-pulse rounded-sm bg-[#E7DECE]" />
          </div>
        </section>
        <section className="rounded-sm border border-[#E7DECE] bg-white shadow-sm">
          <header className="border-b border-[#E7DECE] px-4 py-3">
            <h2 className="font-serif text-base text-[#151411]">Activité récente</h2>
          </header>
          <div className="space-y-3 p-4">
            <div className="h-12 animate-pulse rounded-sm bg-[#E7DECE]" />
            <div className="h-12 animate-pulse rounded-sm bg-[#E7DECE]" />
          </div>
        </section>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <section className="rounded-sm border border-[#E7DECE] bg-white p-4 shadow-sm">
          <h2 className="font-serif text-base text-[#151411]">État du catalogue</h2>
          <dl className="mt-3 grid grid-cols-2 gap-3">
            {["Produits", "Publiés", "Stock faible", "Photos manquantes"].map((label) => (
              <div key={label}>
                <dt className="text-xs text-[#71695F]">{label}</dt>
                <dd className="mt-1 h-6 w-12 animate-pulse rounded-sm bg-[#E7DECE]" />
              </div>
            ))}
          </dl>
        </section>
        <section className="rounded-sm border border-[#E7DECE] bg-white p-4 shadow-sm">
          <h2 className="font-serif text-base text-[#151411]">Nouveaux clients</h2>
          <div className="mt-3 space-y-2">
            <div className="h-8 animate-pulse rounded-sm bg-[#E7DECE]" />
            <div className="h-8 animate-pulse rounded-sm bg-[#E7DECE]" />
          </div>
        </section>
        <section className="rounded-sm border border-[#E7DECE] bg-white p-4 shadow-sm">
          <h2 className="font-serif text-base text-[#151411]">Actions rapides</h2>
          <div className="mt-3 grid grid-cols-2 gap-2">
            {["Ajouter un produit", "Ajouter des photos", "Modifier l'accueil", "Créer une promotion"].map((label) => (
              <div key={label} aria-label={label} className="h-20 animate-pulse rounded-sm bg-[#E7DECE]" />
            ))}
          </div>
        </section>
      </div>
    </div>
  );
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
          <a
            href="/admin/login"
            className="rounded-sm bg-[#C6A15B] px-4 py-2 text-sm font-medium text-[#151411]"
          >
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

  return (
    <Suspense fallback={<DashboardSkeleton />}>
      <DashboardContent period={period} />
    </Suspense>
  );
}
