import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { getCategories } from "@/lib/data/catalog";
import { EmptyState } from "@/components/ui/empty-state";

export const revalidate = 60;

export const metadata: Metadata = {
  title: "Catégories | Terminal 3",
  description: "Toute la cave et l'épicerie fine Terminal 3, classées par catégorie.",
};

export default async function CategoriesIndexPage() {
  const categories = await getCategories();

  return (
    <div className="mx-auto max-w-7xl px-6 py-16 lg:px-8">
      <header className="mb-14 text-center">
        <span className="text-xs uppercase tracking-[0.3em] text-champagne">
          La sélection
        </span>
        <h1 className="mt-2 font-serif text-3xl text-ivory sm:text-5xl">
          Parcourir la cave
        </h1>
        <p className="mx-auto mt-4 max-w-xl text-sm leading-relaxed text-muted-grey">
          Vins, whiskies, spiritueux, saumon fumé, charcuterie, plateaux et
          épicerie fine — chaque catégorie est une pièce différente de
          Terminal 3.
        </p>
      </header>

      {categories.length === 0 ? (
        <EmptyState message="Le catalogue est en cours de mise à jour." />
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {categories.map((category) => (
            <Link
              key={category.id}
              href={`/categories/${category.slug}`}
              className="group relative flex h-72 flex-col justify-end overflow-hidden rounded-sm border border-white/5 bg-graphite p-6 transition-colors hover:border-champagne/30"
            >
              {category.cover_image ? (
                <Image
                  src={category.cover_image}
                  alt={category.name_fr || category.name_he}
                  fill
                  sizes="(min-width: 1024px) 33vw, 50vw"
                  className="object-cover opacity-60 transition-transform duration-700 group-hover:scale-105"
                />
              ) : (
                <div
                  aria-hidden
                  className="absolute inset-0 bg-[radial-gradient(circle_at_70%_20%,rgba(197,163,90,0.08),transparent_60%)]"
                />
              )}
              <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-obsidian via-obsidian/60 to-transparent" />
              <div className="relative z-10">
                <span className="text-xs uppercase tracking-widest text-champagne">
                  {category.is_featured ? "Collection" : "Catégorie"}
                </span>
                <h2 className="mt-1 font-serif text-2xl text-ivory transition-colors group-hover:text-champagne">
                  {category.name_fr || category.name_he}
                </h2>
                {category.short_description && (
                  <p className="mt-2 line-clamp-2 text-sm text-ivory/60">
                    {category.short_description}
                  </p>
                )}
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
