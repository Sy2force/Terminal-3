"use server";

import { createClient } from "@/lib/supabase/server";
import { logAudit } from "@/lib/admin/audit";

export async function logAdminLogin(): Promise<void> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return;

  await logAudit({
    actor: user.id,
    action: "login",
    entityType: "staff_role",
    metadata: { email: user.email },
  });
}
