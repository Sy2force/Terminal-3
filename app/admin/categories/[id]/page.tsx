import { notFound } from "next/navigation";
import { requireAdminPermission } from "@/lib/admin/auth";
import { getAllCategories, getCategoryById } from "@/lib/data/categories";
import { CategoryForm } from "@/components/admin/category-form";

export default async function EditCategoryPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireAdminPermission("catalog.categories");
  const { id } = await params;

  const [category, categories] = await Promise.all([
    getCategoryById(id),
    getAllCategories(),
  ]);

  if (!category) notFound();

  return (
    <div className="space-y-6">
      <h1 className="font-serif text-2xl text-ivory">Modifier la catégorie</h1>
      <CategoryForm categories={categories} initial={category} />
    </div>
  );
}
