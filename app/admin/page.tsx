import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { isDemoMode } from "@/lib/demo-mode";
import { getAdminSession } from "@/lib/admin/auth";
import { signOutAdmin } from "@/app/admin/logout/actions";
import { AdminDashboardClient, type RecentProduct, type RecentActivity } from "@/components/admin/dashboard-stats";

export const metadata: Metadata = {
  title: "Tableau de bord | Terminal 3 Admin",
};

export const revalidate = 60;

function todayStart(): string {
  return new Date().toISOString().slice(0, 10);
}

function sevenDaysAgoIso(): string {
  return new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
}

export default async function AdminDashboardPage() {
  const session = await getAdminSession();

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
        stats={{
          productsTotal: 0,
          productsCount: 0,
          productsDraft: 0,
          missingPhotosCount: 0,
          promotedCount: 0,
          outOfStockCount: 0,
          ordersTodayCount: 0,
          toConfirmCount: 0,
          preparingCount: 0,
          readyCount: 0,
          toDeliverCount: 0,
          activePromotionsCount: 0,
          clientsTotal: 0,
          newClientsCount: 0,
          clubMembersCount: 0,
          ageChecksPending: 0,
          lowStockCount: 0,
          paidTodayAgorot: 0,
          unpaidTodayAgorot: 0,
        }}
        recentProducts={[]}
        recentActivity={[]}
      />
    );
  }

  const today = todayStart();
  const sevenDaysAgo = sevenDaysAgoIso();

  const [
    { count: productsTotal },
    { count: productsCount },
    { count: productsDraft },
    { count: missingPhotosCount },
    { count: promotedCount },
    { count: outOfStockCount },
    { count: ordersTodayCount },
    { count: toConfirmCount },
    { count: preparingCount },
    { count: readyCount },
    { count: toDeliverCount },
    { count: activePromotionsCount },
    { count: clientsTotal },
    { count: newClientsCount },
    { count: clubMembersCount },
    { count: ageChecksPending },
    { count: lowStockCount },
    { data: paidToday },
    { data: unpaidToday },
    { data: recentProducts },
    { data: recentActivity },
  ] = await Promise.all([
    supabase.from("products").select("*", { count: "exact", head: true }),
    supabase.from("products").select("*", { count: "exact", head: true }).eq("status", "published"),
    supabase.from("products").select("*", { count: "exact", head: true }).eq("status", "draft"),
    supabase.from("products").select("id", { count: "exact", head: true }).not("id", "in", "(select product_id from product_media where kind = 'COVER')"),
    supabase.from("products").select("*", { count: "exact", head: true }).eq("status", "published").not("compare_at_price_agorot", "is", null),
    supabase.from("products").select("*", { count: "exact", head: true }).eq("availability_status", "OUT_OF_STOCK"),
    supabase.from("orders").select("*", { count: "exact", head: true }).gte("created_at", today),
    supabase.from("orders").select("*", { count: "exact", head: true }).eq("status", "submitted"),
    supabase.from("orders").select("*", { count: "exact", head: true }).eq("status", "confirmed"),
    supabase.from("orders").select("*", { count: "exact", head: true }).eq("status", "ready"),
    supabase.from("deliveries").select("*", { count: "exact", head: true }).in("status", ["ASSIGNED", "ACCEPTED", "PICKED_UP", "IN_TRANSIT", "ARRIVED"]),
    supabase.from("promotions").select("*", { count: "exact", head: true }).eq("status", "active"),
    supabase.from("profiles").select("*", { count: "exact", head: true }),
    supabase.from("profiles").select("*", { count: "exact", head: true }).gte("created_at", sevenDaysAgo),
    supabase.from("club_memberships").select("*", { count: "exact", head: true }),
    supabase.from("age_verifications").select("*", { count: "exact", head: true }).eq("status", "PENDING"),
    supabase.from("inventory").select("*", { count: "exact", head: true }).gt("quantity", 0).lt("quantity", 10),
    supabase.from("orders").select("total_agorot").gte("created_at", today).in("status", ["completed", "ready"]),
    supabase.from("orders").select("total_agorot").gte("created_at", today).in("status", ["submitted", "confirmed"]),
    supabase
      .from("products")
      .select("id, name_fr, status, updated_at")
      .order("updated_at", { ascending: false })
      .limit(5),
    supabase
      .from("audit_logs")
      .select("id, action, entity_type, entity_id, metadata, actor_user_id, created_at")
      .order("created_at", { ascending: false })
      .limit(5),
  ]);

  const paidTodayAgorot = (paidToday ?? []).reduce((sum, row) => sum + (row.total_agorot ?? 0), 0);
  const unpaidTodayAgorot = (unpaidToday ?? []).reduce((sum, row) => sum + (row.total_agorot ?? 0), 0);

  return (
    <AdminDashboardClient
      stats={{
        productsTotal: productsTotal ?? 0,
        productsCount: productsCount ?? 0,
        productsDraft: productsDraft ?? 0,
        missingPhotosCount: missingPhotosCount ?? 0,
        promotedCount: promotedCount ?? 0,
        outOfStockCount: outOfStockCount ?? 0,
        ordersTodayCount: ordersTodayCount ?? 0,
        toConfirmCount: toConfirmCount ?? 0,
        preparingCount: preparingCount ?? 0,
        readyCount: readyCount ?? 0,
        toDeliverCount: toDeliverCount ?? 0,
        activePromotionsCount: activePromotionsCount ?? 0,
        clientsTotal: clientsTotal ?? 0,
        newClientsCount: newClientsCount ?? 0,
        clubMembersCount: clubMembersCount ?? 0,
        ageChecksPending: ageChecksPending ?? 0,
        lowStockCount: lowStockCount ?? 0,
        paidTodayAgorot,
        unpaidTodayAgorot,
      }}
      recentProducts={(recentProducts as RecentProduct[]) ?? []}
      recentActivity={(recentActivity as RecentActivity[]) ?? []}
    />
  );
}
