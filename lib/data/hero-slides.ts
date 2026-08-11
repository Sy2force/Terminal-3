import type { HeroSlide } from "@/types/database";

export const HERO_SLIDES: HeroSlide[] = [
  {
    id: "1",
    category: "TERMINAL 3",
    title: "Entrez dans notre cave",
    description: "Découvrez une sélection exceptionnelle de vins casher, spiritueux premium et produits de dégustation dans un univers unique à Jérusalem.",
    imageDesktop: "/images/hero-wine-cellar.jpg",
    imageMobile: "/images/hero-wine-cellar.jpg",
    imageAlt: "Cave à vin Terminal 3 avec étagères de bouteilles",
    badge: "Sélection Terminal 3",
    primaryButtonLabel: "Découvrir la cave",
    primaryButtonLink: "/categories",
    secondaryButtonLabel: "Voir les nouveautés",
    secondaryButtonLink: "/new",
    displayOrder: 1,
    isActive: true,
  },
  {
    id: "2",
    category: "VINS CASHER",
    title: "Les grands vins d'Israël",
    description: "Retrouvez les meilleures sélections de Yarden, Hermon, Castel, Gamla, Carmel, Barkan, Tabor et Teperberg.",
    imageDesktop: "/images/hero-wine-cellar.jpg",
    imageMobile: "/images/hero-wine-cellar.jpg",
    imageAlt: "Bouteilles de vins israéliens premium",
    badge: "Meilleure vente",
    primaryButtonLabel: "Voir les vins",
    primaryButtonLink: "/categories",
    secondaryButtonLabel: "Commander",
    secondaryButtonLink: "/cart",
    displayOrder: 2,
    isActive: true,
  },
  {
    id: "3",
    category: "SPIRITUEUX",
    title: "Whiskies d'exception",
    description: "Une collection de whiskies soigneusement sélectionnés pour les amateurs de caractère et de belles bouteilles.",
    imageDesktop: "/images/hero-wine-cellar.jpg",
    imageMobile: "/images/hero-wine-cellar.jpg",
    imageAlt: "Collection de whiskies premium",
    badge: "Exclusivité",
    primaryButtonLabel: "Découvrir la sélection",
    primaryButtonLink: "/categories",
    secondaryButtonLabel: "Commander",
    secondaryButtonLink: "/cart",
    displayOrder: 3,
    isActive: true,
  },
  {
    id: "4",
    category: "COLLECTION TERMINAL 3",
    title: "Arak, vodka, gin et cognac",
    description: "Découvrez nos spiritueux casher pour vos événements, vos cadeaux et vos moments de dégustation.",
    imageDesktop: "/images/hero-wine-cellar.jpg",
    imageMobile: "/images/hero-wine-cellar.jpg",
    imageAlt: "Spiritueux casher variés",
    badge: "Produit casher",
    primaryButtonLabel: "Voir les spiritueux",
    primaryButtonLink: "/categories",
    secondaryButtonLabel: "Commander",
    secondaryButtonLink: "/cart",
    displayOrder: 4,
    isActive: true,
  },
  {
    id: "5",
    category: "NOTRE DELICATESSEN",
    title: "Plateaux préparés sur commande",
    description: "Saumon fumé, poissons premium et charcuterie présentés dans des plateaux élégants pour vos repas et vos événements.",
    imageDesktop: "/images/hero-wine-cellar.jpg",
    imageMobile: "/images/hero-wine-cellar.jpg",
    imageAlt: "Plateaux de poissons et charcuterie",
    badge: "Nouveau",
    primaryButtonLabel: "Découvrir les plateaux",
    primaryButtonLink: "/categories",
    secondaryButtonLabel: "Commander un plateau",
    secondaryButtonLink: "/cart",
    displayOrder: 5,
    isActive: true,
  },
  {
    id: "6",
    category: "OFFRES DE LA SEMAINE",
    title: "Les promotions Terminal 3",
    description: "Profitez de nos offres sur une sélection de vins, spiritueux et produits disponibles en magasin.",
    imageDesktop: "/images/hero-wine-cellar.jpg",
    imageMobile: "/images/hero-wine-cellar.jpg",
    imageAlt: "Promotions sur les vins et spiritueux",
    badge: "Promotion",
    primaryButtonLabel: "Voir les promotions",
    primaryButtonLink: "/promotions",
    secondaryButtonLabel: "Commander",
    secondaryButtonLink: "/cart",
    displayOrder: 6,
    isActive: true,
  },
];

export function getActiveHeroSlides(): HeroSlide[] {
  const now = new Date().toISOString();
  return HERO_SLIDES
    .filter((slide) => {
      if (!slide.isActive) return false;
      if (slide.startDate && slide.startDate > now) return false;
      if (slide.endDate && slide.endDate < now) return false;
      return true;
    })
    .sort((a, b) => a.displayOrder - b.displayOrder);
}
