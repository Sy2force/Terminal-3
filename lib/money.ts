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

/** Integer-safe saving percentage, rounded down (never overstate a discount). */
export function savingPercent(regularAgorot: number, promoAgorot: number): number {
  if (regularAgorot <= 0 || promoAgorot >= regularAgorot) return 0;
  return Math.floor(((regularAgorot - promoAgorot) / regularAgorot) * 100);
}

export function savingAgorot(regularAgorot: number, promoAgorot: number): number {
  return Math.max(0, regularAgorot - promoAgorot);
}
