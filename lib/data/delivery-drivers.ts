import "server-only";
import { createClient } from "@/lib/supabase/server";
import type { DeliveryDriverRow } from "@/types/database";

export async function getActiveDeliveryDrivers(): Promise<DeliveryDriverRow[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("delivery_drivers")
    .select("*")
    .in("status", ["active", "on_duty"])
    .order("name", { ascending: true });

  if (error || !data) return [];
  return data;
}
