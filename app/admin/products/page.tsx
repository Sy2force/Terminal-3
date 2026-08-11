import Link from "next/link";
import Image from "next/image";
import { requireAdminPermission } from "@/lib/admin/auth";
import { getAllProducts } from "@/lib/data/products";
import { getAllCategories } from "@/lib/data/categories";
import { formatAgorot } from "@/lib/money";
import { ProductRowActions } from "@/components/admin/product-row-actions";
import { ProductsFilterBar } from "@/components/admin/products-filter-bar";

export default async function AdminProductsPage() {
  await requireAdminPermission("catalog.products");
  const [products, categories] = await Promise.all([
    getAllProducts(),
    getAllCategories(),
  ]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="font-serif text-2xl text-ivory">Produits</h1>
        <Link
          href="/admin/products/new"
          className="rounded-full bg-champagne px-5 py-2 text-sm font-semibold text-obsidian transition-colors hover:bg-soft-gold"
        >
          Nouveau produit
        </Link>
      </div>

      <ProductsFilterBar products={products} />

      <div className="overflow-hidden rounded-sm border border-white/5">
        <table className="w-full text-left text-sm">
          <thead className="bg-graphite text-ivory/70">
            <tr>
              <th className="px-4 py-3 font-normal">Photo</th>
              <th className="px-4 py-3 font-normal">Nom</th>
              <th className="px-4 py-3 font-normal">Catégorie</th>
              <th className="px-4 py-3 font-normal">Prix</th>
              <th className="px-4 py-3 font-normal">Statut</th>
              <th className="px-4 py-3 font-normal">18+</th>
              <th className="px-4 py-3 font-normal text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {products.map((product) => {
              const category = categories.find((c) => c.id === product.category_id);
              const cover = product.media.find((m) => m.kind === "COVER") ?? product.media[0];
              const defaultPrice =
                product.base_price_agorot ??
                product.variants.find((v) => v.is_default)?.regular_price_agorot ??
                product.variants[0]?.regular_price_agorot;
              const hasPhoto = Boolean(cover?.url);

              return (
                <tr key={product.id} className="hover:bg-white/[0.02]" data-has-photo={hasPhoto}>
                  <td className="px-4 py-3">
                    <div className="relative h-12 w-12 overflow-hidden rounded-sm bg-warm-black">
                      {cover ? (
                        <Image src={cover.url} alt={cover.alt ?? ""} fill className="object-contain" />
                      ) : (
                        <span className="flex h-full w-full items-center justify-center text-[10px] text-amber-400">
                          ⚠
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3 font-medium text-ivory">
                    {product.name_fr || product.name_he}
                    {!hasPhoto && (
                      <span className="ml-2 text-[10px] uppercase tracking-widest text-amber-400">
                        Photo manquante
                      </span>
                    )}
                    {product.product_type === "PLATTER" && (
                      <span className="ml-2 text-[10px] uppercase tracking-widest text-champagne">
                        Plateau
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-muted-grey">
                    {category?.name_fr || category?.name_he || "—"}
                  </td>
                  <td className="px-4 py-3 text-ivory/80">
                    {defaultPrice ? formatAgorot(defaultPrice) : "—"}
                  </td>
                  <td className="px-4 py-3">
                    <StatusBadge status={product.status} />
                  </td>
                  <td className="px-4 py-3">
                    {product.age_restricted ? <span className="text-amber-400">18+</span> : "—"}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <ProductRowActions productId={product.id} slug={product.slug} />
                  </td>
                </tr>
              );
            })}
            {products.length === 0 && (
              <tr>
                <td colSpan={7} className="px-4 py-8 text-center text-muted-grey">
                  Aucun produit.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    published: "text-champagne",
    draft: "text-muted-grey",
    archived: "text-amber-400",
  };
  const labels: Record<string, string> = {
    published: "Publié",
    draft: "Brouillon",
    archived: "Archivé",
  };
  return <span className={`text-xs ${styles[status] ?? "text-ivory"}`}>{labels[status] ?? status}</span>;
}
