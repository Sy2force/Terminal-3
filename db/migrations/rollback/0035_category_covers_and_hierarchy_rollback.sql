-- 0035_category_covers_and_hierarchy_rollback.sql
-- Rollback for db/migrations/0035_category_covers_and_hierarchy.sql

BEGIN;

DROP INDEX IF EXISTS idx_categories_parent_id;
DROP INDEX IF EXISTS idx_brands_logo_image_id;
DROP INDEX IF EXISTS idx_brands_cover_image_id;
DROP INDEX IF EXISTS idx_categories_cover_image_id;

ALTER TABLE brands
  DROP COLUMN IF EXISTS cover_image_id,
  DROP COLUMN IF EXISTS logo_image_id;

ALTER TABLE categories
  DROP COLUMN IF EXISTS cover_image_id;

COMMIT;
