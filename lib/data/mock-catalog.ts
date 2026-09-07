import type { CategoryRow, ProductAvailabilityStatus, WineType } from "@/types/database";
import type { ProductWithMedia } from "@/lib/data/catalog";
import { mockExtraWines } from "@/lib/data/mock-extra-wines";
import { mockExtraWhiskies } from "@/lib/data/mock-extra-whiskies";
import { mockExtraProducts } from "@/lib/data/mock-extra-products";
import { generateBottles } from "@/lib/data/mock-bottle-generator";
import fs from "node:fs";
import path from "node:path";

/**
 * Development fallback catalog used when Supabase env vars are missing.
 * This lets the UI render for local preview without a live database.
 * It is NOT used in production.
 */

const wineCategoryId = "10000000-0000-0000-0000-000000000001";
const charcuterieCategoryId = "10000000-0000-0000-0000-000000000004";
const salmonCategoryId = "10000000-0000-0000-0000-000000000005";

const wineCategory: CategoryRow = {
  id: wineCategoryId,
  slug: "vin",
  name_he: "יין",
  name_fr: "Vin",
  name_en: "Wine",
  description: "Grands domaines israéliens, cuvées confidentielles et bouteilles à ouvrir sans attendre.",
  short_description: "La cave Terminal 3",
  cover_image: null,
  parent_id: null,
  icon: null,
  display_order: 1,
  is_active: true,
  is_featured: true,
  meta_title: null,
  meta_description: null,
  theme: "CELLAR",
  created_at: "2024-01-01T00:00:00Z",
  updated_at: "2024-01-01T00:00:00Z",
};

const spiritsCategoryId = "10000000-0000-0000-0000-000000000003";

const spiritsCategory: CategoryRow = {
  id: spiritsCategoryId,
  slug: "spiritueux",
  name_he: "משקאות חריפים",
  name_fr: "Spiritueux",
  name_en: "Spirits",
  description: "Whiskies, arak, cognacs et spiritueux d'exception pour chaque palais et chaque occasion.",
  short_description: "La cave à spiritueux Terminal 3",
  cover_image: null,
  parent_id: null,
  icon: null,
  display_order: 2,
  is_active: true,
  is_featured: true,
  meta_title: null,
  meta_description: null,
  theme: "CELLAR",
  created_at: "2024-01-01T00:00:00Z",
  updated_at: "2024-01-01T00:00:00Z",
};

const charcuterieCategory: CategoryRow = {
  id: charcuterieCategoryId,
  slug: "charcuterie",
  name_he: "נקניקים",
  name_fr: "Charcuterie",
  name_en: "Charcuterie",
  description: "Rosette, pastrami, spécialités fumées et pâtés fins, sélectionnés avec soin pour vos apéritifs et vos plateaux.",
  short_description: "Découpée à la demande",
  cover_image: null,
  parent_id: null,
  icon: null,
  display_order: 4,
  is_active: true,
  is_featured: true,
  meta_title: null,
  meta_description: null,
  theme: "GOURMET",
  created_at: "2024-01-01T00:00:00Z",
  updated_at: "2024-01-01T00:00:00Z",
};

const salmonCategory: CategoryRow = {
  id: salmonCategoryId,
  slug: "saumon-fume",
  name_he: "דגים מעושנים",
  name_fr: "Saumon fumé",
  name_en: "Smoked Fish",
  description: "Sélection premium de saumon fumé et poissons fins.",
  short_description: "Saumon fumé et poissons fins premium",
  cover_image: null,
  parent_id: null,
  icon: null,
  display_order: 5,
  is_active: true,
  is_featured: false,
  meta_title: null,
  meta_description: null,
  theme: "GOURMET",
  created_at: "2024-01-01T00:00:00Z",
  updated_at: "2024-01-01T00:00:00Z",
};

const platterCategory: CategoryRow = {
  id: "10000000-0000-0000-0000-000000000006",
  slug: "plateaux-saumon",
  name_he: "מגשי סלמון",
  name_fr: "Plateaux Saumon",
  name_en: "Salmon Platters",
  description: "Plateaux de saumon fumé pour vos réceptions et événements.",
  short_description: "La signature Terminal 3",
  cover_image: null,
  parent_id: null,
  icon: null,
  display_order: 6,
  is_active: true,
  is_featured: true,
  meta_title: null,
  meta_description: null,
  theme: "PLATTER",
  created_at: "2024-01-01T00:00:00Z",
  updated_at: "2024-01-01T00:00:00Z",
};

export const mockCategories: CategoryRow[] = [
  wineCategory,
  spiritsCategory,
  charcuterieCategory,
  salmonCategory,
  platterCategory,
];

const platterCategoryId = "10000000-0000-0000-0000-000000000006";

// ============================================================
// WINES — /vins demo catalog (backed by the normal data layer, not a
// component-level static array). Replace/expand from /admin once real
// inventory is available; these rows mirror db/seed/seed_wines.sql.
// ============================================================

interface WineDef {
  id: string;
  slug: string;
  brand: string;
  name_he: string;
  name_fr: string;
  description_fr: string;
  tasting_notes: string;
  pairing_notes: string;
  kosher_status: string;
  price: number;
  comparePrice: number | null;
  wine_type: WineType;
  region: string;
  country: string;
  grapes: string[];
  vintage: number | null;
  abv: number;
  rating: number;
  reviewCount: number;
  isFeatured: boolean;
  isBestSeller: boolean;
  badge: string | null;
  newUntil: string | null;
  availability?: ProductAvailabilityStatus;
  servingTemperature: string;
  agingPotential: string;
  vinificationMethod: string;
}

const wineDefs: WineDef[] = [
  {
    id: "40000000-0000-0000-0000-000000000001", slug: "petit-castel-2020", brand: "Domaine du Castel",
    name_he: "פיטיט קסטל", name_fr: "Petit Castel",
    description_fr: "Le second vin du Domaine du Castel, un assemblage élégant élevé en fûts de chêne français.",
    tasting_notes: "Fruits rouges mûrs, notes boisées subtiles, tanins soyeux.",
    pairing_notes: "Viandes rouges grillées, fromages affinés.",
    kosher_status: "Casher Mehadrin", price: 18900, comparePrice: null,
    wine_type: "ROUGE" as const, region: "Judean Hills", country: "Israël",
    grapes: ["Cabernet Sauvignon", "Merlot", "Petit Verdot"], vintage: 2020, abv: 14.0,
    rating: 4.7, reviewCount: 128, isFeatured: true, isBestSeller: true, badge: null, newUntil: null,
    servingTemperature: "16–18°C", agingPotential: "Apogée entre 2025 et 2030",
    vinificationMethod: "Élevage 12 mois en fûts de chêne français",
  },
  {
    id: "40000000-0000-0000-0000-000000000002", slug: "yarden-cabernet-sauvignon-2019", brand: "Golan Heights Winery",
    name_he: "ירדן קברנה סוביניון", name_fr: "Yarden Cabernet Sauvignon",
    description_fr: "Un cabernet sauvignon de référence, structuré et complexe, issu des vignes du plateau du Golan.",
    tasting_notes: "Cassis, poivron rouge grillé, chêne toasté.",
    pairing_notes: "Agneau rôti, plats mijotés.",
    kosher_status: "Casher Mehadrin", price: 15900, comparePrice: 17900,
    wine_type: "ROUGE" as const, region: "Golan Heights", country: "Israël",
    grapes: ["Cabernet Sauvignon"], vintage: 2019, abv: 14.5,
    rating: 4.8, reviewCount: 214, isFeatured: true, isBestSeller: true, badge: "Coup de cœur", newUntil: null,
    servingTemperature: "17–18°C", agingPotential: "Apogée entre 2024 et 2032",
    vinificationMethod: "Élevage 18 mois en fûts de chêne américain",
  },
  {
    id: "40000000-0000-0000-0000-000000000003", slug: "gamla-syrah-2021", brand: "Golan Heights Winery",
    name_he: "גמלא סירה", name_fr: "Gamla Syrah",
    description_fr: "Un syrah généreux et épicé, parfait pour les repas d'hiver.",
    tasting_notes: "Poivre noir, mûre, réglisse.",
    pairing_notes: "Gibier, plats épicés.",
    kosher_status: "Casher Mehadrin", price: 9900, comparePrice: null,
    wine_type: "ROUGE" as const, region: "Golan Heights", country: "Israël",
    grapes: ["Syrah"], vintage: 2021, abv: 14.5,
    rating: 4.5, reviewCount: 76, isFeatured: false, isBestSeller: false, badge: null,
    newUntil: "2099-01-01T00:00:00Z",
    servingTemperature: "16–17°C", agingPotential: "Apogée entre 2024 et 2028",
    vinificationMethod: "Élevage 10 mois en fûts de chêne",
  },
  {
    id: "40000000-0000-0000-0000-000000000004", slug: "rose-du-castel-2023", brand: "Domaine du Castel",
    name_he: "רוזה קסטל", name_fr: "Rosé du Castel",
    description_fr: "Un rosé de gastronomie sec et minéral, à la robe pâle et au nez délicat.",
    tasting_notes: "Fleurs blanches, pêche blanche, agrumes.",
    pairing_notes: "Poissons grillés, cuisine méditerranéenne.",
    kosher_status: "Casher Mehadrin", price: 13900, comparePrice: null,
    wine_type: "ROSE" as const, region: "Judean Hills", country: "Israël",
    grapes: ["Grenache", "Cinsault"], vintage: 2023, abv: 13.0,
    rating: 4.6, reviewCount: 54, isFeatured: false, isBestSeller: false, badge: null, newUntil: null,
    servingTemperature: "8–10°C", agingPotential: "À boire dans les 2 ans",
    vinificationMethod: "Pressurage direct, vinification à basse température",
  },
  {
    id: "40000000-0000-0000-0000-000000000005", slug: "yarden-chardonnay-2022", brand: "Golan Heights Winery",
    name_he: "ירדן שרדונה", name_fr: "Yarden Chardonnay",
    description_fr: "Un chardonnay élevé partiellement en fûts, rond et frais à la fois.",
    tasting_notes: "Pomme verte, vanille, beurre frais.",
    pairing_notes: "Volailles, fruits de mer, fromages à pâte molle.",
    kosher_status: "Casher Mehadrin", price: 12900, comparePrice: 14500,
    wine_type: "BLANC" as const, region: "Golan Heights", country: "Israël",
    grapes: ["Chardonnay"], vintage: 2022, abv: 13.5,
    rating: 4.4, reviewCount: 63, isFeatured: false, isBestSeller: false, badge: null, newUntil: null,
    servingTemperature: "10–12°C", agingPotential: "Apogée entre 2024 et 2027",
    vinificationMethod: "Élevage partiel 6 mois en fûts de chêne",
  },
  {
    id: "40000000-0000-0000-0000-000000000006", slug: "moscato-hermon-2023", brand: "Golan Heights Winery",
    name_he: "מוסקטו חרמון", name_fr: "Moscato Hermon",
    description_fr: "Un moscato doux et aromatique, léger en alcool, idéal en apéritif ou avec un dessert.",
    tasting_notes: "Raisin muscat, litchi, fleur d'oranger.",
    pairing_notes: "Desserts fruités, fromages frais.",
    kosher_status: "Casher Mehadrin", price: 7900, comparePrice: null,
    wine_type: "DOUX" as const, region: "Golan Heights", country: "Israël",
    grapes: ["Muscat"], vintage: 2023, abv: 9.0,
    rating: 4.3, reviewCount: 41, isFeatured: false, isBestSeller: false, badge: "Nouveau",
    newUntil: "2099-01-01T00:00:00Z",
    servingTemperature: "6–8°C", agingPotential: "À boire dans l'année",
    vinificationMethod: "Fermentation lente à froid pour préserver les arômes",
  },
  {
    id: "40000000-0000-0000-0000-000000000007", slug: "flam-classico-2020", brand: "Flam Winery",
    name_he: "פלאם קלאסיקו", name_fr: "Flam Classico",
    description_fr: "L'assemblage signature du Domaine Flam, équilibré entre puissance et élégance.",
    tasting_notes: "Fruits noirs, épices douces, tanins fins.",
    pairing_notes: "Viandes rouges, plats en sauce.",
    kosher_status: "Non casher", price: 16900, comparePrice: null,
    wine_type: "ROUGE" as const, region: "Judean Hills", country: "Israël",
    grapes: ["Cabernet Sauvignon", "Syrah"], vintage: 2020, abv: 14.5,
    rating: 4.7, reviewCount: 97, isFeatured: true, isBestSeller: true, badge: "Dernières bouteilles",
    newUntil: null, availability: "LOW_STOCK" as const,
    servingTemperature: "17–18°C", agingPotential: "Apogée entre 2024 et 2029",
    vinificationMethod: "Élevage 14 mois en fûts de chêne français",
  },
  {
    id: "40000000-0000-0000-0000-000000000008", slug: "tabor-adama", brand: "Tabor Winery",
    name_he: "תבור אדמה", name_fr: "Tabor Adama",
    description_fr: "Un effervescent frais et gourmand, parfait pour toutes les célébrations.",
    tasting_notes: "Bulles fines, pomme verte, agrumes.",
    pairing_notes: "Apéritif, fruits de mer.",
    kosher_status: "Casher Mehadrin", price: 8900, comparePrice: null,
    wine_type: "EFFERVESCENT" as const, region: "Galilee", country: "Israël",
    grapes: ["Chardonnay", "Pinot Noir"], vintage: null, abv: 12.0,
    rating: 4.2, reviewCount: 38, isFeatured: false, isBestSeller: false, badge: null, newUntil: null,
    servingTemperature: "6–8°C", agingPotential: "À boire dans l'année",
    vinificationMethod: "Méthode traditionnelle, seconde fermentation en bouteille",
  },
];

function buildMockWines(): ProductWithMedia[] {
  const yardenPhotos = [
    "/images/terminal-3/wines/castel/petit-castel-2020.png",
    "/images/terminal-3/wines/yarden/wines-yarden-02.webp",
    "/images/terminal-3/wines/yarden/wines-yarden-03.webp",
    "/images/terminal-3/wines/yarden/wines-yarden-04.webp",
    "/images/terminal-3/wines/yarden/wines-yarden-05.webp",
    "/images/terminal-3/wines/yarden/wines-yarden-06.webp",
    "/images/terminal-3/wines/yarden/wines-yarden-07.webp",
    "/images/terminal-3/wines/yarden/wines-yarden-08.webp",
  ];
  return wineDefs.map((def, index) => ({
    id: def.id,
    slug: def.slug,
    category_id: wineCategoryId,
    product_type: "STANDARD",
    brand: def.brand,
    brand_id: null,
    name_he: def.name_he,
    name_fr: def.name_fr,
    name_en: null,
    description_he: null,
    description_fr: def.description_fr,
    description_en: null,
    origin: def.country,
    tasting_notes: def.tasting_notes,
    pairing_notes: def.pairing_notes,
    how_to_serve: null,
    storage_info: "À conserver couché, à l'abri de la lumière, 12–14°C.",
    kosher_status: def.kosher_status,
    allergen_info: null,
    age_restricted: true,
    status: "published",
    is_featured: def.isFeatured,
    availability_status: def.availability ?? "IN_STOCK",
    base_price_agorot: def.price,
    compare_at_price_agorot: def.comparePrice,
    meta_title: null,
    meta_description: null,
    serves_min: null,
    serves_max: null,
    composition_text: null,
    advance_order_hours: 0,
    customizable: false,
    preparation_time_minutes: null,
    published_at: "2024-01-01T00:00:00Z",
    new_until: def.newUntil,
    created_at: "2024-01-01T00:00:00Z",
    updated_at: "2024-01-01T00:00:00Z",
    wine_type: def.wine_type,
    region: def.region,
    country: def.country,
    grape_varieties: def.grapes,
    rating: def.rating,
    review_count: def.reviewCount,
    is_best_seller: def.isBestSeller,
    badge: def.badge,
    serving_temperature: def.servingTemperature,
    aging_potential: def.agingPotential,
    vinification_method: def.vinificationMethod,
    subcategory: null,
    age_years: null,
    nose_notes: null,
    palate_notes: null,
    finish_notes: null,
    cask_type: null,
    edition: null,
    production_method: null,
    meat_type: null,
    is_available_for_platter: false,
    nutrition_info: null,
    expiration_info: null,
    fish_type: null,
    preparation_method: null,
    smoked: false,
    category: wineCategory,
    variants: [
      {
        id: `${def.id}-v1`,
        product_id: def.id,
        sku: null,
        label: "75cl",
        weight_g: null,
        volume_ml: 750,
        abv: def.abv,
        vintage: def.vintage,
        regular_price_agorot: def.price,
        is_default: true,
        limited_stock: def.availability === "LOW_STOCK",
        availability_status: def.availability ?? "IN_STOCK",
        display_order: 0,
        status: "published",
        pricing_unit: null,
        packaging: null,
        created_at: "2024-01-01T00:00:00Z",
        updated_at: "2024-01-01T00:00:00Z",
      },
    ],
    media: [
      {
        id: `${def.id}-m1`,
        product_id: def.id,
        variant_id: null,
        url: index < 8 ? yardenPhotos[index] : "/images/products/alcohol/placeholder.jpg",
        alt: `Bouteille de ${def.name_fr}`,
        kind: "COVER",
        display_order: 0,
        created_at: "2024-01-01T00:00:00Z",
      },
    ],
  }));
}

export const mockWines = buildMockWines();

// ============================================================
// SPIRITS — /spiritueux demo catalog (backed by the normal data layer,
// not a component-level static array). Replace/expand from /admin once
// real inventory is available; these rows mirror db/seed/seed_spirits.sql.
// ============================================================

interface SpiritDef {
  id: string;
  slug: string;
  brand: string;
  name_he: string;
  name_fr: string;
  subcategory: string;
  description_fr: string;
  noseNotes: string;
  palateNotes: string;
  finishNotes: string;
  howToServe: string;
  kosherStatus: string | null;
  price: number;
  comparePrice: number | null;
  country: string;
  ageYears: number | null;
  abv: number;
  volumeMl: number;
  rating: number;
  reviewCount: number;
  isFeatured: boolean;
  isBestSeller: boolean;
  badge: string | null;
  newUntil: string | null;
  availability?: ProductAvailabilityStatus;
  caskType?: string;
  productionMethod?: string;
  edition?: string;
  servingTemperature?: string;
}

const spiritDefs: SpiritDef[] = [
  {
    id: "50000000-0000-0000-0000-000000000001", slug: "chivas-regal-12", brand: "Chivas Regal",
    name_he: "צ'יבס ריגל 12", name_fr: "Chivas Regal 12 ans", subcategory: "WHISKY",
    description_fr: "Un blended Scotch whisky emblématique, assemblage de plus de 20 malts et grains d'exception.",
    noseNotes: "Pomme mûre, miel, vanille douce.",
    palateNotes: "Rond et soyeux, notes de fruits secs et de céréales grillées.",
    finishNotes: "Longue et chaleureuse, légèrement épicée.",
    howToServe: "Pur, avec un glaçon ou en cocktail (whisky sour). Verre tumbler recommandé.",
    kosherStatus: null, price: 15900, comparePrice: null,
    country: "Écosse", ageYears: 12, abv: 40, volumeMl: 700,
    rating: 4.6, reviewCount: 142, isFeatured: true, isBestSeller: true, badge: null, newUntil: null,
    caskType: "Fûts de chêne américain et européen", productionMethod: "Assemblage (blend) de whiskies de malt et de grain",
    servingTemperature: "Température ambiante, ou avec glace",
  },
  {
    id: "50000000-0000-0000-0000-000000000002", slug: "glenfiddich-12", brand: "Glenfiddich",
    name_he: "גלנפידיך 12", name_fr: "Glenfiddich 12 ans", subcategory: "WHISKY",
    description_fr: "Le single malt le plus primé au monde, frais et fruité, vieilli en fûts de bourbon et de sherry.",
    noseNotes: "Poire fraîche, notes subtiles de chêne.",
    palateNotes: "Doux et rond, fruits mûrs et malt délicat.",
    finishNotes: "Douce et persistante.",
    howToServe: "Pur ou avec quelques gouttes d'eau. Verre tulipe recommandé.",
    kosherStatus: null, price: 17900, comparePrice: 19900,
    country: "Écosse", ageYears: 12, abv: 40, volumeMl: 700,
    rating: 4.7, reviewCount: 168, isFeatured: true, isBestSeller: true, badge: "Coup de cœur", newUntil: null,
    caskType: "Fûts de chêne américain (bourbon) et fûts de sherry européen",
    productionMethod: "Single malt, double distillation",
    servingTemperature: "Température ambiante",
  },
  {
    id: "50000000-0000-0000-0000-000000000003", slug: "glenlivet-founders-reserve", brand: "The Glenlivet",
    name_he: "גלנליווט פאונדרס", name_fr: "The Glenlivet Founder's Reserve", subcategory: "WHISKY",
    description_fr: "Un single malt élégant et accessible, hommage au fondateur de la distillerie.",
    noseNotes: "Fleurs fraîches, agrumes, notes de vanille.",
    palateNotes: "Rond, fruité, légèrement épicé.",
    finishNotes: "Nette et rafraîchissante.",
    howToServe: "Pur ou avec un glaçon. Verre tumbler recommandé.",
    kosherStatus: null, price: 16900, comparePrice: null,
    country: "Écosse", ageYears: null, abv: 40, volumeMl: 700,
    rating: 4.4, reviewCount: 87, isFeatured: false, isBestSeller: false, badge: null, newUntil: null,
    caskType: "Fûts de chêne américain",
    productionMethod: "Single malt",
  },
  {
    id: "50000000-0000-0000-0000-000000000004", slug: "johnnie-walker-black-label", brand: "Johnnie Walker",
    name_he: "ג'וניווקר בלאק לייבל", name_fr: "Johnnie Walker Black Label", subcategory: "WHISKY",
    description_fr: "Un blended Scotch whisky de 12 ans d'âge minimum, riche et fumé.",
    noseNotes: "Fumée légère, fruits noirs, vanille.",
    palateNotes: "Riche et complexe, notes de fruits secs et d'épices douces.",
    finishNotes: "Longue, légèrement fumée.",
    howToServe: "Pur, avec glace ou en cocktail (Old Fashioned). Verre tumbler recommandé.",
    kosherStatus: null, price: 14900, comparePrice: null,
    country: "Écosse", ageYears: 12, abv: 40, volumeMl: 700,
    rating: 4.5, reviewCount: 201, isFeatured: false, isBestSeller: true, badge: "Best-seller", newUntil: null,
    caskType: "Fûts de chêne", productionMethod: "Assemblage (blend)",
  },
  {
    id: "50000000-0000-0000-0000-000000000005", slug: "jack-daniels-old-no-7", brand: "Jack Daniel's",
    name_he: "ג'ק דניאלס", name_fr: "Jack Daniel's Old No. 7", subcategory: "WHISKY",
    description_fr: "Le Tennessee whiskey le plus célèbre au monde, filtré sur charbon d'érable.",
    noseNotes: "Vanille, caramel, chêne toasté.",
    palateNotes: "Rond et doux, notes de caramel et de bois.",
    finishNotes: "Douce, légèrement fumée.",
    howToServe: "Pur, avec glace ou en cocktail (Jack & Coke). Verre tumbler recommandé.",
    kosherStatus: null, price: 12900, comparePrice: null,
    country: "États-Unis", ageYears: null, abv: 40, volumeMl: 700,
    rating: 4.3, reviewCount: 156, isFeatured: false, isBestSeller: false, badge: null, newUntil: null,
    productionMethod: "Filtration Lincoln County sur charbon d'érable",
  },
  {
    id: "50000000-0000-0000-0000-000000000006", slug: "jameson", brand: "Jameson",
    name_he: "ג'יימסון", name_fr: "Jameson", subcategory: "WHISKY",
    description_fr: "Le blended Irish whiskey le plus vendu au monde, triple distillé pour une grande douceur.",
    noseNotes: "Notes florales, épices douces, bois.",
    palateNotes: "Doux et onctueux, vanille et fruits mûrs.",
    finishNotes: "Nette et équilibrée.",
    howToServe: "Pur, avec glace ou en cocktail (Jameson Ginger). Verre tumbler recommandé.",
    kosherStatus: null, price: 11900, comparePrice: 13500,
    country: "Irlande", ageYears: null, abv: 40, volumeMl: 700,
    rating: 4.4, reviewCount: 178, isFeatured: false, isBestSeller: true, badge: null, newUntil: null,
    productionMethod: "Triple distillation",
  },
  {
    id: "50000000-0000-0000-0000-000000000007", slug: "arak-elite", brand: "Elite",
    name_he: "עראק אליט", name_fr: "Arak Elite", subcategory: "ARAK",
    description_fr: "Un arak israélien traditionnel distillé à partir de raisins et aromatisé à l'anis.",
    noseNotes: "Anis frais, notes florales.",
    palateNotes: "Doux et anisé, légèrement sucré une fois dilué.",
    finishNotes: "Rafraîchissante et persistante.",
    howToServe: "Toujours dilué avec de l'eau fraîche et des glaçons (1 volume d'arak pour 2 à 3 volumes d'eau). Verre droit recommandé.",
    kosherStatus: "Casher Mehadrin", price: 8900, comparePrice: null,
    country: "Israël", ageYears: null, abv: 40, volumeMl: 700,
    rating: 4.5, reviewCount: 64, isFeatured: true, isBestSeller: false, badge: null, newUntil: null,
    productionMethod: "Distillation traditionnelle du raisin, aromatisation à l'anis",
  },
  {
    id: "50000000-0000-0000-0000-000000000008", slug: "arak-askalon", brand: "Askalon",
    name_he: "עראק אשקלון", name_fr: "Arak Askalon", subcategory: "ARAK",
    description_fr: "Un arak artisanal produit par la distillerie Askalon, réputé pour sa pureté aromatique.",
    noseNotes: "Anis intense, notes herbacées.",
    palateNotes: "Franc et aromatique, texture soyeuse une fois dilué.",
    finishNotes: "Longue, nette, légèrement sucrée.",
    howToServe: "Toujours dilué avec de l'eau fraîche et des glaçons. Verre droit recommandé.",
    kosherStatus: "Casher Mehadrin", price: 9900, comparePrice: null,
    country: "Israël", ageYears: null, abv: 40, volumeMl: 700,
    rating: 4.6, reviewCount: 39, isFeatured: false, isBestSeller: false, badge: "Nouveau",
    newUntil: "2099-01-01T00:00:00Z",
    productionMethod: "Distillation artisanale, aromatisation à l'anis",
  },
  {
    id: "50000000-0000-0000-0000-000000000009", slug: "tubi-60", brand: "Tubi",
    name_he: "טובי 60", name_fr: "Tubi 60 blanc", subcategory: "ARAK",
    description_fr: "Un arak puissant à 60° d'alcool, pour les amateurs de sensations fortes et de tradition.",
    noseNotes: "Anis puissant, notes minérales.",
    palateNotes: "Intense et corsé, très aromatique.",
    finishNotes: "Longue et chaleureuse.",
    howToServe: "Toujours largement dilué avec de l'eau fraîche et des glaçons, en raison de son fort degré d'alcool. Verre droit recommandé.",
    kosherStatus: "Casher Mehadrin", price: 7900, comparePrice: null,
    country: "Israël", ageYears: null, abv: 60, volumeMl: 700,
    rating: 4.2, reviewCount: 28, isFeatured: false, isBestSeller: false, badge: null, newUntil: null,
    productionMethod: "Distillation traditionnelle du raisin",
  },
  {
    id: "50000000-0000-0000-0000-000000000010", slug: "hennessy-vs", brand: "Hennessy",
    name_he: "הנסי VS", name_fr: "Hennessy V.S", subcategory: "COGNAC",
    description_fr: "Un cognac Very Special, assemblage vif et fruité, référence de la maison Hennessy.",
    noseNotes: "Fruits secs, notes florales.",
    palateNotes: "Vif et fruité, légèrement épicé.",
    finishNotes: "Nette, chaleureuse.",
    howToServe: "Pur, avec glace ou en cocktail. Verre tulipe recommandé.",
    kosherStatus: null, price: 21900, comparePrice: null,
    country: "France", ageYears: null, abv: 40, volumeMl: 700,
    rating: 4.5, reviewCount: 52, isFeatured: false, isBestSeller: false, badge: null, newUntil: null,
    productionMethod: "Double distillation, assemblage d'eaux-de-vie de Cognac",
  },
  {
    id: "50000000-0000-0000-0000-000000000011", slug: "havana-club-7", brand: "Havana Club",
    name_he: "האוואנה קלאב 7", name_fr: "Havana Club 7 ans", subcategory: "RHUM",
    description_fr: "Un rhum cubain vieilli 7 ans, riche et complexe, référence des amateurs de rhum brun.",
    noseNotes: "Vanille, bois, fruits confits.",
    palateNotes: "Rond et intense, notes de caramel et d'épices.",
    finishNotes: "Longue et boisée.",
    howToServe: "Pur, sur glace ou en cocktail (Cuba Libre). Verre tumbler recommandé.",
    kosherStatus: null, price: 13900, comparePrice: null,
    country: "Cuba", ageYears: 7, abv: 40, volumeMl: 700,
    rating: 4.4, reviewCount: 46, isFeatured: false, isBestSeller: false, badge: null, newUntil: null,
    productionMethod: "Vieillissement en fûts de chêne américain",
  },
  {
    id: "50000000-0000-0000-0000-000000000012", slug: "don-julio-blanco", brand: "Don Julio",
    name_he: "דון חוליו בלנקו", name_fr: "Don Julio Blanco", subcategory: "TEQUILA",
    description_fr: "Une tequila 100% agave bleue, fraîche et pure, référence de la tequila premium.",
    noseNotes: "Agave frais, agrumes.",
    palateNotes: "Doux et rond, notes végétales et poivrées.",
    finishNotes: "Nette et fraîche.",
    howToServe: "Pur, en shot ou en cocktail (Margarita). Verre à shot ou tumbler recommandé.",
    kosherStatus: null, price: 22900, comparePrice: null,
    country: "Mexique", ageYears: null, abv: 38, volumeMl: 700,
    rating: 4.6, reviewCount: 34, isFeatured: true, isBestSeller: false, badge: null, newUntil: null,
    productionMethod: "100% agave bleue, double distillation",
  },
  {
    id: "50000000-0000-0000-0000-000000000013", slug: "grey-goose", brand: "Grey Goose",
    name_he: "גרי גוס", name_fr: "Grey Goose", subcategory: "VODKA",
    description_fr: "Une vodka française premium, distillée à partir de blé et filtrée à l'eau de source de Gensac.",
    noseNotes: "Discret, légèrement sucré.",
    palateNotes: "Soyeux et pur, notes délicates d'amande.",
    finishNotes: "Nette et propre.",
    howToServe: "Bien fraîche, pure ou en cocktail (Cosmopolitan). Verre à shot glacé recommandé.",
    kosherStatus: "Casher", price: 17900, comparePrice: null,
    country: "France", ageYears: null, abv: 40, volumeMl: 700,
    rating: 4.5, reviewCount: 91, isFeatured: true, isBestSeller: true, badge: "Coup de cœur", newUntil: null,
    productionMethod: "Distillation du blé, filtration à l'eau de source",
    servingTemperature: "Très fraîche (2–4°C)",
  },
  {
    id: "50000000-0000-0000-0000-000000000014", slug: "belvedere", brand: "Belvedere",
    name_he: "בלוודר", name_fr: "Belvedere", subcategory: "VODKA",
    description_fr: "Une vodka polonaise premium, distillée quatre fois à partir de seigle Dankowskie.",
    noseNotes: "Léger, notes de vanille et de seigle.",
    palateNotes: "Onctueux et rond, texture crémeuse.",
    finishNotes: "Douce et persistante.",
    howToServe: "Bien fraîche, pure ou en cocktail. Verre à shot glacé recommandé.",
    kosherStatus: null, price: 16900, comparePrice: 18900,
    country: "Pologne", ageYears: null, abv: 40, volumeMl: 700,
    rating: 4.4, reviewCount: 58, isFeatured: false, isBestSeller: false, badge: null, newUntil: null,
    productionMethod: "Quadruple distillation du seigle Dankowskie",
    servingTemperature: "Très fraîche (2–4°C)",
  },
  {
    id: "50000000-0000-0000-0000-000000000015", slug: "bombay-sapphire", brand: "Bombay Sapphire",
    name_he: "במבייספייר", name_fr: "Bombay Sapphire", subcategory: "GIN",
    description_fr: "Un gin anglais distillé à la vapeur avec dix botaniques soigneusement sélectionnées.",
    noseNotes: "Genièvre, agrumes, épices douces.",
    palateNotes: "Frais et complexe, notes botaniques équilibrées.",
    finishNotes: "Nette et aromatique.",
    howToServe: "En cocktail (Gin Tonic) avec des glaçons et une rondelle de citron. Verre ballon recommandé.",
    kosherStatus: null, price: 13900, comparePrice: null,
    country: "Royaume-Uni", ageYears: null, abv: 40, volumeMl: 700,
    rating: 4.3, reviewCount: 73, isFeatured: false, isBestSeller: false, badge: null, newUntil: null,
    productionMethod: "Distillation à la vapeur de dix botaniques",
  },
  {
    id: "50000000-0000-0000-0000-000000000016", slug: "baileys-original", brand: "Baileys",
    name_he: "ניילייס אוריג'ינל", name_fr: "Baileys Original", subcategory: "LIQUEUR",
    description_fr: "Une liqueur irlandaise crémeuse à base de whiskey et de crème fraîche.",
    noseNotes: "Crème, cacao, vanille.",
    palateNotes: "Onctueux et gourmand, notes de café et de caramel.",
    finishNotes: "Douce et persistante.",
    howToServe: "Frais, sur glace ou en cocktail dessert. Verre à liqueur recommandé.",
    kosherStatus: null, price: 9900, comparePrice: null,
    country: "Irlande", ageYears: null, abv: 17, volumeMl: 700,
    rating: 4.2, reviewCount: 45, isFeatured: false, isBestSeller: false, badge: null, newUntil: null,
    productionMethod: "Assemblage de whiskey irlandais et de crème fraîche",
    servingTemperature: "Frais (4–8°C)",
  },
  {
    id: "50000000-0000-0000-0000-000000000017", slug: "campari", brand: "Campari",
    name_he: "קמפרי", name_fr: "Campari", subcategory: "APERITIF",
    description_fr: "Un apéritif italien amer et aromatique, incontournable des cocktails classiques.",
    noseNotes: "Orange amère, épices, plantes aromatiques.",
    palateNotes: "Amer et vif, notes d'agrumes confits.",
    finishNotes: "Longue et amère.",
    howToServe: "En apéritif avec des glaçons et une tranche d'orange, ou en cocktail (Negroni, Spritz). Verre ballon recommandé.",
    kosherStatus: null, price: 8900, comparePrice: null,
    country: "Italie", ageYears: null, abv: 25, volumeMl: 700,
    rating: 4.1, reviewCount: 37, isFeatured: false, isBestSeller: false, badge: null, newUntil: null,
    productionMethod: "Infusion de plantes, herbes aromatiques et écorces d'agrumes",
  },
  {
    id: "50000000-0000-0000-0000-000000000018", slug: "macallan-18", brand: "The Macallan",
    name_he: "מקאלן 18", name_fr: "The Macallan 18 ans", subcategory: "PREMIUM",
    description_fr: "Un single malt d'exception vieilli 18 ans en fûts de sherry espagnol, pour les grandes occasions.",
    noseNotes: "Fruits secs, épices, chêne noble.",
    palateNotes: "Riche et velouté, notes de sherry et de chocolat noir.",
    finishNotes: "Très longue, élégante et boisée.",
    howToServe: "Pur, à température ambiante, dans un verre tulipe pour révéler tous les arômes.",
    kosherStatus: null, price: 54900, comparePrice: null,
    country: "Écosse", ageYears: 18, abv: 43, volumeMl: 700,
    rating: 4.9, reviewCount: 22, isFeatured: true, isBestSeller: false, badge: "Édition limitée", newUntil: null,
    caskType: "Fûts de sherry espagnol", productionMethod: "Single malt",
    edition: "Sherry Oak 18 Years",
  },
];

const SPIRIT_TYPES = ["arak", "cognac", "gin", "liqueurs", "other", "rum", "tequila", "vodka", "whisky"];
const WINE_DIRS = ["castel", "carmel", "gamla", "golan", "yarden", "other-brands"];
const BOTTLE_IMAGES_FALLBACK = [
  "/images/terminal-3/spirits/whisky/chivas-regal-12.png",
  "/images/terminal-3/spirits/whisky/glenfiddich-12.png",
  "/images/terminal-3/wines/yarden/wines-yarden-02.webp",
];

function scanBottleImages(): string[] {
  const base = path.join(process.cwd(), "public", "images", "terminal-3");
  const out: string[] = [];
  try {
    for (const type of SPIRIT_TYPES) {
      const dir = path.join(base, "spirits", type);
      if (!fs.existsSync(dir)) continue;
      for (const name of fs.readdirSync(dir)) {
        if (/\.(png|webp|jpg|jpeg)$/i.test(name) && !name.startsWith(".")) {
          out.push(`/images/terminal-3/spirits/${type}/${name}`);
        }
      }
    }
    for (const w of WINE_DIRS) {
      const dir = path.join(base, "wines", w);
      if (!fs.existsSync(dir)) continue;
      for (const name of fs.readdirSync(dir)) {
        if (/\.(png|webp|jpg|jpeg)$/i.test(name) && !name.startsWith(".")) {
          out.push(`/images/terminal-3/wines/${w}/${name}`);
        }
      }
    }
  } catch {
    // filesystem unavailable (browser or restricted env)
  }
  return out.length ? out : BOTTLE_IMAGES_FALLBACK;
}

/**
 * Option C : mappe chaque slug produit vers son image exacte.
 * Pour l'utiliser, renomme l'image avec le slug du produit et place-la dans
 * le sous-dossier correspondant à sa catégorie (whisky, tequila, vodka…).
 * Exemple : /images/terminal-3/spirits/whisky/jack-daniels-old-no-7.png
 */
const SPIRIT_IMAGE_OVERRIDES: Record<string, string> = {};
const ALL_BOTTLE_IMAGES = scanBottleImages();
const EXTRA_BOTTLES = generateBottles(ALL_BOTTLE_IMAGES, Math.min(400, ALL_BOTTLE_IMAGES.length), 0);

function buildMockSpirits(): ProductWithMedia[] {
  return spiritDefs.map((def, index) => ({
    id: def.id,
    slug: def.slug,
    category_id: spiritsCategoryId,
    product_type: "STANDARD",
    brand: def.brand,
    brand_id: null,
    name_he: def.name_he,
    name_fr: def.name_fr,
    name_en: null,
    description_he: null,
    description_fr: def.description_fr,
    description_en: null,
    origin: def.country,
    tasting_notes: null,
    pairing_notes: null,
    how_to_serve: def.howToServe,
    storage_info: "À conserver debout, à l'abri de la lumière et de la chaleur.",
    kosher_status: def.kosherStatus,
    allergen_info: null,
    age_restricted: true,
    status: "published",
    is_featured: def.isFeatured,
    availability_status: def.availability ?? "IN_STOCK",
    base_price_agorot: def.price,
    compare_at_price_agorot: def.comparePrice,
    meta_title: null,
    meta_description: null,
    serves_min: null,
    serves_max: null,
    composition_text: null,
    advance_order_hours: 0,
    customizable: false,
    preparation_time_minutes: null,
    published_at: "2024-01-01T00:00:00Z",
    new_until: def.newUntil,
    created_at: "2024-01-01T00:00:00Z",
    updated_at: "2024-01-01T00:00:00Z",
    wine_type: null,
    region: null,
    country: def.country,
    grape_varieties: null,
    rating: def.rating,
    review_count: def.reviewCount,
    is_best_seller: def.isBestSeller,
    badge: def.badge,
    serving_temperature: def.servingTemperature ?? null,
    aging_potential: null,
    vinification_method: null,
    subcategory: def.subcategory,
    age_years: def.ageYears,
    nose_notes: def.noseNotes,
    palate_notes: def.palateNotes,
    finish_notes: def.finishNotes,
    cask_type: def.caskType ?? null,
    edition: def.edition ?? null,
    production_method: def.productionMethod ?? null,
    meat_type: null,
    is_available_for_platter: false,
    nutrition_info: null,
    expiration_info: null,
    fish_type: null,
    preparation_method: null,
    smoked: false,
    category: spiritsCategory,
    variants: [
      {
        id: `${def.id}-v1`,
        product_id: def.id,
        sku: null,
        label: `${def.volumeMl}ml`,
        weight_g: null,
        volume_ml: def.volumeMl,
        abv: def.abv,
        vintage: null,
        regular_price_agorot: def.price,
        is_default: true,
        limited_stock: def.availability === "LOW_STOCK",
        availability_status: def.availability ?? "IN_STOCK",
        display_order: 0,
        status: "published",
        pricing_unit: null,
        packaging: null,
        created_at: "2024-01-01T00:00:00Z",
        updated_at: "2024-01-01T00:00:00Z",
      },
    ],
    media: [
      {
        id: `${def.id}-m1`,
        product_id: def.id,
        variant_id: null,
        url: SPIRIT_IMAGE_OVERRIDES[def.slug] ?? ALL_BOTTLE_IMAGES[index % ALL_BOTTLE_IMAGES.length],
        alt: `Bouteille de ${def.name_fr}`,
        kind: "COVER",
        display_order: 0,
        created_at: "2024-01-01T00:00:00Z",
      },
    ],
  }));
}

export const mockSpirits = buildMockSpirits();

// ============================================================
// CHARCUTERIE — /charcuterie demo catalog (backed by the normal data
// layer, not a component-level static array). The first 10 rows mirror
// the real Hebrew-only draft rows already in db/seed/seed.sql (same ids
// and Hebrew names) enriched with honest French name translations,
// subcategory, format and provisional pricing — never fabricated
// allergens, kosher status or expiration dates (kept null, exactly like
// the real seed comment "No ... kosher/... allergen info invented").
// The last 4 rows are provisional demo references (Pastrami, Roast-beef,
// Volaille, a tasting platter) covering the remaining quick-filter
// categories that have no real product yet — replace/expand from /admin
// once real inventory is available, same as the wine/spirits catalogs.
// ============================================================

interface CharcuterieVariantDef {
  label: string;
  weightG: number | null;
  priceAgorot: number;
  pricingUnit: "FIXED" | "PACKAGE" | "PER_100G" | "PER_KG" | "FROM";
  availability?: ProductAvailabilityStatus;
}

interface CharcuterieDef {
  id: string;
  slug: string;
  nameHe: string;
  nameFr: string;
  subcategory: string;
  meatType: string | null;
  descriptionFr: string | null;
  howToServe: string | null;
  storageInfo: string | null;
  variants: CharcuterieVariantDef[];
  isFeatured: boolean;
  isBestSeller: boolean;
  isAvailableForPlatter: boolean;
  badge: string | null;
  newUntil: string | null;
  rating: number | null;
  reviewCount: number;
  productType?: "STANDARD" | "PLATTER";
  servesMin?: number | null;
  servesMax?: number | null;
}

const charcuterieDefs: CharcuterieDef[] = [
  {
    id: "30000000-0000-0000-0000-000000000001", slug: "tsarfati", nameHe: "צרפתי", nameFr: "Saucisson français",
    subcategory: "FRANCAIS", meatType: null,
    descriptionFr: "Un saucisson sec de tradition française, affiné avec soin.",
    howToServe: "Se déguste froid, tranché fin, à l'apéritif ou sur un plateau.",
    storageInfo: "À conserver au réfrigérateur entre 0 et 4°C.",
    variants: [
      { label: "200 g", weightG: 200, priceAgorot: 3900, pricingUnit: "PACKAGE" },
      { label: "400 g", weightG: 400, priceAgorot: 6900, pricingUnit: "PACKAGE" },
    ],
    isFeatured: false, isBestSeller: false, isAvailableForPlatter: true, badge: null, newUntil: null,
    rating: null, reviewCount: 0,
  },
  {
    id: "30000000-0000-0000-0000-000000000002", slug: "sinta", nameHe: "סינטה", nameFr: "Sinta fumée",
    subcategory: "SINTA", meatType: null,
    descriptionFr: "Sinta fumée, tranchée fin ou vendue entière selon vos besoins.",
    howToServe: "Se déguste froid, en tranches fines, à l'apéritif ou en sandwich.",
    storageInfo: "À conserver au réfrigérateur entre 0 et 4°C.",
    variants: [
      { label: "Tranché · 200 g", weightG: 200, priceAgorot: 4900, pricingUnit: "PACKAGE" },
      { label: "Entier", weightG: null, priceAgorot: 8900, pricingUnit: "PER_KG" },
    ],
    isFeatured: true, isBestSeller: false, isAvailableForPlatter: true, badge: null, newUntil: null,
    rating: null, reviewCount: 0,
  },
  {
    id: "30000000-0000-0000-0000-000000000003", slug: "rozet", nameHe: "רוזט", nameFr: "Rosette",
    subcategory: "ROSETTE", meatType: null,
    descriptionFr: "Rosette de tradition, affinée lentement pour un goût authentique.",
    howToServe: "Se déguste froide, tranchée fin, à l'apéritif ou sur un plateau.",
    storageInfo: "À conserver au réfrigérateur entre 0 et 4°C.",
    variants: [
      { label: "100 g", weightG: 100, priceAgorot: 2500, pricingUnit: "PACKAGE" },
      { label: "200 g", weightG: 200, priceAgorot: 4500, pricingUnit: "PACKAGE" },
      { label: "300 g", weightG: 300, priceAgorot: 6500, pricingUnit: "PACKAGE" },
    ],
    isFeatured: true, isBestSeller: true, isAvailableForPlatter: true, badge: "Best-seller", newUntil: null,
    rating: null, reviewCount: 0,
  },
  {
    id: "30000000-0000-0000-0000-000000000004", slug: "krakover", nameHe: "קרקובר", nameFr: "Krakover",
    subcategory: "SAUCISSES", meatType: null,
    descriptionFr: "Saucisse fumée de style Krakover, à réchauffer ou déguster froide.",
    howToServe: "Se déguste chaude ou froide, tranchée, avec de la moutarde.",
    storageInfo: "À conserver au réfrigérateur entre 0 et 4°C.",
    variants: [{ label: "300 g", weightG: 300, priceAgorot: 3200, pricingUnit: "PACKAGE" }],
    isFeatured: false, isBestSeller: false, isAvailableForPlatter: false, badge: null, newUntil: null,
    rating: null, reviewCount: 0,
  },
  {
    id: "30000000-0000-0000-0000-000000000005", slug: "salami-itlaki", nameHe: "סלמי איטלקי", nameFr: "Salami italien",
    subcategory: "SAUCISSES", meatType: null,
    descriptionFr: "Salami de style italien, affiné pour un goût prononcé.",
    howToServe: "Se déguste froid, tranché fin, à l'apéritif ou sur un plateau.",
    storageInfo: "À conserver au réfrigérateur entre 0 et 4°C.",
    variants: [{ label: "200 g", weightG: 200, priceAgorot: 2900, pricingUnit: "PACKAGE" }],
    isFeatured: false, isBestSeller: false, isAvailableForPlatter: true, badge: null, newUntil: null,
    rating: null, reviewCount: 0,
  },
  {
    id: "30000000-0000-0000-0000-000000000006", slug: "makel-tsarfati", nameHe: "מקל צרפתי", nameFr: "Bâton français",
    subcategory: "BATONS", meatType: null,
    descriptionFr: "Bâton de saucisson sec français, format individuel.",
    howToServe: "Se déguste froid, en tranches, à l'apéritif.",
    storageInfo: "À conserver au réfrigérateur entre 0 et 4°C.",
    variants: [{ label: "150 g", weightG: 150, priceAgorot: 1900, pricingUnit: "PACKAGE" }],
    isFeatured: false, isBestSeller: false, isAvailableForPlatter: true, badge: null, newUntil: null,
    rating: null, reviewCount: 0,
  },
  {
    id: "30000000-0000-0000-0000-000000000007", slug: "makel-rozet", nameHe: "מקל רוזט", nameFr: "Bâton rosette",
    subcategory: "BATONS", meatType: null,
    descriptionFr: "Bâton de rosette, format individuel, idéal à emporter.",
    howToServe: "Se déguste froid, en tranches, à l'apéritif.",
    storageInfo: "À conserver au réfrigérateur entre 0 et 4°C.",
    variants: [{ label: "150 g", weightG: 150, priceAgorot: 1900, pricingUnit: "PACKAGE" }],
    isFeatured: false, isBestSeller: false, isAvailableForPlatter: true, badge: null, newUntil: null,
    rating: null, reviewCount: 0,
  },
  {
    id: "30000000-0000-0000-0000-000000000008", slug: "pate-yayin", nameHe: "פטה יין", nameFr: "Pâté au vin",
    subcategory: "PATES", meatType: null,
    descriptionFr: "Pâté fin au vin, à tartiner sur du pain frais ou des crackers.",
    howToServe: "Se déguste froid, tartiné sur du pain ou des crackers.",
    storageInfo: "À conserver au réfrigérateur entre 0 et 4°C.",
    variants: [{ label: "200 g", weightG: 200, priceAgorot: 2400, pricingUnit: "PACKAGE" }],
    isFeatured: false, isBestSeller: false, isAvailableForPlatter: true, badge: null, newUntil: null,
    rating: null, reviewCount: 0,
  },
  {
    id: "30000000-0000-0000-0000-000000000009", slug: "pate-pitriyot", nameHe: "פטה פטריות", nameFr: "Pâté aux champignons",
    subcategory: "PATES", meatType: null,
    descriptionFr: "Pâté fin aux champignons, à tartiner sur du pain frais ou des crackers.",
    howToServe: "Se déguste froid, tartiné sur du pain ou des crackers.",
    storageInfo: "À conserver au réfrigérateur entre 0 et 4°C.",
    variants: [{ label: "200 g", weightG: 200, priceAgorot: 2400, pricingUnit: "PACKAGE" }],
    isFeatured: false, isBestSeller: false, isAvailableForPlatter: true, badge: null, newUntil: null,
    rating: null, reviewCount: 0,
  },
  {
    id: "30000000-0000-0000-0000-000000000010", slug: "kabanos", nameHe: "קבנוס", nameFr: "Kabanos",
    subcategory: "KABANOS", meatType: null,
    descriptionFr: "Fines saucisses sèches façon Kabanos, vendues en sachet ou au poids.",
    howToServe: "Se déguste froid ou légèrement réchauffé, à l'apéritif.",
    storageInfo: "À conserver au réfrigérateur entre 0 et 4°C.",
    variants: [
      { label: "Sachet 250 g", weightG: 250, priceAgorot: 2200, pricingUnit: "PACKAGE" },
      { label: "Au poids", weightG: null, priceAgorot: 7900, pricingUnit: "PER_KG" },
    ],
    isFeatured: false, isBestSeller: false, isAvailableForPlatter: false, badge: null, newUntil: null,
    rating: null, reviewCount: 0,
  },
  // Provisional demo references — cover the remaining quick-filter
  // categories (Pastrami, Roast-beef, Volaille, Plateaux) until real
  // products exist for them. Replace/expand from /admin.
  {
    id: "30000000-0000-0000-0000-000000000011", slug: "pastrami-fume", nameHe: "פסטרמי מעושן", nameFr: "Pastrami fumé",
    subcategory: "PASTRAMI", meatType: "Bœuf",
    descriptionFr: "Pastrami de bœuf fumé lentement, tranché fin ou vendu entier.",
    howToServe: "Se déguste froid ou légèrement tiédi, en sandwich ou sur un plateau.",
    storageInfo: "À conserver au réfrigérateur entre 0 et 4°C.",
    variants: [
      { label: "Tranché · 200 g", weightG: 200, priceAgorot: 3900, pricingUnit: "PACKAGE" },
      { label: "Entier", weightG: null, priceAgorot: 9900, pricingUnit: "PER_KG" },
    ],
    isFeatured: true, isBestSeller: true, isAvailableForPlatter: true, badge: "Best-seller", newUntil: null,
    rating: 4.6, reviewCount: 58,
  },
  {
    id: "30000000-0000-0000-0000-000000000012", slug: "roastbeef-tranche", nameHe: "רוסביף פרוס", nameFr: "Roast-beef tranché",
    subcategory: "ROASTBEEF", meatType: "Bœuf",
    descriptionFr: "Roast-beef tranché fin, cuit puis refroidi lentement pour rester tendre.",
    howToServe: "Se déguste froid, en tranches fines, avec de la moutarde ou en sandwich.",
    storageInfo: "À conserver au réfrigérateur entre 0 et 4°C.",
    variants: [{ label: "Tranché fin · 150 g", weightG: 150, priceAgorot: 4200, pricingUnit: "PACKAGE" }],
    isFeatured: false, isBestSeller: false, isAvailableForPlatter: true, badge: null, newUntil: null,
    rating: 4.5, reviewCount: 32,
  },
  {
    id: "30000000-0000-0000-0000-000000000013", slug: "volaille-fumee", nameHe: "חזה הודו מעושן", nameFr: "Poitrine de dinde fumée",
    subcategory: "VOLAILLE", meatType: "Volaille (dinde)",
    descriptionFr: "Poitrine de dinde fumée, tranchée fin pour vos sandwichs et plateaux.",
    howToServe: "Se déguste froide, en tranches fines, en sandwich ou sur un plateau.",
    storageInfo: "À conserver au réfrigérateur entre 0 et 4°C.",
    variants: [{ label: "Tranché · 200 g", weightG: 200, priceAgorot: 3200, pricingUnit: "PACKAGE" }],
    isFeatured: false, isBestSeller: false, isAvailableForPlatter: true, badge: "Nouveau", newUntil: "2099-01-01T00:00:00Z",
    rating: 4.3, reviewCount: 21,
  },
  {
    id: "30000000-0000-0000-0000-000000000014", slug: "plateau-degustation-charcuterie", nameHe: "מגש דגימת נקניקים", nameFr: "Plateau dégustation charcuterie",
    subcategory: "PLATEAUX", meatType: null,
    descriptionFr: "Un assortiment de nos meilleures charcuteries, composé pour vos réceptions.",
    howToServe: "Servir frais, accompagné de pain, cornichons et moutarde.",
    storageInfo: "À conserver au réfrigérateur entre 0 et 4°C, à sortir 15 minutes avant de servir.",
    variants: [{ label: "4 à 6 personnes", weightG: null, priceAgorot: 14900, pricingUnit: "FROM" }],
    isFeatured: true, isBestSeller: false, isAvailableForPlatter: false, badge: "Coup de cœur", newUntil: null,
    rating: null, reviewCount: 0, productType: "PLATTER", servesMin: 4, servesMax: 6,
  },
];

function buildMockCharcuterie(): ProductWithMedia[] {
  const charcuteriePhotos = [
    "/images/terminal-3/delicatessen/pastrami/delicatessen-pastrami-01.webp",
    "/images/terminal-3/delicatessen/pastrami/delicatessen-pastrami-02.webp",
    "/images/terminal-3/delicatessen/pastrami/delicatessen-pastrami-03.webp",
    "/images/terminal-3/delicatessen/pastrami/delicatessen-pastrami-04.webp",
    "/images/terminal-3/delicatessen/pastrami/delicatessen-pastrami-05.webp",
    "/images/terminal-3/delicatessen/pastrami/delicatessen-pastrami-06.webp",
    "/images/terminal-3/delicatessen/pastrami/delicatessen-pastrami-07.webp",
  ];
  return charcuterieDefs.map((def, index) => ({
    id: def.id,
    slug: def.slug,
    category_id: charcuterieCategoryId,
    product_type: def.productType ?? "STANDARD",
    brand: null,
    brand_id: null,
    name_he: def.nameHe,
    name_fr: def.nameFr,
    name_en: null,
    description_he: null,
    description_fr: def.descriptionFr,
    description_en: null,
    origin: null,
    tasting_notes: null,
    pairing_notes: null,
    how_to_serve: def.howToServe,
    storage_info: def.storageInfo,
    // Never fabricated — left null until confirmed by the administration.
    kosher_status: null,
    allergen_info: null,
    age_restricted: false,
    status: "published",
    is_featured: def.isFeatured,
    availability_status: def.variants[0]?.availability ?? "IN_STOCK",
    base_price_agorot: def.variants[0]?.priceAgorot ?? null,
    compare_at_price_agorot: null,
    meta_title: null,
    meta_description: null,
    serves_min: def.servesMin ?? null,
    serves_max: def.servesMax ?? null,
    composition_text: null,
    advance_order_hours: 0,
    customizable: false,
    preparation_time_minutes: null,
    published_at: "2024-01-01T00:00:00Z",
    new_until: def.newUntil,
    created_at: "2024-01-01T00:00:00Z",
    updated_at: "2024-01-01T00:00:00Z",
    wine_type: null,
    region: null,
    country: null,
    grape_varieties: null,
    rating: def.rating,
    review_count: def.reviewCount,
    is_best_seller: def.isBestSeller,
    badge: def.badge,
    serving_temperature: null,
    aging_potential: null,
    vinification_method: null,
    subcategory: def.subcategory,
    age_years: null,
    nose_notes: null,
    palate_notes: null,
    finish_notes: null,
    cask_type: null,
    edition: null,
    production_method: null,
    meat_type: def.meatType,
    is_available_for_platter: def.isAvailableForPlatter,
    nutrition_info: null,
    expiration_info: null,
    fish_type: null,
    preparation_method: null,
    smoked: false,
    category: charcuterieCategory,
    variants: def.variants.map((v, index) => ({
      id: `${def.id}-v${index + 1}`,
      product_id: def.id,
      sku: null,
      label: v.label,
      weight_g: v.weightG,
      volume_ml: null,
      abv: null,
      vintage: null,
      regular_price_agorot: v.priceAgorot,
      is_default: index === 0,
      limited_stock: v.availability === "LOW_STOCK",
      availability_status: v.availability ?? "IN_STOCK",
      display_order: index,
      status: "published" as const,
      pricing_unit: v.pricingUnit,
      packaging: null,
      created_at: "2024-01-01T00:00:00Z",
      updated_at: "2024-01-01T00:00:00Z",
    })),
    media: [
      {
        id: `${def.id}-m1`,
        product_id: def.id,
        variant_id: null,
        url: index < 7 ? charcuteriePhotos[index] : "/images/products/charcuterie/placeholder.jpg",
        alt: `${def.nameFr} Terminal 3`,
        kind: "COVER",
        display_order: 0,
        created_at: "2024-01-01T00:00:00Z",
      },
    ],
  }));
}

export const mockCharcuterie = buildMockCharcuterie();

// ============================================================
// POISSONS — /poissons demo catalog (backed by the normal data layer,
// not a component-level static array). The Sarfati salmon rows mirror
// the real ids/Hebrew names already in db/seed/seed.sql; the anchois,
// ventrèche and filet de thon rows mirror the real (draft) rows and
// variants from the same seed file. `smoked` is derived directly from
// each French name containing "fumé" rather than guessed per row, so it
// can never drift from what the name already states. One provisional
// "Saumon fumé aux herbes" reference covers the one remaining
// quick-filter category with no real product yet — replace/expand from
// /admin once real inventory is available, same as the other catalogs.
// No allergens, kosher status or expiration dates are invented; those
// stay null until confirmed by the administration.
// ============================================================

interface FishVariantDef {
  label: string;
  weightG: number | null;
  priceAgorot: number;
  pricingUnit: "FIXED" | "PACKAGE" | "PER_100G" | "PER_KG" | "FROM";
  packaging: "GLASS" | "CAN" | "VACUUM" | "BULK" | "PLASTIC" | null;
  availability?: ProductAvailabilityStatus;
}

interface FishDef {
  id: string;
  slug: string;
  nameHe: string;
  nameFr: string;
  subcategory: string;
  fishType: string;
  preparationMethod: string | null;
  variants: FishVariantDef[];
  isFeatured: boolean;
  isAvailableForPlatter: boolean;
  badge: string | null;
  newUntil: string | null;
  rating: number | null;
  reviewCount: number;
}

const fishDefs: FishDef[] = [
  {
    id: "20000000-0000-0000-0000-000000000001", slug: "carpaccio-saumon-200g", nameHe: "קרפצ׳ו סלמון 200 גרם", nameFr: "Carpaccio de saumon",
    subcategory: "SAUMON_FUME", fishType: "Saumon", preparationMethod: "Fumé à froid, tranché très fin",
    variants: [{ label: "200 g", weightG: 200, priceAgorot: 11990, pricingUnit: "PACKAGE", packaging: "VACUUM" }],
    isFeatured: false, isAvailableForPlatter: true, badge: null, newUntil: null, rating: null, reviewCount: 0,
  },
  {
    id: "20000000-0000-0000-0000-000000000002", slug: "saumon-fume-classique-fin-200g", nameHe: "סלמון מעושן קלאסי פרימיום פרוס דק 200 גרם", nameFr: "Saumon fumé classique premium, tranché fin",
    subcategory: "SAUMON_FUME", fishType: "Saumon", preparationMethod: "Fumé à froid, tranché fin",
    variants: [{ label: "200 g", weightG: 200, priceAgorot: 10990, pricingUnit: "PACKAGE", packaging: "VACUUM" }],
    isFeatured: true, isAvailableForPlatter: true, badge: null, newUntil: null, rating: null, reviewCount: 0,
  },
  {
    id: "20000000-0000-0000-0000-000000000003", slug: "saumon-fume-sans-sucre-fin-200g", nameHe: "סלמון מעושן פרימיום ללא סוכר פרוס דק 200 גרם", nameFr: "Saumon fumé premium sans sucre, tranché fin",
    subcategory: "SAUMON_FUME", fishType: "Saumon", preparationMethod: "Fumé à froid, tranché fin, sans sucre",
    variants: [{ label: "200 g", weightG: 200, priceAgorot: 10990, pricingUnit: "PACKAGE", packaging: "VACUUM" }],
    isFeatured: false, isAvailableForPlatter: true, badge: null, newUntil: null, rating: null, reviewCount: 0,
  },
  {
    id: "20000000-0000-0000-0000-000000000004", slug: "sashimi-saumon-sans-sucre-200g", nameHe: "סשימי סלמון מעושן ללא סוכר 200 גרם", nameFr: "Sashimi de saumon fumé sans sucre",
    subcategory: "SAUMON_FUME", fishType: "Saumon", preparationMethod: "Fumé à froid, coupe sashimi",
    variants: [{ label: "200 g", weightG: 200, priceAgorot: 9990, pricingUnit: "PACKAGE", packaging: "VACUUM" }],
    isFeatured: false, isAvailableForPlatter: false, badge: null, newUntil: null, rating: null, reviewCount: 0,
  },
  {
    id: "20000000-0000-0000-0000-000000000005", slug: "gravlax-200g", nameHe: "גרבלקס / סלמון מרינט 200 גרם", nameFr: "Gravlax / saumon mariné",
    subcategory: "SAUMON_FUME", fishType: "Saumon", preparationMethod: "Mariné (gravlax), non fumé",
    variants: [{ label: "200 g", weightG: 200, priceAgorot: 8490, pricingUnit: "PACKAGE", packaging: "VACUUM" }],
    isFeatured: false, isAvailableForPlatter: true, badge: null, newUntil: null, rating: null, reviewCount: 0,
  },
  {
    id: "20000000-0000-0000-0000-000000000006", slug: "piece-saumon-classique-200g", nameHe: "חתיכת סלמון מעושן קלאסי 200 גרם", nameFr: "Pièce de saumon fumé classique",
    subcategory: "SAUMON_FUME", fishType: "Saumon", preparationMethod: "Fumé à froid, pièce entière",
    variants: [{ label: "200 g", weightG: 200, priceAgorot: 7990, pricingUnit: "PACKAGE", packaging: "VACUUM" }],
    isFeatured: false, isAvailableForPlatter: true, badge: null, newUntil: null, rating: null, reviewCount: 0,
  },
  {
    id: "20000000-0000-0000-0000-000000000007", slug: "piece-saumon-betterave-200g", nameHe: "חתיכת סלמון מעושן בסלק 200 גרם", nameFr: "Pièce de saumon fumé à la betterave",
    subcategory: "SAUMON_FUME", fishType: "Saumon", preparationMethod: "Fumé à froid, mariné à la betterave",
    variants: [{ label: "200 g", weightG: 200, priceAgorot: 7990, pricingUnit: "PACKAGE", packaging: "VACUUM" }],
    isFeatured: false, isAvailableForPlatter: true, badge: null, newUntil: null, rating: null, reviewCount: 0,
  },
  {
    id: "20000000-0000-0000-0000-000000000008", slug: "piece-gravlax-200g", nameHe: "חתיכת גרבלקס 200 גרם", nameFr: "Pièce de gravlax",
    subcategory: "SAUMON_FUME", fishType: "Saumon", preparationMethod: "Mariné (gravlax), non fumé, pièce entière",
    variants: [{ label: "200 g", weightG: 200, priceAgorot: 7990, pricingUnit: "PACKAGE", packaging: "VACUUM" }],
    isFeatured: false, isAvailableForPlatter: true, badge: null, newUntil: null, rating: null, reviewCount: 0,
  },
  {
    id: "20000000-0000-0000-0000-000000000009", slug: "saumon-fume-classique-fin-100g", nameHe: "סלמון מעושן קלאסי פרימיום פרוס דק 100 גרם", nameFr: "Saumon fumé classique premium, tranché fin",
    subcategory: "SAUMON_FUME", fishType: "Saumon", preparationMethod: "Fumé à froid, tranché fin",
    variants: [{ label: "100 g", weightG: 100, priceAgorot: 5690, pricingUnit: "PACKAGE", packaging: "VACUUM" }],
    isFeatured: true, isAvailableForPlatter: true, badge: "Best-seller", newUntil: null, rating: null, reviewCount: 0,
  },
  {
    id: "20000000-0000-0000-0000-000000000010", slug: "sashimi-saumon-classique-100g", nameHe: "סשימי סלמון מעושן קלאסי 100 גרם", nameFr: "Sashimi de saumon fumé classique",
    subcategory: "SAUMON_FUME", fishType: "Saumon", preparationMethod: "Fumé à froid, coupe sashimi",
    variants: [{ label: "100 g", weightG: 100, priceAgorot: 5490, pricingUnit: "PACKAGE", packaging: "VACUUM" }],
    isFeatured: false, isAvailableForPlatter: false, badge: null, newUntil: null, rating: null, reviewCount: 0,
  },
  {
    id: "20000000-0000-0000-0000-000000000011", slug: "sashimi-saumon-sans-sucre-100g", nameHe: "סשימי סלמון מעושן ללא סוכר 100 גרם", nameFr: "Sashimi de saumon fumé sans sucre",
    subcategory: "SAUMON_FUME", fishType: "Saumon", preparationMethod: "Fumé à froid, coupe sashimi, sans sucre",
    variants: [{ label: "100 g", weightG: 100, priceAgorot: 5490, pricingUnit: "PACKAGE", packaging: "VACUUM" }],
    isFeatured: false, isAvailableForPlatter: false, badge: null, newUntil: null, rating: null, reviewCount: 0,
  },
  {
    id: "20000000-0000-0000-0000-000000000012", slug: "sashimi-saumon-citron-poivre-100g", nameHe: "סשימי סלמון מעושן לימון-פלפל 100 גרם", nameFr: "Sashimi de saumon fumé citron-poivre",
    subcategory: "SAUMON_FUME", fishType: "Saumon", preparationMethod: "Fumé à froid, coupe sashimi, citron-poivre",
    variants: [{ label: "100 g", weightG: 100, priceAgorot: 5490, pricingUnit: "PACKAGE", packaging: "VACUUM" }],
    isFeatured: false, isAvailableForPlatter: false, badge: null, newUntil: null, rating: null, reviewCount: 0,
  },
  {
    id: "20000000-0000-0000-0000-000000000013", slug: "gravlax-100g", nameHe: "גרבלקס / סלמון מרינט 100 גרם", nameFr: "Gravlax / saumon mariné",
    subcategory: "SAUMON_FUME", fishType: "Saumon", preparationMethod: "Mariné (gravlax), non fumé",
    variants: [{ label: "100 g", weightG: 100, priceAgorot: 5490, pricingUnit: "PACKAGE", packaging: "VACUUM" }],
    isFeatured: false, isAvailableForPlatter: true, badge: null, newUntil: null, rating: null, reviewCount: 0,
  },
  {
    id: "20000000-0000-0000-0000-000000000014", slug: "sashimi-saumon-betterave-100g", nameHe: "סשימי סלמון מעושן בסלק 100 גרם", nameFr: "Sashimi de saumon fumé à la betterave",
    subcategory: "SAUMON_FUME", fishType: "Saumon", preparationMethod: "Fumé à froid, coupe sashimi, mariné à la betterave",
    variants: [{ label: "100 g", weightG: 100, priceAgorot: 5490, pricingUnit: "PACKAGE", packaging: "VACUUM" }],
    isFeatured: false, isAvailableForPlatter: false, badge: null, newUntil: null, rating: null, reviewCount: 0,
  },
  {
    id: "20000000-0000-0000-0000-000000000015", slug: "truite-fumee-filet", nameHe: "פילה פורל מעושן", nameFr: "Filet de truite fumée",
    subcategory: "SAUMON_FUME", fishType: "Truite", preparationMethod: "Fumé à froid, filet entier",
    variants: [{ label: "100 g", weightG: 100, priceAgorot: 4690, pricingUnit: "PACKAGE", packaging: "VACUUM" }],
    isFeatured: false, isAvailableForPlatter: true, badge: null, newUntil: null, rating: null, reviewCount: 0,
  },
  {
    id: "20000000-0000-0000-0000-000000000016", slug: "thon-rouge-fume-classique-100g", nameHe: "טונה אדומה מעושנת קלאסית 100 גרם", nameFr: "Thon rouge fumé classique",
    subcategory: "FILET_THON", fishType: "Thon rouge", preparationMethod: "Fumé à froid",
    variants: [{ label: "100 g", weightG: 100, priceAgorot: 3990, pricingUnit: "PACKAGE", packaging: "VACUUM" }],
    isFeatured: false, isAvailableForPlatter: true, badge: null, newUntil: null, rating: null, reviewCount: 0,
  },
  {
    id: "20000000-0000-0000-0000-000000000017", slug: "thon-rouge-fume-chaud-100g", nameHe: "טונה אדומה מעושנת חם 100 גרם", nameFr: "Thon rouge fumé à chaud",
    subcategory: "FILET_THON", fishType: "Thon rouge", preparationMethod: "Fumé à chaud",
    variants: [{ label: "100 g", weightG: 100, priceAgorot: 3990, pricingUnit: "PACKAGE", packaging: "VACUUM" }],
    isFeatured: false, isAvailableForPlatter: true, badge: null, newUntil: null, rating: null, reviewCount: 0,
  },
  {
    id: "20000000-0000-0000-0000-000000000018", slug: "duo-saumon-2x100g", nameHe: "זוג חבילות סלמון 2×100 גרם", nameFr: "2 sachets de saumon x100g",
    subcategory: "SAUMON_FUME", fishType: "Saumon", preparationMethod: "Fumé à froid, tranché fin",
    variants: [{ label: "2 x 100 g", weightG: 200, priceAgorot: 9990, pricingUnit: "PACKAGE", packaging: "VACUUM" }],
    isFeatured: false, isAvailableForPlatter: true, badge: null, newUntil: null, rating: null, reviewCount: 0,
  },
  {
    id: "20000000-0000-0000-0000-000000000019", slug: "trio-saumon-3x100g", nameHe: "שלישיית חבילות סלמון 3×100 גרם", nameFr: "3 sachets de saumon x100g",
    subcategory: "SAUMON_FUME", fishType: "Saumon", preparationMethod: "Fumé à froid, tranché fin",
    variants: [{ label: "3 x 100 g", weightG: 300, priceAgorot: 14990, pricingUnit: "PACKAGE", packaging: "VACUUM" }],
    isFeatured: false, isAvailableForPlatter: true, badge: null, newUntil: null, rating: null, reviewCount: 0,
  },
  {
    id: "20000000-0000-0000-0000-000000000020", slug: "duo-saumon-thon-100g", nameHe: "סלמון 100 גרם + טונה 100 גרם", nameFr: "1 saumon 100g + 1 thon 100g",
    subcategory: "SAUMON_FUME", fishType: "Saumon et thon rouge", preparationMethod: "Fumé à froid, tranché fin",
    variants: [{ label: "100 g + 100 g", weightG: 200, priceAgorot: 8990, pricingUnit: "PACKAGE", packaging: "VACUUM" }],
    isFeatured: false, isAvailableForPlatter: true, badge: null, newUntil: null, rating: null, reviewCount: 0,
  },
  // Anchois — mirrors db/seed/seed.sql product '...021' ('anchois'),
  // enriched with honest French naming and packaging per real Hebrew
  // variant labels ("זכוכית" = verre, "פלסטיק" = plastique).
  {
    id: "20000000-0000-0000-0000-000000000021", slug: "anchois", nameHe: "אנשובי", nameFr: "Anchois",
    subcategory: "ANCHOIS", fishType: "Anchois", preparationMethod: "Mariné à l'huile",
    variants: [
      { label: "100 g (verre)", weightG: 100, priceAgorot: 2200, pricingUnit: "PACKAGE", packaging: "GLASS", availability: "IN_STOCK" },
      { label: "300 g (verre)", weightG: 300, priceAgorot: 5400, pricingUnit: "PACKAGE", packaging: "GLASS" },
      { label: "500 g (plastique)", weightG: 500, priceAgorot: 7900, pricingUnit: "PACKAGE", packaging: "PLASTIC" },
    ],
    isFeatured: false, isAvailableForPlatter: true, badge: null, newUntil: null, rating: null, reviewCount: 0,
  },
  // Filet de thon — mirrors db/seed/seed.sql product '...022' ('filet-thon').
  {
    id: "20000000-0000-0000-0000-000000000022", slug: "filet-thon", nameHe: "פילה טונה 540 גרם", nameFr: "Filet de thon",
    subcategory: "FILET_THON", fishType: "Thon", preparationMethod: null,
    variants: [{ label: "540 g", weightG: 540, priceAgorot: 5900, pricingUnit: "PACKAGE", packaging: "VACUUM" }],
    isFeatured: false, isAvailableForPlatter: true, badge: null, newUntil: null, rating: null, reviewCount: 0,
  },
  // Ventrèche de thon — mirrors db/seed/seed.sql product '...023'
  // ('ventreche-thon'); the 1 kg format is priced per kilogram as a
  // professional/bulk format.
  {
    id: "20000000-0000-0000-0000-000000000023", slug: "ventreche-thon", nameHe: "ונטרסקה טונה", nameFr: "Ventrèche de thon",
    subcategory: "VENTRECHE_THON", fishType: "Thon", preparationMethod: null,
    variants: [
      { label: "120 g", weightG: 120, priceAgorot: 2400, pricingUnit: "PACKAGE", packaging: "VACUUM" },
      { label: "200 g", weightG: 200, priceAgorot: 3600, pricingUnit: "PACKAGE", packaging: "VACUUM", availability: "IN_STOCK" },
      { label: "300 g", weightG: 300, priceAgorot: 3900, pricingUnit: "PACKAGE", packaging: "VACUUM" },
      { label: "540 g", weightG: 540, priceAgorot: 6900, pricingUnit: "PACKAGE", packaging: "VACUUM" },
      { label: "1 kg (format professionnel)", weightG: 1000, priceAgorot: 12900, pricingUnit: "PER_KG", packaging: "BULK" },
    ],
    isFeatured: false, isAvailableForPlatter: true, badge: null, newUntil: null, rating: null, reviewCount: 0,
  },
  // Provisional demo reference — covers the one remaining quick-filter
  // category (Saumon aux herbes) that has no real product yet. Replace
  // from /admin once real inventory is available.
  {
    id: "20000000-0000-0000-0000-000000000024", slug: "saumon-fume-aux-herbes", nameHe: "סלמון מעושן בעשבי תיבול", nameFr: "Saumon fumé aux herbes",
    subcategory: "SAUMON_HERBES", fishType: "Saumon", preparationMethod: "Fumé à froid, mariné aux herbes fraîches",
    variants: [{ label: "200 g", weightG: 200, priceAgorot: 7990, pricingUnit: "PACKAGE", packaging: "VACUUM" }],
    isFeatured: true, isAvailableForPlatter: true, badge: "Nouveau", newUntil: "2099-01-01T00:00:00Z", rating: 4.5, reviewCount: 12,
  },
];

function buildMockFish(): ProductWithMedia[] {
  const salmonPhotos = [
    "/images/terminal-3/fish/salmon/fish-salmon-sarfati-01.webp",
    "/images/terminal-3/fish/salmon/fish-salmon-sarfati-02.webp",
    "/images/terminal-3/fish/salmon/fish-salmon-sarfati-03.webp",
    "/images/terminal-3/fish/salmon/fish-salmon-sarfati-04.webp",
    "/images/terminal-3/fish/salmon/fish-salmon-sarfati-05.webp",
    "/images/terminal-3/fish/salmon/fish-salmon-sarfati-06.webp",
    "/images/terminal-3/fish/salmon/fish-salmon-sarfati-07.webp",
    "/images/terminal-3/fish/salmon/fish-salmon-sarfati-08.webp",
  ];
  return fishDefs.map((def, index) => ({
    id: def.id,
    slug: def.slug,
    category_id: salmonCategoryId,
    product_type: "STANDARD",
    brand: "Sarfati",
    brand_id: null,
    name_he: def.nameHe,
    name_fr: def.nameFr,
    name_en: null,
    description_he: null,
    description_fr: `Sélection Terminal 3 — ${def.nameFr.toLowerCase()}.`,
    description_en: null,
    origin: null,
    tasting_notes: null,
    pairing_notes: null,
    how_to_serve: null,
    storage_info: "0–4°C, à consommer sous 48h après ouverture",
    // Never fabricated — left null until confirmed by the administration.
    kosher_status: null,
    allergen_info: null,
    age_restricted: false,
    status: "published",
    is_featured: def.isFeatured,
    availability_status: def.variants[0]?.availability ?? "IN_STOCK",
    base_price_agorot: def.variants[0]?.priceAgorot ?? null,
    compare_at_price_agorot: null,
    meta_title: null,
    meta_description: null,
    serves_min: null,
    serves_max: null,
    composition_text: null,
    advance_order_hours: 0,
    customizable: false,
    preparation_time_minutes: null,
    published_at: "2024-01-01T00:00:00Z",
    new_until: def.newUntil,
    created_at: "2024-01-01T00:00:00Z",
    updated_at: "2024-01-01T00:00:00Z",
    wine_type: null,
    region: null,
    country: null,
    grape_varieties: null,
    rating: def.rating,
    review_count: def.reviewCount,
    is_best_seller: def.badge === "Best-seller",
    badge: def.badge,
    serving_temperature: null,
    aging_potential: null,
    vinification_method: null,
    subcategory: def.subcategory,
    age_years: null,
    nose_notes: null,
    palate_notes: null,
    finish_notes: null,
    cask_type: null,
    edition: null,
    production_method: null,
    meat_type: null,
    is_available_for_platter: def.isAvailableForPlatter,
    nutrition_info: null,
    expiration_info: null,
    fish_type: def.fishType,
    preparation_method: def.preparationMethod,
    smoked: /fumé/i.test(def.nameFr),
    category: salmonCategory,
    variants: def.variants.map((v, index) => ({
      id: `${def.id}-v${index + 1}`,
      product_id: def.id,
      sku: null,
      label: v.label,
      weight_g: v.weightG,
      volume_ml: null,
      abv: null,
      vintage: null,
      regular_price_agorot: v.priceAgorot,
      is_default: index === 0,
      limited_stock: v.availability === "LOW_STOCK",
      availability_status: v.availability ?? "IN_STOCK",
      display_order: index,
      status: "published" as const,
      pricing_unit: v.pricingUnit,
      packaging: v.packaging,
      created_at: "2024-01-01T00:00:00Z",
      updated_at: "2024-01-01T00:00:00Z",
    })),
    media: [
      {
        id: `${def.id}-m1`,
        product_id: def.id,
        variant_id: null,
        url: index < 8 ? salmonPhotos[index] : "/images/products/fish/placeholder.jpg",
        alt: `${def.nameFr} Terminal 3`,
        kind: "COVER",
        display_order: 0,
        created_at: "2024-01-01T00:00:00Z",
      },
    ],
  }));
}

export const mockProducts = buildMockFish();

// ============================================================
// PLATEAUX — /plateaux demo catalog. Real assembled platters (product_type
// "PLATTER") composed from products that genuinely exist elsewhere in the
// catalog — the composition text lists real product names, never
// fabricated ones. Category "plateaux-saumon" (Plateaux Saumon) already
// exists; these rows are its actual products, replacing the earlier bug
// where /plateaux silently fell back to the fish catalog instead of its
// own products.
// ============================================================

interface PlatterDef {
  id: string;
  slug: string;
  nameHe: string;
  nameFr: string;
  descriptionFr: string;
  compositionText: string;
  variants: { label: string; servesMin: number; servesMax: number; priceAgorot: number }[];
  isFeatured: boolean;
  badge: string | null;
  rating: number | null;
  reviewCount: number;
}

const platterDefs: PlatterDef[] = [
  {
    id: "60000000-0000-0000-0000-000000000001", slug: "plateau-saumon-decouverte", nameHe: "מגש סלמון גילוי", nameFr: "Plateau Saumon Découverte",
    descriptionFr: "Un assortiment de nos saumons fumés signature, composé pour un apéritif ou une entrée partagée.",
    compositionText: "Saumon fumé classique premium, Gravlax / saumon mariné, Pièce de saumon fumé à la betterave.",
    variants: [
      { label: "4 à 6 personnes", servesMin: 4, servesMax: 6, priceAgorot: 14900 },
      { label: "8 à 10 personnes", servesMin: 8, servesMax: 10, priceAgorot: 24900 },
    ],
    isFeatured: true, badge: "Coup de cœur", rating: null, reviewCount: 0,
  },
  {
    id: "60000000-0000-0000-0000-000000000002", slug: "plateau-saumon-prestige", nameHe: "מגש סלמון פרסטיז'", nameFr: "Plateau Saumon Prestige",
    descriptionFr: "Notre plateau le plus complet, pour une réception élégante autour du saumon fumé.",
    compositionText: "Carpaccio de saumon, Sashimi de saumon fumé classique, Saumon fumé classique premium, Filet de truite fumée.",
    variants: [{ label: "8 à 10 personnes", servesMin: 8, servesMax: 10, priceAgorot: 32900 }],
    isFeatured: true, badge: null, rating: null, reviewCount: 0,
  },
  {
    id: "60000000-0000-0000-0000-000000000003", slug: "plateau-charcuterie-degustation", nameHe: "מגש נקניקים לטעימה", nameFr: "Plateau Charcuterie Dégustation",
    descriptionFr: "Une sélection de nos charcuteries pour accompagner un apéritif entre amis.",
    compositionText: "Rosette, Saucisson français, Kabanos, Pâté au vin.",
    variants: [{ label: "4 à 6 personnes", servesMin: 4, servesMax: 6, priceAgorot: 15900 }],
    isFeatured: false, badge: null, rating: null, reviewCount: 0,
  },
  {
    id: "60000000-0000-0000-0000-000000000004", slug: "plateau-apero-maison", nameHe: "מגש אפריטיף", nameFr: "Plateau Apéro Maison",
    descriptionFr: "De quoi accompagner votre apéritif : charcuterie fine et spiritueux à partager.",
    compositionText: "Rosette, Bâton français, Salami italien — à accompagner d'un whisky ou d'un apéritif de votre choix.",
    variants: [{ label: "2 à 4 personnes", servesMin: 2, servesMax: 4, priceAgorot: 9900 }],
    isFeatured: false, badge: "Nouveau", rating: null, reviewCount: 0,
  },
];

function buildMockPlatters(): ProductWithMedia[] {
  return platterDefs.map((def) => ({
    id: def.id,
    slug: def.slug,
    category_id: platterCategoryId,
    product_type: "PLATTER",
    brand: null,
    brand_id: null,
    name_he: def.nameHe,
    name_fr: def.nameFr,
    name_en: null,
    description_he: null,
    description_fr: def.descriptionFr,
    description_en: null,
    origin: null,
    tasting_notes: null,
    pairing_notes: null,
    how_to_serve: "Servir frais, à sortir 15 minutes avant de déguster, accompagné de pain et de condiments.",
    storage_info: "À conserver au réfrigérateur entre 0 et 4°C jusqu'au service.",
    kosher_status: null,
    allergen_info: null,
    age_restricted: false,
    status: "published",
    is_featured: def.isFeatured,
    availability_status: "IN_STOCK",
    base_price_agorot: def.variants[0]?.priceAgorot ?? null,
    compare_at_price_agorot: null,
    meta_title: null,
    meta_description: null,
    serves_min: def.variants[0]?.servesMin ?? null,
    serves_max: def.variants[def.variants.length - 1]?.servesMax ?? null,
    composition_text: def.compositionText,
    advance_order_hours: 24,
    customizable: true,
    preparation_time_minutes: null,
    published_at: "2024-01-01T00:00:00Z",
    new_until: def.badge === "Nouveau" ? "2099-01-01T00:00:00Z" : null,
    created_at: "2024-01-01T00:00:00Z",
    updated_at: "2024-01-01T00:00:00Z",
    wine_type: null,
    region: null,
    country: null,
    grape_varieties: null,
    rating: def.rating,
    review_count: def.reviewCount,
    is_best_seller: false,
    badge: def.badge,
    serving_temperature: null,
    aging_potential: null,
    vinification_method: null,
    subcategory: null,
    age_years: null,
    nose_notes: null,
    palate_notes: null,
    finish_notes: null,
    cask_type: null,
    edition: null,
    production_method: null,
    meat_type: null,
    is_available_for_platter: false,
    nutrition_info: null,
    expiration_info: null,
    fish_type: null,
    preparation_method: null,
    smoked: false,
    category: platterCategory,
    variants: def.variants.map((v, index) => ({
      id: `${def.id}-v${index + 1}`,
      product_id: def.id,
      sku: null,
      label: v.label,
      weight_g: null,
      volume_ml: null,
      abv: null,
      vintage: null,
      regular_price_agorot: v.priceAgorot,
      is_default: index === 0,
      limited_stock: false,
      availability_status: "IN_STOCK" as const,
      display_order: index,
      status: "published" as const,
      pricing_unit: "FROM" as const,
      packaging: null,
      created_at: "2024-01-01T00:00:00Z",
      updated_at: "2024-01-01T00:00:00Z",
    })),
    media: [
      {
        id: `${def.id}-m1`,
        product_id: def.id,
        variant_id: null,
        url: "/images/terminal-3/platters/charcuterie/platter-charcuterie-01.webp",
        alt: `${def.nameFr} Terminal 3`,
        kind: "COVER",
        display_order: 0,
        created_at: "2024-01-01T00:00:00Z",
      },
    ],
  }));
}

export const mockPlatters = buildMockPlatters();

export function mockGetPublishedProducts(categorySlug?: string): ProductWithMedia[] {
  const extraWines = mockExtraProducts.filter((p) => p.category_id === wineCategoryId);
  const extraFish = mockExtraProducts.filter((p) => p.category_id === salmonCategoryId);
  const extraCharcuterie = mockExtraProducts.filter((p) => p.category_id === charcuterieCategoryId);
  if (!categorySlug)
    return [...mockWines, ...mockExtraWines, ...extraWines, ...mockSpirits, ...mockExtraWhiskies, ...extraCharcuterie, ...mockCharcuterie, ...mockProducts, ...extraFish, ...mockPlatters, ...EXTRA_BOTTLES];
  if (categorySlug === "vin" || categorySlug === "vins") return [...mockWines, ...mockExtraWines, ...extraWines, ...EXTRA_BOTTLES.filter((p) => p.wine_type)];
  if (categorySlug === "spiritueux") return [...mockSpirits, ...mockExtraWhiskies, ...EXTRA_BOTTLES.filter((p) => p.subcategory && p.subcategory !== "VIN")];
  if (categorySlug === "charcuterie") return [...extraCharcuterie, ...mockCharcuterie];
  if (categorySlug === "saumon-fume" || categorySlug === "poissons") return [...mockProducts, ...extraFish];
  if (categorySlug === "plateaux-saumon" || categorySlug === "plateaux") return mockPlatters;
  return [];
}

/** All products flagged as a platter, across every category — used by /plateaux. */
export function mockGetPlatterProducts(): ProductWithMedia[] {
  return [...mockWines, ...mockSpirits, ...mockCharcuterie, ...mockProducts, ...mockPlatters].filter(
    (p) => p.product_type === "PLATTER",
  );
}

export function mockGetProductBySlug(slug: string): ProductWithMedia | null {
  return (
    mockWines.find((p) => p.slug === slug) ??
    mockExtraWines.find((p) => p.slug === slug) ??
    mockExtraProducts.find((p) => p.slug === slug) ??
    mockSpirits.find((p) => p.slug === slug) ??
    mockExtraWhiskies.find((p) => p.slug === slug) ??
    mockCharcuterie.find((p) => p.slug === slug) ??
    mockProducts.find((p) => p.slug === slug) ??
    mockPlatters.find((p) => p.slug === slug) ??
    null
  );
}

export function mockGetCategories(): CategoryRow[] {
  return mockCategories;
}

export function mockGetNewArrivals(): ProductWithMedia[] {
  return [...mockWines.slice(0, 2), ...mockSpirits.slice(0, 2), ...mockProducts.slice(0, 2)];
}
