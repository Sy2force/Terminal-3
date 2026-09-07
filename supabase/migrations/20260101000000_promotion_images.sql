-- Adds dedicated image fields to promotions so staff can upload a visual
-- without relying on the linked product's cover.
alter table public.promotions
  add column if not exists image_url text,
  add column if not exists og_image_url text;
