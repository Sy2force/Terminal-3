#!/usr/bin/env node
/**
 * Crée des promotions sur vins, spiritueux et aliments.
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

const now = new Date();
const start = new Date(now);
start.setDate(start.getDate() - 2);
const end = new Date(now);
end.setDate(end.getDate() + 14);

const promoTitles = [
  { cat: "vins", title: "-15% sur une sélection de vins israéliens" },
  { cat: "vins", title: "Petit Castel en promotion" },
  { cat: "spiritueux", title: "Whisky single malt -20%" },
  { cat: "spiritueux", title: "Cognac VSOP en promo" },
  { cat: "spiritueux", title: "Vodka Grey Goose à prix doux" },
  { cat: "charcuterie", title: "Plateau charcuterie -10%" },
  { cat: "poissons", title: "Saumon fumé offre spéciale" },
  { cat: "plateaux", title: "Plateau réception -15%" },
  { cat: "vins", title: "Chardonnay promotion" },
  { cat: "spiritueux", title: "Gin premium -12%" },
  { cat: "charcuterie", title: "Saucisson sec en promo" },
  { cat: "poissons", title: "Truite fumée en offre" },
];

async function main() {
  // Récupère 12 produits aléatoires, 1 par catégorie
  const products = [];
  for (const p of promoTitles) {
    const { data, error } = await supabase
      .from("products")
      .select("id, slug, category_id, base_price_agorot, name_fr")
      .eq("status", "published")
      .in("category_id", [catId(p.cat)])
      .order("created_at", { ascending: false })
      .limit(1)
      .single();
    if (error || !data) {
      console.warn(`⚠️ Aucun produit ${p.cat} trouvé`);
      continue;
    }
    products.push({ ...data, ...p });
  }

  const rows = products.map((p, i) => ({
    id: crypto.randomUUID(),
    slug: `promo-${i + 1}`,
    title: p.title,
    description: `Profitez de ${p.title} chez Terminal 3. Offre limitée.`,
    product_id: p.id,
    variant_id: null,
    branch_id: null,
    regular_price_agorot: p.base_price_agorot,
    promo_price_agorot: Math.round(p.base_price_agorot * (i % 2 === 0 ? 0.85 : 0.8)),
    start_at: start.toISOString(),
    end_at: end.toISOString(),
    quantity_limit: null,
    remaining_quantity: null,
    members_only: false,
    featured: i < 3,
    status: "active",
    created_at: now.toISOString(),
    updated_at: now.toISOString(),
  }));

  if (rows.length === 0) {
    console.log("Aucune promotion à créer");
    return;
  }

  const { error } = await supabase.from("promotions").upsert(rows, { onConflict: "slug" });
  if (error) {
    console.error("❌ Erreur promotions :", error.message);
    process.exit(1);
  }
  console.log(`✅ ${rows.length} promotions créées`);
}

function catId(slug) {
  const map = {
    vins: "10000000-0000-0000-0000-000000000001",
    spiritueux: "10000000-0000-0000-0000-000000000002",
    charcuterie: "10000000-0000-0000-0000-000000000003",
    poissons: "10000000-0000-0000-0000-000000000004",
    plateaux: "10000000-0000-0000-0000-000000000005",
  };
  return map[slug];
}

main();
