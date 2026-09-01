import { describe, it, expect } from "vitest";
import { normalizeWhatsAppNumber, isValidWhatsAppNumber, buildWhatsAppLink } from "./whatsapp";

describe("whatsapp", () => {
  it("normalise un numéro israélien avec espaces et tirets", () => {
    expect(normalizeWhatsAppNumber("+972 50-123-4567")).toBe("+972501234567");
    expect(normalizeWhatsAppNumber("+972 50-123-4567")).toBe("+972501234567");
  });

  it("conserve le format si déjà net", () => {
    expect(normalizeWhatsAppNumber("+972501234567")).toBe("+972501234567");
  });

  it("rejete les formats invalides", () => {
    expect(normalizeWhatsAppNumber("abc")).toBeNull();
    expect(normalizeWhatsAppNumber("123")).toBeNull();
    expect(normalizeWhatsAppNumber("")).toBeNull();
  });

  it("construit un lien wa.me avec un message encodé", () => {
    const link = buildWhatsAppLink("+972501234567", "Bonjour Terminal 3");
    expect(link).toBe("https://wa.me/972501234567?text=Bonjour%20Terminal%203");
  });

  it("isValidWhatsAppNumber accepte seulement les numéros valides", () => {
    expect(isValidWhatsAppNumber("+972 50-123-4567")).toBe(true);
    expect(isValidWhatsAppNumber("not a number")).toBe(false);
  });
});
