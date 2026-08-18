#!/usr/bin/env node
/**
 * Insère des produits charcuterie, poissons et plateaux dans Supabase.
 */

import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
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

const supabase = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, { auth: { persistSession: false } });

const CATEGORIES = [
  { id: "10000000-0000-0000-0000-000000000003", slug: "charcuterie", nameHe: "נקניקים", nameFr: "Charcuterie" },
  { id: "10000000-0000-0000-0000-000000000004", slug: "poissons", nameHe: "דגים", nameFr: "Poissons fumés" },
  { id: "10000000-0000-0000-0000-000000000005", slug: "plateaux", nameHe: "מגשים", nameFr: "Plateaux" },
];

const CHARCUTERIE = [
  "Saucisson sec", "Rosette de Lyon", "Chorizo doux", "Chorizo fort", "Saucisse sèche",
  "Jambon de Parme", "Jambon Serrano", "Jambon fumé", "Jambon de dinde", "Filet mignon",
  "Terrine de campagne", "Rillettes", "Pâté en croûte", "Mousse de foie", "Boudin",
];

const SAUMON = [
  "Saumon fumé d'Écosse", "Saumon gravlax", "Saumon fumé norvégien", "Truite fumée", "Maquereau fumé",
  "Hareng fumé", "Sardine fumée", "Filet de saumon", "Roses de saumon", "Toast de saumon",
];

const PLATEAUX = [
  "Plateau mixte saumon & charcuterie", "Plateau saumon prestige", "Plateau charcuterie tradition",
  "Plateau végétarien", "Plateau réception 8 personnes", "Plateau réception 12 personnes",
];

const ADJS = ["tradition", "sélection", "artisanal", "fumé", "premium", "maison", "coup de cœur"];

function scanImages(subdir) {
  const dir = path.join(process.cwd(), "public", "images", "terminal-3", subdir);
  const out = [];
  if (!fs.existsSync(dir)) return out;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (entry.isDirectory()) {
      out.push(...scanImages(path.join(subdir, entry.name)));
    } else if (/\.(png|webp|jpg|jpeg)$/i.test(entry.name) && !entry.name.startsWith(".")) {
      out.push(`/images/terminal-3/${subdir}/${entry.name}`);
    }
  }
  return out;
}

function uuidFromIndex() {
  return crypto.randomUUID();
}

function slugify(name) {
  return name.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

function buildProducts(type, count, offset, images, category) {
  const products = [];
  const variants = [];
  const media = [];
  const now = new Date().toISOString();

  const names = type === "charcuterie" ? CHARCUTERIE : type === "poissons" ? SAUMON : PLATEAUX;

  for (let i = 0; i < count; i++) {
    const index = offset + i;
    const id = uuidFromIndex();
    const baseName = names[index % names.length];
    const adj = ADJS[index % ADJS.length];
    const nameFr = `${baseName} ${adj} ${i}`;
    const slug = `${slugify(baseName)}-${slugify(adj)}-${i}`;
    const price = type === "plateaux" ? 14900 + ((index % 50) * 500) : 2900 + ((index % 40) * 100);
    const weight = 100 + (index % 20) * 50;

    products.push({
      id, slug, category_id: category.id, product_type: "STANDARD", brand: "Terminal 3", brand_id: null,
      name_he: "", name_fr: nameFr, name_en: null,
      description_he: null, description_fr: `${nameFr} — sélection Terminal 3.`, description_en: null,
      origin: "France", tasting_notes: null, pairing_notes: null, how_to_serve: "Servir frais.",
      storage_info: "À conserver entre 0°C et 4°C.",
      kosher_status: "Casher Mehadrin", allergen_info: null, age_restricted: false, status: "published",
      is_featured: index % 10 === 0, availability_status: "IN_STOCK", base_price_agorot: price,
      compare_at_price_agorot: null, meta_title: null, meta_description: null,
      serves_min: 2, serves_max: 8, composition_text: null, advance_order_hours: 24, customizable: true,
      preparation_time_minutes: null, published_at: now, new_until: null, created_at: now, updated_at: now,
      wine_type: null, region: null, country: "France", grape_varieties: null,
      rating: 4.0 + ((index % 10) / 10), review_count: 5 + (index % 50), is_best_seller: index % 8 === 0,
      badge: index % 15 === 0 ? "Coup de cœur" : null, serving_temperature: null, aging_potential: null,
      vinification_method: null, subcategory: null, age_years: null, nose_notes: null, palate_notes: null,
      finish_notes: null, cask_type: null, edition: null, production_method: null,
      meat_type: type === "charcuterie" ? "PORC" : null, is_available_for_platter: type === "plateaux",
      nutrition_info: null, expiration_info: null, fish_type: type === "poissons" ? "SAUMON" : null,
      preparation_method: null, smoked: type === "poissons",
    });

    variants.push({
      id: crypto.randomUUID(),
      product_id: id, sku: null, label: `${weight}g`, weight_g: weight, volume_ml: null,
      abv: null, vintage: null, regular_price_agorot: price, is_default: true, limited_stock: false,
      availability_status: "IN_STOCK", display_order: 0, status: "published", pricing_unit: null,
      packaging: null, created_at: now, updated_at: now,
    });

    media.push({
      id: crypto.randomUUID(),
      product_id: id, variant_id: null, url: images[index % images.length],
      alt: `Bouteille de ${nameFr}`, kind: "COVER", display_order: 0, created_at: now,
    });
  }

  return { products, variants, media };
}

async function upsertBatch(table, rows) {
  const BATCH = 50;
  for (let i = 0; i < rows.length; i += BATCH) {
    const batch = rows.slice(i, i + BATCH);
    const { error } = await supabase.from(table).upsert(batch, { onConflict: table === "products" ? "slug" : "id" });
    if (error) { console.error(`❌ ${table} ${i} :`, error.message); process.exit(1); }
    console.log(`✅ ${table} : ${i + batch.length} / ${rows.length}`);
  }
}

async function main() {
  const charcuterieImages = scanImages("platters/charcuterie");
  const salmonImages = [...scanImages("fish/salmon"), ...scanImages("fish/salmon/source")];
  const mixedImages = [...scanImages("platters/mixed"), ...scanImages("salmon-plateaux"), ...scanImages("platters/charcuterie")];

  console.log(`Images charcuterie : ${charcuterieImages.length}`);
  console.log(`Images saumon : ${salmonImages.length}`);
  console.log(`Images mixtes : ${mixedImages.length}`);

  const counts = [
    { type: "charcuterie", count: 50, images: charcuterieImages },
    { type: "poissons", count: 50, images: salmonImages },
    { type: "plateaux", count: 25, images: mixedImages },
  ];

  let offset = 1000;
  for (const { type, count, images } of counts) {
    const category = CATEGORIES.find((c) => c.slug === type);
    const { products, variants, media } = buildProducts(type, count, offset, images, category);
    console.log(`\n⏳ Insertion ${type} : ${count} produits`);
    await upsertBatch("products", products);
    await upsertBatch("product_variants", variants);
    await upsertBatch("product_media", media);
    offset += count;
  }

  console.log("🎉 Produits alimentaires insérés.");
}

main();
