import { describe, it, expect } from "vitest";
import { formatAgorot, formatUnitPrice, savingPercent, savingAgorot } from "./money";

describe("formatAgorot (ILS)", () => {
  it("formats whole shekels without decimals", () => {
    const out = formatAgorot(18600);
    expect(out).toContain("186");
    expect(out).toContain("₪");
  });

  it("formats agorot with decimals", () => {
    const out = formatAgorot(18650);
    expect(out).toContain("186.50");
    expect(out).toContain("₪");
  });

  it("returns an empty string for null/undefined", () => {
    expect(formatAgorot(null)).toBe("");
    expect(formatAgorot(undefined)).toBe("");
  });

  it("formats zero", () => {
    expect(formatAgorot(0)).toContain("0");
  });
});

describe("formatUnitPrice", () => {
  it("renders per-weight units", () => {
    expect(formatUnitPrice(2900, "PER_100G")).toContain("/ 100 g");
    expect(formatUnitPrice(8900, "PER_KG")).toContain("/ kg");
  });

  it("renders package and from pricing", () => {
    expect(formatUnitPrice(4500, "PACKAGE")).toContain("le paquet");
    expect(formatUnitPrice(14900, "FROM")).toContain("À partir de");
  });

  it("defaults to plain price for FIXED/undefined", () => {
    expect(formatUnitPrice(2900, "FIXED")).toBe(formatAgorot(2900));
    expect(formatUnitPrice(2900)).toBe(formatAgorot(2900));
  });
});

describe("savings helpers", () => {
  it("computes an integer-safe percent", () => {
    expect(savingPercent(10000, 7500)).toBe(25);
  });

  it("never overstates a discount", () => {
    expect(savingPercent(9999, 1)).toBeLessThanOrEqual(99);
    expect(savingPercent(0, 100)).toBe(0);
    expect(savingPercent(100, 200)).toBe(0);
  });

  it("computes absolute savings", () => {
    expect(savingAgorot(1000, 400)).toBe(600);
    expect(savingAgorot(400, 1000)).toBe(0);
  });
});
