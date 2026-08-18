"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Heart, Star, Search } from "lucide-react";
import type { ProductWithMedia } from "@/lib/data/catalog";

interface WineCatalogProps {
  products: ProductWithMedia[];
  categories?: unknown[];
  favoriteIds: Set<string>;
  title?: string;
  description?: string;
}

export function WineCatalogClient({ products, favoriteIds, title = "Nos vins", description = "Grands domaines israéliens, cuvées confidentielles et bouteilles à ouvrir sans attendre." }: WineCatalogProps) {
  const [selectedFilters, setSelectedFilters] = useState({
    type: "all",
    priceRange: "all",
    inStock: false,
    onPromotion: false,
  });
  const [sortBy, setSortBy] = useState("popularity");
  const [searchQuery, setSearchQuery] = useState("");

  // Filter products
  const filteredProducts = products.filter((product) => {
    if (searchQuery && !product.name_fr?.toLowerCase().includes(searchQuery.toLowerCase()) && 
        !product.name_he?.toLowerCase().includes(searchQuery.toLowerCase())) {
      return false;
    }
    if (selectedFilters.inStock && product.availability_status === "OUT_OF_STOCK") {
      return false;
    }
    if (selectedFilters.onPromotion && !product.compare_at_price_agorot) {
      return false;
    }
    return true;
  });

  // Sort products
  const sortedProducts = [...filteredProducts].sort((a, b) => {
    switch (sortBy) {
      case "price-asc":
        return (a.base_price_agorot || 0) - (b.base_price_agorot || 0);
      case "price-desc":
        return (b.base_price_agorot || 0) - (a.base_price_agorot || 0);
      case "newest":
        return new Date(b.published_at || "").getTime() - new Date(a.published_at || "").getTime();
      default:
        return 0;
    }
  });

  return (
    <div className="min-h-screen bg-noir-profond">
      {/* Cover section */}
      <div className="relative h-96 bg-gradient-to-br from-bordeaux-principal via-brun-cave to-noir-profond">
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center">
            <h1 className="font-serif text-5xl sm:text-6xl lg:text-7xl text-texte-clair mb-4">
              {title}
            </h1>
            <p className="text-lg text-texte-clair/70 max-w-2xl mx-auto">
              {description}
            </p>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-[1440px] px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Filters sidebar */}
          <aside className="lg:w-64 flex-shrink-0">
            <div className="sticky top-24 space-y-8">
              {/* Search */}
              <div>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-texte-clair/40" />
                  <input
                    type="text"
                    placeholder="Rechercher un vin..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 bg-noir-chaud border border-or-principal/20 rounded-sm text-texte-clair placeholder:text-texte-clair/40 focus:outline-none focus:border-or-principal"
                  />
                </div>
              </div>

              {/* Type filter */}
              <div>
                <h3 className="text-sm uppercase tracking-wider text-or-principal mb-4">Type</h3>
                <div className="space-y-2">
                  {["Tous", "Rouge", "Blanc", "Rosé", "Effervescent", "Doux"].map((type) => (
                    <button
                      key={type}
                      onClick={() => setSelectedFilters({ ...selectedFilters, type: type.toLowerCase() })}
                      className={`w-full text-left px-3 py-2 rounded-sm transition-colors ${
                        selectedFilters.type === type.toLowerCase()
                          ? "bg-or-principal text-noir-profond"
                          : "text-texte-clair/70 hover:bg-noir-chaud"
                      }`}
                    >
                      {type}
                    </button>
                  ))}
                </div>
              </div>

              {/* Additional filters */}
              <div>
                <h3 className="text-sm uppercase tracking-wider text-or-principal mb-4">Filtres</h3>
                <div className="space-y-3">
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={selectedFilters.inStock}
                      onChange={(e) => setSelectedFilters({ ...selectedFilters, inStock: e.target.checked })}
                      className="w-4 h-4 rounded border-or-principal/30 bg-noir-chaud text-or-principal focus:ring-or-principal"
                    />
                    <span className="text-texte-clair/70">En stock</span>
                  </label>
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={selectedFilters.onPromotion}
                      onChange={(e) => setSelectedFilters({ ...selectedFilters, onPromotion: e.target.checked })}
                      className="w-4 h-4 rounded border-or-principal/30 bg-noir-chaud text-or-principal focus:ring-or-principal"
                    />
                    <span className="text-texte-clair/70">En promotion</span>
                  </label>
                </div>
              </div>

              {/* Sort */}
              <div>
                <h3 className="text-sm uppercase tracking-wider text-or-principal mb-4">Trier par</h3>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="w-full px-3 py-2 bg-noir-chaud border border-or-principal/20 rounded-sm text-texte-clair focus:outline-none focus:border-or-principal"
                >
                  <option value="popularity">Popularité</option>
                  <option value="price-asc">Prix croissant</option>
                  <option value="price-desc">Prix décroissant</option>
                  <option value="newest">Nouveautés</option>
                </select>
              </div>
            </div>
          </aside>

          {/* Products grid */}
          <div className="flex-1">
            <div className="flex items-center justify-between mb-6">
              <p className="text-texte-clair/60">
                {sortedProducts.length} produit{sortedProducts.length > 1 ? "s" : ""} trouvé{sortedProducts.length > 1 ? "s" : ""}
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {sortedProducts.map((product) => (
                <div
                  key={product.id}
                  className="group relative overflow-hidden rounded-sm border border-or-principal/20 bg-noir-chaud transition-all duration-300 hover:border-or-principal/50 hover:shadow-xl hover:shadow-or-principal/10"
                >
                  {/* Product image */}
                  <div className="relative aspect-[3/4] overflow-hidden bg-gradient-to-b from-brun-cave to-noir-profond">
                    {product.media?.[0]?.url ? (
                      <Image
                        src={product.media[0].url}
                        alt={product.name_fr || product.name_he}
                        fill
                        sizes="(min-width: 1024px) 25vw, (min-width: 640px) 33vw, 100vw"
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
                      className="absolute top-3 right-3 rounded-full p-2 bg-noir-profond/80 backdrop-blur-sm text-texte-clair/60 transition-colors hover:text-or-principal hover:bg-noir-profond"
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

                    {/* Promotion badge */}
                    {product.compare_at_price_agorot && (
                      <div className="absolute bottom-3 left-3 bg-or-principal text-noir-profond px-2 py-1 text-xs font-bold">
                        -{Math.round((1 - (product.base_price_agorot || 0) / product.compare_at_price_agorot) * 100)}%
                      </div>
                    )}
                  </div>

                  {/* Product info */}
                  <div className="p-5 space-y-3">
                    {/* Type and region */}
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-texte-clair/50 uppercase tracking-wider">
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
                    <h3 className="font-serif text-lg text-texte-clair leading-tight">
                      {product.name_fr || product.name_he}
                    </h3>

                    {/* Brand */}
                    {product.brand && (
                      <p className="text-sm text-texte-clair/60">{product.brand}</p>
                    )}

                    {/* Vintage */}
                    {product.variants?.[0]?.vintage && (
                      <p className="text-xs text-texte-clair/50">{product.variants[0].vintage}</p>
                  )}

                    {/* Price */}
                    <div className="flex items-center justify-between pt-3 border-t border-or-principal/10">
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
                      <Link
                        href={`/products/${product.slug}`}
                        className="text-xs text-or-principal uppercase tracking-wider hover:underline"
                      >
                        Découvrir
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {sortedProducts.length === 0 && (
              <div className="text-center py-12">
                <p className="text-texte-clair/60">Aucun vin ne correspond à votre recherche.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}