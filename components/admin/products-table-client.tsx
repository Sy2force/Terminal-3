"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Package, Search, ChevronLeft, ChevronRight, X } from "lucide-react";
import Image from "next/image";
import { formatUnitPrice } from "@/lib/money";
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
  PREORDER: "bg-sky-100 text-sky-800",
  ON_REQUEST: "bg-slate-100 text-slate-700",
};

const availabilityLabels: Record<string, string> = {
  IN_STOCK: "En stock",
  LOW_STOCK: "Stock faible",
  OUT_OF_STOCK: "Rupture",
  PREORDER: "Précommande",
  ON_REQUEST: "Sur commande",
};

const PAGE_SIZE = 20;

type FilterStatus = "" | "published" | "draft" | "archived";
type FilterAvailability = "" | "IN_STOCK" | "LOW_STOCK" | "OUT_OF_STOCK";
type FilterPhoto = "" | "yes" | "no";

function getDisplayName(product: ProductWithDetails): string {
  return product.name_fr || product.name_he || "Produit";
}

export function ProductsTableClient({
  products,
  categories,
  success,
}: {
  products: ProductWithDetails[];
  categories: CategoryRow[];
  success?: string;
}) {
  const [selected, setSelected] = useState<string[]>([]);
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<FilterStatus>("");
  const [availabilityFilter, setAvailabilityFilter] = useState<FilterAvailability>("");
  const [photoFilter, setPhotoFilter] = useState<FilterPhoto>("");
  const [page, setPage] = useState(1);
  const [dismissedSuccess, setDismissedSuccess] = useState(false);

  const showSuccess = Boolean(success) && !dismissedSuccess;

  const successMessage =
    success === "updated"
      ? "Produit mis à jour avec succès."
      : success === "deleted"
        ? "Produit supprimé avec succès."
        : "Produit publié avec succès.";

  const categoriesById = useMemo(
    () => new Map(categories.map((c) => [c.id, c])),
    [categories],
  );

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return products.filter((product) => {
      if (q) {
        const haystack = [
          product.name_fr,
          product.name_he,
          product.name_en,
          product.brand,
          product.slug,
          product.variants.map((v) => v.sku).join(" "),
          product.variants.map((v) => v.barcode).join(" "),
        ]
          .filter(Boolean)
          .join(" ")
          .toLowerCase();
        if (!haystack.includes(q)) return false;
      }
      if (statusFilter && product.status !== statusFilter) return false;
      if (photoFilter) {
        const hasPhoto = product.media.some((m) => m.url);
        if (photoFilter === "yes" && !hasPhoto) return false;
        if (photoFilter === "no" && hasPhoto) return false;
      }
      if (availabilityFilter) {
        const defaultVariant =
          product.variants.find((v) => v.is_default) ?? product.variants[0];
        const variantStatus = defaultVariant?.availability_status ?? product.availability_status;
        if (variantStatus !== availabilityFilter) return false;
      }
      return true;
    });
  }, [products, query, statusFilter, photoFilter, availabilityFilter]);

  const pageCount = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paged = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  function toggle(id: string) {
    setSelected((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  }

  function toggleAll() {
    setSelected((prev) =>
      prev.length === paged.length ? [] : paged.map((p) => p.id),
    );
  }

  const counts = useMemo(() => {
    return {
      all: products.length,
      published: products.filter((p) => p.status === "published").length,
      draft: products.filter((p) => p.status === "draft").length,
      archived: products.filter((p) => p.status === "archived").length,
      noPhoto: products.filter((p) => !p.media.some((m) => m.url)).length,
      lowStock: products.filter((p) => {
        const v = p.variants.find((x) => x.is_default) ?? p.variants[0];
        return v?.availability_status === "LOW_STOCK" || v?.limited_stock;
      }).length,
    };
  }, [products]);

  return (
    <div className="space-y-4">
      {showSuccess && (
        <div className="flex items-center justify-between rounded-sm border border-green-300 bg-green-50 px-4 py-3 text-sm text-green-800">
          <span>{successMessage}</span>
          <button
            type="button"
            onClick={() => setDismissedSuccess(true)}
            className="text-green-800 hover:text-green-900"
            aria-label="Fermer"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )}
      <ProductsBulkToolbar selectedIds={selected} categories={categories} onDone={() => setSelected([])} />

      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex flex-wrap gap-2">
          <FilterButton
            active={statusFilter === "" && availabilityFilter === "" && photoFilter === ""}
            onClick={() => {
              setStatusFilter("");
              setAvailabilityFilter("");
              setPhotoFilter("");
              setPage(1);
            }}
          >
            Tous ({counts.all})
          </FilterButton>
          <FilterButton
            active={statusFilter === "published"}
            onClick={() => {
              setStatusFilter((v) => (v === "published" ? "" : "published"));
              setPage(1);
            }}
          >
            Publiés ({counts.published})
          </FilterButton>
          <FilterButton
            active={statusFilter === "draft"}
            onClick={() => {
              setStatusFilter((v) => (v === "draft" ? "" : "draft"));
              setPage(1);
            }}
          >
            Brouillons ({counts.draft})
          </FilterButton>
          <FilterButton
            active={availabilityFilter === "LOW_STOCK"}
            onClick={() => {
              setAvailabilityFilter((v) => (v === "LOW_STOCK" ? "" : "LOW_STOCK"));
              setPage(1);
            }}
          >
            Stock faible ({counts.lowStock})
          </FilterButton>
          <FilterButton
            active={photoFilter === "no"}
            onClick={() => {
              setPhotoFilter((v) => (v === "no" ? "" : "no"));
              setPage(1);
            }}
          >
            Sans photo ({counts.noPhoto})
          </FilterButton>
        </div>

        <div className="flex items-center rounded-xl border border-beige-fonce bg-white px-3 py-2">
          <Search className="h-4 w-4 text-gris-chaud" />
          <input
            type="text"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setPage(1);
            }}
            placeholder="Rechercher par nom, SKU, code-barres..."
            className="ml-2 w-full min-w-[16rem] bg-transparent text-sm text-noir-profond placeholder:text-gris-chaud focus:outline-none"
          />
        </div>
      </div>

      <div className="overflow-x-auto rounded-xl border border-beige-fonce bg-white shadow-sm">
        <table className="w-full min-w-[1000px] text-left text-sm">
          <thead className="bg-creme text-gris-chaud">
            <tr>
              <th className="w-10 px-4 py-3">
                <input
                  type="checkbox"
                  checked={paged.length > 0 && selected.length === paged.length}
                  onChange={toggleAll}
                  className="h-4 w-4 accent-or-principal"
                  aria-label="Tout sélectionner"
                />
              </th>
              <th className="px-4 py-3 font-medium">Photo</th>
              <th className="px-4 py-3 font-medium">Produit</th>
              <th className="px-4 py-3 font-medium">Catégorie</th>
              <th className="px-4 py-3 font-medium">Prix</th>
              <th className="px-4 py-3 font-medium">Stock</th>
              <th className="px-4 py-3 font-medium">Statut</th>
              <th className="px-4 py-3 font-medium">18+</th>
              <th className="px-4 py-3 text-right font-medium">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-beige-fonce">
            {paged.map((product) => {
              const category = categoriesById.get(product.category_id ?? "");
              const cover = product.media.find((m) => m.kind === "COVER") ?? product.media[0];
              const defaultVariant =
                product.variants.find((v) => v.is_default) ?? product.variants[0];
              const displayPrice =
                defaultVariant?.regular_price_agorot ?? product.base_price_agorot;
              const quantity = defaultVariant?.quantity;

              return (
                <tr key={product.id} className="hover:bg-creme/60">
                  <td className="px-4 py-3">
                    <input
                      type="checkbox"
                      checked={selected.includes(product.id)}
                      onChange={() => toggle(product.id)}
                      className="h-4 w-4 accent-or-principal"
                      aria-label={`Sélectionner ${getDisplayName(product)}`}
                    />
                  </td>
                  <td className="px-4 py-3">
                    <div className="relative h-12 w-12 overflow-hidden rounded-sm border border-beige-fonce bg-creme">
                      {cover?.url ? (
                        <Image
                          src={cover.url}
                          alt={cover.alt ?? getDisplayName(product)}
                          fill
                          className="object-contain"
                          sizes="48px"
                        />
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
                    <Link
                      href={`/admin/products/${product.id}`}
                      className="font-medium text-noir-profond hover:text-or-principal"
                    >
                      {getDisplayName(product)}
                    </Link>
                    {defaultVariant?.sku && (
                      <p className="text-xs text-gris-chaud">SKU : {defaultVariant.sku}</p>
                    )}
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
                    {displayPrice ? formatUnitPrice(displayPrice, defaultVariant?.pricing_unit) : "—"}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex flex-col gap-0.5">
                      <span className={`inline-flex w-fit rounded-full px-2 py-0.5 text-xs font-medium ${availabilityClasses[defaultVariant?.availability_status ?? "IN_STOCK"]}`}>
                        {availabilityLabels[defaultVariant?.availability_status ?? "IN_STOCK"]}
                      </span>
                      {quantity != null && (
                        <span className="text-xs text-gris-chaud">{quantity} unité{quantity > 1 ? "s" : ""}</span>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${statusClasses[product.status]}`}>
                      {statusLabels[product.status] ?? product.status}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    {product.age_restricted ? (
                      <span className="font-medium text-bordeaux-principal">18+</span>
                    ) : (
                      "—"
                    )}
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

      {filtered.length === 0 && (
        <div className="rounded-xl border border-beige-fonce bg-white p-12 text-center shadow-sm">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-creme text-gris-chaud">
            <Package className="h-8 w-8" />
          </div>
          <h3 className="font-serif text-xl text-noir-profond">Aucun produit pour le moment</h3>
          <p className="mt-2 text-sm text-gris-chaud">
            {query || statusFilter || availabilityFilter || photoFilter
              ? "Ajustez les filtres pour trouver des produits."
              : "Ajoutez votre premier produit ou importez votre catalogue."}
          </p>
          {!query && !statusFilter && !availabilityFilter && !photoFilter && (
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
          )}
        </div>
      )}

      {filtered.length > PAGE_SIZE && (
        <div className="flex items-center justify-between gap-4">
          <p className="text-sm text-gris-chaud">
            {filtered.length} produit{filtered.length > 1 ? "s" : ""} — page {page} / {pageCount}
          </p>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="rounded-sm border border-beige-fonce bg-white p-2 text-noir-profond hover:bg-creme disabled:opacity-50"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={() => setPage((p) => Math.min(pageCount, p + 1))}
              disabled={page === pageCount}
              className="rounded-sm border border-beige-fonce bg-white p-2 text-noir-profond hover:bg-creme disabled:opacity-50"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function FilterButton({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-full border px-4 py-1.5 text-xs font-medium transition-colors ${
        active
          ? "border-or-principal bg-or-principal/10 text-noir-profond"
          : "border-beige-fonce text-gris-chaud hover:border-or-principal hover:text-noir-profond"
      }`}
    >
      {children}
    </button>
  );
}
