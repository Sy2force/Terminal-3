#!/usr/bin/env node
/**
 * Outil de rangement des images de spiritueux.
 *
 * 1. Place toutes les images PNG/WebP importées dans
 *    public/images/terminal-3/spirits/whisky/ (ou un dossier temporaire).
 *
 * 2. Exécute ce script une première fois pour générer
 *    public/images/terminal-3/spirits/_mapping.json.
 *
 * 3. Remplis _mapping.json avec le type et le slug de chaque image :
 *    {
 *      "00214378-8FB5-452E-85CC-013C94F2B50D.PNG": {
 *        "type": "whisky",
 *        "slug": "jack-daniels-old-no-7"
 *      },
 *      ...
 *    }
 *
 *    Types autorisés : arak, cognac, gin, liqueurs, other, rum, tequila, vodka, whisky
 *
 * 4. Exécute à nouveau ce script. Il déplacera et renommera les fichiers :
 *    public/images/terminal-3/spirits/{type}/{slug}.png
 *
 * 5. Le site utilisera automatiquement ces images grâce à SPIRIT_IMAGE_OVERRIDES.
 */

import fs from "node:fs";
import path from "node:path";

const ROOT = process.cwd();
const SPIRITS_DIR = path.join(ROOT, "public/images/terminal-3/spirits");
const MAPPING_FILE = path.join(SPIRITS_DIR, "_mapping.json");
const TYPES = ["arak", "cognac", "gin", "liqueurs", "other", "rum", "tequila", "vodka", "whisky"];

function findImages(dir, relativeTo = SPIRITS_DIR) {
  const out = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      // ignore "source" backups and hidden dirs
      if (entry.name === "source" || entry.name.startsWith(".")) continue;
      out.push(...findImages(full, relativeTo));
    } else if (/\.(png|webp|jpg|jpeg|PNG|WEBP|JPG|JPEG)$/i.test(entry.name)) {
      out.push(path.relative(relativeTo, full));
    }
  }
  return out;
}

function loadMapping() {
  if (!fs.existsSync(MAPPING_FILE)) return null;
  return JSON.parse(fs.readFileSync(MAPPING_FILE, "utf-8"));
}

function saveTemplate(images) {
  const mapping = {};
  for (const img of images) {
    mapping[path.basename(img)] = { type: "whisky", slug: "" };
  }
  fs.writeFileSync(MAPPING_FILE, JSON.stringify(mapping, null, 2));
  console.log(`✅ Modèle créé : ${MAPPING_FILE}`);
  console.log(`Remplis-le avec le vrai "type" et "slug" de chaque image, puis relance ce script.`);
}

function applyMapping(mapping, images) {
  for (const [filename, info] of Object.entries(mapping)) {
    if (!info.type || !info.slug) continue;
    if (!TYPES.includes(info.type)) {
      console.warn(`❌ type "${info.type}" non reconnu pour ${filename}. Ignoré.`);
      continue;
    }

    const found = images.find((i) => path.basename(i) === filename);
    if (!found) {
      console.warn(`❌ Fichier non trouvé : ${filename}`);
      continue;
    }

    const ext = path.extname(filename).toLowerCase();
    const targetDir = path.join(SPIRITS_DIR, info.type);
    if (!fs.existsSync(targetDir)) fs.mkdirSync(targetDir, { recursive: true });
    const target = path.join(targetDir, `${info.slug}${ext}`);

    const source = path.join(SPIRITS_DIR, found);
    fs.renameSync(source, target);
    console.log(`✅ ${filename} → ${target}`);
  }

  // cleanup empty .gitkeep if needed
  for (const t of TYPES) {
    const dir = path.join(SPIRITS_DIR, t);
    if (!fs.existsSync(dir)) continue;
    const files = fs.readdirSync(dir).filter((f) => f !== ".gitkeep");
    if (files.length === 0) {
      fs.writeFileSync(path.join(dir, ".gitkeep"), "");
    }
  }

  // also keep mapping for reference
  console.log("Terminé. Redémarre le serveur Next.js pour voir les changements.");
}

const images = findImages(SPIRITS_DIR);
const mapping = loadMapping();

if (!mapping) {
  saveTemplate(images);
} else {
  applyMapping(mapping, images);
}
