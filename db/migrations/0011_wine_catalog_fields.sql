-- TERMINAL 3 — Wine catalog fields
-- Adds the small set of fields genuinely missing from `products` to power
-- the /vins catalog (quick type filter, region/country/grape filters,
-- rating, best-seller flag, optional custom badge). Purely additive —
-- every column is nullable or has a safe default, no existing data is
-- touched, dropped, or renamed.

begin;

create type wine_type as enum ('ROUGE', 'BLANC', 'ROSE', 'EFFERVESCENT', 'DOUX');

alter table products
  add column if not exists wine_type wine_type,
  add column if not exists region text,
  add column if not exists country text,
  add column if not exists grape_varieties text[],
  add column if not exists rating numeric(2,1),
  add column if not exists review_count integer not null default 0,
  add column if not exists is_best_seller boolean not null default false,
  add column if not exists badge text,
  add column if not exists serving_temperature text,
  add column if not exists aging_potential text,
  add column if not exists vinification_method text;

alter table products
  add constraint products_rating_range check (
    rating is null or (rating >= 0 and rating <= 5)
  ),
  add constraint products_review_count_non_negative check (
    review_count >= 0
  );

commit;
