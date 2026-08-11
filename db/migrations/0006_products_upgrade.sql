-- TERMINAL 3 — Product CMS upgrade
-- Adds production-grade fields for platters, availability, media kinds,
-- SEO metadata, and pricing flexibility while keeping all existing data safe.

begin;

-- ============================================================
-- NEW ENUMS
-- ============================================================

create type product_type as enum ('STANDARD', 'PLATTER');
create type product_availability_status as enum (
  'IN_STOCK',
  'LOW_STOCK',
  'OUT_OF_STOCK',
  'PREORDER',
  'ON_REQUEST'
);
create type product_media_kind as enum (
  'COVER',
  'GALLERY',
  'LIFESTYLE',
  'DETAIL',
  'EDITORIAL'
);

-- ============================================================
-- PRODUCTS
-- ============================================================

alter table products
  add column if not exists product_type product_type not null default 'STANDARD',
  add column if not exists base_price_agorot integer,
  add column if not exists compare_at_price_agorot integer,
  add column if not exists is_featured boolean not null default false,
  add column if not exists availability_status product_availability_status not null default 'IN_STOCK',
  add column if not exists meta_title text,
  add column if not exists meta_description text,
  add column if not exists serves_min integer,
  add column if not exists serves_max integer,
  add column if not exists composition_text text,
  add column if not exists advance_order_hours integer not null default 0,
  add column if not exists customizable boolean not null default false,
  add column if not exists preparation_time_minutes integer;

alter table products
  add constraint products_base_price_non_negative check (
    base_price_agorot is null or base_price_agorot >= 0
  ),
  add constraint products_compare_price_non_negative check (
    compare_at_price_agorot is null or compare_at_price_agorot >= 0
  ),
  add constraint products_serves_range_valid check (
    serves_min is null or serves_max is null or serves_min <= serves_max
  );

-- ============================================================
-- PRODUCT VARIANTS
-- ============================================================

alter table product_variants
  rename column sort_order to display_order;

alter table product_variants
  add column if not exists availability_status product_availability_status not null default 'IN_STOCK';

-- ============================================================
-- PRODUCT MEDIA
-- ============================================================

alter table product_media
  rename column sort_order to display_order;

-- Existing kind values are safely cast to text; we will migrate below.
alter table product_media
  alter column kind type text;

-- Backfill any existing media rows to a valid kind before applying enum.
update product_media
set kind = 'GALLERY'
where kind is null or kind not in ('COVER','GALLERY','LIFESTYLE','DETAIL','EDITORIAL');

alter table product_media
  alter column kind set default 'GALLERY',
  alter column kind type product_media_kind using kind::product_media_kind;

commit;
