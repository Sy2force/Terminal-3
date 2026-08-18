-- 0042_product_classification_lock.sql
-- Colonnes de verrouillage et de confiance du classement sur products.

BEGIN;

ALTER TABLE products
  ADD COLUMN IF NOT EXISTS classification_locked boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS classification_confidence text CHECK (classification_confidence IN ('high','medium','low','unknown'));

-- Default existing rows to unknown where null
UPDATE products
  SET classification_confidence = COALESCE(classification_confidence, 'unknown')
  WHERE classification_confidence IS NULL;

COMMIT;
