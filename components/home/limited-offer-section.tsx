import Link from "next/link";
import { Countdown } from "@/components/commerce/countdown";
import { formatAgorot, savingPercent } from "@/lib/money";
import type { PromotionWithProduct } from "@/lib/data/promotions";

export function LimitedOfferSection({
  promotion,
}: {
  promotion: PromotionWithProduct;
}) {
  const name = promotion.product
    ? promotion.product.name_fr || promotion.product.name_he
    : promotion.title;
  const saving = savingPercent(
    promotion.regular_price_agorot,
    promotion.promo_price_agorot,
  );
  const href = promotion.product
    ? `/products/${promotion.product.slug}`
    : `/promotions/${promotion.slug}`;

  return (
    <section
      data-analytics-event="countdown_view"
      className="border-y border-champagne/20 bg-warm-black"
    >
      <div className="mx-auto flex max-w-7xl flex-col items-center gap-8 px-6 py-20 text-center lg:px-8">
        <span className="text-xs uppercase tracking-[0.3em] text-champagne">
          Offre exclusive
        </span>
        <h2 className="font-serif text-3xl text-ivory sm:text-4xl">{name}</h2>

        <div className="flex items-baseline gap-4">
          <span className="text-xl text-muted-grey line-through">
            {formatAgorot(promotion.regular_price_agorot)}
          </span>
          <span className="font-serif text-4xl text-champagne">
            {formatAgorot(promotion.promo_price_agorot)}
          </span>
          {saving > 0 && (
            <span className="text-sm text-ivory/60">-{saving}%</span>
          )}
        </div>

        <Countdown endAt={promotion.end_at} />

        <Link
          href={href}
          className="rounded-full bg-champagne px-8 py-3 text-sm font-semibold tracking-wide text-obsidian transition-colors hover:bg-soft-gold"
        >
          Voir l&rsquo;offre
        </Link>
      </div>
    </section>
  );
}
