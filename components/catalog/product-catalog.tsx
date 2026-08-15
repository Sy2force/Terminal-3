"use client";

import { useCallback, useEffect, useMemo, useState, useTransition, type ReactNode } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Search, SlidersHorizontal, X, RotateCcw, AlertTriangle } from "lucide-react";
import type { ProductWithMedia } from "@/lib/data/catalog";

export const PAGE_SIZE = 12;

export interface QuickFilterOption {
  value: string;
  label: string;
}

export interface ActiveTag<F> {
  key: keyof F;
  value?: string;
  label: string;
}

/**
 * Everything a specific catalog (wines, spirits, and future categories)
 * needs to plug into the shared filtering/search/sort/pagination engine
 * below. The engine owns state, URL sync, the drawer, and pagination;
 * each catalog only supplies its own domain knowledge (which quick
 * filters exist, how to match/sort/render a product, which advanced
 * filter fields to show).
 */
export interface CatalogConfig<F> {
  /** aria-label / heading copy */
  introSurtitle: string;
  introTitle: string;
  searchPlaceholder: string;
  searchAriaLabel: string;
  quickFilters: QuickFilterOption[];
  quickFilterAriaLabel: string;
  matchesQuickFilter: (product: ProductWithMedia, value: string) => boolean;
  getSearchHaystack: (product: ProductWithMedia) => (string | number | null | undefined)[];
  sortOptions: QuickFilterOption[];
  sortComparator: (sortBy: string, a: ProductWithMedia, b: ProductWithMedia) => number;
  emptyFilters: F;
  countActiveFilters: (filters: F) => number;
  matchesFilters: (product: ProductWithMedia, filters: F) => boolean;
  renderFilterFields: (props: {
    draft: F;
    setDraft: (updater: (prev: F) => F) => void;
    products: ProductWithMedia[];
  }) => ReactNode;
  getActiveTags: (filters: F) => ActiveTag<F>[];
  removeTag: (filters: F, key: keyof F, value?: string) => F;
  renderCard: (product: ProductWithMedia, favorited: boolean) => ReactNode;
  itemLabel: (count: number) => string;
  emptyStateTitle: string;
}

export function ProductCatalog<F>({
  products,
  favoriteIds,
  config,
}: {
  products: ProductWithMedia[];
  favoriteIds: Set<string>;
  config: CatalogConfig<F>;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [, startNavTransition] = useTransition();

  const [search, setSearch] = useState(searchParams.get("q") ?? "");
  const [quickType, setQuickType] = useState(searchParams.get("type") ?? "all");
  const [sortBy, setSortBy] = useState(searchParams.get("sort") ?? config.sortOptions[0]?.value ?? "recommended");
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [error] = useState<string | null>(null);

  const [appliedFilters, setAppliedFilters] = useState<F>(config.emptyFilters);
  const [draftFilters, setDraftFilters] = useState<F>(config.emptyFilters);

  // Keep the URL shareable for search/type/sort — the parts of the state a
  // visitor would actually want to bookmark or send to someone.
  useEffect(() => {
    const params = new URLSearchParams(searchParams.toString());
    if (search) params.set("q", search);
    else params.delete("q");
    if (quickType !== "all") params.set("type", quickType);
    else params.delete("type");
    if (sortBy !== (config.sortOptions[0]?.value ?? "recommended")) params.set("sort", sortBy);
    else params.delete("sort");

    const query = params.toString();
    startNavTransition(() => {
      router.replace(query ? `${pathname}?${query}` : pathname, { scroll: false });
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps -- only re-sync on the tracked values, not on every searchParams identity change
  }, [search, quickType, sortBy, pathname, router]);

  const sorted = useMemo(() => {
    try {
      const query = search.trim().toLowerCase();
      let result = products.filter((product) => {
        if (quickType !== "all" && !config.matchesQuickFilter(product, quickType)) return false;

        if (query) {
          const haystack = config
            .getSearchHaystack(product)
            .filter((v) => v !== null && v !== undefined)
            .join(" ")
            .toLowerCase();
          if (!haystack.includes(query)) return false;
        }

        if (!config.matchesFilters(product, appliedFilters)) return false;

        return true;
      });

      result = [...result].sort((a, b) => config.sortComparator(sortBy, a, b));
      return result;
    } catch {
      return [];
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- config is a stable object supplied by the caller
  }, [products, search, quickType, appliedFilters, sortBy]);

  // Reset pagination whenever the search/filters/sort change. Done during
  // render (React's documented pattern for "adjusting state when inputs
  // change") rather than in an effect, so there's no extra render pass.
  const filterSignature = `${search}|${quickType}|${sortBy}|${JSON.stringify(appliedFilters)}`;
  const [prevSignature, setPrevSignature] = useState(filterSignature);
  if (filterSignature !== prevSignature) {
    setPrevSignature(filterSignature);
    setVisibleCount(PAGE_SIZE);
  }

  const visibleProducts = sorted.slice(0, visibleCount);
  const activeFilterCount = config.countActiveFilters(appliedFilters);

  const applyFilters = useCallback(() => {
    setAppliedFilters(draftFilters);
    setDrawerOpen(false);
  }, [draftFilters]);

  const resetFilters = useCallback(() => {
    setDraftFilters(config.emptyFilters);
    setAppliedFilters(config.emptyFilters);
  }, [config]);

  const removeTag = useCallback(
    (key: keyof F, value?: string) => {
      setAppliedFilters((prev) => config.removeTag(prev, key, value));
      setDraftFilters((prev) => config.removeTag(prev, key, value));
    },
    [config],
  );

  const activeTags = config.getActiveTags(appliedFilters);

  if (error) {
    return (
      <div className="mx-auto max-w-[1440px] px-4 py-24 text-center sm:px-6 lg:px-8">
        <AlertTriangle className="mx-auto h-8 w-8 text-bordeaux-principal" aria-hidden />
        <p className="mt-4 text-noir-profond">{error}</p>
        <button
          type="button"
          onClick={() => window.location.reload()}
          className="mt-6 rounded-sm bg-bordeaux-principal px-6 py-3 text-sm uppercase tracking-widest text-texte-clair hover:bg-bordeaux-fonce"
        >
          Réessayer
        </button>
      </div>
    );
  }

  return (
    <div className="bg-fond-papier">
      {/* Intro */}
      <div className="mx-auto max-w-[1440px] px-4 pt-12 sm:px-6 lg:px-8">
        <div className="flex flex-wrap items-end justify-between gap-4 border-b border-brun-cave/15 pb-8">
          <div>
            <p className="text-xs font-medium uppercase tracking-[0.3em] text-bordeaux-principal">
              {config.introSurtitle}
            </p>
            <h2 className="mt-2 font-serif text-3xl text-noir-profond sm:text-4xl">{config.introTitle}</h2>
          </div>
          <p className="text-sm text-gris-chaud" aria-live="polite">
            {config.itemLabel(sorted.length)}
          </p>
        </div>
      </div>

      <div className="mx-auto max-w-[1440px] px-4 py-10 sm:px-6 lg:px-8">
        {/* Search + quick filters + sort */}
        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-gris-chaud" aria-hidden />
              <label htmlFor="catalog-search" className="sr-only">
                {config.searchAriaLabel}
              </label>
              <input
                id="catalog-search"
                type="search"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder={config.searchPlaceholder}
                className="w-full rounded-sm border border-brun-cave/25 bg-white py-3.5 pl-11 pr-11 text-sm text-noir-profond placeholder:text-gris-chaud focus:border-bordeaux-principal focus:outline-none"
              />
              {search && (
                <button
                  type="button"
                  onClick={() => setSearch("")}
                  aria-label="Effacer la recherche"
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gris-chaud hover:text-bordeaux-principal"
                >
                  <X className="h-4 w-4" aria-hidden />
                </button>
              )}
            </div>

            <div className="flex items-center gap-3">
              <label htmlFor="catalog-sort" className="sr-only">
                Trier
              </label>
              <select
                id="catalog-sort"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="rounded-sm border border-brun-cave/25 bg-white px-4 py-3.5 text-sm text-noir-profond focus:border-bordeaux-principal focus:outline-none"
              >
                {config.sortOptions.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>

              <button
                type="button"
                onClick={() => {
                  setDraftFilters(appliedFilters);
                  setDrawerOpen(true);
                }}
                className="relative flex items-center gap-2 rounded-sm border border-brun-cave/25 bg-white px-4 py-3.5 text-sm text-noir-profond hover:border-bordeaux-principal"
              >
                <SlidersHorizontal className="h-4 w-4" aria-hidden />
                Filtres
                {activeFilterCount > 0 && (
                  <span className="flex h-5 w-5 items-center justify-center rounded-full bg-bordeaux-principal text-[11px] text-texte-clair">
                    {activeFilterCount}
                  </span>
                )}
              </button>
            </div>
          </div>

          {/* Quick filters */}
          <div
            role="tablist"
            aria-label={config.quickFilterAriaLabel}
            className="flex gap-2 overflow-x-auto pb-1 sm:overflow-visible"
          >
            {config.quickFilters.map((t) => (
              <button
                key={t.value}
                type="button"
                role="tab"
                aria-selected={quickType === t.value}
                onClick={() => setQuickType(t.value)}
                className={`shrink-0 rounded-full border px-4 py-2 text-xs uppercase tracking-wider transition-colors duration-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-bordeaux-principal ${
                  quickType === t.value
                    ? "border-bordeaux-principal bg-bordeaux-principal text-texte-clair"
                    : "border-brun-cave/25 text-noir-profond hover:border-bordeaux-principal/60"
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>

          {/* Active filter tags */}
          {activeTags.length > 0 && (
            <div className="flex flex-wrap items-center gap-2">
              {activeTags.map((tag) => (
                <button
                  key={`${String(tag.key)}-${tag.value ?? "flag"}`}
                  type="button"
                  onClick={() => removeTag(tag.key, tag.value)}
                  className="flex items-center gap-1.5 rounded-full border border-brun-cave/25 bg-white px-3 py-1.5 text-xs text-noir-profond hover:border-bordeaux-principal"
                >
                  {tag.label}
                  <X className="h-3 w-3" aria-hidden />
                </button>
              ))}
              <button
                type="button"
                onClick={resetFilters}
                className="flex items-center gap-1.5 text-xs text-bordeaux-principal underline-offset-2 hover:underline"
              >
                <RotateCcw className="h-3 w-3" aria-hidden />
                Réinitialiser
              </button>
            </div>
          )}
        </div>

        {/* Grid */}
        <div className="mt-10">
          {visibleProducts.length === 0 ? (
            <div className="flex flex-col items-center gap-4 py-20 text-center">
              <p className="font-serif text-2xl text-noir-profond">{config.emptyStateTitle}</p>
              <p className="max-w-md text-sm text-gris-chaud">
                Essayez d&apos;élargir vos filtres ou revenez à l&apos;ensemble de la sélection.
              </p>
              <button
                type="button"
                onClick={() => {
                  setSearch("");
                  setQuickType("all");
                  resetFilters();
                }}
                className="mt-2 rounded-sm bg-bordeaux-principal px-6 py-3 text-xs uppercase tracking-widest text-texte-clair hover:bg-bordeaux-fonce"
              >
                Réinitialiser les filtres
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {visibleProducts.map((product) => config.renderCard(product, favoriteIds.has(product.id)))}
            </div>
          )}
        </div>

        {/* Load more */}
        {visibleCount < sorted.length && (
          <div className="mt-12 flex justify-center">
            <button
              type="button"
              onClick={() => setVisibleCount((c) => c + PAGE_SIZE)}
              className="rounded-sm border border-bordeaux-principal px-8 py-3.5 text-sm uppercase tracking-widest text-bordeaux-principal transition-colors hover:bg-bordeaux-principal hover:text-texte-clair"
            >
              Afficher plus ({sorted.length - visibleCount} restants)
            </button>
          </div>
        )}
      </div>

      {/* Advanced filters drawer — one consistent overlay interaction on
          every breakpoint (a permanent inline sidebar would push the grid
          around at every filter change). */}
      {drawerOpen && (
        <div
          className="fixed inset-0 z-50 flex justify-end bg-noir-profond/50"
          role="dialog"
          aria-modal="true"
          aria-label="Filtres avancés"
        >
          <button
            type="button"
            aria-label="Fermer les filtres"
            className="absolute inset-0"
            onClick={() => setDrawerOpen(false)}
          />
          <div className="relative flex h-full w-full max-w-md flex-col overflow-y-auto bg-fond-papier p-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-brun-cave/15 pb-4">
              <h3 className="font-serif text-xl text-noir-profond">Filtres avancés</h3>
              <button
                type="button"
                onClick={() => setDrawerOpen(false)}
                aria-label="Fermer"
                className="rounded-full p-2 text-gris-chaud hover:text-bordeaux-principal"
              >
                <X className="h-5 w-5" aria-hidden />
              </button>
            </div>

            <div className="flex-1 space-y-8 py-6">
              {config.renderFilterFields({ draft: draftFilters, setDraft: setDraftFilters, products })}
            </div>

            <div className="flex gap-3 border-t border-brun-cave/15 pt-4">
              <button
                type="button"
                onClick={() => setDraftFilters(config.emptyFilters)}
                className="flex-1 rounded-sm border border-brun-cave/30 px-4 py-3 text-sm uppercase tracking-widest text-noir-profond hover:border-bordeaux-principal"
              >
                Réinitialiser
              </button>
              <button
                type="button"
                onClick={applyFilters}
                className="flex-1 rounded-sm bg-bordeaux-principal px-4 py-3 text-sm uppercase tracking-widest text-texte-clair hover:bg-bordeaux-fonce"
              >
                Appliquer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
