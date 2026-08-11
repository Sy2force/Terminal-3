-- TERMINAL 3 — Category CMS upgrade
-- Adds editorial/admin fields to categories while preserving existing rows
-- and the existing parent_id hierarchy.

begin;

-- Use display_order as the canonical ordering column.
alter table categories
  rename column sort_order to display_order;

-- New admin-editable fields.
alter table categories
  add column if not exists updated_at timestamptz default now(),
  add column if not exists is_featured boolean not null default false,
  add column if not exists cover_image text,
  add column if not exists icon text,
  add column if not exists short_description text,
  add column if not exists description text,
  add column if not exists meta_title text,
  add column if not exists meta_description text;

-- Ensure existing rows get an updated_at value.
update categories
set updated_at = created_at
where updated_at is null;

commit;
