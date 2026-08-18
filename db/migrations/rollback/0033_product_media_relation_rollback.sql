-- 0033_product_media_relation_rollback.sql
-- Rollback for db/migrations/0033_product_media_relation.sql

BEGIN;

DROP INDEX IF EXISTS idx_product_media_product_role;
DROP INDEX IF EXISTS idx_product_media_media_id;

ALTER TABLE product_media
  DROP COLUMN IF EXISTS role,
  DROP COLUMN IF EXISTS media_id;

ALTER TABLE product_media
  ALTER COLUMN url SET NOT NULL;

DROP TYPE IF EXISTS product_media_role;

COMMIT;
