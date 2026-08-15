-- TERMINAL 3 — wine catalog demo data
-- Provisional but realistic wine references so /vins and /vins/[slug] can
-- be verified with a real, unlimited-capacity dataset instead of a static
-- array in a component. Run AFTER db/migrations/0011_wine_catalog_fields.sql.
-- Safe to re-run: every insert is guarded with `on conflict do nothing`.
--
-- Replace/expand these rows from /admin once real inventory is available —
-- nothing here is hardcoded into the UI, it all flows through the normal
-- products/product_variants/product_media tables.

begin;

-- Category 'vin' already exists from db/seed/seed.sql
-- ('10000000-0000-0000-0000-000000000001').

insert into products (
  id, slug, category_id, product_type, brand, name_he, name_fr, name_en,
  description_fr, tasting_notes, pairing_notes, kosher_status, status,
  is_featured, availability_status, base_price_agorot, compare_at_price_agorot,
  published_at, new_until, wine_type, region, country, grape_varieties,
  rating, review_count, is_best_seller, badge, serving_temperature,
  aging_potential, vinification_method
) values
  (
    '40000000-0000-0000-0000-000000000001', 'petit-castel-2020', '10000000-0000-0000-0000-000000000001',
    'STANDARD', 'Domaine du Castel', 'פיטיט קסטל', 'Petit Castel', 'Petit Castel',
    'Le second vin du Domaine du Castel, un assemblage élégant élevé en fûts de chêne français.',
    'Fruits rouges mûrs, notes boisées subtiles, tanins soyeux.', 'Viandes rouges grillées, fromages affinés.',
    'Casher Mehadrin', 'published', true, 'IN_STOCK', 18900, null,
    now(), null, 'ROUGE', 'Judean Hills', 'Israël', array['Cabernet Sauvignon', 'Merlot', 'Petit Verdot'],
    4.7, 128, true, null, '16–18°C', 'Apogée entre 2025 et 2030', 'Élevage 12 mois en fûts de chêne français'
  ),
  (
    '40000000-0000-0000-0000-000000000002', 'yarden-cabernet-sauvignon-2019', '10000000-0000-0000-0000-000000000001',
    'STANDARD', 'Golan Heights Winery', 'ירדן קברנה סוביניון', 'Yarden Cabernet Sauvignon', 'Yarden Cabernet Sauvignon',
    'Un cabernet sauvignon de référence, structuré et complexe, issu des vignes du plateau du Golan.',
    'Cassis, poivron rouge grillé, chêne toasté.', 'Agneau rôti, plats mijotés.',
    'Casher Mehadrin', 'published', true, 'IN_STOCK', 15900, 17900,
    now(), null, 'ROUGE', 'Golan Heights', 'Israël', array['Cabernet Sauvignon'],
    4.8, 214, true, 'Coup de cœur', '17–18°C', 'Apogée entre 2024 et 2032', 'Élevage 18 mois en fûts de chêne américain'
  ),
  (
    '40000000-0000-0000-0000-000000000003', 'gamla-syrah-2021', '10000000-0000-0000-0000-000000000001',
    'STANDARD', 'Golan Heights Winery', 'גמלא סירה', 'Gamla Syrah', 'Gamla Syrah',
    'Un syrah généreux et épicé, parfait pour les repas d''hiver.',
    'Poivre noir, mûre, réglisse.', 'Gibier, plats épicés.',
    'Casher Mehadrin', 'published', false, 'IN_STOCK', 9900, null,
    now(), now() + interval '30 days', 'ROUGE', 'Golan Heights', 'Israël', array['Syrah'],
    4.5, 76, false, null, '16–17°C', 'Apogée entre 2024 et 2028', 'Élevage 10 mois en fûts de chêne'
  ),
  (
    '40000000-0000-0000-0000-000000000004', 'rose-du-castel-2023', '10000000-0000-0000-0000-000000000001',
    'STANDARD', 'Domaine du Castel', 'רוזה קסטל', 'Rosé du Castel', 'Rosé du Castel',
    'Un rosé de gastronomie sec et minéral, à la robe pâle et au nez délicat.',
    'Fleurs blanches, pêche blanche, agrumes.', 'Poissons grillés, cuisine méditerranéenne.',
    'Casher Mehadrin', 'published', false, 'IN_STOCK', 13900, null,
    now(), null, 'ROSE', 'Judean Hills', 'Israël', array['Grenache', 'Cinsault'],
    4.6, 54, false, null, '8–10°C', 'À boire dans les 2 ans', 'Pressurage direct, vinification à basse température'
  ),
  (
    '40000000-0000-0000-0000-000000000005', 'yarden-chardonnay-2022', '10000000-0000-0000-0000-000000000001',
    'STANDARD', 'Golan Heights Winery', 'ירדן שרדונה', 'Yarden Chardonnay', 'Yarden Chardonnay',
    'Un chardonnay élevé partiellement en fûts, rond et frais à la fois.',
    'Pomme verte, vanille, beurre frais.', 'Volailles, fruits de mer, fromages à pâte molle.',
    'Casher Mehadrin', 'published', false, 'IN_STOCK', 12900, 14500,
    now(), null, 'BLANC', 'Golan Heights', 'Israël', array['Chardonnay'],
    4.4, 63, false, null, '10–12°C', 'Apogée entre 2024 et 2027', 'Élevage partiel 6 mois en fûts de chêne'
  ),
  (
    '40000000-0000-0000-0000-000000000006', 'moscato-hermon-2023', '10000000-0000-0000-0000-000000000001',
    'STANDARD', 'Golan Heights Winery', 'מוסקטו חרמון', 'Moscato Hermon', 'Moscato Hermon',
    'Un moscato doux et aromatique, léger en alcool, idéal en apéritif ou avec un dessert.',
    'Raisin muscat, litchi, fleur d''oranger.', 'Desserts fruités, fromages frais.',
    'Casher Mehadrin', 'published', false, 'IN_STOCK', 7900, null,
    now(), now() + interval '45 days', 'DOUX', 'Golan Heights', 'Israël', array['Muscat'],
    4.3, 41, false, 'Nouveau', '6–8°C', 'À boire dans l''année', 'Fermentation lente à froid pour préserver les arômes'
  ),
  (
    '40000000-0000-0000-0000-000000000007', 'flam-classico-2020', '10000000-0000-0000-0000-000000000001',
    'STANDARD', 'Flam Winery', 'פלאם קלאסיקו', 'Flam Classico', 'Flam Classico',
    'L''assemblage signature du Domaine Flam, équilibré entre puissance et élégance.',
    'Fruits noirs, épices douces, tanins fins.', 'Viandes rouges, plats en sauce.',
    'Non casher', 'published', true, 'LOW_STOCK', 16900, null,
    now(), null, 'ROUGE', 'Judean Hills', 'Israël', array['Cabernet Sauvignon', 'Syrah'],
    4.7, 97, true, 'Dernières bouteilles', '17–18°C', 'Apogée entre 2024 et 2029', 'Élevage 14 mois en fûts de chêne français'
  ),
  (
    '40000000-0000-0000-0000-000000000008', 'tabor-adama', '10000000-0000-0000-0000-000000000001',
    'STANDARD', 'Tabor Winery', 'תבור אדמה', 'Tabor Adama', 'Tabor Adama',
    'Un effervescent frais et gourmand, parfait pour toutes les célébrations.',
    'Bulles fines, pomme verte, agrumes.', 'Apéritif, fruits de mer.',
    'Casher Mehadrin', 'published', false, 'IN_STOCK', 8900, null,
    now(), null, 'EFFERVESCENT', 'Galilee', 'Israël', array['Chardonnay', 'Pinot Noir'],
    4.2, 38, false, null, '6–8°C', 'À boire dans l''année', 'Méthode traditionnelle, seconde fermentation en bouteille'
  )
on conflict (id) do nothing;

insert into product_variants (
  id, product_id, label, volume_ml, abv, vintage, regular_price_agorot, is_default, availability_status, display_order
) values
  ('41000000-0000-0000-0000-000000000001', '40000000-0000-0000-0000-000000000001', '75cl', 750, 14.0, 2020, 18900, true, 'IN_STOCK', 0),
  ('41000000-0000-0000-0000-000000000002', '40000000-0000-0000-0000-000000000002', '75cl', 750, 14.5, 2019, 15900, true, 'IN_STOCK', 0),
  ('41000000-0000-0000-0000-000000000003', '40000000-0000-0000-0000-000000000003', '75cl', 750, 14.5, 2021, 9900, true, 'IN_STOCK', 0),
  ('41000000-0000-0000-0000-000000000004', '40000000-0000-0000-0000-000000000004', '75cl', 750, 13.0, 2023, 13900, true, 'IN_STOCK', 0),
  ('41000000-0000-0000-0000-000000000005', '40000000-0000-0000-0000-000000000005', '75cl', 750, 13.5, 2022, 12900, true, 'IN_STOCK', 0),
  ('41000000-0000-0000-0000-000000000006', '40000000-0000-0000-0000-000000000006', '75cl', 750, 9.0, 2023, 7900, true, 'IN_STOCK', 0),
  ('41000000-0000-0000-0000-000000000007', '40000000-0000-0000-0000-000000000007', '75cl', 750, 14.5, 2020, 16900, true, 'LOW_STOCK', 0),
  ('41000000-0000-0000-0000-000000000008', '40000000-0000-0000-0000-000000000008', '75cl', 750, 12.0, null, 8900, true, 'IN_STOCK', 0)
on conflict (id) do nothing;

-- product_media has no natural unique key, so guard manually instead of
-- relying on ON CONFLICT (consistent with the do-block pattern in seed.sql).
do $$
declare
  wine record;
  image_path text;
begin
  for wine in
    select id, name_fr, row_number() over (order by id) as rn
    from products
    where category_id = '10000000-0000-0000-0000-000000000001'
      and id::text like '40000000-%'
  loop
    image_path := '/images/vins/vin-' || wine.rn || '.jpg';
    if not exists (select 1 from product_media where product_id = wine.id) then
      insert into product_media (product_id, url, alt, kind, display_order)
      values (wine.id, image_path, coalesce(wine.name_fr, 'Vin Terminal 3'), 'COVER', 0);
    end if;
  end loop;
end $$;

commit;
