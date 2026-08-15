-- TERMINAL 3 — Fish catalog fields
-- Adds the small set of fields genuinely missing from `products` and
-- `product_variants` to power the /poissons catalog and detail pages
-- (fish species, preparation method, smoked flag, and a per-variant
-- packaging so "verre" / "conserve" / "sous vide" / "formats
-- professionnels" can be filtered and displayed correctly — different
-- formats of the same product can use different packaging, e.g. anchois
-- sold both in a small glass jar and in a bulk professional pack).
-- Purely additive — every column is nullable or has a safe default, no
-- existing data is touched, dropped, or renamed. `subcategory`,
-- `is_available_for_platter`, `nutrition_info`, `expiration_info`,
-- `pricing_unit` already exist from earlier migrations and are reused
-- as-is (fish subcategories: SAUMON_FUME, SAUMON_HERBES, ANCHOIS,
-- VENTRECHE_THON, FILET_THON, PLATEAUX).

begin;

alter table products
  add column if not exists fish_type text,
  add column if not exists preparation_method text,
  add column if not exists smoked boolean not null default false;

alter table product_variants
  add column if not exists packaging text;

commit;
