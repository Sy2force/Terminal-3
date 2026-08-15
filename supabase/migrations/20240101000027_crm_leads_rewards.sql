-- ============================================================
-- 0027_crm_leads_rewards.sql
-- CRM (tags, notes, activities, assignments), leads pipeline, and reward /
-- discount configuration tables. Additive only — does not touch existing
-- loyalty_tiers / loyalty_accounts / loyalty_transactions.
-- ============================================================

begin;

-- ============================================================
-- 1. CRM STATUS ON PROFILES
-- ============================================================

do $$ begin
  create type crm_status as enum (
    'new', 'to_verify', 'prospect', 'client', 'loyal', 'vip', 'inactive', 'to_follow_up', 'blocked'
  );
exception when duplicate_object then null; end $$;

alter table profiles
  add column if not exists crm_status crm_status not null default 'new',
  add column if not exists acquisition_source text,
  add column if not exists assigned_admin_id uuid references profiles(id) on delete set null;

-- ============================================================
-- 2. TAGS
-- ============================================================

create table if not exists tags (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  color text,
  created_at timestamptz not null default now()
);

create table if not exists customer_tags (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references profiles(id) on delete cascade,
  tag_id uuid not null references tags(id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (user_id, tag_id)
);

-- ============================================================
-- 3. INTERNAL NOTES (never visible to the customer)
-- ============================================================

create table if not exists customer_notes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references profiles(id) on delete cascade,
  note text not null,
  author_id uuid references profiles(id) on delete set null,
  created_at timestamptz not null default now()
);

-- ============================================================
-- 4. CRM ACTIVITY TIMELINE (calls, notes, status changes...)
-- ============================================================

create table if not exists crm_activities (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references profiles(id) on delete cascade,
  type text not null,
  description text not null,
  actor_id uuid references profiles(id) on delete set null,
  created_at timestamptz not null default now()
);

-- ============================================================
-- 5. LEADS
-- ============================================================

do $$ begin
  create type lead_status as enum (
    'new', 'to_contact', 'contacted', 'interested', 'converting', 'converted', 'lost'
  );
exception when duplicate_object then null; end $$;

create table if not exists leads (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  phone text,
  email text,
  source text not null default 'manual',
  status lead_status not null default 'new',
  assigned_admin_id uuid references profiles(id) on delete set null,
  interest text,
  category_of_interest text,
  notes text,
  next_follow_up_at timestamptz,
  marketing_opt_in boolean not null default false,
  converted_user_id uuid references profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_leads_status on leads (status);
create index if not exists idx_leads_assigned on leads (assigned_admin_id);

-- ============================================================
-- 6. REWARDS / DISCOUNTS (complements loyalty_* from 0024)
-- ============================================================

create table if not exists reward_rules (
  id uuid primary key default gen_random_uuid(),
  key text not null unique,
  name_fr text not null,
  description text,
  trigger_type text not null, -- e.g. 'order_count', 'total_spend', 'birthday'
  trigger_value numeric,
  reward_type text not null, -- e.g. 'discount_percent', 'free_delivery', 'points_bonus'
  reward_value numeric,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists customer_rewards (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references profiles(id) on delete cascade,
  reward_rule_id uuid references reward_rules(id) on delete set null,
  status text not null default 'available' check (status in ('available', 'redeemed', 'expired', 'revoked')),
  granted_at timestamptz not null default now(),
  expires_at timestamptz,
  redeemed_at timestamptz,
  order_id uuid references orders(id) on delete set null
);

create table if not exists discount_rules (
  id uuid primary key default gen_random_uuid(),
  code text unique,
  name_fr text not null,
  discount_type text not null check (discount_type in ('percent', 'fixed_amount')),
  discount_value numeric not null,
  min_order_agorot integer not null default 0,
  max_discount_agorot integer,
  starts_at timestamptz,
  ends_at timestamptz,
  max_uses integer,
  max_uses_per_customer integer default 1,
  eligible_category_ids uuid[] default '{}',
  excluded_product_ids uuid[] default '{}',
  excluded_brand_ids uuid[] default '{}',
  eligible_tier_ids uuid[] default '{}',
  stackable boolean not null default false,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists discount_redemptions (
  id uuid primary key default gen_random_uuid(),
  discount_rule_id uuid not null references discount_rules(id) on delete cascade,
  user_id uuid references profiles(id) on delete set null,
  order_id uuid references orders(id) on delete set null,
  amount_agorot integer not null,
  created_at timestamptz not null default now()
);

create table if not exists promotion_exclusions (
  id uuid primary key default gen_random_uuid(),
  discount_rule_id uuid not null references discount_rules(id) on delete cascade,
  excluded_discount_rule_id uuid not null references discount_rules(id) on delete cascade,
  unique (discount_rule_id, excluded_discount_rule_id)
);

-- ============================================================
-- RLS — all of the above are staff/admin-managed; customers never write
-- to them directly (rewards/discounts are applied server-side only).
-- ============================================================

alter table tags enable row level security;
drop policy if exists "tags_admin_all" on tags;
create policy "tags_admin_all" on tags for all using (is_admin_user()) with check (is_admin_user());

alter table customer_tags enable row level security;
drop policy if exists "customer_tags_admin_all" on customer_tags;
create policy "customer_tags_admin_all" on customer_tags for all using (is_admin_user()) with check (is_admin_user());

alter table customer_notes enable row level security;
drop policy if exists "customer_notes_admin_all" on customer_notes;
create policy "customer_notes_admin_all" on customer_notes for all using (is_admin_user()) with check (is_admin_user());

alter table crm_activities enable row level security;
drop policy if exists "crm_activities_admin_all" on crm_activities;
create policy "crm_activities_admin_all" on crm_activities for all using (is_admin_user()) with check (is_admin_user());

alter table leads enable row level security;
drop policy if exists "leads_admin_all" on leads;
create policy "leads_admin_all" on leads for all using (is_admin_user()) with check (is_admin_user());

alter table reward_rules enable row level security;
drop policy if exists "reward_rules_public_read" on reward_rules;
create policy "reward_rules_public_read" on reward_rules for select using (is_active = true);
drop policy if exists "reward_rules_admin_write" on reward_rules;
create policy "reward_rules_admin_write" on reward_rules for all using (is_admin_user()) with check (is_admin_user());

alter table customer_rewards enable row level security;
drop policy if exists "customer_rewards_owner_read" on customer_rewards;
create policy "customer_rewards_owner_read" on customer_rewards for select using (auth.uid() = user_id);
drop policy if exists "customer_rewards_admin_all" on customer_rewards;
create policy "customer_rewards_admin_all" on customer_rewards for all using (is_admin_user()) with check (is_admin_user());

alter table discount_rules enable row level security;
drop policy if exists "discount_rules_public_read" on discount_rules;
create policy "discount_rules_public_read" on discount_rules for select using (is_active = true);
drop policy if exists "discount_rules_admin_write" on discount_rules;
create policy "discount_rules_admin_write" on discount_rules for all using (is_admin_user()) with check (is_admin_user());

alter table discount_redemptions enable row level security;
drop policy if exists "discount_redemptions_owner_read" on discount_redemptions;
create policy "discount_redemptions_owner_read" on discount_redemptions for select using (auth.uid() = user_id);
drop policy if exists "discount_redemptions_admin_all" on discount_redemptions;
create policy "discount_redemptions_admin_all" on discount_redemptions for all using (is_admin_user()) with check (is_admin_user());

alter table promotion_exclusions enable row level security;
drop policy if exists "promotion_exclusions_admin_all" on promotion_exclusions;
create policy "promotion_exclusions_admin_all" on promotion_exclusions for all using (is_admin_user()) with check (is_admin_user());

commit;
