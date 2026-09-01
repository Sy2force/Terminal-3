"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { requireAdminPermission } from "@/lib/admin/auth";
import { createProduct } from "@/lib/data/products";
import { slugify } from "@/lib/classification/parser";

const QuickAddSchema = z.object({
  name_fr: z.string().min(1).max(120),
  name_he: z.string().optional(),
  brand: z.string().optional(),
  category_id: z.string().uuid(),
  sku: z.string().min(1).max(80),
  price_agorot: z.coerce.number().int().min(1),
  age_restricted: z.coerce.boolean(),
  status: z.enum(["published", "draft"]),
});

export type QuickAddFormState =
  | { ok: false; error: string; field?: string }
  | { ok: true; slug: string };

export async function quickAddProductAction(
  _prev: QuickAddFormState | null,
  formData: FormData,
): Promise<QuickAddFormState> {
  await requireAdminPermission("catalog.products");

  const parsed = QuickAddSchema.safeParse({
    name_fr: formData.get("name_fr"),
    name_he: formData.get("name_he"),
    brand: formData.get("brand"),
    category_id: formData.get("category_id"),
    sku: formData.get("sku"),
    price_agorot: formData.get("price_agorot"),
    age_restricted: formData.get("age_restricted") === "on",
    status: formData.get("status"),
  });

  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues.map((e) => e.message).join(" ; ") };
  }

  const { name_fr, name_he, brand, category_id, sku, price_agorot, age_restricted, status } = parsed.data;

  const supabase = await createClient();

  const { data: existingSku } = await supabase
    .from("product_variants")
    .select("id")
    .eq("sku", sku)
    .maybeSingle();

  if (existingSku) {
    return { ok: false, error: "Ce code/SKU est déjà utilisé par un autre produit.", field: "sku" };
  }

  const baseSlug = slugify(name_fr);
  if (!baseSlug) {
    return { ok: false, error: "Le nom du produit ne permet pas de générer une URL.", field: "name_fr" };
  }

  let slug = baseSlug;
  let suffix = 2;
  while ((await supabase.from("products").select("id").eq("slug", slug).maybeSingle()).data) {
    slug = `${baseSlug}-${suffix}`;
    suffix += 1;
  }

  const product = await createProduct(
    {
      slug,
      name_fr,
      name_he: name_he ?? name_fr,
      brand: brand ?? null,
      category_id,
      age_restricted,
      status,
      base_price_agorot: price_agorot,
    },
    [
      {
        label: "Unité",
        sku,
        regular_price_agorot: price_agorot,
        is_default: true,
        status,
      },
    ],
    [],
  );

  revalidatePath("/admin/products");
  redirect(`/admin/products/${product.id}`);
}
