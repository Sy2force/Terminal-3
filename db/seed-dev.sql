-- TERMINAL 3 — DEVELOPMENT SEED
-- ============================================================
-- STRICTLY DEVELOPMENT-ONLY. DO NOT RUN AGAINST PRODUCTION.
-- Idempotent. Re-running it does not create duplicates.
-- Execute with: psql $DATABASE_URL -f db/seed-dev.sql
--   or paste the entire content into the Supabase SQL Editor.
-- ============================================================

do $$
declare
  v_wine_id uuid;
  v_spirit_id uuid;
  v_fish_id uuid;
  v_charcuterie_id uuid;
  v_platter_id uuid;
  v_brand_id uuid;
  v_product_id uuid;
  v_variant_id uuid;
  v_order_id uuid;
  v_group_id uuid;
  v_driver_id uuid;
  v_delivery_id uuid;
  v_branch_id uuid;
  v_count integer;
begin
  -- ============================================================
  -- ENVIRONMENT GUARD
  -- ============================================================
  if current_database() ~ '(?i)(prod|main|vercel|live)' then
    raise exception 'Refusing to run seed-dev.sql on a database that looks like production: %', current_database();
  end if;

  -- ============================================================
  -- 0. BRANCH
  -- ============================================================
  select id into v_branch_id from branches where name = 'Terminal 3 Jérusalem';
  if v_branch_id is null then
    insert into branches (name, address, phone, whatsapp, is_active)
    values ('Terminal 3 Jérusalem', '12 rue Ben Yehuda, Jérusalem, Israël', '+972 2 123 4567', '+972 50 123 4567', true)
    returning id into v_branch_id;
  end if;

  -- ============================================================
  -- 1. CATEGORIES
  -- ============================================================
  insert into categories (slug, name_he, name_fr, display_order, is_active, is_featured, theme)
  values
    ('vin', 'יין', 'Vin', 10, true, true, 'WINE'),
    ('spiritueux', 'משקאות חריפים', 'Spiritueux', 20, true, false, 'SPIRITS'),
    ('saumon-fume', 'סלמון מעושן ודגים', 'Saumon fumé & Poissons', 30, true, false, 'SARFATI'),
    ('charcuterie', 'נקניקים', 'Charcuterie', 40, true, false, 'DELICATESS'),
    ('plateaux', 'מגשים', 'Plateaux', 50, true, true, 'GOLD')
  on conflict (slug) do nothing;

  select id into v_wine_id from categories where slug = 'vin';
  select id into v_spirit_id from categories where slug = 'spiritueux';
  select id into v_fish_id from categories where slug = 'saumon-fume';
  select id into v_charcuterie_id from categories where slug = 'charcuterie';
  select id into v_platter_id from categories where slug = 'plateaux';

  -- ============================================================
  -- 2. BRANDS
  -- ============================================================
  insert into brands (slug, name, description, is_active)
  values
    ('yarden', 'Yarden', 'Domaine du Golan Heights', true),
    ('ardbeg', 'Ardbeg', 'Distillerie écossaise d''Islay', true),
    ('sarfati', 'Sarfati', 'Saumon fumé artisanal', true),
    ('delicatess', 'Delicatess', 'Charcuteries fines casher', true)
  on conflict (slug) do nothing;

  select id into v_brand_id from brands where slug = 'yarden';

  -- ============================================================
  -- 3. PRODUCTS
  -- ============================================================
  insert into products (slug, product_type, category_id, brand, brand_id, name_he, name_fr, name_en, description_fr, kosher_status, status, age_restricted, is_featured, availability_status, base_price_agorot, compare_at_price_agorot, published_at)
  values
    ('seed-vin-yarden-cabernet', 'STANDARD', v_wine_id, 'Yarden', v_brand_id, 'ירדן קברנה סוביניון', 'Yarden Cabernet Sauvignon', 'Yarden Cabernet Sauvignon', 'Cuvée d''Israël, structurée et fruitée.', 'Casher', 'published', true, true, 'IN_STOCK', 12990, null, now()),
    ('seed-spirit-ardbeg-10', 'STANDARD', v_spirit_id, 'Ardbeg', (select id from brands where slug = 'ardbeg'), 'ארדבג 10 שנים', 'Ardbeg 10 ans', 'Ardbeg 10 Years', 'Whisky tourbé iodé.', 'Casher', 'published', true, true, 'IN_STOCK', 34900, null, now()),
    ('seed-saumon-classique', 'STANDARD', v_fish_id, 'Sarfati', (select id from brands where slug = 'sarfati'), 'סלמון מעושן קלאסי', 'Saumon fumé classique', 'Classic Smoked Salmon', 'Tranches épaisses de saumon fumé.', 'Casher', 'published', false, true, 'IN_STOCK', 5900, null, now()),
    ('seed-rosette', 'STANDARD', v_charcuterie_id, 'Delicatess', (select id from brands where slug = 'delicatess'), 'רוזט פרוס', 'Rosette tranchée', 'Sliced Rosette', 'Rosette de porc casher.', 'Casher', 'published', false, false, 'IN_STOCK', 7600, null, now()),
    ('seed-plateau-apero', 'PLATTER', v_platter_id, null, null, 'מגש אירוח 4 סועדים', 'Plateau apéritif 4 personnes', 'Aperitif Platter 4 people', 'Assortiment pour vos apéritifs.', 'Casher', 'published', false, true, 'IN_STOCK', 18900, null, now())
  on conflict (slug) do nothing;

  -- ============================================================
  -- 4. PRODUCT VARIANTS
  -- ============================================================
  select id into v_product_id from products where slug = 'seed-vin-yarden-cabernet';
  insert into product_variants (product_id, label, sku, weight_g, volume_ml, abv, vintage, regular_price_agorot, is_default, limited_stock, status)
  values (v_product_id, 'Bouteille 75cl', 'YRD-CAB-750', 1400, 750, 14.5, 2021, 12990, true, false, 'published')
  on conflict (sku) do nothing;

  select id into v_product_id from products where slug = 'seed-spirit-ardbeg-10';
  insert into product_variants (product_id, label, sku, weight_g, volume_ml, abv, regular_price_agorot, is_default, limited_stock, status)
  values (v_product_id, '70cl', 'ARB-10-700', 1200, 700, 46, 34900, true, false, 'published')
  on conflict (sku) do nothing;

  select id into v_product_id from products where slug = 'seed-saumon-classique';
  insert into product_variants (product_id, label, sku, weight_g, regular_price_agorot, is_default, limited_stock, status)
  values (v_product_id, '200g', 'SAR-CLAS-200', 200, 5900, true, false, 'published')
  on conflict (sku) do nothing;

  select id into v_product_id from products where slug = 'seed-rosette';
  insert into product_variants (product_id, label, sku, weight_g, regular_price_agorot, is_default, limited_stock, status)
  values (v_product_id, '200g tranché', 'DLC-ROS-200', 200, 7600, true, false, 'published')
  on conflict (sku) do nothing;

  select id into v_product_id from products where slug = 'seed-plateau-apero';
  insert into product_variants (product_id, label, sku, weight_g, regular_price_agorot, is_default, limited_stock, status)
  values (v_product_id, '4 personnes', 'PLT-APER-4', 1200, 18900, true, false, 'published')
  on conflict (sku) do nothing;

  -- ============================================================
  -- 5. PRODUCT MEDIA
  -- ============================================================
  select id into v_product_id from products where slug = 'seed-vin-yarden-cabernet';
  if not exists (select 1 from product_media where product_id = v_product_id and alt = 'Yarden Cabernet Sauvignon') then
    insert into product_media (product_id, url, alt, kind, sort_order)
    values (v_product_id, '/images/products/alcohol/placeholder.jpg', 'Yarden Cabernet Sauvignon', 'image', 0);
  end if;

  -- ============================================================
  -- 6. HOMEPAGE SECTIONS
  -- ============================================================
  select count(*) into v_count from homepage_sections where section_type = 'hero_bottles' and label = 'Hero seed';
  if v_count = 0 then
    insert into homepage_sections (section_type, label, sort_order, is_active, config)
    values ('hero_bottles', 'Hero seed', 0, true, '{"product_slugs": ["seed-vin-yarden-cabernet", "seed-spirit-ardbeg-10", "seed-saumon-classique", "seed-rosette", "seed-plateau-apero"]}'::jsonb);
  end if;

  -- ============================================================
  -- 7. PAGE CONTENTS
  -- ============================================================
  insert into page_contents (slug, page_type, title, subtitle, description, status, blocks)
  values
    ('home', 'home', 'Terminal 3', 'Cave à vin et épicerie fine', 'Une sélection exigeante à Jérusalem.', 'published', '[]'::jsonb),
    ('vins', 'category', 'Nos vins', 'La cave Terminal 3', 'Grands domaines et cuvées confidentielles.', 'published', '[]'::jsonb),
    ('spiritueux', 'category', 'Nos spiritueux', 'Whisky, arak et cognac', 'Sélection premium.', 'published', '[]'::jsonb),
    ('poissons', 'category', 'Nos poissons', 'Saumon fumé et produits fins', 'Pour vos apéritifs.', 'published', '[]'::jsonb),
    ('charcuterie', 'category', 'Nos charcuteries', 'Rosette, pastrami et pâtés', 'Sélection artisanale.', 'published', '[]'::jsonb),
    ('plateaux', 'category', 'Nos plateaux', 'Pour vos réceptions', 'Compositions apéritives.', 'published', '[]'::jsonb),
    ('promotions', 'category', 'Les offres Terminal 3', 'Promotions en cours', 'Vins, spiritueux et épicerie.', 'published', '[]'::jsonb),
    ('contact', 'page', 'Contact', 'À votre écoute', 'Téléphone, adresse et horaires.', 'published', '[]'::jsonb),
    ('a-propos', 'page', 'À propos', 'Notre histoire', 'La cave Terminal 3 au cœur de Jérusalem.', 'published', '[]'::jsonb),
    ('conditions', 'page', 'Conditions générales', 'Informations légales', 'À valider par le responsable.', 'published', '[]'::jsonb),
    ('confidentialite', 'page', 'Politique de confidentialité', 'Informations légales', 'À valider par le responsable.', 'published', '[]'::jsonb)
  on conflict (slug) do nothing;

  -- ============================================================
  -- 8. DELIVERY DRIVERS
  -- ============================================================
  select id into v_driver_id from delivery_drivers where phone = '+972 50 123 4567';
  if v_driver_id is null then
    insert into delivery_drivers (name, phone, status, email, notes)
    values ('David L.', '+972 50 123 4567', 'active', 'david@example.dev', 'Seed driver')
    returning id into v_driver_id;
  end if;

  -- ============================================================
  -- 9. ORDERS, PAYMENTS, DELIVERIES
  -- ============================================================
  select count(*) into v_count from orders where customer_name like 'Client seed%';
  if v_count = 0 then
    insert into orders (user_id, branch_id, status, customer_name, customer_phone, total_agorot, fulfillment_type, city, delivery_address, customer_notes)
    values (null, v_branch_id, 'confirmed', 'Client seed 1', '+972 50 111 1111', 18900, 'delivery', 'Jérusalem', '12 rue Ben Yehuda, 12', 'Commande de démonstration')
    returning id into v_order_id;

    insert into order_fulfillment_groups (order_id, group_type, food_status, alcohol_status)
    values (v_order_id, 'NON_RESTRICTED', 'PREPARING', null)
    returning id into v_group_id;

    select id into v_variant_id from product_variants where sku = 'PLT-APER-4';
    select id into v_product_id from products where slug = 'seed-plateau-apero';
    insert into order_items (order_id, fulfillment_group_id, product_id, variant_id, product_name_snapshot, variant_label_snapshot, quantity, regular_price_agorot_snapshot, final_price_agorot_snapshot)
    values (v_order_id, v_group_id, v_product_id, v_variant_id, 'Plateau apéritif 4 personnes', '4 personnes', 1, 18900, 18900);

    insert into payments (order_id, amount_agorot, method, status, collected_by, collected_at, reference)
    values (v_order_id, 10000, 'cash_delivery', 'partially_paid', null, now(), 'seed-partial');

    insert into deliveries (order_id, delivery_driver_id, status, payment_collected_amount_agorot, payment_collected_method, notes)
    values (v_order_id, v_driver_id, 'ASSIGNED', 10000, 'cash', 'Livraison seed')
    returning id into v_delivery_id;

    insert into order_status_history (order_id, old_status, new_status, changed_by_name, comment)
    values (v_order_id, null, 'submitted', 'Seed', 'Création automatique seed');
    insert into order_status_history (order_id, old_status, new_status, changed_by_name, comment)
    values (v_order_id, 'submitted', 'confirmed', 'Seed', 'Confirmation automatique');

    insert into order_notes (order_id, note, author_id, author_name)
    values (v_order_id, 'Première note interne de démonstration.', null, 'Seed');
  end if;

  -- ============================================================
  -- 10. CONTENT REVISIONS
  -- ============================================================
  select id into v_product_id from page_contents where slug = 'home';
  if not exists (select 1 from content_revisions where entity_type = 'page_contents' and entity_id = v_product_id and action = 'seed') then
    insert into content_revisions (entity_type, entity_id, action, previous_value, new_value, is_published)
    values ('page_contents', v_product_id, 'seed', '{}'::jsonb, '{"title": "Terminal 3"}'::jsonb, true);
  end if;

  raise notice 'Terminal 3 development seed applied.';
end $$;
