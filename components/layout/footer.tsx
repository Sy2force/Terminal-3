import Link from "next/link";
import { Logo } from "@/components/brand/logo";
import { InstagramIcon, FacebookIcon } from "@/components/brand/social-icons";
import type { SiteSettings } from "@/lib/settings";
import type { OpeningHoursEntry } from "@/lib/config";

const DAY_LABELS: Record<OpeningHoursEntry["day"], string> = {
  sunday: "Dimanche",
  monday: "Lundi",
  tuesday: "Mardi",
  wednesday: "Mercredi",
  thursday: "Jeudi",
  friday: "Vendredi",
  saturday: "Samedi",
};

export function Footer({ settings }: { settings: SiteSettings }) {
  const hasHours = settings.OPENING_HOURS.some((h) => h.open && h.close);

  return (
    <footer className="border-t border-or-principal/10 bg-noir-profond">
      <div className="mx-auto grid max-w-[1440px] gap-12 px-6 py-20 sm:grid-cols-2 lg:grid-cols-5 sm:px-8 lg:px-12">
        <div className="lg:col-span-2">
          <div className="relative">
            <div className="absolute inset-0 bg-or-principal/10 blur-xl" />
            <Logo settings={settings} className="relative h-10 w-auto" />
          </div>
          <p className="mt-6 max-w-sm text-sm leading-relaxed text-texte-clair/70">
            Cave à vin, spiritueux et épicerie fine à Jérusalem. Sélection exigeante de vins casher, whiskies d&apos;exception et produits fins pour vos tables et vos plus beaux moments.
          </p>
          <div className="mt-6 flex gap-4">
            {settings.INSTAGRAM_URL && (
              <a
                href={settings.INSTAGRAM_URL}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Instagram Terminal 3"
                data-analytics-event="instagram_click"
                className="rounded-full p-2 text-texte-clair/60 transition-colors hover:text-or-principal hover:bg-or-principal/10"
              >
                <InstagramIcon className="h-5 w-5" aria-hidden />
              </a>
            )}
            {settings.FACEBOOK_URL && (
              <a
                href={settings.FACEBOOK_URL}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Facebook Terminal 3"
                data-analytics-event="facebook_click"
                className="rounded-full p-2 text-texte-clair/60 transition-colors hover:text-or-principal hover:bg-or-principal/10"
              >
                <FacebookIcon className="h-5 w-5" aria-hidden />
              </a>
            )}
          </div>
        </div>

        <div>
          <h3 className="text-xs uppercase tracking-[0.3em] text-or-principal mb-6">
            Catégories
          </h3>
          <ul className="space-y-3 text-sm text-texte-clair/70">
            <li><Link href="/vins" className="hover:text-or-principal transition-colors">Vins</Link></li>
            <li><Link href="/spiritueux" className="hover:text-or-principal transition-colors">Spiritueux</Link></li>
            <li><Link href="/charcuterie" className="hover:text-or-principal transition-colors">Charcuterie</Link></li>
            <li><Link href="/poissons" className="hover:text-or-principal transition-colors">Poissons fumés</Link></li>
          </ul>
        </div>

        <div>
          <h3 className="text-xs uppercase tracking-[0.3em] text-or-principal mb-6">
            Découvrir
          </h3>
          <ul className="space-y-3 text-sm text-texte-clair/70">
            <li><Link href="/nouveautes" className="hover:text-or-principal transition-colors">Nouveautés</Link></li>
            <li><Link href="/promotions" className="hover:text-or-principal transition-colors">Promotions</Link></li>
            <li><Link href="/inspirations" className="hover:text-or-principal transition-colors">Inspirations</Link></li>
            <li><Link href="/club" className="hover:text-or-principal transition-colors">Club</Link></li>
            <li><Link href="/a-propos" className="hover:text-or-principal transition-colors">À propos</Link></li>
            <li><Link href="/contact" className="hover:text-or-principal transition-colors">Contact</Link></li>
            <li><Link href="/admin" className="hover:text-or-principal transition-colors">Accès admin</Link></li>
          </ul>
        </div>

        <div>
          <h3 className="text-xs uppercase tracking-[0.3em] text-or-principal mb-6">
            Contact
          </h3>
          <address className="not-italic text-sm leading-relaxed text-texte-clair/70">
            {settings.STORE_ADDRESS}
            {settings.STORE_PHONE && (
              <>
                <br />
                <a href={`tel:${settings.STORE_PHONE}`} className="hover:text-or-principal transition-colors">
                  {settings.STORE_PHONE}
                </a>
              </>
            )}
            {settings.STORE_WHATSAPP && (
              <>
                <br />
                <a href={`https://wa.me/${settings.STORE_WHATSAPP.replace(/\D/g, '')}`} className="hover:text-or-principal transition-colors">
                  WhatsApp
                </a>
              </>
            )}
          </address>
          
          {hasHours && (
            <div className="mt-6">
              <h4 className="text-xs uppercase tracking-[0.2em] text-texte-clair/50 mb-3">
                Horaires
              </h4>
              <ul className="space-y-1 text-sm text-texte-clair/70">
                {settings.OPENING_HOURS.map((entry) => (
                  <li key={entry.day} className="flex justify-between gap-4">
                    <span>{DAY_LABELS[entry.day]}</span>
                    <span>
                      {entry.open && entry.close
                        ? `${entry.open}–${entry.close}`
                        : "Fermé"}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>

      <div className="border-t border-or-principal/10 px-6 py-8">
        <div className="mx-auto max-w-[1440px] flex flex-col sm:flex-row justify-between items-center gap-4 text-center sm:text-left">
          <p className="text-xs text-gris-chaud">
            © {new Date().getFullYear()} {settings.STORE_NAME}. Tous droits réservés.
          </p>
          <div className="flex gap-6 text-xs text-gris-chaud">
            <Link href="/conditions" className="hover:text-or-principal transition-colors">Conditions générales</Link>
            <Link href="/confidentialite" className="hover:text-or-principal transition-colors">Politique de confidentialité</Link>
            <Link href="/accessibilite" className="hover:text-or-principal transition-colors">Accessibilité</Link>
          </div>
        </div>
        <div className="mx-auto max-w-[1440px] mt-4 px-6 text-center">
          <p className="text-xs text-gris-chaud/60">
            La vente d&apos;alcool est interdite aux moins de 18 ans.
          </p>
        </div>
      </div>
    </footer>
  );
}
