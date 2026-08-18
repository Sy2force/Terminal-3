-- 0040_classification_rules_rollback.sql

BEGIN;

DROP TRIGGER IF EXISTS set_timestamp_classification_rules ON classification_rules;
DROP POLICY IF EXISTS "Admins can read classification rules" ON classification_rules;
DROP POLICY IF EXISTS "Admins can manage classification rules" ON classification_rules;
DROP INDEX IF EXISTS idx_classification_rules_brand_id;
DROP INDEX IF EXISTS idx_classification_rules_category_id;
DROP INDEX IF EXISTS idx_classification_rules_normalized_keyword;
DROP TABLE IF EXISTS classification_rules;

COMMIT;
