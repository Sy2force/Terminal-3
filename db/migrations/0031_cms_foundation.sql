-- ============================================================
-- 0031_cms_foundation.sql
-- CMS foundation: theme, navigation, carousels, promotional banners
-- and reusable section translations. Built on top of existing
-- page_contents, homepage_sections, media and site_settings tables.
-- ============================================================

begin;

-- ------------------------------------------------------------
-- 1. ENUMS
-- ------------------------------------------------------------

do $$ begin
  create type navigation_item_target as enum ('_self', '_blank');
exception
  when duplicate_object then null;
end $$;

do $$ begin
  create type carousel_kind as enum ('bottles', 'promotions', 'brands', 'categories', 'products', 'covers', 'events', 'inspirations');
exception
  when duplicate_object then null;
end $$;

do $$ begin
  create type banner_position as enum ('homepage_top', 'homepage_middle', 'homepage_bottom', 'category_top', 'category_bottom', 'site_wide', 'checkout');
exception
  when duplicate_object then null;
end $$;

-- ------------------------------------------------------------
-- 2. SECTION TRANSLATIONS
--    Reusable translations referenced by section keys and page sections.
-- ------------------------------------------------------------

create table if not exists section_translations (
  id uuid primary key default gen_random_uuid(),
  key text not null unique,
  lang text not null default 'fr',
  title text,
  subtitle text,
  body text,
  label text,
  button_text text,
  button_link text,
  button_target navigation_item_target default '_self',
  alt_text text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  created_by uuid references auth.users(id) on delete set null,
  updated_by uuid references auth.users(id) on delete set null,
  unique (key, lang)
);

-- ------------------------------------------------------------
-- 3. NAVIGATION MENUS & ITEMS
-- ------------------------------------------------------------

create table if not exists navigation_menus (
  id uuid primary key default gen_random_uuid(),
  key text not null unique,
  name_fr text not null,
  name_he text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists navigation_items (
  id uuid primary key default gen_random_uuid(),
  menu_id uuid not null references navigation_menus(id) on delete cascade,
  parent_id uuid references navigation_items(id) on delete cascade,
  label_fr text not null,
  label_he text,
  href text not null,
  target navigation_item_target default '_self',
  icon_url text,
  display_order integer not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ------------------------------------------------------------
-- 4. THEME SETTINGS
-- ------------------------------------------------------------

create table if not exists theme_settings (
  id uuid primary key default gen_random_uuid(),
  key text not null unique,
  value jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now(),
  updated_by uuid references auth.users(id) on delete set null
);

-- ------------------------------------------------------------
-- 5. CAROUSELS & ITEMS
-- ------------------------------------------------------------

create table if not exists carousels (
  id uuid primary key default gen_random_uuid(),
  key text not null unique,
  kind carousel_kind not null,
  name_fr text not null,
  name_he text,
  is_active boolean not null default true,
  autoplay boolean not null default false,
  loop boolean not null default true,
  pause_on_hover boolean not null default true,
  interval_seconds integer not null default 5,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists carousel_items (
  id uuid primary key default gen_random_uuid(),
  carousel_id uuid not null references carousels(id) on delete cascade,
  image_url text,
  image_mobile_url text,
  title_fr text,
  title_he text,
  subtitle_fr text,
  subtitle_he text,
  button_text_fr text,
  button_text_he text,
  button_link text,
  display_order integer not null default 0,
  is_active boolean not null default true,
  start_at timestamptz,
  end_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ------------------------------------------------------------
-- 6. PROMOTIONAL BANNERS
-- ------------------------------------------------------------

create table if not exists promotional_banners (
  id uuid primary key default gen_random_uuid(),
  key text not null unique,
  title_fr text not null,
  title_he text,
  description_fr text,
  description_he text,
  image_url text,
  image_mobile_url text,
  button_text_fr text,
  button_text_he text,
  button_link text,
  discount_percent integer,
  position banner_position not null,
  priority integer not null default 0,
  is_active boolean not null default true,
  start_at timestamptz,
  end_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ------------------------------------------------------------
-- 7. INDEXES
-- ------------------------------------------------------------

create index if not exists idx_section_translations_key on section_translations(key);
create index if not exists idx_navigation_items_menu on navigation_items(menu_id);
create index if not exists idx_navigation_items_parent on navigation_items(parent_id);
create index if not exists idx_carousel_items_carousel on carousel_items(carousel_id);
create index if not exists idx_carousel_items_order on carousel_items(carousel_id, display_order);
create index if not exists idx_promotional_banners_position on promotional_banners(position, priority);

-- ------------------------------------------------------------
-- 8. RLS
-- ------------------------------------------------------------

alter table section_translations enable row level security;
create policy "section_translations_public_read" on section_translations
  for select using (true);
create policy "section_translations_staff_write" on section_translations
  for all using (is_staff(array['OWNER', 'MANAGER', 'CONTENT_EDITOR']::admin_role_type[]))
  with check (is_staff(array['OWNER', 'MANAGER', 'CONTENT_EDITOR']::admin_role_type[]));

alter table navigation_menus enable row level security;
create policy "navigation_menus_public_read" on navigation_menus
  for select using (true);
create policy "navigation_menus_staff_write" on navigation_menus
  for all using (is_staff(array['OWNER', 'MANAGER', 'CONTENT_EDITOR']::admin_role_type[]))
  with check (is_staff(array['OWNER', 'MANAGER', 'CONTENT_EDITOR']::admin_role_type[]));

alter table navigation_items enable row level security;
create policy "navigation_items_public_read" on navigation_items
  for select using (is_active = true);
create policy "navigation_items_staff_write" on navigation_items
  for all using (is_staff(array['OWNER', 'MANAGER', 'CONTENT_EDITOR']::admin_role_type[]))
  with check (is_staff(array['OWNER', 'MANAGER', 'CONTENT_EDITOR']::admin_role_type[]));

alter table theme_settings enable row level security;
create policy "theme_settings_public_read" on theme_settings
  for select using (true);
create policy "theme_settings_owner_write" on theme_settings
  for all using (is_staff(array['OWNER', 'MANAGER']::admin_role_type[]))
  with check (is_staff(array['OWNER', 'MANAGER']::admin_role_type[]));

alter table carousels enable row level security;
create policy "carousels_public_read" on carousels
  for select using (is_active = true);
create policy "carousels_staff_write" on carousels
  for all using (is_staff(array['OWNER', 'MANAGER', 'CONTENT_EDITOR']::admin_role_type[]))
  with check (is_staff(array['OWNER', 'MANAGER', 'CONTENT_EDITOR']::admin_role_type[]));

alter table carousel_items enable row level security;
create policy "carousel_items_public_read" on carousel_items
  for select using (is_active = true);
create policy "carousel_items_staff_write" on carousel_items
  for all using (is_staff(array['OWNER', 'MANAGER', 'CONTENT_EDITOR']::admin_role_type[]))
  with check (is_staff(array['OWNER', 'MANAGER', 'CONTENT_EDITOR']::admin_role_type[]));

alter table promotional_banners enable row level security;
create policy "promotional_banners_public_read" on promotional_banners
  for select using (is_active = true);
create policy "promotional_banners_staff_write" on promotional_banners
  for all using (is_staff(array['OWNER', 'MANAGER', 'CONTENT_EDITOR']::admin_role_type[]))
  with check (is_staff(array['OWNER', 'MANAGER', 'CONTENT_EDITOR']::admin_role_type[]));

-- ------------------------------------------------------------
-- 9. DEFAULT NAVIGATION MENUS
-- ------------------------------------------------------------

insert into navigation_menus (key, name_fr, name_he)
values
  ('main', 'Menu principal', 'תפריט ראשי'),
  ('footer', 'Pied de page', 'כותרת תחתונה')
on conflict (key) do nothing;

-- ------------------------------------------------------------
-- 10. TRIGGERS
-- ------------------------------------------------------------

create or replace function set_cms_updated_at()
returns trigger as $$
begin
  new.updated_at := now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists section_translations_updated_at on section_translations;
create trigger section_translations_updated_at
  before update on section_translations
  for each row execute function set_cms_updated_at();

drop trigger if exists navigation_menus_updated_at on navigation_menus;
create trigger navigation_menus_updated_at
  before update on navigation_menus
  for each row execute function set_cms_updated_at();

drop trigger if exists navigation_items_updated_at on navigation_items;
create trigger navigation_items_updated_at
  before update on navigation_items
  for each row execute function set_cms_updated_at();

drop trigger if exists carousels_updated_at on carousels;
create trigger carousels_updated_at
  before update on carousels
  for each row execute function set_cms_updated_at();

drop trigger if exists carousel_items_updated_at on carousel_items;
create trigger carousel_items_updated_at
  before update on carousel_items
  for each row execute function set_cms_updated_at();

drop trigger if exists promotional_banners_updated_at on promotional_banners;
create trigger promotional_banners_updated_at
  before update on promotional_banners
  for each row execute function set_cms_updated_at();

commit;
