"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export async function markNotificationRead(notificationId: string): Promise<void> {
  const supabase = await createClient();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any -- customer_notifications not yet in generated Database type
  const db = supabase as any;
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return;

  await db
    .from("customer_notifications")
    .update({ read_at: new Date().toISOString() })
    .eq("id", notificationId)
    .eq("user_id", user.id);

  revalidatePath("/compte");
}

export async function markAllNotificationsRead(): Promise<void> {
  const supabase = await createClient();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any -- customer_notifications not yet in generated Database type
  const db = supabase as any;
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return;

  await db
    .from("customer_notifications")
    .update({ read_at: new Date().toISOString() })
    .eq("user_id", user.id)
    .is("read_at", null);

  revalidatePath("/compte");
}
