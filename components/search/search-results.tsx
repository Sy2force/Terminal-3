"use client";

import { useState, useTransition, useRef } from "react";
import { Search, X } from "lucide-react";
import { searchProductsAction } from "@/app/recherche/actions";
import { ProductCard } from "@/components/commerce/product-card";
import type { ProductWithMedia } from "@/lib/data/catalog";

interface SearchResultsProps {
  initialQuery?: string;
  initialResults?: ProductWithMedia[];
}

export function SearchResults({ initialQuery = "", initialResults = [] }: SearchResultsProps) {
  const [query, setQuery] = useState(initialQuery);
  const [results, setResults] = useState<ProductWithMedia[]>(initialResults);
  const [isPending, startTransition] = useTransition();
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const runSearch = (value: string) => {
    if (!value.trim()) {
      setResults([]);
      return;
    }
    startTransition(async () => {
      const products = await searchProductsAction(value);
      setResults(products);
    });
  };

  const handleChange = (value: string) => {
    setQuery(value);
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    if (!value.trim()) {
      setResults([]);
      return;
    }
    timeoutRef.current = setTimeout(() => {
      runSearch(value);
    }, 200);
  };

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
          onChange={(e) => handleChange(e.target.value)}
          placeholder="glen, chiv, don jul, yard, saum, thon, rosette…"
          className="w-full rounded-sm border border-brun-cave/25 bg-white py-3.5 pl-11 pr-11 text-sm text-noir-profond placeholder:text-gris-chaud focus:border-bordeaux-principal focus:outline-none"
          autoComplete="off"
        />
        {query && (
          <button
            type="button"
            onClick={() => {
              setQuery("");
              setResults([]);
            }}
            aria-label="Effacer la recherche"
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gris-chaud hover:text-bordeaux-principal"
          >
            <X className="h-4 w-4" aria-hidden />
          </button>
        )}
      </div>

      {query && (
        <p className="mt-4 text-sm text-gris-chaud" aria-live="polite">
          {isPending
            ? "Recherche en cours…"
            : `${results.length} résultat${results.length !== 1 ? "s" : ""} pour « ${query} »`}
        </p>
      )}

      {query && results.length === 0 && !isPending && (
        <div className="mt-10 flex flex-col items-center gap-4 rounded-sm border border-brun-cave/15 bg-white/40 py-16 text-center">
          <p className="font-serif text-xl text-noir-profond">
            Aucun produit ne correspond à votre recherche.
          </p>
          <p className="text-sm text-gris-chaud">
            Essayez un autre mot : whisky, vodka, saumon, rosette, Yarden…
          </p>
        </div>
      )}

      {results.length > 0 && (
        <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {results.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              isFavorited={false}
            />
          ))}
        </div>
      )}
    </div>
  );
}
