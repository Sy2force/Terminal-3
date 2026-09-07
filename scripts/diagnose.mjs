#!/usr/bin/env node
/**
 * scripts/diagnose.mjs — diagnostic NON DESTRUCTIF du projet Terminal 3.
 *
 * Affiche :
 *  - taille des dossiers principaux (public, .next, node_modules)
 *  - images lourdes dans public/ (> seuil)
 *  - doublons exacts par hash SHA-1
 *  - fichiers de public/images jamais référencés dans le code (candidats orphelins)
 *  - médias référencés dans le code mais absents du disque (références cassées)
 *
 * Ne supprime rien. Usage : node scripts/diagnose.mjs
 */
import { createHash } from "node:crypto";
import { promises as fs } from "node:fs";
import path from "node:path";

const ROOT = process.cwd();
const HEAVY_IMAGE_BYTES = 500 * 1024; // 500 Ko
const IMAGE_EXTS = new Set([".png", ".jpg", ".jpeg", ".webp", ".avif", ".gif", ".svg"]);
const SCAN_DIRS = ["app", "components", "lib", "content", "public"];
const CODE_EXTS = new Set([".ts", ".tsx", ".js", ".jsx", ".json", ".md", ".mdx", ".css"]);

async function* walk(dir) {
  let entries;
  try {
    entries = await fs.readdir(dir, { withFileTypes: true });
  } catch {
    return;
  }
  for (const e of entries) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) {
      if (e.name === "node_modules" || e.name === ".git") continue;
      yield* walk(p);
    } else {
      yield p;
    }
  }
}

async function dirSize(dir) {
  let total = 0;
  for await (const p of walk(dir)) {
    try {
      total += (await fs.stat(p)).size;
    } catch { /* ignore */ }
  }
  return total;
}

function fmt(bytes) {
  if (bytes > 1024 * 1024) return `${(bytes / 1024 / 1024).toFixed(1)} Mo`;
  if (bytes > 1024) return `${(bytes / 1024).toFixed(0)} Ko`;
  return `${bytes} o`;
}

const report = { heavyImages: [], duplicates: [], orphanCandidates: [], brokenRefs: [] };

console.log("=== Diagnostic Terminal 3 (non destructif) ===\n");

// 1. Tailles des dossiers
console.log("— Tailles des dossiers —");
for (const dir of ["public", ".next", "node_modules", "app", "components", "lib"]) {
  const size = await dirSize(path.join(ROOT, dir));
  console.log(`  ${dir.padEnd(14)} ${fmt(size)}`);
}

// 2. Images lourdes + hash des fichiers publics
console.log("\n— Images lourdes (> 500 Ko) dans public/ —");
const byHash = new Map();
const publicImages = [];
for await (const p of walk(path.join(ROOT, "public"))) {
  const ext = path.extname(p).toLowerCase();
  if (!IMAGE_EXTS.has(ext)) continue;
  const buf = await fs.readFile(p);
  publicImages.push({ path: p, size: buf.length });
  const hash = createHash("sha1").update(buf).digest("hex");
  if (!byHash.has(hash)) byHash.set(hash, []);
  byHash.get(hash).push(p);
  if (buf.length > HEAVY_IMAGE_BYTES) {
    report.heavyImages.push({ path: p, size: buf.length });
  }
}
for (const img of report.heavyImages.sort((a, b) => b.size - a.size)) {
  console.log(`  ${fmt(img.size).padStart(8)}  ${path.relative(ROOT, img.path)}`);
}
if (report.heavyImages.length === 0) console.log("  aucune");

// 3. Doublons par hash
console.log("\n— Doublons exacts (même contenu) —");
for (const files of byHash.values()) {
  if (files.length > 1) {
    report.duplicates.push(files.map((f) => path.relative(ROOT, f)));
    console.log(`  ${files.map((f) => path.relative(ROOT, f)).join("  =  ")}`);
  }
}
if (report.duplicates.length === 0) console.log("  aucun");

// 4. Références : images publiques citées ou non dans le code
console.log("\n— Candidats orphelins (images de public/ non référencées dans le code) —");
const codeCorpus = [];
for (const dir of SCAN_DIRS.filter((d) => d !== "public")) {
  for await (const p of walk(path.join(ROOT, dir))) {
    if (CODE_EXTS.has(path.extname(p).toLowerCase())) {
      codeCorpus.push(await fs.readFile(p, "utf8").catch(() => ""));
    }
  }
}
// public may also self-reference (manifests, css url())
for await (const p of walk(path.join(ROOT, "public"))) {
  if (CODE_EXTS.has(path.extname(p).toLowerCase())) {
    codeCorpus.push(await fs.readFile(p, "utf8").catch(() => ""));
  }
}
const corpus = codeCorpus.join("\n");
for (const img of publicImages) {
  const rel = path.relative(path.join(ROOT, "public"), img.path).replace(/\\/g, "/");
  const name = path.basename(img.path);
  if (!corpus.includes(rel) && !corpus.includes(name)) {
    report.orphanCandidates.push(rel);
  }
}
for (const rel of report.orphanCandidates.slice(0, 50)) {
  console.log(`  ${rel}`);
}
if (report.orphanCandidates.length === 0) console.log("  aucun");
if (report.orphanCandidates.length > 50) {
  console.log(`  … et ${report.orphanCandidates.length - 50} autres`);
}

// 5. Références cassées : chemins /images/... cités mais absents du disque
console.log("\n— Références cassées (chemin public cité, fichier absent) —");
const refRe = /["'`](\/(?:images|fonts|icons)\/[^"'`\s)]+)["'`]/g;
const refs = new Set();
let m;
while ((m = refRe.exec(corpus)) !== null) refs.add(m[1]);
for (const ref of refs) {
  const abs = path.join(ROOT, "public", ref);
  try {
    await fs.stat(abs);
  } catch {
    report.brokenRefs.push(ref);
    console.log(`  ${ref}`);
  }
}
if (report.brokenRefs.length === 0) console.log("  aucune");

console.log("\n=== Résumé ===");
console.log(`  images publiques analysées : ${publicImages.length}`);
console.log(`  images lourdes             : ${report.heavyImages.length}`);
console.log(`  groupes de doublons        : ${report.duplicates.length}`);
console.log(`  candidats orphelins        : ${report.orphanCandidates.length}`);
console.log(`  références cassées         : ${report.brokenRefs.length}`);
console.log("\nAucune suppression effectuée. La purge des orphelins reste une action");
console.log("manuelle séparée avec aperçu et confirmation.");
