/**
 * All prices are stored/passed as integer agorot (1 ILS = 100 agorot) to
 * avoid floating point currency math. These helpers only ever format for
 * display — they never perform monetary calculations with floats.
 */

export function agorotToILS(agorot: number): number {
  return agorot / 100;
}

export function formatAgorot(
  agorot: number | null | undefined,
  locale: string = "he-IL",
): string {
  if (agorot === null || agorot === undefined) return "";
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency: "ILS",
    minimumFractionDigits: agorot % 100 === 0 ? 0 : 2,
    maximumFractionDigits: 2,
  }).format(agorotToILS(agorot));
}

/**
 * Formats a variant price together with its unit so it's never ambiguous
 * how the number should be read — "29 ₪ / 100 g", "89 ₪ / kg", "45 ₪ le
 * paquet", "À partir de 149 ₪". `null`/`"FIXED"` (the default for every
 * existing wine/spirit variant) renders exactly like `formatAgorot` did
 * before this helper existed.
 */
export function formatUnitPrice(
  agorot: number | null | undefined,
  pricingUnit?: "FIXED" | "PACKAGE" | "PER_100G" | "PER_KG" | "FROM" | null,
): string {
  if (agorot === null || agorot === undefined) return "";
  const price = formatAgorot(agorot);
  switch (pricingUnit) {
    case "PER_100G":
      return `${price} / 100 g`;
    case "PER_KG":
      return `${price} / kg`;
    case "PACKAGE":
      return `${price} le paquet`;
    case "FROM":
      return `À partir de ${price}`;
    default:
      return price;
  }
}

/** Integer-safe saving percentage, rounded down (never overstate a discount). */
export function savingPercent(regularAgorot: number, promoAgorot: number): number {
  if (regularAgorot <= 0 || promoAgorot >= regularAgorot) return 0;
  return Math.floor(((regularAgorot - promoAgorot) / regularAgorot) * 100);
}

export function savingAgorot(regularAgorot: number, promoAgorot: number): number {
  return Math.max(0, regularAgorot - promoAgorot);
}
