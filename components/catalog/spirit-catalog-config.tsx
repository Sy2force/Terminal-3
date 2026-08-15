import type { ProductWithMedia } from "@/lib/data/catalog";
import type { CatalogConfig, ActiveTag } from "@/components/catalog/product-catalog";
import { SpiritCard } from "@/components/catalog/spirit-card";
import { SUBCATEGORY_LABELS } from "@/lib/spirits";

const QUICK_CATEGORIES = [
  { value: "all", label: "Tous" },
  { value: "WHISKY", label: "Whisky" },
  { value: "ARAK", label: "Arak" },
  { value: "COGNAC", label: "Cognac" },
  { value: "VODKA", label: "Vodka" },
  { value: "GIN", label: "Gin" },
  { value: "RHUM", label: "Rhum" },
  { value: "TEQUILA", label: "Tequila" },
  { value: "LIQUEUR", label: "Liqueurs" },
  { value: "APERITIF", label: "Apéritifs" },
  { value: "PREMIUM", label: "Spiritueux premium" },
];

const SORT_OPTIONS = [
  { value: "recommended", label: "Recommandés" },
  { value: "newest", label: "Nouveautés" },
  { value: "price-asc", label: "Prix croissant" },
  { value: "price-desc", label: "Prix décroissant" },
  { value: "rating", label: "Mieux notés" },
  { value: "popular", label: "Plus populaires" },
  { value: "age-asc", label: "Âge croissant" },
  { value: "age-desc", label: "Âge décroissant" },
];

export interface SpiritAdvancedFilters {
  brands: string[];
  countries: string[];
  minAge: string;
  maxAge: string;
  minAbv: string;
  maxAbv: string;
  minPrice: string;
  maxPrice: string;
  minRating: string;
  onPromotion: boolean;
  isNew: boolean;
  isFeatured: boolean;
  isBestSeller: boolean;
  inStock: boolean;
  kosherOnly: boolean;
}

const EMPTY_FILTERS: SpiritAdvancedFilters = {
  brands: [],
  countries: [],
  minAge: "",
  maxAge: "",
  minAbv: "",
  maxAbv: "",
  minPrice: "",
  maxPrice: "",
  minRating: "",
  onPromotion: false,
  isNew: false,
  isFeatured: false,
  isBestSeller: false,
  inStock: false,
  kosherOnly: false,
};

function isNewProduct(product: ProductWithMedia): boolean {
  if (!product.new_until) return false;
  return new Date(product.new_until).getTime() > Date.now();
}

function getPriceAgorot(product: ProductWithMedia): number | null {
  const defaultVariant = product.variants?.find((v) => v.is_default) ?? product.variants?.[0];
  return defaultVariant?.regular_price_agorot ?? product.base_price_agorot ?? null;
}

function getAbv(product: ProductWithMedia): number | null {
  const defaultVariant = product.variants?.find((v) => v.is_default) ?? product.variants?.[0];
  return defaultVariant?.abv ?? null;
}

export const spiritCatalogConfig: CatalogConfig<SpiritAdvancedFilters> = {
  introSurtitle: "La sélection complète",
  introTitle: "Choisissez votre prochaine bouteille.",
  searchPlaceholder: "Rechercher un whisky, un arak ou une marque…",
  searchAriaLabel: "Rechercher un whisky, un arak ou une marque",
  quickFilters: QUICK_CATEGORIES,
  quickFilterAriaLabel: "Filtrer par catégorie de spiritueux",
  matchesQuickFilter: (product, value) => product.subcategory === value,
  getSearchHaystack: (product) => [
    product.name_fr,
    product.name_he,
    product.name_en,
    product.brand,
    product.subcategory ? SUBCATEGORY_LABELS[product.subcategory] : null,
    product.country,
    product.region,
    product.age_years,
    product.description_fr,
    product.nose_notes,
    product.palate_notes,
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
      case "age-asc":
        return (a.age_years ?? Infinity) - (b.age_years ?? Infinity);
      case "age-desc":
        return (b.age_years ?? -Infinity) - (a.age_years ?? -Infinity);
      case "newest":
        return new Date(b.published_at ?? 0).getTime() - new Date(a.published_at ?? 0).getTime();
      default:
        return (b.is_featured ? 1 : 0) - (a.is_featured ? 1 : 0);
    }
  },
  emptyFilters: EMPTY_FILTERS,
  countActiveFilters: (filters) =>
    filters.brands.length +
    filters.countries.length +
    (filters.minAge ? 1 : 0) +
    (filters.maxAge ? 1 : 0) +
    (filters.minAbv ? 1 : 0) +
    (filters.maxAbv ? 1 : 0) +
    (filters.minPrice ? 1 : 0) +
    (filters.maxPrice ? 1 : 0) +
    (filters.minRating ? 1 : 0) +
    (filters.onPromotion ? 1 : 0) +
    (filters.isNew ? 1 : 0) +
    (filters.isFeatured ? 1 : 0) +
    (filters.isBestSeller ? 1 : 0) +
    (filters.inStock ? 1 : 0) +
    (filters.kosherOnly ? 1 : 0),
  matchesFilters: (product, filters) => {
    if (filters.brands.length && !filters.brands.includes(product.brand ?? "")) return false;
    if (filters.countries.length && !filters.countries.includes(product.country ?? "")) return false;
    const age = product.age_years;
    if (filters.minAge && (age == null || age < Number(filters.minAge))) return false;
    if (filters.maxAge && (age == null || age > Number(filters.maxAge))) return false;
    const abv = getAbv(product);
    if (filters.minAbv && (abv == null || abv < Number(filters.minAbv))) return false;
    if (filters.maxAbv && (abv == null || abv > Number(filters.maxAbv))) return false;
    const price = getPriceAgorot(product);
    if (filters.minPrice && (price == null || price < Number(filters.minPrice) * 100)) return false;
    if (filters.maxPrice && (price == null || price > Number(filters.maxPrice) * 100)) return false;
    if (filters.minRating && (product.rating == null || product.rating < Number(filters.minRating))) return false;
    if (filters.onPromotion && !product.compare_at_price_agorot) return false;
    if (filters.isNew && !isNewProduct(product)) return false;
    if (filters.isFeatured && !product.is_featured) return false;
    if (filters.isBestSeller && !product.is_best_seller) return false;
    if (filters.inStock && product.availability_status === "OUT_OF_STOCK") return false;
    if (filters.kosherOnly && !product.kosher_status) return false;
    return true;
  },
  renderFilterFields: ({ draft, setDraft, products }) => {
    const brandOptions = Array.from(
      new Set(products.map((p) => p.brand).filter((v): v is string => Boolean(v))),
    ).sort();
    const countryOptions = Array.from(
      new Set(products.map((p) => p.country).filter((v): v is string => Boolean(v))),
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

        {countryOptions.length > 0 && (
          <fieldset>
            <legend className="text-xs font-medium uppercase tracking-widest text-bordeaux-principal">
              Pays
            </legend>
            <div className="mt-3 flex flex-col gap-2">
              {countryOptions.map((country) => (
                <label key={country} className="flex items-center gap-2.5 text-sm text-noir-profond">
                  <input
                    type="checkbox"
                    checked={draft.countries.includes(country)}
                    onChange={(e) =>
                      setDraft((prev) => ({
                        ...prev,
                        countries: e.target.checked
                          ? [...prev.countries, country]
                          : prev.countries.filter((c) => c !== country),
                      }))
                    }
                    className="h-4 w-4 rounded-sm border-brun-cave/40 text-bordeaux-principal focus:ring-bordeaux-principal"
                  />
                  {country}
                </label>
              ))}
            </div>
          </fieldset>
        )}

        <fieldset>
          <legend className="text-xs font-medium uppercase tracking-widest text-bordeaux-principal">
            Âge (ans)
          </legend>
          <div className="mt-3 flex items-center gap-3">
            <label className="flex-1">
              <span className="sr-only">Âge minimum</span>
              <input
                type="number"
                min={0}
                placeholder="Min"
                value={draft.minAge}
                onChange={(e) => setDraft((prev) => ({ ...prev, minAge: e.target.value }))}
                className="w-full rounded-sm border border-brun-cave/25 bg-white px-3 py-2 text-sm focus:border-bordeaux-principal focus:outline-none"
              />
            </label>
            <span className="text-gris-chaud">—</span>
            <label className="flex-1">
              <span className="sr-only">Âge maximum</span>
              <input
                type="number"
                min={0}
                placeholder="Max"
                value={draft.maxAge}
                onChange={(e) => setDraft((prev) => ({ ...prev, maxAge: e.target.value }))}
                className="w-full rounded-sm border border-brun-cave/25 bg-white px-3 py-2 text-sm focus:border-bordeaux-principal focus:outline-none"
              />
            </label>
          </div>
        </fieldset>

        <fieldset>
          <legend className="text-xs font-medium uppercase tracking-widest text-bordeaux-principal">
            Degré d&apos;alcool (%)
          </legend>
          <div className="mt-3 flex items-center gap-3">
            <label className="flex-1">
              <span className="sr-only">Degré minimum</span>
              <input
                type="number"
                min={0}
                max={100}
                placeholder="Min"
                value={draft.minAbv}
                onChange={(e) => setDraft((prev) => ({ ...prev, minAbv: e.target.value }))}
                className="w-full rounded-sm border border-brun-cave/25 bg-white px-3 py-2 text-sm focus:border-bordeaux-principal focus:outline-none"
              />
            </label>
            <span className="text-gris-chaud">—</span>
            <label className="flex-1">
              <span className="sr-only">Degré maximum</span>
              <input
                type="number"
                min={0}
                max={100}
                placeholder="Max"
                value={draft.maxAbv}
                onChange={(e) => setDraft((prev) => ({ ...prev, maxAbv: e.target.value }))}
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
            Cacherout uniquement
          </label>
        </fieldset>
      </>
    );
  },
  getActiveTags: (filters) => {
    const tags: ActiveTag<SpiritAdvancedFilters>[] = [];
    filters.brands.forEach((b) => tags.push({ key: "brands", value: b, label: b }));
    filters.countries.forEach((c) => tags.push({ key: "countries", value: c, label: c }));
    if (filters.minAge) tags.push({ key: "minAge", label: `Dès ${filters.minAge} ans` });
    if (filters.maxAge) tags.push({ key: "maxAge", label: `Jusqu'à ${filters.maxAge} ans` });
    if (filters.minAbv) tags.push({ key: "minAbv", label: `Dès ${filters.minAbv}%` });
    if (filters.maxAbv) tags.push({ key: "maxAbv", label: `Jusqu'à ${filters.maxAbv}%` });
    if (filters.minPrice) tags.push({ key: "minPrice", label: `Dès ${filters.minPrice} ₪` });
    if (filters.maxPrice) tags.push({ key: "maxPrice", label: `Jusqu'à ${filters.maxPrice} ₪` });
    if (filters.minRating) tags.push({ key: "minRating", label: `${filters.minRating}+ étoiles` });
    if (filters.onPromotion) tags.push({ key: "onPromotion", label: "En promotion" });
    if (filters.isNew) tags.push({ key: "isNew", label: "Nouveautés" });
    if (filters.isFeatured) tags.push({ key: "isFeatured", label: "Recommandés" });
    if (filters.isBestSeller) tags.push({ key: "isBestSeller", label: "Best-seller" });
    if (filters.inStock) tags.push({ key: "inStock", label: "En stock" });
    if (filters.kosherOnly) tags.push({ key: "kosherOnly", label: "Cacherout" });
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
    <SpiritCard key={product.id} product={product} initialFavorited={favorited} />
  ),
  itemLabel: (count) => `${count} spiritueux`,
  emptyStateTitle: "Aucun spiritueux ne correspond à votre recherche.",
};
