import type { ProductWithMedia } from "@/lib/data/catalog";

const CATEGORIES = [
  { slug: "vins", id: "10000000-0000-0000-0000-000000000001", nameHe: "יין", nameFr: "Vins", type: "WINE" },
  { slug: "spiritueux", id: "10000000-0000-0000-0000-000000000002", nameHe: "משקאות חריפים", nameFr: "Spiritueux", type: "STANDARD" },
];

const WINE_DOMAINS = [
  "Domaine du Castel", "Yarden", "Golan Heights", "Carmel", "Barkan", "Tabor", "Galil Mountain",
  "Flam", "Psagot", "Shiloh", "Binyamina", "Teperberg", "Recanati", "Margalit", "Vitkin",
];

const WINE_NAMES = [
  "Petit Castel", "Grand Vin", "Cabernet Sauvignon", "Merlot", "Shiraz", "Pinot Noir",
  "Syrah", "Malbec", "Petit Verdot", "Rouge de Galilée", "Chardonnay", "Sauvignon Blanc",
  "Rosé", "Gewurztraminer", "White Riesling", "Viognier", "Marselan", "Carignan",
];

const SPIRIT_BRANDS = [
  "Chivas Regal", "Glenfiddich", "Glenlivet", "Johnnie Walker", "Jack Daniel's", "Jameson",
  "Hennessy", "Remy Martin", "Courvoisier", "Havana Club", "Bacardi", "Mount Gay",
  "Don Julio", "Patrón", "Jose Cuervo", "Grey Goose", "Belvedere", "Absolut",
  "Bombay Sapphire", "Tanqueray", "Hendrick's", "Macallan", "Talisker", "Lagavulin",
  "Laphroaig", "Ardbeg", "Yamazaki", "Hibiki", "Nikka", "Crown Royal", "Canadian Club",
  "Ballantine's", "Famous Grouse", "Teacher's", "Dewar's", "Bushmills", "Tullamore Dew",
  "Ararat", "Khvanchkara", "Ketel One", "Cîroc", "Beluga", "Stolichnaya", "Smirnoff",
  "Baileys", "Kahlúa", "Amarula", "Cointreau", "Grand Marnier", "Campari", "Aperol",
  "Ricard", "Pernod", "Ouzo", "Arak Elite", "Askalon", "Tubi 60", "Jägermeister",
];

const SPIRIT_TYPES = [
  { subcategory: "WHISKY", suffixes: ["12 ans", "15 ans", "18 ans", "Reserve", "Double Wood", "Distiller's Edition", ""] },
  { subcategory: "COGNAC", suffixes: ["V.S", "V.S.O.P", "X.O", "Napoléon", "Réserve", ""] },
  { subcategory: "RHUM", suffixes: ["7 ans", "12 ans", "15 ans", "Blanc", "Épice", "Black", ""] },
  { subcategory: "TEQUILA", suffixes: ["Blanco", "Reposado", "Añejo", "Extra Añejo", ""] },
  { subcategory: "VODKA", suffixes: ["Original", "Citrus", "Vanilla", "Berry", ""] },
  { subcategory: "GIN", suffixes: ["London Dry", "Navy Strength", "Floral", "Mediterranean", ""] },
  { subcategory: "LIQUEUR", suffixes: ["Original", "Cream", "Orange", "Coffee", ""] },
  { subcategory: "ARAK", suffixes: ["Elite", "Classic", "Gold", "Anisé", ""] },
];

function slugify(name: string): string {
  return name
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

function uuidFromIndex(index: number): string {
  const hex = (index + 0x70000000).toString(16).padStart(8, "0");
  return `7${hex.slice(1, 4)}0000-0000-0000-0000-${hex.padStart(12, "0")}`;
}

export function generateBottles(
  availableImages: string[],
  count: number,
  offset: number,
): ProductWithMedia[] {
  const out: ProductWithMedia[] = [];
  let imageCursor = 0;

  for (let i = 0; i < count; i++) {
    const isWine = i % 3 === 0;
    const category = CATEGORIES[isWine ? 0 : 1];
    const index = offset + i;
    const id = uuidFromIndex(index);

    let nameFr: string;
    let brand: string;
    let subcategory: string;
    let ageYears: number | null = null;
    let abv: number;
    let volumeMl = 700;
    let priceAgorot: number;

    if (isWine) {
      brand = WINE_DOMAINS[index % WINE_DOMAINS.length];
      nameFr = `${WINE_NAMES[index % WINE_NAMES.length]} ${(i % 20) + 2018}`;
      subcategory = "VIN";
      ageYears = null;
      abv = 12 + (index % 4);
      volumeMl = 750;
      priceAgorot = 7900 + ((index % 60) * 100);
    } else {
      const type = SPIRIT_TYPES[index % SPIRIT_TYPES.length];
      brand = SPIRIT_BRANDS[index % SPIRIT_BRANDS.length];
      const suffix = type.suffixes[index % type.suffixes.length];
      nameFr = `${brand}${suffix ? ` ${suffix}` : ""}`;
      subcategory = type.subcategory;
      if (["WHISKY", "COGNAC", "RHUM", "TEQUILA"].includes(subcategory) && suffix.includes("ans")) {
        const match = suffix.match(/(\d+)/);
        ageYears = match ? Number(match[1]) : null;
      }
      abv = 37 + (index % 18);
      volumeMl = subcategory === "ARAK" && index % 2 === 0 ? 1000 : 700;
      priceAgorot = 8900 + ((index % 150) * 100);
    }

    const slug = `${slugify(brand)}-${slugify(nameFr)}-${index}`;
    const imageUrl = availableImages[imageCursor % availableImages.length];
    imageCursor++;

    out.push({
      id,
      slug,
      category_id: category.id,
      product_type: "STANDARD",
      brand,
      brand_id: null,
      name_he: "",
      name_fr: nameFr,
      name_en: null,
      description_he: null,
      description_fr: `${nameFr} — une sélection rigoureuse de Terminal 3.`,
      description_en: null,
      origin: isWine ? (index % 2 === 0 ? "Israël" : "France") : (index % 2 === 0 ? "Écosse" : "France"),
      tasting_notes: null,
      pairing_notes: null,
      how_to_serve: "Servir à température adaptée.",
      storage_info: "À conserver à l'abri de la lumière et de la chaleur.",
      kosher_status: isWine ? (index % 2 === 0 ? "Casher Mehadrin" : "Casher") : (index % 2 === 0 ? "Casher" : null),
      allergen_info: null,
      age_restricted: !isWine,
      status: "published",
      is_featured: index % 12 === 0,
      availability_status: "IN_STOCK",
      base_price_agorot: priceAgorot,
      compare_at_price_agorot: index % 7 === 0 ? priceAgorot + 1000 : null,
      meta_title: null,
      meta_description: null,
      serves_min: null,
      serves_max: null,
      composition_text: null,
      advance_order_hours: 0,
      customizable: false,
      preparation_time_minutes: null,
      published_at: new Date(Date.now() - (index % 60) * 86400000).toISOString(),
      new_until: index % 20 === 0 ? new Date(Date.now() + 30 * 86400000).toISOString() : null,
      created_at: "2024-01-01T00:00:00Z",
      updated_at: "2024-01-01T00:00:00Z",
      wine_type: isWine ? (index % 3 === 0 ? "ROUGE" : index % 3 === 1 ? "BLANC" : "ROSE") : null,
      region: isWine ? (index % 2 === 0 ? "Jérusalem" : "Galilée") : null,
      country: isWine ? (index % 2 === 0 ? "Israël" : "France") : (index % 2 === 0 ? "Écosse" : "France"),
      grape_varieties: isWine ? ["Cépages sélectionnés"] : null,
      rating: 4.0 + ((index % 10) / 10),
      review_count: 10 + (index % 200),
      is_best_seller: index % 8 === 0,
      badge: index % 15 === 0 ? "Coup de cœur" : null,
      serving_temperature: null,
      aging_potential: null,
      vinification_method: null,
      subcategory: isWine ? "VIN" : subcategory,
      age_years: ageYears,
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
      category: {
        id: category.id,
        slug: category.slug,
        name_he: category.nameHe,
        name_fr: category.nameFr,
        description: null,
        cover_url: null,
        focal_point: null,
        crop_mode: null,
        is_active: true,
        display_order: 0,
        parent_id: null,
        created_at: "2024-01-01T00:00:00Z",
        updated_at: "2024-01-01T00:00:00Z",
      } as any,
      variants: [
        {
          id: `${id}-v1`,
          product_id: id,
          sku: null,
          label: `${volumeMl}ml`,
          weight_g: null,
          volume_ml: volumeMl,
          abv,
          vintage: null,
          regular_price_agorot: priceAgorot,
          is_default: true,
          limited_stock: false,
          availability_status: "IN_STOCK",
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
          id: `${id}-m1`,
          product_id: id,
          variant_id: null,
          url: imageUrl,
          alt: `Bouteille de ${nameFr}`,
          kind: "COVER",
          display_order: 0,
          created_at: "2024-01-01T00:00:00Z",
        },
      ],
    });
  }

  return out;
}
