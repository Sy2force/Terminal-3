-- TERMINAL 3 — Supabase Storage buckets and policies
-- Public read, admin/staff-only write/delete.

begin;

-- Create buckets if they don't exist. Public read makes product/category images
-- cachable and directly usable with Next/Image.
insert into storage.buckets (id, name, public)
values
  ('product-images', 'product-images', true),
  ('content-images', 'content-images', true),
  ('brand-assets', 'brand-assets', true)
on conflict (id) do nothing;

-- Staff can upload into product-images.
create policy "product_images_staff_insert"
  on storage.objects
  for insert
  with check (
    bucket_id = 'product-images'
    and public.is_staff()
  );

-- Staff can delete from product-images.
create policy "product_images_staff_delete"
  on storage.objects
  for delete
  using (
    bucket_id = 'product-images'
    and public.is_staff()
  );

-- Public can read product-images.
create policy "product_images_public_select"
  on storage.objects
  for select
  using (bucket_id = 'product-images');

-- Same triplet for content-images.
create policy "content_images_staff_insert"
  on storage.objects
  for insert
  with check (
    bucket_id = 'content-images'
    and public.is_staff()
  );

create policy "content_images_staff_delete"
  on storage.objects
  for delete
  using (
    bucket_id = 'content-images'
    and public.is_staff()
  );

create policy "content_images_public_select"
  on storage.objects
  for select
  using (bucket_id = 'content-images');

-- Same triplet for brand-assets.
create policy "brand_assets_staff_insert"
  on storage.objects
  for insert
  with check (
    bucket_id = 'brand-assets'
    and public.is_staff()
  );

create policy "brand_assets_staff_delete"
  on storage.objects
  for delete
  using (
    bucket_id = 'brand-assets'
    and public.is_staff()
  );

create policy "brand_assets_public_select"
  on storage.objects
  for select
  using (bucket_id = 'brand-assets');

commit;
