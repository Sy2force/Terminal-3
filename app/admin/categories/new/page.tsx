import { requireAdminPermission } from "@/lib/admin/auth";
import { getAllCategories } from "@/lib/data/categories";
import { CategoryForm } from "@/components/admin/category-form";

export default async function NewCategoryPage() {
  await requireAdminPermission("catalog.categories");
  const categories = await getAllCategories();

  return (
    <div className="space-y-6">
      <h1 className="font-serif text-2xl text-ivory">Nouvelle catégorie</h1>
      <CategoryForm categories={categories} />
    </div>
  );
}
