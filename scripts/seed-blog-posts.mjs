#!/usr/bin/env node
/**
 * Crée des articles de blog pour la page Inspirations.
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

const now = new Date().toISOString();

const posts = [
  {
    slug: "accord-vin-saumon",
    title: "Quel vin avec du saumon fumé ?",
    subtitle: "Les accords parfaits pour un apéritif d'exception",
    hero_image_url: "/images/terminal-3/couvertures/poissons.webp",
    category: "Accords",
    body: "Le saumon fumé s'apprécie avec un vin blanc sec, frais et minéral. Un Chardonnay israélien ou un Sauvignon Blanc léger rehaussent les saveurs sans écraser le poisson.",
  },
  {
    slug: "plateau-shabbat",
    title: "Composer le plateau idéal pour Shabbat",
    subtitle: "Saumon, charcuterie, et quelques bouteilles choisies",
    hero_image_url: "/images/terminal-3/couvertures/plateaux.webp",
    category: "Plateaux",
    body: "Un plateau réussi mélange textures et couleurs : saumon fumé en rosace, tranches fines de saucisson sec, cornichons et pain de seigle. Pensez à 100g par personne.",
  },
  {
    slug: "whisky-debutant",
    title: "Bien choisir son premier whisky",
    subtitle: "Single malt, blend, tourbé ou sherry ?",
    hero_image_url: "/images/terminal-3/couvertures/spiritueux.webp",
    category: "Spiritueux",
    body: "Pour débuter, privilégiez un blend doux et accessible, ou un single malt aux notes de fruits. Les whiskies tourbés requièrent un palais plus affirmé.",
  },
  {
    slug: "vin-de-sedre",
    title: "Les vins du Domaine du Castel",
    subtitle: "Une histoire israélienne en bouteille",
    hero_image_url: "/images/terminal-3/wines/castel/petit-castel-2020.png",
    category: "Vins",
    body: "Le Petit Castel incarne l'élégance des vins de la région de Jérusalem. Fruits rouges, tanins soyeux, belle finale : un vin de table et de réception.",
  },
  {
    slug: "charcuterie-fromage",
    title: "Charcuterie et vin : les classiques",
    subtitle: "Saucissons secs, jambons et accords gourmands",
    hero_image_url: "/images/terminal-3/couvertures/charcuterie.webp",
    category: "Charcuterie",
    body: "Le saucisson sec se marie avec un rouge léger, tandis que le jambon de Parme ouvre les papilles sur un rouge plus structuré.",
  },
  {
    slug: "degustation-privée",
    title: "Organiser une dégustation privée",
    subtitle: "Conseils pour une soirée réussie à Jérusalem",
    hero_image_url: "/images/terminal-3/couvertures/vins.webp",
    category: "Événements",
    body: "Prévoyez 3 à 5 vins variés, des verres propres, et un ordre de dégustation du plus léger au plus corsé. Terminez par un whisky pour les amateurs.",
  },
];

async function main() {
  const rows = posts.map((p, i) => ({
    id: crypto.randomUUID(),
    ...p,
    status: "published",
    published_at: new Date(Date.now() - i * 86400000).toISOString(),
    created_at: now,
    updated_at: now,
  }));

  const { error } = await supabase.from("content_posts").upsert(rows, { onConflict: "slug" });
  if (error) {
    console.error("❌ Erreur posts :", error.message);
    process.exit(1);
  }
  console.log(`✅ ${rows.length} articles blog créés`);
}

main();
