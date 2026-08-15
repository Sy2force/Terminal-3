-- ============================================================
-- 0024_client_id_loyalty_notifications.sql
-- Unique customer-facing client numbers, a configurable loyalty program,
-- and an internal notification center.
-- ============================================================

begin;

-- ============================================================
-- 1. CLIENT NUMBER (never expose the raw Supabase UUID in the UI)
-- ============================================================

create sequence if not exists client_number_seq start 100;

alter table profiles
  add column if not exists client_number text unique;

create or replace function assign_client_number()
returns trigger as $$
begin
  if new.client_number is null then
    new.client_number := 'T3-CL-' || lpad(nextval('client_number_seq')::text, 6, '0');
  end if;
  return new;
end;
$$ language plpgsql;

drop trigger if exists assign_client_number_on_insert on profiles;
create trigger assign_client_number_on_insert
  before insert on profiles
  for each row execute function assign_client_number();

-- Backfill any existing profiles created before this migration.
update profiles set client_number = 'T3-CL-' || lpad(nextval('client_number_seq')::text, 6, '0')
where client_number is null;

-- ============================================================
-- 2. LOYALTY PROGRAM (tiers, accounts, transactions)
-- ============================================================

create table if not exists loyalty_tiers (
  id uuid primary key default gen_random_uuid(),
  key text not null unique,
  name_fr text not null,
  name_he text,
  min_spend_agorot integer not null default 0,
  display_order integer not null default 0,
  points_multiplier numeric(4, 2) not null default 1.0,
  perks jsonb not null default '[]'::jsonb,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_loyalty_tiers_min_spend on loyalty_tiers (min_spend_agorot);

insert into loyalty_tiers (key, name_fr, name_he, min_spend_agorot, display_order, points_multiplier, perks)
values
  ('decouverte', 'Découverte', 'גילוי', 0, 0, 1.0, '["1 point par 10₪ dépensé"]'::jsonb),
  ('amateur', 'Amateur', 'חובב', 100000, 1, 1.1, '["Offres personnalisées"]'::jsonb),
  ('connaisseur', 'Connaisseur', 'מומחה', 250000, 2, 1.25, '["Accès anticipé aux nouveautés"]'::jsonb),
  ('prestige', 'Prestige', 'יוקרה', 500000, 3, 1.5, '["Livraison offerte"]'::jsonb),
  ('collectionneur', 'Collectionneur', 'אספן', 1000000, 4, 2.0, '["Cadeau d''anniversaire", "Avantages VIP"]'::jsonb)
on conflict (key) do nothing;

create table if not exists loyalty_accounts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique references profiles(id) on delete cascade,
  tier_id uuid references loyalty_tiers(id),
  points_balance integer not null default 0,
  lifetime_points integer not null default 0,
  total_spent_agorot integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists loyalty_transactions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references profiles(id) on delete cascade,
  order_id uuid references orders(id) on delete set null,
  delta_points integer not null,
  balance_before integer not null,
  balance_after integer not null,
  reason text not null,
  origin text not null default 'automatic' check (origin in ('automatic', 'administrative')),
  created_by uuid references profiles(id) on delete set null,
  created_at timestamptz not null default now()
);

create index if not exists idx_loyalty_transactions_user on loyalty_transactions (user_id);
create index if not exists idx_loyalty_transactions_order on loyalty_transactions (order_id);

-- RLS
alter table loyalty_tiers enable row level security;
drop policy if exists "loyalty_tiers_public_read" on loyalty_tiers;
create policy "loyalty_tiers_public_read" on loyalty_tiers for select using (true);
drop policy if exists "loyalty_tiers_admin_write" on loyalty_tiers;
create policy "loyalty_tiers_admin_write" on loyalty_tiers for all using (is_admin_user()) with check (is_admin_user());

alter table loyalty_accounts enable row level security;
drop policy if exists "loyalty_accounts_owner_read" on loyalty_accounts;
create policy "loyalty_accounts_owner_read" on loyalty_accounts for select using (auth.uid() = user_id);
drop policy if exists "loyalty_accounts_admin_all" on loyalty_accounts;
create policy "loyalty_accounts_admin_all" on loyalty_accounts for all using (is_admin_user()) with check (is_admin_user());

alter table loyalty_transactions enable row level security;
drop policy if exists "loyalty_transactions_owner_read" on loyalty_transactions;
create policy "loyalty_transactions_owner_read" on loyalty_transactions for select using (auth.uid() = user_id);
drop policy if exists "loyalty_transactions_admin_all" on loyalty_transactions;
create policy "loyalty_transactions_admin_all" on loyalty_transactions for all using (is_admin_user()) with check (is_admin_user());

-- ============================================================
-- 3. CUSTOMER NOTIFICATIONS
-- (distinct from the existing staff-facing `notifications` table added in
-- 0018_admin_foundation.sql, which has no user_id and is for internal ops
-- alerts — this one is the customer-facing notification center.)
-- ============================================================

create table if not exists customer_notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references profiles(id) on delete cascade,
  type text not null,
  title text not null,
  body text,
  read_at timestamptz,
  created_at timestamptz not null default now()
);

create index if not exists idx_customer_notifications_user on customer_notifications (user_id, created_at desc);

alter table customer_notifications enable row level security;
-- Customers can read and mark their own notifications as read, but cannot
-- create or delete notifications themselves (those are system/admin issued).
drop policy if exists "customer_notifications_owner_read" on customer_notifications;
create policy "customer_notifications_owner_read" on customer_notifications for select using (auth.uid() = user_id);
drop policy if exists "customer_notifications_owner_update" on customer_notifications;
create policy "customer_notifications_owner_update" on customer_notifications for update
  using (auth.uid() = user_id) with check (auth.uid() = user_id);
drop policy if exists "customer_notifications_admin_all" on customer_notifications;
create policy "customer_notifications_admin_all" on customer_notifications for all using (is_admin_user()) with check (is_admin_user());

commit;
