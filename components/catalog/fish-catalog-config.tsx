import type { ProductWithMedia } from "@/lib/data/catalog";
import type { CatalogConfig, ActiveTag } from "@/components/catalog/product-catalog";
import { FishCard } from "@/components/catalog/fish-card";
import { FISH_SUBCATEGORY_LABELS, FISH_PACKAGING_LABELS } from "@/lib/fish";

const QUICK_CATEGORIES = [
  { value: "all", label: "Tous" },
  { value: "SAUMON_FUME", label: "Saumon fumé" },
  { value: "SAUMON_HERBES", label: "Saumon aux herbes" },
  { value: "ANCHOIS", label: "Anchois" },
  { value: "VENTRECHE_THON", label: "Ventrèche de thon" },
  { value: "FILET_THON", label: "Filet de thon" },
  { value: "GLASS", label: "Produits en verre" },
  { value: "CAN", label: "Produits en conserve" },
  { value: "VACUUM", label: "Produits sous vide" },
  { value: "BULK", label: "Formats professionnels" },
  { value: "PLATEAUX", label: "Plateaux" },
];

const SORT_OPTIONS = [
  { value: "recommended", label: "Recommandés" },
  { value: "newest", label: "Nouveautés" },
  { value: "price-asc", label: "Prix croissant" },
  { value: "price-desc", label: "Prix décroissant" },
  { value: "rating", label: "Mieux notés" },
  { value: "popular", label: "Plus populaires" },
  { value: "weight-asc", label: "Poids croissant" },
  { value: "weight-desc", label: "Poids décroissant" },
];

export interface FishAdvancedFilters {
  brands: string[];
  fishTypes: string[];
  packaging: string[];
  minWeight: string;
  maxWeight: string;
  minPrice: string;
  maxPrice: string;
  minRating: string;
  smokedFilter: "" | "SMOKED" | "NOT_SMOKED";
  onPromotion: boolean;
  isNew: boolean;
  isFeatured: boolean;
  isBestSeller: boolean;
  inStock: boolean;
  kosherOnly: boolean;
  availableForPlatter: boolean;
}

const EMPTY_FILTERS: FishAdvancedFilters = {
  brands: [],
  fishTypes: [],
  packaging: [],
  minWeight: "",
  maxWeight: "",
  minPrice: "",
  maxPrice: "",
  minRating: "",
  smokedFilter: "",
  onPromotion: false,
  isNew: false,
  isFeatured: false,
  isBestSeller: false,
  inStock: false,
  kosherOnly: false,
  availableForPlatter: false,
};

function isNewProduct(product: ProductWithMedia): boolean {
  if (!product.new_until) return false;
  return new Date(product.new_until).getTime() > Date.now();
}

function getDefaultVariant(product: ProductWithMedia) {
  return product.variants?.find((v) => v.is_default) ?? product.variants?.[0];
}

function getPriceAgorot(product: ProductWithMedia): number | null {
  return getDefaultVariant(product)?.regular_price_agorot ?? product.base_price_agorot ?? null;
}

function getWeightG(product: ProductWithMedia): number | null {
  return getDefaultVariant(product)?.weight_g ?? null;
}

function hasPackaging(product: ProductWithMedia, packaging: string): boolean {
  return Boolean(product.variants?.some((v) => v.packaging === packaging));
}

export const fishCatalogConfig: CatalogConfig<FishAdvancedFilters> = {
  introSurtitle: "La sélection complète",
  introTitle: "Composez votre table.",
  searchPlaceholder: "Rechercher un saumon, un thon ou un produit…",
  searchAriaLabel: "Rechercher un saumon, un thon ou un produit",
  quickFilters: QUICK_CATEGORIES,
  quickFilterAriaLabel: "Filtrer par catégorie de poisson",
  matchesQuickFilter: (product, value) => {
    // "Produits en verre/conserve/sous vide/formats professionnels" are
    // packaging-based quick filters — a single subcategory column can't
    // encode both fish type and packaging, so we check both axes here.
    if (product.subcategory === value) return true;
    return hasPackaging(product, value);
  },
  getSearchHaystack: (product) => [
    product.name_fr,
    product.name_he,
    product.name_en,
    product.brand,
    product.subcategory ? FISH_SUBCATEGORY_LABELS[product.subcategory] : null,
    product.fish_type,
    product.preparation_method,
    product.description_fr,
    ...(product.variants?.map((v) => v.label) ?? []),
    ...(product.variants?.map((v) => (v.packaging ? FISH_PACKAGING_LABELS[v.packaging] : null)) ?? []),
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
      case "weight-asc":
        return (getWeightG(a) ?? Infinity) - (getWeightG(b) ?? Infinity);
      case "weight-desc":
        return (getWeightG(b) ?? -Infinity) - (getWeightG(a) ?? -Infinity);
      case "newest":
        return new Date(b.published_at ?? 0).getTime() - new Date(a.published_at ?? 0).getTime();
      default:
        return (b.is_featured ? 1 : 0) - (a.is_featured ? 1 : 0);
    }
  },
  emptyFilters: EMPTY_FILTERS,
  countActiveFilters: (filters) =>
    filters.brands.length +
    filters.fishTypes.length +
    filters.packaging.length +
    (filters.minWeight ? 1 : 0) +
    (filters.maxWeight ? 1 : 0) +
    (filters.minPrice ? 1 : 0) +
    (filters.maxPrice ? 1 : 0) +
    (filters.minRating ? 1 : 0) +
    (filters.smokedFilter ? 1 : 0) +
    (filters.onPromotion ? 1 : 0) +
    (filters.isNew ? 1 : 0) +
    (filters.isFeatured ? 1 : 0) +
    (filters.isBestSeller ? 1 : 0) +
    (filters.inStock ? 1 : 0) +
    (filters.kosherOnly ? 1 : 0) +
    (filters.availableForPlatter ? 1 : 0),
  matchesFilters: (product, filters) => {
    if (filters.brands.length && !filters.brands.includes(product.brand ?? "")) return false;
    if (filters.fishTypes.length && !filters.fishTypes.includes(product.fish_type ?? "")) return false;
    if (filters.packaging.length && !filters.packaging.some((p) => hasPackaging(product, p))) return false;
    const weight = getWeightG(product);
    if (filters.minWeight && (weight == null || weight < Number(filters.minWeight))) return false;
    if (filters.maxWeight && (weight == null || weight > Number(filters.maxWeight))) return false;
    const price = getPriceAgorot(product);
    if (filters.minPrice && (price == null || price < Number(filters.minPrice) * 100)) return false;
    if (filters.maxPrice && (price == null || price > Number(filters.maxPrice) * 100)) return false;
    if (filters.minRating && (product.rating == null || product.rating < Number(filters.minRating))) return false;
    if (filters.smokedFilter === "SMOKED" && !product.smoked) return false;
    if (filters.smokedFilter === "NOT_SMOKED" && product.smoked) return false;
    if (filters.onPromotion && !product.compare_at_price_agorot) return false;
    if (filters.isNew && !isNewProduct(product)) return false;
    if (filters.isFeatured && !product.is_featured) return false;
    if (filters.isBestSeller && !product.is_best_seller) return false;
    if (filters.inStock && product.availability_status === "OUT_OF_STOCK") return false;
    if (filters.kosherOnly && !product.kosher_status) return false;
    if (filters.availableForPlatter && !product.is_available_for_platter) return false;
    return true;
  },
  renderFilterFields: ({ draft, setDraft, products }) => {
    const brandOptions = Array.from(
      new Set(products.map((p) => p.brand).filter((v): v is string => Boolean(v))),
    ).sort();
    const fishTypeOptions = Array.from(
      new Set(products.map((p) => p.fish_type).filter((v): v is string => Boolean(v))),
    ).sort();
    const packagingOptions = Array.from(
      new Set(
        products.flatMap((p) => p.variants?.map((v) => v.packaging) ?? []).filter((v): v is string => Boolean(v)),
      ),
    ).sort();

    return (
      <>
        {brandOptions.length > 0 && (
          <fieldset>
            <legend className="text-xs font-medium uppercase tracking-widest text-bordeaux-principal">
              Marque
            </legend>
            <div className="mt-3 flex flex-col gap-2">
              {brandOptions.map((brand) => (
                <label key={brand} className="flex items-center gap-2.5 text-sm text-noir-profond">
                  <input
                    type="checkbox"
                    checked={draft.brands.includes(brand)}
                    onChange={(e) =>
                      setDraft((prev) => ({
                        ...prev,
                        brands: e.target.checked
                          ? [...prev.brands, brand]
                          : prev.brands.filter((b) => b !== brand),
                      }))
                    }
                    className="h-4 w-4 rounded-sm border-brun-cave/40 text-bordeaux-principal focus:ring-bordeaux-principal"
                  />
                  {brand}
                </label>
              ))}
            </div>
          </fieldset>
        )}

        {fishTypeOptions.length > 0 && (
          <fieldset>
            <legend className="text-xs font-medium uppercase tracking-widest text-bordeaux-principal">
              Type de poisson
            </legend>
            <div className="mt-3 flex flex-col gap-2">
              {fishTypeOptions.map((fishType) => (
                <label key={fishType} className="flex items-center gap-2.5 text-sm text-noir-profond">
                  <input
                    type="checkbox"
                    checked={draft.fishTypes.includes(fishType)}
                    onChange={(e) =>
                      setDraft((prev) => ({
                        ...prev,
                        fishTypes: e.target.checked
                          ? [...prev.fishTypes, fishType]
                          : prev.fishTypes.filter((f) => f !== fishType),
                      }))
                    }
                    className="h-4 w-4 rounded-sm border-brun-cave/40 text-bordeaux-principal focus:ring-bordeaux-principal"
                  />
                  {fishType}
                </label>
              ))}
            </div>
          </fieldset>
        )}

        {packagingOptions.length > 0 && (
          <fieldset>
            <legend className="text-xs font-medium uppercase tracking-widest text-bordeaux-principal">
              Conditionnement
            </legend>
            <div className="mt-3 flex flex-col gap-2">
              {packagingOptions.map((pkg) => (
                <label key={pkg} className="flex items-center gap-2.5 text-sm text-noir-profond">
                  <input
                    type="checkbox"
                    checked={draft.packaging.includes(pkg)}
                    onChange={(e) =>
                      setDraft((prev) => ({
                        ...prev,
                        packaging: e.target.checked
                          ? [...prev.packaging, pkg]
                          : prev.packaging.filter((p) => p !== pkg),
                      }))
                    }
                    className="h-4 w-4 rounded-sm border-brun-cave/40 text-bordeaux-principal focus:ring-bordeaux-principal"
                  />
                  {FISH_PACKAGING_LABELS[pkg] ?? pkg}
                </label>
              ))}
            </div>
          </fieldset>
        )}

        <fieldset>
          <legend className="text-xs font-medium uppercase tracking-widest text-bordeaux-principal">
            Poids (g)
          </legend>
          <div className="mt-3 flex items-center gap-3">
            <label className="flex-1">
              <span className="sr-only">Poids minimum</span>
              <input
                type="number"
                min={0}
                placeholder="Min"
                value={draft.minWeight}
                onChange={(e) => setDraft((prev) => ({ ...prev, minWeight: e.target.value }))}
                className="w-full rounded-sm border border-brun-cave/25 bg-white px-3 py-2 text-sm focus:border-bordeaux-principal focus:outline-none"
              />
            </label>
            <span className="text-gris-chaud">—</span>
            <label className="flex-1">
              <span className="sr-only">Poids maximum</span>
              <input
                type="number"
                min={0}
                placeholder="Max"
                value={draft.maxWeight}
                onChange={(e) => setDraft((prev) => ({ ...prev, maxWeight: e.target.value }))}
                className="w-full rounded-sm border border-brun-cave/25 bg-white px-3 py-2 text-sm focus:border-bordeaux-principal focus:outline-none"
              />
            </label>
          </div>
        </fieldset>

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

        <fieldset>
          <legend className="text-xs font-medium uppercase tracking-widest text-bordeaux-principal">
            Fumage
          </legend>
          <select
            value={draft.smokedFilter}
            onChange={(e) => setDraft((prev) => ({ ...prev, smokedFilter: e.target.value as FishAdvancedFilters["smokedFilter"] }))}
            className="mt-3 w-full rounded-sm border border-brun-cave/25 bg-white px-3 py-2 text-sm focus:border-bordeaux-principal focus:outline-none"
          >
            <option value="">Fumé ou non fumé</option>
            <option value="SMOKED">Fumé</option>
            <option value="NOT_SMOKED">Non fumé</option>
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
              checked={draft.isBestSeller}
              onChange={(e) => setDraft((prev) => ({ ...prev, isBestSeller: e.target.checked }))}
              className="h-4 w-4 rounded-sm border-brun-cave/40 text-bordeaux-principal focus:ring-bordeaux-principal"
            />
            Best-seller
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
          <label className="flex items-center gap-2.5 text-sm text-noir-profond">
            <input
              type="checkbox"
              checked={draft.kosherOnly}
              onChange={(e) => setDraft((prev) => ({ ...prev, kosherOnly: e.target.checked }))}
              className="h-4 w-4 rounded-sm border-brun-cave/40 text-bordeaux-principal focus:ring-bordeaux-principal"
            />
            Cacherout confirmée uniquement
          </label>
          <label className="flex items-center gap-2.5 text-sm text-noir-profond">
            <input
              type="checkbox"
              checked={draft.availableForPlatter}
              onChange={(e) => setDraft((prev) => ({ ...prev, availableForPlatter: e.target.checked }))}
              className="h-4 w-4 rounded-sm border-brun-cave/40 text-bordeaux-principal focus:ring-bordeaux-principal"
            />
            Disponible en plateau
          </label>
        </fieldset>
      </>
    );
  },
  getActiveTags: (filters) => {
    const tags: ActiveTag<FishAdvancedFilters>[] = [];
    filters.brands.forEach((b) => tags.push({ key: "brands", value: b, label: b }));
    filters.fishTypes.forEach((f) => tags.push({ key: "fishTypes", value: f, label: f }));
    filters.packaging.forEach((p) => tags.push({ key: "packaging", value: p, label: FISH_PACKAGING_LABELS[p] ?? p }));
    if (filters.minWeight) tags.push({ key: "minWeight", label: `Dès ${filters.minWeight} g` });
    if (filters.maxWeight) tags.push({ key: "maxWeight", label: `Jusqu'à ${filters.maxWeight} g` });
    if (filters.minPrice) tags.push({ key: "minPrice", label: `Dès ${filters.minPrice} ₪` });
    if (filters.maxPrice) tags.push({ key: "maxPrice", label: `Jusqu'à ${filters.maxPrice} ₪` });
    if (filters.minRating) tags.push({ key: "minRating", label: `${filters.minRating}+ étoiles` });
    if (filters.smokedFilter === "SMOKED") tags.push({ key: "smokedFilter", label: "Fumé" });
    if (filters.smokedFilter === "NOT_SMOKED") tags.push({ key: "smokedFilter", label: "Non fumé" });
    if (filters.onPromotion) tags.push({ key: "onPromotion", label: "En promotion" });
    if (filters.isNew) tags.push({ key: "isNew", label: "Nouveautés" });
    if (filters.isFeatured) tags.push({ key: "isFeatured", label: "Recommandés" });
    if (filters.isBestSeller) tags.push({ key: "isBestSeller", label: "Best-seller" });
    if (filters.inStock) tags.push({ key: "inStock", label: "En stock" });
    if (filters.kosherOnly) tags.push({ key: "kosherOnly", label: "Cacherout" });
    if (filters.availableForPlatter) tags.push({ key: "availableForPlatter", label: "Disponible en plateau" });
    return tags;
  },
  removeTag: (filters, key, value) => {
    const next = { ...filters };
    const current = next[key];
    if (Array.isArray(current) && value !== undefined) {
      (next[key] as string[]) = (current as string[]).filter((v) => v !== value);
    } else if (typeof current === "boolean") {
      (next[key] as boolean) = false;
    } else if (key === "smokedFilter") {
      (next.smokedFilter as FishAdvancedFilters["smokedFilter"]) = "";
    } else {
      (next[key] as string) = "";
    }
    return next;
  },
  renderCard: (product, favorited) => (
    <FishCard key={product.id} product={product} initialFavorited={favorited} />
  ),
  itemLabel: (count) => `${count} produit${count > 1 ? "s" : ""}`,
  emptyStateTitle: "Aucun produit ne correspond à votre recherche.",
};
