import Link from "next/link";
import { MapPin, Phone, ArrowRight } from "lucide-react";
import type { SiteSettings } from "@/lib/settings";

interface StorePresentationSectionProps {
  settings: SiteSettings;
}

export function StorePresentationSection({ settings }: StorePresentationSectionProps) {
  return (
    <section className="py-24 bg-noir-profond">
      <div className="mx-auto max-w-[1440px] px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left side - Image */}
          <div className="relative h-96 lg:h-[500px] bg-gradient-to-br from-bordeaux-principal via-brun-cave to-noir-profond rounded-sm border border-or-principal/20 flex items-center justify-center">
            <div className="text-center">
              <p className="text-texte-clair/30 font-serif">Photo de la cave à venir</p>
            </div>
          </div>

          {/* Right side - Content */}
          <div className="space-y-8">
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-or-principal mb-2">Notre maison</p>
              <h2 className="font-serif text-4xl text-texte-clair">Plus qu&apos;une cave, une adresse.</h2>
            </div>

            <p className="text-texte-clair/70 leading-relaxed text-lg">
              À deux pas du marché Mahane Yehuda, Terminal 3 rassemble les bouteilles que l&apos;on aime offrir, ouvrir et partager. Chaque produit est choisi avec attention, chaque conseil est donné avec passion.
            </p>

            <div className="space-y-4">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-12 h-12 rounded-full bg-or-principal/10 flex items-center justify-center">
                  <MapPin className="h-5 w-5 text-or-principal" />
                </div>
                <div>
                  <p className="text-texte-clair">{settings.STORE_ADDRESS}</p>
                <p className="text-texte-clair/60 text-sm">Agripas 105, Jérusalem</p>
                </div>
              </div>

              {settings.STORE_PHONE && (
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 w-12 h-12 rounded-full bg-or-principal/10 flex items-center justify-center">
                    <Phone className="h-5 w-5 text-or-principal" />
                  </div>
                  <div>
                    <a href={`tel:${settings.STORE_PHONE}`} className="text-texte-clair hover:text-or-principal transition-colors">
                      {settings.STORE_PHONE}
                    </a>
                  </div>
                </div>
              )}
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              <Link
                href="/a-propos"
                className="inline-flex items-center justify-center gap-2 px-8 py-[46px] border border-or-principal/30 text-or-principal font-medium tracking-wide transition-all hover:bg-or-principal/10"
              >
                Découvrir notre histoire
              </Link>
              <Link
                href="/contact"
                className="inline-flex items-center justify-center gap-2 px-8 py-[46px] bg-or-principal text-noir-profond font-medium tracking-wide transition-all hover:bg-or-clair hover:shadow-lg hover:shadow-or-principal/20"
              >
                Nous trouver
                <ArrowRight className="h-4 w-4" />
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
        </div>
      </div>
    </section>
  );
}