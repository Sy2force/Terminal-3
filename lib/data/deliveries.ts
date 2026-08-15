import "server-only";
import { createClient } from "@/lib/supabase/server";
import type { DeliveryRow, OrderRow, OrderItemRow } from "@/types/database";

export interface DeliveryWithOrder extends DeliveryRow {
  order: OrderRow & {
    items: OrderItemRow[];
  };
}

export async function getDeliveriesForCourier(
  courierUserId: string,
): Promise<DeliveryWithOrder[]> {
  const supabase = await createClient();

  const { data: deliveries, error } = await supabase
    .from("deliveries")
    .select("*")
    .eq("courier_user_id", courierUserId)
    .order("assigned_at", { ascending: false });

  if (error || !deliveries || deliveries.length === 0) return [];

  const orderIds = deliveries.map((d) => d.order_id);
  const [{ data: orders }, { data: items }] = await Promise.all([
    supabase.from("orders").select("*").in("id", orderIds),
    supabase.from("order_items").select("*").in("order_id", orderIds),
  ]);

  return deliveries.map((delivery) => {
    const order = (orders ?? []).find((o) => o.id === delivery.order_id);
    const orderItems = (items ?? []).filter((i) => i.order_id === delivery.order_id);
    return {
      ...delivery,
      order: {
        ...(order as OrderRow),
        items: orderItems,
      },
    } as DeliveryWithOrder;
  });
}

/**
 * All deliveries for the admin console, most recent first. Powers
 * /admin/livraisons — unlike getPendingDeliveries (courier-facing,
 * unassigned only) this includes every status so staff can see the
 * full pipeline from assignment to delivery/failure.
 */
export async function getAllDeliveriesForAdmin(): Promise<DeliveryWithOrder[]> {
  const supabase = await createClient();

  const { data: deliveries, error } = await supabase
    .from("deliveries")
    .select("*")
    .order("assigned_at", { ascending: false });

  if (error || !deliveries || deliveries.length === 0) return [];

  const orderIds = deliveries.map((d) => d.order_id);
  const [{ data: orders }, { data: items }] = await Promise.all([
    supabase.from("orders").select("*").in("id", orderIds),
    supabase.from("order_items").select("*").in("order_id", orderIds),
  ]);

  return deliveries.map((delivery) => {
    const order = (orders ?? []).find((o) => o.id === delivery.order_id);
    const orderItems = (items ?? []).filter((i) => i.order_id === delivery.order_id);
    return {
      ...delivery,
      order: {
        ...(order as OrderRow),
        items: orderItems,
      },
    } as DeliveryWithOrder;
  });
}

export async function getPendingDeliveries(): Promise<DeliveryWithOrder[]> {
  const supabase = await createClient();

  const { data: deliveries, error } = await supabase
    .from("deliveries")
    .select("*")
    .is("courier_user_id", null)
    .order("assigned_at", { ascending: false });

  if (error || !deliveries) return [];

  const orderIds = deliveries.map((d) => d.order_id);
  if (orderIds.length === 0) return [];

  const [{ data: orders }, { data: items }] = await Promise.all([
    supabase.from("orders").select("*").in("id", orderIds),
    supabase.from("order_items").select("*").in("order_id", orderIds),
  ]);

  return deliveries.map((delivery) => {
    const order = (orders ?? []).find((o) => o.id === delivery.order_id);
    const orderItems = (items ?? []).filter((i) => i.order_id === delivery.order_id);
    return {
      ...delivery,
      order: {
        ...(order as OrderRow),
        items: orderItems,
      },
    } as DeliveryWithOrder;
  });
}

export async function updateDeliveryStatus(
  deliveryId: string,
  status: DeliveryRow["status"],
): Promise<void> {
  const supabase = await createClient();
  const nowIso = new Date().toISOString();

  const updates: Partial<DeliveryRow> = { status, updated_at: nowIso };
  switch (status) {
    case "ACCEPTED":
      updates.accepted_at = nowIso;
      break;
    case "PICKED_UP":
      updates.picked_up_at = nowIso;
      break;
    case "IN_TRANSIT":
      updates.in_transit_at = nowIso;
      break;
    case "ARRIVED":
      updates.arrived_at = nowIso;
      break;
    case "DELIVERED":
      updates.delivered_at = nowIso;
      break;
    case "FAILED":
      updates.failed_at = nowIso;
      break;
  }

  const { error } = await supabase
    .from("deliveries")
    .update(updates)
    .eq("id", deliveryId);

  if (error) throw new Error(error.message ?? "update_delivery_failed");
}

export async function assignDelivery(
  deliveryId: string,
  courierUserId: string,
): Promise<void> {
  const supabase = await createClient();
  const { error } = await supabase
    .from("deliveries")
    .update({
      courier_user_id: courierUserId,
      status: "ASSIGNED",
      updated_at: new Date().toISOString(),
    })
    .eq("id", deliveryId);

  if (error) throw new Error(error.message ?? "assign_delivery_failed");
}

export async function createDeliveryForOrder(
  orderId: string,
): Promise<void> {
  const supabase = await createClient();
  const { error } = await supabase
    .from("deliveries")
    .insert({
      order_id: orderId,
      status: "ASSIGNED",
    });

  if (error) throw new Error(error.message ?? "create_delivery_failed");
}

export async function collectPayment(
  deliveryId: string,
  method: string,
): Promise<void> {
  const supabase = await createClient();
  const { error } = await supabase
    .from("deliveries")
    .update({
      payment_collected: true,
      payment_method: method,
      updated_at: new Date().toISOString(),
    })
    .eq("id", deliveryId);

  if (error) throw new Error(error.message ?? "collect_payment_failed");
}
