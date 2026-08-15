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
  OrderNoteRow,
  OrderStatusHistoryRow,
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

/**
 * Active orders (submitted/confirmed/ready) with their full fulfillment
 * groups, items and age verification attached — powers the staff queue
 * view, which needs to show line items and let staff update fulfillment
 * status per group without an extra round trip per order card.
 */
export async function getActiveOrdersWithDetailsForStaff(): Promise<OrderWithDetails[]> {
  const supabase = await createClient();

  const { data: orders, error } = await supabase
    .from("orders")
    .select("*")
    .in("status", ["submitted", "confirmed", "ready"])
    .order("created_at", { ascending: false });

  if (error || !orders || orders.length === 0) return [];

  const orderIds = orders.map((o) => o.id);
  const [{ data: groups }, { data: items }, { data: ageVerifications }] = await Promise.all([
    supabase.from("order_fulfillment_groups").select("*").in("order_id", orderIds),
    supabase.from("order_items").select("*").in("order_id", orderIds),
    supabase.from("age_verifications").select("*").in("order_id", orderIds),
  ]);

  return orders.map((order) => ({
    ...order,
    fulfillment_groups: (groups ?? [])
      .filter((group) => group.order_id === order.id)
      .map((group) => ({
        ...group,
        items: (items ?? []).filter((item) => item.fulfillment_group_id === group.id),
        age_verification:
          (ageVerifications ?? []).find((av) => av.fulfillment_group_id === group.id) ?? null,
      })),
  }));
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
  changedBy: string,
  changedByName?: string,
  comment?: string,
): Promise<void> {
  const supabase = await createClient();

  const { data: current, error: fetchError } = await supabase
    .from("orders")
    .select("status")
    .eq("id", orderId)
    .maybeSingle();

  if (fetchError || !current) throw new Error(fetchError?.message ?? "order_not_found");

  const { error } = await supabase
    .from("orders")
    .update({ status, updated_at: new Date().toISOString() })
    .eq("id", orderId);

  if (error) throw new Error(error.message ?? "update_order_status_failed");

  if (current.status !== status) {
    await supabase.from("order_status_history").insert({
      order_id: orderId,
      old_status: current.status,
      new_status: status,
      changed_by: changedBy,
      changed_by_name: changedByName,
      comment,
    });
  }
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

export async function getOrderNotes(orderId: string): Promise<OrderNoteRow[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("order_notes")
    .select("*")
    .eq("order_id", orderId)
    .order("created_at", { ascending: false });

  if (error || !data) return [];
  return data as unknown as OrderNoteRow[];
}

export async function getOrderStatusHistory(orderId: string): Promise<OrderStatusHistoryRow[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("order_status_history")
    .select("*")
    .eq("order_id", orderId)
    .order("created_at", { ascending: false });

  if (error || !data) return [];
  return data as unknown as OrderStatusHistoryRow[];
}

export async function addOrderNote(
  orderId: string,
  note: string,
  authorId: string,
  authorName: string,
): Promise<OrderNoteRow> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("order_notes")
    .insert({
      order_id: orderId,
      note,
      author_id: authorId,
      author_name: authorName,
    })
    .select()
    .single();

  if (error || !data) throw new Error(error.message ?? "add_note_failed");
  return data as unknown as OrderNoteRow;
}
