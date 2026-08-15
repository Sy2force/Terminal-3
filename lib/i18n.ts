/**
 * i18n foundation — NOT a full multilingual system.
 *
 * The site is currently single-language (French UI copy, with Hebrew
 * product names stored as data and shown as secondary text using
 * `dir="rtl"` spans — see e.g. components/favorites/favorite-card.tsx,
 * components/catalog/product-card.tsx). There is no locale-segmented
 * routing, no translation dictionaries, and no language switcher yet.
 *
 * This module only lays the groundwork so a real implementation can be
 * added later without redesigning the data model:
 *  - `Locale` / `LOCALES` — the three languages the business needs
 *    (French default, Hebrew, English), matching the `name_fr` /
 *    `name_he` / `name_en` columns already on `products` and
 *    `categories`.
 *  - `isRtlLocale` — the one piece of logic every RTL-aware component
 *    needs, centralized here instead of re-implemented ad hoc.
 *
 * A full implementation would still need, roughly in this order:
 *  1. Decide a routing strategy (e.g. `next-intl` with `/[locale]/...`
 *     segments, or a cookie-based locale with no URL segment).
 *  2. Extract every hardcoded French UI string (buttons, labels, empty
 *     states, form validation messages) into message dictionaries.
 *  3. Add a language switcher to the Navbar/Footer.
 *  4. Audit layout mirroring for RTL (the Hebrew locale would flip the
 *     whole page direction, not just individual `name_he` spans).
 *  5. Make admin content (categories, products, site settings,
 *     inspirations) translatable per-locale where it isn't already
 *     (the `_fr` / `_he` / `_en` column pattern already covers most of
 *     the catalog).
 */

export const LOCALES = ["fr", "he", "en"] as const;
export type Locale = (typeof LOCALES)[number];
export const DEFAULT_LOCALE: Locale = "fr";

const RTL_LOCALES = new Set<Locale>(["he"]);

export function isRtlLocale(locale: Locale): boolean {
  return RTL_LOCALES.has(locale);
}
