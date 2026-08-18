import Link from "next/link";
import { requireAdminPermission } from "@/lib/admin/auth";
import { getAllProducts } from "@/lib/data/products";
import { getAllCategories } from "@/lib/data/categories";
import { ProductsFilterBar } from "@/components/admin/products-filter-bar";
import { ProductsTableClient } from "@/components/admin/products-table-client";
import { ProductsClassificationClient } from "@/components/admin/products-classification-client";
import { clsx } from "clsx";

interface AdminProductsPageProps {
  searchParams: Promise<{ tab?: string }>;
}

export default async function AdminProductsPage({ searchParams }: AdminProductsPageProps) {
  await requireAdminPermission("catalog.products");
  const { tab } = await searchParams;
  const isClassification = tab === "classification";

  const [products, categories] = isClassification
    ? [null, null]
    : await Promise.all([getAllProducts(), getAllCategories()]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="font-serif text-2xl text-ivory">Produits</h1>
        <div className="flex items-center gap-3">
          {!isClassification && (
            <>
              <Link
                href="/admin/products/import"
                className="rounded-full border border-champagne/40 px-5 py-2 text-sm font-medium text-champagne transition-colors hover:bg-champagne hover:text-obsidian"
              >
                Import CSV
              </Link>
              <Link
                href="/admin/products/new"
                className="rounded-full bg-champagne px-5 py-2 text-sm font-semibold text-obsidian transition-colors hover:bg-soft-gold"
              >
                Nouveau produit
              </Link>
            </>
          )}
        </div>
      </div>

      <div className="flex gap-4 border-b border-ivory/10 pb-1">
        <Link
          href="/admin/products"
          className={clsx(
            "pb-2 text-sm font-medium transition-colors",
            !isClassification ? "border-b-2 border-champagne text-ivory" : "text-ivory/60 hover:text-ivory",
          )}
        >
          Catalogue
        </Link>
        <Link
          href="/admin/products?tab=classification"
          className={clsx(
            "pb-2 text-sm font-medium transition-colors",
            isClassification ? "border-b-2 border-champagne text-ivory" : "text-ivory/60 hover:text-ivory",
          )}
        >
          Règles de classement
        </Link>
      </div>

      {isClassification ? (
        <ProductsClassificationClient />
      ) : (
        <>
          <ProductsFilterBar products={products!} />
          <ProductsTableClient products={products!} categories={categories!} />
        </>
      )}
    </div>
  );
}
