-- ============================================================
-- 0044_final_routes.sql
-- Finalisation des parcours Terminal 3 :
--  · champ barcode distinct du SKU sur product_variants
--  · extension de l’enum order_status (received → … → collected)
--  · colonnes de suivi d’estimation/notes sur orders
--  · catégories pour les routes dédiées /whisky, /gin, etc.
--  · table user_presence pour le compteur heartbeat
-- ============================================================

begin;

-- ============================================================
-- 1. BARCODE SUR LES VARIANTES (distinct du SKU)
-- ============================================================

alter table product_variants
  add column if not exists barcode text;

-- Unicité partielle : plusieurs NULL autorisés, mais un code-barres
-- renseigné ne peut pas être partagé entre deux variantes.
create unique index if not exists idx_product_variants_barcode_unique
  on product_variants (barcode)
  where barcode is not null;

create index if not exists idx_product_variants_sku
  on product_variants (sku)
  where sku is not null;

-- ============================================================
-- 2. EXTENSION DES STATUTS DE COMMANDE
-- ============================================================

do $$
declare
  v_status text;
  v_values text[] := array['received', 'reviewing', 'accepted', 'preparing', 'collected'];
begin
  foreach v_status in array v_values loop
    if not exists (
      select 1
      from pg_type t
      join pg_enum e on t.oid = e.enumtypid
      where t.typname = 'order_status' and e.enumlabel = v_status
    ) then
      execute format('alter type order_status add value %L', v_status);
    end if;
  end loop;
end $$;

-- ============================================================
-- 3. MÉTADONNÉES DE COMMANDE (estimation, notes, notification)
-- ============================================================

alter table orders
  add column if not exists estimated_ready_at timestamptz,
  add column if not exists ready_notified_at timestamptz,
  add column if not exists staff_notes text;

-- ============================================================
-- 4. CATÉGORIES POUR LES ROUTES DÉDIÉES
-- ============================================================

insert into categories (id, slug, name_he, name_fr, parent_id, is_active, display_order, created_at, updated_at)
select
  gen_random_uuid(),
  slug,
  name_he,
  name_fr,
  parent_id,
  true,
  display_order,
  now(),
  now()
from (values
  ('whisky', 'וויסקי', 'Whisky', null::uuid, 10),
  ('gin',    'ג''ין',   'Gin',    null::uuid, 11),
  ('tequila','טקילה',   'Tequila',null::uuid, 12),
  ('arak',   'ערק',     'Arak',   null::uuid, 13),
  ('bieres', 'בירות',   'Bières', null::uuid, 14),
  ('saumon-fume','דגים מעושנים','Saumon fumé',null::uuid, 15),
  ('epicerie-fine','מעדני יוקרה','Épicerie fine',null::uuid, 16)
) as t(slug, name_he, name_fr, parent_id, display_order)
where not exists (select 1 from categories c where c.slug = t.slug);

-- ============================================================
-- 5. TABLE DE PRÉSENCE (heartbeat)
-- ============================================================

create table if not exists user_presence (
  id uuid primary key default gen_random_uuid(),
  session_id text not null unique,
  user_id uuid references profiles(id) on delete set null,
  anonymous boolean not null default true,
  last_seen_at timestamptz not null default now(),
  created_at timestamptz not null default now()
);

create index if not exists idx_user_presence_last_seen
  on user_presence (last_seen_at);

create index if not exists idx_user_presence_user
  on user_presence (user_id)
  where user_id is not null;

alter table user_presence enable row level security;

drop policy if exists "user_presence_admin_all" on user_presence;
create policy "user_presence_admin_all" on user_presence
  for all
  using (is_admin_user())
  with check (is_admin_user());

drop policy if exists "user_presence_no_public" on user_presence;

-- Nettoyage automatique des présences de plus de 24 heures
create or replace function cleanup_user_presence()
returns trigger language plpgsql as $$
begin
  delete from user_presence where last_seen_at < now() - interval '24 hours';
  return new;
end;
$$;

drop trigger if exists user_presence_cleanup on user_presence;
create trigger user_presence_cleanup
  after insert on user_presence
  for each statement
  execute function cleanup_user_presence();

commit;
