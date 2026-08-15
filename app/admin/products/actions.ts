"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireAdminPermission } from "@/lib/admin/auth";
import { logAudit } from "@/lib/admin/audit";
import {
  archiveProduct,
  createProduct,
  deleteProduct,
  duplicateProduct,
  updateProduct,
  getProductById,
  type ProductInput,
} from "@/lib/data/products";

const nullableString = z
  .string()
  .max(5000)
  .transform((v) => v.trim() || null)
  .nullable();

const productSchema = z.object({
  slug: z.string().min(1).max(160).regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
  category_id: z.string().uuid().nullable().optional(),
  product_type: z.enum(["STANDARD", "PLATTER"]).default("STANDARD"),
  brand: z.string().max(200).nullable().optional(),
  name_he: z.string().min(1).max(200),
  name_fr: z.string().max(200).nullable().optional(),
  name_en: z.string().max(200).nullable().optional(),
  description_he: nullableString,
  description_fr: nullableString,
  description_en: nullableString,
  origin: z.string().max(200).nullable().optional(),
  tasting_notes: nullableString,
  pairing_notes: nullableString,
  how_to_serve: nullableString,
  storage_info: nullableString,
  kosher_status: z.string().max(500).nullable().optional(),
  allergen_info: nullableString,
  age_restricted: z.boolean().default(false),
  status: z.enum(["draft", "published", "archived"]).default("draft"),
  is_featured: z.boolean().default(false),
  availability_status: z
    .enum(["IN_STOCK", "LOW_STOCK", "OUT_OF_STOCK", "PREORDER", "ON_REQUEST"])
    .default("IN_STOCK"),
  base_price_agorot: z.number().int().min(0).nullable().optional(),
  compare_at_price_agorot: z.number().int().min(0).nullable().optional(),
  meta_title: z.string().max(200).nullable().optional(),
  meta_description: z.string().max(500).nullable().optional(),
  serves_min: z.number().int().min(1).nullable().optional(),
  serves_max: z.number().int().min(1).nullable().optional(),
  composition_text: nullableString,
  advance_order_hours: z.number().int().min(0).default(0),
  customizable: z.boolean().default(false),
  preparation_time_minutes: z.number().int().min(0).nullable().optional(),
  new_until: z.string().datetime().nullable().optional(),
  wine_type: z.enum(["ROUGE", "BLANC", "ROSE", "EFFERVESCENT", "DOUX"]).nullable().optional(),
  region: z.string().max(200).nullable().optional(),
  country: z.string().max(200).nullable().optional(),
  grape_varieties: z.array(z.string()).nullable().optional(),
  rating: z.number().min(0).max(5).nullable().optional(),
  review_count: z.number().int().min(0).default(0),
  is_best_seller: z.boolean().default(false),
  badge: z.string().max(100).nullable().optional(),
  serving_temperature: z.string().max(200).nullable().optional(),
  aging_potential: z.string().max(500).nullable().optional(),
  vinification_method: z.string().max(500).nullable().optional(),
  subcategory: z.string().max(100).nullable().optional(),
  age_years: z.number().int().min(0).nullable().optional(),
  nose_notes: nullableString,
  palate_notes: nullableString,
  finish_notes: nullableString,
  cask_type: z.string().max(200).nullable().optional(),
  edition: z.string().max(200).nullable().optional(),
  production_method: nullableString,
  meat_type: z.string().max(200).nullable().optional(),
  is_available_for_platter: z.boolean().default(false),
  nutrition_info: nullableString,
  expiration_info: nullableString,
  fish_type: z.string().max(200).nullable().optional(),
  preparation_method: z.string().max(200).nullable().optional(),
  smoked: z.boolean().default(false),
});

const variantSchema = z.object({
  id: z.string().uuid().optional(),
  label: z.string().min(1).max(200),
  sku: z.string().max(200).nullable().optional(),
  weight_g: z.number().int().min(0).nullable().optional(),
  volume_ml: z.number().int().min(0).nullable().optional(),
  abv: z.number().min(0).max(100).nullable().optional(),
  vintage: z.number().int().min(1000).max(2100).nullable().optional(),
  regular_price_agorot: z.number().int().min(0).nullable().optional(),
  is_default: z.boolean().default(false),
  limited_stock: z.boolean().default(false),
  availability_status: z
    .enum(["IN_STOCK", "LOW_STOCK", "OUT_OF_STOCK", "PREORDER", "ON_REQUEST"])
    .default("IN_STOCK"),
  display_order: z.number().int().default(0),
  status: z.enum(["draft", "published", "archived"]).default("published"),
  pricing_unit: z.enum(["FIXED", "PACKAGE", "PER_100G", "PER_KG", "FROM"]).nullable().optional(),
  packaging: z.string().max(100).nullable().optional(),
});

const mediaSchema = z.object({
  url: z.string().url().max(2000),
  alt: z.string().max(500).nullable().optional(),
  kind: z.enum(["COVER", "GALLERY", "LIFESTYLE", "DETAIL", "EDITORIAL"]).default("GALLERY"),
  display_order: z.number().int().default(0),
});

export type ProductFormData = z.infer<typeof productSchema>;

export interface ProductActionResult {
  success: boolean;
  error?: string;
}

function formDataToProduct(input: unknown): ProductInput {
  const parsed = productSchema.parse(input);
  return parsed;
}

export async function createProductAction(input: {
  product: unknown;
  variants: unknown[];
  media: unknown[];
}): Promise<ProductActionResult> {
  const session = await requireAdminPermission("catalog.products");

  try {
    const product = formDataToProduct(input.product);
    const variants = input.variants.map((v) => variantSchema.parse(v));
    const media = input.media.map((m) => mediaSchema.parse(m));

    const created = await createProduct(product, variants, media);

    await logAudit({
      actor: session.userId,
      action: "created",
      entityType: "product",
      entityId: created.id,
      metadata: { slug: created.slug, status: created.status },
    });

    revalidatePath("/admin/products");
    revalidatePath("/categories");
    return { success: true };
  } catch (err) {
    const message = err instanceof Error ? err.message : "create_failed";
    return { success: false, error: message };
  }
}

export async function updateProductAction(
  id: string,
  input: {
    product: unknown;
    variants?: unknown[];
    media?: unknown[];
  },
): Promise<ProductActionResult> {
  const session = await requireAdminPermission("catalog.products");

  try {
    const product = formDataToProduct(input.product);
    const variants = input.variants?.map((v) => variantSchema.parse(v));
    const media = input.media?.map((m) => mediaSchema.parse(m));

    const updated = await updateProduct(id, product, variants, media);

    await logAudit({
      actor: session.userId,
      action: "updated",
      entityType: "product",
      entityId: updated.id,
      metadata: { slug: updated.slug, status: updated.status },
    });

    revalidatePath("/admin/products");
    revalidatePath(`/admin/products/${id}`);
    revalidatePath(`/products/${updated.slug}`);
    revalidatePath("/categories");
    revalidatePath("/new");
    return { success: true };
  } catch (err) {
    const message = err instanceof Error ? err.message : "update_failed";
    return { success: false, error: message };
  }
}

export async function duplicateProductAction(
  id: string,
): Promise<ProductActionResult> {
  const session = await requireAdminPermission("catalog.products");

  try {
    const duplicated = await duplicateProduct(id);
    await logAudit({
      actor: session.userId,
      action: "created",
      entityType: "product",
      entityId: duplicated.id,
      metadata: { slug: duplicated.slug, duplicated_from: id },
    });
    revalidatePath("/admin/products");
    return { success: true };
  } catch (err) {
    const message = err instanceof Error ? err.message : "duplicate_failed";
    return { success: false, error: message };
  }
}

export async function archiveProductAction(
  id: string,
): Promise<ProductActionResult> {
  const session = await requireAdminPermission("catalog.products");

  try {
    await archiveProduct(id);
    await logAudit({
      actor: session.userId,
      action: "archived",
      entityType: "product",
      entityId: id,
    });
    revalidatePath("/admin/products");
    revalidatePath("/categories");
    return { success: true };
  } catch (err) {
    const message = err instanceof Error ? err.message : "archive_failed";
    return { success: false, error: message };
  }
}

export async function deleteProductAction(
  id: string,
): Promise<ProductActionResult> {
  const session = await requireAdminPermission("catalog.products");

  try {
    await deleteProduct(id);
    await logAudit({
      actor: session.userId,
      action: "deleted",
      entityType: "product",
      entityId: id,
    });
    revalidatePath("/admin/products");
    revalidatePath("/categories");
    return { success: true };
  } catch (err) {
    const message = err instanceof Error ? err.message : "delete_failed";
    return { success: false, error: message };
  }
}

export interface BulkActionResult {
  success: boolean;
  updated: number;
  error?: string;
}

const bulkIdsSchema = z.array(z.string().uuid()).min(1).max(500);

/**
 * Bulk status change (draft / published / archived) across selected
 * products, one at a time through the existing single-product update
 * path so validation and audit logging stay consistent.
 */
export async function bulkUpdateStatusAction(
  ids: unknown,
  status: "draft" | "published" | "archived",
): Promise<BulkActionResult> {
  const session = await requireAdminPermission("catalog.products");
  try {
    const parsedIds = bulkIdsSchema.parse(ids);
    let updated = 0;
    for (const id of parsedIds) {
      await updateProduct(id, { status });
      updated += 1;
    }
    await logAudit({
      actor: session.userId,
      action: "status_changed",
      entityType: "product",
      entityId: parsedIds[0],
      metadata: { status, count: updated },
    });
    revalidatePath("/admin/products");
    revalidatePath("/categories");
    return { success: true, updated };
  } catch (err) {
    return { success: false, updated: 0, error: err instanceof Error ? err.message : "bulk_status_failed" };
  }
}

/**
 * Bulk category reassignment across selected products.
 */
export async function bulkUpdateCategoryAction(
  ids: unknown,
  categoryId: string | null,
): Promise<BulkActionResult> {
  const session = await requireAdminPermission("catalog.products");
  try {
    const parsedIds = bulkIdsSchema.parse(ids);
    let updated = 0;
    for (const id of parsedIds) {
      await updateProduct(id, { category_id: categoryId });
      updated += 1;
    }
    await logAudit({
      actor: session.userId,
      action: "updated",
      entityType: "product",
      entityId: parsedIds[0],
      metadata: { category_id: categoryId, count: updated },
    });
    revalidatePath("/admin/products");
    revalidatePath("/categories");
    return { success: true, updated };
  } catch (err) {
    return { success: false, updated: 0, error: err instanceof Error ? err.message : "bulk_category_failed" };
  }
}

/**
 * Bulk price adjustment by percentage (e.g. -10 for a 10% discount, or
 * +5 for a 5% increase) applied to `base_price_agorot`. Only affects
 * products that have a base price set; variant pricing is untouched.
 */
export async function bulkAdjustPriceAction(
  ids: unknown,
  percent: number,
): Promise<BulkActionResult> {
  const session = await requireAdminPermission("catalog.products");
  try {
    const parsedIds = bulkIdsSchema.parse(ids);
    const clampedPercent = Math.max(-90, Math.min(500, percent));
    let updated = 0;
    for (const id of parsedIds) {
      const product = await getProductById(id);
      if (!product?.base_price_agorot) continue;
      const newPrice = Math.round(product.base_price_agorot * (1 + clampedPercent / 100));
      await updateProduct(id, { base_price_agorot: Math.max(0, newPrice) });
      updated += 1;
    }
    await logAudit({
      actor: session.userId,
      action: "price_changed",
      entityType: "product",
      entityId: parsedIds[0],
      metadata: { percent: clampedPercent, count: updated },
    });
    revalidatePath("/admin/products");
    return { success: true, updated };
  } catch (err) {
    return { success: false, updated: 0, error: err instanceof Error ? err.message : "bulk_price_failed" };
  }
}
