const DIACRITICS = /[\u0300-\u036f]/g;

export function normalize(str: string): string {
  return str
    .toLowerCase()
    .normalize("NFD")
    .replace(DIACRITICS, "")
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export function slugify(name: string): string {
  return normalize(name)
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

export function extractVolume(name: string): string | undefined {
  const match = name.match(/\b(\d{2,4})\s?(ml|cl|l)\b/i);
  if (!match) return undefined;
  const [, amount, unit] = match;
  return `${amount}${unit.toLowerCase()}`;
}

export function extractWeight(name: string): string | undefined {
  const match = name.match(/\b(\d{2,4})\s?(g|gr|kg)\b/i);
  if (!match) return undefined;
  const [, amount, unit] = match;
  return `${amount}${unit.toLowerCase()}`;
}

export function extractVintage(name: string): string | undefined {
  const match = name.match(/\b(19|20)\d{2}\b/);
  if (!match) return undefined;
  const year = Number(match[0]);
  const currentYear = new Date().getFullYear();
  // Accept a small future margin for new vintage releases.
  if (year < 1900 || year > currentYear + 2) return undefined;
  return String(year);
}

export function extractAge(name: string): string | undefined {
  const match = name.match(/\b(\d{1,2})\s?(ans?|years?|yo|y\.o\.?)\b/i);
  if (!match) return undefined;
  return `${match[1]} ans`;
}

export function generateKeywords(result: {
  brand: string | null;
  category: string | null;
  subcategory: string | null;
  vintage?: string;
  age?: string;
  volume?: string;
  weight?: string;
}): string[] {
  const keywords = new Set<string>();
  if (result.brand) keywords.add(result.brand.toLowerCase());
  if (result.category) keywords.add(result.category.toLowerCase());
  if (result.subcategory) keywords.add(result.subcategory.toLowerCase());
  if (result.vintage) keywords.add(result.vintage);
  if (result.age) keywords.add(result.age);
  if (result.volume) keywords.add(result.volume);
  if (result.weight) keywords.add(result.weight);
  return Array.from(keywords);
}

export function generateSuggestedSku(name: string, brand: string | null, category: string | null): string {
  const parts: string[] = ["T3"];
  if (brand) parts.push(brand.slice(0, 3).toUpperCase());
  if (category) parts.push(category.slice(0, 3).toUpperCase());
  parts.push(String(Date.now()).slice(-6));
  return parts.join("-");
}
