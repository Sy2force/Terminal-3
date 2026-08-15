import { createClient } from "@/lib/supabase/server";
import { isDemoMode } from "@/lib/demo-mode";
import { requireAdmin } from "@/lib/admin/auth";
import { AdminDashboardClient } from "@/components/admin/dashboard-stats";

function todayStart(): string {
  return new Date().toISOString().slice(0, 10);
}

function sevenDaysAgoIso(): string {
  return new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
}

export default async function AdminDashboardPage() {
  await requireAdmin();

  const supabase = isDemoMode() ? null : await createClient();

  // In demo mode all values are 0. The admin UI is still fully navigable,
  // but no real business data is fabricated.
  if (!supabase) {
    return <AdminDashboardClient stats={{
      productsCount: 0,
      ordersTodayCount: 0,
      activePromotionsCount: 0,
      clubMembersCount: 0,
      preparingCount: 0,
      readyCount: 0,
      ageChecksPending: 0,
      missingPhotosCount: 0,
      toConfirmCount: 0,
      toDeliverCount: 0,
      paidTodayAgorot: 0,
      unpaidTodayAgorot: 0,
      lowStockCount: 0,
      outOfStockCount: 0,
      newClientsCount: 0,
      pendingVerificationsCount: 0,
    }} />;
  }

  const today = todayStart();
  const sevenDaysAgo = sevenDaysAgoIso();

  const [
    { count: productsCount },
    { count: ordersTodayCount },
    { count: activePromotionsCount },
    { count: clubMembersCount },
    { count: preparingCount },
    { count: readyCount },
    { count: ageChecksPending },
    { count: missingPhotosCount },
    { count: toConfirmCount },
    { count: toDeliverCount },
    { data: paidToday },
    { data: unpaidToday },
    { count: lowStockCount },
    { count: outOfStockCount },
    { count: newClientsCount },
    { count: pendingVerificationsCount },
  ] = await Promise.all([
    supabase.from("products").select("*", { count: "exact", head: true }).eq("status", "published"),
    supabase.from("orders").select("*", { count: "exact", head: true }).gte("created_at", today),
    supabase.from("promotions").select("*", { count: "exact", head: true }).eq("status", "active"),
    supabase.from("club_memberships").select("*", { count: "exact", head: true }),
    supabase.from("orders").select("*", { count: "exact", head: true }).eq("status", "confirmed"),
    supabase.from("orders").select("*", { count: "exact", head: true }).eq("status", "ready"),
    supabase.from("age_verifications").select("*", { count: "exact", head: true }).eq("status", "PENDING"),
    supabase.from("products").select("id", { count: "exact", head: true }).not("id", "in", `(select product_id from product_media where kind = 'COVER')`),
    supabase.from("orders").select("*", { count: "exact", head: true }).eq("status", "submitted"),
    supabase.from("deliveries").select("*", { count: "exact", head: true }).in("status", ["ASSIGNED", "ACCEPTED", "PICKED_UP", "IN_TRANSIT", "ARRIVED"]),
    supabase.from("orders").select("total_agorot").gte("created_at", today).in("status", ["completed", "ready"]),
    supabase.from("orders").select("total_agorot").gte("created_at", today).in("status", ["submitted", "confirmed"]),
    supabase.from("inventory").select("*", { count: "exact", head: true }).gt("quantity", 0).lt("quantity", 10),
    supabase.from("inventory").select("*", { count: "exact", head: true }).eq("quantity", 0),
    supabase.from("profiles").select("*", { count: "exact", head: true }).gte("created_at", sevenDaysAgo),
    // eslint-disable-next-line @typescript-eslint/no-explicit-any -- verification_status not yet in generated Database type
    (supabase as any)
      .from("profiles")
      .select("*", { count: "exact", head: true })
      .eq("verification_status", "pending_verification"),
  ]);

  const paidTodayAgorot = (paidToday ?? []).reduce((sum, row) => sum + (row.total_agorot ?? 0), 0);
  const unpaidTodayAgorot = (unpaidToday ?? []).reduce((sum, row) => sum + (row.total_agorot ?? 0), 0);

  return (
    <AdminDashboardClient
      stats={{
        productsCount: productsCount ?? 0,
        ordersTodayCount: ordersTodayCount ?? 0,
        activePromotionsCount: activePromotionsCount ?? 0,
        clubMembersCount: clubMembersCount ?? 0,
        preparingCount: preparingCount ?? 0,
        readyCount: readyCount ?? 0,
        ageChecksPending: ageChecksPending ?? 0,
        missingPhotosCount: missingPhotosCount ?? 0,
        toConfirmCount: toConfirmCount ?? 0,
        toDeliverCount: toDeliverCount ?? 0,
        paidTodayAgorot,
        unpaidTodayAgorot,
        lowStockCount: lowStockCount ?? 0,
        outOfStockCount: outOfStockCount ?? 0,
        newClientsCount: newClientsCount ?? 0,
        pendingVerificationsCount: pendingVerificationsCount ?? 0,
      }}
    />
  );
}
