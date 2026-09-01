import "server-only";
import { createClient, createServiceRoleClient } from "@/lib/supabase/server";
import type { OrderPaymentStatus } from "@/types/database";
import {
  canCloseOrder,
  canConfirmPayment,
  paymentMethodLabel,
  type OrderClosureContext,
  type ClosureRule,
} from "@/lib/data/pickup-closure-rules";

/**
 * Server-side gates for the pickup-closure workflow (0043_business_b2b.sql).
 * The pure rules live in `./pickup-closure-rules.ts` so they can be unit
 * tested without pulling `server-only` into the test runtime. This file
 * re-exports them for backwards compatibility and adds DB-touching helpers.
 */
export { canCloseOrder, canConfirmPayment, paymentMethodLabel };
export type { OrderClosureContext, ClosureRule };

export async function loadClosureContext(orderId: string): Promise<
  | (OrderClosureContext & { branchWhatsapp: string | null; publicOrderNumber: string | null; customerName: string | null; customerPhone: string | null })
  | null
> {
  const supabase = await createClient();
  const { data: order } = await supabase
    .from("orders")
    .select(
      "id, status, payment_status, payment_method_actual, paid_at, id_checked_at, id_checked_by, public_order_number, customer_name, customer_phone, branch_id",
    )
    .eq("id", orderId)
    .maybeSingle();
  if (!order) return null;

  const { data: agItems } = await supabase
    .from("order_items")
    .select("product_id, products(age_restricted)")
    .eq("order_id", orderId);

  const hasAgeRestrictedItem = Boolean(
    (agItems ?? []).some(
      (row) =>
        (row as unknown as { products?: { age_restricted?: boolean } }).products
          ?.age_restricted,
    ),
  );

  const { data: branch } = await supabase
    .from("branches")
    .select("whatsapp")
    .eq("id", (order as unknown as { branch_id: string }).branch_id)
    .maybeSingle();

  return {
    order: {
      id: order.id,
      status: order.status,
      payment_status:
        (order as unknown as { payment_status: OrderPaymentStatus }).payment_status ??
        "unpaid",
      payment_method_actual:
        (order as unknown as { payment_method_actual: string | null })
          .payment_method_actual ?? null,
      paid_at: (order as unknown as { paid_at: string | null }).paid_at ?? null,
      id_checked_at:
        (order as unknown as { id_checked_at: string | null }).id_checked_at ?? null,
      id_checked_by:
        (order as unknown as { id_checked_by: string | null }).id_checked_by ?? null,
    },
    hasAgeRestrictedItem,
    branchWhatsapp: branch?.whatsapp ?? null,
    publicOrderNumber:
      (order as unknown as { public_order_number: string | null }).public_order_number ??
      null,
    customerName: order.customer_name ?? null,
    customerPhone: order.customer_phone ?? null,
  };
}

/**
 * Marks an order as paid in store. Writes both the orders row and a
 * complementary entry into `payments` (via service role — payments RLS is
 * admin-only) so the CA encaissé indicator on the dashboard reflects it.
 */
export async function markOrderPaidInStore(
  orderId: string,
  method: string,
  adminUserId: string,
  amountAgorot?: number,
): Promise<{ success: boolean; error?: string }> {
  const supabase = createServiceRoleClient();

  const { data: order } = await supabase
    .from("orders")
    .select("id, total_agorot, payment_status")
    .eq("id", orderId)
    .maybeSingle();

  if (!order) return { success: false, error: "Commande introuvable." };
  if (order.payment_status === "paid_in_store") {
    return { success: false, error: "Déjà marquée comme payée." };
  }

  const nowIso = new Date().toISOString();
  const { error: orderError } = await supabase
    .from("orders")
    .update({
      payment_status: "paid_in_store",
      payment_method_actual: method,
      paid_at: nowIso,
      paid_by: adminUserId,
    })
    .eq("id", orderId);

  if (orderError) return { success: false, error: orderError.message };

  // Best-effort payments row for the finance/dashboard side.
  // eslint-disable-next-line @typescript-eslint/no-explicit-any -- payments table method column uses a wider enum
  await (supabase as any).from("payments").insert({
    order_id: orderId,
    amount_agorot: amountAgorot ?? order.total_agorot,
    method:
      method === "cash" ? "cash_store"
      : method === "card" ? "card_store"
      : "manual",
    status: "paid",
    collected_by: adminUserId,
    collected_at: nowIso,
    reference: `paid_in_store:${method}`,
  });

  await supabase.from("audit_logs").insert({
    actor_user_id: adminUserId,
    action: "order.payment_confirmed",
    entity_type: "order",
    entity_id: orderId,
    metadata: { method, amount_agorot: amountAgorot ?? order.total_agorot },
  });

  return { success: true };
}

/**
 * Records the physical ID check at pickup. Never store the ID document
 * itself — we only stamp who checked and when.
 */
export async function markIdChecked(
  orderId: string,
  adminUserId: string,
): Promise<{ success: boolean; error?: string }> {
  const supabase = createServiceRoleClient();

  const nowIso = new Date().toISOString();
  const { error } = await supabase
    .from("orders")
    .update({
      id_checked_at: nowIso,
      id_checked_by: adminUserId,
    })
    .eq("id", orderId);

  if (error) return { success: false, error: error.message };

  // Also mark the age_verification rows as VERIFIED (they were PENDING).
  await supabase
    .from("age_verifications")
    .update({
      status: "VERIFIED",
      verified_at: nowIso,
      verified_by_staff_user_id: adminUserId,
    })
    .eq("order_id", orderId)
    .eq("status", "PENDING");

  await supabase.from("audit_logs").insert({
    actor_user_id: adminUserId,
    action: "order.id_checked",
    entity_type: "order",
    entity_id: orderId,
    metadata: {},
  });

  return { success: true };
}

/**
 * Sets a preparation estimate (both machine-readable timestamp and a
 * human-readable label like "30 min" or "vendredi 14h").
 */
export async function setReadyEstimate(
  orderId: string,
  estimate: { at: Date; label: string },
  adminUserId: string,
): Promise<{ success: boolean; error?: string }> {
  const supabase = createServiceRoleClient();
  const { error } = await supabase
    .from("orders")
    .update({
      ready_estimate_at: estimate.at.toISOString(),
      ready_estimate_label: estimate.label,
    })
    .eq("id", orderId);

  if (error) return { success: false, error: error.message };

  await supabase.from("audit_logs").insert({
    actor_user_id: adminUserId,
    action: "order.estimate_set",
    entity_type: "order",
    entity_id: orderId,
    metadata: { at: estimate.at.toISOString(), label: estimate.label },
  });
  return { success: true };
}


