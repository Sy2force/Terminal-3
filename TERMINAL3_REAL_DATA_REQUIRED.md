# Terminal 3 Real Data Required Report

**Generated**: Production Readiness Audit
**Status**: PRE-LAUNCH

---

## CRITICAL: MISSING REAL DATA

### Store Settings (P0 - BLOCKS LAUNCH)

- [ ] **STORE_PHONE** — Real phone number for orders
- [ ] **STORE_WHATSAPP** — Real WhatsApp number for contact
- [ ] **STORE_ADDRESS** — Confirmed physical address
- [ ] **STORE_LATITUDE** — GPS coordinates for delivery
- [ ] **STORE_LONGITUDE** — GPS coordinates for delivery
- [ ] **INSTAGRAM_URL** — Official Instagram handle
- [ ] **FACEBOOK_URL** — Official Facebook page
- [ ] **OPENING_HOURS** — Real operating hours for each day
- [ ] **LOGO_URL** — Real Terminal 3 logo asset

---

## PRODUCTS: MISSING INFORMATION

### Published Products Without Cover Images

Run query:
```sql
SELECT p.slug, p.name_fr, p.name_he
FROM products p
LEFT JOIN product_media pm ON p.id = pm.product_id AND pm.kind = 'COVER'
WHERE p.status = 'published' AND pm.id IS NULL;
```

**Action**: Add cover images via admin or import from photography mapping report.

---

### Products Missing Prices

Run query:
```sql
SELECT p.slug, p.name_fr, p.name_he
FROM products p
LEFT JOIN product_variants pv ON p.id = pv.product_id
WHERE p.status = 'published' AND (pv.regular_price_agorot IS NULL OR pv.regular_price_agorot = 0);
```

**Action**: Set real prices via admin.

---

### Products Missing Descriptions

Run query:
```sql
SELECT p.slug, p.name_fr
FROM products p
WHERE p.status = 'published' 
  AND (p.description_fr IS NULL OR p.description_fr = '' OR p.description_fr = 'null');
```

**Action**: Add French descriptions via admin.

---

### Alcohol Products Missing ABV

Run query:
```sql
SELECT p.slug, p.name_fr, pv.abv
FROM products p
JOIN product_variants pv ON p.id = pv.product_id
WHERE p.age_restricted = true 
  AND (pv.abv IS NULL OR pv.abv = 0);
```

**Action**: Add ABV percentage for all alcohol products.

---

### Alcohol Products Missing Volume

Run query:
```sql
SELECT p.slug, p.name_fr, pv.volume_ml
FROM products p
JOIN product_variants pv ON p.id = pv.product_id
WHERE p.age_restricted = true 
  AND (pv.volume_ml IS NULL OR pv.volume_ml = 0);
```

**Action**: Add volume in ml for all alcohol products.

---

### Products Without Category Assignment

Run query:
```sql
SELECT p.slug, p.name_fr
FROM products p
WHERE p.status = 'published' AND (p.category_id IS NULL OR p.category_id = '00000000-0000-0000-0000-000000000000');
```

**Action**: Assign correct category via admin.

---

## CATEGORIES: MISSING INFORMATION

### Categories Without Cover Images

Run query:
```sql
SELECT c.slug, c.name_fr
FROM categories c
WHERE c.is_active = true AND (c.cover_image IS NULL OR c.cover_image = '');
```

**Action**: Add category cover images.

---

### Categories Missing Descriptions

Run query:
```sql
SELECT c.slug, c.name_fr
FROM categories c
WHERE c.is_active = true AND (c.description IS NULL OR c.description = '');
```

**Action**: Add category descriptions.

---

## CONTENT: MISSING INFORMATION

### Published Articles Without Hero Images

Run query:
```sql
SELECT cp.slug, cp.title
FROM content_posts cp
WHERE cp.status = 'published' AND (cp.hero_image_url IS NULL OR cp.hero_image_url = '');
```

**Action**: Add hero images for all published inspiration articles.

---

### Articles Without Body Content

Run query:
```sql
SELECT cp.slug, cp.title
FROM content_posts cp
WHERE cp.status = 'published' AND (cp.body IS NULL OR cp.body = '' OR cp.body = 'null');
```

**Action**: Add article body content.

---

## PROMOTIONS: MISSING INFORMATION

### Active Promotions Without Product Link

Run query:
```sql
SELECT p.slug, p.title
FROM promotions p
WHERE p.status = 'active' AND (p.product_id IS NULL OR p.product_id = '00000000-0000-0000-0000-000000000000');
```

**Action**: Link promotions to products or remove product requirement.

---

### Promotions Without End Date

Run query:
```sql
SELECT p.slug, p.title, p.end_at
FROM promotions p
WHERE p.status = 'active' AND (p.end_at IS NULL OR p.end_at = '');
```

**Action**: Set end dates for all active promotions.

---

## DELIVERY CONFIGURATION

### Delivery Fee Verification

Run query:
```sql
SELECT value FROM site_settings WHERE key = 'DELIVERY_FEE_AGOROT';
```

**Expected**: 1000 (10 ILS)
**Action**: Update if incorrect via admin store settings.

---

## MEMBERSHIP CONFIGURATION

### Membership Tier Verification

Run query:
```sql
SELECT * FROM membership_tiers WHERE is_enabled = true;
```

**Expected**: At least one active tier with discount_percent set
**Action**: Configure membership tiers via admin.

---

## HOMEPAGE CMS

### Homepage Sections Configuration

Run query:
```sql
SELECT section_type, is_enabled, config FROM homepage_sections ORDER BY sort_order;
```

**Expected**: HERO, PROMOTIONS, NEW_PRODUCTS enabled with proper config
**Action**: Configure homepage sections via admin.

---

## PLACEHOLDER TEXT TO REMOVE

### UI Placeholders Found

- "Photo à venir" — Replace with real images or remove if no image
- "Rue, numéro, étage, ville" — Checkout address placeholder (acceptable)
- "Créneau souhaité, instructions particulières..." — Checkout notes placeholder (acceptable)

---

## FAKE / DEMO DATA TO REMOVE

### Mock Catalog Data

File: `lib/data/mock-catalog.ts`
- **Action**: This file is only used when `NEXT_PUBLIC_DEMO_MODE=true`. In production, ensure this env var is `false`. No deletion needed.

### Migration Seed Data

File: `db/migrations/0008_platform_upgrade.sql`
- Homepage sections seed — **KEEP** (default configuration)
- Membership tier seed — **KEEP** (default tier)
- Delivery fee seed — **KEEP** (1000 agorot default)

---

## ENVIRONMENT VARIABLES

### Required for Production

- [ ] `NEXT_PUBLIC_SUPABASE_URL` — Production Supabase URL
- [ ] `NEXT_PUBLIC_SUPABASE_ANON_KEY` — Production anon key
- [ ] `SUPABASE_SERVICE_ROLE_KEY` — Production service role key (server-only)
- [ ] `NEXT_PUBLIC_SITE_URL` — Production domain
- [ ] `NEXT_PUBLIC_DEMO_MODE` — MUST be `false` in production

---

## DATABASE MIGRATIONS

### Verify All Migrations Applied

Run: Check that all migrations from `db/migrations/` are applied in production database.

List:
- 0001_init.sql
- 0002_rls.sql
- 0003_checkout.sql
- 0004_first_purchase_discount.sql
- 0005_categories_upgrade.sql
- 0006_products_upgrade.sql
- 0007_storage_buckets.sql
- 0008_platform_upgrade.sql

---

## STORAGE BUCKETS

### Verify Buckets Exist

- [ ] `product-images` — Public bucket
- [ ] `content-images` — Public bucket
- [ ] `brand-assets` — Public bucket

**Action**: Run migration 0007_storage_buckets.sql if missing.

---

## AUDIT LOG VERIFICATION

### Verify Audit Logging Working

Check that `audit_logs` table is receiving entries for:
- Product changes
- Order changes
- Membership changes
- Age verifications
- Store settings changes

**Action**: Test admin operations and verify audit entries appear.

---

## SECURITY CHECKLIST

- [ ] RLS policies enabled on all tables
- [ ] Service role key never exposed to client
- [ ] Admin routes protected by auth
- [ ] Courier routes protected by auth
- [ ] Age verification requires staff/courier role
- [ ] No console.log in production code
- [ ] No hardcoded secrets in code

---

## SUMMARY

**Total Items**: [Count after filling in]

**P0 (Blocks Launch)**: Store settings, environment variables, RLS, service role key

**P1 (Should Fix)**: Missing product images, missing prices, missing descriptions

**P2 (Safe After Launch)**: Category descriptions, article body content, placeholder text
