import type { Metadata } from "next";
import { getNewArrivals, getCategories } from "@/lib/data/catalog";
import { getFavoriteProductIds } from "@/lib/data/favorites";
import { ProductCard } from "@/components/commerce/product-card";
import { EmptyState } from "@/components/ui/empty-state";

export const revalidate = 60;

export const metadata: Metadata = {
  title: "Nouveautés | Terminal 3",
  description:
    "Les dernières arrivées Terminal 3 : vins, whiskies, saumons fumés et sélections gourmandes.",
};

export default async function NewArrivalsPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const { category } = await searchParams;
  const categorySlug = typeof category === "string" ? category : undefined;

  const [products, categories, favoriteIds] = await Promise.all([
    getNewArrivals(60),
    getCategories(),
    getFavoriteProductIds(),
  ]);

  const filtered = categorySlug
    ? products.filter((p) => p.category?.slug === categorySlug)
    : products;

  return (
    <div className="mx-auto max-w-7xl px-6 py-16 lg:px-8">
      <header className="mb-10">
        <span className="text-xs uppercase tracking-[0.3em] text-champagne">
          Just arrived
        </span>
        <h1 className="mt-2 font-serif text-3xl text-ivory sm:text-4xl">
          Nouveautés
        </h1>
        <p className="mt-3 max-w-xl text-sm text-muted-grey">
          Chaque semaine, de nouvelles pièces rejoignent la cave et
          l&rsquo;épicerie Terminal 3.
        </p>
      </header>

      {categories.length > 0 && (
        <nav
          aria-label="Filtrer par catégorie"
          className="mb-10 flex flex-wrap gap-2"
        >
          <a
            href="/new"
            className={`rounded-full border px-4 py-1.5 text-xs uppercase tracking-widest transition-colors ${
              !categorySlug
                ? "border-champagne text-champagne"
                : "border-white/10 text-ivory/60 hover:border-white/30"
            }`}
          >
            Tout
          </a>
          {categories.map((c) => (
            <a
              key={c.id}
              href={`/new?category=${c.slug}`}
              className={`rounded-full border px-4 py-1.5 text-xs uppercase tracking-widest transition-colors ${
                categorySlug === c.slug
                  ? "border-champagne text-champagne"
                  : "border-white/10 text-ivory/60 hover:border-white/30"
              }`}
            >
              {c.name_fr || c.name_he}
            </a>
          ))}
        </nav>
      )}

      {filtered.length === 0 ? (
        <EmptyState message="De nouvelles sélections arrivent bientôt." />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {filtered.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              isFavorited={favoriteIds.has(product.id)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
