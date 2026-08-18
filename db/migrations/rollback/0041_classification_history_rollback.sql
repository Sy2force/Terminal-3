-- 0041_classification_history_rollback.sql

BEGIN;

DROP POLICY IF EXISTS "Admins can read classification history" ON classification_history;
DROP POLICY IF EXISTS "Admins can insert classification history" ON classification_history;
DROP INDEX IF EXISTS idx_classification_history_created_at;
DROP INDEX IF EXISTS idx_classification_history_product_id;
DROP TABLE IF EXISTS classification_history;

COMMIT;
