import { describe, it, expect } from "vitest";
import {
  buildMediaStoragePath,
  imageMimeMatches,
  sniffImageMime,
  isMediaEntityType,
  isMediaRole,
  UNCLASSIFIED_PREFIX,
} from "./media-upload";

describe("buildMediaStoragePath", () => {
  it("builds a deterministic product cover path", () => {
    const { path, classified } = buildMediaStoragePath({
      entityType: "product",
      entityId: "abc-123",
      role: "cover",
      mediaId: "m1",
      extension: "webp",
    });
    expect(classified).toBe(true);
    expect(path).toBe("products/abc-123/cover/m1.webp");
  });

  it("routes pages to pages/{id}/{role}/", () => {
    const { path } = buildMediaStoragePath({
      entityType: "page",
      entityId: "home",
      role: "hero_desktop",
      mediaId: "m2",
      extension: "jpg",
    });
    expect(path).toBe("pages/home/hero_desktop/m2.jpg");
  });

  it("sends ambiguous destinations to the à-classer queue", () => {
    for (const input of [
      { entityType: "product", entityId: null, role: "cover" },
      { entityType: "unknown", entityId: "x", role: "cover" },
      { entityType: "product", entityId: "x", role: "not-a-role" },
      { entityType: null, entityId: null, role: null },
    ]) {
      const { path, classified } = buildMediaStoragePath({
        ...input,
        mediaId: "m3",
        extension: "png",
      });
      expect(classified).toBe(false);
      expect(path).toBe(`${UNCLASSIFIED_PREFIX}/m3.png`);
    }
  });

  it("sanitizes entity ids and extensions", () => {
    const { path } = buildMediaStoragePath({
      entityType: "product",
      entityId: "../evil/../../x",
      role: "cover",
      mediaId: "m4",
      extension: "php?.exe",
    });
    expect(path).not.toContain("..");
    expect(path).toBe("products/evilx/cover/m4.phpexe");
  });
});

describe("sniffImageMime", () => {
  const bytes = (arr: number[]) => new Uint8Array(arr);

  it("detects JPEG", () => {
    expect(sniffImageMime(bytes([0xff, 0xd8, 0xff, 0xe0, 0, 0, 0, 0, 0, 0, 0, 0]))).toBe("image/jpeg");
  });

  it("detects PNG", () => {
    expect(
      sniffImageMime(bytes([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0, 0, 0, 0])),
    ).toBe("image/png");
  });

  it("detects WebP (RIFF…WEBP)", () => {
    expect(
      sniffImageMime(bytes([0x52, 0x49, 0x46, 0x46, 0, 0, 0, 0, 0x57, 0x45, 0x42, 0x50])),
    ).toBe("image/webp");
  });

  it("rejects non-image content", () => {
    const script = new TextEncoder().encode("#!/bin/bash rm -rf");
    expect(sniffImageMime(script)).toBeNull();
  });

  it("rejects truncated files", () => {
    expect(sniffImageMime(bytes([0xff, 0xd8]))).toBeNull();
  });
});

describe("imageMimeMatches", () => {
  it("accepts matching types", () => {
    expect(imageMimeMatches("image/png", "image/png")).toBe(true);
  });
  it("rejects spoofed types", () => {
    expect(imageMimeMatches("image/png", "image/jpeg")).toBe(false);
    expect(imageMimeMatches("image/png", null)).toBe(false);
  });
  it("accepts octet-stream fallback when signature is a real image", () => {
    expect(imageMimeMatches("application/octet-stream", "image/png")).toBe(true);
  });
});

describe("entity/role validators", () => {
  it("validates entity types and roles", () => {
    expect(isMediaEntityType("product")).toBe(true);
    expect(isMediaEntityType("hacker")).toBe(false);
    expect(isMediaRole("hero_mobile")).toBe(true);
    expect(isMediaRole("coverx")).toBe(false);
  });
});
