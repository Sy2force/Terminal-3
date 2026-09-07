import Link from "next/link";
import { requireAdminPermission } from "@/lib/admin/auth";
import { getAllProducts } from "@/lib/data/products";
import { getAllCategories } from "@/lib/data/categories";
import { ProductsTableClient } from "@/components/admin/products-table-client";
import { ProductsClassificationClient } from "@/components/admin/products-classification-client";
import { PlusCircle, Upload, Download } from "lucide-react";
import { clsx } from "clsx";

interface AdminProductsPageProps {
  searchParams: Promise<{ tab?: string; success?: string }>;
}

export default async function AdminProductsPage({ searchParams }: AdminProductsPageProps) {
  await requireAdminPermission("catalog.products");
  const { tab, success } = await searchParams;
  const isClassification = tab === "classification";

  const [products, categories] = isClassification
    ? [null, null]
    : await Promise.all([getAllProducts(), getAllCategories()]);

  const stats = {
    total: products?.length ?? 0,
    published: products?.filter((p) => p.status === "published").length ?? 0,
    draft: products?.filter((p) => p.status === "draft").length ?? 0,
    noPhoto: products?.filter((p) => !p.media.some((m) => m.url)).length ?? 0,
    promotions: products?.filter((p) => p.compare_at_price_agorot).length ?? 0,
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <h1 className="font-serif text-3xl text-noir-profond">Produits</h1>
          <p className="mt-1 text-sm text-gris-chaud">
            Gérez le catalogue, les stocks, les photos et les promotions.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Link
            href="/admin/products/import"
            className="inline-flex items-center gap-2 rounded-sm border border-beige-fonce bg-white px-4 py-2 text-sm font-medium text-noir-profond hover:bg-creme"
          >
            <Upload className="h-4 w-4" />
            Import CSV
          </Link>
          <a
            href="/api/admin/export/products"
            download
            className="inline-flex items-center gap-2 rounded-sm border border-beige-fonce bg-white px-4 py-2 text-sm font-medium text-noir-profond hover:bg-creme"
          >
            <Download className="h-4 w-4" />
            Export CSV
          </a>
          <Link
            href="/admin/products/new"
            className="inline-flex items-center gap-2 rounded-sm bg-or-principal px-4 py-2 text-sm font-semibold text-noir-profond hover:bg-or-clair"
          >
            <PlusCircle className="h-4 w-4" />
            Nouveau produit
          </Link>
        </div>
      </div>

      {!isClassification && (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
          <div className="rounded-xl border border-beige-fonce bg-white p-4 shadow-sm">
            <p className="text-xs text-gris-chaud">Total</p>
            <p className="mt-1 font-serif text-2xl text-noir-profond">{stats.total}</p>
          </div>
          <div className="rounded-xl border border-beige-fonce bg-white p-4 shadow-sm">
            <p className="text-xs text-gris-chaud">Publiés</p>
            <p className="mt-1 font-serif text-2xl text-green-700">{stats.published}</p>
          </div>
          <div className="rounded-xl border border-beige-fonce bg-white p-4 shadow-sm">
            <p className="text-xs text-gris-chaud">Brouillons</p>
            <p className="mt-1 font-serif text-2xl text-slate-700">{stats.draft}</p>
          </div>
          <div className="rounded-xl border border-beige-fonce bg-white p-4 shadow-sm">
            <p className="text-xs text-gris-chaud">Sans photo</p>
            <p className="mt-1 font-serif text-2xl text-amber-700">{stats.noPhoto}</p>
          </div>
          <div className="rounded-xl border border-beige-fonce bg-white p-4 shadow-sm">
            <p className="text-xs text-gris-chaud">Promotions</p>
            <p className="mt-1 font-serif text-2xl text-bordeaux-principal">{stats.promotions}</p>
          </div>
        </div>
      )}

      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex gap-4 border-b border-beige-fonce pb-1">
          <Link
            href="/admin/products"
            className={clsx(
              "pb-2 text-sm font-medium transition-colors",
              !isClassification ? "border-b-2 border-or-principal text-noir-profond" : "text-gris-chaud hover:text-noir-profond",
            )}
          >
            Catalogue
          </Link>
          <Link
            href="/admin/products?tab=classification"
            className={clsx(
              "pb-2 text-sm font-medium transition-colors",
              isClassification ? "border-b-2 border-or-principal text-noir-profond" : "text-gris-chaud hover:text-noir-profond",
            )}
          >
            Règles de classement
          </Link>
        </div>
      </div>

      {isClassification ? (
        <ProductsClassificationClient />
      ) : (
        <ProductsTableClient products={products!} categories={categories!} success={success} />
      )}
    </div>
  );
}
