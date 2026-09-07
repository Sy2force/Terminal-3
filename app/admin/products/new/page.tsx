import { requireAdminPermission } from "@/lib/admin/auth";
import { getAllCategories } from "@/lib/data/categories";
import { ProductForm } from "@/components/admin/product-form";

export default async function NewProductPage() {
  await requireAdminPermission("catalog.products");
  const categories = await getAllCategories();

  return (
    <div className="space-y-6">
      <h1 className="font-serif text-2xl text-noir-profond">Nouveau produit</h1>
      <ProductForm categories={categories} />
    </div>
  );
}
