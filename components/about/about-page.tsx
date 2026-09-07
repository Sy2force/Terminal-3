import Link from "next/link";
import { MapPin, Phone, Star } from "lucide-react";
import type { SiteSettings } from "@/lib/settings";
import type { PageContentRow } from "@/types/database";
import { PageContentRenderer } from "@/components/public/page-content-renderer";

interface AboutPageProps {
  settings: SiteSettings;
  /**
   * Admin-published content from /admin/contenus/a-propos. When null
   * (never published, or demo mode) the page falls back to the
   * original static copy below — the page never breaks or goes blank.
   */
  pageContent?: PageContentRow | null;
}

export function AboutPageContent({ settings, pageContent }: AboutPageProps) {
  const title = pageContent?.title || "À propos";
  const subtitle =
    pageContent?.subtitle ||
    "Une adresse à Jérusalem où le vin casher rencontre l’excellence.";
  const blocks = pageContent?.blocks;

  return (
    <div className="min-h-screen bg-noir-profond">
      {/* Cover section */}
      <div className="relative h-96 bg-gradient-to-br from-bordeaux-principal via-brun-cave to-noir-profond">
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center">
            <h1 className="font-serif text-5xl sm:text-6xl lg:text-7xl text-texte-clair mb-4">
              {title}
            </h1>
            <p className="text-lg text-texte-clair/70 max-w-2xl mx-auto">
              {subtitle}
            </p>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-[1440px] px-4 sm:px-6 lg:px-8 py-16">
        {/* Story section */}
        <div className="grid lg:grid-cols-2 gap-12 items-center mb-24">
          <div>
            <h2 className="font-serif text-4xl text-texte-clair mb-6">Notre histoire</h2>
            <div className="space-y-4 text-texte-clair/70 leading-relaxed">
              <p>
                Terminal 3 est né d&rsquo;une passion pour les vins casher de qualité et les produits fins. 
                Situé au cœur de Jérusalem, sur Agripas 105, nous sommes plus qu&rsquo;une simple cave à vin : 
                nous sommes un espace de découverte et de partage.
              </p>
              <p>
                Notre sélection rigoureuse de vins israéliens, de whiskies d&rsquo;exception et de produits 
                gastronomiques est le fruit de années d&rsquo;expertise et de relations privilégiées avec les 
                meilleurs producteurs.
              </p>
              <p>
                Chaque bouteille, chaque produit que vous trouverez chez Terminal 3 a été choisi avec 
                soin pour sublimer vos moments de convivialité et vos tables les plus exigeantes.
              </p>
            </div>
          </div>
          <div className="relative h-96 bg-gradient-to-br from-brun-cave to-noir-profond rounded-sm border border-or-principal/20 flex items-center justify-center">
            <div className="text-center">
              <p className="text-texte-clair/40 font-serif">Photographie à venir</p>
            </div>
          </div>
        </div>

        {/* Values section */}
        <div className="mb-24">
          <h2 className="font-serif text-4xl text-texte-clair mb-12 text-center">Nos valeurs</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="p-8 bg-noir-chaud rounded-sm border border-or-principal/20 text-center">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-or-principal/10 flex items-center justify-center">
                <Star className="h-8 w-8 text-or-principal" />
              </div>
              <h3 className="font-serif text-xl text-texte-clair mb-3">Excellence</h3>
              <p className="text-texte-clair/60 text-sm">
                Une sélection rigoureuse des meilleurs produits casher.
              </p>
            </div>
            <div className="p-8 bg-noir-chaud rounded-sm border border-or-principal/20 text-center">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-or-principal/10 flex items-center justify-center">
                <MapPin className="h-8 w-8 text-or-principal" />
              </div>
              <h3 className="font-serif text-xl text-texte-clair mb-3">Local</h3>
              <p className="text-texte-clair/60 text-sm">
                Un engagement envers les producteurs israéliens.
              </p>
            </div>
            <div className="p-8 bg-noir-chaud rounded-sm border border-or-principal/20 text-center">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-or-principal/10 flex items-center justify-center">
                <Phone className="h-8 w-8 text-or-principal" />
              </div>
              <h3 className="font-serif text-xl text-texte-clair mb-3">Service</h3>
              <p className="text-texte-clair/60 text-sm">
                Un accompagnement personnalisé pour chaque client.
              </p>
            </div>
          </div>
        </div>

        {/* Team section */}
        <div className="mb-24">
          <h2 className="font-serif text-4xl text-texte-clair mb-12 text-center">Notre équipe</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-32 h-32 mx-auto mb-4 rounded-full bg-gradient-to-br from-brun-cave to-noir-profond border border-or-principal/20 flex items-center justify-center">
                <span className="text-texte-clair/40 font-serif">Portrait</span>
              </div>
              <h3 className="font-serif text-xl text-texte-clair mb-2">Équipe Terminal 3</h3>
              <p className="text-texte-clair/60 text-sm">
                Passionnés de vin et de gastronomie.
              </p>
            </div>
          </div>
        </div>

        {/* CTA section */}
        <div className="text-center py-16 bg-gradient-to-r from-bordeaux-principal via-bordeaux-fonce to-bordeaux-principal rounded-sm">
          <h2 className="font-serif text-4xl text-texte-clair mb-4">Nous trouver</h2>
          <p className="text-texte-clair/70 mb-8 max-w-2xl mx-auto">
            {settings.STORE_ADDRESS}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/contact"
              className="inline-flex items-center justify-center gap-2 px-8 py-[46px] bg-or-principal text-noir-profond font-medium tracking-wide transition-all hover:bg-or-clair hover:shadow-lg hover:shadow-or-principal/20"
            >
              Nous contacter
            </Link>
            {settings.STORE_WHATSAPP && (
              <a
                href={`https://wa.me/${settings.STORE_WHATSAPP.replace(/\D/g, '')}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 px-8 py-[46px] border border-or-principal/30 text-or-principal font-medium tracking-wide transition-all hover:bg-or-principal/10"
              >
                WhatsApp
              </a>
            )}
          </div>
        </div>

        {Array.isArray(blocks) && blocks.length > 0 && (
          <div className="mt-12">
            <PageContentRenderer blocks={blocks} />
          </div>
        )}
      </div>
    </div>
  );
}