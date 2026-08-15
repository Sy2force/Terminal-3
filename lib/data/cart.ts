import "server-only";
import { createClient } from "@/lib/supabase/server";
import { getProductBySlug, type ProductWithMedia } from "@/lib/data/catalog";

export interface ServerCartLine {
  id: string;
  productId: string;
  variantId: string | null;
  productName: string;
  variantLabel: string | null;
  quantity: number;
  displayPriceAgorot: number | null;
  imageUrl: string | null;
  ageRestricted: boolean;
}

export interface ServerCart {
  cartId: string | null;
  lines: ServerCartLine[];
  itemCount: number;
  subtotalAgorot: number;
  hasAgeRestrictedItem: boolean;
}

function defaultVariantId(product: ProductWithMedia): string | null {
  const def = product.variants.find((v) => v.is_default) ?? product.variants[0];
  return def?.id ?? null;
}

function linePriceAgorot(product: ProductWithMedia, variantId: string | null): number | null {
  const variant = product.variants.find((v) => v.id === variantId) ?? product.variants[0];
  if (!variant) return null;
  return variant.regular_price_agorot ?? product.base_price_agorot ?? null;
}

/**
 * Returns the authenticated user's active cart, recomputing every price from
 * the live `product_variants` table. A null `cartId` means no active cart yet.
 */
export async function getMyCart(): Promise<ServerCart> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return { cartId: null, lines: [], itemCount: 0, subtotalAgorot: 0, hasAgeRestrictedItem: false };
  }

  const { data: cart } = await supabase
    .from("carts")
    .select("id")
    .eq("user_id", user.id)
    .eq("status", "active")
    .maybeSingle();

  if (!cart) {
    return { cartId: null, lines: [], itemCount: 0, subtotalAgorot: 0, hasAgeRestrictedItem: false };
  }

  const { data: items } = await supabase.from("cart_items").select("*").eq("cart_id", cart.id);
  const productIds = [...new Set((items ?? []).map((i) => i.product_id))];
  const { data: products } = await supabase
    .from("products")
    .select("*, variants:product_variants(*), media:product_media(*)")
    .in("id", productIds);

  const productsById = new Map<string, ProductWithMedia>();
  for (const p of (products as unknown as ProductWithMedia[] | null) ?? []) {
    productsById.set(p.id, p);
  }

  const lines: ServerCartLine[] = [];
  let subtotalAgorot = 0;
  let hasAgeRestrictedItem = false;

  for (const item of items ?? []) {
    const product = productsById.get(item.product_id);
    if (!product) continue;
    const displayPrice = linePriceAgorot(product, item.variant_id);
    const total = (displayPrice ?? 0) * item.quantity;
    subtotalAgorot += total;
    hasAgeRestrictedItem ||= product.age_restricted;
    const variant = product.variants.find((v) => v.id === item.variant_id);
    lines.push({
      id: item.id,
      productId: item.product_id,
      variantId: item.variant_id,
      productName: product.name_fr ?? product.name_he ?? "Produit",
      variantLabel: variant?.label ?? null,
      quantity: item.quantity,
      displayPriceAgorot: displayPrice,
      imageUrl: product.media?.find((m) => m.kind === "COVER")?.url ?? null,
      ageRestricted: product.age_restricted,
    });
  }

  return {
    cartId: cart.id,
    lines,
    itemCount: lines.reduce((s, l) => s + l.quantity, 0),
    subtotalAgorot,
    hasAgeRestrictedItem,
  };
}

/**
 * Add or update a cart line. Validates the product and merges quantities.
 */
export async function upsertCartLine(
  productSlug: string,
  variantId: string | null,
  quantity: number,
): Promise<{ success: boolean; cartId: string | null; error?: string }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return { success: false, cartId: null, error: "Vous devez être connecté." };
  }
  if (quantity <= 0) {
    return { success: false, cartId: null, error: "Quantité invalide." };
  }

  const product = await getProductBySlug(productSlug);
  if (!product || product.status !== "published") {
    return { success: false, cartId: null, error: "Produit introuvable ou indisponible." };
  }

  const targetVariantId = variantId ?? defaultVariantId(product);
  if (!targetVariantId) {
    return { success: false, cartId: null, error: "Aucune variante disponible." };
  }

  const { data: existingCart } = await supabase
    .from("carts")
    .select("id")
    .eq("user_id", user.id)
    .eq("status", "active")
    .maybeSingle();

  let cartId = existingCart?.id;
  if (!cartId) {
    const { data: created } = await supabase
      .from("carts")
      .insert({ user_id: user.id, status: "active", currency: "ILS" })
      .select("id")
      .single();
    if (!created) {
      return { success: false, cartId: null, error: "Impossible de créer le panier." };
    }
    cartId = created.id;
  }

  const { data: existingItem } = await supabase
    .from("cart_items")
    .select("id, quantity")
    .eq("cart_id", cartId)
    .eq("product_id", product.id)
    .eq("variant_id", targetVariantId)
    .maybeSingle();

  if (existingItem) {
    const newQuantity = existingItem.quantity + quantity;
    await supabase.from("cart_items").update({ quantity: newQuantity }).eq("id", existingItem.id);
  } else {
    await supabase.from("cart_items").insert({
      cart_id: cartId,
      product_id: product.id,
      variant_id: targetVariantId,
      quantity,
    });
  }

  return { success: true, cartId };
}

/**
 * Update a cart line quantity. quantity <= 0 removes the line.
 */
export async function updateCartLineQuantity(
  lineId: string,
  quantity: number,
): Promise<{ success: boolean; error?: string }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return { success: false, error: "Vous devez être connecté." };
  }

  const { data: item } = await supabase
    .from("cart_items")
    .select("id, cart:carts(id, user_id)")
    .eq("id", lineId)
    .maybeSingle();

  const cartUserId = (item as unknown as { cart: { user_id: string } } | null)?.cart?.user_id;
  if (cartUserId !== user.id) {
    return { success: false, error: "Accès refusé." };
  }

  if (quantity <= 0) {
    await supabase.from("cart_items").delete().eq("id", lineId);
  } else {
    await supabase.from("cart_items").update({ quantity }).eq("id", lineId);
  }
  return { success: true };
}

/**
 * Merge a guest cart (array of lines) into the user's server cart.
 * Each product is re-validated server-side. Returns the new server cart.
 */
export async function mergeGuestCart(
  guestLines: { productSlug: string; variantId: string | null; quantity: number }[],
): Promise<{ success: boolean; cartId: string | null; skipped: string[]; error?: string }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return { success: false, cartId: null, skipped: [], error: "Vous devez être connecté." };
  }

  const { data: existingCart } = await supabase
    .from("carts")
    .select("id")
    .eq("user_id", user.id)
    .eq("status", "active")
    .maybeSingle();

  const { data: created } = await supabase
    .from("carts")
    .insert({ user_id: user.id, status: "active", currency: "ILS" })
    .select("id")
    .single();

  const cartId = existingCart?.id ?? created?.id;
  if (!cartId) {
    return { success: false, cartId: null, skipped: [], error: "Impossible de préparer le panier." };
  }

  const skipped: string[] = [];

  for (const line of guestLines) {
    const product = await getProductBySlug(line.productSlug);
    if (!product || product.status !== "published") {
      skipped.push(line.productSlug);
      continue;
    }
    const targetVariantId = line.variantId ?? defaultVariantId(product);
    if (!targetVariantId) {
      skipped.push(line.productSlug);
      continue;
    }

    const { data: existingItem } = await supabase
      .from("cart_items")
      .select("id, quantity")
      .eq("cart_id", cartId)
      .eq("product_id", product.id)
      .eq("variant_id", targetVariantId)
      .maybeSingle();

    if (existingItem) {
      await supabase
        .from("cart_items")
        .update({ quantity: existingItem.quantity + line.quantity })
        .eq("id", existingItem.id);
    } else {
      await supabase.from("cart_items").insert({
        cart_id: cartId,
        product_id: product.id,
        variant_id: targetVariantId,
        quantity: line.quantity,
      });
    }
  }

  return { success: true, cartId, skipped };
}

/**
 * Convert the active cart after a successful order.
 */
export async function convertCart(orderId: string): Promise<void> {
  // orderId is reserved for future audit-log linkage; kept in signature for API stability.
  void orderId;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return;

  const { data: cart } = await supabase
    .from("carts")
    .select("id")
    .eq("user_id", user.id)
    .eq("status", "active")
    .maybeSingle();

  if (cart) {
    await supabase.from("carts").update({ status: "converted" }).eq("id", cart.id);
  }
}
