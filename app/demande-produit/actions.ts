"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";

/**
 * A product request can be:
 *   - `in_catalog`: the customer found the product but wants a pro quote
 *     / larger quantities / a specific variant clarification.
 *   - `out_of_catalog`: the product isn't in our catalog; we describe it
 *     as free-text (type/brand/name/volume) and optionally attach a photo.
 * Both flows go into the same table so admins have a single inbox.
 */

const commonFields = {
  requestedQuantity: z.number().int().min(1).max(1000).default(1),
  requestedBudgetAgorot: z.number().int().min(0).max(10_000_000).nullish(),
  comment: z.string().trim().max(1000).optional(),
  photoUrl: z.string().trim().url().optional().or(z.literal("")),
};

const inCatalogSchema = z.object({
  kind: z.literal("in_catalog"),
  productId: z.string().uuid(),
  variantId: z.string().uuid().optional(),
  ...commonFields,
});

const outOfCatalogSchema = z.object({
  kind: z.literal("out_of_catalog"),
  requestedType: z.string().trim().min(1, "Type d'alcool requis.").max(50),
  requestedBrand: z.string().trim().min(1, "Marque requise.").max(200),
  requestedName: z.string().trim().min(1, "Nom du produit requis.").max(300),
  requestedVolumeMl: z.number().int().min(50).max(20_000).optional(),
  ...commonFields,
});

const productRequestSchema = z.union([inCatalogSchema, outOfCatalogSchema]);

export type ProductRequestInput = z.infer<typeof productRequestSchema>;

export interface CreateProductRequestResult {
  success: boolean;
  requestId?: string;
  publicReference?: string;
  error?: string;
}

export async function createProductRequest(
  raw: ProductRequestInput,
): Promise<CreateProductRequestResult> {
  const parsed = productRequestSchema.safeParse(raw);
  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.issues[0]?.message ?? "Formulaire invalide.",
    };
  }
  const input = parsed.data;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return { success: false, error: "Vous devez être connecté." };
  }

  const { data: barProfile } = await supabase
    .from("bar_profiles")
    .select("id")
    .eq("user_id", user.id)
    .maybeSingle();

  const base = {
    user_id: user.id,
    bar_profile_id: barProfile?.id ?? null,
    requested_quantity: input.requestedQuantity,
    requested_budget_agorot: input.requestedBudgetAgorot ?? null,
    photo_url: input.photoUrl || null,
    comment: input.comment ?? null,
    status: "new" as const,
  };

  const insert =
    input.kind === "in_catalog"
      ? {
          ...base,
          kind: "in_catalog" as const,
          product_id: input.productId,
          variant_id: input.variantId ?? null,
        }
      : {
          ...base,
          kind: "out_of_catalog" as const,
          requested_type: input.requestedType,
          requested_brand: input.requestedBrand,
          requested_name: input.requestedName,
          requested_volume_ml: input.requestedVolumeMl ?? null,
        };

  // The union of two shapes above narrows one branch each way; Supabase's
  // strict `Insert<>` typing rejects the union, so cast at the call site.
  const { data, error } = await supabase
    .from("product_requests")
    // eslint-disable-next-line @typescript-eslint/no-explicit-any -- union insert typing
    .insert(insert as any)
    .select("id, public_reference")
    .single();

  if (error || !data) {
    return { success: false, error: "Impossible d'enregistrer la demande." };
  }

  revalidatePath("/compte/demandes");
  revalidatePath("/admin/bars");
  return {
    success: true,
    requestId: data.id,
    publicReference: data.public_reference ?? undefined,
  };
}

export async function cancelMyProductRequest(
  requestId: string,
): Promise<{ success: boolean; error?: string }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { success: false, error: "Non autorisé." };

  // RLS policy `product_requests_self_update` only allows updates while
  // status is in ('new','reviewing'); this UPDATE will simply match zero
  // rows if the store has already quoted the request.
  const { error, count } = await supabase
    .from("product_requests")
    .update({ status: "cancelled" }, { count: "exact" })
    .eq("id", requestId)
    .eq("user_id", user.id);

  if (error || count === 0) {
    return {
      success: false,
      error: "Cette demande a déjà été traitée et ne peut plus être annulée.",
    };
  }
  revalidatePath("/compte/demandes");
  return { success: true };
}
