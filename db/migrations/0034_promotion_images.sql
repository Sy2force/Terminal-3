alter table public.promotions
  add column if not exists image_url text,
  add column if not exists og_image_url text;
