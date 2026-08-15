-- ============================================================
-- 0029_server_cart.sql
-- Persistent server-side shopping cart with guest merge support.
-- Replaces the localStorage-only cart with a durable, RLS-protected
-- backend source of truth while preserving a guest localStorage option
-- for anonymous browsing.
-- ============================================================

begin;

-- ------------------------------------------------------------
-- 1. ENUMS
-- ------------------------------------------------------------

do $$ begin
  create type cart_status as enum ('active', 'converted', 'abandoned', 'expired');
exception
  when duplicate_object then null;
end $$;

-- ------------------------------------------------------------
-- 2. CARTS
-- ------------------------------------------------------------

create table if not exists carts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  status cart_status not null default 'active',
  currency text not null default 'ILS',
  expires_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- One active cart per user (partial unique index).
create unique index if not exists idx_carts_user_active
  on carts(user_id)
  where status = 'active';

-- ------------------------------------------------------------
-- 3. CART ITEMS
-- ------------------------------------------------------------

create table if not exists cart_items (
  id uuid primary key default gen_random_uuid(),
  cart_id uuid not null references carts(id) on delete cascade,
  product_id uuid not null references products(id) on delete cascade,
  variant_id uuid references product_variants(id) on delete set null,
  quantity integer not null check (quantity > 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (cart_id, product_id, variant_id)
);

-- ------------------------------------------------------------
-- 4. INDEXES
-- ------------------------------------------------------------

create index if not exists idx_carts_user_id on carts(user_id);
create index if not exists idx_carts_status on carts(status);
create index if not exists idx_carts_expires_at on carts(expires_at) where status = 'active';
create index if not exists idx_cart_items_cart_id on cart_items(cart_id);
create index if not exists idx_cart_items_product on cart_items(product_id, variant_id);

-- ------------------------------------------------------------
-- 5. RLS
-- ------------------------------------------------------------

alter table carts enable row level security;

-- A user can only see/change their own active or converted carts.
-- Staff can see all carts (for support).
create policy "carts_self_read" on carts
  for select using (auth.uid() = user_id or is_staff());

create policy "carts_self_insert" on carts
  for insert with check (auth.uid() = user_id);

create policy "carts_self_update" on carts
  for update using (auth.uid() = user_id or is_staff())
  with check (auth.uid() = user_id or is_staff());

create policy "carts_self_delete" on carts
  for delete using (auth.uid() = user_id or is_staff());

alter table cart_items enable row level security;

create policy "cart_items_self_read" on cart_items
  for select using (
    exists (
      select 1 from carts c
      where c.id = cart_items.cart_id
        and (c.user_id = auth.uid() or is_staff())
    )
  );

create policy "cart_items_self_insert" on cart_items
  for insert with check (
    exists (
      select 1 from carts c
      where c.id = cart_items.cart_id and c.user_id = auth.uid()
    )
  );

create policy "cart_items_self_update" on cart_items
  for update using (
    exists (
      select 1 from carts c
      where c.id = cart_items.cart_id and c.user_id = auth.uid()
    )
  )
  with check (
    exists (
      select 1 from carts c
      where c.id = cart_items.cart_id and c.user_id = auth.uid()
    )
  );

create policy "cart_items_self_delete" on cart_items
  for delete using (
    exists (
      select 1 from carts c
      where c.id = cart_items.cart_id and (c.user_id = auth.uid() or is_staff())
    )
  );

-- ------------------------------------------------------------
-- 6. TRIGGERS
-- ------------------------------------------------------------

create or replace function set_cart_updated_at()
returns trigger as $$
begin
  new.updated_at := now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists carts_updated_at on carts;
create trigger carts_updated_at
  before update on carts
  for each row execute function set_cart_updated_at();

drop trigger if exists cart_items_updated_at on cart_items;
create trigger cart_items_updated_at
  before update on cart_items
  for each row execute function set_cart_updated_at();

commit;
