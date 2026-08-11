import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { getCategories, getPublishedProducts } from "@/lib/data/catalog";
import { getCategoryBySlug } from "@/lib/data/categories";
import { getFavoriteProductIds } from "@/lib/data/favorites";
import { getSiteSettings } from "@/lib/settings";
import { getCategoryVisualConfig, isSalmonCategory } from "@/lib/catalog-visual-config";
import { CategoryFilters } from "@/components/commerce/category-filters";
import { WhatsAppButton, CallButton } from "@/components/commerce/contact-actions";
import { EmptyState } from "@/components/ui/empty-state";
import { WinePhotoGallery } from "@/components/marketing/wine-photo-gallery";
import { WineDescriptions } from "@/components/marketing/wine-descriptions";

export const revalidate = 60;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const category = await getCategoryBySlug(slug);
  if (!category) return {};

  const name = category.name_fr || category.name_he;
  return {
    title: `${name} | Terminal 3`,
    description:
      category.meta_description ??
      category.short_description ??
      `Toute la sélection ${name} chez Terminal 3.`,
  };
}

export default async function CategoryPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const [category, categories, products, favoriteIds, settings] = await Promise.all([
    getCategoryBySlug(slug),
    getCategories(),
    getPublishedProducts({ categorySlug: slug }),
    getFavoriteProductIds(),
    getSiteSettings(),
  ]);

  if (!category) notFound();

  const name = category.name_fr || category.name_he;
  const hasAlcohol = products.some((p) => p.age_restricted);
  const salmon = isSalmonCategory(slug);
  const visualConfig = getCategoryVisualConfig(category);
  const isWineCategory = slug === "alcohol" || slug.includes("vin") || slug.includes("wine");

  return (
    <div className="min-h-screen">
      {/* Category Hero */}
      <section className="relative overflow-hidden border-b border-white/5 bg-warm-black py-20 lg:py-28">
        {category.cover_image && (
          <Image
            src={category.cover_image}
            alt={name}
            fill
            sizes="100vw"
            className="absolute inset-0 object-cover opacity-30"
            priority
          />
        )}
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-obsidian via-obsidian/80 to-obsidian/60" />
        <div className="relative z-10 mx-auto max-w-7xl px-6 lg:px-8">
          <span className="text-xs uppercase tracking-[0.3em] text-champagne">
            {visualConfig.heroLabel}
          </span>
          <h1 className="mt-3 max-w-2xl font-serif text-4xl leading-tight text-ivory sm:text-5xl lg:text-6xl">
            {name}
          </h1>
          {category.short_description && (
            <p className="mt-5 max-w-xl text-sm leading-relaxed text-ivory/70 lg:text-base">
              {category.short_description}
            </p>
          )}
          {category.description && !category.short_description && (
            <p className="mt-5 max-w-xl text-sm leading-relaxed text-ivory/70 lg:text-base">
              {category.description}
            </p>
          )}
          <p className="mt-4 text-sm text-muted-grey">
            {products.length} produit{products.length > 1 ? "s" : ""}
          </p>
        </div>
      </section>

      {/* Navigation & products */}
      <section className="mx-auto max-w-7xl px-6 py-10 lg:px-8">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
          <nav aria-label="Toutes les catégories" className="flex flex-wrap gap-2">
            {categories.map((c) => (
              <Link
                key={c.id}
                href={`/categories/${c.slug}`}
                className={`rounded-full border px-4 py-1.5 text-xs uppercase tracking-widest transition-colors ${
                  c.slug === slug
                    ? "border-champagne text-champagne"
                    : "border-white/10 text-ivory/60 hover:border-white/30"
                }`}
              >
                {c.name_fr || c.name_he}
              </Link>
            ))}
          </nav>

          {hasAlcohol && (
            <div className="flex items-center gap-2 text-xs text-amber-400">
              <span className="h-1.5 w-1.5 rounded-full bg-amber-400" />
              Certains produits sont réservés aux 18+
            </div>
          )}
        </div>

        {/* Product grid with filters */}
        <div className="mt-14">
          {products.length === 0 ? (
            <EmptyState message="Aucun produit disponible dans cette catégorie pour le moment." />
          ) : (
            <CategoryFilters
              products={products}
              favoriteIds={favoriteIds}
              useSalmonCard={salmon}
            />
          )}
        </div>

        {/* CTA */}
        <div className="mt-16 flex flex-col items-center gap-4 border-t border-white/5 pt-12 text-center">
          <h2 className="font-serif text-2xl text-ivory">
            Une question sur {name} ?
          </h2>
          <p className="max-w-md text-sm text-muted-grey">
            Notre équipe vous conseille au magasin ou par message.
          </p>
          <div className="flex flex-col gap-3 sm:flex-row">
            <CallButton phone={settings.STORE_PHONE} />
            <WhatsAppButton whatsapp={settings.STORE_WHATSAPP} />
          </div>
        </div>
      </section>

      {/* Wine Photo Gallery for alcohol category */}
      {isWineCategory && <WinePhotoGallery />}

      {/* Wine Descriptions for alcohol category */}
      {isWineCategory && <WineDescriptions />}
    </div>
  );
}
