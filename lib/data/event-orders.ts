import "server-only";
import { createClient } from "@/lib/supabase/server";
import { isDemoMode } from "@/lib/demo-mode";
import type { EventOrderInput } from "@/types/events";
import crypto from "node:crypto";

function generateReference(index: number): string {
  const year = new Date().getFullYear();
  return `EVT-${year}-${String(index).padStart(4, "0")}`;
}

function generateToken(): string {
  return crypto.randomBytes(32).toString("hex");
}

export async function submitEventOrder(input: EventOrderInput) {
  const orderNumber = 1; // in real would be serial
  const reference = generateReference(orderNumber);
  const token = generateToken();

  if (isDemoMode()) {
    return {
      success: true as const,
      reference,
      token,
      message: "Mode démonstration : la commande n'a pas été enregistrée dans Supabase.",
    };
  }

  const supabase = await createClient();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any -- event_orders tables are not yet declared in the generated Database type
  const db = supabase as any;

  // Calculate totals
  const subtotal = input.items.reduce((sum, item) => sum + item.total_price_agorot, 0);
  const deliveryFee = 0;
  const total = subtotal + deliveryFee;

  const { data: order, error } = await db
    .from("event_orders")
    .insert({
      reference,
      access_token: token,
      customer_name: input.customer_name,
      customer_phone: input.customer_phone,
      customer_email: input.customer_email,
      customer_whatsapp: input.customer_whatsapp,
      preferred_contact: input.preferred_contact,
      event_type: input.event_type,
      event_date: input.event_date,
      event_time: input.event_time,
      guests_count: input.guests_count,
      budget_agorot: input.budget_agorot,
      fulfillment_type: input.fulfillment_type,
      city: input.city,
      delivery_address: input.delivery_address,
      delivery_instructions: input.delivery_instructions,
      notes: input.notes,
      subtotal_agorot: subtotal,
      delivery_fee_agorot: deliveryFee,
      total_agorot: total,
    })
    .select("id")
    .single();

  if (error || !order) {
    return { success: false as const, error: error?.message ?? "Insert failed" };
  }

  if (input.items.length > 0) {
    await db.from("event_order_items").insert(
      input.items.map((item) => ({
        event_order_id: order.id,
        product_id: item.product_id,
        product_name: item.product_name,
        quantity: item.quantity,
        unit_price_agorot: item.unit_price_agorot,
        total_price_agorot: item.total_price_agorot,
      })),
    );
  }

  return { success: true as const, reference, token };
}

export async function getEventOrders(): Promise<
  { id: string; reference: string; customer_name: string; event_type: string; status: string; created_at: string }[]
> {
  if (isDemoMode()) {
    return [
      {
        id: "evt-000",
        reference: "EVT-2026-0000",
        customer_name: "Exemple Client",
        event_type: "Mariage",
        status: "received",
        created_at: new Date().toISOString(),
      },
    ];
  }

  const supabase = await createClient();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any -- event_orders tables are not yet declared in the generated Database type
  const db = supabase as any;
  const { data, error } = await db
    .from("event_orders")
    .select("id, reference, customer_name, event_type, status, created_at")
    .order("created_at", { ascending: false });

  if (error || !data) return [];
  return data;
}

export async function getEventOrderByToken(token: string): Promise<
  { reference: string; status: string; total_agorot: number; created_at: string } | null
> {
  if (isDemoMode()) {
    return {
      reference: "EVT-2026-0000",
      status: "received",
      total_agorot: 0,
      created_at: new Date().toISOString(),
    };
  }

  const supabase = await createClient();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any -- event_orders tables are not yet declared in the generated Database type
  const db = supabase as any;
  const { data, error } = await db
    .from("event_orders")
    .select("reference, status, total_agorot, created_at")
    .eq("access_token", token)
    .maybeSingle();

  if (error || !data) return null;
  return data;
}
