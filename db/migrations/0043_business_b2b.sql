-- ============================================================
-- 0043_business_b2b.sql
-- B2B / Bar parcours foundation.
-- Additive-only: extends profiles, orders and order_items; adds
-- bar_profiles, product_requests and pro_price_history. Existing
-- rows keep working (account_type defaults to 'personal',
-- order_type defaults to 'personal', pro_price_agorot is nullable).
-- ============================================================

begin;

-- ============================================================
-- 1. ACCOUNT TYPE ON PROFILES
-- ============================================================

do $$ begin
  create type account_type as enum ('personal', 'business');
exception when duplicate_object then null; end $$;

alter table profiles
  add column if not exists account_type account_type not null default 'personal',
  add column if not exists preferred_contact_channel text
    check (preferred_contact_channel is null
           or preferred_contact_channel in ('phone', 'whatsapp', 'email'));

create index if not exists idx_profiles_account_type on profiles (account_type);

-- ============================================================
-- 2. BAR PROFILES (business info, 1:1 with profile)
-- ============================================================

do $$ begin
  create type bar_status as enum ('new', 'contacted', 'qualified', 'approved', 'inactive');
exception when duplicate_object then null; end $$;

do $$ begin
  create type pickup_preference as enum ('self', 'delegate', 'delivery_when_available');
exception when duplicate_object then null; end $$;

create table if not exists bar_profiles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references profiles(id) on delete cascade,
  -- Business identity
  business_name text not null,
  legal_name text,
  registration_number text,           -- ח״פ / עוסק
  -- Contact
  contact_first_name text not null,
  contact_last_name text not null,
  contact_phone text not null,
  whatsapp_number text,
  contact_email text,
  -- Bar location
  address text,
  city text,
  postal_code text,
  -- Operations
  preferred_contact_window text,     -- free text: "9h-13h", etc.
  pickup_preference pickup_preference default 'self',
  notes text,
  -- Lifecycle
  status bar_status not null default 'new',
  approved_at timestamptz,
  approved_by uuid references profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  -- One business profile per user
  unique (user_id)
);

create index if not exists idx_bar_profiles_status on bar_profiles (status);
create index if not exists idx_bar_profiles_business_name on bar_profiles (business_name);
create index if not exists idx_bar_profiles_city on bar_profiles (city);

-- Keep updated_at fresh via trigger
create or replace function set_bar_profiles_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at := now();
  return new;
end
$$;

drop trigger if exists trg_bar_profiles_updated_at on bar_profiles;
create trigger trg_bar_profiles_updated_at
  before update on bar_profiles
  for each row execute function set_bar_profiles_updated_at();

-- ============================================================
-- 3. LEAD LINK — auto-record bar signups in the leads table
--    (reuses the existing 0027_crm_leads_rewards.sql leads table
--     so admins see them in /admin/leads without duplication)
-- ============================================================

-- Add source-specific link on the leads table so we can point back to
-- the bar_profile that created the lead (nullable — existing leads are
-- untouched).
alter table leads
  add column if not exists bar_profile_id uuid references bar_profiles(id) on delete set null;

create index if not exists idx_leads_bar_profile on leads (bar_profile_id);

-- ============================================================
-- 4. EXTEND ORDERS FOR B2B FLOW (additive)
-- ============================================================

do $$ begin
  create type order_type as enum ('personal', 'business');
exception when duplicate_object then null; end $$;

do $$ begin
  create type intended_payment_method as enum ('cash', 'card', 'bit', 'other');
exception when duplicate_object then null; end $$;

alter table orders
  add column if not exists order_type order_type not null default 'personal',
  add column if not exists bar_profile_id uuid references bar_profiles(id) on delete set null,
  -- Business quote workflow
  add column if not exists quote_total_agorot integer,
  add column if not exists quote_sent_at timestamptz,
  add column if not exists quote_approved_at timestamptz,
  add column if not exists quote_rejected_at timestamptz,
  add column if not exists quote_notes text,
  -- Estimation given at acceptance (15/30/45 min or explicit datetime)
  add column if not exists ready_estimate_at timestamptz,
  add column if not exists ready_estimate_label text,      -- "15 min", "30 min", "1h30", etc.
  -- Intended vs actual payment (in-store only)
  add column if not exists intended_payment_method intended_payment_method,
  add column if not exists payment_method_actual text,     -- 'cash' | 'card' | 'bit' | ...
  add column if not exists payment_status text not null default 'unpaid'
    check (payment_status in ('unpaid', 'paid_in_store', 'refunded', 'cancelled')),
  add column if not exists paid_at timestamptz,
  add column if not exists paid_by uuid references profiles(id) on delete set null,
  -- Physical ID check at pickup (18+ gate)
  add column if not exists id_checked_at timestamptz,
  add column if not exists id_checked_by uuid references profiles(id) on delete set null,
  -- Public-facing display id like T3-2026-000123 (populated by trigger below)
  add column if not exists public_order_number text unique;

create index if not exists idx_orders_order_type on orders (order_type);
create index if not exists idx_orders_bar_profile on orders (bar_profile_id);
create index if not exists idx_orders_payment_status on orders (payment_status);

-- Sequence + trigger to assign a stable public number without breaking
-- the uuid `id`. Idempotent.
create sequence if not exists orders_public_number_seq;

create or replace function assign_public_order_number()
returns trigger language plpgsql as $$
declare
  y int := extract(year from now())::int;
  n bigint;
begin
  if new.public_order_number is null then
    n := nextval('orders_public_number_seq');
    new.public_order_number := 'T3-' || y::text || '-' || lpad(n::text, 6, '0');
  end if;
  return new;
end
$$;

drop trigger if exists trg_orders_public_number on orders;
create trigger trg_orders_public_number
  before insert on orders
  for each row execute function assign_public_order_number();

-- Backfill existing rows once so history has stable numbers too.
update orders
   set public_order_number = 'T3-' || extract(year from created_at)::text
                              || '-' || lpad(nextval('orders_public_number_seq')::text, 6, '0')
 where public_order_number is null;

-- ============================================================
-- 5. EXTEND ORDER_ITEMS WITH PRO PRICING (additive)
-- ============================================================

do $$ begin
  create type price_source as enum ('public', 'pro_price', 'quote');
exception when duplicate_object then null; end $$;

alter table order_items
  add column if not exists pro_price_agorot_snapshot integer,
  add column if not exists price_source price_source not null default 'public',
  add column if not exists line_notes text,
  add column if not exists pack_type text
    check (pack_type is null or pack_type in ('unit', 'pack', 'case'));

-- Historised pro-price changes per order_item (so a client sees the
-- history of what price was proposed by the store before approving).
create table if not exists pro_price_history (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references orders(id) on delete cascade,
  order_item_id uuid references order_items(id) on delete cascade,
  product_id uuid references products(id) on delete set null,
  variant_id uuid references product_variants(id) on delete set null,
  old_price_agorot integer,
  new_price_agorot integer not null,
  reason text,
  changed_by uuid references profiles(id) on delete set null,
  created_at timestamptz not null default now()
);

create index if not exists idx_pro_price_history_order on pro_price_history (order_id);

-- ============================================================
-- 6. PRODUCT REQUESTS (in-catalog OR out-of-catalog, bar or personal)
-- ============================================================

do $$ begin
  create type product_request_status as enum (
    'new', 'reviewing', 'quoted', 'accepted', 'declined', 'fulfilled', 'cancelled'
  );
exception when duplicate_object then null; end $$;

do $$ begin
  create type product_request_kind as enum ('in_catalog', 'out_of_catalog');
exception when duplicate_object then null; end $$;

create table if not exists product_requests (
  id uuid primary key default gen_random_uuid(),
  -- Public reference (T3R-2026-000123)
  public_reference text unique,
  user_id uuid not null references profiles(id) on delete cascade,
  bar_profile_id uuid references bar_profiles(id) on delete set null,
  kind product_request_kind not null,
  -- Snapshot of what the customer typed (never trust the client for pricing)
  requested_type text,          -- "wine" | "whisky" | ...
  requested_brand text,
  requested_name text,
  requested_volume_ml integer,
  requested_quantity integer not null default 1,
  requested_budget_agorot integer,
  photo_url text,
  comment text,
  -- If they found a candidate in the catalog
  product_id uuid references products(id) on delete set null,
  variant_id uuid references product_variants(id) on delete set null,
  -- Admin fields
  status product_request_status not null default 'new',
  quote_price_agorot integer,
  quote_note text,
  admin_response text,
  handled_by uuid references profiles(id) on delete set null,
  handled_at timestamptz,
  -- Once accepted, we may link to an order created from this request
  order_id uuid references orders(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_product_requests_user on product_requests (user_id);
create index if not exists idx_product_requests_status on product_requests (status);
create index if not exists idx_product_requests_kind on product_requests (kind);
create index if not exists idx_product_requests_bar on product_requests (bar_profile_id);

create sequence if not exists product_requests_public_seq;

create or replace function assign_product_request_ref()
returns trigger language plpgsql as $$
declare
  y int := extract(year from now())::int;
  n bigint;
begin
  if new.public_reference is null then
    n := nextval('product_requests_public_seq');
    new.public_reference := 'T3R-' || y::text || '-' || lpad(n::text, 6, '0');
  end if;
  return new;
end
$$;

drop trigger if exists trg_product_requests_ref on product_requests;
create trigger trg_product_requests_ref
  before insert on product_requests
  for each row execute function assign_product_request_ref();

create or replace function set_product_requests_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at := now();
  return new;
end
$$;

drop trigger if exists trg_product_requests_updated_at on product_requests;
create trigger trg_product_requests_updated_at
  before update on product_requests
  for each row execute function set_product_requests_updated_at();

-- ============================================================
-- 7. RLS
-- ============================================================

-- bar_profiles: customer owns their own; admins full
alter table bar_profiles enable row level security;

drop policy if exists "bar_profiles_self_read" on bar_profiles;
create policy "bar_profiles_self_read" on bar_profiles
  for select using (auth.uid() = user_id or is_admin_user());

drop policy if exists "bar_profiles_self_insert" on bar_profiles;
create policy "bar_profiles_self_insert" on bar_profiles
  for insert with check (auth.uid() = user_id);

drop policy if exists "bar_profiles_self_update" on bar_profiles;
create policy "bar_profiles_self_update" on bar_profiles
  for update using (auth.uid() = user_id)
  with check (auth.uid() = user_id);
-- Note: customers can update their info but never their own status
-- (see trg_bar_profiles_no_status_change below).

-- Trigger: block non-admins from changing status on bar_profiles.
create or replace function forbid_bar_profile_status_change()
returns trigger language plpgsql security definer as $$
begin
  if tg_op = 'UPDATE'
     and new.status is distinct from old.status
     and not is_admin_user() then
    raise exception 'Only admins can change bar_profiles.status';
  end if;
  return new;
end
$$;

drop trigger if exists trg_bar_profiles_no_status_change on bar_profiles;
create trigger trg_bar_profiles_no_status_change
  before update on bar_profiles
  for each row execute function forbid_bar_profile_status_change();

drop policy if exists "bar_profiles_admin_all" on bar_profiles;
create policy "bar_profiles_admin_all" on bar_profiles
  for all using (is_admin_user()) with check (is_admin_user());

-- product_requests: customer owns; admins full
alter table product_requests enable row level security;

drop policy if exists "product_requests_self_read" on product_requests;
create policy "product_requests_self_read" on product_requests
  for select using (auth.uid() = user_id or is_admin_user());

drop policy if exists "product_requests_self_insert" on product_requests;
create policy "product_requests_self_insert" on product_requests
  for insert with check (auth.uid() = user_id);

drop policy if exists "product_requests_self_update" on product_requests;
create policy "product_requests_self_update" on product_requests
  for update using (auth.uid() = user_id and status in ('new', 'reviewing'))
  with check (auth.uid() = user_id);
-- Customers can cancel/edit only while the store hasn't quoted yet.

drop policy if exists "product_requests_admin_all" on product_requests;
create policy "product_requests_admin_all" on product_requests
  for all using (is_admin_user()) with check (is_admin_user());

-- pro_price_history: customer reads their own (via order ownership), admins full
alter table pro_price_history enable row level security;

drop policy if exists "pro_price_history_read" on pro_price_history;
create policy "pro_price_history_read" on pro_price_history
  for select using (
    is_admin_user() or exists (
      select 1 from orders o
      where o.id = pro_price_history.order_id and o.user_id = auth.uid()
    )
  );

drop policy if exists "pro_price_history_admin_write" on pro_price_history;
create policy "pro_price_history_admin_write" on pro_price_history
  for all using (is_admin_user()) with check (is_admin_user());

commit;
