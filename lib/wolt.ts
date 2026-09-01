/**
 * Wolt link validation and helpers.
 * Mode "liens directs" : chaque variante pointe vers sa fiche Wolt.
 * Pas d'appel API, pas de scraping.
 */

const ALLOWED_WOLT_DOMAINS = [
  "wolt.com",
  "www.wolt.com",
  "wolt.co.il",
  "www.wolt.co.il",
];

function isWoltHost(host: string): boolean {
  const lower = host.toLowerCase();
  return ALLOWED_WOLT_DOMAINS.includes(lower) || lower.endsWith(".wolt.com");
}

export function isValidWoltUrl(value: string): boolean {
  const trimmed = value.trim();
  if (!trimmed) return false;
  try {
    const url = new URL(trimmed);
    if (url.protocol !== "https:") return false;
    if (url.username || url.password) return false;
    return isWoltHost(url.hostname);
  } catch {
    return false;
  }
}

export function normalizeWoltUrl(value: string): string | null {
  const trimmed = value.trim();
  if (!trimmed) return null;
  if (!isValidWoltUrl(trimmed)) return null;
  // Minimal, no query cleaning: keep the exact configured URL.
  return trimmed;
}

export function woltButtonLabel(variantUrl?: string | null, storeUrl?: string | null): string | null {
  if (variantUrl && isValidWoltUrl(variantUrl)) return "Commander sur Wolt";
  if (storeUrl && isValidWoltUrl(storeUrl)) return "Voir notre boutique sur Wolt";
  return null;
}
