#!/usr/bin/env node
/**
 * Insère les produits générés directement dans Supabase.
 *
 * Utilise SUPABASE_SERVICE_ROLE_KEY depuis .env.
 * Commande : node scripts/seed-to-supabase.mjs [extra-count]
 */

import fs from "node:fs";
import path from "node:path";
import { createClient } from "@supabase/supabase-js";

const env = Object.fromEntries(
  fs
    .readFileSync(path.join(process.cwd(), ".env"), "utf-8")
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean)
    .filter((l) => !l.startsWith("#"))
    .map((l) => {
      const [k, ...v] = l.split("=");
      return [k, v.join("=")];
    }),
);

const URL = env.NEXT_PUBLIC_SUPABASE_URL;
const KEY = env.SUPABASE_SERVICE_ROLE_KEY;

if (!URL || !KEY) {
  console.error("❌ NEXT_PUBLIC_SUPABASE_URL ou SUPABASE_SERVICE_ROLE_KEY manquant");
  process.exit(1);
}

const supabase = createClient(URL, KEY, { auth: { persistSession: false } });

let CATEGORIES = [
  { slug: "vins", id: "10000000-0000-0000-0000-000000000001", nameHe: "יין", nameFr: "Vins" },
  { slug: "spiritueux", id: "10000000-0000-0000-0000-000000000002", nameHe: "משקאות חריפים", nameFr: "Spiritueux" },
];

async function loadCategories() {
  const { data, error } = await supabase.from("categories").select("id, slug, name_he, name_fr").eq("is_active", true);
  if (error) {
    console.warn("⚠️ Impossible de lire categories :", error.message);
    return;
  }
  CATEGORIES = (data || []).map((c) => ({ slug: c.slug ?? "", id: c.id, nameHe: c.name_he ?? "", nameFr: c.name_fr ?? "" }));
}

const WINE_DOMAINS = ["Domaine du Castel", "Yarden", "Golan Heights", "Carmel", "Barkan", "Tabor", "Galil Mountain", "Flam", "Psagot", "Shiloh", "Binyamina", "Teperberg", "Recanati", "Margalit", "Vitkin"];
const WINE_NAMES = ["Petit Castel", "Grand Vin", "Cabernet Sauvignon", "Merlot", "Shiraz", "Pinot Noir", "Syrah", "Malbec", "Petit Verdot", "Rouge de Galilée", "Chardonnay", "Sauvignon Blanc", "Rosé", "Gewurztraminer", "White Riesling", "Viognier", "Marselan", "Carignan"];

const SPIRIT_BRANDS = ["Chivas Regal", "Glenfiddich", "Glenlivet", "Johnnie Walker", "Jack Daniel's", "Jameson", "Hennessy", "Remy Martin", "Courvoisier", "Havana Club", "Bacardi", "Mount Gay", "Don Julio", "Patrón", "Jose Cuervo", "Grey Goose", "Belvedere", "Absolut", "Bombay Sapphire", "Tanqueray", "Hendrick's", "Macallan", "Talisker", "Lagavulin", "Laphroaig", "Ardbeg", "Yamazaki", "Hibiki", "Nikka", "Crown Royal", "Canadian Club", "Ballantine's", "Famous Grouse", "Teacher's", "Dewar's", "Bushmills", "Tullamore Dew", "Ararat", "Khvanchkara", "Ketel One", "Cîroc", "Beluga", "Stolichnaya", "Smirnoff", "Baileys", "Kahlúa", "Amarula", "Cointreau", "Grand Marnier", "Campari", "Aperol", "Ricard", "Pernod", "Ouzo", "Arak Elite", "Askalon", "Tubi 60", "Jägermeister"];
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

const SPIRIT_TYPES_ARR = ["arak", "cognac", "gin", "liqueurs", "other", "rum", "tequila", "vodka", "whisky"];
const WINE_DIRS = ["castel", "carmel", "gamla", "golan", "yarden", "other-brands"];

function scanBottleImages() {
  const base = path.join(process.cwd(), "public", "images", "terminal-3");
  const out = [];
  for (const t of SPIRIT_TYPES_ARR) {
    const dir = path.join(base, "spirits", t);
    if (!fs.existsSync(dir)) continue;
    for (const n of fs.readdirSync(dir)) {
      if (/\.(png|webp|jpg|jpeg)$/i.test(n) && !n.startsWith(".")) out.push(`/images/terminal-3/spirits/${t}/${n}`);
    }
  }
  for (const w of WINE_DIRS) {
    const dir = path.join(base, "wines", w);
    if (!fs.existsSync(dir)) continue;
    for (const n of fs.readdirSync(dir)) {
      if (/\.(png|webp|jpg|jpeg)$/i.test(n) && !n.startsWith(".")) out.push(`/images/terminal-3/wines/${w}/${n}`);
    }
  }
  return out;
}

function slugify(name) {
  return name.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

function uuidFromIndex(index) {
  const hex = (index + 0x70000000).toString(16).padStart(8, "0");
  return `7${hex.slice(1, 4)}0000-0000-0000-0000-${hex.padStart(12, "0")}`;
}

function buildProducts(count) {
  const availableImages = scanBottleImages();
  const products = [];
  const variants = [];
  const media = [];
  const wineCategory = CATEGORIES.find((c) => c.slug === "vins") ?? CATEGORIES[0];
  const spiritCategory = CATEGORIES.find((c) => c.slug === "spiritueux") ?? CATEGORIES[1];

  for (let i = 0; i < count; i++) {
    const isWine = i % 3 === 0;
    const category = isWine ? wineCategory : spiritCategory;
    const index = i;
    const id = uuidFromIndex(index);

    let nameFr, brand, subcategory = null, ageYears = null, abv, volumeMl = 700, priceAgorot;
    if (isWine) {
      brand = WINE_DOMAINS[index % WINE_DOMAINS.length];
      nameFr = `${WINE_NAMES[index % WINE_NAMES.length]} ${(i % 20) + 2018}`;
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
      volumeMl = (subcategory === "ARAK" && index % 2 === 0) ? 1000 : 700;
      priceAgorot = 8900 + ((index % 150) * 100);
    }

    const slug = `${slugify(brand)}-${slugify(nameFr)}-${index}`;
    const imageUrl = availableImages[i % availableImages.length];
    const now = new Date().toISOString();
    const publishedAt = new Date(Date.now() - (index % 60) * 86400000).toISOString();

    products.push({
      id, slug, category_id: category.id, product_type: "STANDARD", brand, brand_id: null,
      name_he: "", name_fr: nameFr, name_en: null,
      description_he: null, description_fr: `${nameFr} — une sélection rigoureuse de Terminal 3.`, description_en: null,
      origin: isWine ? (index % 2 === 0 ? "Israël" : "France") : (index % 2 === 0 ? "Écosse" : "France"),
      tasting_notes: null, pairing_notes: null, how_to_serve: "Servir à température adaptée.",
      storage_info: "À conserver à l'abri de la lumière et de la chaleur.",
      kosher_status: isWine ? (index % 2 === 0 ? "Casher Mehadrin" : "Casher") : (index % 2 === 0 ? "Casher" : null),
      allergen_info: null, age_restricted: !isWine, status: "published", is_featured: index % 12 === 0,
      availability_status: "IN_STOCK", base_price_agorot: priceAgorot, compare_at_price_agorot: index % 7 === 0 ? priceAgorot + 1000 : null,
      meta_title: null, meta_description: null, serves_min: null, serves_max: null,
      composition_text: null, advance_order_hours: 0, customizable: false, preparation_time_minutes: null,
      published_at: publishedAt, new_until: index % 20 === 0 ? new Date(Date.now() + 30 * 86400000).toISOString() : null,
      created_at: now, updated_at: now,
      wine_type: isWine ? (index % 3 === 0 ? "ROUGE" : index % 3 === 1 ? "BLANC" : "ROSE") : null,
      region: isWine ? (index % 2 === 0 ? "Jérusalem" : "Galilée") : null,
      country: isWine ? (index % 2 === 0 ? "Israël" : "France") : (index % 2 === 0 ? "Écosse" : "France"),
      grape_varieties: isWine ? ["Cépages sélectionnés"] : null,
      rating: 4.0 + ((index % 10) / 10), review_count: 10 + (index % 200), is_best_seller: index % 8 === 0,
      badge: index % 15 === 0 ? "Coup de cœur" : null, serving_temperature: null, aging_potential: null, vinification_method: null,
      subcategory, age_years: ageYears, nose_notes: null, palate_notes: null, finish_notes: null,
      cask_type: null, edition: null, production_method: null, meat_type: null, is_available_for_platter: false,
      nutrition_info: null, expiration_info: null, fish_type: null, preparation_method: null, smoked: false,
    });

    variants.push({
      id: `7${(i + 0xa0000000).toString(16).padStart(7, "0").slice(-7)}-0000-0000-0000-${(i).toString(16).padStart(12, "0").slice(-12)}`,
      product_id: id, sku: null, label: `${volumeMl}ml`, weight_g: null,
      volume_ml: volumeMl, abv, vintage: null, regular_price_agorot: priceAgorot, is_default: true,
      limited_stock: false, availability_status: "IN_STOCK", display_order: 0, status: "published",
      pricing_unit: null, packaging: null, created_at: now, updated_at: now,
    });

    media.push({
      id: `7${(i + 0xb0000000).toString(16).padStart(7, "0").slice(-7)}-0000-0000-0000-${(i).toString(16).padStart(12, "0").slice(-12)}`,
      product_id: id, variant_id: null, url: imageUrl, alt: `Bouteille de ${nameFr}`,
      kind: "COVER", display_order: 0, created_at: now,
    });
  }

  return { products, variants, media };
}

async function upsertBatch(table, rows, onConflict) {
  const BATCH = 50;
  for (let i = 0; i < rows.length; i += BATCH) {
    const batch = rows.slice(i, i + BATCH);
    const { error } = await supabase.from(table).upsert(batch, { onConflict });
    if (error) {
      console.error(`❌ Erreur ${table} ${i}–${i + batch.length} :`, error.message);
      process.exit(1);
    }
    console.log(`✅ ${table} : ${i + batch.length} / ${rows.length}`);
  }
}

async function main() {
  const extra = Number(process.argv[2]) || 0;
  const imageCount = scanBottleImages().length;
  const count = imageCount + extra;

  const { error: tableError } = await supabase.from("products").select("id").limit(1);
  if (tableError) {
    console.error("❌ Impossible d'accéder à la table products :", tableError.message);
    console.log("Vérifie que les migrations 0028–0031 sont appliquées.");
    process.exit(1);
  }

  await loadCategories();
  if (!CATEGORIES.find((c) => c.slug === "vins") || !CATEGORIES.find((c) => c.slug === "spiritueux")) {
    console.log("⚠️ Catégories manquantes. Création des catégories de base…");
    const baseCats = [
      { id: "10000000-0000-0000-0000-000000000001", slug: "vins", name_he: "יין", name_fr: "Vins", description: "Vins casher et sélections israéliennes", is_active: true, display_order: 0, parent_id: null },
      { id: "10000000-0000-0000-0000-000000000002", slug: "spiritueux", name_he: "משקאות חריפים", name_fr: "Spiritueux", description: "Whisky, vodka, gin, cognac et arak", is_active: true, display_order: 1, parent_id: null },
      { id: "10000000-0000-0000-0000-000000000003", slug: "charcuterie", name_he: "נקניקים", name_fr: "Charcuterie", description: "Charcuteries fines casher", is_active: true, display_order: 2, parent_id: null },
      { id: "10000000-0000-0000-0000-000000000004", slug: "poissons", name_he: "דגים", name_fr: "Poissons fumés", description: "Saumon et poissons fumés casher", is_active: true, display_order: 3, parent_id: null },
      { id: "10000000-0000-0000-0000-000000000005", slug: "plateaux", name_he: "מגשים", name_fr: "Plateaux", description: "Plateaux de saumon et charcuterie", is_active: true, display_order: 4, parent_id: null },
    ];
    const { error } = await supabase.from("categories").upsert(baseCats, { onConflict: "id" });
    if (error) {
      console.error("❌ Erreur création catégories :", error.message);
      process.exit(1);
    }
    await loadCategories();
  }

  console.log(`⏳ Génération de ${count} produits (${imageCount} images + ${extra} extra)…`);
  const { products, variants, media } = buildProducts(count);

  await upsertBatch("products", products, "slug");
  await upsertBatch("product_variants", variants, "id");
  await upsertBatch("product_media", media, "id");

  console.log("🎉 Import terminé.");
  console.log(`Pense à passer NEXT_PUBLIC_DEMO_MODE=false pour lire la vraie base.`);
}

main();
