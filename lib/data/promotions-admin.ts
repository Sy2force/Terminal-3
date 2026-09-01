import "server-only";
import { createClient } from "@/lib/supabase/server";
import type { PromotionRow, PromotionStatus } from "@/types/database";

export interface PromotionInput {
  slug: string;
  title: string;
  description?: string | null;
  product_id?: string | null;
  variant_id?: string | null;
  branch_id?: string | null;
  image_url?: string | null;
  og_image_url?: string | null;
  regular_price_agorot: number;
  promo_price_agorot: number;
  start_at: string;
  end_at: string;
  quantity_limit?: number | null;
  members_only?: boolean;
  featured?: boolean;
  status?: PromotionStatus;
}

export async function getAllPromotions(): Promise<PromotionRow[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("promotions")
    .select("*")
    .order("updated_at", { ascending: false });

  if (error || !data) return [];
  return data;
}

export async function getPromotionById(
  id: string,
): Promise<PromotionRow | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("promotions")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (error || !data) return null;
  return data;
}

export async function createPromotion(
  input: PromotionInput,
): Promise<PromotionRow> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("promotions")
    .insert({
      ...input,
      remaining_quantity: input.quantity_limit ?? null,
      status: input.status ?? "draft",
      updated_at: new Date().toISOString(),
    })
    .select()
    .single();

  if (error || !data) {
    throw new Error(error?.message ?? "create_promotion_failed");
  }
  return data;
}

export async function updatePromotion(
  id: string,
  input: Partial<PromotionInput>,
): Promise<PromotionRow> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("promotions")
    .update({
      ...input,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id)
    .select()
    .single();

  if (error || !data) {
    throw new Error(error?.message ?? "update_promotion_failed");
  }
  return data;
}

export async function deletePromotion(id: string): Promise<void> {
  const supabase = await createClient();
  const { error } = await supabase.from("promotions").delete().eq("id", id);
  if (error) throw new Error(error.message ?? "delete_promotion_failed");
}
