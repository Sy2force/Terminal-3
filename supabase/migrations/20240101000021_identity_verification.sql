-- ============================================================
-- 0021_identity_verification.sql
-- Customer identity verification, addresses and enhanced audit
-- ============================================================

do $$ begin
  create type verification_status as enum ('pending_verification', 'verified', 'rejected', 'suspended');
exception
  when duplicate_object then null;
end $$;

do $$ begin
  create type verification_document_side as enum ('front', 'back');
exception
  when duplicate_object then null;
end $$;

-- Profiles extension
alter table if exists profiles
  add column if not exists first_name text,
  add column if not exists last_name text,
  add column if not exists date_of_birth date,
  add column if not exists phone text unique,
  add column if not exists verification_status verification_status not null default 'pending_verification',
  add column if not exists verification_decided_at timestamptz,
  add column if not exists verification_decided_by uuid references auth.users(id) on delete set null,
  add column if not exists verification_reason text,
  add column if not exists terms_accepted boolean not null default false,
  add column if not exists privacy_accepted boolean not null default false,
  add column if not exists created_at timestamptz not null default now(),
  add column if not exists updated_at timestamptz not null default now();

-- Customer addresses
 create table if not exists customer_addresses (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  city text not null,
  street text not null,
  building_number text,
  apartment text,
  postal_code text,
  delivery_instructions text,
  is_default boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Identity verification documents
 create table if not exists identity_verifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  side verification_document_side not null default 'front',
  storage_path text not null,
  file_name text not null,
  content_type text,
  file_size_bytes int not null,
  mime_type text not null,
  status text not null default 'pending',
  reviewed_by uuid references auth.users(id) on delete set null,
  reviewed_at timestamptz,
  review_notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Ensure single active default address per user
 create unique index if not exists idx_customer_addresses_default
  on customer_addresses(user_id) where is_default = true;

create index if not exists idx_profiles_verification_status on profiles(verification_status);
create index if not exists idx_identity_verifications_user on identity_verifications(user_id);
create index if not exists idx_identity_verifications_status on identity_verifications(status);

-- audit_logs already exists (see 0001_init.sql: actor_user_id, action,
-- entity_type, entity_id, metadata). Extend it with a target_user_id and
-- reason so verification decisions can be tracked without duplicating the
-- table.
alter table audit_logs
  add column if not exists target_user_id uuid references auth.users(id) on delete set null,
  add column if not exists reason text;

create index if not exists idx_audit_logs_target on audit_logs(target_user_id);
create index if not exists idx_audit_logs_created on audit_logs(created_at);

-- RLS profiles
alter table profiles enable row level security;

drop policy if exists "profiles_self_read" on profiles;
create policy "profiles_self_read"
  on profiles for select
  using (auth.uid() = id);

drop policy if exists "profiles_self_update" on profiles;
create policy "profiles_self_update"
  on profiles for update
  using (auth.uid() = id);

drop policy if exists "profiles_admin_all" on profiles;
create policy "profiles_admin_all"
  on profiles for all
  using (is_admin_user())
  with check (is_admin_user());

-- RLS customer_addresses
alter table customer_addresses enable row level security;

drop policy if exists "customer_addresses_owner" on customer_addresses;
create policy "customer_addresses_owner"
  on customer_addresses for all
  using (auth.uid() = user_id);

drop policy if exists "customer_addresses_admin" on customer_addresses;
create policy "customer_addresses_admin"
  on customer_addresses for all
  using (is_admin_user());

-- RLS identity_verifications
alter table identity_verifications enable row level security;

drop policy if exists "identity_verifications_owner" on identity_verifications;
create policy "identity_verifications_owner"
  on identity_verifications for select
  using (auth.uid() = user_id);

drop policy if exists "identity_verifications_admin" on identity_verifications;
create policy "identity_verifications_admin"
  on identity_verifications for all
  using (is_admin_user());

-- RLS audit_logs
alter table audit_logs enable row level security;

drop policy if exists "audit_logs_admin_read" on audit_logs;
create policy "audit_logs_admin_read"
  on audit_logs for select
  using (is_admin_user());

drop policy if exists "audit_logs_insert" on audit_logs;
create policy "audit_logs_insert"
  on audit_logs for insert
  with check (true);

-- Storage bucket for identity documents (private)
insert into storage.buckets (id, name, public)
values ('identity-docs', 'identity-docs', false)
on conflict (id) do nothing;

-- Storage policies for identity-docs
begin;
  drop policy if exists "identity_docs_owner_select" on storage.objects;
  create policy "identity_docs_owner_select"
    on storage.objects for select
    using (bucket_id = 'identity-docs' and auth.uid()::text = (storage.foldername(name))[1]);

  drop policy if exists "identity_docs_owner_insert" on storage.objects;
  create policy "identity_docs_owner_insert"
    on storage.objects for insert
    with check (bucket_id = 'identity-docs' and auth.uid()::text = (storage.foldername(name))[1]);

  drop policy if exists "identity_docs_admin_all" on storage.objects;
  create policy "identity_docs_admin_all"
    on storage.objects for all
    using (bucket_id = 'identity-docs' and is_admin_user());
commit;
