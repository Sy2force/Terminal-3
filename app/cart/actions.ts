"use server";

import { revalidatePath } from "next/cache";
import {
  getMyCart,
  upsertCartLine,
  updateCartLineQuantity,
  mergeGuestCart,
  convertCart,
} from "@/lib/data/cart";

export async function getMyCartAction() {
  return getMyCart();
}

export async function addToCartAction(productSlug: string, variantId: string | null, quantity = 1) {
  const result = await upsertCartLine(productSlug, variantId, quantity);
  revalidatePath("/cart");
  revalidatePath("/compte");
  return result;
}

export async function updateCartQuantityAction(lineId: string, quantity: number) {
  const result = await updateCartLineQuantity(lineId, quantity);
  revalidatePath("/cart");
  return result;
}

export async function mergeGuestCartAction(
  guestLines: { productSlug: string; variantId: string | null; quantity: number }[],
) {
  const result = await mergeGuestCart(guestLines);
  revalidatePath("/cart");
  revalidatePath("/compte");
  return result;
}

export async function convertCartAction(orderId: string) {
  await convertCart(orderId);
  revalidatePath("/cart");
}
