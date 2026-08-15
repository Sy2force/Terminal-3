import type { ProductWithMedia } from "@/lib/data/catalog";
import type { CatalogConfig, ActiveTag } from "@/components/catalog/product-catalog";
import { PlatterCard } from "@/components/catalog/platter-card";

const QUICK_CATEGORIES = [
  { value: "all", label: "Tous" },
  { value: "vin", label: "Vins" },
  { value: "spiritueux", label: "Spiritueux" },
  { value: "charcuterie", label: "Charcuterie" },
  { value: "saumon-fume", label: "Saumon" },
];

const SORT_OPTIONS = [
  { value: "recommended", label: "Recommandés" },
  { value: "newest", label: "Nouveautés" },
  { value: "price-asc", label: "Prix croissant" },
  { value: "price-desc", label: "Prix décroissant" },
  { value: "servings-asc", label: "Nombre de personnes croissant" },
  { value: "servings-desc", label: "Nombre de personnes décroissant" },
];

export interface PlatterAdvancedFilters {
  minPrice: string;
  maxPrice: string;
  minServings: string;
  onPromotion: boolean;
  isNew: boolean;
  isFeatured: boolean;
}

const EMPTY_FILTERS: PlatterAdvancedFilters = {
  minPrice: "",
  maxPrice: "",
  minServings: "",
  onPromotion: false,
  isNew: false,
  isFeatured: false,
};

function isNewProduct(product: ProductWithMedia): boolean {
  if (!product.new_until) return false;
  return new Date(product.new_until).getTime() > Date.now();
}

function getFromPriceAgorot(product: ProductWithMedia): number | null {
  const prices = product.variants?.map((v) => v.regular_price_agorot).filter((p): p is number => p != null);
  if (!prices || prices.length === 0) return product.base_price_agorot;
  return Math.min(...prices);
}

export const platterCatalogConfig: CatalogConfig<PlatterAdvancedFilters> = {
  introSurtitle: "Réceptions & apéritifs",
  introTitle: "Composez votre réception.",
  searchPlaceholder: "Rechercher un plateau…",
  searchAriaLabel: "Rechercher un plateau",
  quickFilters: QUICK_CATEGORIES,
  quickFilterAriaLabel: "Filtrer par origine du plateau",
  matchesQuickFilter: (product, value) => product.category?.slug === value,
  getSearchHaystack: (product) => [
    product.name_fr,
    product.name_he,
    product.description_fr,
    product.composition_text,
  ],
  sortOptions: SORT_OPTIONS,
  sortComparator: (sortBy, a, b) => {
    switch (sortBy) {
      case "price-asc":
        return (getFromPriceAgorot(a) ?? Infinity) - (getFromPriceAgorot(b) ?? Infinity);
      case "price-desc":
        return (getFromPriceAgorot(b) ?? -Infinity) - (getFromPriceAgorot(a) ?? -Infinity);
      case "servings-asc":
        return (a.serves_min ?? Infinity) - (b.serves_min ?? Infinity);
      case "servings-desc":
        return (b.serves_max ?? -Infinity) - (a.serves_max ?? -Infinity);
      case "newest":
        return new Date(b.published_at ?? 0).getTime() - new Date(a.published_at ?? 0).getTime();
      default:
        return (b.is_featured ? 1 : 0) - (a.is_featured ? 1 : 0);
    }
  },
  emptyFilters: EMPTY_FILTERS,
  countActiveFilters: (filters) =>
    (filters.minPrice ? 1 : 0) +
    (filters.maxPrice ? 1 : 0) +
    (filters.minServings ? 1 : 0) +
    (filters.onPromotion ? 1 : 0) +
    (filters.isNew ? 1 : 0) +
    (filters.isFeatured ? 1 : 0),
  matchesFilters: (product, filters) => {
    const price = getFromPriceAgorot(product);
    if (filters.minPrice && (price == null || price < Number(filters.minPrice) * 100)) return false;
    if (filters.maxPrice && (price == null || price > Number(filters.maxPrice) * 100)) return false;
    if (filters.minServings && (product.serves_max == null || product.serves_max < Number(filters.minServings)))
      return false;
    if (filters.onPromotion && !product.compare_at_price_agorot) return false;
    if (filters.isNew && !isNewProduct(product)) return false;
    if (filters.isFeatured && !product.is_featured) return false;
    return true;
  },
  renderFilterFields: ({ draft, setDraft }) => (
    <>
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
          Nombre de personnes minimum
        </legend>
        <input
          type="number"
          min={0}
          placeholder="Ex: 6"
          value={draft.minServings}
          onChange={(e) => setDraft((prev) => ({ ...prev, minServings: e.target.value }))}
          className="mt-3 w-full rounded-sm border border-brun-cave/25 bg-white px-3 py-2 text-sm focus:border-bordeaux-principal focus:outline-none"
        />
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
          Recommandés
        </label>
      </fieldset>
    </>
  ),
  getActiveTags: (filters) => {
    const tags: ActiveTag<PlatterAdvancedFilters>[] = [];
    if (filters.minPrice) tags.push({ key: "minPrice", label: `Dès ${filters.minPrice} ₪` });
    if (filters.maxPrice) tags.push({ key: "maxPrice", label: `Jusqu'à ${filters.maxPrice} ₪` });
    if (filters.minServings) tags.push({ key: "minServings", label: `${filters.minServings}+ personnes` });
    if (filters.onPromotion) tags.push({ key: "onPromotion", label: "En promotion" });
    if (filters.isNew) tags.push({ key: "isNew", label: "Nouveautés" });
    if (filters.isFeatured) tags.push({ key: "isFeatured", label: "Recommandés" });
    return tags;
  },
  removeTag: (filters, key) => {
    const next = { ...filters };
    const current = next[key];
    if (typeof current === "boolean") {
      (next[key] as boolean) = false;
    } else {
      (next[key] as string) = "";
    }
    return next;
  },
  renderCard: (product, favorited) => (
    <PlatterCard key={product.id} product={product} initialFavorited={favorited} />
  ),
  itemLabel: (count) => `${count} plateau${count > 1 ? "x" : ""}`,
  emptyStateTitle: "Aucun plateau ne correspond à votre recherche.",
};
