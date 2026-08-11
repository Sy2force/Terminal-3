import Image from "next/image";
import Link from "next/link";
import { Badge } from "@/components/commerce/badge";
import { Countdown } from "@/components/commerce/countdown";
import { formatAgorot, savingPercent } from "@/lib/money";
import type { PromotionWithProduct } from "@/lib/data/promotions";

export function PromotionCard({
  promotion,
}: {
  promotion: PromotionWithProduct;
}) {
  const cover = promotion.product?.media?.[0]?.url;
  const name = promotion.product
    ? promotion.product.name_fr || promotion.product.name_he
    : promotion.title;
  const saving = savingPercent(
    promotion.regular_price_agorot,
    promotion.promo_price_agorot,
  );
  const isLowStock =
    promotion.quantity_limit != null &&
    promotion.remaining_quantity != null &&
    promotion.remaining_quantity <= Math.max(1, Math.ceil(promotion.quantity_limit * 0.15));

  return (
    <Link
      href={
        promotion.product
          ? `/products/${promotion.product.slug}`
          : `/promotions/${promotion.slug}`
      }
      data-analytics-event="promotion_click"
      className="group flex flex-col overflow-hidden rounded-sm border border-wine-burgundy/20 bg-bordeaux/10 transition-all hover:border-champagne/40 hover:bg-bordeaux/20"
    >
      <div className="relative aspect-[4/5] w-full overflow-hidden bg-warm-black">
        {cover ? (
          <Image
            src={cover}
            alt={name}
            fill
            sizes="(min-width: 1024px) 33vw, 50vw"
            className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-xs text-muted-grey">
            Photo à venir
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-obsidian/80 via-transparent to-transparent" />
        <div className="absolute left-3 top-3 flex flex-col gap-2">
          <Badge className="bg-wine-burgundy/90 text-ivory border-wine-burgundy">Offre de la cave</Badge>
          {promotion.members_only && <Badge variant="ivory">Membre</Badge>}
          {isLowStock && <Badge variant="amber">Dernières unités</Badge>}
        </div>
      </div>

      <div className="flex flex-1 flex-col gap-3 p-5">
        <h3 className="font-serif text-base leading-snug text-ivory group-hover:text-champagne transition-colors">
          {name}
        </h3>
        <div className="flex items-baseline gap-3">
          <span className="text-sm text-ivory/50 line-through">
            {formatAgorot(promotion.regular_price_agorot)}
          </span>
          <span className="text-xl font-semibold text-champagne">
            {formatAgorot(promotion.promo_price_agorot)}
          </span>
          {saving > 0 && (
            <span className="text-xs font-semibold text-wine-burgundy bg-wine-burgundy/10 px-2 py-0.5 rounded">-{saving}%</span>
          )}
        </div>
        <Countdown endAt={promotion.end_at} />
      </div>
    </Link>
  );
}
