"use server";

import { searchProducts } from "@/lib/data/catalog";
import type { ProductWithMedia } from "@/lib/data/catalog";

export async function searchProductsAction(query: string): Promise<ProductWithMedia[]> {
  if (!query.trim()) return [];
  return searchProducts(query);
}
