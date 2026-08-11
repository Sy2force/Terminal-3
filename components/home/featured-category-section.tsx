import Link from "next/link";
import type { CategoryRow } from "@/types/database";
import type { ProductWithMedia } from "@/lib/data/catalog";
import { ProductCard } from "@/components/commerce/product-card";

interface FeaturedCategorySectionProps {
  title: string;
  subtitle?: string;
  category: CategoryRow | null;
  products: ProductWithMedia[];
  favoriteIds: Set<string>;
}

export function FeaturedCategorySection({
  title,
  subtitle,
  category,
  products,
  favoriteIds,
}: FeaturedCategorySectionProps) {
  if (!category || products.length === 0) return null;

  return (
    <section className="border-b border-white/5 py-24 bg-obsidian">
      <div className="mx-auto max-w-[1440px] px-6 sm:px-8 lg:px-12">
        <div className="mb-12 flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-end">
          <div>
            <p className="text-xs uppercase tracking-[0.4em] text-champagne/60 mb-3">
              {subtitle ?? "Collection"}
            </p>
            <h2 className="font-serif text-3xl sm:text-4xl md:text-5xl text-ivory">
              {title}
            </h2>
          </div>
          <Link
            href={`/categories/${category.slug}`}
            className="group inline-flex items-center gap-2 text-sm text-champagne hover:text-soft-gold transition-colors"
          >
            Voir tout
            <svg
              className="h-4 w-4 transition-transform group-hover:translate-x-1"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M17 8l4 4m0 0l-4 4m4-4H3"
              />
            </svg>
          </Link>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {products.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              isFavorited={favoriteIds.has(product.id)}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
