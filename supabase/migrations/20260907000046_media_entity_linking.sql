-- ============================================================
-- 0046_media_entity_linking.sql
-- Extends the existing `media` table (created in
-- 20240101000018_admin_foundation.sql) with explicit entity
-- association, deterministic storage path and lifecycle status.
-- Idempotent. NOT to be applied in production without approval.
-- ============================================================

begin;

-- ------------------------------------------------------------
-- 1. NEW COLUMNS ON media
-- ------------------------------------------------------------

alter table media
  add column if not exists bucket text,
  add column if not exists storage_path text,
  add column if not exists entity_type text,
  add column if not exists entity_id text,
  add column if not exists role text,
  add column if not exists sort_order integer not null default 0,
  add column if not exists status text not null default 'ready',
  add column if not exists alt_text text;

-- entity_id is text (not uuid): pages use slugs like 'home'.
-- alt_text mirrors the existing `alt` column kept for compatibility;
-- new code should prefer alt_text and fall back to alt.

-- ------------------------------------------------------------
-- 2. CONSTRAINTS (validated, idempotent via DO blocks)
-- ------------------------------------------------------------

do $$ begin
  alter table media
    add constraint media_entity_type_check
    check (entity_type is null or entity_type in
      ('product', 'category', 'page', 'promotion', 'event', 'brand', 'site'));
exception when duplicate_object then null;
end $$;

do $$ begin
  alter table media
    add constraint media_role_check
    check (role is null or role in
      ('cover', 'gallery', 'hero_desktop', 'hero_mobile',
       'background', 'logo', 'thumbnail', 'og_image'));
exception when duplicate_object then null;
end $$;

do $$ begin
  alter table media
    add constraint media_status_check
    check (status in ('uploading', 'ready', 'failed', 'archived'));
exception when duplicate_object then null;
end $$;

-- ------------------------------------------------------------
-- 3. INDEXES
-- ------------------------------------------------------------

create index if not exists idx_media_entity
  on media (entity_type, entity_id)
  where entity_id is not null;

create index if not exists idx_media_status
  on media (status);

create index if not exists idx_media_unclassified
  on media (storage_path)
  where entity_id is null;

commit;
