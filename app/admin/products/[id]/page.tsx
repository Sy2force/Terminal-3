import { notFound } from "next/navigation";
import { requireAdminPermission } from "@/lib/admin/auth";
import { getAllCategories } from "@/lib/data/categories";
import { getProductById } from "@/lib/data/products";
import { ProductForm } from "@/components/admin/product-form";

export default async function EditProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireAdminPermission("catalog.products");
  const { id } = await params;

  const [product, categories] = await Promise.all([
    getProductById(id),
    getAllCategories(),
  ]);

  if (!product) notFound();

  return (
    <div className="space-y-6">
      <h1 className="font-serif text-2xl text-ivory">Modifier le produit</h1>
      <ProductForm categories={categories} initial={product} />
    </div>
  );
}
