import { requireAdminPermission } from "@/lib/admin/auth";
import { getAllHomepageSections } from "@/lib/data/homepage";
import { getCategories } from "@/lib/data/catalog";
import { HomepageCMS } from "@/components/admin/homepage-cms";

export default async function AdminHomepagePage() {
  await requireAdminPermission("marketing.content");

  const [sections, categories] = await Promise.all([
    getAllHomepageSections(),
    getCategories(),
  ]);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-serif text-2xl text-noir-profond">Page d&apos;accueil</h1>
        <p className="mt-1 text-sm text-gris-chaud">
          Activez, réorganisez et modifiez les sections de la page d&apos;accueil.
          Les changements sont appliqués immédiatement.
        </p>
      </div>

      <HomepageCMS sections={sections} categories={categories} />
    </div>
  );
}
