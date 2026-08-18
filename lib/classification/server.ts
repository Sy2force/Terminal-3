"use server";

import { classifyProduct } from "./index";
import { requireAdminPermission } from "@/lib/admin/auth";
import type { ClassificationResult } from "./types";

export async function classifyProductAction(name: string): Promise<ClassificationResult> {
  await requireAdminPermission("catalog.products");

  if (!name || name.trim().length === 0) {
    throw new Error("Le nom du produit est requis.");
  }

  // In a later phase this can merge database classification_rules with defaults.
  return classifyProduct(name);
}
