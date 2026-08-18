-- 0042_product_classification_lock_rollback.sql

BEGIN;

ALTER TABLE products
  DROP COLUMN IF EXISTS classification_locked,
  DROP COLUMN IF EXISTS classification_confidence;

COMMIT;
