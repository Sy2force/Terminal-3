import "server-only";
import { createClient } from "@/lib/supabase/server";
import {
  DEFAULT_BUSINESS_CONFIG,
  type BusinessConfig,
  type OpeningHoursEntry,
} from "@/lib/config";
import { isDemoMode } from "@/lib/demo-mode";

/**
 * Maps `site_settings.key` rows onto the `BusinessConfig` shape. Any key
 * missing from the DB falls back to `DEFAULT_BUSINESS_CONFIG` so the site
 * never breaks — but it never invents data, only shows an empty/neutral
 * placeholder until the owner fills it in via /admin.
 */
const SETTINGS_KEYS = [
  "STORE_NAME",
  "STORE_PHONE",
  "STORE_WHATSAPP",
  "STORE_ADDRESS",
  "STORE_LATITUDE",
  "STORE_LONGITUDE",
  "INSTAGRAM_URL",
  "FACEBOOK_URL",
  "OPENING_HOURS",
  "LOGO_URL",
] as const;

export interface SalmonGalleryImage {
  url: string;
  alt?: string;
}

export interface SiteSettings extends BusinessConfig {
  CLUB_WELCOME_DISCOUNT_PERCENT: number;
  /** Short promotional line, edited weekly by the owner via /admin/store. */
  WEEKLY_PROMO_MESSAGE: string | null;
  /** Up to 10 salmon-platter photos featured on the homepage. */
  SALMON_GALLERY_IMAGES: SalmonGalleryImage[];
  /** Delivery fee in agorot (1000 = 10 ILS). */
  DELIVERY_FEE_AGOROT: number;
}

let cache: { value: SiteSettings; expiresAt: number } | null = null;
const CACHE_TTL_MS = 30_000;

export async function getSiteSettings(): Promise<SiteSettings> {
  if (isDemoMode()) {
    return {
      ...DEFAULT_BUSINESS_CONFIG,
      CLUB_WELCOME_DISCOUNT_PERCENT: 20,
      WEEKLY_PROMO_MESSAGE: null,
      SALMON_GALLERY_IMAGES: [],
      DELIVERY_FEE_AGOROT: 1000,
    };
  }

  if (cache && cache.expiresAt > Date.now()) {
    return cache.value;
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("site_settings")
    .select("key, value")
    .in("key", [
      ...SETTINGS_KEYS,
      "CLUB_WELCOME_DISCOUNT_PERCENT",
      "WEEKLY_PROMO_MESSAGE",
      "SALMON_GALLERY_IMAGES",
      "DELIVERY_FEE_AGOROT",
    ]);

  const overrides: Record<string, unknown> = {};
  if (!error && data) {
    for (const row of data) {
      overrides[row.key] = row.value;
    }
  }

  const merged: SiteSettings = {
    ...DEFAULT_BUSINESS_CONFIG,
    ...(overrides as Partial<BusinessConfig>),
    OPENING_HOURS:
      (overrides.OPENING_HOURS as OpeningHoursEntry[] | undefined) ??
      DEFAULT_BUSINESS_CONFIG.OPENING_HOURS,
    CLUB_WELCOME_DISCOUNT_PERCENT:
      (overrides.CLUB_WELCOME_DISCOUNT_PERCENT as number | undefined) ?? 20,
    WEEKLY_PROMO_MESSAGE:
      (overrides.WEEKLY_PROMO_MESSAGE as string | undefined) ?? null,
    SALMON_GALLERY_IMAGES:
      (overrides.SALMON_GALLERY_IMAGES as SalmonGalleryImage[] | undefined) ??
      [],
    DELIVERY_FEE_AGOROT:
      (overrides.DELIVERY_FEE_AGOROT as number | undefined) ?? 1000,
  };

  cache = { value: merged, expiresAt: Date.now() + CACHE_TTL_MS };
  return merged;
}

/**
 * Whether the storefront is currently accepting orders. Deliberately
 * uncached (unlike `getSiteSettings`) so the admin on/off toggle takes
 * effect immediately — browsing the catalog always stays available;
 * only cart/checkout are gated by this flag.
 */
export async function isStoreOnline(): Promise<boolean> {
  if (isDemoMode()) {
    return true;
  }
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("site_settings")
    .select("value")
    .eq("key", "STORE_ONLINE")
    .maybeSingle();

  if (error || !data) return true;
  return data.value !== false;
}
