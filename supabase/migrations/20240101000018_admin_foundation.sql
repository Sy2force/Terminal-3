-- TERMINAL 3 — Administration Foundation
-- Adds the missing tables required by the professional admin software:
-- brands, page content CMS with draft/publish workflow, media library,
-- payment tracking, delivery drivers, notifications, Wolt integration
-- placeholder, and content revisions/audit support.
-- All changes are additive and non-destructive.

begin;

-- ============================================================
-- 1. BRANDS
-- ============================================================

create table if not exists brands (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name text not null,
  name_he text,
  name_en text,
  description text,
  logo_url text,
  cover_image_url text,
  primary_color text,
  secondary_color text,
  website_url text,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Many products can share a brand
create index if not exists idx_brands_slug on brands (slug);

alter table products
  add column if not exists brand_id uuid references brands(id) on delete set null;

-- ============================================================
-- 2. PAGE CONTENT CMS (draft / scheduled / published workflow)
-- ============================================================

do $$ begin
  create type page_content_status as enum ('draft', 'scheduled', 'published', 'archived');
exception when duplicate_object then null;
end $$;

create table if not exists page_contents (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  page_type text not null default 'generic',
  title text,
  subtitle text,
  description text,
  meta_title text,
  meta_description text,
  og_image_url text,
  -- Structured JSON blocks for safe, layout-preserving editing
  blocks jsonb not null default '[]'::jsonb,
  status page_content_status not null default 'draft',
  draft_blocks jsonb,
  scheduled_at timestamptz,
  published_at timestamptz,
  published_by uuid references profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_page_contents_status on page_contents (status);
create index if not exists idx_page_contents_published_at on page_contents (published_at);

-- ============================================================
-- 3. CONTENT REVISIONS
-- ============================================================

create table if not exists content_revisions (
  id uuid primary key default gen_random_uuid(),
  entity_type text not null,
  entity_id uuid not null,
  author_id uuid references profiles(id) on delete set null,
  action text not null,
  previous_value jsonb not null default '{}'::jsonb,
  new_value jsonb not null default '{}'::jsonb,
  is_published boolean not null default false,
  created_at timestamptz not null default now()
);

create index if not exists idx_content_revisions_entity on content_revisions (entity_type, entity_id);
create index if not exists idx_content_revisions_created on content_revisions (created_at desc);

-- ============================================================
-- 4. MEDIA LIBRARY
-- ============================================================

do $$ begin
  create type media_kind as enum ('image', 'video', 'model3d', 'document');
exception when duplicate_object then null;
end $$;

create table if not exists media (
  id uuid primary key default gen_random_uuid(),
  filename text not null,
  original_url text not null,
  thumbnail_url text,
  alt text,
  kind media_kind not null default 'image',
  mime_type text,
  file_size_bytes integer,
  width integer,
  height integer,
  duration_seconds numeric,
  folder text not null default 'general',
  uploaded_by uuid references profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_media_folder on media (folder);
create index if not exists idx_media_kind on media (kind);

-- Track media usage to prevent unsafe deletion
create table if not exists media_usage (
  id uuid primary key default gen_random_uuid(),
  media_id uuid not null references media(id) on delete cascade,
  entity_type text not null,
  entity_id uuid not null,
  field_path text not null default '',
  created_at timestamptz not null default now(),
  unique (media_id, entity_type, entity_id, field_path)
);

create index if not exists idx_media_usage_entity on media_usage (entity_type, entity_id);

-- ============================================================
-- 5. PAYMENTS
-- ============================================================

do $$ begin
  create type payment_method as enum (
  'cash_store', 'cash_delivery', 'card_store', 'card_delivery', 'wolt', 'refund', 'manual'
);
exception when duplicate_object then null;
end $$;

do $$ begin
  create type payment_status as enum (
  'unpaid', 'cash_store_expected', 'card_store_expected', 'cash_delivery_expected',
  'card_delivery_expected', 'partially_paid', 'paid', 'refunded', 'refused', 'cancelled'
);
exception when duplicate_object then null;
end $$;

create table if not exists payments (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references orders(id) on delete cascade,
  amount_agorot integer not null,
  method payment_method,
  status payment_status not null default 'unpaid',
  collected_by uuid references profiles(id) on delete set null,
  collected_at timestamptz,
  reference text,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_payments_order on payments (order_id);
create index if not exists idx_payments_status on payments (status);

-- Payment status history (audit trail per status change)
create table if not exists payment_status_history (
  id uuid primary key default gen_random_uuid(),
  payment_id uuid not null references payments(id) on delete cascade,
  order_id uuid not null references orders(id) on delete cascade,
  old_status payment_status,
  new_status payment_status not null,
  amount_agorot integer not null,
  changed_by uuid references profiles(id) on delete set null,
  comment text,
  created_at timestamptz not null default now()
);

create index if not exists idx_payment_status_history_payment on payment_status_history (payment_id);

-- ============================================================
-- 6. DELIVERY DRIVERS
-- ============================================================

do $$ begin
  create type driver_status as enum ('active', 'inactive', 'on_duty', 'off_duty');
exception when duplicate_object then null;
end $$;

create table if not exists delivery_drivers (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid references profiles(id) on delete set null,
  name text not null,
  phone text not null,
  email text,
  status driver_status not null default 'active',
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Link deliveries to a driver record
create index if not exists idx_delivery_drivers_phone on delivery_drivers (phone);

alter table deliveries
  add column if not exists delivery_driver_id uuid references delivery_drivers(id) on delete set null;

-- Add payment collection fields to deliveries
do $$ begin
  create type delivery_failure_reason as enum (
  'CUSTOMER_ABSENT', 'WRONG_ADDRESS', 'AGE_VERIFICATION_REFUSED', 'PAYMENT_NOT_RECEIVED', 'OTHER'
);
exception when duplicate_object then null;
end $$;

alter table deliveries
  add column if not exists payment_collected_amount_agorot integer not null default 0,
  add column if not exists payment_collected_method text,
  add column if not exists customer_instructions text,
  add column if not exists failure_reason delivery_failure_reason;

-- ============================================================
-- 7. WOLT INTEGRATION (honest placeholder until real API)
-- ============================================================

do $$ begin
  create type wolt_connection_status as enum ('not_configured', 'configured', 'syncing', 'error', 'disconnected');
exception when duplicate_object then null;
end $$;

create table if not exists wolt_connections (
  id uuid primary key default gen_random_uuid(),
  merchant_id text,
  venue_id text,
  access_token_encrypted text,
  refresh_token_encrypted text,
  status wolt_connection_status not null default 'not_configured',
  last_synced_at timestamptz,
  last_error text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Product mapping between Terminal 3 and Wolt SKUs
create table if not exists wolt_product_mappings (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references products(id) on delete cascade,
  wolt_item_id text not null,
  wolt_price_agorot integer,
  sync_enabled boolean not null default false,
  last_synced_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (product_id)
);

create index if not exists idx_wolt_product_mappings_product on wolt_product_mappings (product_id);

create table if not exists wolt_sync_logs (
  id uuid primary key default gen_random_uuid(),
  sync_type text not null,
  status text not null,
  items_count integer not null default 0,
  error_message text,
  started_at timestamptz not null default now(),
  completed_at timestamptz
);

-- ============================================================
-- 8. NOTIFICATIONS
-- ============================================================

do $$ begin
  create type notification_type as enum (
  'new_order', 'urgent_order', 'payment_missing', 'low_stock', 'out_of_stock',
  'delivery_failed', 'age_verification_issue', 'wolt_error', 'media_missing', 'publish_failed'
);
exception when duplicate_object then null;
end $$;

create table if not exists notifications (
  id uuid primary key default gen_random_uuid(),
  type notification_type not null,
  title text not null,
  message text,
  related_entity_type text,
  related_entity_id uuid,
  is_read boolean not null default false,
  created_at timestamptz not null default now()
);

create index if not exists idx_notifications_unread on notifications (is_read, created_at desc);

-- ============================================================
-- 8b. MEDIA LIBRARY STORAGE BUCKET
-- ============================================================

insert into storage.buckets (id, name, public)
values ('media-library', 'media-library', true)
on conflict (id) do nothing;

drop policy if exists "media_library_staff_insert" on storage.objects;
create policy "media_library_staff_insert"
  on storage.objects
  for insert
  with check (
    bucket_id = 'media-library'
    and public.is_staff()
  );

drop policy if exists "media_library_staff_delete" on storage.objects;
create policy "media_library_staff_delete"
  on storage.objects
  for delete
  using (
    bucket_id = 'media-library'
    and public.is_staff()
  );

drop policy if exists "media_library_public_select" on storage.objects;
create policy "media_library_public_select"
  on storage.objects
  for select
  using (bucket_id = 'media-library');

-- ============================================================
-- 9. RLS POLICIES
-- ============================================================

alter table brands enable row level security;
alter table page_contents enable row level security;
alter table content_revisions enable row level security;
alter table media enable row level security;
alter table media_usage enable row level security;
alter table payments enable row level security;
alter table payment_status_history enable row level security;
alter table delivery_drivers enable row level security;
alter table wolt_connections enable row level security;
alter table wolt_product_mappings enable row level security;
alter table wolt_sync_logs enable row level security;
alter table notifications enable row level security;

-- Generic admin helper function for reuse in policies
create or replace function is_admin_user()
returns boolean as $$
  select exists (
    select 1 from admin_roles
    where user_id = auth.uid()
  );
$$ language sql security definer;

-- Brands: public read, admin write
drop policy if exists "brands_public_read" on brands;
create policy "brands_public_read"
  on brands for select
  using (true);

drop policy if exists "brands_admin_write" on brands;
create policy "brands_admin_write"
  on brands for all
  using (is_admin_user())
  with check (is_admin_user());

-- Page contents: public read published, admin write
drop policy if exists "page_contents_public_read_published" on page_contents;
create policy "page_contents_public_read_published"
  on page_contents for select
  using (status = 'published');

drop policy if exists "page_contents_admin_write" on page_contents;
create policy "page_contents_admin_write"
  on page_contents for all
  using (is_admin_user())
  with check (is_admin_user());

-- Media: public read, admin write
drop policy if exists "media_public_read" on media;
create policy "media_public_read"
  on media for select
  using (true);

drop policy if exists "media_admin_write" on media;
create policy "media_admin_write"
  on media for all
  using (is_admin_user())
  with check (is_admin_user());

drop policy if exists "media_usage_admin_write" on media_usage;
create policy "media_usage_admin_write"
  on media_usage for all
  using (is_admin_user())
  with check (is_admin_user());

-- Payments / payment history: admin write
drop policy if exists "payments_admin_all" on payments;
create policy "payments_admin_all"
  on payments for all
  using (is_admin_user())
  with check (is_admin_user());

drop policy if exists "payment_status_history_admin_all" on payment_status_history;
create policy "payment_status_history_admin_all"
  on payment_status_history for all
  using (is_admin_user())
  with check (is_admin_user());

-- Delivery drivers: admin + courier
drop policy if exists "delivery_drivers_admin_all" on delivery_drivers;
create policy "delivery_drivers_admin_all"
  on delivery_drivers for all
  using (is_admin_user())
  with check (is_admin_user());

drop policy if exists "delivery_drivers_public_basic" on delivery_drivers;
create policy "delivery_drivers_public_basic"
  on delivery_drivers for select
  using (true);

-- Wolt: admin only until configured
drop policy if exists "wolt_admin_all" on wolt_connections;
create policy "wolt_admin_all"
  on wolt_connections for all
  using (is_admin_user())
  with check (is_admin_user());

drop policy if exists "wolt_mappings_admin_all" on wolt_product_mappings;
create policy "wolt_mappings_admin_all"
  on wolt_product_mappings for all
  using (is_admin_user())
  with check (is_admin_user());

drop policy if exists "wolt_sync_logs_admin_all" on wolt_sync_logs;
create policy "wolt_sync_logs_admin_all"
  on wolt_sync_logs for all
  using (is_admin_user())
  with check (is_admin_user());

-- Notifications: admin read/update
drop policy if exists "notifications_admin_all" on notifications;
create policy "notifications_admin_all"
  on notifications for all
  using (is_admin_user())
  with check (is_admin_user());

-- Content revisions: admin read/write (immutable once created, never updated or deleted)
drop policy if exists "content_revisions_admin_all" on content_revisions;
create policy "content_revisions_admin_all"
  on content_revisions for all
  using (is_admin_user())
  with check (is_admin_user());

commit;
