-- 0040_classification_rules.sql
-- Dictionnaire administrable pour le classement automatique des produits.
-- Additive, idempotente, réversible.

BEGIN;

CREATE TABLE IF NOT EXISTS classification_rules (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  keyword text NOT NULL,
  normalized_keyword text NOT NULL,
  brand_id uuid REFERENCES brands(id) ON DELETE SET NULL,
  category_id uuid REFERENCES categories(id) ON DELETE SET NULL,
  subcategory_id uuid REFERENCES categories(id) ON DELETE SET NULL,
  product_type text,
  priority int NOT NULL DEFAULT 0,
  confidence text NOT NULL CHECK (confidence IN ('high','medium','low')),
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_classification_rules_normalized_keyword
  ON classification_rules(normalized_keyword)
  WHERE is_active = true;

CREATE INDEX IF NOT EXISTS idx_classification_rules_category_id
  ON classification_rules(category_id);

CREATE INDEX IF NOT EXISTS idx_classification_rules_brand_id
  ON classification_rules(brand_id);

ALTER TABLE classification_rules ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admins can read classification rules" ON classification_rules;
CREATE POLICY "Admins can read classification rules"
  ON classification_rules
  FOR SELECT
  TO authenticated
  USING (EXISTS (SELECT 1 FROM admin_roles WHERE user_id = auth.uid()));

DROP POLICY IF EXISTS "Admins can manage classification rules" ON classification_rules;
CREATE POLICY "Admins can manage classification rules"
  ON classification_rules
  FOR ALL
  TO authenticated
  USING (EXISTS (SELECT 1 FROM admin_roles WHERE user_id = auth.uid()))
  WITH CHECK (EXISTS (SELECT 1 FROM admin_roles WHERE user_id = auth.uid()));

-- Trigger updated_at
CREATE OR REPLACE FUNCTION trigger_set_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS set_timestamp_classification_rules ON classification_rules;
CREATE TRIGGER set_timestamp_classification_rules
  BEFORE UPDATE ON classification_rules
  FOR EACH ROW
  EXECUTE FUNCTION trigger_set_timestamp();

COMMIT;
