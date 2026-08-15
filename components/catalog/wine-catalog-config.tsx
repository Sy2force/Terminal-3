import type { ProductWithMedia } from "@/lib/data/catalog";
import type { CatalogConfig, ActiveTag } from "@/components/catalog/product-catalog";
import { WineCard } from "@/components/catalog/wine-card";

const QUICK_TYPES = [
  { value: "all", label: "Tous" },
  { value: "ROUGE", label: "Rouge" },
  { value: "BLANC", label: "Blanc" },
  { value: "ROSE", label: "Rosé" },
  { value: "EFFERVESCENT", label: "Effervescent" },
  { value: "DOUX", label: "Doux" },
];

const SORT_OPTIONS = [
  { value: "recommended", label: "Recommandés" },
  { value: "newest", label: "Nouveautés" },
  { value: "price-asc", label: "Prix croissant" },
  { value: "price-desc", label: "Prix décroissant" },
  { value: "rating", label: "Mieux notés" },
  { value: "popular", label: "Plus populaires" },
  { value: "vintage", label: "Millésime récent" },
];

export interface WineAdvancedFilters {
  domaines: string[];
  regions: string[];
  grapes: string[];
  minPrice: string;
  maxPrice: string;
  minRating: string;
  onPromotion: boolean;
  isNew: boolean;
  isFeatured: boolean;
  inStock: boolean;
}

const EMPTY_FILTERS: WineAdvancedFilters = {
  domaines: [],
  regions: [],
  grapes: [],
  minPrice: "",
  maxPrice: "",
  minRating: "",
  onPromotion: false,
  isNew: false,
  isFeatured: false,
  inStock: false,
};

function isNewProduct(product: ProductWithMedia): boolean {
  if (!product.new_until) return false;
  return new Date(product.new_until).getTime() > Date.now();
}

function getPriceAgorot(product: ProductWithMedia): number | null {
  const defaultVariant = product.variants?.find((v) => v.is_default) ?? product.variants?.[0];
  return defaultVariant?.regular_price_agorot ?? product.base_price_agorot ?? null;
}

function getVintage(product: ProductWithMedia): number | null {
  const defaultVariant = product.variants?.find((v) => v.is_default) ?? product.variants?.[0];
  return defaultVariant?.vintage ?? null;
}

export const wineCatalogConfig: CatalogConfig<WineAdvancedFilters> = {
  introSurtitle: "La sélection complète",
  introTitle: "Choisissez votre prochaine bouteille.",
  searchPlaceholder: "Rechercher un vin ou un domaine…",
  searchAriaLabel: "Rechercher un vin ou un domaine",
  quickFilters: QUICK_TYPES,
  quickFilterAriaLabel: "Filtrer par type de vin",
  matchesQuickFilter: (product, value) => product.wine_type === value,
  getSearchHaystack: (product) => [
    product.name_fr,
    product.name_he,
    product.name_en,
    product.brand,
    product.region,
    product.country,
    getVintage(product),
    ...(product.grape_varieties ?? []),
  ],
  sortOptions: SORT_OPTIONS,
  sortComparator: (sortBy, a, b) => {
    switch (sortBy) {
      case "price-asc":
        return (getPriceAgorot(a) ?? Infinity) - (getPriceAgorot(b) ?? Infinity);
      case "price-desc":
        return (getPriceAgorot(b) ?? -Infinity) - (getPriceAgorot(a) ?? -Infinity);
      case "rating":
        return (b.rating ?? 0) - (a.rating ?? 0);
      case "popular":
        return (b.review_count ?? 0) - (a.review_count ?? 0);
      case "vintage":
        return (getVintage(b) ?? 0) - (getVintage(a) ?? 0);
      case "newest":
        return new Date(b.published_at ?? 0).getTime() - new Date(a.published_at ?? 0).getTime();
      default:
        return (b.is_featured ? 1 : 0) - (a.is_featured ? 1 : 0);
    }
  },
  emptyFilters: EMPTY_FILTERS,
  countActiveFilters: (filters) =>
    filters.domaines.length +
    filters.regions.length +
    filters.grapes.length +
    (filters.minPrice ? 1 : 0) +
    (filters.maxPrice ? 1 : 0) +
    (filters.minRating ? 1 : 0) +
    (filters.onPromotion ? 1 : 0) +
    (filters.isNew ? 1 : 0) +
    (filters.isFeatured ? 1 : 0) +
    (filters.inStock ? 1 : 0),
  matchesFilters: (product, filters) => {
    if (filters.domaines.length && !filters.domaines.includes(product.brand ?? "")) return false;
    if (filters.regions.length && !filters.regions.includes(product.region ?? "")) return false;
    if (filters.grapes.length && !filters.grapes.some((g) => (product.grape_varieties ?? []).includes(g))) {
      return false;
    }
    const price = getPriceAgorot(product);
    if (filters.minPrice && (price == null || price < Number(filters.minPrice) * 100)) return false;
    if (filters.maxPrice && (price == null || price > Number(filters.maxPrice) * 100)) return false;
    if (filters.minRating && (product.rating == null || product.rating < Number(filters.minRating))) return false;
    if (filters.onPromotion && !product.compare_at_price_agorot) return false;
    if (filters.isNew && !isNewProduct(product)) return false;
    if (filters.isFeatured && !product.is_featured) return false;
    if (filters.inStock && product.availability_status === "OUT_OF_STOCK") return false;
    return true;
  },
  renderFilterFields: ({ draft, setDraft, products }) => {
    const domaineOptions = Array.from(
      new Set(products.map((p) => p.brand).filter((v): v is string => Boolean(v))),
    ).sort();
    const regionOptions = Array.from(
      new Set(products.map((p) => p.region).filter((v): v is string => Boolean(v))),
    ).sort();
    const grapeOptions = Array.from(
      new Set(products.flatMap((p) => p.grape_varieties ?? []).filter(Boolean)),
    ).sort();

    return (
      <>
        {domaineOptions.length > 0 && (
          <fieldset>
            <legend className="text-xs font-medium uppercase tracking-widest text-bordeaux-principal">
              Domaine
            </legend>
            <div className="mt-3 flex flex-col gap-2">
              {domaineOptions.map((domaine) => (
                <label key={domaine} className="flex items-center gap-2.5 text-sm text-noir-profond">
                  <input
                    type="checkbox"
                    checked={draft.domaines.includes(domaine)}
                    onChange={(e) =>
                      setDraft((prev) => ({
                        ...prev,
                        domaines: e.target.checked
                          ? [...prev.domaines, domaine]
                          : prev.domaines.filter((d) => d !== domaine),
                      }))
                    }
                    className="h-4 w-4 rounded-sm border-brun-cave/40 text-bordeaux-principal focus:ring-bordeaux-principal"
                  />
                  {domaine}
                </label>
              ))}
            </div>
          </fieldset>
        )}

        {regionOptions.length > 0 && (
          <fieldset>
            <legend className="text-xs font-medium uppercase tracking-widest text-bordeaux-principal">
              Région
            </legend>
            <div className="mt-3 flex flex-col gap-2">
              {regionOptions.map((region) => (
                <label key={region} className="flex items-center gap-2.5 text-sm text-noir-profond">
                  <input
                    type="checkbox"
                    checked={draft.regions.includes(region)}
                    onChange={(e) =>
                      setDraft((prev) => ({
                        ...prev,
                        regions: e.target.checked
                          ? [...prev.regions, region]
                          : prev.regions.filter((r) => r !== region),
                      }))
                    }
                    className="h-4 w-4 rounded-sm border-brun-cave/40 text-bordeaux-principal focus:ring-bordeaux-principal"
                  />
                  {region}
                </label>
              ))}
            </div>
          </fieldset>
        )}

        {grapeOptions.length > 0 && (
          <fieldset>
            <legend className="text-xs font-medium uppercase tracking-widest text-bordeaux-principal">
              Cépage
            </legend>
            <div className="mt-3 flex flex-wrap gap-2">
              {grapeOptions.map((grape) => (
                <button
                  key={grape}
                  type="button"
                  onClick={() =>
                    setDraft((prev) => ({
                      ...prev,
                      grapes: prev.grapes.includes(grape)
                        ? prev.grapes.filter((g) => g !== grape)
                        : [...prev.grapes, grape],
                    }))
                  }
                  aria-pressed={draft.grapes.includes(grape)}
                  className={`rounded-full border px-3 py-1.5 text-xs transition-colors ${
                    draft.grapes.includes(grape)
                      ? "border-bordeaux-principal bg-bordeaux-principal text-texte-clair"
                      : "border-brun-cave/25 text-noir-profond hover:border-bordeaux-principal/60"
                  }`}
                >
                  {grape}
                </button>
              ))}
            </div>
          </fieldset>
        )}

        <fieldset>
          <legend className="text-xs font-medium uppercase tracking-widest text-bordeaux-principal">
            Prix (₪)
          </legend>
          <div className="mt-3 flex items-center gap-3">
            <label className="flex-1">
              <span className="sr-only">Prix minimum</span>
              <input
                type="number"
                min={0}
                placeholder="Min"
                value={draft.minPrice}
                onChange={(e) => setDraft((prev) => ({ ...prev, minPrice: e.target.value }))}
                className="w-full rounded-sm border border-brun-cave/25 bg-white px-3 py-2 text-sm focus:border-bordeaux-principal focus:outline-none"
              />
            </label>
            <span className="text-gris-chaud">—</span>
            <label className="flex-1">
              <span className="sr-only">Prix maximum</span>
              <input
                type="number"
                min={0}
                placeholder="Max"
                value={draft.maxPrice}
                onChange={(e) => setDraft((prev) => ({ ...prev, maxPrice: e.target.value }))}
                className="w-full rounded-sm border border-brun-cave/25 bg-white px-3 py-2 text-sm focus:border-bordeaux-principal focus:outline-none"
              />
            </label>
          </div>
        </fieldset>

        <fieldset>
          <legend className="text-xs font-medium uppercase tracking-widest text-bordeaux-principal">
            Note minimale
          </legend>
          <select
            value={draft.minRating}
            onChange={(e) => setDraft((prev) => ({ ...prev, minRating: e.target.value }))}
            className="mt-3 w-full rounded-sm border border-brun-cave/25 bg-white px-3 py-2 text-sm focus:border-bordeaux-principal focus:outline-none"
          >
            <option value="">Toutes les notes</option>
            <option value="4">4 étoiles et plus</option>
            <option value="4.5">4.5 étoiles et plus</option>
          </select>
        </fieldset>

        <fieldset className="space-y-3">
          <legend className="text-xs font-medium uppercase tracking-widest text-bordeaux-principal">
            Autres critères
          </legend>
          <label className="flex items-center gap-2.5 text-sm text-noir-profond">
            <input
              type="checkbox"
              checked={draft.onPromotion}
              onChange={(e) => setDraft((prev) => ({ ...prev, onPromotion: e.target.checked }))}
              className="h-4 w-4 rounded-sm border-brun-cave/40 text-bordeaux-principal focus:ring-bordeaux-principal"
            />
            En promotion
          </label>
          <label className="flex items-center gap-2.5 text-sm text-noir-profond">
            <input
              type="checkbox"
              checked={draft.isNew}
              onChange={(e) => setDraft((prev) => ({ ...prev, isNew: e.target.checked }))}
              className="h-4 w-4 rounded-sm border-brun-cave/40 text-bordeaux-principal focus:ring-bordeaux-principal"
            />
            Nouveautés
          </label>
          <label className="flex items-center gap-2.5 text-sm text-noir-profond">
            <input
              type="checkbox"
              checked={draft.isFeatured}
              onChange={(e) => setDraft((prev) => ({ ...prev, isFeatured: e.target.checked }))}
              className="h-4 w-4 rounded-sm border-brun-cave/40 text-bordeaux-principal focus:ring-bordeaux-principal"
            />
            Produits recommandés
          </label>
          <label className="flex items-center gap-2.5 text-sm text-noir-profond">
            <input
              type="checkbox"
              checked={draft.inStock}
              onChange={(e) => setDraft((prev) => ({ ...prev, inStock: e.target.checked }))}
              className="h-4 w-4 rounded-sm border-brun-cave/40 text-bordeaux-principal focus:ring-bordeaux-principal"
            />
            En stock uniquement
          </label>
        </fieldset>
      </>
    );
  },
  getActiveTags: (filters) => {
    const tags: ActiveTag<WineAdvancedFilters>[] = [];
    filters.domaines.forEach((d) => tags.push({ key: "domaines", value: d, label: d }));
    filters.regions.forEach((r) => tags.push({ key: "regions", value: r, label: r }));
    filters.grapes.forEach((g) => tags.push({ key: "grapes", value: g, label: g }));
    if (filters.minPrice) tags.push({ key: "minPrice", label: `Dès ${filters.minPrice} ₪` });
    if (filters.maxPrice) tags.push({ key: "maxPrice", label: `Jusqu'à ${filters.maxPrice} ₪` });
    if (filters.minRating) tags.push({ key: "minRating", label: `${filters.minRating}+ étoiles` });
    if (filters.onPromotion) tags.push({ key: "onPromotion", label: "En promotion" });
    if (filters.isNew) tags.push({ key: "isNew", label: "Nouveautés" });
    if (filters.isFeatured) tags.push({ key: "isFeatured", label: "Recommandés" });
    if (filters.inStock) tags.push({ key: "inStock", label: "En stock" });
    return tags;
  },
  removeTag: (filters, key, value) => {
    const next = { ...filters };
    const current = next[key];
    if (Array.isArray(current) && value !== undefined) {
      (next[key] as string[]) = (current as string[]).filter((v) => v !== value);
    } else if (typeof current === "boolean") {
      (next[key] as boolean) = false;
    } else {
      (next[key] as string) = "";
    }
    return next;
  },
  renderCard: (product, favorited) => (
    <WineCard key={product.id} product={product} initialFavorited={favorited} />
  ),
  itemLabel: (count) => `${count} vin${count > 1 ? "s" : ""}`,
  emptyStateTitle: "Aucun vin ne correspond à votre recherche.",
};
