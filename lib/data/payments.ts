import "server-only";
import { createClient } from "@/lib/supabase/server";
import { isDemoMode } from "@/lib/demo-mode";
import type {
  PaymentRow,
  PaymentStatusHistoryRow,
  PaymentMethod,
} from "@/types/database";

export interface PaymentSummary {
  total_agorot: number;
  collected_agorot: number;
  remaining_agorot: number;
  status: "unpaid" | "partially_paid" | "paid" | "refunded";
}

export async function getPaymentSummary(orderId: string): Promise<PaymentSummary> {
  if (isDemoMode()) {
    return { total_agorot: 0, collected_agorot: 0, remaining_agorot: 0, status: "unpaid" };
  }

  const supabase = await createClient();
  const { data: order, error: orderError } = await supabase
    .from("orders")
    .select("total_agorot")
    .eq("id", orderId)
    .maybeSingle();

  if (orderError || !order) return { total_agorot: 0, collected_agorot: 0, remaining_agorot: 0, status: "unpaid" };

  const { data: payments } = await supabase
    .from("payments")
    .select("amount_agorot, status")
    .eq("order_id", orderId)
    .neq("status", "cancelled");

  const collected = (payments ?? []).reduce((sum, p) => sum + p.amount_agorot, 0);
  const total = order.total_agorot;
  const remaining = Math.max(0, total - collected);

  let status: PaymentSummary["status"] = "unpaid";
  if (remaining === 0) status = "paid";
  else if (collected > 0) status = "partially_paid";

  return { total_agorot: total, collected_agorot: collected, remaining_agorot: remaining, status };
}

export async function getOrderPayments(orderId: string): Promise<PaymentRow[]> {
  if (isDemoMode()) return [];

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("payments")
    .select("*")
    .eq("order_id", orderId)
    .order("created_at", { ascending: false });

  if (error || !data) return [];
  return data as unknown as PaymentRow[];
}

export async function getPaymentStatusHistory(orderId: string): Promise<PaymentStatusHistoryRow[]> {
  if (isDemoMode()) return [];

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("payment_status_history")
    .select("*")
    .eq("order_id", orderId)
    .order("created_at", { ascending: false });

  if (error || !data) return [];
  return data as unknown as PaymentStatusHistoryRow[];
}

export interface ConfirmPaymentInput {
  orderId: string;
  amount_agorot: number;
  method: PaymentMethod;
  reference?: string;
  notes?: string;
  collectedBy: string;
  idempotencyKey: string;
}

export async function confirmPayment(input: ConfirmPaymentInput): Promise<PaymentRow> {
  if (isDemoMode()) {
    throw new Error("demo_mode_read_only");
  }

  if (input.amount_agorot <= 0) {
    throw new Error("amount_must_be_positive");
  }

  const supabase = await createClient();

  const { data: existing, error: existingError } = await supabase
    .from("payments")
    .select("*")
    .eq("order_id", input.orderId)
    .eq("idempotency_key", input.idempotencyKey)
    .maybeSingle();

  if (existing) {
    return existing as unknown as PaymentRow;
  }
  if (existingError) {
    throw new Error(existingError.message ?? "idempotency_check_failed");
  }

  const { data: order, error: orderError } = await supabase
    .from("orders")
    .select("total_agorot")
    .eq("id", input.orderId)
    .maybeSingle();

  if (orderError || !order) {
    throw new Error(orderError?.message ?? "order_not_found");
  }

  const { data: paid } = await supabase
    .from("payments")
    .select("amount_agorot")
    .eq("order_id", input.orderId)
    .neq("status", "cancelled");

  const collectedSoFar = (paid ?? []).reduce((sum, p) => sum + p.amount_agorot, 0);
  const remaining = order.total_agorot - collectedSoFar;

  if (input.amount_agorot > remaining) {
    throw new Error("amount_exceeds_remaining");
  }

  const newCollected = collectedSoFar + input.amount_agorot;
  const isFullyPaid = newCollected >= order.total_agorot;
  const status = isFullyPaid ? "paid" : "partially_paid";

  const { data: payment, error: insertError } = await supabase
    .from("payments")
    .insert({
      order_id: input.orderId,
      amount_agorot: input.amount_agorot,
      method: input.method,
      status,
      collected_by: input.collectedBy,
      collected_at: new Date().toISOString(),
      reference: input.reference || null,
      notes: input.notes || null,
      idempotency_key: input.idempotencyKey,
    })
    .select()
    .single();

  if (insertError || !payment) {
    throw new Error(insertError?.message ?? "payment_insert_failed");
  }

  return payment as unknown as PaymentRow;
}

export async function getOrderPaymentSummary(orderId: string): Promise<{
  summary: PaymentSummary;
  payments: PaymentRow[];
  history: PaymentStatusHistoryRow[];
}> {
  const [summary, payments, history] = await Promise.all([
    getPaymentSummary(orderId),
    getOrderPayments(orderId),
    getPaymentStatusHistory(orderId),
  ]);
  return { summary, payments, history };
}
