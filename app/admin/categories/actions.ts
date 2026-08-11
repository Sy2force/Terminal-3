"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireAdminPermission } from "@/lib/admin/auth";
import { logAudit } from "@/lib/admin/audit";
import {
  archiveCategory,
  createCategory,
  deleteCategory,
  updateCategory,
} from "@/lib/data/categories";

const categorySchema = z.object({
  slug: z.string().min(1).max(120).regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
  name_he: z.string().min(1).max(200),
  name_fr: z.string().max(200).nullable().optional(),
  name_en: z.string().max(200).nullable().optional(),
  parent_id: z.string().uuid().nullable().optional(),
  display_order: z.number().int().default(0),
  is_active: z.boolean().default(true),
  is_featured: z.boolean().default(false),
  cover_image: z.string().url().max(1000).nullable().optional(),
  icon: z.string().max(100).nullable().optional(),
  short_description: z.string().max(500).nullable().optional(),
  description: z.string().max(5000).nullable().optional(),
  meta_title: z.string().max(200).nullable().optional(),
  meta_description: z.string().max(500).nullable().optional(),
});

export type CategoryFormData = z.infer<typeof categorySchema>;

export interface CategoryActionResult {
  success: boolean;
  error?: string;
}

export async function createCategoryAction(
  input: unknown,
): Promise<CategoryActionResult> {
  const session = await requireAdminPermission("catalog.categories");
  const parsed = categorySchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: "Formulaire invalide." };
  }

  try {
    const category = await createCategory(parsed.data);
    await logAudit({
      actor: session.userId,
      action: "created",
      entityType: "category",
      entityId: category.id,
      metadata: { slug: category.slug },
    });
    revalidatePath("/admin/categories");
    revalidatePath("/categories");
    return { success: true };
  } catch (err) {
    const message = err instanceof Error ? err.message : "create_failed";
    return { success: false, error: message };
  }
}

export async function updateCategoryAction(
  id: string,
  input: unknown,
): Promise<CategoryActionResult> {
  const session = await requireAdminPermission("catalog.categories");
  const parsed = categorySchema.partial().safeParse(input);
  if (!parsed.success || Object.keys(parsed.data ?? {}).length === 0) {
    return { success: false, error: "Formulaire invalide." };
  }

  try {
    const category = await updateCategory(id, parsed.data);
    await logAudit({
      actor: session.userId,
      action: "updated",
      entityType: "category",
      entityId: category.id,
      metadata: { slug: category.slug },
    });
    revalidatePath("/admin/categories");
    revalidatePath(`/admin/categories/${id}`);
    revalidatePath("/categories");
    revalidatePath(`/categories/${category.slug}`);
    return { success: true };
  } catch (err) {
    const message = err instanceof Error ? err.message : "update_failed";
    return { success: false, error: message };
  }
}

export async function archiveCategoryAction(
  id: string,
): Promise<CategoryActionResult> {
  const session = await requireAdminPermission("catalog.categories");

  try {
    await archiveCategory(id);
    await logAudit({
      actor: session.userId,
      action: "archived",
      entityType: "category",
      entityId: id,
    });
    revalidatePath("/admin/categories");
    revalidatePath("/categories");
    return { success: true };
  } catch (err) {
    const message = err instanceof Error ? err.message : "archive_failed";
    return { success: false, error: message };
  }
}

export async function deleteCategoryAction(
  id: string,
): Promise<CategoryActionResult> {
  const session = await requireAdminPermission("catalog.categories");

  try {
    await deleteCategory(id);
    await logAudit({
      actor: session.userId,
      action: "deleted",
      entityType: "category",
      entityId: id,
    });
    revalidatePath("/admin/categories");
    revalidatePath("/categories");
    return { success: true };
  } catch (err) {
    const message = err instanceof Error ? err.message : "delete_failed";
    return { success: false, error: message };
  }
}
