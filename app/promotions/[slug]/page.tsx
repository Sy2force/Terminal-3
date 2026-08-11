import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Tag } from "lucide-react";
import { getPromotionBySlug } from "@/lib/data/promotions";
import { getSiteSettings } from "@/lib/settings";
import { Badge } from "@/components/commerce/badge";
import { Countdown } from "@/components/commerce/countdown";
import {
  WhatsAppButton,
  CallButton,
} from "@/components/commerce/contact-actions";
import { formatAgorot, savingPercent } from "@/lib/money";

export const revalidate = 30;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const promotion = await getPromotionBySlug(slug);
  if (!promotion) return {};

  return {
    title: `${promotion.title} | Terminal 3`,
    description: promotion.description ?? undefined,
  };
}

export default async function PromotionDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const [promotion, settings] = await Promise.all([
    getPromotionBySlug(slug),
    getSiteSettings(),
  ]);

  if (!promotion) notFound();

  const saving = savingPercent(
    promotion.regular_price_agorot,
    promotion.promo_price_agorot,
  );

  return (
    <div className="mx-auto max-w-2xl px-6 py-20 text-center lg:px-8">
      <div className="flex justify-center gap-2">
        <Badge>Offre flash</Badge>
        {promotion.members_only && <Badge variant="ivory">Membre</Badge>}
      </div>

      <h1 className="mt-6 font-serif text-3xl text-ivory sm:text-4xl">
        {promotion.title}
      </h1>

      {promotion.description && (
        <p className="mx-auto mt-4 max-w-lg text-sm leading-relaxed text-ivory/70">
          {promotion.description}
        </p>
      )}

      <div className="mt-8 flex items-baseline justify-center gap-3">
        <span className="text-lg text-muted-grey line-through">
          {formatAgorot(promotion.regular_price_agorot)}
        </span>
        <span className="font-serif text-3xl text-champagne">
          {formatAgorot(promotion.promo_price_agorot)}
        </span>
        {saving > 0 && (
          <span className="flex items-center gap-1 text-sm text-ivory/60">
            <Tag className="h-3.5 w-3.5" aria-hidden />-{saving}%
          </span>
        )}
      </div>

      <div className="mt-6 flex justify-center">
        <Countdown endAt={promotion.end_at} />
      </div>

      <p className="mt-8 text-sm text-muted-grey">
        Offre disponible en boutique — contactez-nous pour la réserver.
      </p>

      <div className="mt-4 flex justify-center gap-3">
        <CallButton phone={settings.STORE_PHONE} />
        <WhatsAppButton
          whatsapp={settings.STORE_WHATSAPP}
          productName={promotion.title}
          promoPriceLabel={formatAgorot(promotion.promo_price_agorot)}
        />
      </div>
    </div>
  );
}
