#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";

const ROOT = process.cwd();
const AUDIT_DIR = path.join(ROOT, "audits");

function money(agorot) {
  if (agorot == null) return "";
  return (agorot / 100).toFixed(2);
}

function slugify(str) {
  return (str || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/&/g, "et")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

const KNOWN_BRANDS = new Set([
  "Glenfiddich", "Chivas Regal", "Don Julio", "Yarden", "Gamla", "Carmel", "Golan",
  "Castel", "Sarfati", "Johnnie Walker", "Jack Daniel's", "Jack Daniels", "Hennessy",
  "Remy Martin", "Moët", "Moet", "Dom Pérignon", "Dom Perignon", "Bartenura",
  "Teperberg", "Tabor", "Dalton", "Recanati", "Shiloh", "Psagot", "Flam",
  "Margalit", "Dewar's", "Dewars", "Bushmills", "Ararat", "Cîroc", "Ciroc",
  "Beluga", "Smirnoff", "Baileys", "Campari", "Khvanchkara", "Absolut", "Grey Goose",
  "Jameson", "Jim Beam", "Wild Turkey", "Maker's Mark", "Makers Mark", "The Macallan",
  "Macallan", "Highland Park", "Talisker", "Lagavulin", "Laphroaig", "Ardbeg",
  "Yamazaki", "Hibiki", "Nikka", "Crown Royal", "Canadian Club", "Seagram's",
  "Seagrams", "Hiram Walker", "Teacher's", "Teachers", "Ballantine's", "Ballantines",
  "Passoa", "Malibu", "Kahlúa", "Kahlua", "Tia Maria", "Disaronno", "Amaretto",
  "Sambuca", "St-Germain", "St Germain", "Aperol", "Grand Marnier", "Cointreau",
  "Chartreuse", "Drambuie", "Frangelico", "Galliano", "Bénédictine", "Benedictine",
  "Fernet", "Jägermeister", "Jagermeister", "Ricard", "Pernod", "Pastis", "Ouzo",
]);

const GRAPE_OR_COLOR = new Set([
  "rouge", "blanc", "rosé", "rose", "noir", "cabernet", "sauvignon", "merlot",
  "syrah", "shiraz", "pinot", "chardonnay", "sémillon", "semillon", "riesling",
  "gewurztraminer", "muscat", "grenache", "mourvèdre", "carignan", "petit", "verdot",
  "malbec", "zinfandel", "tempranillo", "sangiovese", "nebbiolo", "barbera",
  "albariño", "albarino", "viognier", "gewürz", "gris", "blanco", "añejo", "anejo",
  "reposado", "extra", "v.s.o.p", "vsop", "x.o", "xo", "floral", "coffee", "distiller's",
  "distillers",
]);

function detectBrand(name) {
  if (!name) return "";
  const lower = name.toLowerCase();
  for (const b of KNOWN_BRANDS) {
    if (lower.includes(b.toLowerCase())) return b;
  }
  const first = name.split(/\s+/)[0].replace(/[^a-z0-9]/gi, "").toLowerCase();
  if (GRAPE_OR_COLOR.has(first)) return "";
  const firstWord = name.split(/\s+/)[0];
  if (firstWord && firstWord.length > 2 && /^[A-Z]/.test(firstWord)) return firstWord;
  return "";
}

function detectVolume(name) {
  const m = (name || "").match(/(\d{2,3})\s?(ml|cl|l)\b/i);
  if (m) return m[1] + m[2].toLowerCase();
  const m2 = (name || "").match(/(\d{2,3})\s?ml/i);
  if (m2) return m2[1] + "ml";
  return "";
}

function detectWeight(name) {
  const m = (name || "").match(/(\d{2,4})\s?(g|gr|kg)\b/i);
  if (m) return m[1] + (m[2].toLowerCase().startsWith("k") ? "kg" : "g");
  return "";
}

function detectVintage(name) {
  const m = (name || "").match(/\b(19|20)\d{2}\b/);
  return m ? m[0] : "";
}

function detectAge(name) {
  const m = (name || "").match(/(\d{1,2})\s?(ans?|years?|yo|y\.o\.)/i);
  return m ? m[1] : "";
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

function detectSubcategoryFromImage(imgLower) {
  if (!imgLower) return "";
  if (imgLower.includes("wines/yarden")) return "Yarden";
  if (imgLower.includes("wines/castel")) return "Castel";
  if (imgLower.includes("wines/other-brands")) return "Autres vins";
  if (imgLower.includes("spirits/whisky")) return "Whisky";
  if (imgLower.includes("spirits/tequila")) return "Tequila";
  if (imgLower.includes("spirits/rum")) return "Rhum";
  if (imgLower.includes("spirits/vodka")) return "Vodka";
  if (imgLower.includes("spirits/gin")) return "Gin";
  if (imgLower.includes("spirits/cognac")) return "Cognac";
  if (imgLower.includes("spirits/arak")) return "Arak";
  if (imgLower.includes("spirits/liqueurs")) return "Liqueur";
  if (imgLower.includes("delicatessen/pastrami")) return "Pastrami";
  if (imgLower.includes("delicatessen/sausages")) return "Saucisson";
  if (imgLower.includes("fish/salmon")) return imgLower.includes("sarfati") ? "Saumon Sarfati" : "Saumon fumé";
  if (imgLower.includes("fish/anchovies")) return "Anchois";
  if (imgLower.includes("fish/other")) return "Autres poissons";
  if (imgLower.includes("platters")) return "Plateau";
  return "";
}

async function main() {
  fs.mkdirSync(AUDIT_DIR, { recursive: true });

  // Load data from backups or Supabase
  const products = JSON.parse(fs.readFileSync(path.join(AUDIT_DIR, "backups", "products.json"), "utf-8"));
  const variants = JSON.parse(fs.readFileSync(path.join(AUDIT_DIR, "backups", "product_variants.json"), "utf-8"));
  const media = JSON.parse(fs.readFileSync(path.join(AUDIT_DIR, "backups", "product_media.json"), "utf-8"));
  const categories = JSON.parse(fs.readFileSync(path.join(AUDIT_DIR, "backups", "categories.json"), "utf-8"));

  const categoryById = new Map(categories.map((c) => [c.id, c]));
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

  // Product mapping
  const productRows = [];
  const anomalies = [];

  for (const p of products) {
    const cat = categoryById.get(p.category_id);
    const catName = cat ? cat.name_fr || cat.name_en || "" : "";
    const catSlug = cat ? cat.slug || "" : "";
    const vs = variantsByProduct.get(p.id) || [];
    const defaultVariant = vs.find((v) => v.is_default) || vs[0];
    const priceAgorot = p.base_price_agorot ?? defaultVariant?.regular_price_agorot ?? null;
    const price = money(priceAgorot);
    const stock = defaultVariant ? "" : "";
    const vol = detectVolume(p.name_fr) || detectVolume(p.name_en) || p.volume_ml || (defaultVariant?.volume_ml ? defaultVariant.volume_ml + "ml" : "");
    const weight = detectWeight(p.name_fr) || detectWeight(p.name_en) || p.weight_g || (defaultVariant?.weight_g ? defaultVariant.weight_g + "g" : "");
    const vintage = p.vintage || detectVintage(p.name_fr) || detectVintage(p.name_en);
    const age = p.age_years || detectAge(p.name_fr) || detectAge(p.name_en);
    const brand = detectBrand(p.name_fr || p.name_en);
    const imgs = mediaByProduct.get(p.id) || [];
    const mainImg = imgs.find((m) => m.kind === "COVER") || imgs[0];
    const imgUrl = mainImg?.url || "";

    const issues = [];
    if (!imgUrl) issues.push("pas de photo");
    if (!price) issues.push("pas de prix");
    if (p.name_fr?.toLowerCase().includes("produit à identifier")) issues.push("nom générique");
    if (/\b\d{1,3}\b/.test(p.name_fr) && /\d+$/.test(p.name_fr)) issues.push("nom séquentiel");
    if (!brand) issues.push("marque non détectée");

    // Image / category consistency
    const imgLower = (imgUrl || "").toLowerCase();
    if (imgUrl && !imgLower.includes("/")) issues.push("chemin image invalide");
    if (imgUrl && catSlug === "vins" && !imgLower.includes("wines")) issues.push("image non vin");
    if (imgUrl && catSlug === "spiritueux" && !imgLower.includes("spirits")) issues.push("image non spiritueux");
    if (imgUrl && catSlug === "poissons" && !imgLower.includes("fish")) issues.push("image non poisson");
    if (imgUrl && catSlug === "charcuterie" && !imgLower.includes("delicatessen")) issues.push("image non charcuterie");

    // Subcategory mismatch: trust image/name over DB for generated data
    const detectedSubcategory = detectSubcategoryFromImage(imgLower) || p.subcategory || p.wine_type || "";
    if (p.subcategory && detectedSubcategory && p.subcategory !== detectedSubcategory) {
      issues.push(`sous-catégorie incohérente: DB=${p.subcategory} image=${detectedSubcategory}`);
    }

    let confidence;
    if (issues.length === 0) confidence = "Certain";
    else if (issues.some((i) => i.includes("générique") || i.includes("séquentiel") || i.includes("incohérente") || i.includes("non"))) confidence = "Incertain";
    else confidence = "Probable";

    if (issues.length > 0 || confidence !== "Certain") {
      anomalies.push({
        product_id: p.id,
        name: p.name_fr,
        slug: p.slug,
        issues: issues.join(", ") || "données auto-générées",
        confidence,
      });
    }

    productRows.push({
      id: p.id,
      ancien_nom: p.name_fr || p.name_en || "",
      nouveau_nom_propose: brand ? `${brand} — ${p.name_fr || ""}`.replace(/\s+/g, " ").trim() : p.name_fr || "",
      marque: brand,
      categorie: catName,
      sous_categorie: detectedSubcategory,
      millesime: vintage,
      age: age,
      volume: vol,
      poids: weight,
      ancien_slug: p.slug,
      nouveau_slug_propose: slugify(brand ? `${brand}-${p.name_fr || ""}` : p.name_fr || p.slug),
      sku: defaultVariant?.sku || "",
      prix: price,
      stock,
      source: "Supabase",
      photo_actuelle: imgUrl,
      nouvelle_photo_proposee: "",
      niveau_confiance: confidence,
      problemes: issues.join(", ") || "",
    });
  }

  fs.writeFileSync(path.join(AUDIT_DIR, "product-mapping.csv"), toCsv(productRows));
  fs.writeFileSync(path.join(AUDIT_DIR, "product-anomalies.json"), JSON.stringify(anomalies, null, 2));

  // Photo inventory
  const photoRows = [];
  const imageRoot = path.join(ROOT, "public", "images");
  const imageFiles = [];

  function scan(dir) {
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      const full = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        if (entry.name === "source" || entry.name === "sources") continue; // skip source drafts
        scan(full);
      } else if (/\.(webp|png|jpg|jpeg)$/i.test(entry.name)) {
        imageFiles.push(full.replace(path.join(ROOT, "public"), "").replace(/\\/g, "/"));
      }
    }
  }
  if (fs.existsSync(imageRoot)) scan(imageRoot);

  for (const url of imageFiles) {
    const usedBy = media
      .filter((m) => m.url === url)
      .map((m) => m.product_id);
    const productsFor = usedBy
      .map((id) => products.find((p) => p.id === id)?.name_fr)
      .filter(Boolean)
      .join(" | ");

    const confidence = usedBy.length ? (productsFor ? "Certain" : "Probable") : "A classer";

    photoRows.push({
      chemin: url,
      dossier: path.dirname(url).replace("/images/", ""),
      nom_fichier: path.basename(url),
      utilise: usedBy.length ? "oui" : "non",
      produits_associes: productsFor || (usedBy.length ? usedBy.join(" | ") : ""),
      nb_utilisations: usedBy.length,
      taille_octets: fs.statSync(path.join(ROOT, "public", url)).size,
      niveau_confiance: confidence,
    });
  }

  fs.writeFileSync(path.join(AUDIT_DIR, "photo-mapping.csv"), toCsv(photoRows));

  // Summary
  const summary = {
    produits_total: products.length,
    produits_sans_photo: productRows.filter((r) => r.photo_actuelle === "").length,
    produits_avec_prix_manquant: productRows.filter((r) => r.prix === "").length,
    produits_incertain: productRows.filter((r) => r.niveau_confiance === "Incertain").length,
    produits_probable: productRows.filter((r) => r.niveau_confiance === "Probable").length,
    produits_certain: productRows.filter((r) => r.niveau_confiance === "Certain").length,
    photos_total: photoRows.length,
    photos_utilisees: photoRows.filter((r) => r.utilise === "oui").length,
    photos_non_utilisees: photoRows.filter((r) => r.utilise === "non").length,
    categories: categories.length,
    marques: JSON.parse(fs.readFileSync(path.join(AUDIT_DIR, "backups", "brands.json"), "utf-8")).length,
    admin_roles: JSON.parse(fs.readFileSync(path.join(AUDIT_DIR, "backups", "admin_roles.json"), "utf-8")).length,
  };

  fs.writeFileSync(path.join(AUDIT_DIR, "phase1-summary.json"), JSON.stringify(summary, null, 2));

  console.log("Audit Phase 1 généré dans audits/");
  console.log(summary);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
