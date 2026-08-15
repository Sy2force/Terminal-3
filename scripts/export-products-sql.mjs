#!/usr/bin/env node
/**
 * Exporte les 400 produits générés dans un fichier SQL prêt à être exécuté
 * dans l'éditeur SQL de Supabase ou en ligne de commande psql.
 *
 * Utilise les images présentes dans public/images/terminal-3.
 */

import fs from "node:fs";
import path from "node:path";

const CATEGORIES = [
  { slug: "vins", id: "10000000-0000-0000-0000-000000000001", nameHe: "יין", nameFr: "Vins", type: "WINE" },
  { slug: "spiritueux", id: "10000000-0000-0000-0000-000000000002", nameHe: "משקאות חריפים", nameFr: "Spiritueux", type: "STANDARD" },
];

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

function escapeSql(value) {
  if (value === null || value === undefined) return "NULL";
  if (typeof value === "boolean") return value ? "true" : "false";
  if (typeof value === "number") return String(value);
  if (Array.isArray(value)) return `'${value.map((v) => String(v).replace(/'/g, "''")).join(",")}'`;
  return `'${String(value).replace(/'/g, "''")}'`;
}

const availableImages = scanBottleImages();
const EXTRA_COUNT = Number(process.argv[2]) || 0;
const PRODUCT_COUNT = availableImages.length + EXTRA_COUNT;
let imageCursor = 0;
const products = [];
const variants = [];
const media = [];

for (let i = 0; i < PRODUCT_COUNT; i++) {
  const isWine = i % 3 === 0;
  const category = CATEGORIES[isWine ? 0 : 1];
  const index = i;
  const id = uuidFromIndex(index);

  let nameFr, brand, subcategory, ageYears = null, abv, volumeMl = 700, priceAgorot;
  if (isWine) {
    brand = WINE_DOMAINS[index % WINE_DOMAINS.length];
    nameFr = `${WINE_NAMES[index % WINE_NAMES.length]} ${(i % 20) + 2018}`;
    subcategory = null;
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
  const imageUrl = availableImages[imageCursor % availableImages.length];
  imageCursor++;

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
    id: `${id}-v1`, product_id: id, sku: null, label: `${volumeMl}ml`, weight_g: null,
    volume_ml: volumeMl, abv, vintage: null, regular_price_agorot: priceAgorot, is_default: true,
    limited_stock: false, availability_status: "IN_STOCK", display_order: 0, status: "published",
    pricing_unit: null, packaging: null, created_at: now, updated_at: now,
  });

  media.push({
    id: `${id}-m1`, product_id: id, variant_id: null, url: imageUrl, alt: `Bouteille de ${nameFr}`,
    kind: "COVER", display_order: 0, created_at: now, updated_at: now,
  });
}

const outPath = path.join(process.cwd(), "scripts", "seed-400-products.sql");

const productCols = Object.keys(products[0]).join(", ");
const productVals = products.map((p) => `(${Object.values(p).map(escapeSql).join(", ")})`);

const variantCols = Object.keys(variants[0]).join(", ");
const variantVals = variants.map((v) => `(${Object.values(v).map(escapeSql).join(", ")})`);

const mediaCols = Object.keys(media[0]).join(", ");
const mediaVals = media.map((m) => `(${Object.values(m).map(escapeSql).join(", ")})`);

const sql = `-- Généré le ${new Date().toISOString()}
-- 400 produits bouteilles Terminal 3
BEGIN;

INSERT INTO products (${productCols}) VALUES\n${productVals.join(",\n")}\nON CONFLICT (slug) DO NOTHING;

INSERT INTO product_variants (${variantCols}) VALUES\n${variantVals.join(",\n")}\nON CONFLICT (id) DO NOTHING;

INSERT INTO product_media (${mediaCols}) VALUES\n${mediaVals.join(",\n")}\nON CONFLICT (id) DO NOTHING;

COMMIT;
`;

fs.writeFileSync(outPath, sql);
console.log(`✅ Fichier SQL généré : ${outPath}`);
console.log(`À exécuter dans Supabase SQL Editor ou via psql.`);
