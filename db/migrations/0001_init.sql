-- TERMINAL 3 — initial schema
-- Postgres / Supabase. All monetary values are stored as integer agorot
-- (1 ILS = 100 agorot) to avoid floating point currency math.
-- All timestamps are stored in UTC (timestamptz); render Asia/Jerusalem
-- local time in the application layer.

create extension if not exists "pgcrypto";

-- ============================================================
-- ENUM TYPES
-- ============================================================

create type product_status as enum ('draft', 'published', 'archived');
create type promotion_status as enum ('draft', 'scheduled', 'active', 'expired', 'paused');
create type order_status as enum ('submitted', 'confirmed', 'ready', 'completed', 'cancelled');
create type fulfillment_group_type as enum ('NON_RESTRICTED', 'AGE_RESTRICTED');
create type food_fulfillment_status as enum ('SUBMITTED', 'CONFIRMED', 'READY', 'COMPLETED', 'CANCELLED');
create type alcohol_fulfillment_status as enum (
  'SUBMITTED',
  'PENDING_AGE_VERIFICATION',
  'AGE_VERIFIED',
  'READY',
  'COMPLETED',
  'AGE_VERIFICATION_FAILED',
  'CANCELLED'
);
create type age_verification_status as enum ('PENDING', 'VERIFIED', 'FAILED');
create type entitlement_status as enum ('ISSUED', 'REDEEMED', 'EXPIRED', 'REVOKED');
create type content_status as enum ('draft', 'scheduled', 'published');
create type admin_role_type as enum ('OWNER', 'MANAGER', 'CONTENT_EDITOR', 'STAFF');
create type order_channel as enum ('web', 'phone', 'manual');

-- ============================================================
-- BRANCHES
-- ============================================================

create table branches (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  address text not null,
  phone text,
  whatsapp text,
  latitude numeric(9, 6),
  longitude numeric(9, 6),
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

-- ============================================================
-- PROFILES (1:1 with auth.users)
-- ============================================================

create table profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  first_name text,
  last_name text,
  phone text,
  email text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ============================================================
-- CLUB MEMBERSHIPS
-- ============================================================

create table club_memberships (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references profiles (id) on delete cascade,
  status text not null default 'active',
  source text,
  joined_at timestamptz not null default now(),
  unique (user_id)
);

-- ============================================================
-- CATALOG: categories / products / variants / media / inventory
-- ============================================================

create table categories (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name_he text not null,
  name_fr text,
  name_en text,
  parent_id uuid references categories (id),
  sort_order integer not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

create table products (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  category_id uuid references categories (id),
  brand text,
  name_he text not null,
  name_fr text,
  name_en text,
  description_he text,
  description_fr text,
  description_en text,
  origin text,
  tasting_notes text,
  pairing_notes text,
  how_to_serve text,
  storage_info text,
  kosher_status text,
  allergen_info text,
  age_restricted boolean not null default false,
  status product_status not null default 'draft',
  published_at timestamptz,
  new_until timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index products_category_id_idx on products (category_id);
create index products_status_idx on products (status);
create index products_new_until_idx on products (new_until);

create table product_variants (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references products (id) on delete cascade,
  sku text unique,
  label text not null,
  weight_g integer,
  volume_ml integer,
  abv numeric(4, 1),
  vintage integer,
  regular_price_agorot integer,
  is_default boolean not null default false,
  limited_stock boolean not null default false,
  status product_status not null default 'published',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint regular_price_non_negative check (
    regular_price_agorot is null or regular_price_agorot >= 0
  )
);

create index product_variants_product_id_idx on product_variants (product_id);

create table product_media (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references products (id) on delete cascade,
  variant_id uuid references product_variants (id) on delete cascade,
  url text not null,
  alt text,
  kind text not null default 'image',
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);

create index product_media_product_id_idx on product_media (product_id);

create table inventory (
  id uuid primary key default gen_random_uuid(),
  variant_id uuid not null references product_variants (id) on delete cascade,
  branch_id uuid not null references branches (id) on delete cascade,
  quantity integer not null default 0,
  updated_at timestamptz not null default now(),
  unique (variant_id, branch_id)
);

-- ============================================================
-- PROMOTIONS
-- ============================================================

create table promotions (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  title text not null,
  description text,
  product_id uuid references products (id),
  variant_id uuid references product_variants (id),
  branch_id uuid references branches (id),
  regular_price_agorot integer not null,
  promo_price_agorot integer not null,
  start_at timestamptz not null,
  end_at timestamptz not null,
  quantity_limit integer,
  remaining_quantity integer,
  members_only boolean not null default false,
  featured boolean not null default false,
  status promotion_status not null default 'draft',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint promo_price_non_negative check (promo_price_agorot >= 0),
  constraint promo_dates_valid check (end_at > start_at)
);

create index promotions_status_idx on promotions (status);
create index promotions_start_end_idx on promotions (start_at, end_at);

create table promotion_products (
  id uuid primary key default gen_random_uuid(),
  promotion_id uuid not null references promotions (id) on delete cascade,
  product_id uuid not null references products (id) on delete cascade,
  unique (promotion_id, product_id)
);

-- ============================================================
-- FAVORITES
-- ============================================================

create table favorites (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references profiles (id) on delete cascade,
  product_id uuid not null references products (id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (user_id, product_id)
);

-- ============================================================
-- ORDERS / RESERVATIONS
-- ============================================================

create table orders (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references profiles (id),
  branch_id uuid not null references branches (id),
  channel order_channel not null default 'web',
  status order_status not null default 'submitted',
  customer_name text,
  customer_phone text,
  total_agorot integer not null default 0,
  created_by_staff_user_id uuid references profiles (id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index orders_user_id_idx on orders (user_id);
create index orders_status_idx on orders (status);

create table order_fulfillment_groups (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references orders (id) on delete cascade,
  group_type fulfillment_group_type not null,
  food_status food_fulfillment_status,
  alcohol_status alcohol_fulfillment_status,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint status_matches_group_type check (
    (group_type = 'NON_RESTRICTED' and food_status is not null and alcohol_status is null)
    or
    (group_type = 'AGE_RESTRICTED' and alcohol_status is not null and food_status is null)
  )
);

create index order_fulfillment_groups_order_id_idx on order_fulfillment_groups (order_id);

create table order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references orders (id) on delete cascade,
  fulfillment_group_id uuid not null references order_fulfillment_groups (id) on delete cascade,
  product_id uuid references products (id),
  variant_id uuid references product_variants (id),
  -- Immutable snapshot at time of order. Historical totals must NEVER be
  -- recalculated from current product/promotion prices.
  product_name_snapshot text not null,
  variant_label_snapshot text,
  regular_price_agorot_snapshot integer not null,
  promo_price_agorot_snapshot integer,
  final_price_agorot_snapshot integer not null,
  quantity integer not null default 1,
  tax_info jsonb,
  created_at timestamptz not null default now()
);

create index order_items_order_id_idx on order_items (order_id);

-- ============================================================
-- AGE VERIFICATION
-- ============================================================

create table age_verifications (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references orders (id) on delete cascade,
  fulfillment_group_id uuid not null references order_fulfillment_groups (id) on delete cascade,
  status age_verification_status not null default 'PENDING',
  verified_at timestamptz,
  verified_by_staff_user_id uuid references profiles (id),
  created_at timestamptz not null default now(),
  unique (fulfillment_group_id)
);

-- ============================================================
-- DISCOUNT ENTITLEMENTS (e.g. WELCOME20)
-- ============================================================

create table discount_entitlements (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references profiles (id) on delete cascade,
  code text not null default 'WELCOME20',
  discount_percent integer not null default 20,
  eligibility_rules jsonb not null default '{}'::jsonb,
  status entitlement_status not null default 'ISSUED',
  issued_at timestamptz not null default now(),
  redeemed_at timestamptz,
  order_id uuid references orders (id),
  unique (user_id, code)
);

-- ============================================================
-- CONTENT (Terminal 3 Journal / inspirations)
-- ============================================================

create table content_posts (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  title text not null,
  subtitle text,
  hero_image_url text,
  category text,
  body text,
  status content_status not null default 'draft',
  published_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index content_posts_status_idx on content_posts (status);

create table content_sections (
  id uuid primary key default gen_random_uuid(),
  post_id uuid not null references content_posts (id) on delete cascade,
  sort_order integer not null default 0,
  heading text,
  body text,
  image_url text
);

create index content_sections_post_id_idx on content_sections (post_id);

create table content_products (
  id uuid primary key default gen_random_uuid(),
  post_id uuid not null references content_posts (id) on delete cascade,
  product_id uuid not null references products (id) on delete cascade,
  sort_order integer not null default 0,
  unique (post_id, product_id)
);

-- ============================================================
-- NOTIFICATION PREFERENCES
-- ============================================================

create table notification_preferences (
  user_id uuid primary key references profiles (id) on delete cascade,
  promotions_opt_in boolean not null default true,
  new_arrivals_opt_in boolean not null default true,
  club_opt_in boolean not null default true,
  updated_at timestamptz not null default now()
);

-- ============================================================
-- ADMIN / RBAC / AUDIT
-- ============================================================

create table admin_roles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references profiles (id) on delete cascade,
  role admin_role_type not null,
  branch_id uuid references branches (id),
  created_at timestamptz not null default now(),
  unique (user_id, role, branch_id)
);

create table audit_logs (
  id uuid primary key default gen_random_uuid(),
  actor_user_id uuid references profiles (id),
  action text not null,
  entity_type text not null,
  entity_id uuid,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index audit_logs_entity_idx on audit_logs (entity_type, entity_id);

-- ============================================================
-- SITE SETTINGS (key/value, admin-editable, no redeploy needed)
-- ============================================================

create table site_settings (
  key text primary key,
  value jsonb not null,
  updated_at timestamptz not null default now(),
  updated_by uuid references profiles (id)
);
