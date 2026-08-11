"use client";

import { useState, useMemo } from "react";
import { Search } from "lucide-react";
import { SalmonProductCard } from "@/components/commerce/salmon-product-card";
import { ProductCard } from "@/components/commerce/product-card";
import type { ProductWithMedia } from "@/lib/data/catalog";

interface FilterOption {
  key: string;
  label: string;
}

function deriveFilters(products: ProductWithMedia[]): FilterOption[] {
  const filters = new Map<string, string>();
  for (const product of products) {
    const variant = product.variants?.find((v) => v.is_default) ?? product.variants?.[0];
    if (variant?.label) {
      const label = variant.label.toLowerCase();
      if (label.includes("100g")) filters.set("100g", "100g");
      if (label.includes("200g")) filters.set("200g", "200g");
    }
    const name = (product.name_fr || product.name_he).toLowerCase();
    if (name.includes("gravlax")) filters.set("gravlax", "Gravlax");
    if (name.includes("sashimi")) filters.set("sashimi", "Sashimi");
    if (name.includes("classique") || name.includes("קלאסי")) filters.set("classique", "Classique");
    if (name.includes("betterave") || name.includes("בסלק")) filters.set("betterave", "Betterave");
    if (name.includes("sans sucre") || name.includes("ללא סוכר")) filters.set("sans-sucre", "Sans sucre");
    if (name.includes("truite") || name.includes("פורל")) filters.set("truite", "Truite");
    if (name.includes("thon") || name.includes("טונה")) filters.set("thon", "Thon");
  }
  return Array.from(filters.entries()).map(([key, label]) => ({ key, label }));
}

function matchesFilter(product: ProductWithMedia, filterKey: string): boolean {
  const variant = product.variants?.find((v) => v.is_default) ?? product.variants?.[0];
  const label = (variant?.label ?? "").toLowerCase();
  const name = (product.name_fr || product.name_he).toLowerCase();

  switch (filterKey) {
    case "100g": return label.includes("100g");
    case "200g": return label.includes("200g");
    case "gravlax": return name.includes("gravlax");
    case "sashimi": return name.includes("sashimi");
    case "classique": return name.includes("classique") || name.includes("קלאסי");
    case "betterave": return name.includes("betterave") || name.includes("בסלק");
    case "sans-sucre": return name.includes("sans sucre") || name.includes("ללא סוכר");
    case "truite": return name.includes("truite") || name.includes("פורל");
    case "thon": return name.includes("thon") || name.includes("טונה");
    default: return true;
  }
}

export function CategoryFilters({
  products,
  favoriteIds,
  useSalmonCard,
}: {
  products: ProductWithMedia[];
  favoriteIds: Set<string>;
  useSalmonCard: boolean;
}) {
  const [activeFilter, setActiveFilter] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const filters = useMemo(() => deriveFilters(products), [products]);

  const filtered = useMemo(() => {
    let result = products;
    
    // Apply filter
    if (activeFilter) {
      result = result.filter((p) => matchesFilter(p, activeFilter));
    }
    
    // Apply search
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result.filter((p) => {
        const name = (p.name_fr || p.name_he).toLowerCase();
        const description = (p.description_fr || p.description_he || "").toLowerCase();
        return name.includes(query) || description.includes(query);
      });
    }
    
    return result;
  }, [products, activeFilter, searchQuery]);

  return (
    <div>
      {/* Search Bar */}
      <div className="mb-6">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-grey" />
          <input
            type="text"
            placeholder="Rechercher un vin..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-12 pr-4 py-3 rounded-lg border border-white/10 bg-graphite text-ivory placeholder:text-muted-grey/60 focus:border-champagne focus:outline-none transition-colors"
          />
        </div>
      </div>

      {filters.length > 0 && (
        <div className="mb-10 flex gap-2 overflow-x-auto pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          <button
            type="button"
            onClick={() => setActiveFilter(null)}
            className={`shrink-0 rounded-full border px-4 py-1.5 text-xs uppercase tracking-widest transition-colors ${
              activeFilter === null
                ? "border-champagne text-champagne"
                : "border-white/10 text-ivory/60 hover:border-white/30"
            }`}
          >
            Tous
          </button>
          {filters.map((f) => (
            <button
              key={f.key}
              type="button"
              onClick={() => setActiveFilter(f.key)}
              className={`shrink-0 rounded-full border px-4 py-1.5 text-xs uppercase tracking-widest transition-colors ${
                activeFilter === f.key
                  ? "border-champagne text-champagne"
                  : "border-white/10 text-ivory/60 hover:border-white/30"
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      )}

      <p className="mb-6 text-sm text-muted-grey">
        {filtered.length} produit{filtered.length > 1 ? "s" : ""} {searchQuery && `pour "${searchQuery}"`}
      </p>

      <div
        className={
          useSalmonCard
            ? "grid gap-8 sm:grid-cols-2 lg:grid-cols-3"
            : "grid gap-5 sm:grid-cols-2 lg:grid-cols-4"
        }
      >
        {filtered.map((product) =>
          useSalmonCard ? (
            <SalmonProductCard
              key={product.id}
              product={product}
              isFavorited={favoriteIds.has(product.id)}
            />
          ) : (
            <ProductCard
              key={product.id}
              product={product}
              isFavorited={favoriteIds.has(product.id)}
            />
          ),
        )}
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-12">
          <p className="text-muted-grey">Aucun résultat trouvé pour votre recherche.</p>
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="mt-4 text-champagne hover:underline"
            >
              Effacer la recherche
            </button>
          )}
        </div>
      )}
    </div>
  );
}
