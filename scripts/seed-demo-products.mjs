#!/usr/bin/env node
/**
 * Insère les produits générés en base de données Supabase.
 *
 * Utilise SUPABASE_SERVICE_ROLE_KEY depuis .env.
 * Ne fonctionne que si Supabase est accessible et les tables existent.
 *
 * Commande :
 *   cd /Users/shayacoca/TERMINAL3/terminal3
 *   node scripts/seed-demo-products.mjs
 */

import "dotenv/config";
import { createClient } from "@supabase/supabase-js";
import { generateBottles } from "../lib/data/mock-bottle-generator.ts";

const URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!URL || !KEY) {
  console.error("❌ NEXT_PUBLIC_SUPABASE_URL ou SUPABASE_SERVICE_ROLE_KEY manquant");
  process.exit(1);
}

const supabase = createClient(URL, KEY, { auth: { persistSession: false } });

function scanBottleImages() {
  const fs = await import("node:fs");
  const path = await import("node:path");
  const base = path.join(process.cwd(), "public", "images", "terminal-3");
  const types = ["arak", "cognac", "gin", "liqueurs", "other", "rum", "tequila", "vodka", "whisky"];
  const wineDirs = ["castel", "carmel", "gamla", "golan", "yarden", "other-brands"];
  const out = [];
  try {
    for (const t of types) {
      const dir = path.join(base, "spirits", t);
      if (!fs.existsSync(dir)) continue;
      for (const n of fs.readdirSync(dir)) {
        if (/\.(png|webp|jpg|jpeg)$/i.test(n) && !n.startsWith(".")) out.push(`/images/terminal-3/spirits/${t}/${n}`);
      }
    }
    for (const w of wineDirs) {
      const dir = path.join(base, "wines", w);
      if (!fs.existsSync(dir)) continue;
      for (const n of fs.readdirSync(dir)) {
        if (/\.(png|webp|jpg|jpeg)$/i.test(n) && !n.startsWith(".")) out.push(`/images/terminal-3/wines/${w}/${n}`);
      }
    }
  } catch {}
  return out;
}

async function main() {
  // Vérification de la table products
  const { error: tableError } = await supabase.from("products").select("id").limit(1);
  if (tableError) {
    console.error("❌ Impossible d'accéder à la table products :", tableError.message);
    console.log("Vérifie que les migrations 0028–0031 sont appliquées.");
    process.exit(1);
  }

  const images = scanBottleImages();
  const products = generateBottles(images, 400, 0);

  console.log(`⏳ Préparation de ${products.length} produits…`);

  // On insère en batch de 50 pour éviter les timeouts
  const BATCH = 50;
  for (let i = 0; i < products.length; i += BATCH) {
    const batch = products.slice(i, i + BATCH);

    const productRows = batch.map((p) => ({
      id: p.id,
      slug: p.slug,
      category_id: p.category_id,
      product_type: p.product_type,
      brand: p.brand,
      brand_id: p.brand_id,
      name_he: p.name_he,
      name_fr: p.name_fr,
      name_en: p.name_en,
      description_he: p.description_he,
      description_fr: p.description_fr,
      description_en: p.description_en,
      origin: p.origin,
      tasting_notes: p.tasting_notes,
      pairing_notes: p.pairing_notes,
      how_to_serve: p.how_to_serve,
      storage_info: p.storage_info,
      kosher_status: p.kosher_status,
      allergen_info: p.allergen_info,
      age_restricted: p.age_restricted,
      status: p.status,
      is_featured: p.is_featured,
      availability_status: p.availability_status,
      base_price_agorot: p.base_price_agorot,
      compare_at_price_agorot: p.compare_at_price_agorot,
      meta_title: p.meta_title,
      meta_description: p.meta_description,
      serves_min: p.serves_min,
      serves_max: p.serves_max,
      composition_text: p.composition_text,
      advance_order_hours: p.advance_order_hours,
      customizable: p.customizable,
      preparation_time_minutes: p.preparation_time_minutes,
      published_at: p.published_at,
      new_until: p.new_until,
      wine_type: p.wine_type,
      region: p.region,
      country: p.country,
      grape_varieties: p.grape_varieties,
      rating: p.rating,
      review_count: p.review_count,
      is_best_seller: p.is_best_seller,
      badge: p.badge,
      serving_temperature: p.serving_temperature,
      aging_potential: p.aging_potential,
      vinification_method: p.vinification_method,
      subcategory: p.subcategory,
      age_years: p.age_years,
      nose_notes: p.nose_notes,
      palate_notes: p.palate_notes,
      finish_notes: p.finish_notes,
      cask_type: p.cask_type,
      edition: p.edition,
      production_method: p.production_method,
      meat_type: p.meat_type,
      is_available_for_platter: p.is_available_for_platter,
      nutrition_info: p.nutrition_info,
      expiration_info: p.expiration_info,
      fish_type: p.fish_type,
      preparation_method: p.preparation_method,
      smoked: p.smoked,
    }));

    const variantRows = batch.flatMap((p) =>
      p.variants.map((v) => ({
        id: v.id,
        product_id: v.product_id,
        sku: v.sku,
        label: v.label,
        weight_g: v.weight_g,
        volume_ml: v.volume_ml,
        abv: v.abv,
        vintage: v.vintage,
        regular_price_agorot: v.regular_price_agorot,
        is_default: v.is_default,
        limited_stock: v.limited_stock,
        availability_status: v.availability_status,
        display_order: v.display_order,
        status: v.status,
        pricing_unit: v.pricing_unit,
        packaging: v.packaging,
      })),
    );

    const mediaRows = batch.flatMap((p) =>
      p.media.map((m) => ({
        id: m.id,
        product_id: m.product_id,
        variant_id: m.variant_id,
        url: m.url,
        alt: m.alt,
        kind: m.kind,
        display_order: m.display_order,
      })),
    );

    const { error: pError } = await supabase.from("products").upsert(productRows, { onConflict: "slug" });
    if (pError) {
      console.error(`❌ Erreur insertion produits ${i}–${i + batch.length} :`, pError.message);
      process.exit(1);
    }

    if (variantRows.length) {
      const { error: vError } = await supabase.from("product_variants").upsert(variantRows, { onConflict: "id" });
      if (vError) {
        console.error(`❌ Erreur variants ${i}–${i + batch.length} :`, vError.message);
        process.exit(1);
      }
    }

    if (mediaRows.length) {
      const { error: mError } = await supabase.from("product_media").upsert(mediaRows, { onConflict: "id" });
      if (mError) {
        console.error(`❌ Erreur media ${i}–${i + batch.length} :`, mError.message);
        process.exit(1);
      }
    }

    console.log(`✅ Inséré ${i + batch.length} / ${products.length}`);
  }

  console.log("🎉 Import terminé.");
}

main();
