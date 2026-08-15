"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { requireAdminPermission } from "@/lib/admin/auth";
import type { BrandRow } from "@/types/database";

export async function getBrands(): Promise<BrandRow[]> {
  await requireAdminPermission("catalog.products");
  const supabase = await createClient();
  const { data, error } = await supabase.from("brands").select("*").order("name", { ascending: true });
  if (error || !data) return [];
  return data;
}

export interface BrandFormData {
  name: string;
  name_he?: string;
  slug?: string;
  description?: string;
  logo_url?: string;
  cover_image_url?: string;
  website_url?: string;
  is_active?: boolean;
}

export async function createBrand(data: BrandFormData): Promise<{ success: boolean; error?: string }> {
  await requireAdminPermission("catalog.products");
  const supabase = await createClient();
  const slug = data.slug?.trim().toLowerCase() || data.name.toLowerCase().replace(/\s+/g, "-");
  const { error } = await supabase.from("brands").insert({
    name: data.name,
    name_he: data.name_he,
    slug,
    description: data.description,
    logo_url: data.logo_url,
    cover_image_url: data.cover_image_url,
    website_url: data.website_url,
    is_active: data.is_active ?? true,
  });
  if (error) return { success: false, error: error.message };
  revalidatePath("/admin/brands");
  return { success: true };
}

export async function updateBrand(
  id: string,
  data: BrandFormData,
): Promise<{ success: boolean; error?: string }> {
  await requireAdminPermission("catalog.products");
  const supabase = await createClient();
  const { error } = await supabase
    .from("brands")
    .update({
      name: data.name,
      name_he: data.name_he,
      description: data.description,
      logo_url: data.logo_url,
      cover_image_url: data.cover_image_url,
      website_url: data.website_url,
      is_active: data.is_active,
    })
    .eq("id", id);
  if (error) return { success: false, error: error.message };
  revalidatePath("/admin/brands");
  return { success: true };
}
