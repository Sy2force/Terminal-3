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
    <footer className="border-t border-champagne/10 bg-obsidian">
      <div className="mx-auto grid max-w-[1440px] gap-12 px-6 py-20 sm:grid-cols-2 lg:grid-cols-4 sm:px-8 lg:px-12">
        <div>
          <div className="relative">
            <div className="absolute inset-0 bg-champagne/10 blur-xl" />
            <Logo settings={settings} className="relative" />
          </div>
          <p className="mt-6 max-w-xs text-sm leading-relaxed text-ivory/70">
            Vin, whisky, spiritueux et gourmet. Une cave et une épicerie fine au cœur de Jérusalem.
          </p>
          <div className="mt-6 flex gap-4">
            {settings.INSTAGRAM_URL && (
              <a
                href={settings.INSTAGRAM_URL}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Instagram Terminal 3"
                data-analytics-event="instagram_click"
                className="rounded-full p-2 text-ivory/60 transition-colors hover:text-champagne hover:bg-champagne/10"
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
                className="rounded-full p-2 text-ivory/60 transition-colors hover:text-champagne hover:bg-champagne/10"
              >
                <FacebookIcon className="h-5 w-5" aria-hidden />
              </a>
            )}
          </div>
        </div>

        <div>
          <h3 className="text-xs uppercase tracking-[0.3em] text-champagne mb-6">
            Explorer
          </h3>
          <ul className="space-y-4 text-sm text-ivory/70">
            <li><Link href="/new" className="hover:text-champagne transition-colors">Nouveautés</Link></li>
            <li><Link href="/inspirations" className="hover:text-champagne transition-colors">Inspirations</Link></li>
            <li><Link href="/promotions" className="hover:text-champagne transition-colors">Promotions</Link></li>
            <li><Link href="/club" className="hover:text-champagne transition-colors">Club Terminal 3</Link></li>
          </ul>
        </div>

        <div>
          <h3 className="text-xs uppercase tracking-[0.3em] text-champagne mb-6">
            La Boutique
          </h3>
          <address className="not-italic text-sm leading-relaxed text-ivory/70">
            {settings.STORE_ADDRESS}
            {settings.STORE_PHONE && (
              <>
                <br />
                <a href={`tel:${settings.STORE_PHONE}`} className="hover:text-champagne transition-colors">
                  {settings.STORE_PHONE}
                </a>
              </>
            )}
          </address>
        </div>

        <div>
          <h3 className="text-xs uppercase tracking-[0.3em] text-champagne mb-6">
            Horaires
          </h3>
          {hasHours ? (
            <ul className="space-y-2 text-sm text-ivory/70">
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
          ) : (
            <p className="text-sm text-ivory/50">
              Horaires disponibles prochainement.
            </p>
          )}
        </div>
      </div>

      <div className="border-t border-white/5 px-6 py-8 text-center">
        <p className="text-xs text-muted-grey">
          © {new Date().getFullYear()} {settings.STORE_NAME}. Tous droits réservés.
        </p>
      </div>
    </footer>
  );
}
