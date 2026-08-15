-- ============================================================
-- 0030_inventory_tracking.sql
-- Inventory movements, stock reservations and stock alerts.
-- Every quantity change is tracked; reservations protect against
-- overselling between checkout and order confirmation.
-- ============================================================

begin;

-- ------------------------------------------------------------
-- 1. ENUMS
-- ------------------------------------------------------------

do $$ begin
  create type inventory_movement_type as enum (
    'purchase', 'sale', 'reservation', 'reservation_release', 'return',
    'adjustment', 'loss', 'damaged'
  );
exception
  when duplicate_object then null;
end $$;

do $$ begin
  create type stock_reservation_status as enum ('active', 'converted', 'expired', 'cancelled');
exception
  when duplicate_object then null;
end $$;

-- ------------------------------------------------------------
-- 2. INVENTORY MOVEMENTS
-- ------------------------------------------------------------

create table if not exists inventory_movements (
  id uuid primary key default gen_random_uuid(),
  variant_id uuid not null references product_variants(id) on delete restrict,
  branch_id uuid references branches(id) on delete set null,
  movement_type inventory_movement_type not null,
  quantity integer not null,
  quantity_before integer not null,
  quantity_after integer not null,
  reason text,
  order_id uuid references orders(id) on delete set null,
  reservation_id uuid,
  created_by uuid references auth.users(id) on delete set null,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

-- ------------------------------------------------------------
-- 3. STOCK RESERVATIONS
-- ------------------------------------------------------------

create table if not exists stock_reservations (
  id uuid primary key default gen_random_uuid(),
  variant_id uuid not null references product_variants(id) on delete restrict,
  branch_id uuid references branches(id) on delete set null,
  quantity integer not null check (quantity > 0),
  status stock_reservation_status not null default 'active',
  order_id uuid references orders(id) on delete set null,
  cart_id uuid references carts(id) on delete set null,
  expires_at timestamptz not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ------------------------------------------------------------
-- 4. STOCK ALERTS
-- ------------------------------------------------------------

create table if not exists stock_alerts (
  id uuid primary key default gen_random_uuid(),
  variant_id uuid not null references product_variants(id) on delete cascade,
  branch_id uuid references branches(id) on delete set null,
  threshold integer not null check (threshold >= 0),
  is_triggered boolean not null default false,
  triggered_at timestamptz,
  resolved_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (variant_id, branch_id)
);

-- ------------------------------------------------------------
-- 5. INDEXES
-- ------------------------------------------------------------

create index if not exists idx_inventory_movements_variant on inventory_movements(variant_id);
create index if not exists idx_inventory_movements_created on inventory_movements(created_at);
create index if not exists idx_stock_reservations_variant on stock_reservations(variant_id);
create index if not exists idx_stock_reservations_expires on stock_reservations(expires_at) where status = 'active';
create index if not exists idx_stock_reservations_order on stock_reservations(order_id);
create index if not exists idx_stock_alerts_triggered on stock_alerts(is_triggered, created_at) where is_triggered = true;

-- ------------------------------------------------------------
-- 6. RLS
-- ------------------------------------------------------------

alter table inventory_movements enable row level security;
create policy "inventory_movements_staff_read" on inventory_movements
  for select using (is_staff());
create policy "inventory_movements_staff_write" on inventory_movements
  for all using (is_staff(array['OWNER', 'MANAGER', 'STAFF']::admin_role_type[]))
  with check (is_staff(array['OWNER', 'MANAGER', 'STAFF']::admin_role_type[]));

alter table stock_reservations enable row level security;
create policy "stock_reservations_staff_read" on stock_reservations
  for select using (is_staff());

create policy "stock_reservations_owner_read" on stock_reservations
  for select using (
    exists (
      select 1 from carts c
      where c.id = stock_reservations.cart_id and c.user_id = auth.uid()
    )
  );

alter table stock_alerts enable row level security;
create policy "stock_alerts_staff_read" on stock_alerts
  for select using (is_staff());
create policy "stock_alerts_staff_write" on stock_alerts
  for all using (is_staff(array['OWNER', 'MANAGER', 'STAFF']::admin_role_type[]))
  with check (is_staff(array['OWNER', 'MANAGER', 'STAFF']::admin_role_type[]));

-- ------------------------------------------------------------
-- 7. TRIGGERS
-- ------------------------------------------------------------

create or replace function set_stock_tracking_updated_at()
returns trigger as $$
begin
  new.updated_at := now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists stock_reservations_updated_at on stock_reservations;
create trigger stock_reservations_updated_at
  before update on stock_reservations
  for each row execute function set_stock_tracking_updated_at();

drop trigger if exists stock_alerts_updated_at on stock_alerts;
create trigger stock_alerts_updated_at
  before update on stock_alerts
  for each row execute function set_stock_tracking_updated_at();

commit;
