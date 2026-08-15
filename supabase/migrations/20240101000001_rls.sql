-- TERMINAL 3 — Row Level Security
-- Every exposed table has RLS enabled. Frontend button-hiding is never
-- treated as authorization; the database is the final authority.

-- ------------------------------------------------------------
-- Helper: is the current user an admin/staff member, optionally
-- restricted to a set of roles?
-- ------------------------------------------------------------

create or replace function is_staff(allowed_roles admin_role_type[] default null)
returns boolean
language sql
security definer
stable
set search_path = public
as $$
  select exists (
    select 1
    from admin_roles ar
    where ar.user_id = auth.uid()
      and (allowed_roles is null or ar.role = any (allowed_roles))
  );
$$;

-- ============================================================
-- PUBLIC READ-ONLY CATALOG / CONTENT / SETTINGS
-- ============================================================

alter table branches enable row level security;
create policy "branches_public_read" on branches
  for select using (is_active = true or is_staff());
create policy "branches_staff_write" on branches
  for all using (is_staff(array['OWNER', 'MANAGER']::admin_role_type[]))
  with check (is_staff(array['OWNER', 'MANAGER']::admin_role_type[]));

alter table categories enable row level security;
create policy "categories_public_read" on categories
  for select using (is_active = true or is_staff());
create policy "categories_staff_write" on categories
  for all using (is_staff(array['OWNER', 'MANAGER']::admin_role_type[]))
  with check (is_staff(array['OWNER', 'MANAGER']::admin_role_type[]));

alter table products enable row level security;
create policy "products_public_read" on products
  for select using (status = 'published' or is_staff());
create policy "products_staff_write" on products
  for all using (is_staff(array['OWNER', 'MANAGER']::admin_role_type[]))
  with check (is_staff(array['OWNER', 'MANAGER']::admin_role_type[]));

alter table product_variants enable row level security;
create policy "product_variants_public_read" on product_variants
  for select using (
    is_staff() or exists (
      select 1 from products p
      where p.id = product_variants.product_id and p.status = 'published'
    )
  );
create policy "product_variants_staff_write" on product_variants
  for all using (is_staff(array['OWNER', 'MANAGER']::admin_role_type[]))
  with check (is_staff(array['OWNER', 'MANAGER']::admin_role_type[]));

alter table product_media enable row level security;
create policy "product_media_public_read" on product_media
  for select using (
    is_staff() or exists (
      select 1 from products p
      where p.id = product_media.product_id and p.status = 'published'
    )
  );
create policy "product_media_staff_write" on product_media
  for all using (is_staff(array['OWNER', 'MANAGER', 'CONTENT_EDITOR']::admin_role_type[]))
  with check (is_staff(array['OWNER', 'MANAGER', 'CONTENT_EDITOR']::admin_role_type[]));

alter table inventory enable row level security;
create policy "inventory_staff_only" on inventory
  for all using (is_staff())
  with check (is_staff(array['OWNER', 'MANAGER']::admin_role_type[]));

alter table promotions enable row level security;
create policy "promotions_public_read" on promotions
  for select using (status in ('active', 'expired') or is_staff());
create policy "promotions_staff_write" on promotions
  for all using (is_staff(array['OWNER', 'MANAGER']::admin_role_type[]))
  with check (is_staff(array['OWNER', 'MANAGER']::admin_role_type[]));

alter table promotion_products enable row level security;
create policy "promotion_products_public_read" on promotion_products
  for select using (true);
create policy "promotion_products_staff_write" on promotion_products
  for all using (is_staff(array['OWNER', 'MANAGER']::admin_role_type[]))
  with check (is_staff(array['OWNER', 'MANAGER']::admin_role_type[]));

alter table content_posts enable row level security;
create policy "content_posts_public_read" on content_posts
  for select using (status = 'published' or is_staff());
create policy "content_posts_editor_write" on content_posts
  for all using (is_staff(array['OWNER', 'MANAGER', 'CONTENT_EDITOR']::admin_role_type[]))
  with check (is_staff(array['OWNER', 'MANAGER', 'CONTENT_EDITOR']::admin_role_type[]));

alter table content_sections enable row level security;
create policy "content_sections_public_read" on content_sections
  for select using (
    is_staff() or exists (
      select 1 from content_posts c
      where c.id = content_sections.post_id and c.status = 'published'
    )
  );
create policy "content_sections_editor_write" on content_sections
  for all using (is_staff(array['OWNER', 'MANAGER', 'CONTENT_EDITOR']::admin_role_type[]))
  with check (is_staff(array['OWNER', 'MANAGER', 'CONTENT_EDITOR']::admin_role_type[]));

alter table content_products enable row level security;
create policy "content_products_public_read" on content_products
  for select using (
    is_staff() or exists (
      select 1 from content_posts c
      where c.id = content_products.post_id and c.status = 'published'
    )
  );
create policy "content_products_editor_write" on content_products
  for all using (is_staff(array['OWNER', 'MANAGER', 'CONTENT_EDITOR']::admin_role_type[]))
  with check (is_staff(array['OWNER', 'MANAGER', 'CONTENT_EDITOR']::admin_role_type[]));

alter table site_settings enable row level security;
create policy "site_settings_public_read" on site_settings
  for select using (true);
create policy "site_settings_staff_write" on site_settings
  for all using (is_staff(array['OWNER', 'MANAGER']::admin_role_type[]))
  with check (is_staff(array['OWNER', 'MANAGER']::admin_role_type[]));

-- ============================================================
-- PRIVATE CUSTOMER DATA — own rows only
-- ============================================================

alter table profiles enable row level security;
create policy "profiles_self_read" on profiles
  for select using (auth.uid() = id or is_staff());
create policy "profiles_self_write" on profiles
  for update using (auth.uid() = id) with check (auth.uid() = id);
create policy "profiles_self_insert" on profiles
  for insert with check (auth.uid() = id);

alter table club_memberships enable row level security;
create policy "club_memberships_self_read" on club_memberships
  for select using (auth.uid() = user_id or is_staff());
create policy "club_memberships_self_insert" on club_memberships
  for insert with check (auth.uid() = user_id);

alter table favorites enable row level security;
create policy "favorites_self_all" on favorites
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

alter table notification_preferences enable row level security;
create policy "notification_preferences_self_all" on notification_preferences
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

alter table discount_entitlements enable row level security;
create policy "discount_entitlements_self_read" on discount_entitlements
  for select using (auth.uid() = user_id or is_staff());
create policy "discount_entitlements_staff_write" on discount_entitlements
  for all using (is_staff()) with check (is_staff());

-- ============================================================
-- ORDERS — customers see only their own; staff see all
-- ============================================================

alter table orders enable row level security;
create policy "orders_owner_or_staff_read" on orders
  for select using (auth.uid() = user_id or is_staff());
create policy "orders_owner_insert" on orders
  for insert with check (auth.uid() = user_id or is_staff());
create policy "orders_staff_update" on orders
  for update using (is_staff()) with check (is_staff());

alter table order_fulfillment_groups enable row level security;
create policy "order_fulfillment_groups_read" on order_fulfillment_groups
  for select using (
    is_staff() or exists (
      select 1 from orders o
      where o.id = order_fulfillment_groups.order_id and o.user_id = auth.uid()
    )
  );
create policy "order_fulfillment_groups_write" on order_fulfillment_groups
  for insert with check (
    is_staff() or exists (
      select 1 from orders o
      where o.id = order_fulfillment_groups.order_id and o.user_id = auth.uid()
    )
  );
create policy "order_fulfillment_groups_staff_update" on order_fulfillment_groups
  for update using (is_staff()) with check (is_staff());

alter table order_items enable row level security;
create policy "order_items_read" on order_items
  for select using (
    is_staff() or exists (
      select 1 from orders o
      where o.id = order_items.order_id and o.user_id = auth.uid()
    )
  );
create policy "order_items_insert" on order_items
  for insert with check (
    is_staff() or exists (
      select 1 from orders o
      where o.id = order_items.order_id and o.user_id = auth.uid()
    )
  );

-- ============================================================
-- AGE VERIFICATION — customer read-only, staff can verify
-- ============================================================

alter table age_verifications enable row level security;
create policy "age_verifications_read" on age_verifications
  for select using (
    is_staff() or exists (
      select 1 from orders o
      where o.id = age_verifications.order_id and o.user_id = auth.uid()
    )
  );
create policy "age_verifications_insert_system" on age_verifications
  for insert with check (
    is_staff() or exists (
      select 1 from orders o
      where o.id = age_verifications.order_id and o.user_id = auth.uid()
    )
  );
-- Only STAFF/MANAGER/OWNER may transition a verification (never the customer).
create policy "age_verifications_staff_update" on age_verifications
  for update using (is_staff(array['OWNER', 'MANAGER', 'STAFF']::admin_role_type[]))
  with check (is_staff(array['OWNER', 'MANAGER', 'STAFF']::admin_role_type[]));

-- ============================================================
-- ADMIN / AUDIT
-- ============================================================

alter table admin_roles enable row level security;
create policy "admin_roles_self_or_owner_read" on admin_roles
  for select using (auth.uid() = user_id or is_staff(array['OWNER']::admin_role_type[]));
create policy "admin_roles_owner_write" on admin_roles
  for all using (is_staff(array['OWNER']::admin_role_type[]))
  with check (is_staff(array['OWNER']::admin_role_type[]));

alter table audit_logs enable row level security;
create policy "audit_logs_staff_read" on audit_logs
  for select using (is_staff());
-- No insert/update/delete policy for regular roles: audit rows are written
-- exclusively via the service-role server client so history stays immutable.
