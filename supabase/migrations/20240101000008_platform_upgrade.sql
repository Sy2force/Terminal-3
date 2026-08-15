-- TERMINAL 3 — Platform Upgrade Migration
-- Adds: homepage_sections, courier role, deliveries, membership_tiers,
--   category_themes, delivery fee config, search nav config

-- ============================================================
-- 1. COURIER ROLE
-- (enum value added in 0007b_courier_role_enum.sql — a new enum value
-- cannot be used in the same transaction that creates it)
-- ============================================================

-- ============================================================
-- 2. CATEGORY THEMES
-- ============================================================

do $$ begin
  create type category_theme as enum (
  'DEFAULT',
  'CELLAR',
  'PACKSHOT',
  'GOURMET',
  'PLATTER',
  'EDITORIAL'
);
exception when duplicate_object then null;
end $$;

alter table categories
  add column if not exists theme category_theme default 'DEFAULT';

-- ============================================================
-- 3. HOMEPAGE SECTIONS (CMS-driven homepage builder)
-- ============================================================

do $$ begin
  create type homepage_section_type as enum (
  'HERO',
  'PROMOTIONS',
  'NEW_PRODUCTS',
  'FEATURED_CATEGORY',
  'FEATURED_PRODUCTS',
  'EDITORIAL_IMAGE_TEXT',
  'PLATTERS',
  'INSPIRATIONS',
  'MEMBERSHIP',
  'STORE_INFORMATION',
  'GALLERY'
);
exception when duplicate_object then null;
end $$;

create table if not exists homepage_sections (
  id uuid primary key default gen_random_uuid(),
  section_type homepage_section_type not null,
  sort_order integer not null default 0,
  is_enabled boolean not null default true,
  -- Flexible config stored as JSONB (title, subtitle, category_slug,
  -- product_ids, image_url, cta_label, cta_url, etc.)
  config jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_homepage_sections_sort
  on homepage_sections (sort_order);

-- ============================================================
-- 4. DELIVERIES (courier assignment + tracking)
-- ============================================================

do $$ begin
  create type delivery_status as enum (
  'ASSIGNED',
  'ACCEPTED',
  'PICKED_UP',
  'IN_TRANSIT',
  'ARRIVED',
  'DELIVERED',
  'FAILED'
);
exception when duplicate_object then null;
end $$;

create table if not exists deliveries (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references orders(id) on delete cascade,
  courier_user_id uuid references auth.users(id) on delete set null,
  status delivery_status not null default 'ASSIGNED',
  assigned_at timestamptz not null default now(),
  accepted_at timestamptz,
  picked_up_at timestamptz,
  in_transit_at timestamptz,
  arrived_at timestamptz,
  delivered_at timestamptz,
  failed_at timestamptz,
  failure_reason text,
  payment_collected boolean not null default false,
  payment_method text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_deliveries_order on deliveries (order_id);
create index if not exists idx_deliveries_courier on deliveries (courier_user_id);
create index if not exists idx_deliveries_status on deliveries (status);

-- ============================================================
-- 5. MEMBERSHIP TIERS (optional, for future GOLD/VIP)
-- ============================================================

create table if not exists membership_tiers (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name text not null,
  description text,
  discount_percent integer not null default 0,
  is_enabled boolean not null default true,
  display_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table club_memberships
  add column if not exists tier_id uuid references membership_tiers(id) on delete set null;

-- ============================================================
-- 6. RELATED PRODUCTS (cross-sell)
-- ============================================================

create table if not exists product_relations (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references products(id) on delete cascade,
  related_product_id uuid not null references products(id) on delete cascade,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  unique (product_id, related_product_id)
);

create index if not exists idx_product_relations_product
  on product_relations (product_id);

-- ============================================================
-- 7. SITE SETTINGS — new keys for delivery fee, nav config, footer
-- ============================================================

-- Delivery fee is stored as a site_setting key 'DELIVERY_FEE_AGOROT'
-- Default value inserted via seed or admin. No schema change needed
-- since site_settings is a key-value table.

-- ============================================================
-- 8. RLS POLICIES for new tables
-- ============================================================

alter table homepage_sections enable row level security;
alter table deliveries enable row level security;
alter table membership_tiers enable row level security;
alter table product_relations enable row level security;

-- Homepage sections: public read, admin write
drop policy if exists "homepage_sections_public_read" on homepage_sections;
create policy "homepage_sections_public_read"
  on homepage_sections for select
  using (true);

drop policy if exists "homepage_sections_admin_write" on homepage_sections;
create policy "homepage_sections_admin_write"
  on homepage_sections for all
  using (
    exists (
      select 1 from admin_roles
      where user_id = auth.uid()
      and role in ('OWNER', 'MANAGER', 'CONTENT_EDITOR')
    )
  )
  with check (
    exists (
      select 1 from admin_roles
      where user_id = auth.uid()
      and role in ('OWNER', 'MANAGER', 'CONTENT_EDITOR')
    )
  );

-- Deliveries: courier reads own, admin reads all
drop policy if exists "deliveries_courier_read_own" on deliveries;
create policy "deliveries_courier_read_own"
  on deliveries for select
  using (
    courier_user_id = auth.uid()
    or exists (
      select 1 from admin_roles
      where user_id = auth.uid()
      and role in ('OWNER', 'MANAGER', 'STAFF', 'COURIER')
    )
  );

drop policy if exists "deliveries_admin_all" on deliveries;
create policy "deliveries_admin_all"
  on deliveries for all
  using (
    exists (
      select 1 from admin_roles
      where user_id = auth.uid()
      and role in ('OWNER', 'MANAGER', 'STAFF', 'COURIER')
    )
  )
  with check (
    exists (
      select 1 from admin_roles
      where user_id = auth.uid()
      and role in ('OWNER', 'MANAGER', 'STAFF', 'COURIER')
    )
  );

-- Membership tiers: public read, admin write
drop policy if exists "membership_tiers_public_read" on membership_tiers;
create policy "membership_tiers_public_read"
  on membership_tiers for select
  using (true);

drop policy if exists "membership_tiers_admin_write" on membership_tiers;
create policy "membership_tiers_admin_write"
  on membership_tiers for all
  using (
    exists (
      select 1 from admin_roles
      where user_id = auth.uid()
      and role in ('OWNER', 'MANAGER')
    )
  )
  with check (
    exists (
      select 1 from admin_roles
      where user_id = auth.uid()
      and role in ('OWNER', 'MANAGER')
    )
  );

-- Product relations: public read, admin write
drop policy if exists "product_relations_public_read" on product_relations;
create policy "product_relations_public_read"
  on product_relations for select
  using (true);

drop policy if exists "product_relations_admin_write" on product_relations;
create policy "product_relations_admin_write"
  on product_relations for all
  using (
    exists (
      select 1 from admin_roles
      where user_id = auth.uid()
      and role in ('OWNER', 'MANAGER', 'CONTENT_EDITOR')
    )
  )
  with check (
    exists (
      select 1 from admin_roles
      where user_id = auth.uid()
      and role in ('OWNER', 'MANAGER', 'CONTENT_EDITOR')
    )
  );

-- ============================================================
-- 9. SEED DEFAULT HOMEPAGE SECTIONS
-- ============================================================

insert into homepage_sections (section_type, sort_order, is_enabled, config) values
  ('HERO', 0, true, '{}'::jsonb),
  ('PROMOTIONS', 10, true, '{"title": "Promotions actuelles", "limit": 5}'::jsonb),
  ('NEW_PRODUCTS', 20, true, '{"title": "Nouveautés", "limit": 5}'::jsonb),
  ('FEATURED_CATEGORY', 30, true, '{"title": "Plateaux Saumon", "subtitle": "La signature", "category_slug": "plateaux-saumon", "limit": 4}'::jsonb),
  ('FEATURED_CATEGORY', 40, true, '{"title": "Plateaux Charcuterie", "subtitle": "Nouveautés", "category_slug": "plateaux-charcuterie", "limit": 4}'::jsonb),
  ('GALLERY', 50, true, '{"title": "Galeries Terminal 3"}'::jsonb),
  ('INSPIRATIONS', 60, true, '{"title": "Inspirations", "limit": 6}'::jsonb),
  ('MEMBERSHIP', 70, true, '{}'::jsonb)
on conflict do nothing;

-- ============================================================
-- 10. SEED DEFAULT MEMBERSHIP TIER
-- ============================================================

insert into membership_tiers (slug, name, description, discount_percent, is_enabled, display_order)
values ('member', 'Membre', 'Membre du Club Terminal 3', 0, true, 0)
on conflict (slug) do nothing;

-- ============================================================
-- 11. SEED DELIVERY FEE SETTING
-- ============================================================

insert into site_settings (key, value)
values ('DELIVERY_FEE_AGOROT', '1000'::jsonb)
on conflict (key) do nothing;
