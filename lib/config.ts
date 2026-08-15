/**
 * Business configuration for TERMINAL 3.
 *
 * Static defaults live here so the app runs even before `site_settings`
 * rows exist in the database. At runtime, `getSiteSettings()` (see
 * `lib/settings.ts`) merges these defaults with the live DB row so the
 * business can edit everything from /admin without a redeploy.
 *
 * IMPORTANT: never invent business data. Every value below must come
 * directly from information supplied by the business owner.
 */

export type OpeningHoursEntry = {
  day:
    | "sunday"
    | "monday"
    | "tuesday"
    | "wednesday"
    | "thursday"
    | "friday"
    | "saturday";
  /** null when closed */
  open: string | null;
  close: string | null;
};

export interface BusinessConfig {
  STORE_NAME: string;
  STORE_PHONE: string;
  STORE_WHATSAPP: string;
  STORE_ADDRESS: string;
  STORE_LATITUDE: number | null;
  STORE_LONGITUDE: number | null;
  INSTAGRAM_URL: string | null;
  FACEBOOK_URL: string | null;
  OPENING_HOURS: OpeningHoursEntry[];
  /**
   * Path/URL to the Terminal 3 logo. Replace this single value (or the
   * `site_settings.logo_url` DB row) to swap the placeholder for the real
   * logo asset — no layout code needs to change.
   */
  LOGO_URL: string;
}

/**
 * Placeholder defaults. These are safe, clearly-labeled placeholders (not
 * invented business facts) used only until the real values are entered in
 * /admin/settings or the `site_settings` table.
 */
export const DEFAULT_BUSINESS_CONFIG: BusinessConfig = {
  STORE_NAME: "Terminal 3",
  STORE_PHONE: "+972 50-000-0000",
  STORE_WHATSAPP: "+972500000000",
  STORE_ADDRESS: "Agripas 105, Jerusalem, Israel",
  STORE_LATITUDE: null,
  STORE_LONGITUDE: null,
  INSTAGRAM_URL: null,
  FACEBOOK_URL: null,
  OPENING_HOURS: [
    { day: "sunday", open: null, close: null },
    { day: "monday", open: null, close: null },
    { day: "tuesday", open: null, close: null },
    { day: "wednesday", open: null, close: null },
    { day: "thursday", open: null, close: null },
    { day: "friday", open: null, close: null },
    { day: "saturday", open: null, close: null },
  ],
  LOGO_URL: "/images/terminal-3/brand/logo/terminal-3-logo-sombre-01.png",
};

export const DEFAULT_ANNOUNCEMENT_TEXT = "Terminal 3 — Vins, spiritueux et épicerie fine casher · Livraison à Jérusalem";

export const STORE_TIMEZONE = "Asia/Jerusalem";
