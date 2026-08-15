#!/usr/bin/env node
/**
 * Supprime et régénère tous les product_media pour matcher les images existantes.
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

const supabase = createClient(URL, KEY, { auth: { persistSession: false } });

const SPIRIT_TYPES = ["arak", "cognac", "gin", "liqueurs", "other", "rum", "tequila", "vodka", "whisky"];
const WINE_DIRS = ["castel", "carmel", "gamla", "golan", "yarden", "other-brands"];

function scanBottleImages() {
  const base = path.join(process.cwd(), "public", "images", "terminal-3");
  const out = [];
  for (const t of SPIRIT_TYPES) {
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

function productIndexFromId(id) {
  // id like 70000000-0000-0000-0000-0000700001e6
  const parts = id.split("-");
  const low = parts[parts.length - 1];
  return parseInt(low, 16);
}

async function main() {
  const availableImages = scanBottleImages();
  console.log(`Images trouvées : ${availableImages.length}`);

  // Supprime tous les media existants
  const { error: delError } = await supabase.from("product_media").delete().not("id", "is", null);
  if (delError) {
    console.error("❌ Erreur suppression media :", delError.message);
    process.exit(1);
  }
  console.log("✅ Anciens media supprimés");

  // Récupère tous les produits
  const { data: products, error: prodError } = await supabase.from("products").select("id");
  if (prodError || !products) {
    console.error("❌ Erreur lecture produits :", prodError?.message);
    process.exit(1);
  }
  console.log(`Produits à traiter : ${products.length}`);

  const mediaRows = products.map((p, i) => ({
    id: `7b000000-0000-0000-0000-${i.toString(16).padStart(12, "0").slice(-12)}`,
    product_id: p.id,
    variant_id: null,
    url: availableImages[productIndexFromId(p.id) % availableImages.length] || availableImages[i % availableImages.length],
    alt: `Bouteille de produit ${i}`,
    kind: "COVER",
    display_order: 0,
    created_at: new Date().toISOString(),
  }));

  const BATCH = 100;
  for (let i = 0; i < mediaRows.length; i += BATCH) {
    const batch = mediaRows.slice(i, i + BATCH);
    const { error } = await supabase.from("product_media").upsert(batch, { onConflict: "id" });
    if (error) {
      console.error(`❌ Erreur media ${i} :`, error.message);
      process.exit(1);
    }
    console.log(`✅ media : ${i + batch.length} / ${mediaRows.length}`);
  }

  console.log("🎉 Media recréés.");
}

main();
