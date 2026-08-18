"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight, Heart } from "lucide-react";
import type { ProductWithMedia } from "@/lib/data/catalog";

interface NewArrivalsCarouselProps {
  products: ProductWithMedia[];
  favoriteIds: Set<string>;
}

export function NewArrivalsCarousel({ products, favoriteIds }: NewArrivalsCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    if (!isPaused && products.length > 0) {
      const interval = setInterval(() => {
        setCurrentIndex((prev) => (prev + 1) % products.length);
      }, 4000);
      return () => clearInterval(interval);
    }
  }, [isPaused, products.length]);

  const next = () => setCurrentIndex((prev) => (prev + 1) % products.length);
  const prev = () => setCurrentIndex((prev) => (prev - 1 + products.length) % products.length);

  if (products.length === 0) return null;

  const visibleProducts = 4;
  const displayProducts = products.slice(currentIndex, currentIndex + visibleProducts);
  if (displayProducts.length < visibleProducts) {
    displayProducts.push(...products.slice(0, visibleProducts - displayProducts.length));
  }

  return (
    <section 
      className="py-24 bg-fond-papier"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      <div className="mx-auto max-w-[1440px] px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-12">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-gris-chaud mb-2">Nouveautés</p>
            <h2 className="font-serif text-4xl text-noir-profond">Dernières arrivées</h2>
          </div>
          <div className="flex gap-2">
            <button
              onClick={prev}
              className="w-12 h-12 rounded-full border border-or-principal/30 flex items-center justify-center text-or-principal hover:bg-or-principal hover:text-noir-profond transition-colors"
              aria-label="Précédent"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <button
              onClick={next}
              className="w-12 h-12 rounded-full border border-or-principal/30 flex items-center justify-center text-or-principal hover:bg-or-principal hover:text-noir-profond transition-colors"
              aria-label="Suivant"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {displayProducts.map((product, index) => (
            <div
              key={`${product.id}-${index}`}
              className="group relative overflow-hidden rounded-sm border border-or-principal/20 bg-noir-profond transition-all duration-300 hover:border-or-principal/50 hover:shadow-xl hover:shadow-or-principal/10"
            >
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

                <button className="absolute top-3 right-3 rounded-full p-2 bg-noir-chaud/80 backdrop-blur-sm text-texte-clair/60 transition-colors hover:text-or-principal">
                  <Heart className="h-4 w-4" fill={favoriteIds.has(product.id) ? "currentColor" : "none"} />
                </button>

                {product.is_featured && (
                  <div className="absolute top-3 left-3 bg-bordeaux-principal text-texte-clair px-2 py-1 text-xs uppercase tracking-wider">
                    Nouveau
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