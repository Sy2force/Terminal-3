import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getCurrentUser } from "@/lib/auth";
import { getDeliveriesForCourier } from "@/lib/data/deliveries";
import { CourierDashboard } from "@/components/courier/courier-dashboard";
import { LogoutButton } from "@/components/account/logout-button";

export default async function CourierPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login?redirect=/courier");

  const supabase = await createClient();

  const { data: roleRow } = await supabase
    .from("admin_roles")
    .select("role")
    .eq("user_id", user.id)
    .maybeSingle();

  if (!roleRow || roleRow.role !== "COURIER") {
    redirect("/");
  }

  const deliveries = await getDeliveriesForCourier(user.id);

  const active = deliveries.filter(
    (d) => d.status !== "DELIVERED" && d.status !== "FAILED",
  );
  const completed = deliveries.filter(
    (d) => d.status === "DELIVERED" || d.status === "FAILED",
  );

  return (
    <div className="min-h-screen bg-obsidian">
      <header className="sticky top-0 z-40 border-b border-white/5 bg-warm-black/95 backdrop-blur-md">
        <div className="mx-auto flex h-14 max-w-5xl items-center justify-between px-4">
          <span className="font-serif text-lg text-champagne">Courier Terminal 3</span>
          <LogoutButton />
        </div>
      </header>

      <div className="mx-auto max-w-5xl px-4 py-8">
        <CourierDashboard
          activeDeliveries={active}
          completedDeliveries={completed}
        />
      </div>
    </div>
  );
}
