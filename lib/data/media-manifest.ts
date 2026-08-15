import { promises as fs } from "fs";
import path from "path";

export type MediaUsage =
  | "product-main"
  | "gallery"
  | "hero"
  | "hero-mobile"
  | "cover"
  | "carousel"
  | "promotion"
  | "lifestyle"
  | "logo"
  | "favicon"
  | "open-graph"
  | "placeholder";

export type MediaConfidence = "certain" | "probable" | "uncertain";
export type MediaStatus = "pending" | "approved" | "published" | "uncertain";

export interface MediaManifestImage {
  order: number;
  file: string;
  originalFile: string;
  productSlug?: string | null;
  brand?: string | null;
  category?: string | null;
  productName?: string | null;
  usage: MediaUsage;
  altFr: string;
  altHe?: string | null;
  status: MediaStatus;
  confidence?: MediaConfidence;
  width?: number | null;
  height?: number | null;
  fileSizeBytes?: number | null;
  format?: string | null;
  uploadedBy?: string | null;
  importedAt: string;
  notes?: string | null;
}

export interface MediaManifestEntry {
  page: string;
  section: string;
  seriesIndex?: number;
  images: MediaManifestImage[];
}

export interface MediaNamingRules {
  case: "lowercase";
  allowedCharacters: string;
  noSpaces: boolean;
  noAccents: boolean;
  noSpecialCharacters: boolean;
  photoExtension: string;
  logoExtension: string;
  transparentLogo: string;
  structure: string;
  examples: string[];
}

export interface MediaFormatPreset {
  width?: number;
  height?: number;
  minHeight?: number;
  format: string;
}

export interface MediaManifest {
  version: string;
  lastUpdated: string;
  namingRules: MediaNamingRules;
  formatPresets: Record<string, MediaFormatPreset>;
  manifest: MediaManifestEntry[];
}

const MANIFEST_PATH = path.join(process.cwd(), "content", "media-manifest.json");

export async function loadMediaManifest(): Promise<MediaManifest> {
  const raw = await fs.readFile(MANIFEST_PATH, "utf-8");
  return JSON.parse(raw) as MediaManifest;
}

export async function saveMediaManifest(manifest: MediaManifest): Promise<void> {
  manifest.lastUpdated = new Date().toISOString();
  await fs.writeFile(MANIFEST_PATH, JSON.stringify(manifest, null, 2), "utf-8");
}

export async function appendToManifest(
  entries: MediaManifestEntry | MediaManifestEntry[],
): Promise<MediaManifest> {
  const manifest = await loadMediaManifest();
  const toAppend = Array.isArray(entries) ? entries : [entries];
  manifest.manifest.push(...toAppend);
  manifest.lastUpdated = new Date().toISOString();
  await saveMediaManifest(manifest);
  return manifest;
}

export function findByPage(
  manifest: MediaManifest,
  page: string,
): MediaManifestEntry[] {
  return manifest.manifest.filter((entry) => entry.page === page);
}

export function findByProductSlug(
  manifest: MediaManifest,
  productSlug: string,
): MediaManifestImage[] {
  return manifest.manifest
    .flatMap((entry) => entry.images)
    .filter((image) => image.productSlug === productSlug);
}
