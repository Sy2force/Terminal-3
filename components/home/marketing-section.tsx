import { MiniCard } from "@/components/marketing/mini-card";

const MARKETING_CARDS = [
  {
    title: "Vins Premium",
    description: "Sélection exclusive des meilleurs vins casher d'Israël et du monde entier.",
    image: "/images/hero-wine-cellar.jpg",
    link: "/categories/alcohol",
    badge: "Nouveauté",
    color: "champagne" as const,
  },
  {
    title: "Whiskies d'Exception",
    description: "Collection de whiskies rares et prestigieux pour les connaisseurs.",
    image: "/images/hero-wine-cellar.jpg",
    link: "/categories/spirits",
    badge: "Exclusivité",
    color: "bordeaux" as const,
  },
  {
    title: "Charcuterie Fine",
    description: "Plateaux de charcuterie artisanale préparés avec passion.",
    image: "/images/hero-wine-cellar.jpg",
    link: "/categories/charcuterie",
    badge: "Artisanal",
    color: "gold" as const,
  },
  {
    title: "Poissons Fumés",
    description: "Saumon fumé et poissons premium de la plus haute qualité.",
    image: "/images/hero-wine-cellar.jpg",
    link: "/categories/fish",
    badge: "Premium",
    color: "champagne" as const,
  },
  {
    title: "Spiritueux Cacher",
    description: "Arak, vodka, gin et cognac certifiés casher de qualité supérieure.",
    image: "/images/hero-wine-cellar.jpg",
    link: "/categories/spirits",
    badge: "Casher",
    color: "bordeaux" as const,
  },
  {
    title: "Offres Spéciales",
    description: "Promotions exclusives et offres limitées sur nos produits premium.",
    image: "/images/hero-wine-cellar.jpg",
    link: "/promotions",
    badge: "Promo",
    color: "gold" as const,
  },
];

export function MarketingSection() {
  return (
    <section className="relative py-20 bg-obsidian overflow-hidden">
      {/* Background pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute inset-0" style={{ backgroundImage: "radial-gradient(circle at 2px 2px, rgba(197, 163, 90, 0.3) 1px, transparent 0)", backgroundSize: "40px 40px" }} />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-12">
          <span className="inline-block text-sm uppercase tracking-[0.4em] text-champagne mb-4">
            Découvrir
          </span>
          <h2 className="font-serif text-5xl lg:text-6xl xl:text-7xl text-ivory mb-4">
            Nos <span className="text-champagne">Sélections</span>
          </h2>
          <p className="text-xl lg:text-2xl text-muted-grey max-w-2xl mx-auto">
            Explorez notre gamme complète de produits premium soigneusement sélectionnés pour les connaisseurs exigeants.
          </p>
        </div>

        {/* Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {MARKETING_CARDS.map((card, index) => (
            <div
              key={index}
              className="animate-fade-in"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <MiniCard {...card} />
            </div>
          ))}
        </div>

        {/* CTA */}
        <div className="text-center mt-12">
          <a
            href="/categories"
            className="inline-flex items-center gap-2 px-8 py-4 rounded-full border border-champagne/50 bg-champagne/10 text-champagne font-medium hover:bg-champagne hover:text-obsidian transition-all"
          >
            Voir tout le catalogue
            <span className="transition-transform group-hover:translate-x-1">→</span>
          </a>
        </div>
      </div>
    </section>
  );
}
