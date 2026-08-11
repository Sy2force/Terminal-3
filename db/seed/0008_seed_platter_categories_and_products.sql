-- TERMINAL 3 — Seed platter categories and draft platter products
-- These products are intentionally created as DRAFT with no price so the
-- owner can complete pricing, composition and photography before publishing.

begin;

do $$
declare
  cat_salmon uuid;
  cat_charcuterie uuid;
  cat_poissons uuid;
  prod_id uuid;
begin
  -- ============================================================
  -- Categories
  -- ============================================================

  insert into categories (slug, name_he, name_fr, display_order, is_active, is_featured, short_description)
  values ('plateaux-saumon', 'מגשי סלמון', 'Plateaux Saumon', 10, true, true, 'Plateaux de saumon fumé premium')
  on conflict (slug) do nothing
  returning id into cat_salmon;

  if cat_salmon is null then
    select id into cat_salmon from categories where slug = 'plateaux-saumon';
  end if;

  insert into categories (slug, name_he, name_fr, display_order, is_active, is_featured, short_description)
  values ('plateaux-charcuterie', 'מגשי שרקוטרי', 'Plateaux Charcuterie', 11, true, true, 'Plateaux de charcuterie fine')
  on conflict (slug) do nothing
  returning id into cat_charcuterie;

  if cat_charcuterie is null then
    select id into cat_charcuterie from categories where slug = 'plateaux-charcuterie';
  end if;

  insert into categories (slug, name_he, name_fr, display_order, is_active, is_featured, short_description)
  values ('poissons-fins', 'דגים עדינים', 'Poissons Fins', 12, true, false, 'Anchois, thon, ventresca et autres poissons premium')
  on conflict (slug) do nothing
  returning id into cat_poissons;

  if cat_poissons is null then
    select id into cat_poissons from categories where slug = 'poissons-fins';
  end if;

  -- ============================================================
  -- Salmon platters
  -- ============================================================

  insert into products (id, category_id, product_type, slug, name_he, name_fr, status, age_restricted, availability_status)
  values (gen_random_uuid(), cat_salmon, 'PLATTER', 'plateau-saumon-classique', 'מגש סלמון קלאסי', 'Plateau Saumon Classique', 'draft', false, 'IN_STOCK')
  returning id into prod_id;
  insert into product_variants (product_id, label, is_default, availability_status, display_order, status) values (prod_id, 'Standard', true, 'IN_STOCK', 0, 'published');

  insert into products (id, category_id, product_type, slug, name_he, name_fr, status, age_restricted, availability_status)
  values (gen_random_uuid(), cat_salmon, 'PLATTER', 'plateau-gravlax', 'מגש גרבלאקס', 'Plateau Gravlax', 'draft', false, 'IN_STOCK')
  returning id into prod_id;
  insert into product_variants (product_id, label, is_default, availability_status, display_order, status) values (prod_id, 'Standard', true, 'IN_STOCK', 0, 'published');

  insert into products (id, category_id, product_type, slug, name_he, name_fr, status, age_restricted, availability_status)
  values (gen_random_uuid(), cat_salmon, 'PLATTER', 'plateau-degustation', 'מגש טעימות', 'Plateau Dégustation', 'draft', false, 'IN_STOCK')
  returning id into prod_id;
  insert into product_variants (product_id, label, is_default, availability_status, display_order, status) values (prod_id, 'Standard', true, 'IN_STOCK', 0, 'published');

  insert into products (id, category_id, product_type, slug, name_he, name_fr, status, age_restricted, availability_status)
  values (gen_random_uuid(), cat_salmon, 'PLATTER', 'plateau-aperitif', 'מגש אפריטיף', 'Plateau Apéritif', 'draft', false, 'IN_STOCK')
  returning id into prod_id;
  insert into product_variants (product_id, label, is_default, availability_status, display_order, status) values (prod_id, 'Standard', true, 'IN_STOCK', 0, 'published');

  insert into products (id, category_id, product_type, slug, name_he, name_fr, status, age_restricted, availability_status)
  values (gen_random_uuid(), cat_salmon, 'PLATTER', 'plateau-shabbat', 'מגש שבת', 'Plateau Shabbat', 'draft', false, 'IN_STOCK')
  returning id into prod_id;
  insert into product_variants (product_id, label, is_default, availability_status, display_order, status) values (prod_id, 'Standard', true, 'IN_STOCK', 0, 'published');

  insert into products (id, category_id, product_type, slug, name_he, name_fr, status, age_restricted, availability_status)
  values (gen_random_uuid(), cat_salmon, 'PLATTER', 'plateau-saumon-premium', 'מגש סלמון פרימיום', 'Plateau Premium', 'draft', false, 'IN_STOCK')
  returning id into prod_id;
  insert into product_variants (product_id, label, is_default, availability_status, display_order, status) values (prod_id, 'Standard', true, 'IN_STOCK', 0, 'published');

  insert into products (id, category_id, product_type, slug, name_he, name_fr, status, age_restricted, availability_status)
  values (gen_random_uuid(), cat_salmon, 'PLATTER', 'plateau-saumon-thon', 'מגש סלמון וטונה', 'Plateau Saumon & Thon', 'draft', false, 'IN_STOCK')
  returning id into prod_id;
  insert into product_variants (product_id, label, is_default, availability_status, display_order, status) values (prod_id, 'Standard', true, 'IN_STOCK', 0, 'published');

  insert into products (id, category_id, product_type, slug, name_he, name_fr, status, age_restricted, availability_status)
  values (gen_random_uuid(), cat_salmon, 'PLATTER', 'plateau-reception', 'מגש קבלת פנים', 'Plateau Réception', 'draft', false, 'IN_STOCK')
  returning id into prod_id;
  insert into product_variants (product_id, label, is_default, availability_status, display_order, status) values (prod_id, 'Standard', true, 'IN_STOCK', 0, 'published');

  insert into products (id, category_id, product_type, slug, name_he, name_fr, status, age_restricted, availability_status)
  values (gen_random_uuid(), cat_salmon, 'PLATTER', 'plateau-prestige', 'מגש פרסטיז\'', 'Plateau Prestige', 'draft', false, 'IN_STOCK')
  returning id into prod_id;
  insert into product_variants (product_id, label, is_default, availability_status, display_order, status) values (prod_id, 'Standard', true, 'IN_STOCK', 0, 'published');

  insert into products (id, category_id, product_type, slug, name_he, name_fr, status, age_restricted, availability_status)
  values (gen_random_uuid(), cat_salmon, 'PLATTER', 'plateau-signature-terminal-3', 'מגש סיגנצ\'ר טרמינל 3', 'Plateau Signature Terminal 3', 'draft', false, 'IN_STOCK')
  returning id into prod_id;
  insert into product_variants (product_id, label, is_default, availability_status, display_order, status) values (prod_id, 'Standard', true, 'IN_STOCK', 0, 'published');

  -- ============================================================
  -- Charcuterie platters
  -- ============================================================

  insert into products (id, category_id, product_type, slug, name_he, name_fr, status, age_restricted, availability_status)
  values (gen_random_uuid(), cat_charcuterie, 'PLATTER', 'plateau-charcuterie-classique', 'מגש שרקוטרי קלאסי', 'Plateau Charcuterie Classique', 'draft', false, 'IN_STOCK')
  returning id into prod_id;
  insert into product_variants (product_id, label, is_default, availability_status, display_order, status) values (prod_id, 'Standard', true, 'IN_STOCK', 0, 'published');

  insert into products (id, category_id, product_type, slug, name_he, name_fr, status, age_restricted, availability_status)
  values (gen_random_uuid(), cat_charcuterie, 'PLATTER', 'plateau-rosette', 'מגש רוזט', 'Plateau Rosette', 'draft', false, 'IN_STOCK')
  returning id into prod_id;
  insert into product_variants (product_id, label, is_default, availability_status, display_order, status) values (prod_id, 'Standard', true, 'IN_STOCK', 0, 'published');

  insert into products (id, category_id, product_type, slug, name_he, name_fr, status, age_restricted, availability_status)
  values (gen_random_uuid(), cat_charcuterie, 'PLATTER', 'plateau-sinta', 'מגש סינטה', 'Plateau Sinta', 'draft', false, 'IN_STOCK')
  returning id into prod_id;
  insert into product_variants (product_id, label, is_default, availability_status, display_order, status) values (prod_id, 'Standard', true, 'IN_STOCK', 0, 'published');

  insert into products (id, category_id, product_type, slug, name_he, name_fr, status, age_restricted, availability_status)
  values (gen_random_uuid(), cat_charcuterie, 'PLATTER', 'plateau-charcuterie-aperitif', 'מגש שרקוטרי אפריטיף', 'Plateau Apéritif', 'draft', false, 'IN_STOCK')
  returning id into prod_id;
  insert into product_variants (product_id, label, is_default, availability_status, display_order, status) values (prod_id, 'Standard', true, 'IN_STOCK', 0, 'published');

  insert into products (id, category_id, product_type, slug, name_he, name_fr, status, age_restricted, availability_status)
  values (gen_random_uuid(), cat_charcuterie, 'PLATTER', 'plateau-charcuterie-shabbat', 'מגש שרקוטרי שבת', 'Plateau Shabbat', 'draft', false, 'IN_STOCK')
  returning id into prod_id;
  insert into product_variants (product_id, label, is_default, availability_status, display_order, status) values (prod_id, 'Standard', true, 'IN_STOCK', 0, 'published');

  insert into products (id, category_id, product_type, slug, name_he, name_fr, status, age_restricted, availability_status)
  values (gen_random_uuid(), cat_charcuterie, 'PLATTER', 'plateau-charcuterie-mix', 'מגש שרקוטרי מיקס', 'Plateau Mix', 'draft', false, 'IN_STOCK')
  returning id into prod_id;
  insert into product_variants (product_id, label, is_default, availability_status, display_order, status) values (prod_id, 'Standard', true, 'IN_STOCK', 0, 'published');

  insert into products (id, category_id, product_type, slug, name_he, name_fr, status, age_restricted, availability_status)
  values (gen_random_uuid(), cat_charcuterie, 'PLATTER', 'plateau-charcuterie-premium', 'מגש שרקוטרי פרימיום', 'Plateau Premium', 'draft', false, 'IN_STOCK')
  returning id into prod_id;
  insert into product_variants (product_id, label, is_default, availability_status, display_order, status) values (prod_id, 'Standard', true, 'IN_STOCK', 0, 'published');

  insert into products (id, category_id, product_type, slug, name_he, name_fr, status, age_restricted, availability_status)
  values (gen_random_uuid(), cat_charcuterie, 'PLATTER', 'plateau-charcuterie-reception', 'מגש שרקוטרי קבלת פנים', 'Plateau Réception', 'draft', false, 'IN_STOCK')
  returning id into prod_id;
  insert into product_variants (product_id, label, is_default, availability_status, display_order, status) values (prod_id, 'Standard', true, 'IN_STOCK', 0, 'published');

  insert into products (id, category_id, product_type, slug, name_he, name_fr, status, age_restricted, availability_status)
  values (gen_random_uuid(), cat_charcuterie, 'PLATTER', 'plateau-charcuterie-prestige', 'מגש שרקוטרי פרסטיז\'', 'Plateau Prestige', 'draft', false, 'IN_STOCK')
  returning id into prod_id;
  insert into product_variants (product_id, label, is_default, availability_status, display_order, status) values (prod_id, 'Standard', true, 'IN_STOCK', 0, 'published');

  insert into products (id, category_id, product_type, slug, name_he, name_fr, status, age_restricted, availability_status)
  values (gen_random_uuid(), cat_charcuterie, 'PLATTER', 'plateau-charcuterie-signature-terminal-3', 'מגש שרקוטרי סיגנצ\'ר טרמינל 3', 'Plateau Signature Terminal 3', 'draft', false, 'IN_STOCK')
  returning id into prod_id;
  insert into product_variants (product_id, label, is_default, availability_status, display_order, status) values (prod_id, 'Standard', true, 'IN_STOCK', 0, 'published');
end $$;

commit;
