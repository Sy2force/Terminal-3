"use server";

import { z } from "zod";
import { submitEventOrder } from "@/lib/data/event-orders";

const itemSchema = z.object({
  product_id: z.string().uuid().nullable(),
  product_name: z.string().min(1),
  quantity: z.number().int().positive(),
  unit_price_agorot: z.number().int().nonnegative(),
  total_price_agorot: z.number().int().nonnegative(),
});

const schema = z.object({
  customer_name: z.string().min(2),
  customer_phone: z.string().min(6),
  customer_email: z.string().email().optional().or(z.literal("")),
  customer_whatsapp: z.string().optional(),
  preferred_contact: z.enum(["phone", "email", "whatsapp"]),
  event_type: z.string().min(1),
  event_date: z.string().optional(),
  event_time: z.string().optional(),
  guests_count: z.coerce.number().int().positive().optional(),
  budget_agorot: z.coerce.number().int().nonnegative().optional(),
  fulfillment_type: z.enum(["delivery", "pickup"]),
  city: z.string().optional(),
  delivery_address: z.string().optional(),
  delivery_instructions: z.string().optional(),
  notes: z.string().optional(),
  items: z.array(itemSchema).min(1),
});

export type SubmitEventOrderState =
  | { success: true; reference: string; token: string }
  | { success: false; error: string };

export async function createEventOrder(
  _prev: unknown,
  formData: FormData,
): Promise<SubmitEventOrderState> {
  const raw = Object.fromEntries(formData.entries());

  let items: z.infer<typeof itemSchema>[] = [];
  try {
    const parsed = JSON.parse(raw.items as string);
    if (!Array.isArray(parsed)) throw new Error("items must be array");
    items = parsed;
  } catch {
    return { success: false, error: "Articles invalides" };
  }

  const result = schema.safeParse({ ...raw, items });
  if (!result.success) {
    return { success: false, error: "Champs invalides : " + result.error.issues.map((e) => e.path.join(".")).join(", ") };
  }

  const data = result.data;

  const response = await submitEventOrder({
    customer_name: data.customer_name,
    customer_phone: data.customer_phone,
    customer_email: data.customer_email || data.customer_phone,
    customer_whatsapp: data.customer_whatsapp,
    preferred_contact: data.preferred_contact,
    event_type: data.event_type,
    event_date: data.event_date,
    event_time: data.event_time,
    guests_count: data.guests_count,
    budget_agorot: data.budget_agorot,
    fulfillment_type: data.fulfillment_type,
    city: data.city,
    delivery_address: data.delivery_address,
    delivery_instructions: data.delivery_instructions,
    notes: data.notes,
    items,
  });

  if (!response.success) {
    return { success: false, error: response.error ?? "Échec de l'enregistrement" };
  }

  return { success: true, reference: response.reference, token: response.token };
}
