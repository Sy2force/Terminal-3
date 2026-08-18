-- 0041_classification_history.sql
-- Historique des propositions et décisions de classement.

BEGIN;

CREATE TABLE IF NOT EXISTS classification_history (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id uuid REFERENCES products(id) ON DELETE SET NULL,
  old_name text,
  new_name text,
  proposed_category_id uuid REFERENCES categories(id) ON DELETE SET NULL,
  applied_category_id uuid REFERENCES categories(id) ON DELETE SET NULL,
  proposed_subcategory text,
  applied_subcategory text,
  confidence text NOT NULL CHECK (confidence IN ('high','medium','low','unknown')),
  admin_decision text NOT NULL CHECK (admin_decision IN ('accepted','rejected','corrected','locked','unlocked')),
  source text NOT NULL CHECK (source IN ('rule','manual','import','migration')),
  author_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_classification_history_product_id
  ON classification_history(product_id);

CREATE INDEX IF NOT EXISTS idx_classification_history_created_at
  ON classification_history(created_at DESC);

ALTER TABLE classification_history ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admins can read classification history" ON classification_history;
CREATE POLICY "Admins can read classification history"
  ON classification_history
  FOR SELECT
  TO authenticated
  USING (EXISTS (SELECT 1 FROM admin_roles WHERE user_id = auth.uid()));

DROP POLICY IF EXISTS "Admins can insert classification history" ON classification_history;
CREATE POLICY "Admins can insert classification history"
  ON classification_history
  FOR INSERT
  TO authenticated
  WITH CHECK (EXISTS (SELECT 1 FROM admin_roles WHERE user_id = auth.uid()));

COMMIT;
