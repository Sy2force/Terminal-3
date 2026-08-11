-- TERMINAL 3 — first-purchase discount support
-- `orders.total_agorot` already reflects the post-discount amount charged;
-- these two columns preserve *why* so the receipt/order history can show
-- the discount transparently instead of silently reducing the total.

alter table orders
  add column discount_agorot integer not null default 0,
  add column discount_label text,
  add constraint discount_non_negative check (discount_agorot >= 0);

-- Backfill site settings for the two new admin-editable keys used by the
-- storefront (weekly promo banner + salmon gallery). Safe no-op if already
-- present from a previous seed run.
insert into site_settings (key, value)
values
  ('WEEKLY_PROMO_MESSAGE', '"-20% sur votre première commande cette semaine !"'),
  ('SALMON_GALLERY_IMAGES', '[
    {"url":"/images/salmon-plateaux/plateau-01.jpg","alt":"Plateau de saumon fumé Sarfati, vin et accompagnements"},
    {"url":"/images/salmon-plateaux/plateau-02.jpg","alt":"Roses de saumon fumé sur ardoise, citron et olives"},
    {"url":"/images/salmon-plateaux/plateau-03.jpg","alt":"Plateau de saumon fumé en rosace avec citron et olives noires"},
    {"url":"/images/salmon-plateaux/plateau-04.jpg","alt":"Bagels au saumon fumé Sarfati et câpres"},
    {"url":"/images/salmon-plateaux/plateau-05.jpg","alt":"Plateaux de saumon fumé avec vin blanc et crackers"},
    {"url":"/images/salmon-plateaux/plateau-06.jpg","alt":"Plateau de saumon fumé Sarfati, détail"},
    {"url":"/images/salmon-plateaux/plateau-07.jpg","alt":"Plateau de saumon fumé Sarfati, présentation"},
    {"url":"/images/salmon-plateaux/plateau-08.jpg","alt":"Plateau de saumon fumé Sarfati, ambiance cave à vin"},
    {"url":"/images/salmon-plateaux/plateau-09.jpg","alt":"Plateau de saumon fumé Sarfati, service"},
    {"url":"/images/salmon-plateaux/plateau-10.jpg","alt":"Plateau de saumon fumé Sarfati, gros plan"}
  ]')
on conflict (key) do update set value = excluded.value
where site_settings.value = '[]'::jsonb;
