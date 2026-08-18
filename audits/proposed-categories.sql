-- Proposed categories hierarchy (idempotent, not applied yet)

BEGIN;

INSERT INTO categories (id, slug, name_fr, name_he, parent_id, is_active, is_featured, display_order)
  SELECT gen_random_uuid(), 'alcools', 'Alcools', 'אלכוהול', NULL, true, false, 0
  WHERE NOT EXISTS (SELECT 1 FROM categories WHERE slug = 'alcools');

INSERT INTO categories (id, slug, name_fr, name_he, parent_id, is_active, is_featured, display_order)
  SELECT gen_random_uuid(), 'vins', 'Vins', 'יינות', (SELECT id FROM categories WHERE slug = 'alcools'), true, false, 0
  WHERE NOT EXISTS (SELECT 1 FROM categories WHERE slug = 'vins');

INSERT INTO categories (id, slug, name_fr, name_he, parent_id, is_active, is_featured, display_order)
  SELECT gen_random_uuid(), 'whiskies', 'Whiskies', 'וויסקי', (SELECT id FROM categories WHERE slug = 'alcools'), true, false, 0
  WHERE NOT EXISTS (SELECT 1 FROM categories WHERE slug = 'whiskies');

INSERT INTO categories (id, slug, name_fr, name_he, parent_id, is_active, is_featured, display_order)
  SELECT gen_random_uuid(), 'tequilas', 'Tequilas', 'טקילה', (SELECT id FROM categories WHERE slug = 'alcools'), true, false, 0
  WHERE NOT EXISTS (SELECT 1 FROM categories WHERE slug = 'tequilas');

INSERT INTO categories (id, slug, name_fr, name_he, parent_id, is_active, is_featured, display_order)
  SELECT gen_random_uuid(), 'vodkas', 'Vodkas', 'וודקה', (SELECT id FROM categories WHERE slug = 'alcools'), true, false, 0
  WHERE NOT EXISTS (SELECT 1 FROM categories WHERE slug = 'vodkas');

INSERT INTO categories (id, slug, name_fr, name_he, parent_id, is_active, is_featured, display_order)
  SELECT gen_random_uuid(), 'rhums', 'Rhums', 'רום', (SELECT id FROM categories WHERE slug = 'alcools'), true, false, 0
  WHERE NOT EXISTS (SELECT 1 FROM categories WHERE slug = 'rhums');

INSERT INTO categories (id, slug, name_fr, name_he, parent_id, is_active, is_featured, display_order)
  SELECT gen_random_uuid(), 'gins', 'Gins', 'ג''ין', (SELECT id FROM categories WHERE slug = 'alcools'), true, false, 0
  WHERE NOT EXISTS (SELECT 1 FROM categories WHERE slug = 'gins');

INSERT INTO categories (id, slug, name_fr, name_he, parent_id, is_active, is_featured, display_order)
  SELECT gen_random_uuid(), 'araks', 'Araks', 'ערק', (SELECT id FROM categories WHERE slug = 'alcools'), true, false, 0
  WHERE NOT EXISTS (SELECT 1 FROM categories WHERE slug = 'araks');

INSERT INTO categories (id, slug, name_fr, name_he, parent_id, is_active, is_featured, display_order)
  SELECT gen_random_uuid(), 'cognacs', 'Cognacs', 'קוניאק', (SELECT id FROM categories WHERE slug = 'alcools'), true, false, 0
  WHERE NOT EXISTS (SELECT 1 FROM categories WHERE slug = 'cognacs');

INSERT INTO categories (id, slug, name_fr, name_he, parent_id, is_active, is_featured, display_order)
  SELECT gen_random_uuid(), 'liqueurs', 'Liqueurs', 'ליקרים', (SELECT id FROM categories WHERE slug = 'alcools'), true, false, 0
  WHERE NOT EXISTS (SELECT 1 FROM categories WHERE slug = 'liqueurs');

INSERT INTO categories (id, slug, name_fr, name_he, parent_id, is_active, is_featured, display_order)
  SELECT gen_random_uuid(), 'bieres', 'Bières', 'בירות', (SELECT id FROM categories WHERE slug = 'alcools'), true, false, 0
  WHERE NOT EXISTS (SELECT 1 FROM categories WHERE slug = 'bieres');

INSERT INTO categories (id, slug, name_fr, name_he, parent_id, is_active, is_featured, display_order)
  SELECT gen_random_uuid(), 'epicerie-fine', 'Épicerie fine', 'מעדני יוקרה', NULL, true, false, 0
  WHERE NOT EXISTS (SELECT 1 FROM categories WHERE slug = 'epicerie-fine');

INSERT INTO categories (id, slug, name_fr, name_he, parent_id, is_active, is_featured, display_order)
  SELECT gen_random_uuid(), 'poissons', 'Poissons', 'דגים', (SELECT id FROM categories WHERE slug = 'epicerie-fine'), true, false, 0
  WHERE NOT EXISTS (SELECT 1 FROM categories WHERE slug = 'poissons');

INSERT INTO categories (id, slug, name_fr, name_he, parent_id, is_active, is_featured, display_order)
  SELECT gen_random_uuid(), 'charcuteries', 'Charcuteries', 'נקניקים', (SELECT id FROM categories WHERE slug = 'epicerie-fine'), true, false, 0
  WHERE NOT EXISTS (SELECT 1 FROM categories WHERE slug = 'charcuteries');

INSERT INTO categories (id, slug, name_fr, name_he, parent_id, is_active, is_featured, display_order)
  SELECT gen_random_uuid(), 'fromages', 'Fromages', 'גבינות', (SELECT id FROM categories WHERE slug = 'epicerie-fine'), true, false, 0
  WHERE NOT EXISTS (SELECT 1 FROM categories WHERE slug = 'fromages');

INSERT INTO categories (id, slug, name_fr, name_he, parent_id, is_active, is_featured, display_order)
  SELECT gen_random_uuid(), 'olives', 'Olives', 'זיתים', (SELECT id FROM categories WHERE slug = 'epicerie-fine'), true, false, 0
  WHERE NOT EXISTS (SELECT 1 FROM categories WHERE slug = 'olives');

INSERT INTO categories (id, slug, name_fr, name_he, parent_id, is_active, is_featured, display_order)
  SELECT gen_random_uuid(), 'huiles', 'Huiles', 'שמנים', (SELECT id FROM categories WHERE slug = 'epicerie-fine'), true, false, 0
  WHERE NOT EXISTS (SELECT 1 FROM categories WHERE slug = 'huiles');

INSERT INTO categories (id, slug, name_fr, name_he, parent_id, is_active, is_featured, display_order)
  SELECT gen_random_uuid(), 'epices', 'Épices', 'תבלינים', (SELECT id FROM categories WHERE slug = 'epicerie-fine'), true, false, 0
  WHERE NOT EXISTS (SELECT 1 FROM categories WHERE slug = 'epices');

INSERT INTO categories (id, slug, name_fr, name_he, parent_id, is_active, is_featured, display_order)
  SELECT gen_random_uuid(), 'capres', 'Câpres', 'צלפים', (SELECT id FROM categories WHERE slug = 'epicerie-fine'), true, false, 0
  WHERE NOT EXISTS (SELECT 1 FROM categories WHERE slug = 'capres');

INSERT INTO categories (id, slug, name_fr, name_he, parent_id, is_active, is_featured, display_order)
  SELECT gen_random_uuid(), 'plateaux', 'Plateaux', 'מגשים', NULL, true, false, 0
  WHERE NOT EXISTS (SELECT 1 FROM categories WHERE slug = 'plateaux');

INSERT INTO categories (id, slug, name_fr, name_he, parent_id, is_active, is_featured, display_order)
  SELECT gen_random_uuid(), 'coffrets-cadeaux', 'Coffrets cadeaux', 'מארזי מתנה', NULL, true, false, 0
  WHERE NOT EXISTS (SELECT 1 FROM categories WHERE slug = 'coffrets-cadeaux');

INSERT INTO categories (id, slug, name_fr, name_he, parent_id, is_active, is_featured, display_order)
  SELECT gen_random_uuid(), 'promotions', 'Promotions', 'מבצעים', NULL, true, false, 0
  WHERE NOT EXISTS (SELECT 1 FROM categories WHERE slug = 'promotions');

COMMIT;
