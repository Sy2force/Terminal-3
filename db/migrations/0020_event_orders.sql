-- ============================================================
-- 0020_event_orders.sql
-- Commandes événementielles : Mariages & Fêtes
-- ============================================================

-- ----------------------------------------------------------------
-- 1. EVENT ORDERS
-- ----------------------------------------------------------------
create table if not exists event_orders (
  id uuid primary key default gen_random_uuid(),
  reference text not null unique,
  access_token text not null unique,

  -- client
  customer_name text not null,
  customer_phone text,
  customer_email text,
  customer_whatsapp text,
  preferred_contact text not null default 'phone',

  -- event
  event_type text not null,
  event_date date,
  event_time time,
  guests_count int,
  budget_agorot int,

  -- fulfillment
  fulfillment_type text not null default 'delivery', -- delivery | pickup
  city text,
  delivery_address text,
  delivery_instructions text,

  -- totals
  subtotal_agorot int not null default 0,
  delivery_fee_agorot int not null default 0,
  discount_agorot int not null default 0,
  total_agorot int not null default 0,

  -- workflow
  status text not null default 'received',
  payment_status text not null default 'none',
  age_verification_required boolean not null default false,
  age_verified_at timestamptz,
  age_verified_by uuid references profiles(id) on delete set null,
  notes text,
  internal_notes text,

  -- meta
  created_by uuid references profiles(id) on delete set null,
  updated_by uuid references profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  submitted_at timestamptz default now()
);

comment on table event_orders is 'Commandes pour Mariages & Fêtes';

-- ----------------------------------------------------------------
-- 2. EVENT ORDER ITEMS
-- ----------------------------------------------------------------
create table if not exists event_order_items (
  id uuid primary key default gen_random_uuid(),
  event_order_id uuid not null references event_orders(id) on delete cascade,
  product_id uuid references products(id) on delete set null,
  variant_id uuid references product_variants(id) on delete set null,
  product_name text not null,
  quantity int not null default 1,
  unit_price_agorot int not null default 0,
  total_price_agorot int not null default 0,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ----------------------------------------------------------------
-- 3. EVENT MESSAGES
-- ----------------------------------------------------------------
create table if not exists event_messages (
  id uuid primary key default gen_random_uuid(),
  event_order_id uuid not null references event_orders(id) on delete cascade,
  sender_role text not null check (sender_role in ('client','staff','admin','system')),
  author_id uuid references profiles(id) on delete set null,
  content text not null,
  is_internal boolean not null default false,
  client_seen_at timestamptz,
  staff_seen_at timestamptz,
  attachments jsonb,
  created_at timestamptz not null default now()
);

-- ----------------------------------------------------------------
-- 4. EVENT ORDER STATUS HISTORY
-- ----------------------------------------------------------------
create table if not exists event_order_status_history (
  id uuid primary key default gen_random_uuid(),
  event_order_id uuid not null references event_orders(id) on delete cascade,
  old_status text,
  new_status text not null,
  changed_by uuid references profiles(id) on delete set null,
  notes text,
  created_at timestamptz not null default now()
);

-- ----------------------------------------------------------------
-- 5. EVENT PAYMENTS
-- ----------------------------------------------------------------
create table if not exists event_payments (
  id uuid primary key default gen_random_uuid(),
  event_order_id uuid not null references event_orders(id) on delete cascade,
  amount_agorot int not null,
  payment_method text,
  payment_status text not null default 'pending',
  notes text,
  recorded_by uuid references profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ----------------------------------------------------------------
-- 6. AGE VERIFICATIONS
-- ----------------------------------------------------------------
create table if not exists event_age_verifications (
  id uuid primary key default gen_random_uuid(),
  event_order_id uuid not null references event_orders(id) on delete cascade,
  birth_date date,
  minimum_age int not null default 18,
  identity_declared boolean not null default false,
  identity_verified boolean not null default false,
  verified_by uuid references profiles(id) on delete set null,
  verified_at timestamptz,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ----------------------------------------------------------------
-- 7. INDEXES
-- ----------------------------------------------------------------
create index if not exists event_orders_reference_idx on event_orders(reference);
create index if not exists event_orders_token_idx on event_orders(access_token);
create index if not exists event_orders_status_idx on event_orders(status);
create index if not exists event_orders_created_at_idx on event_orders(created_at desc);
create index if not exists event_order_items_event_order_id_idx on event_order_items(event_order_id);
create index if not exists event_messages_event_order_id_idx on event_messages(event_order_id);
create index if not exists event_status_history_event_order_id_idx on event_order_status_history(event_order_id);
create index if not exists event_payments_event_order_id_idx on event_payments(event_order_id);
create index if not exists event_age_verifications_event_order_id_idx on event_age_verifications(event_order_id);

-- ----------------------------------------------------------------
-- 8. RLS
-- ----------------------------------------------------------------
alter table event_orders enable row level security;
alter table event_order_items enable row level security;
alter table event_messages enable row level security;
alter table event_order_status_history enable row level security;
alter table event_payments enable row level security;
alter table event_age_verifications enable row level security;

-- Client : accède uniquement via le token (submitted orders)
create policy "event_orders_client_select" on event_orders
  for select to authenticated
  using (customer_email = (select email from auth.users where id = auth.uid()));

create policy "event_orders_public_insert" on event_orders
  for insert to anon
  with check (true);

create policy "event_orders_staff_all" on event_orders
  for all to authenticated
  using (
    exists (
      select 1 from profiles
      where id = auth.uid() and role in ('OWNER','ADMIN','STAFF')
    )
  );

create policy "event_order_items_client_select" on event_order_items
  for select to authenticated
  using (
    exists (
      select 1 from event_orders e
      where e.id = event_order_items.event_order_id
        and e.customer_email = (select email from auth.users where id = auth.uid())
    )
  );

create policy "event_order_items_staff_all" on event_order_items
  for all to authenticated
  using (
    exists (
      select 1 from profiles
      where id = auth.uid() and role in ('OWNER','ADMIN','STAFF')
    )
  );

create policy "event_messages_client_select" on event_messages
  for select to authenticated
  using (
    exists (
      select 1 from event_orders e
      where e.id = event_messages.event_order_id
        and e.customer_email = (select email from auth.users where id = auth.uid())
    )
    and is_internal = false
  );

create policy "event_messages_staff_all" on event_messages
  for all to authenticated
  using (
    exists (
      select 1 from profiles
      where id = auth.uid() and role in ('OWNER','ADMIN','STAFF')
    )
  );

-- status history + payments : staff only
create policy "event_status_history_staff_all" on event_order_status_history
  for all to authenticated
  using (
    exists (
      select 1 from profiles
      where id = auth.uid() and role in ('OWNER','ADMIN','STAFF')
    )
  );

create policy "event_payments_staff_all" on event_payments
  for all to authenticated
  using (
    exists (
      select 1 from profiles
      where id = auth.uid() and role in ('OWNER','ADMIN','STAFF')
    )
  );

create policy "event_age_verifications_client_select" on event_age_verifications
  for select to authenticated
  using (
    exists (
      select 1 from event_orders e
      where e.id = event_age_verifications.event_order_id
        and e.customer_email = (select email from auth.users where id = auth.uid())
    )
  );

create policy "event_age_verifications_staff_all" on event_age_verifications
  for all to authenticated
  using (
    exists (
      select 1 from profiles
      where id = auth.uid() and role in ('OWNER','ADMIN','STAFF')
    )
  );

-- ----------------------------------------------------------------
-- 9. TRIGGER : update updated_at
-- ----------------------------------------------------------------
create or replace function set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger if not exists event_orders_updated_at
  before update on event_orders
  for each row execute function set_updated_at();

create trigger if not exists event_order_items_updated_at
  before update on event_order_items
  for each row execute function set_updated_at();

create trigger if not exists event_payments_updated_at
  before update on event_payments
  for each row execute function set_updated_at();

create trigger if not exists event_age_verifications_updated_at
  before update on event_age_verifications
  for each row execute function set_updated_at();
