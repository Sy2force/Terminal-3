"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireAdminPermission } from "@/lib/admin/auth";
import { logAudit } from "@/lib/admin/audit";
import {
  archiveProduct,
  createProduct,
  deleteProduct,
  updateProduct,
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
