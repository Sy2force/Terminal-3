"use client";

import { useMemo, useState } from "react";
import { Search, X } from "lucide-react";
import { FavoriteCard } from "@/components/favorites/favorite-card";
import type { ProductWithMedia } from "@/lib/data/catalog";

export function SearchResults({ products }: { products: ProductWithMedia[] }) {
  const [query, setQuery] = useState("");

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return [];
    return products.filter((product) => {
      const haystack = [
        product.name_fr,
        product.name_he,
        product.name_en,
        product.brand,
        product.description_fr,
        product.category?.name_fr,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();
      return haystack.includes(q);
    });
  }, [products, query]);

  return (
    <div>
      <div className="relative">
        <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-gris-chaud" aria-hidden />
        <label htmlFor="global-search" className="sr-only">
          Rechercher un produit
        </label>
        <input
          id="global-search"
          type="search"
          autoFocus
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Rechercher un vin, un whisky, une charcuterie, un poisson…"
          className="w-full rounded-sm border border-brun-cave/25 bg-white py-3.5 pl-11 pr-11 text-sm text-noir-profond placeholder:text-gris-chaud focus:border-bordeaux-principal focus:outline-none"
        />
        {query && (
          <button
            type="button"
            onClick={() => setQuery("")}
            aria-label="Effacer la recherche"
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gris-chaud hover:text-bordeaux-principal"
          >
            <X className="h-4 w-4" aria-hidden />
          </button>
        )}
      </div>

      {query && (
        <p className="mt-4 text-sm text-gris-chaud" aria-live="polite">
          {results.length} résultat{results.length !== 1 ? "s" : ""} pour « {query} »
        </p>
      )}

      {query && results.length === 0 && (
        <div className="mt-10 flex flex-col items-center gap-4 rounded-sm border border-brun-cave/15 bg-white/40 py-16 text-center">
          <p className="font-serif text-xl text-noir-profond">
            Aucun produit ne correspond à votre recherche.
          </p>
        </div>
      )}

      {results.length > 0 && (
        <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {results.map((product) => (
            <FavoriteCard key={product.id} product={product} showRemove={false} />
          ))}
        </div>
      )}
    </div>
  );
}
