import { requireAdminPermission } from "@/lib/admin/auth";
import { getBrands } from "./actions";
import { BrandsManager } from "@/components/admin/brands-manager";

export default async function BrandsPage() {
  await requireAdminPermission("catalog.products");
  const brands = await getBrands();

  return (
    <div className="mx-auto max-w-5xl px-6 py-12">
      <h1 className="font-serif text-2xl text-noir-profond">Marques</h1>
      <p className="mt-1 text-sm text-gris-chaud">Gestion des marques et logos.</p>
      <BrandsManager brands={brands} />
    </div>
  );
}
