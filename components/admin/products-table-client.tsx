"use client";

import { useState } from "react";
import { Package } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { formatAgorot } from "@/lib/money";
import { ProductRowActions } from "@/components/admin/product-row-actions";
import { ProductsBulkToolbar } from "@/components/admin/products-bulk-toolbar";
import type { CategoryRow } from "@/types/database";
import type { ProductWithDetails } from "@/lib/data/products";

const statusClasses: Record<string, string> = {
  published: "bg-green-100 text-green-800",
  draft: "bg-slate-200 text-slate-700",
  archived: "bg-amber-100 text-amber-800",
};

const statusLabels: Record<string, string> = {
  published: "Publié",
  draft: "Brouillon",
  archived: "Archivé",
};

const availabilityClasses: Record<string, string> = {
  IN_STOCK: "bg-green-100 text-green-800",
  LOW_STOCK: "bg-amber-100 text-amber-800",
  OUT_OF_STOCK: "bg-red-100 text-red-800",
  PRE_ORDER: "bg-sky-100 text-sky-800",
};

const availabilityLabels: Record<string, string> = {
  IN_STOCK: "En stock",
  LOW_STOCK: "Stock faible",
  OUT_OF_STOCK: "Rupture",
  PRE_ORDER: "Précommande",
};

export function ProductsTableClient({
  products,
  categories,
}: {
  products: ProductWithDetails[];
  categories: CategoryRow[];
}) {
  const [selected, setSelected] = useState<string[]>([]);

  function toggle(id: string) {
    setSelected((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  }

  function toggleAll() {
    setSelected((prev) => (prev.length === products.length ? [] : products.map((p) => p.id)));
  }

  return (
    <div className="space-y-4">
      <ProductsBulkToolbar selectedIds={selected} categories={categories} onDone={() => setSelected([])} />

      <div className="overflow-x-auto rounded-xl border border-beige-fonce bg-white shadow-sm">
        <table className="w-full min-w-[900px] text-left text-sm">
          <thead className="bg-creme text-gris-chaud">
            <tr>
              <th className="w-10 px-4 py-3">
                <input
                  type="checkbox"
                  checked={selected.length === products.length && products.length > 0}
                  onChange={toggleAll}
                  className="h-4 w-4 accent-or-principal"
                  aria-label="Tout sélectionner"
                />
              </th>
              <th className="px-4 py-3 font-medium">Photo</th>
              <th className="px-4 py-3 font-medium">Nom</th>
              <th className="px-4 py-3 font-medium">Catégorie</th>
              <th className="px-4 py-3 font-medium">Prix</th>
              <th className="px-4 py-3 font-medium">Stock</th>
              <th className="px-4 py-3 font-medium">Statut</th>
              <th className="px-4 py-3 font-medium">18+</th>
              <th className="px-4 py-3 text-right font-medium">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-beige-fonce">
            {products.map((product) => {
              const category = categories.find((c) => c.id === product.category_id);
              const cover = product.media.find((m) => m.kind === "COVER") ?? product.media[0];
              const defaultPrice =
                product.base_price_agorot ??
                product.variants.find((v) => v.is_default)?.regular_price_agorot ??
                product.variants[0]?.regular_price_agorot;
              const availability = (product.availability_status as string) || "IN_STOCK";

              return (
                <tr key={product.id} className="hover:bg-creme/60" data-has-photo={Boolean(cover?.url)}>
                  <td className="px-4 py-3">
                    <input
                      type="checkbox"
                      checked={selected.includes(product.id)}
                      onChange={() => toggle(product.id)}
                      className="h-4 w-4 accent-or-principal"
                      aria-label={`Sélectionner ${product.name_fr || product.name_he}`}
                    />
                  </td>
                  <td className="px-4 py-3">
                    <div className="relative h-12 w-12 overflow-hidden rounded-sm border border-beige-fonce bg-creme">
                      {cover?.url ? (
                        <Image src={cover.url} alt={cover.alt ?? ""} fill className="object-contain" sizes="48px" />
                      ) : (
                        <span className="flex h-full w-full items-center justify-center text-amber-700">
                          <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <rect x="3" y="3" width="18" height="18" rx="2" />
                            <circle cx="8.5" cy="8.5" r="1.5" />
                            <path d="M21 15l-5-5L5 21" />
                          </svg>
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <Link href={`/admin/products/${product.id}`} className="font-medium text-noir-profond hover:text-or-principal">
                      {product.name_fr || product.name_he}
                    </Link>
                    {product.product_type === "PLATTER" && (
                      <span className="ml-2 rounded-sm bg-or-principal/10 px-1.5 py-0.5 text-[10px] uppercase tracking-wider text-or-principal">
                        Plateau
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-gris-chaud">
                    {category?.name_fr || category?.name_he || "—"}
                  </td>
                  <td className="px-4 py-3 text-noir-profond">
                    {defaultPrice ? formatAgorot(defaultPrice) : "—"}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${availabilityClasses[availability] ?? "bg-slate-100 text-slate-700"}`}>
                      {availabilityLabels[availability] ?? availability}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${statusClasses[product.status] ?? "bg-slate-100 text-slate-700"}`}>
                      {statusLabels[product.status] ?? product.status}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    {product.age_restricted ? <span className="font-medium text-bordeaux-principal">18+</span> : "—"}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <ProductRowActions productId={product.id} slug={product.slug} />
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {products.length === 0 && (
        <div className="rounded-xl border border-beige-fonce bg-white p-12 text-center shadow-sm">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-creme text-gris-chaud">
            <Package className="h-8 w-8" />
          </div>
          <h3 className="font-serif text-xl text-noir-profond">Aucun produit pour le moment</h3>
          <p className="mt-2 text-sm text-gris-chaud">
            Ajoutez votre premier produit ou importez votre catalogue.
          </p>
          <div className="mt-6 flex items-center justify-center gap-3">
            <Link
              href="/admin/products/new"
              className="rounded-sm bg-or-principal px-5 py-2.5 text-sm font-semibold text-noir-profond hover:bg-or-clair"
            >
              Ajouter un produit
            </Link>
            <Link
              href="/admin/products/import"
              className="rounded-sm border border-beige-fonce px-5 py-2.5 text-sm font-medium text-noir-profond hover:bg-creme"
            >
              Importer un CSV
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
