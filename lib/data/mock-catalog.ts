import type { CategoryRow } from "@/types/database";
import type { ProductWithMedia } from "@/lib/data/catalog";

/**
 * Development fallback catalog used when Supabase env vars are missing.
 * This lets the UI render for local preview without a live database.
 * It is NOT used in production.
 */

const salmonCategoryId = "10000000-0000-0000-0000-000000000005";

export const mockCategories: CategoryRow[] = [
  {
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
  },
  {
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
  },
];

const productDefs = [
  { id: "20000000-0000-0000-0000-000000000001", slug: "carpaccio-saumon-200g", name_he: "קרפצ׳ו סלמון 200 גרם", name_fr: "Carpaccio de saumon", price: 11990, weight: 200 },
  { id: "20000000-0000-0000-0000-000000000002", slug: "saumon-fume-classique-fin-200g", name_he: "סלמון מעושן קלאסי פרימיום פרוס דק 200 גרם", name_fr: "Saumon fumé classique premium, tranché fin", price: 10990, weight: 200 },
  { id: "20000000-0000-0000-0000-000000000003", slug: "saumon-fume-sans-sucre-fin-200g", name_he: "סלמון מעושן פרימיום ללא סוכר פרוס דק 200 גרם", name_fr: "Saumon fumé premium sans sucre, tranché fin", price: 10990, weight: 200 },
  { id: "20000000-0000-0000-0000-000000000004", slug: "sashimi-saumon-sans-sucre-200g", name_he: "סשימי סלמון מעושן ללא סוכר 200 גרם", name_fr: "Sashimi de saumon fumé sans sucre", price: 9990, weight: 200 },
  { id: "20000000-0000-0000-0000-000000000005", slug: "gravlax-200g", name_he: "גרבלקס / סלמון מרינט 200 גרם", name_fr: "Gravlax / saumon mariné", price: 8490, weight: 200 },
  { id: "20000000-0000-0000-0000-000000000006", slug: "piece-saumon-classique-200g", name_he: "חתיכת סלמון מעושן קלאסי 200 גרם", name_fr: "Pièce de saumon fumé classique", price: 7990, weight: 200 },
  { id: "20000000-0000-0000-0000-000000000007", slug: "piece-saumon-betterave-200g", name_he: "חתיכת סלמון מעושן בסלק 200 גרם", name_fr: "Pièce de saumon fumé à la betterave", price: 7990, weight: 200 },
  { id: "20000000-0000-0000-0000-000000000008", slug: "piece-gravlax-200g", name_he: "חתיכת גרבלקס 200 גרם", name_fr: "Pièce de gravlax", price: 7990, weight: 200 },
  { id: "20000000-0000-0000-0000-000000000009", slug: "saumon-fume-classique-fin-100g", name_he: "סלמון מעושן קלאסי פרימיום פרוס דק 100 גרם", name_fr: "Saumon fumé classique premium, tranché fin", price: 5690, weight: 100 },
  { id: "20000000-0000-0000-0000-000000000010", slug: "sashimi-saumon-classique-100g", name_he: "סשימי סלמון מעושן קלאסי 100 גרם", name_fr: "Sashimi de saumon fumé classique", price: 5490, weight: 100 },
  { id: "20000000-0000-0000-0000-000000000011", slug: "sashimi-saumon-sans-sucre-100g", name_he: "סשימי סלמון מעושן ללא סוכר 100 גרם", name_fr: "Sashimi de saumon fumé sans sucre", price: 5490, weight: 100 },
  { id: "20000000-0000-0000-0000-000000000012", slug: "sashimi-saumon-citron-poivre-100g", name_he: "סשימי סלמון מעושן לימון-פלפל 100 גרם", name_fr: "Sashimi de saumon fumé citron-poivre", price: 5490, weight: 100 },
  { id: "20000000-0000-0000-0000-000000000013", slug: "gravlax-100g", name_he: "גרבלקס / סלמון מרינט 100 גרם", name_fr: "Gravlax / saumon mariné", price: 5490, weight: 100 },
  { id: "20000000-0000-0000-0000-000000000014", slug: "sashimi-saumon-betterave-100g", name_he: "סשימי סלמון מעושן בסלק 100 גרם", name_fr: "Sashimi de saumon fumé à la betterave", price: 5490, weight: 100 },
  { id: "20000000-0000-0000-0000-000000000015", slug: "truite-fumee-filet", name_he: "פילה פורל מעושן", name_fr: "Filet de truite fumée", price: 4690, weight: 100 },
  { id: "20000000-0000-0000-0000-000000000016", slug: "thon-rouge-fume-classique-100g", name_he: "טונה אדומה מעושנת קלאסית 100 גרם", name_fr: "Thon rouge fumé classique", price: 3990, weight: 100 },
  { id: "20000000-0000-0000-0000-000000000017", slug: "thon-rouge-fume-chaud-100g", name_he: "טונה אדומה מעושנת חם 100 גרם", name_fr: "Thon rouge fumé à chaud", price: 3990, weight: 100 },
  { id: "20000000-0000-0000-0000-000000000018", slug: "duo-saumon-2x100g", name_he: "זוג חבילות סלמון 2×100 גרם", name_fr: "2 sachets de saumon x100g", price: 9990, weight: null, label: "2 x 100g" },
  { id: "20000000-0000-0000-0000-000000000019", slug: "trio-saumon-3x100g", name_he: "שלישיית חבילות סלמון 3×100 גרם", name_fr: "3 sachets de saumon x100g", price: 14990, weight: null, label: "3 x 100g" },
  { id: "20000000-0000-0000-0000-000000000020", slug: "duo-saumon-thon-100g", name_he: "סלמון 100 גרם + טונה 100 גרם", name_fr: "1 saumon 100g + 1 thon 100g", price: 8990, weight: null, label: "100g + 100g" },
];

function buildMockProducts(): ProductWithMedia[] {
  return productDefs.map((def, index) => {
    const imageNumber = String((index % 3) + 1).padStart(2, "0");
    return {
      id: def.id,
      slug: def.slug,
      category_id: salmonCategoryId,
      product_type: "STANDARD",
      brand: "Sarfati",
      name_he: def.name_he,
      name_fr: def.name_fr,
      name_en: null,
      description_he: null,
      description_fr: `Saumon premium de la sélection Terminal 3 — ${def.name_fr?.toLowerCase()}.`,
      description_en: null,
      origin: null,
      tasting_notes: null,
      pairing_notes: null,
      how_to_serve: null,
      storage_info: "0–4°C, à consommer sous 48h après ouverture",
      kosher_status: null,
      allergen_info: null,
      age_restricted: false,
      status: "published",
      is_featured: false,
      availability_status: "IN_STOCK",
      base_price_agorot: def.price,
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
      new_until: null,
      created_at: "2024-01-01T00:00:00Z",
      updated_at: "2024-01-01T00:00:00Z",
      category: mockCategories[0],
      variants: [
        {
          id: `${def.id}-v1`,
          product_id: def.id,
          sku: null,
          label: def.label ?? `${def.weight}g`,
          weight_g: def.weight,
          volume_ml: null,
          abv: null,
          vintage: null,
          regular_price_agorot: def.price,
          is_default: true,
          limited_stock: false,
          availability_status: "IN_STOCK",
          display_order: 0,
          status: "published",
          created_at: "2024-01-01T00:00:00Z",
          updated_at: "2024-01-01T00:00:00Z",
        },
      ],
      media: [
        {
          id: `${def.id}-m1`,
          product_id: def.id,
          variant_id: null,
          url: `/images/products/salmon/saumon-${imageNumber}.jpg`,
          alt: def.name_fr ?? "Saumon fumé Terminal 3",
          kind: "COVER",
          display_order: 0,
          created_at: "2024-01-01T00:00:00Z",
        },
      ],
    };
  });
}

export const mockProducts = buildMockProducts();

export function mockGetPublishedProducts(categorySlug?: string): ProductWithMedia[] {
  if (!categorySlug || categorySlug === "saumon-fume" || categorySlug === "plateaux-saumon") {
    return mockProducts;
  }
  return [];
}

export function mockGetProductBySlug(slug: string): ProductWithMedia | null {
  return mockProducts.find((p) => p.slug === slug) ?? null;
}

export function mockGetCategories(): CategoryRow[] {
  return mockCategories;
}

export function mockGetNewArrivals(): ProductWithMedia[] {
  return mockProducts.slice(0, 5);
}
