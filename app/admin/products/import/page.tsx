import { requireAdminPermission } from "@/lib/admin/auth";
import { CsvImportForm } from "@/components/admin/csv-import-form";

export default async function ProductsImportPage() {
  await requireAdminPermission("catalog.products");

  return (
    <div className="max-w-2xl space-y-6">
      <h1 className="font-serif text-2xl text-ivory">Import CSV de produits</h1>
      <CsvImportForm />
    </div>
  );
}
