-- 0034_invoice_items.sql
-- PREPARED — not applied yet. Adds a proper invoice_items table linked to orders, invoices and payments.

CREATE TABLE IF NOT EXISTS invoice_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  invoice_id uuid NOT NULL REFERENCES invoices(id) ON DELETE CASCADE,
  order_item_id uuid REFERENCES order_items(id) ON DELETE SET NULL,
  product_id uuid REFERENCES products(id) ON DELETE SET NULL,
  product_name text,
  product_description text,
  quantity integer NOT NULL DEFAULT 1,
  unit_price_agorot bigint NOT NULL DEFAULT 0,
  discount_agorot bigint DEFAULT 0,
  tax_percent numeric(5,2) DEFAULT 0,
  total_agorot bigint NOT NULL DEFAULT 0,
  sort_order integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_invoice_items_invoice_id ON invoice_items(invoice_id);
CREATE INDEX IF NOT EXISTS idx_invoice_items_product_id ON invoice_items(product_id);

-- Trigger to update invoice updated_at on item change
CREATE OR REPLACE FUNCTION update_invoice_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE invoices SET created_at = now() WHERE id = NEW.invoice_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_invoice_items_updated ON invoice_items;
CREATE TRIGGER trg_invoice_items_updated
AFTER INSERT OR UPDATE ON invoice_items
FOR EACH ROW
EXECUTE FUNCTION update_invoice_updated_at();

-- Enable RLS
ALTER TABLE invoice_items ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admins can manage invoice items" ON invoice_items;
CREATE POLICY "Admins can manage invoice items"
ON invoice_items
FOR ALL
TO authenticated
USING (EXISTS (SELECT 1 FROM admin_roles WHERE user_id = auth.uid()))
WITH CHECK (EXISTS (SELECT 1 FROM admin_roles WHERE user_id = auth.uid()));
