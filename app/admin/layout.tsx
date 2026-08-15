import { requireAdmin } from "@/lib/admin/auth";
import { createClient } from "@/lib/supabase/server";
import { isDemoMode } from "@/lib/demo-mode";
import { AdminShell } from "@/components/admin/admin-shell";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await requireAdmin();

  // Demo mode has no live Supabase, so notifications count is 0.
  let notifications = 0;
  if (!isDemoMode()) {
    const supabase = await createClient();
    const { count } = await supabase
      .from("notifications")
      .select("id", { count: "exact", head: true })
      .eq("is_read", false);
    notifications = count ?? 0;
  }

  return (
    <AdminShell session={session} unreadNotifications={notifications}>
      {children}
    </AdminShell>
  );
}
