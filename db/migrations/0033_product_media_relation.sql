-- 0033_product_media_relation.sql
-- PREPARED — not applied yet. Moves product_media from free text URLs to a relational media table.

-- Add media_id to product_media to link to the central media table
ALTER TABLE product_media
  ADD COLUMN IF NOT EXISTS media_id uuid REFERENCES media(id) ON DELETE SET NULL;

-- Allow url to be NULL once media_id is populated
ALTER TABLE product_media
  ALTER COLUMN url DROP NOT NULL;

-- Add display role (main, gallery, thumbnail, transparent, lifestyle)
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'product_media_role') THEN
    CREATE TYPE product_media_role AS ENUM ('main', 'gallery', 'thumbnail', 'transparent', 'lifestyle');
  END IF;
END
$$;

ALTER TABLE product_media
  ADD COLUMN IF NOT EXISTS role product_media_role DEFAULT 'gallery';

-- Backfill-friendly: keep kind for backward compatibility but add role mapping
UPDATE product_media SET role = 'main' WHERE kind = 'COVER';
UPDATE product_media SET role = 'gallery' WHERE kind = 'GALLERY';
UPDATE product_media SET role = 'lifestyle' WHERE kind = 'LIFESTYLE';

-- Index for fast lookups
CREATE INDEX IF NOT EXISTS idx_product_media_media_id ON product_media(media_id);
CREATE INDEX IF NOT EXISTS idx_product_media_product_role ON product_media(product_id, role);
