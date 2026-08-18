-- 0032_product_enhancements.sql
-- PREPARED — not applied yet. Adds product-level fields for single source of truth.

-- Main image reference
ALTER TABLE products
  ADD COLUMN IF NOT EXISTS main_image_id uuid REFERENCES media(id) ON DELETE SET NULL;

-- Cost price (visible only in admin)
ALTER TABLE products
  ADD COLUMN IF NOT EXISTS cost_price_agorot bigint DEFAULT 0;

-- Public SKU at product level
ALTER TABLE products
  ADD COLUMN IF NOT EXISTS sku text UNIQUE;

-- Search keywords for global search
ALTER TABLE products
  ADD COLUMN IF NOT EXISTS search_keywords text[] DEFAULT '{}'::text[];

-- Audit fields
ALTER TABLE products
  ADD COLUMN IF NOT EXISTS created_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS updated_by uuid REFERENCES auth.users(id) ON DELETE SET NULL;

-- Ensure product slug stays unique and not null
CREATE UNIQUE INDEX IF NOT EXISTS idx_products_slug_unique ON products(slug);
