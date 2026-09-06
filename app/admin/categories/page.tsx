import Link from "next/link";
import { requireAdminPermission } from "@/lib/admin/auth";
import { getAllCategories } from "@/lib/data/categories";
import { CategoryRowActions } from "@/components/admin/category-row-actions";

export default async function AdminCategoriesPage() {
  await requireAdminPermission("catalog.categories");
  const categories = await getAllCategories();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="font-serif text-2xl text-noir-profond">Catégories</h1>
        <Link
          href="/admin/categories/new"
          className="rounded-full bg-or-principal px-5 py-2 text-sm font-semibold text-noir-profond transition-colors hover:bg-or-clair"
        >
          Nouvelle catégorie
        </Link>
      </div>

      <div className="overflow-hidden rounded-sm border border-beige-fonce">
        <table className="w-full text-left text-sm">
          <thead className="bg-white text-noir-profond/70">
            <tr>
              <th className="px-4 py-3 font-normal">Ordre</th>
              <th className="px-4 py-3 font-normal">Slug</th>
              <th className="px-4 py-3 font-normal">Nom</th>
              <th className="px-4 py-3 font-normal">Parent</th>
              <th className="px-4 py-3 font-normal">État</th>
              <th className="px-4 py-3 font-normal text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-beige-fonce">
            {categories.map((category) => (
              <tr key={category.id} className="hover:bg-white/[0.02]">
                <td className="px-4 py-3 text-gris-chaud">{category.display_order}</td>
                <td className="px-4 py-3 font-medium text-noir-profond">{category.slug}</td>
                <td className="px-4 py-3 text-noir-profond/80">
                  {category.name_fr || category.name_he}
                </td>
                <td className="px-4 py-3 text-gris-chaud">
                  {categories.find((c) => c.id === category.parent_id)?.name_fr ??
                    categories.find((c) => c.id === category.parent_id)?.name_he ??
                    "—"}
                </td>
                <td className="px-4 py-3">
                  {category.is_active ? (
                    <span className="text-xs text-or-principal">Active</span>
                  ) : (
                    <span className="text-xs text-gris-chaud">Inactive</span>
                  )}
                </td>
                <td className="px-4 py-3 text-right">
                  <CategoryRowActions categoryId={category.id} />
                </td>
              </tr>
            ))}
            {categories.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-gris-chaud">
                  Aucune catégorie.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
