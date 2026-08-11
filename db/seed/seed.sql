-- TERMINAL 3 — seed data
-- Only data explicitly supplied in the project brief is inserted here.
-- Anything not supplied (prices, kosher certificates, ingredients, stock,
-- phone numbers, etc.) is left NULL rather than invented. Admins can fill
-- these in via /admin once available.

-- ============================================================
-- BRANCH
-- ============================================================

insert into branches (id, name, address, phone, whatsapp, is_active)
values (
  '00000000-0000-0000-0000-000000000001',
  'Terminal 3 — Agripas',
  'Agripas 105, Jerusalem, Israel',
  null,
  null,
  true
);

-- ============================================================
-- SITE SETTINGS (placeholders — edit via /admin, no redeploy needed)
-- ============================================================

insert into site_settings (key, value) values
  ('STORE_ONLINE', 'true'),
  ('STORE_NAME', '"Terminal 3"'),
  ('STORE_ADDRESS', '"Agripas 105, Jerusalem, Israel"'),
  ('STORE_PHONE', 'null'),
  ('STORE_WHATSAPP', 'null'),
  ('INSTAGRAM_URL', 'null'),
  ('FACEBOOK_URL', 'null'),
  ('LOGO_URL', '"/logo-placeholder.svg"'),
  ('CLUB_WELCOME_DISCOUNT_PERCENT', '20'),
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
  ]'),
  ('OPENING_HOURS', '[
    {"day":"sunday","open":null,"close":null},
    {"day":"monday","open":null,"close":null},
    {"day":"tuesday","open":null,"close":null},
    {"day":"wednesday","open":null,"close":null},
    {"day":"thursday","open":null,"close":null},
    {"day":"friday","open":null,"close":null},
    {"day":"saturday","open":null,"close":null}
  ]');

-- ============================================================
-- CATEGORIES
-- ============================================================

insert into categories (id, slug, name_he, name_fr, name_en, sort_order) values
  ('10000000-0000-0000-0000-000000000001', 'vin', 'יין', 'Vin', 'Wine', 1),
  ('10000000-0000-0000-0000-000000000002', 'whisky', 'וויסקי', 'Whisky', 'Whisky', 2),
  ('10000000-0000-0000-0000-000000000003', 'spiritueux', 'משקאות חריפים', 'Spiritueux', 'Spirits', 3),
  ('10000000-0000-0000-0000-000000000004', 'charcuterie', 'נקניקים', 'Charcuterie', 'Charcuterie', 4),
  ('10000000-0000-0000-0000-000000000005', 'saumon-fume', 'דגים מעושנים', 'Saumon fumé', 'Smoked Fish', 5),
  ('10000000-0000-0000-0000-000000000006', 'epicerie-fine', 'מעדנייה', 'Épicerie fine', 'Gourmet', 6);

-- ============================================================
-- SARFATI CATALOG (smoked fish) — section 12 of the brief.
-- Prices are stored as integer agorot (ILS * 100).
-- ============================================================

-- 200G range
insert into products (id, slug, category_id, brand, name_he, name_fr, status, published_at, kosher_status, storage_info)
values
  ('20000000-0000-0000-0000-000000000001', 'carpaccio-saumon-200g', '10000000-0000-0000-0000-000000000005', 'Sarfati', 'קרפצ׳ו סלמון 200 גרם', 'Carpaccio de saumon', 'published', now(), null, '0–4°C, à consommer sous 48h après ouverture'),
  ('20000000-0000-0000-0000-000000000002', 'saumon-fume-classique-fin-200g', '10000000-0000-0000-0000-000000000005', 'Sarfati', 'סלמון מעושן קלאסי פרימיום פרוס דק 200 גרם', 'Saumon fumé classique premium, tranché fin', 'published', now(), null, '0–4°C, à consommer sous 48h après ouverture'),
  ('20000000-0000-0000-0000-000000000003', 'saumon-fume-sans-sucre-fin-200g', '10000000-0000-0000-0000-000000000005', 'Sarfati', 'סלמון מעושן פרימיום ללא סוכר פרוס דק 200 גרם', 'Saumon fumé premium sans sucre, tranché fin', 'published', now(), null, '0–4°C, à consommer sous 48h après ouverture'),
  ('20000000-0000-0000-0000-000000000004', 'sashimi-saumon-sans-sucre-200g', '10000000-0000-0000-0000-000000000005', 'Sarfati', 'סשימי סלמון מעושן ללא סוכר 200 גרם', 'Sashimi de saumon fumé sans sucre', 'published', now(), null, '0–4°C, à consommer sous 48h après ouverture'),
  ('20000000-0000-0000-0000-000000000005', 'gravlax-200g', '10000000-0000-0000-0000-000000000005', 'Sarfati', 'גרבלקס / סלמון מרינט 200 גרם', 'Gravlax / saumon mariné', 'published', now(), null, '0–4°C, à consommer sous 48h après ouverture'),
  ('20000000-0000-0000-0000-000000000006', 'piece-saumon-classique-200g', '10000000-0000-0000-0000-000000000005', 'Sarfati', 'חתיכת סלמון מעושן קלאסי 200 גרם', 'Pièce de saumon fumé classique', 'published', now(), null, '0–4°C, à consommer sous 48h après ouverture'),
  ('20000000-0000-0000-0000-000000000007', 'piece-saumon-betterave-200g', '10000000-0000-0000-0000-000000000005', 'Sarfati', 'חתיכת סלמון מעושן בסלק 200 גרם', 'Pièce de saumon fumé à la betterave', 'published', now(), null, '0–4°C, à consommer sous 48h après ouverture'),
  ('20000000-0000-0000-0000-000000000008', 'piece-gravlax-200g', '10000000-0000-0000-0000-000000000005', 'Sarfati', 'חתיכת גרבלקס 200 גרם', 'Pièce de gravlax', 'published', now(), null, '0–4°C, à consommer sous 48h après ouverture');

insert into product_variants (product_id, label, weight_g, regular_price_agorot, is_default)
values
  ('20000000-0000-0000-0000-000000000001', '200g', 200, 11990, true),
  ('20000000-0000-0000-0000-000000000002', '200g', 200, 10990, true),
  ('20000000-0000-0000-0000-000000000003', '200g', 200, 10990, true),
  ('20000000-0000-0000-0000-000000000004', '200g', 200, 9990, true),
  ('20000000-0000-0000-0000-000000000005', '200g', 200, 8490, true),
  ('20000000-0000-0000-0000-000000000006', '200g', 200, 7990, true),
  ('20000000-0000-0000-0000-000000000007', '200g', 200, 7990, true),
  ('20000000-0000-0000-0000-000000000008', '200g', 200, 7990, true);

-- 100G range
insert into products (id, slug, category_id, brand, name_he, name_fr, status, published_at, storage_info)
values
  ('20000000-0000-0000-0000-000000000009', 'saumon-fume-classique-fin-100g', '10000000-0000-0000-0000-000000000005', 'Sarfati', 'סלמון מעושן קלאסי פרימיום פרוס דק 100 גרם', 'Saumon fumé classique premium, tranché fin', 'published', now(), '0–4°C, à consommer sous 48h après ouverture'),
  ('20000000-0000-0000-0000-000000000010', 'sashimi-saumon-classique-100g', '10000000-0000-0000-0000-000000000005', 'Sarfati', 'סשימי סלמון מעושן קלאסי 100 גרם', 'Sashimi de saumon fumé classique', 'published', now(), '0–4°C, à consommer sous 48h après ouverture'),
  ('20000000-0000-0000-0000-000000000011', 'sashimi-saumon-sans-sucre-100g', '10000000-0000-0000-0000-000000000005', 'Sarfati', 'סשימי סלמון מעושן ללא סוכר 100 גרם', 'Sashimi de saumon fumé sans sucre', 'published', now(), '0–4°C, à consommer sous 48h après ouverture'),
  ('20000000-0000-0000-0000-000000000012', 'sashimi-saumon-citron-poivre-100g', '10000000-0000-0000-0000-000000000005', 'Sarfati', 'סשימי סלמון מעושן לימון-פלפל 100 גרם', 'Sashimi de saumon fumé citron-poivre', 'published', now(), '0–4°C, à consommer sous 48h après ouverture'),
  ('20000000-0000-0000-0000-000000000013', 'gravlax-100g', '10000000-0000-0000-0000-000000000005', 'Sarfati', 'גרבלקס / סלמון מרינט 100 גרם', 'Gravlax / saumon mariné', 'published', now(), '0–4°C, à consommer sous 48h après ouverture'),
  ('20000000-0000-0000-0000-000000000014', 'sashimi-saumon-betterave-100g', '10000000-0000-0000-0000-000000000005', 'Sarfati', 'סשימי סלמון מעושן בסלק 100 גרם', 'Sashimi de saumon fumé à la betterave', 'published', now(), '0–4°C, à consommer sous 48h après ouverture');

insert into product_variants (product_id, label, weight_g, regular_price_agorot, is_default)
values
  ('20000000-0000-0000-0000-000000000009', '100g', 100, 5690, true),
  ('20000000-0000-0000-0000-000000000010', '100g', 100, 5490, true),
  ('20000000-0000-0000-0000-000000000011', '100g', 100, 5490, true),
  ('20000000-0000-0000-0000-000000000012', '100g', 100, 5490, true),
  ('20000000-0000-0000-0000-000000000013', '100g', 100, 5490, true),
  ('20000000-0000-0000-0000-000000000014', '100g', 100, 5490, true);

-- Other fish (priced by weight where specified)
insert into products (id, slug, category_id, brand, name_he, name_fr, status, published_at, storage_info)
values
  ('20000000-0000-0000-0000-000000000015', 'truite-fumee-filet', '10000000-0000-0000-0000-000000000005', 'Sarfati', 'פילה פורל מעושן', 'Filet de truite fumée', 'published', now(), '0–4°C, à consommer sous 48h après ouverture'),
  ('20000000-0000-0000-0000-000000000016', 'thon-rouge-fume-classique-100g', '10000000-0000-0000-0000-000000000005', 'Sarfati', 'טונה אדומה מעושנת קלאסית 100 גרם', 'Thon rouge fumé classique', 'published', now(), '0–4°C, à consommer sous 48h après ouverture'),
  ('20000000-0000-0000-0000-000000000017', 'thon-rouge-fume-chaud-100g', '10000000-0000-0000-0000-000000000005', 'Sarfati', 'טונה אדומה מעושנת חם 100 גרם', 'Thon rouge fumé à chaud', 'published', now(), '0–4°C, à consommer sous 48h après ouverture');

insert into product_variants (product_id, label, weight_g, regular_price_agorot, is_default)
values
  ('20000000-0000-0000-0000-000000000015', '100g (prix au poids)', 100, 4690, true),
  ('20000000-0000-0000-0000-000000000016', '100g', 100, 3990, true),
  ('20000000-0000-0000-0000-000000000017', '100g', 100, 3990, true);

-- Aperitif packs
insert into products (id, slug, category_id, brand, name_he, name_fr, status, published_at, storage_info)
values
  ('20000000-0000-0000-0000-000000000018', 'duo-saumon-2x100g', '10000000-0000-0000-0000-000000000005', 'Sarfati', 'זוג חבילות סלמון 2×100 גרם', '2 sachets de saumon x100g', 'published', now(), '0–4°C, à consommer sous 48h après ouverture'),
  ('20000000-0000-0000-0000-000000000019', 'trio-saumon-3x100g', '10000000-0000-0000-0000-000000000005', 'Sarfati', 'שלישיית חבילות סלמון 3×100 גרם', '3 sachets de saumon x100g', 'published', now(), '0–4°C, à consommer sous 48h après ouverture'),
  ('20000000-0000-0000-0000-000000000020', 'duo-saumon-thon-100g', '10000000-0000-0000-0000-000000000005', 'Sarfati', 'סלמון 100 גרם + טונה 100 גרם', '1 saumon 100g + 1 thon 100g', 'published', now(), '0–4°C, à consommer sous 48h après ouverture');

insert into product_variants (product_id, label, regular_price_agorot, is_default)
values
  ('20000000-0000-0000-0000-000000000018', '2 x 100g', 9990, true),
  ('20000000-0000-0000-0000-000000000019', '3 x 100g', 14990, true),
  ('20000000-0000-0000-0000-000000000020', '100g + 100g', 8990, true);

-- ============================================================
-- OTHER FISH CATALOG (section 13) — no verified pricing supplied,
-- variants are created with NULL price rather than an invented value.
-- ============================================================

insert into products (id, slug, category_id, brand, name_he, name_fr, status, published_at)
values
  ('20000000-0000-0000-0000-000000000021', 'anchois', '10000000-0000-0000-0000-000000000005', null, 'אנשובי', 'Anchois', 'draft', null),
  ('20000000-0000-0000-0000-000000000022', 'filet-thon', '10000000-0000-0000-0000-000000000005', null, 'פילה טונה 540 גרם', 'Filet de thon 540g', 'draft', null),
  ('20000000-0000-0000-0000-000000000023', 'ventreche-thon', '10000000-0000-0000-0000-000000000005', null, 'ונטרסקה טונה', 'Ventresca (ventrèche de thon)', 'draft', null);

insert into product_variants (product_id, label, weight_g, regular_price_agorot, is_default)
values
  ('20000000-0000-0000-0000-000000000021', 'Bac 500g', 500, null, false),
  ('20000000-0000-0000-0000-000000000021', 'Bocal 100g', 100, null, true),
  ('20000000-0000-0000-0000-000000000021', 'Bocal 300g', 300, null, false),
  ('20000000-0000-0000-0000-000000000022', '540g', 540, null, true),
  ('20000000-0000-0000-0000-000000000023', '120g', 120, null, false),
  ('20000000-0000-0000-0000-000000000023', '200g', 200, null, true),
  ('20000000-0000-0000-0000-000000000023', '300g', 300, null, false),
  ('20000000-0000-0000-0000-000000000023', '540g', 540, null, false),
  ('20000000-0000-0000-0000-000000000023', '1kg', 1000, null, false);

-- ============================================================
-- CHARCUTERIE CATALOG (section 14) — Hebrew names kept canonical.
-- No ingredients/weight/kosher/price/brand/allergen info invented.
-- ============================================================

insert into products (id, slug, category_id, name_he, status)
values
  ('30000000-0000-0000-0000-000000000001', 'tsarfati', '10000000-0000-0000-0000-000000000004', 'צרפתי', 'draft'),
  ('30000000-0000-0000-0000-000000000002', 'sinta', '10000000-0000-0000-0000-000000000004', 'סינטה', 'draft'),
  ('30000000-0000-0000-0000-000000000003', 'rozet', '10000000-0000-0000-0000-000000000004', 'רוזט', 'draft'),
  ('30000000-0000-0000-0000-000000000004', 'krakover', '10000000-0000-0000-0000-000000000004', 'קרקובר', 'draft'),
  ('30000000-0000-0000-0000-000000000005', 'salami-itlaki', '10000000-0000-0000-0000-000000000004', 'סלמי איטלקי', 'draft'),
  ('30000000-0000-0000-0000-000000000006', 'makel-tsarfati', '10000000-0000-0000-0000-000000000004', 'מקל צרפתי', 'draft'),
  ('30000000-0000-0000-0000-000000000007', 'makel-rozet', '10000000-0000-0000-0000-000000000004', 'מקל רוזט', 'draft'),
  ('30000000-0000-0000-0000-000000000008', 'pate-yayin', '10000000-0000-0000-0000-000000000004', 'פטה יין', 'draft'),
  ('30000000-0000-0000-0000-000000000009', 'pate-pitriyot', '10000000-0000-0000-0000-000000000004', 'פטה פטריות', 'draft'),
  ('30000000-0000-0000-0000-000000000010', 'kabanos', '10000000-0000-0000-0000-000000000004', 'קבנוס', 'draft');

-- ============================================================
-- SALMON PRODUCT IMAGES
-- Map each published salmon product to one of the 10 real photos
-- stored in /public/images/products/salmon. Photos are cycled so
-- every product gets a visual, while the admin keeps control by
-- dropping new files and updating product_media rows.
-- ============================================================

do $$
declare
  product record;
  idx int := 0;
  salmon_category_id uuid := '10000000-0000-0000-0000-000000000005';
  image_path text;
begin
  for product in
    select id, name_fr
    from products
    where category_id = salmon_category_id
      and status = 'published'
    order by name_fr
  loop
    idx := idx + 1;
    image_path := '/images/products/salmon/saumon-' || lpad(((idx - 1) % 3 + 1)::text, 2, '0') || '.jpg';
    if not exists (select 1 from product_media where product_id = product.id) then
      insert into product_media (product_id, url, alt, kind, display_order)
      values (
        product.id,
        image_path,
        coalesce(product.name_fr, 'Saumon fumé Terminal 3'),
        'COVER',
        0
      );
    end if;
  end loop;
end $$;
