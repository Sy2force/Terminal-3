import { describe, it, expect } from "vitest";
import { z } from "zod";

/**
 * These tests document and enforce the shape of the B2B server actions
 * (0043_business_b2b.sql). They intentionally re-declare the Zod schemas
 * used by the server actions so the tests do not depend on `next/headers`
 * (which would blow up in a plain vitest environment).
 *
 * If you change a schema in `app/compte/bar/actions.ts` or
 * `app/demande-produit/actions.ts`, mirror the change here.
 */

const israeliPhone = /^(\+972|0)5\d([-\s]?\d){7}$/;

const barProfileSchema = z.object({
  businessName: z.string().trim().min(1).max(200),
  legalName: z.string().trim().max(200).optional(),
  registrationNumber: z.string().trim().max(50).optional(),
  contactFirstName: z.string().trim().min(1).max(100),
  contactLastName: z.string().trim().min(1).max(100),
  contactPhone: z.string().trim().regex(israeliPhone),
});

describe("bar profile validation", () => {
  it("accepts a well-formed profile", () => {
    const result = barProfileSchema.safeParse({
      businessName: "Le Comptoir",
      contactFirstName: "David",
      contactLastName: "Levi",
      contactPhone: "050-1234567",
    });
    expect(result.success).toBe(true);
  });

  it("rejects a missing business name", () => {
    const result = barProfileSchema.safeParse({
      businessName: "",
      contactFirstName: "David",
      contactLastName: "Levi",
      contactPhone: "050-1234567",
    });
    expect(result.success).toBe(false);
  });

  it("rejects a non-Israeli phone", () => {
    const result = barProfileSchema.safeParse({
      businessName: "Le Comptoir",
      contactFirstName: "David",
      contactLastName: "Levi",
      contactPhone: "+33 6 12 34 56 78",
    });
    expect(result.success).toBe(false);
  });
});

const outOfCatalogSchema = z.object({
  kind: z.literal("out_of_catalog"),
  requestedType: z.string().trim().min(1).max(50),
  requestedBrand: z.string().trim().min(1).max(200),
  requestedName: z.string().trim().min(1).max(300),
  requestedVolumeMl: z.number().int().min(50).max(20_000).optional(),
  requestedQuantity: z.number().int().min(1).max(1000).default(1),
  requestedBudgetAgorot: z.number().int().min(0).max(10_000_000).nullish(),
});

describe("out-of-catalog product request", () => {
  it("accepts a minimal request", () => {
    const parsed = outOfCatalogSchema.safeParse({
      kind: "out_of_catalog",
      requestedType: "wine",
      requestedBrand: "Château Margaux",
      requestedName: "Château Margaux 2015",
      requestedQuantity: 6,
    });
    expect(parsed.success).toBe(true);
  });

  it("rejects a zero quantity", () => {
    const parsed = outOfCatalogSchema.safeParse({
      kind: "out_of_catalog",
      requestedType: "wine",
      requestedBrand: "Test",
      requestedName: "Test",
      requestedQuantity: 0,
    });
    expect(parsed.success).toBe(false);
  });

  it("caps quantity at 1000 to prevent runaway inputs", () => {
    const parsed = outOfCatalogSchema.safeParse({
      kind: "out_of_catalog",
      requestedType: "wine",
      requestedBrand: "Test",
      requestedName: "Test",
      requestedQuantity: 5000,
    });
    expect(parsed.success).toBe(false);
  });
});

const inCatalogSchema = z.object({
  kind: z.literal("in_catalog"),
  productId: z.string().uuid(),
  variantId: z.string().uuid().optional(),
  requestedQuantity: z.number().int().min(1).max(1000).default(1),
});

describe("in-catalog product request", () => {
  it("requires a real UUID productId", () => {
    const parsed = inCatalogSchema.safeParse({
      kind: "in_catalog",
      productId: "not-a-uuid",
      requestedQuantity: 1,
    });
    expect(parsed.success).toBe(false);
  });

  it("accepts a valid UUID", () => {
    const parsed = inCatalogSchema.safeParse({
      kind: "in_catalog",
      productId: "11111111-1111-4111-8111-111111111111",
      requestedQuantity: 3,
    });
    expect(parsed.success).toBe(true);
  });
});
