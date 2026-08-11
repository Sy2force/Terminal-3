import "server-only";
import { createClient } from "@/lib/supabase/server";
import { isDemoMode } from "@/lib/demo-mode";
import type {
  OrderRow,
  OrderFulfillmentGroupRow,
  OrderItemRow,
  AgeVerificationRow,
} from "@/types/database";

export interface OrderWithDetails extends OrderRow {
  fulfillment_groups: (OrderFulfillmentGroupRow & {
    items: OrderItemRow[];
    age_verification: AgeVerificationRow | null;
  })[];
}

/**
 * Returns an order for the current authenticated user only (or for staff,
 * any order) — enforced doubly by RLS on `orders`/`order_items` and by this
 * query never accepting a `user_id` override from the caller.
 */
export async function getOrderById(
  orderId: string,
): Promise<OrderWithDetails | null> {
  if (isDemoMode()) return null;
  const supabase = await createClient();

  const { data: order, error } = await supabase
    .from("orders")
    .select("*")
    .eq("id", orderId)
    .maybeSingle();

  if (error || !order) return null;

  const { data: groups } = await supabase
    .from("order_fulfillment_groups")
    .select("*")
    .eq("order_id", orderId);

  const { data: items } = await supabase
    .from("order_items")
    .select("*")
    .eq("order_id", orderId);

  const { data: ageVerifications } = await supabase
    .from("age_verifications")
    .select("*")
    .eq("order_id", orderId);

  const fulfillment_groups = (groups ?? []).map((group) => ({
    ...group,
    items: (items ?? []).filter((item) => item.fulfillment_group_id === group.id),
    age_verification:
      (ageVerifications ?? []).find(
        (av) => av.fulfillment_group_id === group.id,
      ) ?? null,
  }));

  return { ...order, fulfillment_groups };
}

export async function listOrdersForCurrentUser(): Promise<OrderRow[]> {
  if (isDemoMode()) return [];
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return [];

  const { data, error } = await supabase
    .from("orders")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  if (error || !data) return [];
  return data;
}
