import Link from "next/link";
import Image from "next/image";
import { Heart, Star } from "lucide-react";
import type { ProductWithMedia } from "@/lib/data/catalog";

interface SelectionCavisteSectionProps {
  products: ProductWithMedia[];
  favoriteIds: Set<string>;
}

export function SelectionCavisteSection({ products, favoriteIds }: SelectionCavisteSectionProps) {
  const featuredProducts = products.slice(0, 4);

  return (
    <section className="py-24 bg-beige">
      <div className="mx-auto max-w-[1440px] px-4 sm:px-6 lg:px-8">
        {/* Section header */}
        <div className="mb-16">
          <p className="text-xs uppercase tracking-[0.3em] text-gris-chaud mb-2">La sélection du caviste</p>
          <h2 className="font-serif text-4xl sm:text-5xl lg:text-6xl text-noir-profond">
            Des bouteilles qui méritent une place à table.
          </h2>
        </div>

        {/* Products grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {featuredProducts.map((product) => (
            <div
              key={product.id}
              className="group relative overflow-hidden rounded-sm border border-or-principal/20 bg-white transition-all duration-300 hover:border-or-principal/50 hover:shadow-xl hover:shadow-or-principal/10"
            >
              {/* Product image */}
              <div className="relative aspect-[3/4] overflow-hidden bg-gradient-to-b from-brun-cave to-noir-profond">
                {product.media?.[0]?.url ? (
                  <Image
                    src={product.media[0].url}
                    alt={product.name_fr || product.name_he}
                    fill
                    sizes="(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 100vw"
                    className="object-contain p-4 transition-transform duration-500 group-hover:scale-105"
                  />
                ) : (
                  <div className="flex h-full items-center justify-center">
                    <span className="text-texte-clair/30 font-serif text-center px-4 text-sm">
                      {product.name_fr || product.name_he}
                    </span>
                  </div>
                )}

                {/* Favorite button */}
                <button
                  className="absolute top-3 right-3 rounded-full p-2 bg-white/80 backdrop-blur-sm text-noir-profond/60 transition-colors hover:text-or-principal hover:bg-white"
                  aria-label="Ajouter aux favoris"
                >
                  <Heart className="h-4 w-4" fill={favoriteIds.has(product.id) ? "currentColor" : "none"} />
                </button>

                {/* Badge */}
                {product.is_featured && (
                  <div className="absolute top-3 left-3 bg-bordeaux-principal text-texte-clair px-2 py-1 text-xs uppercase tracking-wider">
                    Sélection
                  </div>
                )}
              </div>

              {/* Product info */}
              <div className="p-5 space-y-3">
                {/* Type and region */}
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gris-chaud uppercase tracking-wider">
                    {product.category?.name_fr || product.category?.name_he || ""}
                  </span>
                  {product.tasting_notes && (
                    <div className="flex items-center gap-1 text-or-principal">
                      <Star className="h-3 w-3 fill-current" />
                      <span className="text-xs font-medium">4.8</span>
                    </div>
                  )}
                </div>

                {/* Name */}
                <h3 className="font-serif text-lg text-noir-profond leading-tight">
                  {product.name_fr || product.name_he}
                </h3>

                {/* Brand */}
                {product.brand && (
                  <p className="text-sm text-gris-chaud">{product.brand}</p>
                )}

                {/* Vintage */}
                {product.variants?.[0]?.vintage && (
                  <p className="text-xs text-gris-chaud/50">{product.variants[0].vintage}</p>
                )}

                {/* Tasting notes */}
                {product.tasting_notes && (
                  <p className="text-xs text-gris-chaud/40 line-clamp-2">
                    {product.tasting_notes}
                  </p>
                )}

                {/* Price */}
                <div className="flex items-center justify-between pt-3 border-t border-or-principal/10">
                  <div className="flex items-baseline gap-2">
                    {product.compare_at_price_agorot && (
                      <span className="text-sm text-gris-chaud/40 line-through">
                        {Math.round(product.compare_at_price_agorot / 100)} ₪
                      </span>
                    )}
                    <span className="font-serif text-xl text-or-principal">
                      {Math.round((product.variants && product.variants.length > 0 && product.variants[0].regular_price_agorot ? product.variants[0].regular_price_agorot : product.base_price_agorot || 0) / 100)} ₪
                    </span>
                  </div>
                  <Link
                    href={
                      product.category?.slug === "vin"
                        ? `/vins/${product.slug}`
                        : `/products/${product.slug}`
                    }
                    className="text-xs text-or-principal uppercase tracking-wider hover:underline"
                  >
                    Découvrir
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}