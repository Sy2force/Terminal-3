-- TERMINAL 3 — spirits catalog demo data
-- Provisional but realistic spirits references so /spiritueux and
-- /spiritueux/[slug] can be verified with a real, unlimited-capacity
-- dataset instead of a static array in a component. Run AFTER
-- db/migrations/0013_spirits_catalog_fields.sql. Safe to re-run: every
-- insert is guarded with `on conflict do nothing`.
--
-- Replace/expand these rows from /admin once real inventory is
-- available — nothing here is hardcoded into the UI, it all flows
-- through the normal products/product_variants/product_media tables.

begin;

-- Category 'spiritueux' already exists from db/seed/seed.sql
-- ('10000000-0000-0000-0000-000000000003').

insert into products (
  id, slug, category_id, product_type, brand, name_he, name_fr, name_en,
  description_fr, how_to_serve, kosher_status, status, is_featured,
  availability_status, base_price_agorot, compare_at_price_agorot,
  published_at, new_until, region, country, rating, review_count,
  is_best_seller, badge, subcategory, age_years, nose_notes, palate_notes,
  finish_notes, cask_type, edition, production_method
) values
  (
    '50000000-0000-0000-0000-000000000001', 'chivas-regal-12', '10000000-0000-0000-0000-000000000003',
    'STANDARD', 'Chivas Regal', 'צ''יבס ריגל 12', 'Chivas Regal 12 ans', 'Chivas Regal 12',
    'Un blended Scotch whisky emblématique, assemblage de plus de 20 malts et grains d''exception.',
    'Pur, avec un glaçon ou en cocktail (whisky sour). Verre tumbler recommandé.',
    null, 'published', true, 'IN_STOCK', 15900, null, now(), null, null, 'Écosse',
    4.6, 142, true, null, 'WHISKY', 12,
    'Pomme mûre, miel, vanille douce.', 'Rond et soyeux, notes de fruits secs et de céréales grillées.',
    'Longue et chaleureuse, légèrement épicée.', 'Fûts de chêne américain et européen', null,
    'Assemblage (blend) de whiskies de malt et de grain'
  ),
  (
    '50000000-0000-0000-0000-000000000002', 'glenfiddich-12', '10000000-0000-0000-0000-000000000003',
    'STANDARD', 'Glenfiddich', 'גלנפידיך 12', 'Glenfiddich 12 ans', 'Glenfiddich 12',
    'Le single malt le plus primé au monde, frais et fruité, vieilli en fûts de bourbon et de sherry.',
    'Pur ou avec quelques gouttes d''eau. Verre tulipe recommandé.',
    null, 'published', true, 'IN_STOCK', 17900, 19900, now(), null, null, 'Écosse',
    4.7, 168, true, 'Coup de cœur', 'WHISKY', 12,
    'Poire fraîche, notes subtiles de chêne.', 'Doux et rond, fruits mûrs et malt délicat.',
    'Douce et persistante.', 'Fûts de chêne américain (bourbon) et fûts de sherry européen', null,
    'Single malt, double distillation'
  ),
  (
    '50000000-0000-0000-0000-000000000003', 'glenlivet-founders-reserve', '10000000-0000-0000-0000-000000000003',
    'STANDARD', 'The Glenlivet', 'גלנליווט פאונדרס', 'The Glenlivet Founder''s Reserve', 'The Glenlivet Founder''s Reserve',
    'Un single malt élégant et accessible, hommage au fondateur de la distillerie.',
    'Pur ou avec un glaçon. Verre tumbler recommandé.',
    null, 'published', false, 'IN_STOCK', 16900, null, now(), null, null, 'Écosse',
    4.4, 87, false, null, 'WHISKY', null,
    'Fleurs fraîches, agrumes, notes de vanille.', 'Rond, fruité, légèrement épicé.',
    'Nette et rafraîchissante.', 'Fûts de chêne américain', null, 'Single malt'
  ),
  (
    '50000000-0000-0000-0000-000000000004', 'johnnie-walker-black-label', '10000000-0000-0000-0000-000000000003',
    'STANDARD', 'Johnnie Walker', 'ג''וניווקר בלאק לייבל', 'Johnnie Walker Black Label', 'Johnnie Walker Black Label',
    'Un blended Scotch whisky de 12 ans d''âge minimum, riche et fumé.',
    'Pur, avec glace ou en cocktail (Old Fashioned). Verre tumbler recommandé.',
    null, 'published', false, 'IN_STOCK', 14900, null, now(), null, null, 'Écosse',
    4.5, 201, true, 'Best-seller', 'WHISKY', 12,
    'Fumée légère, fruits noirs, vanille.', 'Riche et complexe, notes de fruits secs et d''épices douces.',
    'Longue, légèrement fumée.', 'Fûts de chêne', null, 'Assemblage (blend)'
  ),
  (
    '50000000-0000-0000-0000-000000000005', 'jack-daniels-old-no-7', '10000000-0000-0000-0000-000000000003',
    'STANDARD', 'Jack Daniel''s', 'ג''ק דניאלס', 'Jack Daniel''s Old No. 7', 'Jack Daniel''s Old No. 7',
    'Le Tennessee whiskey le plus célèbre au monde, filtré sur charbon d''érable.',
    'Pur, avec glace ou en cocktail (Jack & Coke). Verre tumbler recommandé.',
    null, 'published', false, 'IN_STOCK', 12900, null, now(), null, null, 'États-Unis',
    4.3, 156, false, null, 'WHISKY', null,
    'Vanille, caramel, chêne toasté.', 'Rond et doux, notes de caramel et de bois.',
    'Douce, légèrement fumée.', null, null, 'Filtration Lincoln County sur charbon d''érable'
  ),
  (
    '50000000-0000-0000-0000-000000000006', 'jameson', '10000000-0000-0000-0000-000000000003',
    'STANDARD', 'Jameson', 'ג''יימסון', 'Jameson', 'Jameson',
    'Le blended Irish whiskey le plus vendu au monde, triple distillé pour une grande douceur.',
    'Pur, avec glace ou en cocktail (Jameson Ginger). Verre tumbler recommandé.',
    null, 'published', false, 'IN_STOCK', 11900, 13500, now(), null, null, 'Irlande',
    4.4, 178, true, null, 'WHISKY', null,
    'Notes florales, épices douces, bois.', 'Doux et onctueux, vanille et fruits mûrs.',
    'Nette et équilibrée.', null, null, 'Triple distillation'
  ),
  (
    '50000000-0000-0000-0000-000000000007', 'arak-elite', '10000000-0000-0000-0000-000000000003',
    'STANDARD', 'Elite', 'עראק אליט', 'Arak Elite', 'Arak Elite',
    'Un arak israélien traditionnel distillé à partir de raisins et aromatisé à l''anis.',
    'Toujours dilué avec de l''eau fraîche et des glaçons (1 volume d''arak pour 2 à 3 volumes d''eau). Verre droit recommandé.',
    'Casher Mehadrin', 'published', true, 'IN_STOCK', 8900, null, now(), null, null, 'Israël',
    4.5, 64, false, null, 'ARAK', null,
    'Anis frais, notes florales.', 'Doux et anisé, légèrement sucré une fois dilué.',
    'Rafraîchissante et persistante.', null, null, 'Distillation traditionnelle du raisin, aromatisation à l''anis'
  ),
  (
    '50000000-0000-0000-0000-000000000008', 'arak-askalon', '10000000-0000-0000-0000-000000000003',
    'STANDARD', 'Askalon', 'עראק אשקלון', 'Arak Askalon', 'Arak Askalon',
    'Un arak artisanal produit par la distillerie Askalon, réputé pour sa pureté aromatique.',
    'Toujours dilué avec de l''eau fraîche et des glaçons. Verre droit recommandé.',
    'Casher Mehadrin', 'published', false, 'IN_STOCK', 9900, null, now(), now() + interval '30 days', null, 'Israël',
    4.6, 39, false, 'Nouveau', 'ARAK', null,
    'Anis intense, notes herbacées.', 'Franc et aromatique, texture soyeuse une fois dilué.',
    'Longue, nette, légèrement sucrée.', null, null, 'Distillation artisanale, aromatisation à l''anis'
  ),
  (
    '50000000-0000-0000-0000-000000000009', 'tubi-60', '10000000-0000-0000-0000-000000000003',
    'STANDARD', 'Tubi', 'טובי 60', 'Tubi 60 blanc', 'Tubi 60',
    'Un arak puissant à 60° d''alcool, pour les amateurs de sensations fortes et de tradition.',
    'Toujours largement dilué avec de l''eau fraîche et des glaçons, en raison de son fort degré d''alcool. Verre droit recommandé.',
    'Casher Mehadrin', 'published', false, 'IN_STOCK', 7900, null, now(), null, null, 'Israël',
    4.2, 28, false, null, 'ARAK', null,
    'Anis puissant, notes minérales.', 'Intense et corsé, très aromatique.',
    'Longue et chaleureuse.', null, null, 'Distillation traditionnelle du raisin'
  ),
  (
    '50000000-0000-0000-0000-000000000010', 'hennessy-vs', '10000000-0000-0000-0000-000000000003',
    'STANDARD', 'Hennessy', 'הנסי VS', 'Hennessy V.S', 'Hennessy V.S',
    'Un cognac Very Special, assemblage vif et fruité, référence de la maison Hennessy.',
    'Pur, avec glace ou en cocktail. Verre tulipe recommandé.',
    null, 'published', false, 'IN_STOCK', 21900, null, now(), null, null, 'France',
    4.5, 52, false, null, 'COGNAC', null,
    'Fruits secs, notes florales.', 'Vif et fruité, légèrement épicé.',
    'Nette, chaleureuse.', null, null, 'Double distillation, assemblage d''eaux-de-vie de Cognac'
  ),
  (
    '50000000-0000-0000-0000-000000000011', 'havana-club-7', '10000000-0000-0000-0000-000000000003',
    'STANDARD', 'Havana Club', 'האוואנה קלאב 7', 'Havana Club 7 ans', 'Havana Club 7',
    'Un rhum cubain vieilli 7 ans, riche et complexe, référence des amateurs de rhum brun.',
    'Pur, sur glace ou en cocktail (Cuba Libre). Verre tumbler recommandé.',
    null, 'published', false, 'IN_STOCK', 13900, null, now(), null, null, 'Cuba',
    4.4, 46, false, null, 'RHUM', 7,
    'Vanille, bois, fruits confits.', 'Rond et intense, notes de caramel et d''épices.',
    'Longue et boisée.', null, null, 'Vieillissement en fûts de chêne américain'
  ),
  (
    '50000000-0000-0000-0000-000000000012', 'don-julio-blanco', '10000000-0000-0000-0000-000000000003',
    'STANDARD', 'Don Julio', 'דון חוליו בלנקו', 'Don Julio Blanco', 'Don Julio Blanco',
    'Une tequila 100% agave bleue, fraîche et pure, référence de la tequila premium.',
    'Pur, en shot ou en cocktail (Margarita). Verre à shot ou tumbler recommandé.',
    null, 'published', true, 'IN_STOCK', 22900, null, now(), null, null, 'Mexique',
    4.6, 34, false, null, 'TEQUILA', null,
    'Agave frais, agrumes.', 'Doux et rond, notes végétales et poivrées.',
    'Nette et fraîche.', null, null, '100% agave bleue, double distillation'
  ),
  (
    '50000000-0000-0000-0000-000000000013', 'grey-goose', '10000000-0000-0000-0000-000000000003',
    'STANDARD', 'Grey Goose', 'גרי גוס', 'Grey Goose', 'Grey Goose',
    'Une vodka française premium, distillée à partir de blé et filtrée à l''eau de source de Gensac.',
    'Bien fraîche, pure ou en cocktail (Cosmopolitan). Verre à shot glacé recommandé.',
    'Casher', 'published', true, 'IN_STOCK', 17900, null, now(), null, null, 'France',
    4.5, 91, true, 'Coup de cœur', 'VODKA', null,
    'Discret, légèrement sucré.', 'Soyeux et pur, notes délicates d''amande.',
    'Nette et propre.', null, null, 'Distillation du blé, filtration à l''eau de source'
  ),
  (
    '50000000-0000-0000-0000-000000000014', 'belvedere', '10000000-0000-0000-0000-000000000003',
    'STANDARD', 'Belvedere', 'בלוודר', 'Belvedere', 'Belvedere',
    'Une vodka polonaise premium, distillée quatre fois à partir de seigle Dankowskie.',
    'Bien fraîche, pure ou en cocktail. Verre à shot glacé recommandé.',
    null, 'published', false, 'IN_STOCK', 16900, 18900, now(), null, null, 'Pologne',
    4.4, 58, false, null, 'VODKA', null,
    'Léger, notes de vanille et de seigle.', 'Onctueux et rond, texture crémeuse.',
    'Douce et persistante.', null, null, 'Quadruple distillation du seigle Dankowskie'
  ),
  (
    '50000000-0000-0000-0000-000000000015', 'bombay-sapphire', '10000000-0000-0000-0000-000000000003',
    'STANDARD', 'Bombay Sapphire', 'במבייספייר', 'Bombay Sapphire', 'Bombay Sapphire',
    'Un gin anglais distillé à la vapeur avec dix botaniques soigneusement sélectionnées.',
    'En cocktail (Gin Tonic) avec des glaçons et une rondelle de citron. Verre ballon recommandé.',
    null, 'published', false, 'IN_STOCK', 13900, null, now(), null, null, 'Royaume-Uni',
    4.3, 73, false, null, 'GIN', null,
    'Genièvre, agrumes, épices douces.', 'Frais et complexe, notes botaniques équilibrées.',
    'Nette et aromatique.', null, null, 'Distillation à la vapeur de dix botaniques'
  ),
  (
    '50000000-0000-0000-0000-000000000016', 'baileys-original', '10000000-0000-0000-0000-000000000003',
    'STANDARD', 'Baileys', 'ניילייס אוריג''ינל', 'Baileys Original', 'Baileys Original',
    'Une liqueur irlandaise crémeuse à base de whiskey et de crème fraîche.',
    'Frais, sur glace ou en cocktail dessert. Verre à liqueur recommandé.',
    null, 'published', false, 'IN_STOCK', 9900, null, now(), null, null, 'Irlande',
    4.2, 45, false, null, 'LIQUEUR', null,
    'Crème, cacao, vanille.', 'Onctueux et gourmand, notes de café et de caramel.',
    'Douce et persistante.', null, null, 'Assemblage de whiskey irlandais et de crème fraîche'
  ),
  (
    '50000000-0000-0000-0000-000000000017', 'campari', '10000000-0000-0000-0000-000000000003',
    'STANDARD', 'Campari', 'קמפרי', 'Campari', 'Campari',
    'Un apéritif italien amer et aromatique, incontournable des cocktails classiques.',
    'En apéritif avec des glaçons et une tranche d''orange, ou en cocktail (Negroni, Spritz). Verre ballon recommandé.',
    null, 'published', false, 'IN_STOCK', 8900, null, now(), null, null, 'Italie',
    4.1, 37, false, null, 'APERITIF', null,
    'Orange amère, épices, plantes aromatiques.', 'Amer et vif, notes d''agrumes confits.',
    'Longue et amère.', null, null, 'Infusion de plantes, herbes aromatiques et écorces d''agrumes'
  ),
  (
    '50000000-0000-0000-0000-000000000018', 'macallan-18', '10000000-0000-0000-0000-000000000003',
    'STANDARD', 'The Macallan', 'מקאלן 18', 'The Macallan 18 ans', 'The Macallan 18',
    'Un single malt d''exception vieilli 18 ans en fûts de sherry espagnol, pour les grandes occasions.',
    'Pur, à température ambiante, dans un verre tulipe pour révéler tous les arômes.',
    null, 'published', true, 'IN_STOCK', 54900, null, now(), null, null, 'Écosse',
    4.9, 22, false, 'Édition limitée', 'PREMIUM', 18,
    'Fruits secs, épices, chêne noble.', 'Riche et velouté, notes de sherry et de chocolat noir.',
    'Très longue, élégante et boisée.', 'Fûts de sherry espagnol', 'Sherry Oak 18 Years', 'Single malt'
  )
on conflict (id) do nothing;

insert into product_variants (
  id, product_id, label, volume_ml, abv, regular_price_agorot, is_default, availability_status, display_order
) values
  ('51000000-0000-0000-0000-000000000001', '50000000-0000-0000-0000-000000000001', '700ml', 700, 40.0, 15900, true, 'IN_STOCK', 0),
  ('51000000-0000-0000-0000-000000000002', '50000000-0000-0000-0000-000000000002', '700ml', 700, 40.0, 17900, true, 'IN_STOCK', 0),
  ('51000000-0000-0000-0000-000000000003', '50000000-0000-0000-0000-000000000003', '700ml', 700, 40.0, 16900, true, 'IN_STOCK', 0),
  ('51000000-0000-0000-0000-000000000004', '50000000-0000-0000-0000-000000000004', '700ml', 700, 40.0, 14900, true, 'IN_STOCK', 0),
  ('51000000-0000-0000-0000-000000000005', '50000000-0000-0000-0000-000000000005', '700ml', 700, 40.0, 12900, true, 'IN_STOCK', 0),
  ('51000000-0000-0000-0000-000000000006', '50000000-0000-0000-0000-000000000006', '700ml', 700, 40.0, 11900, true, 'IN_STOCK', 0),
  ('51000000-0000-0000-0000-000000000007', '50000000-0000-0000-0000-000000000007', '700ml', 700, 40.0, 8900, true, 'IN_STOCK', 0),
  ('51000000-0000-0000-0000-000000000008', '50000000-0000-0000-0000-000000000008', '700ml', 700, 40.0, 9900, true, 'IN_STOCK', 0),
  ('51000000-0000-0000-0000-000000000009', '50000000-0000-0000-0000-000000000009', '700ml', 700, 60.0, 7900, true, 'IN_STOCK', 0),
  ('51000000-0000-0000-0000-000000000010', '50000000-0000-0000-0000-000000000010', '700ml', 700, 40.0, 21900, true, 'IN_STOCK', 0),
  ('51000000-0000-0000-0000-000000000011', '50000000-0000-0000-0000-000000000011', '700ml', 700, 40.0, 13900, true, 'IN_STOCK', 0),
  ('51000000-0000-0000-0000-000000000012', '50000000-0000-0000-0000-000000000012', '700ml', 700, 38.0, 22900, true, 'IN_STOCK', 0),
  ('51000000-0000-0000-0000-000000000013', '50000000-0000-0000-0000-000000000013', '700ml', 700, 40.0, 17900, true, 'IN_STOCK', 0),
  ('51000000-0000-0000-0000-000000000014', '50000000-0000-0000-0000-000000000014', '700ml', 700, 40.0, 16900, true, 'IN_STOCK', 0),
  ('51000000-0000-0000-0000-000000000015', '50000000-0000-0000-0000-000000000015', '700ml', 700, 40.0, 13900, true, 'IN_STOCK', 0),
  ('51000000-0000-0000-0000-000000000016', '50000000-0000-0000-0000-000000000016', '700ml', 700, 17.0, 9900, true, 'IN_STOCK', 0),
  ('51000000-0000-0000-0000-000000000017', '50000000-0000-0000-0000-000000000017', '700ml', 700, 25.0, 8900, true, 'IN_STOCK', 0),
  ('51000000-0000-0000-0000-000000000018', '50000000-0000-0000-0000-000000000018', '700ml', 700, 43.0, 54900, true, 'IN_STOCK', 0)
on conflict (id) do nothing;

-- No real product photography yet — every row points to the existing
-- Terminal 3 alcohol placeholder rather than a fabricated per-bottle path
-- (never render a broken image). Replace from /admin once photos exist.
do $$
declare
  spirit record;
begin
  for spirit in
    select id, name_fr
    from products
    where category_id = '10000000-0000-0000-0000-000000000003'
      and id::text like '50000000-%'
  loop
    if not exists (select 1 from product_media where product_id = spirit.id) then
      insert into product_media (product_id, url, alt, kind, display_order)
      values (spirit.id, '/images/products/alcohol/placeholder.jpg', coalesce(spirit.name_fr, 'Spiritueux Terminal 3'), 'COVER', 0);
    end if;
  end loop;
end $$;

commit;
