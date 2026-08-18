import "server-only";
import { createServiceRoleClient } from "@/lib/supabase/server";
import { getOrderDetailsForStaff } from "./orders-admin";
import type { OrderWithDetails } from "./orders-admin";

export interface InvoiceRow {
  id: string;
  order_id: string;
  kind: string;
  number: string;
  payment_status: string;
  order_status: string;
  totals: { total_agorot: number; discount_agorot: number } | null;
  issued_at: string;
  created_at: string;
  updated_at: string;
}

function pad6(n: number): string {
  return String(n).padStart(6, "0");
}

function currentYear(): number {
  return new Date().getFullYear();
}

export async function listInvoices(): Promise<InvoiceRow[]> {
  const supabase = createServiceRoleClient();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any -- invoices not yet in generated Database type
  const db = supabase as any;
  const { data, error } = await db
    .from("invoices")
    .select("*")
    .order("issued_at", { ascending: false })
    .limit(200);
  if (error || !data) return [];
  return data as InvoiceRow[];
}

export async function getInvoiceById(id: string): Promise<InvoiceRow | null> {
  const supabase = createServiceRoleClient();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any -- invoices not yet in generated Database type
  const db = supabase as any;
  const { data, error } = await db.from("invoices").select("*").eq("id", id).maybeSingle();
  if (error || !data) return null;
  return data as InvoiceRow;
}

function computeDeliveryFee(order: OrderWithDetails): number {
  const subtotal = order.fulfillment_groups.flatMap((g) => g.items).reduce(
    (sum, item) => sum + item.final_price_agorot_snapshot * item.quantity,
    0,
  );
  const discount = order.discount_agorot ?? 0;
  const total = order.total_agorot ?? 0;
  return Math.max(0, total + discount - subtotal);
}

export async function createInvoiceFromOrder(orderId: string): Promise<{
  success: boolean;
  invoiceId?: string;
  error?: string;
}> {
  const order = await getOrderDetailsForStaff(orderId);
  if (!order) return { success: false, error: "Commande introuvable." };

  const supabase = createServiceRoleClient();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any -- invoices not yet in generated Database type
  const db = supabase as any;

  const { data: existing } = await db
    .from("invoices")
    .select("id")
    .eq("order_id", orderId)
    .eq("kind", "invoice")
    .maybeSingle();
  if (existing) {
    return { success: false, error: "Une facture brouillon existe déjà pour cette commande.", invoiceId: existing.id };
  }

  const year = currentYear();
  const { count, error: countError } = await db
    .from("invoices")
    .select("number", { count: "exact", head: true })
    .ilike("number", `T3-${year}-%`);
  if (countError) {
    return { success: false, error: "Impossible de générer le numéro de facture." };
  }
  const number = `T3-${year}-${pad6((count ?? 0) + 1)}`;

  const { data, error } = await db
    .from("invoices")
    .insert({
      order_id: order.id,
      customer_id: order.user_id,
      kind: "invoice",
      number,
      payment_status: "unpaid",
      order_status: order.status,
      totals: {
        total_agorot: order.total_agorot,
        discount_agorot: order.discount_agorot,
        delivery_fee_agorot: computeDeliveryFee(order),
      },
      issued_at: new Date().toISOString(),
    })
    .select("id")
    .single();

  if (error || !data) {
    return { success: false, error: error?.message ?? "Échec de la création de la facture." };
  }

  return { success: true, invoiceId: data.id };
}
