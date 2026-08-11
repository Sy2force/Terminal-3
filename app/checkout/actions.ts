"use server";

import { z } from "zod";
import { createClient, createServiceRoleClient } from "@/lib/supabase/server";
import { getDefaultBranch } from "@/lib/data/branches";
import { getSiteSettings } from "@/lib/settings";
import type { ProductRow, ProductVariantRow } from "@/types/database";

type VariantWithProduct = ProductVariantRow & { product: ProductRow | null };

const cartLineSchema = z.object({
  variantId: z.string().uuid(),
  quantity: z.number().int().min(1).max(50),
});

const checkoutInputSchema = z.object({
  fulfillmentType: z.enum(["pickup", "delivery"]),
  deliveryAddress: z.string().trim().max(500).optional(),
  customerName: z.string().trim().min(1).max(200),
  customerPhone: z.string().trim().min(1).max(50),
  customerNotes: z.string().trim().max(1000).optional(),
  ageSelfDeclared: z.boolean(),
  lines: z.array(cartLineSchema).min(1),
});

export type CheckoutInput = z.infer<typeof checkoutInputSchema>;

export interface CheckoutResult {
  success: boolean;
  orderId?: string;
  error?: string;
}

/**
 * Returns the current delivery fee in agorot so the checkout UI can
 * display it. The authoritative application happens server-side in
 * `submitOrder` — this is purely for display.
 */
export async function getDeliveryFee(): Promise<number> {
  const settings = await getSiteSettings();
  return settings.DELIVERY_FEE_AGOROT;
}

/**
 * Lets the checkout UI show "-20% first order" before submission. Read-only
 * and duplicated (not trusted) by the authoritative check inside
 * `submitOrder` — this is purely for display.
 */
export async function getFirstPurchaseDiscountPreview(): Promise<{
  eligible: boolean;
  percent: number;
}> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { eligible: false, percent: 0 };

  const [{ count }, { data: existingEntitlement }, settings] =
    await Promise.all([
      supabase
        .from("orders")
        .select("id", { count: "exact", head: true })
        .eq("user_id", user.id),
      supabase
        .from("discount_entitlements")
        .select("id")
        .eq("user_id", user.id)
        .eq("code", "WELCOME20")
        .maybeSingle(),
      getSiteSettings(),
    ]);

  return {
    eligible: (count ?? 0) === 0 && !existingEntitlement,
    percent: settings.CLUB_WELCOME_DISCOUNT_PERCENT,
  };
}

/**
 * Creates an order from the client-side cart. Prices are NEVER trusted from
 * the client: every line's price is re-fetched from `product_variants` (and
 * matched against any currently-valid promotion) at submission time. No
 * payment is processed here — orders are created as `submitted` and settled
 * in person (cash/card at pickup or with the delivery person).
 */
export async function submitOrder(
  rawInput: CheckoutInput,
): Promise<CheckoutResult> {
  const parsed = checkoutInputSchema.safeParse(rawInput);
  if (!parsed.success) {
    return { success: false, error: "Formulaire invalide." };
  }
  const input = parsed.data;

  if (input.fulfillmentType === "delivery" && !input.deliveryAddress) {
    return {
      success: false,
      error: "Une adresse est requise pour la livraison.",
    };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, error: "Vous devez être connecté pour commander." };
  }

  const { data: storeOnlineRow } = await supabase
    .from("site_settings")
    .select("value")
    .eq("key", "STORE_ONLINE")
    .maybeSingle();
  if (storeOnlineRow && storeOnlineRow.value === false) {
    return {
      success: false,
      error: "La boutique en ligne est momentanément fermée aux commandes.",
    };
  }

  const branch = await getDefaultBranch();
  if (!branch) {
    return { success: false, error: "Aucune boutique active trouvée." };
  }

  const variantIds = input.lines.map((l) => l.variantId);
  const { data: variantsData, error: variantsError } = await supabase
    .from("product_variants")
    .select("*, product:products(*)")
    .in("id", variantIds)
    .eq("status", "published");

  if (variantsError || !variantsData || variantsData.length === 0) {
    return { success: false, error: "Produits introuvables ou indisponibles." };
  }
  const variants = variantsData as unknown as VariantWithProduct[];

  const nowIso = new Date().toISOString();
  const { data: promotions } = await supabase
    .from("promotions")
    .select("*")
    .eq("status", "active")
    .lte("start_at", nowIso)
    .gt("end_at", nowIso)
    .in(
      "product_id",
      variants.map((v) => v.product?.id).filter((id): id is string => Boolean(id)),
    );

  const hasAgeRestricted = variants.some((v) => v.product?.age_restricted);
  if (hasAgeRestricted && !input.ageSelfDeclared) {
    return {
      success: false,
      error: "Merci de confirmer que vous avez 18 ans ou plus.",
    };
  }

  const variantById = new Map<string, VariantWithProduct>(
    variants.map((v) => [v.id, v]),
  );

  let totalAgorot = 0;
  const nonRestrictedItems: {
    variant: VariantWithProduct;
    quantity: number;
    finalPrice: number;
    promoPrice: number | null;
  }[] = [];
  const restrictedItems: {
    variant: VariantWithProduct;
    quantity: number;
    finalPrice: number;
    promoPrice: number | null;
  }[] = [];

  for (const line of input.lines) {
    const variant = variantById.get(line.variantId);
    if (!variant || variant.regular_price_agorot == null) continue;

    const promo = promotions?.find(
      (p) =>
        p.product_id === variant.product?.id &&
        (p.variant_id == null || p.variant_id === variant.id),
    );
    const finalPrice = promo ? promo.promo_price_agorot : variant.regular_price_agorot;
    totalAgorot += finalPrice * line.quantity;

    const bucket = variant.product?.age_restricted
      ? restrictedItems
      : nonRestrictedItems;
    bucket.push({
      variant,
      quantity: line.quantity,
      finalPrice,
      promoPrice: promo ? promo.promo_price_agorot : null,
    });
  }

  if (nonRestrictedItems.length === 0 && restrictedItems.length === 0) {
    return { success: false, error: "Panier vide ou produits invalides." };
  }

  // First-purchase discount: eligible only if the customer has never placed
  // an order before AND has never been issued a WELCOME20 entitlement
  // (the unique (user_id, code) constraint on `discount_entitlements` is the
  // real backstop against reuse — this is just the pre-check).
  const [{ count: previousOrderCount }, { data: existingEntitlement }, settings] =
    await Promise.all([
      supabase
        .from("orders")
        .select("id", { count: "exact", head: true })
        .eq("user_id", user.id),
      supabase
        .from("discount_entitlements")
        .select("id")
        .eq("user_id", user.id)
        .eq("code", "WELCOME20")
        .maybeSingle(),
      getSiteSettings(),
    ]);

  const isFirstPurchaseEligible =
    (previousOrderCount ?? 0) === 0 && !existingEntitlement;
  const discountPercent = settings.CLUB_WELCOME_DISCOUNT_PERCENT;
  const discountAgorot = isFirstPurchaseEligible
    ? Math.round((totalAgorot * discountPercent) / 100)
    : 0;
  const discountLabel = isFirstPurchaseEligible
    ? `Réduction bienvenue -${discountPercent}%`
    : null;
  totalAgorot -= discountAgorot;

  const deliveryFeeAgorot =
    input.fulfillmentType === "delivery" ? settings.DELIVERY_FEE_AGOROT : 0;
  totalAgorot += deliveryFeeAgorot;

  const { data: order, error: orderError } = await supabase
    .from("orders")
    .insert({
      user_id: user.id,
      branch_id: branch.id,
      channel: "web",
      status: "submitted",
      customer_name: input.customerName,
      customer_phone: input.customerPhone,
      fulfillment_type: input.fulfillmentType,
      delivery_address:
        input.fulfillmentType === "delivery" ? input.deliveryAddress : null,
      customer_notes: input.customerNotes || null,
      age_self_declared: input.ageSelfDeclared,
      total_agorot: totalAgorot,
      discount_agorot: discountAgorot,
      discount_label: discountLabel,
    })
    .select("id")
    .single();

  if (orderError || !order) {
    return { success: false, error: "Impossible de créer la commande." };
  }
  const orderId = order.id;

  async function insertGroup(
    groupType: "NON_RESTRICTED" | "AGE_RESTRICTED",
    items: typeof nonRestrictedItems,
  ) {
    if (items.length === 0) return;

    const { data: group, error: groupError } = await supabase
      .from("order_fulfillment_groups")
      .insert({
        order_id: orderId,
        group_type: groupType,
        food_status: groupType === "NON_RESTRICTED" ? "SUBMITTED" : null,
        alcohol_status:
          groupType === "AGE_RESTRICTED" ? "PENDING_AGE_VERIFICATION" : null,
      })
      .select("id")
      .single();

    if (groupError || !group) throw new Error("group_insert_failed");

    const itemRows = items.map((item) => ({
      order_id: orderId,
      fulfillment_group_id: group.id,
      product_id: item.variant.product?.id ?? null,
      variant_id: item.variant.id,
      product_name_snapshot:
        item.variant.product?.name_fr || item.variant.product?.name_he || "Produit",
      variant_label_snapshot: item.variant.label,
      regular_price_agorot_snapshot: item.variant.regular_price_agorot!,
      promo_price_agorot_snapshot: item.promoPrice,
      final_price_agorot_snapshot: item.finalPrice,
      quantity: item.quantity,
    }));

    const { error: itemsError } = await supabase
      .from("order_items")
      .insert(itemRows);
    if (itemsError) throw new Error("items_insert_failed");

    if (groupType === "AGE_RESTRICTED") {
      const { error: ageError } = await supabase
        .from("age_verifications")
        .insert({
          order_id: orderId,
          fulfillment_group_id: group.id,
          status: "PENDING",
        });
      if (ageError) throw new Error("age_verification_insert_failed");
    }
  }

  try {
    await insertGroup("NON_RESTRICTED", nonRestrictedItems);
    await insertGroup("AGE_RESTRICTED", restrictedItems);
  } catch {
    // Best-effort cleanup: remove the shell order if items failed to attach,
    // so no empty/broken order is left in the customer's history.
    await supabase.from("orders").delete().eq("id", orderId);
    return {
      success: false,
      error: "Une erreur est survenue pendant la création de la commande.",
    };
  }

  if (isFirstPurchaseEligible) {
    // `discount_entitlements` writes are staff-only under RLS by design —
    // this is the one legitimate system-issued write, so it goes through
    // the service-role client rather than loosening the policy for
    // customers. Best-effort: a failure here doesn't undo the discount
    // already applied to the order, it just means the audit row is missing.
    const serviceClient = createServiceRoleClient();
    await serviceClient.from("discount_entitlements").insert({
      user_id: user.id,
      code: "WELCOME20",
      discount_percent: discountPercent,
      status: "REDEEMED",
      redeemed_at: new Date().toISOString(),
      order_id: orderId,
    });
  }

  // Decrement remaining_quantity for quantity-limited promotions
  // Use atomic update to prevent race conditions
  const promotionIds = promotions?.map((p) => p.id) ?? [];
  for (const promoId of promotionIds) {
    const promo = promotions!.find((p) => p.id === promoId);
    if (promo && promo.remaining_quantity != null && promo.remaining_quantity > 0) {
      const quantityUsed = nonRestrictedItems
        .concat(restrictedItems)
        .filter((item) => {
          const itemPromo = promotions!.find(
            (p) =>
              p.product_id === item.variant.product?.id &&
              (p.variant_id == null || p.variant_id === item.variant.id),
          );
          return itemPromo?.id === promoId;
        })
        .reduce((sum, item) => sum + item.quantity, 0);

      if (quantityUsed > 0) {
        // Atomic decrement using raw SQL to prevent race conditions
        const { error: decrementError } = await supabase.rpc('decrement_promotion_quantity', {
          promotion_id: promoId,
          decrement_by: quantityUsed
        } as any);

        if (decrementError) {
          // Log error but don't fail the order - this is best-effort
          console.error(`Failed to decrement remaining_quantity for promotion ${promoId}:`, decrementError);
        }
      }
    }
  }

  return { success: true, orderId };
}
