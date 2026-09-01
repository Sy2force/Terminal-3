"use server";

import { revalidatePath } from "next/cache";
import { requireAdminPermission } from "@/lib/admin/auth";
import { logAudit } from "@/lib/admin/audit";
import { createClient } from "@/lib/supabase/server";
import { isDemoMode } from "@/lib/demo-mode";
import { setLogoUrl } from "@/app/admin/store/actions";
import { getPageContentForAdmin } from "@/lib/data/page-contents";

export interface PhotoActionResult {
  success: boolean;
  error?: string;
}

/**
 * Replace the image of a promotion.
 */
export async function updatePromotionImageAction(
  promotionId: string,
  url: string,
): Promise<PhotoActionResult> {
  const session = await requireAdminPermission("marketing.promotions");
  if (isDemoMode()) return { success: false, error: "demo_mode" };

  const supabase = await createClient();

  try {
    const { error } = await supabase
      .from("promotions")
      .update({
        image_url: url,
        og_image_url: url,
        updated_at: new Date().toISOString(),
      })
      .eq("id", promotionId);

    if (error) throw new Error(error.message);

    await logAudit({
      actor: session.userId,
      action: "updated",
      entityType: "promotion",
      entityId: promotionId,
      metadata: { url, field: "image_url" },
    });

    revalidatePath(`/admin/photos`);
    revalidatePath(`/admin/promotions`);
    revalidatePath(`/admin/promotions/${promotionId}`);
    revalidatePath(`/promotions`);
    revalidatePath(`/promotions/[slug]`, "page");
    return { success: true };
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : "update_failed" };
  }
}

/**
 * Replace the cover image of a product. Persists in product_media and logs.
 */
export async function updateProductCoverAction(
  productId: string,
  url: string,
): Promise<PhotoActionResult> {
  const session = await requireAdminPermission("catalog.media");
  if (isDemoMode()) return { success: false, error: "demo_mode" };

  const supabase = await createClient();

  try {
    await supabase.from("product_media").delete().eq("product_id", productId).eq("kind", "COVER");

    const { error } = await supabase.from("product_media").insert({
      product_id: productId,
      url,
      alt: null,
      kind: "COVER",
      display_order: 0,
    });

    if (error) throw new Error(error.message);

    await logAudit({
      actor: session.userId,
      action: "updated",
      entityType: "product",
      entityId: productId,
      metadata: { url, field: "cover" },
    });

    revalidatePath(`/admin/photos`);
    revalidatePath(`/admin/products/${productId}`);
    revalidatePath(`/products/[slug]`, "page");
    revalidatePath("/");
    return { success: true };
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : "update_failed" };
  }
}

/**
 * Replace the cover image of a category.
 */
export async function updateCategoryCoverAction(
  categoryId: string,
  url: string,
): Promise<PhotoActionResult> {
  const session = await requireAdminPermission("catalog.media");
  if (isDemoMode()) return { success: false, error: "demo_mode" };

  const supabase = await createClient();

  try {
    const { error } = await supabase
      .from("categories")
      .update({ cover_image: url, updated_at: new Date().toISOString() })
      .eq("id", categoryId);

    if (error) throw new Error(error.message);

    await logAudit({
      actor: session.userId,
      action: "updated",
      entityType: "category",
      entityId: categoryId,
      metadata: { url, field: "cover_image" },
    });

    revalidatePath(`/admin/photos`);
    revalidatePath(`/admin/categories`);
    revalidatePath(`/categories`, "page");
    return { success: true };
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : "update_failed" };
  }
}

/**
 * Update the hero background (page_contents.og_image_url for slug='home'),
 * then publish so it becomes visible on the public site.
 */
export async function updateHeroBackgroundAction(url: string): Promise<PhotoActionResult> {
  const session = await requireAdminPermission("marketing.content");
  if (isDemoMode()) return { success: false, error: "demo_mode" };

  const supabase = await createClient();

  try {
    const existing = await getPageContentForAdmin("home");

    if (existing) {
      const { error } = await supabase
        .from("page_contents")
        .update({
          og_image_url: url,
          status: "published",
          published_at: new Date().toISOString(),
          published_by: session.userId,
          updated_at: new Date().toISOString(),
        })
        .eq("id", existing.id);
      if (error) throw new Error(error.message);
    } else {
      const { error } = await supabase.from("page_contents").insert({
        slug: "home",
        page_type: "home",
        status: "published",
        og_image_url: url,
        blocks: [],
        draft_blocks: [],
        published_at: new Date().toISOString(),
        published_by: session.userId,
      });
      if (error) throw new Error(error.message);
    }

    await logAudit({
      actor: session.userId,
      action: "updated",
      entityType: "homepage_section",
      entityId: "home",
      metadata: { url, field: "og_image_url" },
    });

    revalidatePath("/");
    revalidatePath("/admin/photos");
    revalidatePath("/admin/couvertures");
    return { success: true };
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : "update_failed" };
  }
}

/**
 * Update the brand logo through the existing site_settings action.
 */
export async function updateLogoAction(url: string): Promise<PhotoActionResult> {
  try {
    await setLogoUrl(url);
    return { success: true };
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : "update_failed" };
  }
}
