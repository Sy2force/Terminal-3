import "server-only";
import { createClient } from "@/lib/supabase/server";
import type {
  OrderRow,
  OrderStatus,
  FoodFulfillmentStatus,
  AlcoholFulfillmentStatus,
  AgeVerificationStatus,
  OrderFulfillmentGroupRow,
  OrderItemRow,
  AgeVerificationRow,
} from "@/types/database";

export type StaffOrderStatusFilter = "all" | OrderStatus;

export interface OrderListItem extends OrderRow {
  fulfillment_group_count: number;
  item_count: number;
}

export interface OrderWithDetails extends OrderRow {
  fulfillment_groups: (OrderFulfillmentGroupRow & {
    items: OrderItemRow[];
    age_verification: AgeVerificationRow | null;
  })[];
}

export async function getOrdersForStaff(
  filter: StaffOrderStatusFilter = "all",
): Promise<OrderListItem[]> {
  const supabase = await createClient();
  let query = supabase
    .from("orders")
    .select(
      "*, fulfillment_group_count:order_fulfillment_groups(count), item_count:order_items(count)",
    )
    .order("created_at", { ascending: false });

  if (filter !== "all") {
    query = query.eq("status", filter);
  }

  const { data, error } = await query;
  if (error || !data) return [];

  return data.map((row) => {
    const anyRow = row as unknown as Record<string, unknown>;
    const fgCount = anyRow.fulfillment_group_count as { count?: number } | undefined;
    const itemCount = anyRow.item_count as { count?: number } | undefined;
    return {
      ...anyRow,
      fulfillment_group_count: fgCount?.count ?? 0,
      item_count: itemCount?.count ?? 0,
    } as OrderListItem;
  });
}

export async function getOrderDetailsForStaff(
  orderId: string,
): Promise<OrderWithDetails | null> {
  const supabase = await createClient();

  const { data: order, error } = await supabase
    .from("orders")
    .select("*")
    .eq("id", orderId)
    .maybeSingle();

  if (error || !order) return null;

  const [{ data: groups }, { data: items }, { data: ageVerifications }] =
    await Promise.all([
      supabase.from("order_fulfillment_groups").select("*").eq("order_id", orderId),
      supabase.from("order_items").select("*").eq("order_id", orderId),
      supabase.from("age_verifications").select("*").eq("order_id", orderId),
    ]);

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

export async function updateOrderStatus(
  orderId: string,
  status: OrderStatus,
): Promise<void> {
  const supabase = await createClient();
  const { error } = await supabase
    .from("orders")
    .update({ status, updated_at: new Date().toISOString() })
    .eq("id", orderId);

  if (error) throw new Error(error.message ?? "update_order_status_failed");
}

export async function updateFulfillmentStatus(
  groupId: string,
  type: "food" | "alcohol",
  status: FoodFulfillmentStatus | AlcoholFulfillmentStatus,
): Promise<void> {
  const supabase = await createClient();
  const update =
    type === "alcohol"
      ? { alcohol_status: status as AlcoholFulfillmentStatus }
      : { food_status: status as FoodFulfillmentStatus };
  const { error } = await supabase
    .from("order_fulfillment_groups")
    .update({
      ...update,
      updated_at: new Date().toISOString(),
    })
    .eq("id", groupId);

  if (error) throw new Error(error.message ?? "update_fulfillment_failed");
}

export interface PendingAgeVerification {
  id: string;
  order_id: string;
  fulfillment_group_id: string;
  status: AgeVerificationStatus;
  created_at: string;
  order: OrderRow | null;
}

export async function getPendingAgeVerifications(): Promise<
  PendingAgeVerification[]
> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("age_verifications")
    .select("*, order:orders(*)")
    .eq("status", "PENDING")
    .order("created_at", { ascending: false });

  if (error || !data) return [];
  return data as unknown as PendingAgeVerification[];
}

export async function updateAgeVerificationStatus(
  verificationId: string,
  staffUserId: string,
  status: AgeVerificationStatus,
): Promise<void> {
  const supabase = await createClient();
  const update: Partial<AgeVerificationRow> = {
    status,
    verified_at: status === "VERIFIED" ? new Date().toISOString() : null,
    verified_by_staff_user_id: status === "VERIFIED" ? staffUserId : null,
  };
  const { error } = await supabase
    .from("age_verifications")
    .update(update)
    .eq("id", verificationId);

  if (error) throw new Error(error.message ?? "update_age_verification_failed");
}
