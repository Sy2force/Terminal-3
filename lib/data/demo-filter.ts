import { normalize } from "../classification/parser";

/**
 * Temporary heuristic to hide demonstrably generated/placeholder products
 * from the public catalog without modifying the database.
 *
 * This filter is intentionally conservative: it only flags products that are
 * obviously fake (placeholder names, impossible vintages, or sequential
 * index numbers on products with no brand/variant metadata).
 *
 * Products with a brand, a valid vintage, a matching age, volume or weight
 * are kept. This means real items such as "Chivas Regal 12", "Glenfiddich 18",
 * "Arak 40", "Grey Goose 700 ml" or "Yarden Cabernet Sauvignon 2022" remain
 * visible.
 *
 * TODO: Remove this once the catalogue has been manually cleaned and real
 * products are marked with a reliable `status` or `is_demo` flag.
 */
export interface DemoFilterableProduct {
  name_fr?: string | null;
  name_he?: string | null;
  name_en?: string | null;
  brand?: string | null;
  subcategory?: string | null;
  age_years?: number | null;
  vintage?: number | null;
  variants?: Array<{ volume_ml?: number | null; weight_g?: number | null }>;
}

export function isProbablyDemoProduct(product: DemoFilterableProduct): boolean {
  const name = product.name_fr ?? product.name_he ?? product.name_en ?? "";
  if (!name) return true;

  const n = normalize(name);
  if (n.includes("produit a identifier")) return true;

  const hasBrand = Boolean(product.brand?.trim());
  const currentYear = new Date().getFullYear();
  // Real brands can advertise one vintage ahead; unknown names cannot.
  const maxPlausibleYear = hasBrand ? currentYear + 1 : currentYear;

  const anyYearMatch = name.match(/\b(19|20)\d{2}\b/);
  if (anyYearMatch) {
    const year = Number(anyYearMatch[0]);
    if (year > maxPlausibleYear) return true;
  }

  const trailingNumberMatch = name.match(/\s(\d+)\s*$/);
  if (trailingNumberMatch) {
    const trailingNumber = Number(trailingNumberMatch[1]);
    if (trailingNumber >= 1900) {
      // Trailing 4-digit year. Keep only if plausible for this brand.
      return trailingNumber > maxPlausibleYear;
    }

    // A small trailing number can be an age, a generated index, or a volume
    // without a unit. If the product has a brand, or if the number matches a
    // declared age/volume/weight, it is considered genuine.
    if (hasBrand) return false;
    if (product.age_years === trailingNumber) return false;
    if (product.vintage === trailingNumber) return false;
    if (product.variants?.some((v) => v.volume_ml === trailingNumber)) return false;
    if (product.variants?.some((v) => v.weight_g === trailingNumber)) return false;

    return true;
  }

  return false;
}
