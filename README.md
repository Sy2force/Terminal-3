# Terminal 3 — Digital Platform

Premium digital platform for **Terminal 3** (Agripas 105, Jerusalem): a wine
Cellar / gourmet delicatessen experience, not a generic e-commerce template.

## Stack

- **Next.js 16 App Router** + TypeScript strict
- **Tailwind CSS v4**
- **Supabase** (PostgreSQL, Auth, Storage) via `@supabase/ssr`
- **Zod** for server/client validation
- **Framer Motion** for motion (with `prefers-reduced-motion` support)
- **Vitest** + **Playwright** for testing
- Prices stored as **integer agorot** (`1 ILS = 100 agorot`) — see `lib/money.ts`

## Features

- Public catalog: wines, spirits, whisky, gin, tequila, arak, beers, smoked
  salmon, charcuterie, fine groceries, platters, new arrivals, promotions.
- Product pages with variants, prices, promotions, media gallery, Wolt toggle,
  food-pairing and serving notes.
- Category browsing (`/vins`, `/whisky`, `/gin`, `/arak`, `/bieres`,
  `/saumon-fume`, `/epicerie-fine`, `/plateaux`, `/categories/...`).
- Customer accounts with email OTP (Supabase Auth), order history, favorites,
  address book.
- Cart (localStorage) and checkout with pickup/delivery, age-verification, and
  server-side price/promotion recalculation.
- First-purchase discount applied server-side.
- Admin back-office: products, categories, variants, media, promotions, orders,
  clients, content CMS, site settings, weekly promo banner, salmon gallery,
  Wolt prices.
- Role-based access control (`OWNER`, `MANAGER`, `CONTENT_EDITOR`, `STAFF`,
  `ORDER_MANAGER`, `DELIVERY_MANAGER`, `COURIER`, `CUSTOMER_SUPPORT`).
- Audit logs for admin actions.
- Store open/closed toggle enforced in UI and server actions.
- Responsive layout, RTL-ready, accessible focus states.

## Project structure

```
app/                  Next.js App Router routes (public + admin + api)
components/
  admin/              Admin UI components, forms, tables, shells
  brand/              Logo and brand assets
  commerce/           Product cards, cart, checkout, promotions
  home/               Homepage sections
  layout/             Navbar, mobile menu, footer
  ui/                 Generic UI primitives
lib/
  data/               Server-only Supabase data access
  supabase/           Browser + server Supabase clients
  admin/              Auth, permissions, audit helpers
  settings.ts         Merge site_settings DB rows with safe defaults
  config.ts           Static business-config defaults and types
  money.ts            Integer-agorot formatting helpers
db/
  migrations/         SQL schema + RLS policies
  seed/               Seed data
tests/
  e2e/                Playwright E2E tests
  *.test.ts           Vitest unit tests
```

## Getting started

1. Copy `.env.example` to `.env.local` and fill in the real values:

   ```bash
   cp .env.example .env.local
   ```

   Required:

   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`
   - `ADMIN_PASSWORD` (min 8 chars)
   - `ADMIN_SESSION_SECRET` (min 32 chars)

   Optional:

   - `NEXT_PUBLIC_SITE_URL` (defaults to `http://localhost:3000`)
   - `CRON_SECRET` for `/api/cron/*`

2. Create a Supabase project and run the migrations in order:

   ```bash
   psql $DATABASE_URL -f db/migrations/0001_init.sql
   # ... continue through 0035_category_covers_and_hierarchy.sql
   ```

   Or apply them via the Supabase SQL Editor / CLI.

3. Seed the database:

   ```bash
   psql $DATABASE_URL -f db/seed/seed.sql
   ```

4. In Supabase Auth, enable **Email OTP** sign-in (6-digit code).

5. Install dependencies and start the dev server:

   ```bash
   npm install
   npm run dev
   ```

6. Open [http://localhost:3000](http://localhost:3000).

## Admin access

### Option A — Supabase role (recommended for staff)

After signing up through the normal auth flow, grant a role in the database:

```sql
insert into admin_roles (user_id, role)
values ('<your-auth-user-id>', 'OWNER');
```

Then visit `/admin`.

### Option B — Fallback password (emergency / first setup)

With `ADMIN_PASSWORD` and `ADMIN_SESSION_SECRET` configured in `.env.local`,
visit `/admin/login`, enter `ADMIN_PASSWORD`, and the cookie will grant an
`OWNER` session. The cookie is `httpOnly`, `SameSite=Strict`, and signed with
`ADMIN_SESSION_SECRET`.

## Business configuration

All business facts live in `site_settings` (see `lib/settings.ts` and
`lib/config.ts`):

- `STORE_NAME`, `STORE_PHONE`, `STORE_WHATSAPP`, `STORE_ADDRESS`
- Coordinates, social URLs, opening hours
- `LOGO_URL`
- `STORE_ONLINE` toggle
- `WEEKLY_PROMO_MESSAGE`
- `SALMON_GALLERY_IMAGES`
- Club discount percentage

These can be edited from `/admin/store` or `/admin/settings` without a
redeploy.

## Salmon platter gallery

`components/home/salmon-gallery-section.tsx` reads
`site_settings.SALMON_GALLERY_IMAGES`. The public images are also committed in
`public/images/salmon-plateaux/`. To add more:

1. Upload to Supabase Storage or any HTTPS host.
2. Paste URLs (one per line) in `/admin/store` under "Galerie plateaux de
   saumon".
3. Save — the homepage revalidates automatically.

## Verification commands

```bash
npm run lint          # ESLint
npx tsc --noEmit      # TypeScript strict
npm run test:unit     # Vitest
npm run test:e2e      # Playwright
npm run build         # Production build
```

All checks must pass before deployment.

## Project status

Implemented and tested:

- Full schema (24+ tables), RLS policies, audit logs.
- Public site, catalog, product detail, cart, checkout, account area.
- Admin back-office with CRUD for products, categories, media, promotions,
  orders, clients, content, settings, weekly banner, salmon gallery.
- Server-side validation, price recalculation, promotion logic, age
  verification, first-purchase discount.
- E2E smoke tests for admin login, dashboard, auth gates, cart, catalog
  routes.

What remains for production:

- Real Supabase project and credentials in `.env.local`.
- Strong `ADMIN_PASSWORD` and `ADMIN_SESSION_SECRET`.
- Real product/category data, prices, stock, and photos (via `/admin` or seed).
- Wolt integration keys and webhook configuration.
- Newsletter / contact: wire to an email provider (Resend, Brevo, SendGrid) or
  persist messages in the database.
- Production DB indexes / query tuning for large catalogs.
- SSL, custom domain, and Vercel environment variables.

## Money

All prices are stored as **integer agorot** (`1 ILS = 100 agorot`). See
`regular_price_agorot`, `compare_at_price_agorot`, `total_agorot`, and
`lib/money.ts`. Never use floating-point currency math.

## License

Internal — Terminal 3.
