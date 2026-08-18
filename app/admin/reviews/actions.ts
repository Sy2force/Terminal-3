"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { requireAdminPermission } from "@/lib/admin/auth";
import { logAudit } from "@/lib/admin/audit";

export async function publishReview(reviewId: string): Promise<{ success: boolean; error?: string }> {
  const session = await requireAdminPermission("customers.view");
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("product_reviews")
    .update({ is_published: true })
    .eq("id", reviewId)
    .select("product_id")
    .single();

  if (error) {
    return { success: false, error: error.message };
  }

  if (data) {
    await logAudit({
      actor: session.userId,
      action: "published",
      entityType: "product",
      entityId: data.product_id,
      metadata: { review_id: reviewId },
    });
  }

  revalidatePath("/admin/reviews");
  return { success: true };
}

export async function unpublishReview(reviewId: string): Promise<{ success: boolean; error?: string }> {
  const session = await requireAdminPermission("customers.view");
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("product_reviews")
    .update({ is_published: false })
    .eq("id", reviewId)
    .select("product_id")
    .single();

  if (error) {
    return { success: false, error: error.message };
  }

  if (data) {
    await logAudit({
      actor: session.userId,
      action: "archived",
      entityType: "product",
      entityId: data.product_id,
      metadata: { review_id: reviewId },
    });
  }

  revalidatePath("/admin/reviews");
  return { success: true };
}

export async function deleteReview(reviewId: string): Promise<{ success: boolean; error?: string }> {
  const session = await requireAdminPermission("customers.view");
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("product_reviews")
    .delete()
    .eq("id", reviewId)
    .select("product_id")
    .single();

  if (error) {
    return { success: false, error: error.message };
  }

  if (data) {
    await logAudit({
      actor: session.userId,
      action: "deleted",
      entityType: "product",
      entityId: data.product_id,
      metadata: { review_id: reviewId },
    });
  }

  revalidatePath("/admin/reviews");
  return { success: true };
}
