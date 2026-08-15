"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

const addressSchema = z.object({
  city: z.string().trim().min(1).max(200),
  street: z.string().trim().min(1).max(200),
  buildingNumber: z.string().trim().min(1).max(20),
  apartment: z.string().trim().max(50).optional(),
  postalCode: z.string().trim().max(20).optional(),
  deliveryInstructions: z.string().trim().max(500).optional(),
  isDefault: z.boolean().optional(),
});

export async function addAddress(
  input: z.infer<typeof addressSchema>,
): Promise<{ success: boolean; error?: string }> {
  const parsed = addressSchema.safeParse(input);
  if (!parsed.success) return { success: false, error: "Formulaire invalide." };

  const supabase = await createClient();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any -- customer_addresses not yet in generated Database type
  const db = supabase as any;
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { success: false, error: "Non connecté." };

  if (parsed.data.isDefault) {
    await db.from("customer_addresses").update({ is_default: false }).eq("user_id", user.id);
  }

  const { error } = await db.from("customer_addresses").insert({
    user_id: user.id,
    city: parsed.data.city,
    street: parsed.data.street,
    building_number: parsed.data.buildingNumber,
    apartment: parsed.data.apartment || null,
    postal_code: parsed.data.postalCode || null,
    delivery_instructions: parsed.data.deliveryInstructions || null,
    is_default: parsed.data.isDefault ?? false,
  });

  if (error) return { success: false, error: "Impossible d'enregistrer l'adresse." };

  revalidatePath("/compte/adresses");
  return { success: true };
}

export async function deleteAddress(addressId: string): Promise<{ success: boolean }> {
  const supabase = await createClient();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any -- customer_addresses not yet in generated Database type
  const db = supabase as any;
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { success: false };

  await db.from("customer_addresses").delete().eq("id", addressId).eq("user_id", user.id);
  revalidatePath("/compte/adresses");
  return { success: true };
}

export async function setDefaultAddress(addressId: string): Promise<{ success: boolean }> {
  const supabase = await createClient();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any -- customer_addresses not yet in generated Database type
  const db = supabase as any;
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { success: false };

  await db.from("customer_addresses").update({ is_default: false }).eq("user_id", user.id);
  await db
    .from("customer_addresses")
    .update({ is_default: true })
    .eq("id", addressId)
    .eq("user_id", user.id);

  revalidatePath("/compte/adresses");
  return { success: true };
}
