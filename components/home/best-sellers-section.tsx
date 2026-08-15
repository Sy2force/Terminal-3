import Link from "next/link";
import Image from "next/image";
import { Heart, Star, ArrowRight } from "lucide-react";
import type { ProductWithMedia } from "@/lib/data/catalog";

interface BestSellersSectionProps {
  products: ProductWithMedia[];
  favoriteIds: Set<string>;
}

export function BestSellersSection({ products, favoriteIds }: BestSellersSectionProps) {
  const bestSellers = products.slice(0, 8);

  return (
    <section className="py-24 bg-beige">
      <div className="mx-auto max-w-[1440px] px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-12">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-gris-chaud mb-2">La sélection</p>
            <h2 className="font-serif text-4xl text-noir-profond">Les mieux notés de la semaine</h2>
          </div>
          <Link
            href="/nouveautes"
            className="inline-flex items-center gap-2 text-or-principal hover:underline"
          >
            <span className="text-sm uppercase tracking-wider">Voir toute la sélection</span>
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {bestSellers.map((product) => (
            <div
              key={product.id}
              className="group relative overflow-hidden rounded-sm border border-or-principal/20 bg-noir-profond transition-all duration-300 hover:border-or-principal/50 hover:shadow-xl hover:shadow-or-principal/10"
            >
              <div className="relative aspect-[3/4] overflow-hidden bg-gradient-to-b from-brun-cave to-noir-profond">
                {product.media?.[0]?.url ? (
                  <Image
                    src={product.media[0].url}
                    alt={product.name_fr || product.name_he}
                    fill
                    className="object-contain p-4 transition-transform duration-500 group-hover:scale-105"
                  />
                ) : (
                  <div className="flex h-full items-center justify-center">
                    <span className="text-texte-clair/30 font-serif text-center px-4 text-sm">
                      {product.name_fr || product.name_he}
                    </span>
                  </div>
                )}

                <button className="absolute top-3 right-3 rounded-full p-2 bg-noir-chaud/80 backdrop-blur-sm text-texte-clair/60 transition-colors hover:text-or-principal">
                  <Heart className="h-4 w-4" fill={favoriteIds.has(product.id) ? "currentColor" : "none"} />
                </button>

                {product.tasting_notes && (
                  <div className="absolute bottom-3 left-3 flex items-center gap-1 bg-bordeaux-principal/80 backdrop-blur-sm px-2 py-1 rounded-full">
                    <Star className="h-3 w-3 text-or-principal fill-current" />
                    <span className="text-xs text-texte-clair">4.8</span>
                  </div>
                )}
              </div>

              <div className="p-5 space-y-3">
                <h3 className="font-serif text-lg text-texte-clair leading-tight">
                  {product.name_fr || product.name_he}
                </h3>
                {product.brand && (
                  <p className="text-sm text-texte-clair/60">{product.brand}</p>
                )}
                <div className="flex items-baseline gap-2">
                  {product.compare_at_price_agorot && (
                    <span className="text-sm text-texte-clair/40 line-through">
                      {Math.round(product.compare_at_price_agorot / 100)} ₪
                    </span>
                  )}
                  <span className="font-serif text-xl text-or-principal">
                    {Math.round((product.variants && product.variants.length > 0 && product.variants[0].regular_price_agorot ? product.variants[0].regular_price_agorot : product.base_price_agorot || 0) / 100)} ₪
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}