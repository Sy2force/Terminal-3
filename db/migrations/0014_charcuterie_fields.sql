-- TERMINAL 3 — Charcuterie catalog fields
-- Adds the small set of fields genuinely missing from `products` and
-- `product_variants` to power the /charcuterie catalog and detail pages
-- (meat type, platter eligibility, nutrition/expiration text, and a
-- per-variant pricing unit so a price can be shown unambiguously as
-- "29 ₪ / 100 g", "89 ₪ / kg", "45 ₪ le paquet" or "À partir de 149 ₪").
-- Purely additive — every column is nullable or has a safe default, no
-- existing data is touched, dropped, or renamed. `subcategory` already
-- exists from 0013_spirits_catalog_fields.sql and is reused as-is for
-- the charcuterie quick-filter categories (FRANCAIS, ROSETTE, SINTA,
-- PASTRAMI, ROASTBEEF, KABANOS, PATES, BATONS, SAUCISSES, VOLAILLE,
-- PLATEAUX).

begin;

alter table products
  add column if not exists meat_type text,
  add column if not exists is_available_for_platter boolean not null default false,
  add column if not exists nutrition_info text,
  add column if not exists expiration_info text;

alter table product_variants
  add column if not exists pricing_unit text;

alter table product_variants
  add constraint product_variants_pricing_unit_valid check (
    pricing_unit is null or pricing_unit in ('FIXED', 'PACKAGE', 'PER_100G', 'PER_KG', 'FROM')
  );

commit;
