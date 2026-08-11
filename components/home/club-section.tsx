import Link from "next/link";
import type { SiteSettings } from "@/lib/settings";

const BENEFITS = [
  "Offre de bienvenue",
  "Promotions exclusives",
  "Nouveautés en avant-première",
  "Sélections réservées aux membres",
  "Alertes quantités limitées",
  "Produits favoris & notifications",
];

export function ClubSection({ settings }: { settings: SiteSettings }) {
  return (
    <section className="relative border-t border-champagne/10 bg-obsidian overflow-hidden">
      {/* Premium ambient lighting */}
      <div
        aria-hidden
        className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_50%,rgba(197,163,90,0.08),transparent_60%)]"
      />
      <div
        aria-hidden
        className="absolute inset-0 bg-[linear-gradient(180deg,rgba(8,8,8,0)_0%,rgba(13,12,11,0.5)_50%,rgba(8,8,8,0)_100%)]"
      />

      <div className="relative mx-auto flex max-w-5xl flex-col items-center gap-10 px-6 py-32 text-center sm:px-8 lg:px-12">
        <div className="flex flex-col items-center gap-4">
          <p className="text-xs uppercase tracking-[0.5em] text-champagne/60">
            Chapitre 06
          </p>
          <h2 className="font-serif text-4xl sm:text-5xl md:text-6xl text-ivory">
            Terminal 3 Club
          </h2>
          <p className="max-w-2xl text-base sm:text-lg text-ivory/60 leading-relaxed">
            Accédez aux sélections, offres et nouveautés réservées aux membres.
          </p>
        </div>

        <div className="relative">
          <div className="absolute inset-0 bg-champagne/10 blur-3xl" />
          <div className="relative rounded-sm border border-champagne/20 bg-warm-black/50 p-8 sm:p-12">
            <p className="font-serif text-3xl sm:text-4xl text-champagne mb-2">
              -{settings.CLUB_WELCOME_DISCOUNT_PERCENT}%
            </p>
            <p className="text-sm uppercase tracking-[0.2em] text-ivory/60">
              Sur votre premier achat éligible
            </p>
          </div>
        </div>

        <ul className="grid grid-cols-1 gap-4 text-sm text-ivory/80 sm:grid-cols-2 lg:grid-cols-3">
          {BENEFITS.map((benefit) => (
            <li key={benefit} className="flex items-center justify-center gap-3">
              <span aria-hidden className="h-1.5 w-1.5 rounded-full bg-champagne" />
              {benefit}
            </li>
          ))}
        </ul>

        <Link
          href="/club"
          data-analytics-event="club_signup_started"
          className="group relative inline-flex items-center gap-3 rounded-full bg-champagne px-10 py-4 text-sm font-semibold tracking-wide text-obsidian transition-all hover:bg-soft-gold hover:shadow-lg hover:shadow-champagne/20"
        >
          <span className="relative z-10">Rejoindre le Club</span>
          <svg
            className="h-4 w-4 transition-transform group-hover:translate-x-1"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M17 8l4 4m0 0l-4 4m4-4H3"
            />
          </svg>
        </Link>
      </div>
    </section>
  );
}
