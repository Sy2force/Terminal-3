-- 0032_product_enhancements_rollback.sql
-- Rollback for db/migrations/0032_product_enhancements.sql

BEGIN;

DROP INDEX IF EXISTS idx_products_slug_unique;

ALTER TABLE products
  DROP COLUMN IF EXISTS main_image_id,
  DROP COLUMN IF EXISTS cost_price_agorot,
  DROP COLUMN IF EXISTS sku,
  DROP COLUMN IF EXISTS search_keywords,
  DROP COLUMN IF EXISTS created_by,
  DROP COLUMN IF EXISTS updated_by;

COMMIT;
