"use client";

import type { ProductWithMedia } from "@/lib/data/catalog";
import { formatAgorot } from "@/lib/money";

interface ProductSpecsProps {
  product: ProductWithMedia;
}

export function ProductSpecs({ product }: ProductSpecsProps) {
  const defaultVariant =
    product.variants?.find((v) => v.is_default) ?? product.variants?.[0];

  const specs: { label: string; value: string | null }[] = [
    { label: "Marque", value: product.brand },
    { label: "Catégorie", value: product.category?.name_fr ?? product.category?.name_he ?? null },
    { label: "Type", value: product.product_type === "PLATTER" ? "Plateau" : null },
    { label: "Sous-catégorie", value: product.subcategory },
    { label: "Cépage", value: product.grape_varieties?.join(", ") || null },
    { label: "Couleur", value: product.wine_type },
    { label: "Millésime", value: defaultVariant?.vintage ? String(defaultVariant.vintage) : null },
    { label: "Âge", value: product.age_years ? `${product.age_years} ans` : null },
    { label: "Volume", value: defaultVariant?.volume_ml ? `${defaultVariant.volume_ml} ml` : null },
    { label: "Poids", value: defaultVariant?.weight_g ? `${defaultVariant.weight_g} g` : null },
    { label: "Degré d'alcool", value: defaultVariant?.abv ? `${defaultVariant.abv}%` : null },
    { label: "Pays", value: product.country },
    { label: "Région", value: product.region },
    { label: "Méthode de vinification", value: product.vinification_method },
    { label: "Type de fût", value: product.cask_type },
    { label: "Édition", value: product.edition },
    { label: "Méthode de production", value: product.production_method },
    { label: "Température de service", value: product.serving_temperature },
    { label: "Type de viande", value: product.meat_type },
    { label: "Type de poisson", value: product.fish_type },
    { label: "Préparation", value: product.preparation_method },
    { label: "Fumé", value: product.smoked ? "Oui" : null },
    { label: "Cacherout", value: product.kosher_status },
    { label: "Allergènes", value: product.allergen_info },
    { label: "Composition", value: product.composition_text },
    { label: "Conservation", value: product.storage_info },
  ];

  const visible = specs.filter((s) => s.value && s.value.trim().length > 0);

  if (visible.length === 0) return null;

  return (
    <div className="rounded-sm border border-white/5 bg-graphite/30 p-4">
      <h2 className="font-serif text-lg text-ivory">Caractéristiques</h2>
      <dl className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
        {visible.map(({ label, value }) => (
          <div key={label}>
            <dt className="text-xs text-ivory/50">{label}</dt>
            <dd className="text-sm font-medium text-ivory">{value}</dd>
          </div>
        ))}
      </dl>
      {defaultVariant?.regular_price_agorot != null && product.compare_at_price_agorot != null && product.compare_at_price_agorot > defaultVariant.regular_price_agorot && (
        <p className="mt-4 text-sm text-green-300">
          Promotion : {formatAgorot(product.compare_at_price_agorot - defaultVariant.regular_price_agorot)} d&apos;économie
        </p>
      )}
    </div>
  );
}
