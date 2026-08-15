-- TERMINAL 3 — Product reviews
-- Purely additive: a new table for genuine customer reviews on product
-- detail pages (/vins/[slug] and beyond). No existing table is touched.
-- Reviews are never fabricated in the UI — this table is the single
-- source of truth, and an empty result set renders an honest empty state.

begin;

create table product_reviews (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references products (id) on delete cascade,
  user_id uuid references auth.users (id) on delete set null,
  author_name text not null,
  rating smallint not null,
  comment text not null,
  is_published boolean not null default true,
  created_at timestamptz not null default now(),
  constraint product_reviews_rating_range check (rating >= 1 and rating <= 5),
  constraint product_reviews_comment_not_empty check (length(trim(comment)) > 0)
);

create index product_reviews_product_id_idx on product_reviews (product_id);

alter table product_reviews enable row level security;

create policy "product_reviews_public_read" on product_reviews
  for select using (is_published = true or is_staff());

-- Only signed-in users may post a review, and only under their own name/id.
create policy "product_reviews_self_insert" on product_reviews
  for insert with check (auth.uid() = user_id);

create policy "product_reviews_staff_moderate" on product_reviews
  for update using (is_staff(array['OWNER', 'MANAGER', 'CONTENT_EDITOR']::admin_role_type[]))
  with check (is_staff(array['OWNER', 'MANAGER', 'CONTENT_EDITOR']::admin_role_type[]));

create policy "product_reviews_staff_delete" on product_reviews
  for delete using (is_staff(array['OWNER', 'MANAGER', 'CONTENT_EDITOR']::admin_role_type[]));

commit;
