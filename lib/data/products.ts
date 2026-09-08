import "server-only";
import { randomUUID } from "crypto";
import { createServiceRoleClient } from "@/lib/supabase/server";
import { normalizeWoltUrl } from "@/lib/wolt";
import { slugify } from "@/lib/classification/parser";
import type {
  ProductRow,
  ProductVariantRow,
  ProductMediaRow,
  ProductStatus,
  ProductType,
  ProductAvailabilityStatus,
} from "@/types/database";

const DEFAULT_LOW_STOCK_THRESHOLD = 3;

export interface ProductInput {
  slug?: string | null;
  category_id?: string | null;
  product_type?: ProductType;
  brand?: string | null;
  name_he?: string | null;
  name_fr: string;
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
  subcategory?: string | null;
  age_years?: number | null;
  nose_notes?: string | null;
  palate_notes?: string | null;
  finish_notes?: string | null;
  cask_type?: string | null;
  edition?: string | null;
  production_method?: string | null;
  meat_type?: string | null;
  is_available_for_platter?: boolean;
  nutrition_info?: string | null;
  expiration_info?: string | null;
  fish_type?: string | null;
  preparation_method?: string | null;
  smoked?: boolean;
}

export interface ProductVariantInput {
  id?: string;
  label: string;
  sku?: string | null;
  barcode?: string | null;
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
  wolt_url?: string | null;
  wolt_enabled?: boolean;
  /** Stock quantity for the default branch. */
  quantity?: number | null;
  /** Optional per-variant low-stock threshold. Falls back to global default. */
  low_stock_threshold?: number | null;
}

export interface ProductMediaInput {
  url: string;
  alt?: string | null;
  kind: "COVER" | "GALLERY" | "LIFESTYLE" | "DETAIL" | "EDITORIAL";
  display_order?: number;
}

export type ProductVariantWithInventory = ProductVariantRow & {
  quantity?: number | null;
  low_stock_threshold?: number | null;
};

export type ProductWithDetails = ProductRow & {
  category: { name_fr: string | null; name_he: string; slug: string } | null;
  variants: ProductVariantWithInventory[];
  media: ProductMediaRow[];
};

function availabilityFromStock(
  quantity: number | null | undefined,
  threshold = DEFAULT_LOW_STOCK_THRESHOLD,
): ProductAvailabilityStatus {
  if (quantity === null || quantity === undefined) return "IN_STOCK";
  if (quantity <= 0) return "OUT_OF_STOCK";
  if (quantity <= threshold) return "LOW_STOCK";
  return "IN_STOCK";
}

function isLowStock(
  quantity: number | null | undefined,
  threshold = DEFAULT_LOW_STOCK_THRESHOLD,
): boolean {
  return quantity != null && quantity > 0 && quantity <= threshold;
}

async function getDefaultBranchId(): Promise<string> {
  const supabase = createServiceRoleClient();
  const { data: existing } = await supabase
    .from("branches")
    .select("id")
    .eq("is_active", true)
    .order("created_at", { ascending: true })
    .limit(1)
    .maybeSingle();

  if (existing) return existing.id;

  const { data: inserted, error } = await supabase
    .from("branches")
    .insert({
      name: "Terminal 3 — Agripas",
      address: "Agripas 105, Jerusalem, Israel",
      is_active: true,
    })
    .select("id")
    .single();

  if (error || !inserted) {
    throw new Error(error?.message ?? "default_branch_failed");
  }
  return inserted.id;
}

async function generateUniqueSlug(
  supabase: ReturnType<typeof createServiceRoleClient>,
  base: string,
): Promise<string> {
  let slug = slugify(base).slice(0, 160) || randomUUID();
  let suffix = 2;
  for (let attempt = 0; attempt < 100; attempt++) {
    const { data } = await supabase
      .from("products")
      .select("id")
      .eq("slug", slug)
      .maybeSingle();
    if (!data) return slug;
    const baseSlug = slugify(base).slice(0, 150) || "produit";
    slug = `${baseSlug}-${suffix}`;
    suffix++;
  }
  slug = `${slugify(base).slice(0, 120) || "produit"}-${randomUUID().slice(0, 8)}`;
  return slug;
}

async function upsertVariantInventory(
  supabase: ReturnType<typeof createServiceRoleClient>,
  variantId: string,
  branchId: string,
  quantity: number | null | undefined,
): Promise<void> {
  if (quantity === null || quantity === undefined) return;

  const { data: existing } = await supabase
    .from("inventory")
    .select("id")
    .eq("variant_id", variantId)
    .eq("branch_id", branchId)
    .maybeSingle();

  if (existing) {
    await supabase
      .from("inventory")
      .update({ quantity, updated_at: new Date().toISOString() })
      .eq("id", existing.id);
  } else {
    await supabase.from("inventory").insert({
      variant_id: variantId,
      branch_id: branchId,
      quantity,
    });
  }
}

function mergeInventoryIntoVariants(
  variants: ProductVariantRow[],
): ProductVariantWithInventory[] {
  return variants.map((variant) => {
    const inventories = (variant as unknown as { inventory?: { quantity: number }[] }).inventory;
    const quantity = inventories?.[0]?.quantity ?? null;
    return {
      ...variant,
      quantity,
      low_stock_threshold: DEFAULT_LOW_STOCK_THRESHOLD,
    } as ProductVariantWithInventory;
  });
}

export async function getAllProducts(): Promise<ProductWithDetails[]> {
  const supabase = createServiceRoleClient();
  const { data, error } = await supabase
    .from("products")
    .select(
      "*, category:categories(name_fr, name_he, slug), variants:product_variants(*, inventory(quantity, branch_id)), media:product_media(*)",
    )
    .order("updated_at", { ascending: false });

  if (error || !data) return [];

  return (data as unknown as ProductWithDetails[]).map((product) => ({
    ...product,
    variants: mergeInventoryIntoVariants(product.variants),
  }));
}

export async function getProductById(
  id: string,
): Promise<ProductWithDetails | null> {
  const supabase = createServiceRoleClient();
  const { data, error } = await supabase
    .from("products")
    .select(
      "*, category:categories(name_fr, name_he, slug), variants:product_variants(*, inventory(quantity, branch_id)), media:product_media(*)",
    )
    .eq("id", id)
    .maybeSingle();

  if (error || !data) return null;

  const product = data as unknown as ProductWithDetails;
  return {
    ...product,
    variants: mergeInventoryIntoVariants(product.variants),
  };
}

export async function getProductBySlugForAdmin(
  slug: string,
): Promise<ProductWithDetails | null> {
  const supabase = createServiceRoleClient();
  const { data, error } = await supabase
    .from("products")
    .select(
      "*, category:categories(name_fr, name_he, slug), variants:product_variants(*, inventory(quantity, branch_id)), media:product_media(*)",
    )
    .eq("slug", slug)
    .maybeSingle();

  if (error || !data) return null;

  const product = data as unknown as ProductWithDetails;
  return {
    ...product,
    variants: mergeInventoryIntoVariants(product.variants),
  };
}

function variantInsertValues(
  product: ProductInput,
  v: ProductVariantInput,
  index: number,
  productId: string,
  now: string,
) {
  const woltUrl = normalizeWoltUrl(v.wolt_url ?? "");
  const wantsWolt = v.wolt_enabled && Boolean(v.wolt_url);
  if (wantsWolt && !woltUrl) {
    throw new Error(`wolt_url_invalide:${index}`);
  }

  const quantity = v.quantity ?? null;
  const threshold = v.low_stock_threshold ?? DEFAULT_LOW_STOCK_THRESHOLD;
  const regularPrice = v.regular_price_agorot ?? product.base_price_agorot ?? null;
  const availability =
    quantity != null
      ? availabilityFromStock(quantity, threshold)
      : (v.availability_status ?? "IN_STOCK");

  return {
    product_id: productId,
    label: v.label,
    sku: v.sku ?? null,
    barcode: v.barcode ?? null,
    weight_g: v.weight_g ?? null,
    volume_ml: v.volume_ml ?? null,
    abv: v.abv ?? null,
    vintage: v.vintage ?? null,
    regular_price_agorot: regularPrice,
    is_default: v.is_default ?? index === 0,
    limited_stock: isLowStock(quantity, threshold) || (v.limited_stock ?? false),
    availability_status: availability,
    display_order: v.display_order ?? index,
    status: v.status ?? "published",
    pricing_unit: v.pricing_unit ?? null,
    packaging: v.packaging ?? null,
    wolt_enabled: wantsWolt && !!woltUrl,
    wolt_url: woltUrl,
    updated_at: now,
  };
}

export async function createProduct(
  product: ProductInput,
  variants: ProductVariantInput[],
  media: ProductMediaInput[],
): Promise<ProductRow> {
  const supabase = createServiceRoleClient();
  const now = new Date().toISOString();

  const nameFr = product.name_fr?.trim() || product.name_he?.trim() || "Produit";
  const nameHe = product.name_he?.trim() || nameFr;

  let slug = product.slug?.trim() || "";
  if (!slug) {
    slug = await generateUniqueSlug(supabase, nameFr || nameHe || "produit");
  }

  const status = product.status ?? "draft";

  const { data: created, error } = await supabase
    .from("products")
    .insert({
      ...product,
      name_fr: nameFr,
      name_he: nameHe,
      slug,
      status,
      published_at: status === "published" ? now : product.published_at ?? null,
      updated_at: now,
      created_at: now,
    })
    .select()
    .single();

  if (error || !created) {
    throw new Error(error?.message ?? "create_product_failed");
  }

  if (variants.length > 0) {
    const branchId = await getDefaultBranchId();

    for (let index = 0; index < variants.length; index++) {
      const v = variants[index];
      const insertValues = variantInsertValues(product, v, index, created.id, now);

      const { data: insertedVariant, error: variantError } = await supabase
        .from("product_variants")
        .insert(insertValues)
        .select()
        .single();

      if (variantError || !insertedVariant) {
        throw new Error(variantError?.message ?? "create_variant_failed");
      }

      await upsertVariantInventory(
        supabase,
        insertedVariant.id,
        branchId,
        v.quantity ?? null,
      );
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
  const supabase = createServiceRoleClient();
  const now = new Date().toISOString();

  const existing = await getProductById(id);
  if (!existing) throw new Error("product_not_found");

  const updatePayload: Partial<ProductInput> & { updated_at: string } = {
    ...product,
    updated_at: now,
  };

  if (
    product.status === "published" &&
    !existing.published_at &&
    !product.published_at
  ) {
    updatePayload.published_at = now;
  }

  if (!product.name_fr) delete updatePayload.name_fr;
  if (!product.name_he) delete updatePayload.name_he;
  if (!product.slug) delete updatePayload.slug;

  const { data: updated, error } = await supabase
    .from("products")
    .update(updatePayload as Partial<ProductRow>)
    .eq("id", id)
    .select()
    .single();

  if (error || !updated) {
    throw new Error(error?.message ?? "update_product_failed");
  }

  if (variants) {
    const existingVariants = new Map(existing.variants.map((v) => [v.id, v]));
    const keptIds = new Set<string>();
    const branchId = await getDefaultBranchId();

    for (let index = 0; index < variants.length; index++) {
      const v = variants[index];
      const woltUrl = normalizeWoltUrl(v.wolt_url ?? "");
      const wantsWolt = v.wolt_enabled && Boolean(v.wolt_url);
      if (wantsWolt && !woltUrl) {
        throw new Error(`wolt_url_invalide:${index}`);
      }

      const existingVariant = v.id ? existingVariants.get(v.id) : undefined;
      const existingQuantity = existingVariant?.quantity ?? null;
      const quantity = v.quantity ?? existingQuantity;
      const threshold = v.low_stock_threshold ?? DEFAULT_LOW_STOCK_THRESHOLD;
      const regularPrice =
        product.base_price_agorot != null &&
        (v.regular_price_agorot == null ||
          v.regular_price_agorot === existing.base_price_agorot)
          ? product.base_price_agorot
          : (v.regular_price_agorot ?? existing.base_price_agorot ?? null);
      const availability =
        quantity != null
          ? availabilityFromStock(quantity, threshold)
          : (v.availability_status ?? existingVariant?.availability_status ?? "IN_STOCK");

      const variantValues = {
        product_id: id,
        label: v.label,
        sku: v.sku ?? null,
        barcode: v.barcode ?? null,
        weight_g: v.weight_g ?? null,
        volume_ml: v.volume_ml ?? null,
        abv: v.abv ?? null,
        vintage: v.vintage ?? null,
        regular_price_agorot: regularPrice,
        is_default: v.is_default ?? index === 0,
        limited_stock: isLowStock(quantity, threshold) || (v.limited_stock ?? false),
        availability_status: availability,
        display_order: v.display_order ?? index,
        status: v.status ?? "published",
        pricing_unit: v.pricing_unit ?? null,
        packaging: v.packaging ?? null,
        wolt_enabled: wantsWolt && !!woltUrl,
        wolt_url: woltUrl,
        updated_at: now,
      };

      let variantId: string;
      if (existingVariant) {
        const { data: updatedVariant, error: updateError } = await supabase
          .from("product_variants")
          .update(variantValues)
          .eq("id", existingVariant.id)
          .select()
          .single();
        if (updateError || !updatedVariant) {
          throw new Error(updateError?.message ?? "update_variant_failed");
        }
        variantId = updatedVariant.id;
        keptIds.add(variantId);
      } else {
        const { data: insertedVariant, error: insertError } = await supabase
          .from("product_variants")
          .insert(variantValues)
          .select()
          .single();
        if (insertError || !insertedVariant) {
          throw new Error(insertError?.message ?? "create_variant_failed");
        }
        variantId = insertedVariant.id;
        keptIds.add(variantId);
      }

      await upsertVariantInventory(supabase, variantId, branchId, quantity);
    }

    const idsToDelete = existing.variants
      .map((v) => v.id)
      .filter((vId) => !keptIds.has(vId));
    if (idsToDelete.length > 0) {
      await supabase.from("product_variants").delete().in("id", idsToDelete);
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
  const supabase = createServiceRoleClient();
  const { error } = await supabase
    .from("products")
    .update({ status: "archived", updated_at: new Date().toISOString() })
    .eq("id", id);

  if (error) throw new Error(error.message ?? "archive_product_failed");
}

export async function duplicateProduct(id: string): Promise<ProductRow> {
  const original = await getProductById(id);
  if (!original) throw new Error("product_not_found");

  const supabase = createServiceRoleClient();
  const baseSlug = `${original.slug}-copie`;
  let slug = baseSlug;
  let suffix = 2;
  while ((await supabase.from("products").select("id").eq("slug", slug).maybeSingle()).data) {
    slug = `${baseSlug}-${suffix}`;
    suffix += 1;
  }

  const { variants: originalVariants, media: originalMedia, ...productFields } = original;
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
    { ...rest, slug, status: "draft" } as ProductInput,
    originalVariants.map((v) => ({
      label: `${v.label} — copie`,
      sku: null,
      barcode: v.barcode,
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
      wolt_enabled: false,
      wolt_url: null,
      quantity: v.quantity,
      low_stock_threshold: v.low_stock_threshold,
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
  const supabase = createServiceRoleClient();

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
