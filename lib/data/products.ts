import "server-only";
import { createClient } from "@/lib/supabase/server";
import type {
  ProductRow,
  ProductVariantRow,
  ProductMediaRow,
  ProductStatus,
  ProductType,
  ProductAvailabilityStatus,
} from "@/types/database";

export interface ProductInput {
  slug: string;
  category_id?: string | null;
  product_type?: ProductType;
  brand?: string | null;
  name_he: string;
  name_fr?: string | null;
  name_en?: string | null;
  description_he?: string | null;
  description_fr?: string | null;
  description_en?: string | null;
  origin?: string | null;
  tasting_notes?: string | null;
  pairing_notes?: string | null;
  how_to_serve?: string | null;
  storage_info?: string | null;
  kosher_status?: string | null;
  allergen_info?: string | null;
  age_restricted?: boolean;
  status?: ProductStatus;
  is_featured?: boolean;
  availability_status?: ProductAvailabilityStatus;
  base_price_agorot?: number | null;
  compare_at_price_agorot?: number | null;
  meta_title?: string | null;
  meta_description?: string | null;
  serves_min?: number | null;
  serves_max?: number | null;
  composition_text?: string | null;
  advance_order_hours?: number;
  customizable?: boolean;
  preparation_time_minutes?: number | null;
  published_at?: string | null;
  new_until?: string | null;
  /** Wine-catalog fields — null for non-wine products. */
  wine_type?: "ROUGE" | "BLANC" | "ROSE" | "EFFERVESCENT" | "DOUX" | null;
  region?: string | null;
  country?: string | null;
  grape_varieties?: string[] | null;
  rating?: number | null;
  review_count?: number;
  is_best_seller?: boolean;
  badge?: string | null;
  serving_temperature?: string | null;
  aging_potential?: string | null;
  vinification_method?: string | null;
  /** Spirits-catalog fields — generic enough for future categories too. */
  subcategory?: string | null;
  age_years?: number | null;
  nose_notes?: string | null;
  palate_notes?: string | null;
  finish_notes?: string | null;
  cask_type?: string | null;
  edition?: string | null;
  production_method?: string | null;
  /** Charcuterie-catalog fields — null for other categories. */
  meat_type?: string | null;
  is_available_for_platter?: boolean;
  nutrition_info?: string | null;
  expiration_info?: string | null;
  /** Fish-catalog fields — null for other categories. */
  fish_type?: string | null;
  preparation_method?: string | null;
  smoked?: boolean;
}

export interface ProductVariantInput {
  id?: string;
  label: string;
  sku?: string | null;
  weight_g?: number | null;
  volume_ml?: number | null;
  abv?: number | null;
  vintage?: number | null;
  regular_price_agorot?: number | null;
  is_default?: boolean;
  limited_stock?: boolean;
  availability_status?: ProductAvailabilityStatus;
  display_order?: number;
  status?: ProductStatus;
  pricing_unit?: "FIXED" | "PACKAGE" | "PER_100G" | "PER_KG" | "FROM" | null;
  packaging?: string | null;
}

export interface ProductMediaInput {
  url: string;
  alt?: string | null;
  kind: "COVER" | "GALLERY" | "LIFESTYLE" | "DETAIL" | "EDITORIAL";
  display_order?: number;
}

export type ProductWithDetails = ProductRow & {
  category: { name_fr: string | null; name_he: string; slug: string } | null;
  variants: ProductVariantRow[];
  media: ProductMediaRow[];
};

export async function getAllProducts(): Promise<ProductWithDetails[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("products")
    .select(
      `*, category:categories(name_fr, name_he, slug), variants:product_variants(*), media:product_media(*)`,
    )
    .order("updated_at", { ascending: false });

  if (error || !data) return [];
  return data as unknown as ProductWithDetails[];
}

export async function getProductById(
  id: string,
): Promise<ProductWithDetails | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("products")
    .select(
      `*, category:categories(name_fr, name_he, slug), variants:product_variants(*), media:product_media(*)`,
    )
    .eq("id", id)
    .maybeSingle();

  if (error || !data) return null;
  return data as unknown as ProductWithDetails;
}

export async function createProduct(
  product: ProductInput,
  variants: ProductVariantInput[],
  media: ProductMediaInput[],
): Promise<ProductRow> {
  const supabase = await createClient();

  const now = new Date().toISOString();
  const status = product.status ?? "draft";

  const { data: created, error } = await supabase
    .from("products")
    .insert({
      ...product,
      status,
      published_at: status === "published" ? now : product.published_at ?? null,
      updated_at: now,
    })
    .select()
    .single();

  if (error || !created) {
    throw new Error(error?.message ?? "create_product_failed");
  }

  if (variants.length > 0) {
    const { error: variantsError } = await supabase
      .from("product_variants")
      .insert(
        variants.map((v, index) => ({
          product_id: created.id,
          label: v.label,
          sku: v.sku ?? null,
          weight_g: v.weight_g ?? null,
          volume_ml: v.volume_ml ?? null,
          abv: v.abv ?? null,
          vintage: v.vintage ?? null,
          regular_price_agorot: v.regular_price_agorot ?? null,
          is_default: v.is_default ?? index === 0,
          limited_stock: v.limited_stock ?? false,
          availability_status: v.availability_status ?? "IN_STOCK",
          display_order: v.display_order ?? index,
          status: v.status ?? "published",
          pricing_unit: v.pricing_unit ?? null,
          packaging: v.packaging ?? null,
          updated_at: now,
        })),
      );

    if (variantsError) {
      throw new Error(variantsError.message ?? "create_variants_failed");
    }
  }

  if (media.length > 0) {
    const { error: mediaError } = await supabase.from("product_media").insert(
      media.map((m, index) => ({
        product_id: created.id,
        url: m.url,
        alt: m.alt ?? null,
        kind: m.kind,
        display_order: m.display_order ?? index,
      })),
    );

    if (mediaError) {
      throw new Error(mediaError.message ?? "create_media_failed");
    }
  }

  return created;
}

export async function updateProduct(
  id: string,
  product: Partial<ProductInput>,
  variants?: ProductVariantInput[],
  media?: ProductMediaInput[],
): Promise<ProductRow> {
  const supabase = await createClient();
  const now = new Date().toISOString();

  const { data: updated, error } = await supabase
    .from("products")
    .update({
      ...product,
      updated_at: now,
    })
    .eq("id", id)
    .select()
    .single();

  if (error || !updated) {
    throw new Error(error?.message ?? "update_product_failed");
  }

  if (variants) {
    await supabase.from("product_variants").delete().eq("product_id", id);

    if (variants.length > 0) {
      const { error: variantsError } = await supabase
        .from("product_variants")
        .insert(
          variants.map((v, index) => ({
            product_id: id,
            label: v.label,
            sku: v.sku ?? null,
            weight_g: v.weight_g ?? null,
            volume_ml: v.volume_ml ?? null,
            abv: v.abv ?? null,
            vintage: v.vintage ?? null,
            regular_price_agorot: v.regular_price_agorot ?? null,
            is_default: v.is_default ?? index === 0,
            limited_stock: v.limited_stock ?? false,
            availability_status: v.availability_status ?? "IN_STOCK",
            display_order: v.display_order ?? index,
            status: v.status ?? "published",
            pricing_unit: v.pricing_unit ?? null,
            packaging: v.packaging ?? null,
            updated_at: now,
          })),
        );

      if (variantsError) {
        throw new Error(variantsError.message ?? "update_variants_failed");
      }
    }
  }

  if (media) {
    await supabase.from("product_media").delete().eq("product_id", id);

    if (media.length > 0) {
      const { error: mediaError } = await supabase.from("product_media").insert(
        media.map((m, index) => ({
          product_id: id,
          url: m.url,
          alt: m.alt ?? null,
          kind: m.kind,
          display_order: m.display_order ?? index,
        })),
      );

      if (mediaError) {
        throw new Error(mediaError.message ?? "update_media_failed");
      }
    }
  }

  return updated;
}

export async function archiveProduct(id: string): Promise<void> {
  const supabase = await createClient();
  const { error } = await supabase
    .from("products")
    .update({ status: "archived", updated_at: new Date().toISOString() })
    .eq("id", id);

  if (error) throw new Error(error.message ?? "archive_product_failed");
}

/**
 * Duplicates a product (and its variants/media) as a new draft with a
 * "-copie" slug suffix, so an admin can quickly create a variation of an
 * existing bottle without retyping every field.
 */
export async function duplicateProduct(id: string): Promise<ProductRow> {
  const original = await getProductById(id);
  if (!original) throw new Error("product_not_found");

  const supabase = await createClient();
  let slug = `${original.slug}-copie`;
  let suffix = 2;
  while ((await supabase.from("products").select("id").eq("slug", slug).maybeSingle()).data) {
    slug = `${original.slug}-copie-${suffix}`;
    suffix += 1;
  }

  const { variants: originalVariants, media: originalMedia, ...productFields } = original;
  // Only forward fields createProduct() actually accepts — never the
  // original's id/timestamps/category relation, which must be regenerated.
  const {
    id: _omitId,
    created_at: _omitCreatedAt,
    updated_at: _omitUpdatedAt,
    published_at: _omitPublishedAt,
    category: _omitCategory,
    ...rest
  } = productFields;
  void _omitId;
  void _omitCreatedAt;
  void _omitUpdatedAt;
  void _omitPublishedAt;
  void _omitCategory;

  const created = await createProduct(
    { ...rest, slug, status: "draft" },
    originalVariants.map((v) => ({
      label: v.label,
      sku: v.sku,
      weight_g: v.weight_g,
      volume_ml: v.volume_ml,
      abv: v.abv,
      vintage: v.vintage,
      regular_price_agorot: v.regular_price_agorot,
      is_default: v.is_default,
      limited_stock: v.limited_stock,
      availability_status: v.availability_status,
      display_order: v.display_order,
      status: v.status,
      pricing_unit: v.pricing_unit,
      packaging: v.packaging,
    })),
    originalMedia.map((m) => ({
      url: m.url,
      alt: m.alt,
      kind: m.kind,
      display_order: m.display_order,
    })),
  );

  return created;
}

export async function deleteProduct(id: string): Promise<void> {
  const supabase = await createClient();

  const { count, error: countError } = await supabase
    .from("order_items")
    .select("*", { count: "exact", head: true })
    .eq("product_id", id);

  if (countError) throw new Error("check_orders_failed");
  if ((count ?? 0) > 0) {
    throw new Error("product_has_orders");
  }

  const { error } = await supabase.from("products").delete().eq("id", id);
  if (error) throw new Error(error.message ?? "delete_product_failed");
}
