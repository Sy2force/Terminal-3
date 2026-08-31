"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireAdminPermission } from "@/lib/admin/auth";
import { adminUpdateProductRequest } from "@/lib/data/product-requests";
import type { ProductRequestStatus } from "@/types/database";

const ALLOWED_STATUSES: ProductRequestStatus[] = [
  "new",
  "reviewing",
  "quoted",
  "accepted",
  "declined",
  "fulfilled",
  "cancelled",
];

const updateSchema = z.object({
  requestId: z.string().uuid(),
  status: z.enum(ALLOWED_STATUSES as [ProductRequestStatus, ...ProductRequestStatus[]]).optional(),
  quotePriceAgorot: z.number().int().min(0).max(10_000_000).nullish(),
  quoteNote: z.string().trim().max(1000).optional(),
  adminResponse: z.string().trim().max(2000).optional(),
  productId: z.string().uuid().nullish(),
  variantId: z.string().uuid().nullish(),
});

export async function updateProductRequestAction(
  raw: z.infer<typeof updateSchema>,
): Promise<{ success: boolean; error?: string }> {
  const session = await requireAdminPermission("customers.edit");
  const parsed = updateSchema.safeParse(raw);
  if (!parsed.success) {
    return { success: false, error: "Formulaire invalide." };
  }
  const { requestId, ...patch } = parsed.data;

  const dbPatch: Record<string, unknown> = {};
  if (patch.status !== undefined) dbPatch.status = patch.status;
  if (patch.quotePriceAgorot !== undefined) dbPatch.quote_price_agorot = patch.quotePriceAgorot;
  if (patch.quoteNote !== undefined) dbPatch.quote_note = patch.quoteNote || null;
  if (patch.adminResponse !== undefined) dbPatch.admin_response = patch.adminResponse || null;
  if (patch.productId !== undefined) dbPatch.product_id = patch.productId;
  if (patch.variantId !== undefined) dbPatch.variant_id = patch.variantId;

  const result = await adminUpdateProductRequest(
    requestId,
    session.userId,
    dbPatch as never,
  );
  if (!result.success) return result;

  revalidatePath("/admin/product-requests");
  return { success: true };
}
