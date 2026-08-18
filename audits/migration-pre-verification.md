# Pré-vérification des migrations Phase 2A

## Contexte

Les quatre migrations suivantes ont été préparées mais **non appliquées** :

- `db/migrations/0032_product_enhancements.sql`
- `db/migrations/0033_product_media_relation.sql`
- `db/migrations/0034_invoice_items.sql`
- `db/migrations/0035_category_covers_and_hierarchy.sql`

Cette vérification a été réalisée par analyse statique du SQL et par inspection du schéma Supabase via les sauvegardes locales. Un dry-run automatique n'a pas été possible car le CLI Supabase n'est pas authentifié (`supabase login` nécessite un `SUPABASE_ACCESS_TOKEN`).

---

## 1. `0032_product_enhancements.sql`

### Contenu

```sql
ALTER TABLE products ADD COLUMN IF NOT EXISTS main_image_id uuid REFERENCES media(id) ON DELETE SET NULL;
ALTER TABLE products ADD COLUMN IF NOT EXISTS cost_price_agorot bigint DEFAULT 0;
ALTER TABLE products ADD COLUMN IF NOT EXISTS sku text UNIQUE;
ALTER TABLE products ADD COLUMN IF NOT EXISTS search_keywords text[] DEFAULT '{}'::text[];
ALTER TABLE products ADD COLUMN IF NOT EXISTS created_by uuid REFERENCES auth.users(id) ON DELETE SET NULL;
ALTER TABLE products ADD COLUMN IF NOT EXISTS updated_by uuid REFERENCES auth.users(id) ON DELETE SET NULL;
CREATE UNIQUE INDEX IF NOT EXISTS idx_products_slug_unique ON products(slug);
```

### Vérifications

| Point | État | Détail |
|-------|------|--------|
| Table `products` existe | OUI | 676 lignes dans la sauvegarde |
| Colonne `main_image_id` existe | NON | à créer |
| Colonne `cost_price_agorot` existe | NON | à créer |
| Colonne `sku` existe | NON | à créer ; `product_variants.sku` existe déjà mais pas `products.sku` |
| Colonne `search_keywords` existe | NON | à créer |
| Colonnes `created_by`, `updated_by` existent | NON | à créer |
| Contrainte `products.slug` unique | NON | `slug` est défini comme `text` sans contrainte unique visible dans `types/database.ts` ; l'index corrige cela |
| Table `media` existe | OUI | 0 ligne actuellement, mais la table existe |
| `auth.users` existe | OUI | fourni par Supabase Auth |
| **Réversibilité** | OUI | `DROP COLUMN IF EXISTS` pour chaque colonne ajoutée, `DROP INDEX` pour l'index |
| **Risque de verrouillage** | FAIBLE | `ADD COLUMN` avec `DEFAULT` non NULL sur une table de 676 lignes : rapide ; `CREATE UNIQUE INDEX` nécessite que `slug` soit unique ; à vérifier avant application |

### Problème potentiel

`CREATE UNIQUE INDEX idx_products_slug_unique` échouera si des `slug` sont dupliqués. Vérifier avec :

```sql
SELECT slug, COUNT(*) FROM products GROUP BY slug HAVING COUNT(*) > 1;
```

### Rollback

Voir `db/migrations/rollback/0032_product_enhancements_rollback.sql`.

---

## 2. `0033_product_media_relation.sql`

### Contenu

```sql
ALTER TABLE product_media ADD COLUMN IF NOT EXISTS media_id uuid REFERENCES media(id) ON DELETE SET NULL;
ALTER TABLE product_media ALTER COLUMN url DROP NOT NULL;
-- type product_media_role
-- colonne role
-- UPDATE product_media SET role = ... FROM kind
-- index
```

### Vérifications

| Point | État | Détail |
|-------|------|--------|
| Table `product_media` existe | OUI | 676 lignes |
| Colonne `url` | OUI | `text`, actuellement NOT NULL |
| Colonne `media_id` | NON | à créer |
| Colonne `role` | NON | à créer |
| Type `product_media_kind` | OUI | valeurs `COVER`, `GALLERY`, `LIFESTYLE`, `DETAIL`, `EDITORIAL` |
| Valeurs `kind` | OK | mapping vers `role` possible |
| **Réversibilité** | OUI | `DROP COLUMN media_id, role; DROP TYPE product_media_role; ALTER TABLE product_media ALTER COLUMN url SET NOT NULL;` |
| **Risque de verrouillage** | FAIBLE | `UPDATE` sur 676 lignes est rapide ; `ALTER COLUMN url DROP NOT NULL` réversible |

### Points d'attention

- Le champ `url` est temporairement conservé, conformément à la demande.
- Le `UPDATE` assigne `role` à partir de `kind` : `COVER` → `main`, `GALLERY` → `gallery`, `LIFESTYLE` → `lifestyle`.
- Les `product_media` dont `kind` est `DETAIL` ou `EDITORIAL` ne sont pas mappés explicitement et resteront `gallery` (valeur par défaut).

### Rollback

Voir `db/migrations/rollback/0033_product_media_relation_rollback.sql`.

---

## 3. `0034_invoice_items.sql`

### Contenu

```sql
CREATE TABLE invoice_items (...);
CREATE INDEX ...;
CREATE TRIGGER ...;
ENABLE RLS;
CREATE POLICY ...;
```

### Vérifications

| Point | État | Détail |
|-------|------|--------|
| Table `invoice_items` existe | NON | à créer |
| Tables `invoices`, `order_items`, `products` existent | OUI | `invoices` est vide, `order_items` est vide |
| Trigger `trg_invoice_items_updated` | NON | à créer |
| RLS | OUI | migration active RLS et crée une policy restrictive |
| **Réversibilité** | OUI | `DROP TABLE invoice_items;` supprime la table, indexes, trigger et policies |
| **Risque de verrouillage** | NUL | création d'une table vide |

### Point d'attention

La RLS policy :

```sql
(SELECT role FROM admin_roles WHERE user_id = auth.uid()) IS NOT NULL
```

retourne une erreur si un utilisateur a plusieurs rôles. Il faut la remplacer par :

```sql
EXISTS (SELECT 1 FROM admin_roles WHERE user_id = auth.uid())
```

**Recommandation :** modifier la migration avant application pour remplacer la sous-requête `SELECT role ...` par `EXISTS`.

### Rollback

Voir `db/migrations/rollback/0034_invoice_items_rollback.sql`.

---

## 4. `0035_category_covers_and_hierarchy.sql`

### Contenu

```sql
ALTER TABLE categories ADD COLUMN IF NOT EXISTS cover_image_id uuid REFERENCES media(id) ON DELETE SET NULL;
ALTER TABLE brands ADD COLUMN IF NOT EXISTS logo_image_id uuid REFERENCES media(id) ON DELETE SET NULL;
ALTER TABLE brands ADD COLUMN IF NOT EXISTS cover_image_id uuid REFERENCES media(id) ON DELETE SET NULL;
CREATE INDEX ...;
```

### Vérifications

| Point | État | Détail |
|-------|------|--------|
| Table `categories` existe | OUI | 5 lignes, `parent_id` existe |
| Table `brands` existe | OUI | 0 ligne |
| Colonnes `cover_image_id` | NON | à créer |
| `categories.cover_image` (text) existe | OUI | conservé temporairement |
| `brands.logo_url`, `brands.cover_image_url` existent | OUI | conservés temporairement |
| **Réversibilité** | OUI | `DROP COLUMN IF EXISTS ...` sur `categories` et `brands` |
| **Risque de verrouillage** | NUL | `brands` est vide ; `categories` a 5 lignes ; ajouts rapides |

### Point d'attention

- `categories.parent_id` existe déjà : la hiérarchie est donc déjà supportée.
- L'index sur `parent_id` améliore les requêtes récursives.

### Rollback

Voir `db/migrations/rollback/0035_category_covers_and_hierarchy_rollback.sql`.

---

## 5. Compatibilité avec `types/database.ts`

| Colonne / Table | Ajouté dans migration | TypeScript à mettre à jour |
|-------------------|-----------------------|-----------------------------|
| `products.main_image_id` | OUI | `types/database.ts` si typage explicite |
| `products.cost_price_agorot` | OUI | OUI |
| `products.sku` | OUI | OUI |
| `products.search_keywords` | OUI | OUI |
| `products.created_by` | OUI | OUI |
| `products.updated_by` | OUI | OUI |
| `product_media.media_id` | OUI | OUI |
| `product_media.role` | OUI | OUI |
| `invoice_items` | OUI | OUI |
| `categories.cover_image_id` | OUI | OUI |
| `brands.logo_image_id` | OUI | OUI |
| `brands.cover_image_id` | OUI | OUI |

`types/database.ts` est généré automatiquement à partir du schéma. Après application des migrations, il faudra le régénérer avec `supabase gen types typescript`.

---

## 6. Validation après application (à exécuter post-migration)

```sql
-- 0032
SELECT column_name FROM information_schema.columns WHERE table_name = 'products' AND column_name IN ('main_image_id','cost_price_agorot','sku','search_keywords','created_by','updated_by');
SELECT indexname FROM pg_indexes WHERE tablename = 'products' AND indexname = 'idx_products_slug_unique';

-- 0033
SELECT column_name FROM information_schema.columns WHERE table_name = 'product_media' AND column_name IN ('media_id','role');
SELECT typname FROM pg_type WHERE typname = 'product_media_role';

-- 0034
SELECT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'invoice_items');
SELECT * FROM pg_policies WHERE tablename = 'invoice_items';

-- 0035
SELECT column_name FROM information_schema.columns WHERE table_name = 'categories' AND column_name = 'cover_image_id';
SELECT column_name FROM information_schema.columns WHERE table_name = 'brands' AND column_name IN ('logo_image_id','cover_image_id');
```

---

## 7. Verdict d'application

Migrations **toutes additives** et **réversibles**. Avant application, il faut :

1. Corriger la policy RLS de `0034_invoice_items.sql` (utiliser `EXISTS` au lieu de `SELECT role ... IS NOT NULL`).
2. Vérifier l'unicité des `products.slug` avant de créer l'index unique.
3. S'assurer qu'un `SUPABASE_ACCESS_TOKEN` est disponible pour un vrai dry-run CLI, ou exécuter dans une base de test.

**Recommandation :** ne pas appliquer en production sans validation humaine de ces deux points.
