import { requireAdminPermission } from "@/lib/admin/auth";
import { getNavigationMenus } from "./actions";
import { NavigationManager } from "@/components/admin/navigation-manager";

export default async function NavigationPage() {
  await requireAdminPermission("marketing.content");
  const menus = await getNavigationMenus();

  return (
    <div className="mx-auto max-w-5xl px-6 py-12">
      <h1 className="font-serif text-2xl text-noir-profond">Navigation</h1>
      <p className="mt-1 text-sm text-gris-chaud">Menus, liens et pied de page.</p>
      <NavigationManager menus={menus} />
    </div>
  );
}
