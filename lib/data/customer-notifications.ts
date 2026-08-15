import "server-only";
import { createClient, createServiceRoleClient } from "@/lib/supabase/server";

export interface CustomerNotification {
  id: string;
  type: string;
  title: string;
  body: string | null;
  readAt: string | null;
  createdAt: string;
}

export async function listMyNotifications(limit = 20): Promise<CustomerNotification[]> {
  const supabase = await createClient();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any -- customer_notifications not yet in generated Database type
  const db = supabase as any;
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return [];

  const { data } = await db
    .from("customer_notifications")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(limit);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return ((data ?? []) as any[]).map((row) => ({
    id: row.id,
    type: row.type,
    title: row.title,
    body: row.body,
    readAt: row.read_at,
    createdAt: row.created_at,
  }));
}

export async function countMyUnreadNotifications(): Promise<number> {
  const supabase = await createClient();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any -- customer_notifications not yet in generated Database type
  const db = supabase as any;
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return 0;

  const { count } = await db
    .from("customer_notifications")
    .select("id", { count: "exact", head: true })
    .eq("user_id", user.id)
    .is("read_at", null);

  return count ?? 0;
}

/**
 * Creates a customer-facing notification. Always issued server-side (order
 * events, verification decisions) via the service-role client — customers
 * cannot create their own notifications.
 */
export async function notifyCustomer(
  userId: string,
  type: string,
  title: string,
  body?: string,
): Promise<void> {
  const service = createServiceRoleClient();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any -- customer_notifications not yet in generated Database type
  const db = service as any;
  await db.from("customer_notifications").insert({
    user_id: userId,
    type,
    title,
    body: body ?? null,
  });
}
