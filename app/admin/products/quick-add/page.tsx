import { requireAdminPermission } from "@/lib/admin/auth";
import { getAllCategories } from "@/lib/data/categories";
import { QuickAddProductForm } from "@/components/admin/quick-add-product-form";

export default async function QuickAddProductPage() {
  await requireAdminPermission("catalog.products");
  const categories = await getAllCategories();

  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="mb-6 font-serif text-2xl text-ivory">Ajout rapide d’un produit</h1>
      <QuickAddProductForm categories={categories} />
    </div>
  );
}
