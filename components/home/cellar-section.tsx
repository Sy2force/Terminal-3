import Link from "next/link";
import Image from "next/image";
import type { CategoryRow } from "@/types/database";

interface CellarSectionProps {
  categories: CategoryRow[];
}

export function CellarSection({ categories }: CellarSectionProps) {
  return (
    <section className="border-y border-white/5 bg-graphite/30 py-20">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <header className="mb-12 text-center">
          <span className="text-xs uppercase tracking-[0.3em] text-champagne">La cave</span>
          <h2 className="mt-2 font-serif text-3xl text-ivory sm:text-4xl">Explorer</h2>
          <p className="mx-auto mt-3 max-w-xl text-sm text-muted-grey">
            Tous les univers Terminal 3, mis à jour depuis l’admin.
          </p>
        </header>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {categories.map((category) => (
            <Link
              key={category.id}
              href={`/categories/${category.slug}`}
              className="group relative flex h-64 flex-col justify-end overflow-hidden rounded-sm border border-white/5 bg-obsidian p-6 transition-colors hover:border-champagne/30"
            >
              {category.cover_image ? (
                <Image
                  src={category.cover_image}
                  alt={category.name_fr || category.name_he}
                  fill
                  sizes="(min-width: 1024px) 33vw, 50vw"
                  className="object-cover opacity-40 transition-transform duration-700 group-hover:scale-105"
                />
              ) : (
                <div
                  aria-hidden
                  className="absolute inset-0 bg-[radial-gradient(circle_at_70%_20%,rgba(197,163,90,0.08),transparent_60%)]"
                />
              )}
              <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-obsidian via-obsidian/70 to-transparent" />
              <div className="relative z-10">
                <h3 className="font-serif text-xl text-ivory transition-colors group-hover:text-champagne">
                  {category.name_fr || category.name_he}
                </h3>
                {category.short_description && (
                  <p className="mt-2 line-clamp-2 text-sm text-ivory/70">
                    {category.short_description}
                  </p>
                )}
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
