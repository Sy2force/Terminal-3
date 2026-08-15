-- TERMINAL 3 — Spirits catalog fields
-- Adds the small set of fields genuinely missing from `products` to power
-- the /spiritueux catalog and detail pages (subcategory filter, age,
-- tasting profile in three blocks, cask/edition/production details).
-- Purely additive — every column is nullable, no existing data is
-- touched, dropped, or renamed. Several of these are intentionally
-- generic (not spirits-only) so future categories can reuse them too.

begin;

alter table products
  add column if not exists subcategory text,
  add column if not exists age_years integer,
  add column if not exists nose_notes text,
  add column if not exists palate_notes text,
  add column if not exists finish_notes text,
  add column if not exists cask_type text,
  add column if not exists edition text,
  add column if not exists production_method text;

alter table products
  add constraint products_age_years_non_negative check (
    age_years is null or age_years >= 0
  );

commit;
