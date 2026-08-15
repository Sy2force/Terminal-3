# Terminal 3 — Digital Platform

Premium digital platform for **Terminal 3** (Agripas 105, Jerusalem): a wine
cellar / gourmet delicatessen experience, not a generic e-commerce template.

This is **Phase 1** of the build: Foundation + Core Public Site. See
[Project status](#project-status) below for what's implemented vs. what
remains for future phases.

## Stack

- **Next.js App Router** (TypeScript strict) + Tailwind CSS v4
- **Supabase** (PostgreSQL, Auth, Storage) — via `@supabase/ssr`
- **Framer Motion** (installed, ready for future interactive sections)
- **Zod** (installed, ready for future form/server-action validation)

## Getting started

1. Copy `.env.example` to `.env.local` and fill in your Supabase project
   credentials:

   ```bash
   cp .env.example .env.local
   ```

2. Create a Supabase project, then run the migrations in order against it
   (SQL editor, or `psql`, or the Supabase CLI):

   ```
   db/migrations/0001_init.sql                      -- schema (24 tables, integer-agorot pricing)
   db/migrations/0002_rls.sql                       -- Row Level Security policies
   db/migrations/0003_checkout.sql                  -- checkout columns + auto profile-creation trigger
   db/migrations/0004_first_purchase_discount.sql   -- order discount columns + weekly promo/gallery settings
   db/migrations/0005_categories_upgrade.sql        -- category CMS fields
   db/migrations/0006_products_upgrade.sql          -- product/variant/media CMS fields
   db/migrations/0007_storage_buckets.sql           -- Supabase Storage buckets
   db/migrations/0008_platform_upgrade.sql          -- platform-wide upgrades
   db/migrations/0009_promotion_quantity_decrement.sql
   db/migrations/0010_promotion_auto_status.sql
   db/migrations/0011_wine_catalog_fields.sql       -- wine_type/region/country/grapes/rating/badge for /vins
   db/seed/seed.sql                                 -- branch, categories, STORE_ONLINE flag, Sarfati + charcuterie seed data
   db/seed/seed_wines.sql                           -- 8 realistic demo wines for the /vins catalog (run after 0011)
   ```

3. In the Supabase Auth settings, enable **Email OTP** sign-in (the site uses
   a 6-digit code, not magic-link URLs, so no redirect URL configuration is
   required).

4. Grant yourself an admin role so you can access `/admin/store`:

   ```sql
   insert into admin_roles (user_id, role)
   values ('<your-auth-user-id>', 'OWNER');
   ```

5. Install dependencies and run the dev server:

   ```bash
   npm install
   npm run dev
   ```

6. Open [http://localhost:3000](http://localhost:3000).

## Replacing the placeholder logo

The Terminal 3 logo is rendered in exactly one place: `components/brand/logo.tsx`,
which reads `settings.LOGO_URL`. To swap the placeholder:

- **No redeploy needed:** update the `LOGO_URL` row in the `site_settings` table, or
- Replace `public/logo-placeholder.svg` with the real asset (same filename), or
- Change `DEFAULT_BUSINESS_CONFIG.LOGO_URL` in `lib/config.ts`.

No layout code needs to change in any case.

## Business configuration

All business facts (`STORE_NAME`, `STORE_PHONE`, `STORE_WHATSAPP`,
`STORE_ADDRESS`, coordinates, social URLs, opening hours, logo, club
discount %) live in the `site_settings` table (see `lib/settings.ts` and
`lib/config.ts`). None of these values are invented — placeholders are `null`
or clearly generic until the real data is entered.

## Project structure

```
app/                  Routes (Server Components by default)
components/
  brand/              Logo, social icons — the only place the logo renders
  commerce/           Product/promotion cards, countdown, contact actions
  home/               Home page sections (hero, today, limited offer, ...)
  layout/             Navbar, mobile menu, footer
  ui/                 Generic UI primitives (empty states, etc.)
lib/
  data/               Server-only data-access functions (catalog, promotions, content)
  supabase/           Browser + server Supabase clients
  settings.ts         Merges site_settings DB rows with safe defaults
  config.ts           Static business-config defaults & types
  money.ts            Integer-agorot formatting helpers (no float currency math)
db/
  migrations/         SQL schema + RLS policies
  seed/                Seed data (only real, spec-provided data)
types/database.ts     Hand-written Supabase types (Database generic)
```

## Project status

**Implemented:**

- Full Postgres schema (24 tables + checkout columns) covering catalog,
  promotions, orders, age verification, content, club, admin/RBAC, audit,
  site settings.
- Row Level Security on every table (public read for published/active
  content, owner-only for private data, staff/role-gated for admin writes).
- Public pages: Home (7 sections + salmon gallery), Categories (index +
  per-category catalog), New Arrivals, Promotions, Inspirations (index +
  article), Product detail — each with its own distinct layout/composition
  rather than a repeated template.
- **Category browsing**: every category tile (`/categories`,
  `/categories/[slug]`) shows the full published catalog for that category
  (not just new arrivals), with cross-category navigation.
- Promotion engine read path: promotions are only shown "active" when the
  **database clock** confirms `status = 'active'` and `start_at <= now() <
  end_at` — never the browser clock. No fake countdowns/urgency.
- **Customer accounts**: email one-time-code sign-in (Supabase Auth), no
  passwords. A `profiles` row is auto-created via a DB trigger on first
  sign-in.
- **Cart → Checkout → Order** (no online payment, Wolt-style "browse and
  order, pay on pickup/delivery"):
  - Cart is client-side (localStorage), for browsing without an account.
  - Checkout requires a logged-in account, asks pickup vs. delivery
    (address only required for delivery), name, phone, optional notes.
  - Age-restricted items require a self-declaration checkbox ("I am 18+")
    before the order can be submitted; real verification (teuda check) is
    still done in person by staff/the delivery person and tracked in the
    `age_verifications` table — the checkbox is not treated as proof.
  - **Every price is re-fetched server-side** from `product_variants` (and
    matched against any currently-active promotion) at order-submission
    time — a manipulated client price can never change what's billed.
  - Orders are split into `NON_RESTRICTED` / `AGE_RESTRICTED` fulfillment
    groups exactly as the schema models it; no payment gateway is called
    anywhere.
  - Order confirmation page + `/account/orders` history.
  - **First-purchase discount**: automatically applied server-side (never
    client-computed) the first time a customer places an order — reusing
    the existing `discount_entitlements`/`CLUB_WELCOME_DISCOUNT_PERCENT`
    schema. Shown as a preview banner on `/cart` and `/checkout` before the
    order is placed, and itemized (`orders.discount_agorot` /
    `discount_label`) on the confirmation page and order history.
- **Admin on/off switch** (`/admin/store`, gated to `OWNER`/`MANAGER` roles
  via `admin_roles`): toggles `site_settings.STORE_ONLINE`. When off, the
  catalog stays fully browsable (per product decision) but a banner appears
  and cart/checkout are disabled — enforced both in the UI and again
  server-side in the order-submission action.
- **Weekly promo banner**: `site_settings.WEEKLY_PROMO_MESSAGE`, editable
  from `/admin/store` (no redeploy), shown site-wide under the navbar and
  linking to `/promotions` — meant to be updated by the owner every week.
- **Salmon platter gallery**: homepage section driven by
  `site_settings.SALMON_GALLERY_IMAGES` (up to 10 photo URLs), editable
  from `/admin/store`. Renders nothing until real photos are configured —
  see "Adding the salmon platter photos" below.
- Seed data: Terminal 3 branch, categories, `STORE_ONLINE = true`, full
  Sarfati (smoked fish) catalog with the exact prices supplied, charcuterie
  placeholders using canonical Hebrew names, other-fish variants with
  `NULL` prices where no verified price was supplied.
- Luxury design system (Obsidian/Graphite/Champagne Gold palette, serif +
  sans typography, RTL-ready CSS variables), `prefers-reduced-motion`
  support, accessible focus states.

**Not yet implemented (future phases):**

- Club membership signup UI (the WELCOME20 first-purchase discount itself
  is implemented and auto-applied at checkout — see above; a dedicated
  `/club` member area is still missing).
- Staff order queue / kitchen-display-style dashboard to move orders through
  `submitted → confirmed → ready → completed` and to record age-verification
  outcomes (the `age_verifications` and `order_fulfillment_groups` tables
  already model this — only the staff UI is missing).
- Full admin dashboard (products, promotions, content CMS, inventory, RBAC
  UI) beyond the single `/admin/store` on/off toggle.
- Promotion `remaining_quantity` decrement on order (quantity-limited flash
  offers currently don't reduce their counter automatically — needs an
  atomic, race-safe update, intentionally left out of this pass).
- 3D/immersive hero, analytics event pipeline, i18n dictionaries, E2E tests.
- Scheduled job to auto-activate/expire promotions (currently enforced at
  query time via server-clock filtering, which is safe but a cron job is
  still recommended for the homepage "Aujourd'hui" freshness at scale).

## Adding the salmon platter photos

The homepage salmon gallery (`components/home/salmon-gallery-section.tsx`)
reads image URLs from `site_settings.SALMON_GALLERY_IMAGES` — it renders
nothing until that list is populated, so there's no placeholder imagery
pretending to be real product photography.

To add the 10 platter photos:

1. Upload them to a Supabase Storage **public** bucket (e.g. `media`), or
   host them anywhere reachable over HTTPS.
2. Go to `/admin/store` (requires an `OWNER`/`MANAGER` role — see setup
   step 4 above) and paste the 10 URLs, one per line, into "Galerie
   plateaux de saumon", then save.

The gallery appears immediately (revalidated on save), no redeploy needed.

## Monetary values

All prices are stored as **integer agorot** (1 ILS = 100 agorot) — see the
`regular_price_agorot` / `promo_price_agorot` columns and `lib/money.ts`.
Never introduce floating-point currency math.
