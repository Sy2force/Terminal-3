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
        <h1 className="font-serif text-2xl text-ivory">Catégories</h1>
        <Link
          href="/admin/categories/new"
          className="rounded-full bg-champagne px-5 py-2 text-sm font-semibold text-obsidian transition-colors hover:bg-soft-gold"
        >
          Nouvelle catégorie
        </Link>
      </div>

      <div className="overflow-hidden rounded-sm border border-white/5">
        <table className="w-full text-left text-sm">
          <thead className="bg-graphite text-ivory/70">
            <tr>
              <th className="px-4 py-3 font-normal">Ordre</th>
              <th className="px-4 py-3 font-normal">Slug</th>
              <th className="px-4 py-3 font-normal">Nom</th>
              <th className="px-4 py-3 font-normal">Parent</th>
              <th className="px-4 py-3 font-normal">État</th>
              <th className="px-4 py-3 font-normal text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {categories.map((category) => (
              <tr key={category.id} className="hover:bg-white/[0.02]">
                <td className="px-4 py-3 text-muted-grey">{category.display_order}</td>
                <td className="px-4 py-3 font-medium text-ivory">{category.slug}</td>
                <td className="px-4 py-3 text-ivory/80">
                  {category.name_fr || category.name_he}
                </td>
                <td className="px-4 py-3 text-muted-grey">
                  {categories.find((c) => c.id === category.parent_id)?.name_fr ??
                    categories.find((c) => c.id === category.parent_id)?.name_he ??
                    "—"}
                </td>
                <td className="px-4 py-3">
                  {category.is_active ? (
                    <span className="text-xs text-champagne">Active</span>
                  ) : (
                    <span className="text-xs text-muted-grey">Inactive</span>
                  )}
                </td>
                <td className="px-4 py-3 text-right">
                  <CategoryRowActions categoryId={category.id} />
                </td>
              </tr>
            ))}
            {categories.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-muted-grey">
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
