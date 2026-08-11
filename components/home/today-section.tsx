import Link from "next/link";
import { Badge } from "@/components/commerce/badge";
import { EmptyState } from "@/components/ui/empty-state";
import { formatAgorot } from "@/lib/money";
import type { PromotionWithProduct } from "@/lib/data/promotions";
import type { ProductWithMedia } from "@/lib/data/catalog";

interface Highlight {
  key: string;
  label: string;
  title: string;
  price?: string;
  href: string;
}

function buildHighlights(
  promotions: PromotionWithProduct[],
  newArrivals: ProductWithMedia[],
): Highlight[] {
  const highlights: Highlight[] = [];

  for (const promo of promotions) {
    if (highlights.length >= 5) break;
    const name = promo.product ? promo.product.name_fr || promo.product.name_he : promo.title;
    highlights.push({
      key: `promo-${promo.id}`,
      label: "Promo du jour",
      title: name,
      price: formatAgorot(promo.promo_price_agorot),
      href: promo.product ? `/products/${promo.product.slug}` : `/promotions/${promo.slug}`,
    });
  }

  for (const product of newArrivals) {
    if (highlights.length >= 5) break;
    highlights.push({
      key: `new-${product.id}`,
      label: "Nouvel arrivage",
      title: product.name_fr || product.name_he,
      href: `/products/${product.slug}`,
    });
  }

  return highlights;
}

export function TodaySection({
  promotions,
  newArrivals,
}: {
  promotions: PromotionWithProduct[];
  newArrivals: ProductWithMedia[];
}) {
  const highlights = buildHighlights(promotions, newArrivals);

  return (
    <section className="mx-auto max-w-[1440px] px-6 py-24 sm:px-8 lg:px-12">
      <div className="mb-12">
        <p className="text-xs uppercase tracking-[0.4em] text-champagne/60 mb-3">
          Chapitre 02
        </p>
        <h2 className="font-serif text-3xl sm:text-4xl md:text-5xl text-ivory">
          La Sélection de la Semaine
        </h2>
        <p className="mt-4 text-sm sm:text-base text-ivory/60 max-w-2xl">
          Nos coups de cœur et nouveautés, choisis avec exigence pour vous.
        </p>
      </div>

      {highlights.length === 0 ? (
        <EmptyState
          className="mt-8"
          message="De nouvelles sélections arrivent bientôt."
        />
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
          {highlights.map((h) => (
            <Link
              key={h.key}
              href={h.href}
              className="group relative flex flex-col justify-between gap-4 rounded-sm border border-white/5 bg-graphite p-6 transition-all hover:border-champagne/30 hover:bg-bordeaux/20"
            >
              <div className="absolute inset-0 rounded-sm bg-gradient-to-b from-champagne/5 to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
              <div className="relative">
                <Badge className="text-xs">{h.label}</Badge>
              </div>
              <div className="relative">
                <p className="font-serif text-lg leading-snug text-ivory group-hover:text-champagne transition-colors">
                  {h.title}
                </p>
                {h.price && (
                  <p className="mt-3 text-sm font-semibold text-champagne">{h.price}</p>
                )}
              </div>
            </Link>
          ))}
        </div>
      )}
    </section>
  );
}
