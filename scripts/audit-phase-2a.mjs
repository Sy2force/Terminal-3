#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";

const ROOT = process.cwd();
const AUDIT_DIR = path.join(ROOT, "audits");

function money(agorot) {
  if (agorot == null) return "";
  return (agorot / 100).toFixed(2);
}

function toCsv(rows) {
  if (!rows.length) return "";
  const headers = Object.keys(rows[0]);
  const lines = [headers.join(";")];
  for (const r of rows) {
    lines.push(headers.map((h) => {
      const v = r[h];
      const s = v == null ? "" : String(v);
      return "\"" + s.replace(/"/g, "\"\"") + "\"";
    }).join(";"));
  }
  return lines.join("\n");
}

const KNOWN_BRANDS = new Set([
  "Glenfiddich", "Chivas Regal", "Don Julio", "Yarden", "Gamla", "Carmel", "Golan",
  "Castel", "Sarfati", "Johnnie Walker", "Jack Daniel's", "Jack Daniels", "Hennessy",
  "Remy Martin", "Moët", "Moet", "Dom Pérignon", "Dom Perignon", "Bartenura",
  "Teperberg", "Tabor", "Dalton", "Recanati", "Shiloh", "Psagot", "Flam", "Margalit",
  "Dewar's", "Dewars", "Bushmills", "Ararat", "Cîroc", "Ciroc", "Beluga", "Smirnoff",
  "Baileys", "Campari", "Khvanchkara", "Absolut", "Grey Goose", "Jameson", "Jim Beam",
  "Wild Turkey", "Maker's Mark", "Makers Mark", "The Macallan", "Macallan", "Highland Park",
  "Talisker", "Lagavulin", "Laphroaig", "Ardbeg", "Yamazaki", "Hibiki", "Nikka",
  "Crown Royal", "Canadian Club", "Seagram's", "Seagrams", "Teacher's", "Teachers",
  "Ballantine's", "Ballantines", "Passoa", "Malibu", "Kahlúa", "Kahlua", "Tia Maria",
  "Disaronno", "Amaretto", "Sambuca", "St-Germain", "St Germain", "Aperol",
  "Grand Marnier", "Cointreau", "Chartreuse", "Drambuie", "Frangelico", "Galliano",
  "Bénédictine", "Benedictine", "Fernet", "Jägermeister", "Jagermeister", "Ricard",
  "Pernod", "Pastis", "Ouzo",
]);

function extractBrand(name) {
  if (!name) return "";
  const lower = name.toLowerCase();
  for (const b of KNOWN_BRANDS) {
    if (lower.includes(b.toLowerCase())) return b;
  }
  return "";
}

function detectYear(name) {
  const m = (name || "").match(/\b(\d{4})\b/);
  return m ? parseInt(m[1], 10) : null;
}

function isImpossibleYear(year) {
  if (!year) return false;
  const now = new Date().getFullYear();
  return year > now || year < 1900;
}

function detectSource(product) {
  const name = product.name_fr || product.name_en || "";
  const slug = product.slug || "";

  if (name.toLowerCase().includes("produit à identifier")) return "mock-extra-products";
  if (/\bpremium\b \d+$/i.test(name) || /\btradition\b \d+$/i.test(name)) return "seed-food-products";
  if (/\bsaumon fumé/i.test(name) && /\d+$/.test(name)) return "seed-food-products";
  if (/\bsaucisson/i.test(name) && /\d+$/.test(name)) return "seed-food-products";
  if (slug.startsWith("mock-")) return "mock-catalog";
  if (/^\d{8}-/.test(slug)) return "seed-to-supabase";
  if (/-\d{1,3}$/.test(slug)) return "seed-to-supabase";
  if (product.id?.startsWith("70000000-0000-0000-0000-000070000")) return "seed-to-supabase";
  if (/\d{4}/.test(name) && /\d{1,3}$/.test(slug)) return "seed-demo-products";
  if (product.sku?.startsWith("T3")) return "saisie-humaine";
  return "inconnu";
}

function classify(product, imgUrl, price) {
  const name = product.name_fr || product.name_en || "";
  const brand = extractBrand(name);
  const year = detectYear(name);
  const imgLower = (imgUrl || "").toLowerCase();
  const catSlug = product.category_slug || "";

  const issues = [];
  if (isImpossibleYear(year)) issues.push(`millésime/année impossible: ${year}`);
  if (name.toLowerCase().includes("produit à identifier")) issues.push("nom générique");
  if (/\d{1,3}$/.test(name) && !/\d{4}$/.test(name)) issues.push("nom séquentiel");
  if (!brand) issues.push("marque non détectée");
  if (!price) issues.push("prix manquant");

  // Image consistency
  if (imgUrl && catSlug === "vins" && !imgLower.includes("wines")) issues.push("image non vin");
  if (imgUrl && catSlug === "spiritueux" && !imgLower.includes("spirits")) issues.push("image non spiritueux");
  if (imgUrl && catSlug === "poissons" && !imgLower.includes("fish")) issues.push("image non poisson");
  if (imgUrl && catSlug === "charcuterie" && !imgLower.includes("delicatessen")) issues.push("image non charcuterie");

  // Subcategory consistency
  const detectedSubcategory = detectImageInfo(imgUrl).subcategory || product.subcategory || product.wine_type || "";
  if (product.subcategory && detectedSubcategory && product.subcategory !== detectedSubcategory) {
    issues.push(`sous-catégorie incohérente: DB=${product.subcategory} image=${detectedSubcategory}`);
  }

  const source = detectSource(product);

  // Classification
  if (issues.some((i) => i.startsWith("millésime/année impossible")) || issues.includes("nom générique")) {
    return { group: "DUPLICATE_OR_INVALID", issues, source };
  }
  if (!brand || issues.includes("nom séquentiel")) {
    return { group: "DEMO_GENERATED", issues, source };
  }
  if (brand && !issues.length) return { group: "REAL_CONFIRMED", issues, source };
  return { group: "REAL_REVIEW", issues, source };
}

function detectImageInfo(filePath) {
  const lower = filePath.toLowerCase();
  let category = "";
  let subcategory = "";
  let brand = "";
  let productName = "";

  if (lower.includes("wines/yarden")) { category = "Vins"; subcategory = "Yarden"; brand = "Yarden"; }
  else if (lower.includes("wines/castel")) { category = "Vins"; subcategory = "Castel"; brand = "Castel"; }
  else if (lower.includes("wines/other-brands")) { category = "Vins"; subcategory = "Autres vins"; }
  else if (lower.includes("spirits/whisky")) { category = "Spiritueux"; subcategory = "Whisky"; }
  else if (lower.includes("spirits/tequila")) { category = "Spiritueux"; subcategory = "Tequila"; }
  else if (lower.includes("spirits/rum")) { category = "Spiritueux"; subcategory = "Rhum"; }
  else if (lower.includes("spirits/vodka")) { category = "Spiritueux"; subcategory = "Vodka"; }
  else if (lower.includes("spirits/gin")) { category = "Spiritueux"; subcategory = "Gin"; }
  else if (lower.includes("spirits/cognac")) { category = "Spiritueux"; subcategory = "Cognac"; }
  else if (lower.includes("spirits/arak")) { category = "Spiritueux"; subcategory = "Arak"; }
  else if (lower.includes("spirits/liqueurs")) { category = "Spiritueux"; subcategory = "Liqueur"; }
  else if (lower.includes("delicatessen/pastrami")) { category = "Charcuteries"; subcategory = "Pastrami"; }
  else if (lower.includes("delicatessen/sausages")) { category = "Charcuteries"; subcategory = "Saucisson"; }
  else if (lower.includes("delicatessen/pate")) { category = "Charcuteries"; subcategory = "Pâté"; }
  else if (lower.includes("delicatessen/sliced")) { category = "Charcuteries"; subcategory = "Tranché"; }
  else if (lower.includes("fish/salmon")) { category = "Poissons"; subcategory = lower.includes("sarfati") ? "Saumon Sarfati" : "Saumon fumé"; }
  else if (lower.includes("fish/anchovies")) { category = "Poissons"; subcategory = "Anchois"; }
  else if (lower.includes("fish/other")) { category = "Poissons"; subcategory = "Autres poissons"; }
  else if (lower.includes("salmon-plateaux")) { category = "Plateaux"; subcategory = "Saumon"; }
  else if (lower.includes("platters")) { category = "Plateaux"; subcategory = "Mixte"; }
  else if (lower.includes("brand/logo")) { category = "Brand"; subcategory = "Logo"; }
  else if (lower.includes("couvertures")) { category = "Couverture"; subcategory = "Site"; }

  // Try to extract product name from filename
  const base = path.basename(filePath, path.extname(filePath));
  productName = base.replace(/\d+$/, "").replace(/-/g, " ").trim();

  return { category, subcategory, brand, productName };
}

function imageType(filePath) {
  const lower = filePath.toLowerCase();
  if (lower.includes("/source/") || lower.includes("/sources/")) return "source";
  if (lower.includes("/couvertures/")) return "couverture";
  if (lower.includes("/brand/")) return "brand";
  if (lower.includes("/platters/")) return "platter";
  if (lower.includes("salmon-plateaux")) return "platter";
  if (lower.includes("chatgpt")) return "generique";
  return "produit";
}

async function main() {
  fs.mkdirSync(AUDIT_DIR, { recursive: true });

  const products = JSON.parse(fs.readFileSync(path.join(AUDIT_DIR, "backups", "products.json"), "utf-8"));
  const variants = JSON.parse(fs.readFileSync(path.join(AUDIT_DIR, "backups", "product_variants.json"), "utf-8"));
  const media = JSON.parse(fs.readFileSync(path.join(AUDIT_DIR, "backups", "product_media.json"), "utf-8"));
  const categories = JSON.parse(fs.readFileSync(path.join(AUDIT_DIR, "backups", "categories.json"), "utf-8"));

  // Add category slug to products
  const categoryById = new Map(categories.map((c) => [c.id, c]));
  for (const p of products) {
    const cat = categoryById.get(p.category_id);
    p.category_slug = cat ? cat.slug || "" : "";
    p.category_name = cat ? cat.name_fr || "" : "";
  }

  const variantsByProduct = new Map();
  for (const v of variants) {
    if (!variantsByProduct.has(v.product_id)) variantsByProduct.set(v.product_id, []);
    variantsByProduct.get(v.product_id).push(v);
  }
  const mediaByProduct = new Map();
  for (const m of media) {
    if (!mediaByProduct.has(m.product_id)) mediaByProduct.set(m.product_id, []);
    mediaByProduct.get(m.product_id).push(m);
  }

  // Product classification
  const classificationRows = [];
  const confirmedRows = [];
  const summary = { REAL_CONFIRMED: 0, REAL_REVIEW: 0, DEMO_GENERATED: 0, DUPLICATE_OR_INVALID: 0 };
  const sourceSummary = {};
  const brandCounts = new Map();

  for (const p of products) {
    const vs = variantsByProduct.get(p.id) || [];
    const defaultVariant = vs.find((v) => v.is_default) || vs[0];
    const price = money(p.base_price_agorot ?? defaultVariant?.regular_price_agorot ?? null);
    const imgs = mediaByProduct.get(p.id) || [];
    const mainImg = imgs.find((m) => m.kind === "COVER") || imgs[0];
    const imgUrl = mainImg?.url || "";

    const brand = extractBrand(p.name_fr || p.name_en);
    const { group, issues, source } = classify(p, imgUrl, price);
    const year = detectYear(p.name_fr || p.name_en);
    const volume = (p.volume_ml ?? defaultVariant?.volume_ml) ? (p.volume_ml ?? defaultVariant?.volume_ml) + "ml" : "";
    const weight = (p.weight_g ?? defaultVariant?.weight_g) ? (p.weight_g ?? defaultVariant?.weight_g) + "g" : "";

    summary[group] = (summary[group] || 0) + 1;
    sourceSummary[source] = (sourceSummary[source] || 0) + 1;
    if (brand && (group === "REAL_CONFIRMED" || group === "REAL_REVIEW")) {
      brandCounts.set(brand, (brandCounts.get(brand) || 0) + 1);
    }

    classificationRows.push({
      id: p.id,
      nom: p.name_fr || p.name_en || "",
      slug: p.slug,
      marque: brand,
      categorie: p.category_name,
      groupe: group,
      origine: source,
      raison: issues.join(" | ") || "données cohérentes",
      fichier_source: source,
      niveau_confiance: group === "REAL_CONFIRMED" ? "Certain" : (group === "REAL_REVIEW" ? "Probable" : (group === "DEMO_GENERATED" ? "Généré" : "Invalide")),
      preuve: issues.slice(0, 2).join(" | ") || "",
      image: imgUrl,
      doublon: "",
      prix: price,
      sku: defaultVariant?.sku || "",
    });

    if (group === "REAL_CONFIRMED") {
      confirmedRows.push({
        id: p.id,
        nom_actuel: p.name_fr || p.name_en || "",
        nouveau_nom_propose: `${brand} ${p.name_fr?.replace(brand, "").trim() || ""}`.trim() || p.name_fr,
        marque: brand,
        categorie: p.category_name,
        sous_categorie: p.subcategory || p.wine_type || "",
        millesime: year || "",
        age: p.age_years || "",
        volume,
        poids: weight,
        prix: price,
        stock: defaultVariant?.quantity || "",
        slug_actuel: p.slug,
        slug_propose: p.slug,
        sku_propose: defaultVariant?.sku || "",
        photo: imgUrl,
        pourquoi_certain: "Marque reconnue, nom structuré, image cohérente",
        modification_prevue: "Aucune",
      });
    }
  }

  fs.writeFileSync(path.join(AUDIT_DIR, "product-classification.csv"), toCsv(classificationRows));
  fs.writeFileSync(path.join(AUDIT_DIR, "confirmed-products-review.csv"), toCsv(confirmedRows));

  // Unused images
  const imageRoot = path.join(ROOT, "public", "images");
  const imageFiles = [];
  function scan(dir) {
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      const full = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        if (entry.name === "source" || entry.name === "sources") continue;
        scan(full);
      } else if (/\.(webp|png|jpg|jpeg)$/i.test(entry.name)) {
        imageFiles.push(full.replace(path.join(ROOT, "public"), "").replace(/\\/g, "/"));
      }
    }
  }
  if (fs.existsSync(imageRoot)) scan(imageRoot);

  const usedUrls = new Set(media.map((m) => m.url));
  const unusedImages = imageFiles.filter((u) => !usedUrls.has(u));

  const unusedRows = [];
  for (const img of unusedImages) {
    const info = detectImageInfo(img);
    const type = imageType(img);
    const confidence = info.category ? (type === "produit" ? "Produit probablement identifiable" : "Générique / couverture") : "Impossible à identifier";
    unusedRows.push({
      chemin: img,
      fichier: path.basename(img),
      type_image: type,
      produit_propose: info.productName,
      marque_proposee: info.brand,
      categorie_proposee: info.category,
      sous_categorie_proposee: info.subcategory,
      niveau_confiance: confidence,
      produit_existant: "",
      nouveau_produit_necessaire: type === "produit" && info.productName ? "Oui" : "Non",
      action: type === "produit" ? "Créer si confirmé" : (type === "source" ? "Archiver" : "Utiliser en CMS"),
    });
  }
  fs.writeFileSync(path.join(AUDIT_DIR, "unused-images-review.csv"), toCsv(unusedRows));

  // Used images
  const usedRows = [];
  const urlToProducts = new Map();
  for (const m of media) {
    if (!urlToProducts.has(m.url)) urlToProducts.set(m.url, []);
    urlToProducts.get(m.url).push(m.product_id);
  }

  for (const m of media) {
    const p = products.find((x) => x.id === m.product_id);
    const imgLower = (m.url || "").toLowerCase();
    const catSlug = p?.category_slug || "";
    let status = "Correctement associée";
    if (urlToProducts.get(m.url)?.length > 1) status = "Image générique utilisée par plusieurs produits";
    else if (catSlug === "vins" && !imgLower.includes("wines")) status = "Probablement mal associée";
    else if (catSlug === "spiritueux" && !imgLower.includes("spirits")) status = "Probablement mal associée";
    else if (catSlug === "poissons" && !imgLower.includes("fish")) status = "Probablement mal associée";
    else if (catSlug === "charcuterie" && !imgLower.includes("delicatessen")) status = "Probablement mal associée";
    else if (m.url?.toLowerCase().includes("source/")) status = "Image source exposée";

    usedRows.push({
      product_id: p?.id || m.product_id,
      nom: p?.name_fr || "",
      image: m.url,
      statut: status,
      nb_produits: urlToProducts.get(m.url)?.length || 0,
      categorie: p?.category_name || "",
    });
  }
  fs.writeFileSync(path.join(AUDIT_DIR, "used-images-review.csv"), toCsv(usedRows));

  // Brands
  const brandRows = Array.from(brandCounts.entries())
    .sort((a, b) => b[1] - a[1])
    .map(([name, count]) => ({
      marque_proposee: name,
      source: "Produits REAL_CONFIRMED / REAL_REVIEW",
      produits_potentiels: count,
      niveau_confiance: "Fiable",
      variantes: "",
      nom_normalise: name,
    }));
  fs.writeFileSync(path.join(AUDIT_DIR, "brands-review.csv"), toCsv(brandRows));

  // Public state per category
  const publicState = [];
  for (const cat of categories) {
    const prods = products.filter((p) => p.category_id === cat.id);
    const real = prods.filter((p) => {
      const c = classify(p, (mediaByProduct.get(p.id) || []).find((m) => m.kind === "COVER")?.url || (mediaByProduct.get(p.id) || [])[0]?.url, money(p.base_price_agorot));
      return c.group === "REAL_CONFIRMED" || c.group === "REAL_REVIEW";
    });
    const fake = prods.filter((p) => {
      const c = classify(p, (mediaByProduct.get(p.id) || []).find((m) => m.kind === "COVER")?.url || (mediaByProduct.get(p.id) || [])[0]?.url, money(p.base_price_agorot));
      return c.group === "DEMO_GENERATED" || c.group === "DUPLICATE_OR_INVALID";
    });
    const withWrongImage = prods.filter((p) => {
      const img = (mediaByProduct.get(p.id) || []).find((m) => m.kind === "COVER")?.url || (mediaByProduct.get(p.id) || [])[0]?.url;
      if (!img) return false;
      const lower = img.toLowerCase();
      if (cat.slug === "vins" && !lower.includes("wines")) return true;
      if (cat.slug === "spiritueux" && !lower.includes("spirits")) return true;
      return false;
    });
    publicState.push({
      categorie: cat.name_fr,
      slug: cat.slug,
      total: prods.length,
      reels_probables: real.length,
      demo_invalides: fake.length,
      image_incorrecte: withWrongImage.length,
      exemples: prods.slice(0, 3).map((p) => p.name_fr).join(" | "),
    });
  }
  fs.writeFileSync(path.join(AUDIT_DIR, "public-catalog-state.json"), JSON.stringify(publicState, null, 2));

  // Proposed categories SQL (idempotent)
  const categoryTree = [
    { slug: "alcools", name_fr: "Alcools", name_he: "אלכוהול", parent: null },
    { slug: "vins", name_fr: "Vins", name_he: "יינות", parent: "alcools" },
    { slug: "whiskies", name_fr: "Whiskies", name_he: "וויסקי", parent: "alcools" },
    { slug: "tequilas", name_fr: "Tequilas", name_he: "טקילה", parent: "alcools" },
    { slug: "vodkas", name_fr: "Vodkas", name_he: "וודקה", parent: "alcools" },
    { slug: "rhums", name_fr: "Rhums", name_he: "רום", parent: "alcools" },
    { slug: "gins", name_fr: "Gins", name_he: "ג'ין", parent: "alcools" },
    { slug: "araks", name_fr: "Araks", name_he: "ערק", parent: "alcools" },
    { slug: "cognacs", name_fr: "Cognacs", name_he: "קוניאק", parent: "alcools" },
    { slug: "liqueurs", name_fr: "Liqueurs", name_he: "ליקרים", parent: "alcools" },
    { slug: "bieres", name_fr: "Bières", name_he: "בירות", parent: "alcools" },
    { slug: "epicerie-fine", name_fr: "Épicerie fine", name_he: "מעדני יוקרה", parent: null },
    { slug: "poissons", name_fr: "Poissons", name_he: "דגים", parent: "epicerie-fine" },
    { slug: "charcuteries", name_fr: "Charcuteries", name_he: "נקניקים", parent: "epicerie-fine" },
    { slug: "fromages", name_fr: "Fromages", name_he: "גבינות", parent: "epicerie-fine" },
    { slug: "olives", name_fr: "Olives", name_he: "זיתים", parent: "epicerie-fine" },
    { slug: "huiles", name_fr: "Huiles", name_he: "שמנים", parent: "epicerie-fine" },
    { slug: "epices", name_fr: "Épices", name_he: "תבלינים", parent: "epicerie-fine" },
    { slug: "capres", name_fr: "Câpres", name_he: "צלפים", parent: "epicerie-fine" },
    { slug: "plateaux", name_fr: "Plateaux", name_he: "מגשים", parent: null },
    { slug: "coffrets-cadeaux", name_fr: "Coffrets cadeaux", name_he: "מארזי מתנה", parent: null },
    { slug: "promotions", name_fr: "Promotions", name_he: "מבצעים", parent: null },
  ];

  const subcatToSlug = {
    "Whisky": "whiskies",
    "Tequila": "tequilas",
    "Rhum": "rhums",
    "Vodka": "vodkas",
    "Gin": "gins",
    "Arak": "araks",
    "Cognac": "cognacs",
    "Liqueur": "liqueurs",
    "Yarden": "vins",
    "Castel": "vins",
    "Autres vins": "vins",
    "Saumon fumé": "poissons",
    "Saumon Sarfati": "poissons",
    "Anchois": "poissons",
    "Autres poissons": "poissons",
    "Pastrami": "charcuteries",
    "Saucisson": "charcuteries",
    "Pâté": "charcuteries",
    "Tranché": "charcuteries",
    "Plateau": "plateaux",
  };

  let categoriesSql = "-- Proposed categories hierarchy (idempotent, not applied yet)\n\nBEGIN;\n\n";
  for (const c of categoryTree) {
    categoriesSql += `INSERT INTO categories (id, slug, name_fr, name_he, parent_id, is_active, is_featured, display_order)\n`;
    categoriesSql += `  SELECT gen_random_uuid(), '${c.slug}', '${c.name_fr.replace(/'/g, "''")}', '${c.name_he.replace(/'/g, "''")}', `;
    categoriesSql += c.parent ? `(SELECT id FROM categories WHERE slug = '${c.parent}')` : "NULL";
    categoriesSql += `, true, false, 0\n  WHERE NOT EXISTS (SELECT 1 FROM categories WHERE slug = '${c.slug}');\n\n`;
  }
  categoriesSql += "COMMIT;\n";
  fs.writeFileSync(path.join(AUDIT_DIR, "proposed-categories.sql"), categoriesSql);

  // Product reassignment for REAL_CONFIRMED (dry run, not applied)
  let reassignSql = "-- Proposed product reassignment for REAL_CONFIRMED only (not applied yet)\n\nBEGIN;\n\n";
  for (const p of products) {
    const vs = variantsByProduct.get(p.id) || [];
    const defaultVariant = vs.find((v) => v.is_default) || vs[0];
    const price = money(p.base_price_agorot ?? defaultVariant?.regular_price_agorot ?? null);
    const imgs = mediaByProduct.get(p.id) || [];
    const mainImg = imgs.find((m) => m.kind === "COVER") || imgs[0];
    const imgUrl = mainImg?.url || "";
    const { group, issues } = classify(p, imgUrl, price);
    if (group !== "REAL_CONFIRMED") continue;
    const subcat = issues.find((i) => i.includes("sous-catégorie")) || "";
    const info = detectImageInfo(imgUrl);
    const targetSlug = subcatToSlug[info.subcategory] || subcatToSlug[p.subcategory] || subcatToSlug[subcat.split("image=")[1]?.trim()] || p.category_slug;
    if (targetSlug && targetSlug !== p.category_slug) {
      reassignSql += `UPDATE products SET category_id = (SELECT id FROM categories WHERE slug = '${targetSlug}'), updated_at = now()\n  WHERE id = '${p.id}' AND category_id != (SELECT id FROM categories WHERE slug = '${targetSlug}');\n\n`;
    }
  }
  reassignSql += "COMMIT;\n";
  fs.writeFileSync(path.join(AUDIT_DIR, "proposed-product-reassignment.sql"), reassignSql);

  // Phase 2A summary
  const phase2a = {
    ...summary,
    origines: sourceSummary,
    produits_confirmes: confirmedRows.length,
    photos_inutilisees: unusedImages.length,
    photos_utilisees: media.length,
    marques_fiables: brandRows.length,
    public_state: publicState,
  };
  fs.writeFileSync(path.join(AUDIT_DIR, "phase2a-summary.json"), JSON.stringify(phase2a, null, 2));

  console.log("Phase 2A analyse générée.");
  console.log(phase2a);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
