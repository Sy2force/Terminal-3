-- 0035_category_covers_and_hierarchy.sql
-- PREPARED — not applied yet. Adds media FK to categories and brands for EditableImage support.

ALTER TABLE categories
  ADD COLUMN IF NOT EXISTS cover_image_id uuid REFERENCES media(id) ON DELETE SET NULL;

ALTER TABLE brands
  ADD COLUMN IF NOT EXISTS logo_image_id uuid REFERENCES media(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS cover_image_id uuid REFERENCES media(id) ON DELETE SET NULL;

-- Indexes for fast joins
CREATE INDEX IF NOT EXISTS idx_categories_cover_image_id ON categories(cover_image_id);
CREATE INDEX IF NOT EXISTS idx_brands_logo_image_id ON brands(logo_image_id);
CREATE INDEX IF NOT EXISTS idx_brands_cover_image_id ON brands(cover_image_id);

-- Hierarchy already exists via parent_id; ensure index
CREATE INDEX IF NOT EXISTS idx_categories_parent_id ON categories(parent_id);
