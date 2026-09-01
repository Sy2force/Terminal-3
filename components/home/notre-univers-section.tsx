import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import type { CategoryRow } from "@/types/database";

interface CategoryCard {
  number: string;
  name: string;
  description: string;
  slug: string;
  image: string;
  bgColor: string;
  count: number;
}

interface NotreUniversSectionProps {
  categories: CategoryRow[];
}

export function NotreUniversSection({ categories }: NotreUniversSectionProps) {
  // Map categories to the four main categories
  const categoryCards: CategoryCard[] = [
    {
      number: "01",
      name: "Vins",
      description: "Grands domaines israéliens et cuvées confidentielles",
      slug: "vins",
      image: "/images/terminal-3/couvertures/vins.webp",
      bgColor: "from-bordeaux-principal to-bordeaux-fonce",
      count: categories.find(c => c.slug === "vin" || c.slug === "vins")?.id ? 50 : 0,
    },
    {
      number: "02",
      name: "Spiritueux",
      description: "Whiskies, cognacs et spiritueux d'exception",
      slug: "spiritueux",
      image: "/images/terminal-3/couvertures/spiritueux.webp",
      bgColor: "from-amber-700 to-amber-900",
      count: categories.find(c => c.slug === "spiritueux" || c.slug === "spirits")?.id ? 30 : 0,
    },
    {
      number: "03",
      name: "Charcuterie",
      description: "Sélections artisanales et charcuteries fines",
      slug: "charcuterie",
      image: "/images/terminal-3/couvertures/charcuterie.webp",
      bgColor: "from-orange-700 to-orange-900",
      count: categories.find(c => c.slug === "charcuterie")?.id ? 25 : 0,
    },
    {
      number: "04",
      name: "Poissons fumés",
      description: "Saumons et poissons fumés de première qualité",
      slug: "poissons",
      image: "/images/terminal-3/couvertures/poissons.webp",
      bgColor: "from-slate-600 to-slate-800",
      count: categories.find(c => c.slug === "poissons" || c.slug === "fish")?.id ? 15 : 0,
    },
  ];

  return (
    <section className="py-24 bg-fond-papier">
      <div className="mx-auto max-w-[1440px] px-4 sm:px-6 lg:px-8">
        {/* Section header */}
        <div className="mb-16">
          <p className="text-xs uppercase tracking-[0.3em] text-gris-chaud mb-2">Notre univers</p>
          <h2 className="font-serif text-4xl sm:text-5xl lg:text-6xl text-noir-profond">
            À chaque moment sa sélection.
          </h2>
        </div>

        {/* Category cards grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {categoryCards.map((card) => (
            <Link
              key={card.slug}
              href={`/${card.slug}`}
              className="group relative overflow-hidden rounded-sm border border-or-principal/20 bg-noir-profond p-8 transition-all duration-300 hover:border-or-principal/50 hover:shadow-xl hover:shadow-or-principal/10"
            >
              {/* Category cover image */}
              <div className="pointer-events-none absolute inset-0 -z-10 transition-transform duration-500 group-hover:scale-105">
                <Image
                  src={card.image}
                  alt={card.name}
                  fill
                  className="object-cover opacity-25 transition-opacity duration-300 group-hover:opacity-35"
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                />
              </div>

              {/* Background gradient overlay */}
              <div className={`absolute inset-0 bg-gradient-to-br ${card.bgColor} opacity-80 transition-opacity duration-300 group-hover:opacity-70`} />
              
              {/* Content */}
              <div className="relative z-10">
                {/* Number */}
                <div className="text-6xl font-serif text-or-principal/30 group-hover:text-or-principal/50 transition-colors">
                  {card.number}
                </div>

                {/* Name */}
                <h3 className="mt-4 font-serif text-2xl text-texte-clair group-hover:text-or-principal transition-colors">
                  {card.name}
                </h3>

                {/* Description */}
                <p className="mt-3 text-sm text-texte-clair/60 leading-relaxed">
                  {card.description}
                </p>

                {/* Count */}
                <div className="mt-4 text-xs text-texte-clair/40 uppercase tracking-wider">
                  {card.count}+ références
                </div>

                {/* Arrow */}
                <div className="mt-6 flex items-center gap-2 text-or-principal opacity-0 -translate-x-4 transition-all duration-300 group-hover:opacity-100 group-hover:translate-x-0">
                  <span className="text-sm uppercase tracking-wider">Découvrir</span>
                  <ArrowRight className="h-4 w-4" />
                </div>
              </div>

              {/* Decorative corner */}
              <div className="absolute top-0 right-0 w-16 h-16 border-t-2 border-r-2 border-or-principal/20 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}