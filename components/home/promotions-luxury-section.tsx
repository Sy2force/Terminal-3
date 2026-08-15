import Link from "next/link";
import { Clock, ArrowRight } from "lucide-react";
import type { PromotionWithProduct } from "@/lib/data/promotions";
import type { SiteSettings } from "@/lib/settings";

interface PromotionsLuxurySectionProps {
  promotions: PromotionWithProduct[];
  settings: SiteSettings;
}

export function PromotionsLuxurySection({ promotions, settings }: PromotionsLuxurySectionProps) {
  const activePromotions = promotions;
  const firstPurchaseDiscount = settings.CLUB_WELCOME_DISCOUNT_PERCENT || 20;

  return (
    <section className="py-24 bg-bordeaux-fonce">
      <div className="mx-auto max-w-[1440px] px-4 sm:px-6 lg:px-8">
        <div className="mb-12">
          <p className="text-xs uppercase tracking-[0.3em] text-or-principal mb-2">Offres exclusives</p>
          <h2 className="font-serif text-4xl text-texte-clair">Promotions en cours</h2>
        </div>

        {/* First purchase offer */}
        <div className="mb-12 p-8 border border-or-principal/30 bg-bordeaux-principal/20 rounded-sm">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            <div>
              <div className="inline-block px-3 py-1 bg-or-principal text-noir-profond text-xs font-bold uppercase tracking-wider mb-4">
                Offre de bienvenue
              </div>
              <h3 className="font-serif text-2xl text-texte-clair mb-2">
                -{firstPurchaseDiscount}% sur votre première commande
              </h3>
              <p className="text-texte-clair/70">
                Rejoignez le Club Terminal 3 et bénéficiez d&apos;une réduction exclusive sur votre premier achat.
              </p>
            </div>
            <Link
              href="/club"
              className="inline-flex items-center gap-2 px-8 py-[46px] bg-or-principal text-noir-profond font-medium tracking-wide transition-all hover:bg-or-clair hover:shadow-lg hover:shadow-or-principal/20"
            >
              En profiter
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>

        {/* Active promotions */}
        <div className="grid md:grid-cols-2 gap-6">
          {activePromotions.map((promotion) => (
            <div
              key={promotion.id}
              className="p-8 border border-or-principal/30 bg-bordeaux-principal/10 rounded-sm hover:border-or-principal/50 transition-colors"
            >
              <div className="flex items-start justify-between mb-4">
                <h3 className="font-serif text-xl text-texte-clair">{promotion.title}</h3>
                {promotion.regular_price_agorot && promotion.promo_price_agorot && (
                  <div className="text-or-principal font-serif text-2xl">
                    -{Math.round((1 - promotion.promo_price_agorot / promotion.regular_price_agorot) * 100)}%
                  </div>
                )}
              </div>
              
              {promotion.description && (
                <p className="text-texte-clair/70 mb-6">{promotion.description}</p>
              )}

              <div className="flex items-center gap-4 mb-6">
                {promotion.regular_price_agorot && (
                  <span className="text-texte-clair/50 line-through">
                    {Math.round(promotion.regular_price_agorot / 100)} ₪
                  </span>
                )}
                <span className="font-serif text-xl text-or-principal">
                  {Math.round(promotion.promo_price_agorot / 100)} ₪
                </span>
              </div>

              {promotion.end_at && (
                <div className="flex items-center gap-2 text-texte-clair/60 text-sm mb-6">
                  <Clock className="h-4 w-4" />
                  <span>Se termine le {new Date(promotion.end_at).toLocaleDateString('fr-FR')}</span>
                </div>
              )}

              <Link
                href={`/promotions/${promotion.slug}`}
                className="inline-flex items-center gap-2 text-or-principal hover:underline text-sm uppercase tracking-wider"
              >
                Découvrir l&apos;offre
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          ))}
        </div>

        {activePromotions.length === 0 && (
          <div className="text-center py-12">
            <p className="text-texte-clair/60">Aucune promotion en cours pour le moment.</p>
          </div>
        )}
      </div>
    </section>
  );
}