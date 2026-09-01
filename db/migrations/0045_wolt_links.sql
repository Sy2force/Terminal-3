-- ============================================================
-- 0045_wolt_links.sql
-- Mode liens directs Wolt : chaque variante peut pointer vers
-- sa fiche ou un format spécifique sur Wolt, sans API.
-- ============================================================

begin;

alter table product_variants
  add column if not exists wolt_enabled boolean not null default false,
  add column if not exists wolt_url text;

-- Index for quick lookup of Wolt-linked variants
-- (partial because most products won’t have a link).
create index if not exists idx_product_variants_wolt_enabled
  on product_variants (product_id)
  where wolt_enabled is true;

commit;
