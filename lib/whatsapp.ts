/**
 * Validates and normalises WhatsApp numbers to the international format
 * expected by wa.me. Israel numbers usually start with +972.
 */

const WHATSAPP_RE = /^\+?\d{7,15}$/;

export function normalizeWhatsAppNumber(value: string): string | null {
  const trimmed = value.trim().replace(/\s|-/g, "");
  if (!trimmed) return null;
  if (!WHATSAPP_RE.test(trimmed)) return null;
  const digits = trimmed.replace(/^\+/, "");
  return `+${digits}`;
}

export function isValidWhatsAppNumber(value: string): boolean {
  return normalizeWhatsAppNumber(value) !== null;
}

export function buildWhatsAppLink(number: string, message?: string): string {
  const digits = number.replace(/^\+|\D/g, "");
  const base = `https://wa.me/${digits}`;
  return message ? `${base}?text=${encodeURIComponent(message)}` : base;
}
