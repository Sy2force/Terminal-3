import type { Metadata } from "next";
import { getActivePromotions } from "@/lib/data/promotions";
import { PromotionCard } from "@/components/commerce/promotion-card";
import { getPublishedPageContent, buildPageMetadata } from "@/lib/data/page-contents";

export const revalidate = 30;

export async function generateMetadata(): Promise<Metadata> {
  return buildPageMetadata("promotions", {
    title: "Les offres Terminal 3",
    description:
      "Découvrez les promotions actives chez Terminal 3 : vins, whiskies, spiritueux, saumon fumé et charcuterie.",
    canonical: "/promotions",
  });
}

const FILTERS = [
  { label: "Tout", value: undefined },
  { label: "Vin", value: "vin" },
  { label: "Whisky", value: "whisky" },
  { label: "Spiritueux", value: "spiritueux" },
  { label: "Poisson", value: "saumon-fume" },
  { label: "Charcuterie", value: "charcuterie" },
];

export default async function PromotionsPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const [{ category }, pageContent] = await Promise.all([
    searchParams,
    getPublishedPageContent("promotions"),
  ]);
  const categorySlug = typeof category === "string" ? category : undefined;

  const promotions = await getActivePromotions();
  const filtered = categorySlug
    ? promotions.filter((p) => p.product?.category?.slug === categorySlug)
    : promotions;

  return (
    <div
      data-analytics-event="view_promotion"
      className="mx-auto max-w-7xl px-6 py-12 lg:px-8"
    >
      <header className="mb-6 text-center">
        <span className="text-xs uppercase tracking-[0.3em] text-champagne">
          Offres du moment
        </span>
        <h1 className="mt-2 font-serif text-3xl text-ivory sm:text-4xl">
          {pageContent?.title ?? "Les offres Terminal 3"}
        </h1>
      </header>

      {promotions.length > 0 && (
        <nav
          aria-label="Filtrer les offres"
          className="mb-8 flex flex-wrap justify-center gap-2"
        >
          {FILTERS.map((f) => (
            <a
              key={f.label}
              href={f.value ? `/promotions?category=${f.value}` : "/promotions"}
              className={`rounded-full border px-4 py-1.5 text-xs uppercase tracking-widest transition-colors ${
                categorySlug === f.value
                  ? "border-champagne text-champagne"
                  : "border-white/10 text-ivory/60 hover:border-white/30"
              }`}
            >
              {f.label}
            </a>
          ))}
        </nav>
      )}

      {filtered.length === 0 ? (
        <div className="mx-auto max-w-md rounded-sm border border-or-principal/10 bg-noir-profond/40 p-6 text-center">
          <p className="text-ivory/90">
            {categorySlug
              ? "Aucune offre ne correspond à cette catégorie."
              : promotions.length === 0
                ? "Aucune promotion en cours pour le moment."
                : "Aucune offre ne correspond aux critères sélectionnés."}
          </p>
          <a
            href={categorySlug ? "/promotions" : "/nouveautes"}
            className="mt-4 inline-block text-sm text-champagne hover:underline"
          >
            {categorySlug ? "Toutes les offres" : "Découvrir les nouveautés"}
          </a>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((promo) => (
            <PromotionCard key={promo.id} promotion={promo} />
          ))}
        </div>
      )}
    </div>
  );
}
