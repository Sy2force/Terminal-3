/**
 * Media upload helpers — pure functions, unit-testable without Supabase.
 *
 * - `sniffImageMime` verifies the real file type from magic bytes instead of
 *   trusting the client-declared MIME/extension.
 * - `buildMediaStoragePath` produces deterministic Storage paths from the
 *   target entity (never guessed from the original filename). Uploads whose
 *   destination is ambiguous land in the `a-classer` queue.
 */

export const MEDIA_ENTITY_TYPES = [
  "product",
  "category",
  "page",
  "promotion",
  "event",
  "brand",
  "site",
] as const;
export type MediaEntityType = (typeof MEDIA_ENTITY_TYPES)[number];

export const MEDIA_ROLES = [
  "cover",
  "gallery",
  "hero_desktop",
  "hero_mobile",
  "background",
  "logo",
  "thumbnail",
  "og_image",
] as const;
export type MediaRole = (typeof MEDIA_ROLES)[number];

export const MEDIA_STATUSES = ["uploading", "ready", "failed", "archived"] as const;
export type MediaStatus = (typeof MEDIA_STATUSES)[number];

export const UNCLASSIFIED_PREFIX = "a-classer";

const ENTITY_FOLDER: Record<MediaEntityType, string> = {
  product: "products",
  category: "categories",
  page: "pages",
  promotion: "promotions",
  event: "events",
  brand: "brand",
  site: "site",
};

export function isMediaEntityType(v: string): v is MediaEntityType {
  return (MEDIA_ENTITY_TYPES as readonly string[]).includes(v);
}

export function isMediaRole(v: string): v is MediaRole {
  return (MEDIA_ROLES as readonly string[]).includes(v);
}

/**
 * Deterministic storage path.
 * - Known destination: `{entities}/{entity_id}/{role}/{mediaId}.{ext}`
 * - Missing or ambiguous destination: `a-classer/{mediaId}.{ext}`
 * The original filename is never used to route the file.
 */
export function buildMediaStoragePath(input: {
  entityType?: string | null;
  entityId?: string | null;
  role?: string | null;
  mediaId: string;
  extension: string;
}): { path: string; classified: boolean } {
  const ext = input.extension.toLowerCase().replace(/[^a-z0-9]/g, "") || "bin";

  const entityOk =
    input.entityType != null &&
    isMediaEntityType(input.entityType) &&
    typeof input.entityId === "string" &&
    input.entityId.length > 0;
  const roleOk = input.role != null && isMediaRole(input.role);

  if (!entityOk || !roleOk) {
    return { path: `${UNCLASSIFIED_PREFIX}/${input.mediaId}.${ext}`, classified: false };
  }

  const folder = ENTITY_FOLDER[input.entityType as MediaEntityType];
  const entityId = input.entityId!.replace(/[^a-zA-Z0-9_-]/g, "");
  return {
    path: `${folder}/${entityId}/${input.role}/${input.mediaId}.${ext}`,
    classified: true,
  };
}

/**
 * Returns the real image MIME type from magic bytes, or null when the
 * signature is unknown/not an image we accept.
 */
export function sniffImageMime(bytes: Uint8Array): string | null {
  if (bytes.length < 12) return null;
  // JPEG: FF D8 FF
  if (bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff) return "image/jpeg";
  // PNG: 89 50 4E 47 0D 0A 1A 0A
  if (bytes[0] === 0x89 && bytes[1] === 0x50 && bytes[2] === 0x4e && bytes[3] === 0x47)
    return "image/png";
  // GIF: "GIF8"
  if (bytes[0] === 0x47 && bytes[1] === 0x49 && bytes[2] === 0x46 && bytes[3] === 0x38)
    return "image/gif";
  // WebP: "RIFF"...."WEBP"
  if (
    bytes[0] === 0x52 && bytes[1] === 0x49 && bytes[2] === 0x46 && bytes[3] === 0x46 &&
    bytes[8] === 0x57 && bytes[9] === 0x45 && bytes[10] === 0x42 && bytes[11] === 0x50
  )
    return "image/webp";
  // AVIF / HEIC: ISO-BMFF "ftyp" box with a known brand
  if (bytes[4] === 0x66 && bytes[5] === 0x74 && bytes[6] === 0x79 && bytes[7] === 0x70) {
    const brand = String.fromCharCode(bytes[8], bytes[9], bytes[10], bytes[11]);
    if (brand === "avif" || brand === "avis") return "image/avif";
    if (brand === "heic" || brand === "heix") return "image/heic";
  }
  return null;
}

/**
 * Whether a declared image MIME is consistent with the sniffed signature.
 * `image/heic` is allowed through when the brand matches even though browsers
 * rarely declare it.
 */
export function imageMimeMatches(declared: string, sniffed: string | null): boolean {
  if (!sniffed) return false;
  if (declared === sniffed) return true;
  // Browsers often report jpeg for jpg variants and generic octet-stream.
  if (declared === "application/octet-stream") return true;
  return false;
}
