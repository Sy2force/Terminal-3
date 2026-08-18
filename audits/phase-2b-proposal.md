# Phase 2B — Proposition technique : Administration visuelle et classement automatique

## Objectif

Transformer l’administration de Terminal 3 en un outil simple, rapide et visuel :
- Classement automatique des produits à partir du nom.
- Modification directe des noms, prix, photos depuis le tableau et le site public.
- Mode "Administrer le site" pour éditer textes et images en surfant sur le vrai site.
- Workflow commandes/factures simplifié.

Aucune implémentation n’est commencée. Ce document est une proposition à valider.

---

## 1. Schéma de données proposé

### 1.1 Nouvelle table : `classification_rules`

Table dictionnaire administrable pour le classement automatique.

| Colonne | Type | Description |
|---------|------|-------------|
| `id` | uuid PK | Identifiant |
| `keyword` | text | Mot-clé détecté (ex: `Glenfiddich`, `Blanco`, `Saumon`) |
| `normalized_keyword` | text | Forme normalisée (minuscule, sans accents) |
| `brand_id` | uuid FK → brands | Marque associée (si mot = marque) |
| `category_id` | uuid FK → categories | Catégorie suggérée |
| `subcategory_id` | uuid FK → categories | Sous-catégorie suggérée (optionnel) |
| `product_type` | text | `WHISKY`, `TEQUILA`, `WINE_RED`, etc. (optionnel) |
| `priority` | int | Ordre de priorité (marque = 100, cépage = 50, générique = 10) |
| `confidence` | text | `high` / `medium` / `low` |
| `is_active` | boolean | Actif ou non |
| `created_at` | timestamptz | - |
| `updated_at` | timestamptz | - |

**RLS :** lecture admin, édition OWNER / MANAGER / CONTENT_EDITOR.

### 1.2 Nouvelle table : `classification_history`

Trace chaque proposition de classement et la décision de l’admin.

| Colonne | Type | Description |
|---------|------|-------------|
| `id` | uuid PK | - |
| `product_id` | uuid FK → products | - |
| `old_name` | text | Nom avant modification |
| `new_name` | text | Nom après modification |
| `proposed_category_id` | uuid FK → categories | Proposition |
| `applied_category_id` | uuid FK → categories | Catégorie effectivement enregistrée |
| `proposed_subcategory` | text | Sous-catégorie proposée |
| `applied_subcategory` | text | Sous-catégorie finale |
| `confidence` | text | `high` / `medium` / `low` |
| `admin_decision` | text | `accepted`, `rejected`, `corrected`, `locked` |
| `author_id` | uuid FK → profiles | - |
| `created_at` | timestamptz | - |

### 1.3 Colonnes à ajouter à `products`

| Colonne | Type | Déjà prévu | Migration |
|---------|------|------------|-----------|
| `main_image_id` | uuid FK → media | oui | `0032_product_enhancements.sql` |
| `cost_price_agorot` | bigint | oui | `0032_product_enhancements.sql` |
| `sku` | text UNIQUE | oui | `0032_product_enhancements.sql` |
| `search_keywords` | text[] | oui | `0032_product_enhancements.sql` |
| `classification_locked` | boolean DEFAULT false | non | `0040_classification_lock.sql` |
| `classification_confidence` | text | non | `0040_classification_lock.sql` |
| `brand_id` | uuid FK → brands | existant mais null | remplir via migration |

### 1.4 Nouvelle table : `admin_edit_drafts`

Stocke les modifications textes/images faites en mode "Administrer le site" avant publication. Permet l’historique et la restauration.

| Colonne | Type | Description |
|---------|------|-------------|
| `id` | uuid PK | - |
| `entity_type` | text | `product`, `category`, `page`, `section`, `setting` |
| `entity_id` | uuid | ID de l’entité (ou slug pour pages) |
| `field_path` | text | Chemin du champ (`name_fr`, `homepage.hero.title`) |
| `lang` | text | `fr`, `he` |
| `old_value` | jsonb | Valeur précédente |
| `new_value` | jsonb | Nouvelle valeur |
| `media_id` | uuid FK → media | Si modification d’image |
| `status` | text | `draft`, `published`, `reverted` |
| `author_id` | uuid FK → profiles | - |
| `created_at` | timestamptz | - |
| `published_at` | timestamptz | - |

Alternative : réutiliser la table existante `content_revisions` si on l’étend à tous les types d’entités.

### 1.5 Table `invoices` / `invoice_items`

Déjà prévue dans `0034_invoice_items.sql`. Compléter avec :

| Colonne | Table | Description |
|---------|-------|-------------|
| `invoice_number` | invoices | Numéro unique (généré côté serveur) |
| `is_finalized` | invoices | true/false |
| `pdf_url` | invoices | URL du PDF dans Supabase Storage |

---

## 2. Composants proposés

### 2.1 `classifyProduct(name: string): Promise<ClassificationResult>`

**Localisation :** `lib/classification/server.ts` (server action) ou `lib/classification.ts` (utils).

**Entrée :** nom du produit brut.

**Algorithme :**
1. Normaliser le nom (minuscules, sans accents, sans signes de ponctuation superflus).
2. Tokeniser par espaces et apostrophes.
3. Rechercher les mots dans `classification_rules`.
4. Regrouper les règles actives et calculer un score par catégorie/sous-catégorie.
5. Priorité : marque > cépage/type > mots génériques.
6. Extraire via regex :
   - Volume : `\b(\d{2,4})\s?(ml|cl|l)\b`
   - Poids : `\b(\d{2,4})\s?(g|gr|kg)\b`
   - Millésime : `\b(19|20)\d{2}\b`
   - Âge : `\b(\d{1,2})\s?(ans?|years?|yo|y\.o\.)\b`
7. Générer le slug normalisé.
8. Proposer un SKU si le produit n’en a pas.
9. Retourner un objet `ClassificationResult` avec un niveau de confiance.

**Sortie :**

```ts
interface ClassificationResult {
  confidence: "high" | "medium" | "low";
  matchedRules: ClassificationRule[];
  family: string;            // "Alcools" | "Épicerie fine" | "Autres"
  categoryId: string | null; // UUID catégorie
  subcategoryId: string | null; // UUID sous-catégorie
  brand: string | null;
  brandId: string | null;
  productType: string | null;
  volume?: string;
  weight?: string;
  vintage?: string;
  age?: string;
  keywords: string[];
  slug: string;
  suggestedSku: string;
}
```

**Exemples :**

| Nom | Famille | Catégorie | Sous-catégorie | Marque | Confiance |
|-----|---------|-----------|----------------|--------|-----------|
| `Glenfiddich 12 ans 700 ml` | Alcools | Whiskies | Single malt | Glenfiddich | high |
| `Chivas Regal 12 ans` | Alcools | Whiskies | Blended whisky | Chivas Regal | high |
| `Don Julio Reposado` | Alcools | Tequilas | Reposado | Don Julio | high |
| `Yarden Cabernet Sauvignon 2022` | Alcools | Vins | Vin rouge | Yarden | high |
| `Grey Goose 700 ml` | Alcools | Vodkas | Vodka | Grey Goose | high |
| `Saumon fumé 100 g` | Épicerie fine | Poissons | Saumon fumé | - | medium |
| `Réserve spéciale 2022` | Alcools | Vins | ? | - | low |

### 2.2 `ProductClassificationPreview`

**Localisation :** `components/admin/product-classification-preview.tsx`

**Props :**

```ts
interface ProductClassificationPreviewProps {
  result: ClassificationResult | null;
  currentCategoryId: string | null;
  onConfirm: () => void;
  onReject: () => void;
  onEdit: () => void;
}
```

**Comportement :**
- Affiche les propositions (marque, catégorie, sous-catégorie, volume, millésime, etc.).
- Indique le niveau de confiance avec une couleur (vert/orange/rouge).
- Si `confidence = high` : bouton "Confirmer et publier".
- Si `confidence = medium` : bouton "Confirmer" + champ manuel pour corriger.
- Si `confidence = low` : message "Catégorie non reconnue. Veuillez choisir une catégorie." + sélecteur manuel.
- Affiche un aperçu du nouveau slug et SKU proposés.

### 2.3 `ProductQuickEditor`

**Localisation :** `components/admin/product-quick-editor.tsx` pour le tableau, `components/admin/product-simple-form.tsx` pour la fiche complète.

**Champs principaux affichés :**
- Photo principale (cliquable)
- Nom
- Marque
- Catégorie proposée
- Sous-catégorie proposée
- Prix
- Prix promotionnel
- Stock
- Statut
- Description courte

**Champs repliables "Avancé" :**
- SKU, code-barres, volume, poids, millésime, âge, % alcool, pays, région, cacherout, coût interne, galerie, SEO.

**Actions :**
- Enregistrer le brouillon
- Prévisualiser
- Publier
- Enregistrer et continuer
- Archiver
- Dupliquer

**Déclenchement du classement automatique :**
- `onBlur` du champ nom (avec délai de 400ms).
- Appel `classifyProduct`.
- Affichage de `ProductClassificationPreview`.
- Si `classification_locked` est true, on ne change pas la catégorie.

### 2.4 `/admin/products` (tableau simple)

**Localisation :** `app/admin/products/page.tsx` (remplacement graduel).

**Colonnes :**
- Photo
- Nom (editable inline)
- Marque
- Catégorie
- Sous-catégorie
- Prix
- Stock
- Statut
- Dernière modification

**Filtres rapides :**
Tous, Vins, Whiskies, Tequilas, Vodkas, Rhums, Poissons, Thons, Saumons, Anchois, Charcuteries, Fromages, Plateaux, Sans photo, Sans prix, Catégorie incertaine, Brouillons, Publiés, Archivés.

**Inline actions :**
- Cliquer sur le nom : active `ProductQuickEditor` en slide-over ou inline.
- Modifier le prix/stock : inline.
- Modifier la photo : `EditableImage`.

### 2.5 `EditableImage`

**Localisation :** `components/admin/editable-image.tsx`

**Props :**

```ts
interface EditableImageProps {
  src: string;
  alt?: string;
  entityType: "product" | "category" | "page" | "section" | "brand";
  entityId: string;
  fieldPath: string;
  size?: { width: number; height: number };
}
```

**Fonctionnement :**
1. En mode admin, un contour + icône crayon apparaît au survol.
2. Au clic, ouverture d’un `MediaPickerModal`.
3. Dans le modal :
   - Glisser-déposer un fichier.
   - Bouton "Ouvrir Finder / Galerie" (selon device).
   - Onglet "Médiathèque".
   - Aperçu et recadrage.
   - Champ `alt`.
4. Upload vers Supabase Storage.
5. Création d’un enregistrement `media`.
6. Mise à jour de `main_image_id` ou du champ image concerné.
7. Création d’une entrée `admin_edit_drafts` si mode "publier plus tard".
8. Revalidation de la page.

**Sécurité :**
- Vérification MIME/type, taille max 5Mo.
- Conversion WebP/AVIF si possible.
- Création de miniature.
- Suppression de l’ancienne image retardée (garde-fou 30 jours).

### 2.6 `EditableText`

**Localisation :** `components/admin/editable-text.tsx`

**Props :**

```ts
interface EditableTextProps {
  contentKey: string;
  page: string;
  section: string;
  lang: "fr" | "he";
  value: string;
  type: "title" | "subtitle" | "paragraph" | "button" | "link";
  permissions: AdminPermission[];
}
```

**Fonctionnement :**
1. En mode admin, un icône crayon apparaît au survol du texte.
2. Au clic, le texte devient modifiable (input ou textarea).
3. Affichage d’une barre "Enregistrer / Annuler / Prévisualiser".
4. Support RTL pour l’hébreu.
5. Enregistrement via server action dans `admin_edit_drafts` ou `section_translations`.
6. Possibilité de restaurer une ancienne version.

### 2.7 `AdminEditMode`

**Localisation :** `components/admin/admin-edit-mode.tsx` + `lib/admin/edit-mode.tsx` (context).

**Comportement :**
- Bouton `Administrer le site` dans la barre admin (navbar).
- Activation d’un global state `isAdminEditMode`.
- Wrapper autour du site pour conditionnellement afficher les overlays `EditableText` / `EditableImage`.
- Barre flottante en bas :
  - Quitter le mode
  - Sauvegarder / Publier
  - Prévisualiser
  - Nombre de changements en attente
- Seuls les rôles `OWNER`, `MANAGER`, `CONTENT_EDITOR` voient le bouton.

**Optimisation :** les composants `EditableText`/`EditableImage` ne sont jamais rendus pour les visiteurs normaux.

### 2.8 `OrderWorkflow`

**Localisation :** `components/admin/order-workflow.tsx` + `app/admin/orders/page.tsx`.

**Statuts simplifiés :**

```text
submitted → confirmed → preparing → ready → out_for_delivery → delivered
                 ↘ cancelled  ↘ refund
```

**Tableau des commandes :**
- Numéro
- Date/heure
- Client
- Téléphone
- Produits (aperçu)
- Total
- Livraison / retrait
- Paiement
- Statut
- Actions rapides

**Actions par commande :**
- Accepter
- Refuser
- Appeler le client
- Voir le détail
- Préparer
- Prête
- Livrée
- Annuler

**Server actions :**
- `acceptOrder(id)`
- `prepareOrder(id)`
- `readyOrder(id)`
- `deliverOrder(id)`
- `cancelOrder(id, reason)`

Chaque action insère dans `order_status_history` et `audit_logs`.

### 2.9 `InvoiceBuilder`

**Localisation :** `components/admin/invoice-builder.tsx`.

**Déclenchement :** depuis une commande acceptée, bouton `Créer la facture`.

**Fonctionnement :**
1. Création d’un brouillon `invoice` avec `kind = 'invoice'`.
2. Génération automatique des `invoice_items` depuis `order_items`.
3. Édition possible :
   - Ajouter/retirer un produit
   - Modifier quantité
   - Ajuster remise
   - Ajouter livraison
   - Appliquer TVA
4. Numérotation : `getNextInvoiceNumber()` côté serveur avec `pg_advisory_xact_lock`.
5. Finalisation : `is_finalized = true`.
6. Génération PDF.
7. Stockage dans Supabase Storage.
8. Mise à jour de `invoices.pdf_url`.
9. Une facture finalisée ne peut pas être écrasée silencieusement (vérification `is_finalized`).

### 2.10 Composants annexes

| Composant | Rôle |
|-----------|------|
| `DashboardSimple` | Vue d’ensemble avec les 12 indicateurs demandés |
| `GlobalSearch` | Loupe dans navbar et admin, autocomplète sur nom/marque/catégorie/SKU |
| `NewProductButton` | `+ Ajouter un produit ici` dans chaque catégorie publique (mode admin) |
| `SectionBuilder` | `+ Ajouter une section` entre les sections de la homepage |
| `OrderNotificationBell` | Compteur de nouvelles commandes + son optionnel |

---

## 3. API / Server Actions proposées

### Classification

```ts
classifyProduct(name: string): Promise<ClassificationResult>
getClassificationRules(): Promise<ClassificationRule[]>
upsertClassificationRule(rule: ClassificationRuleInput): Promise<void>
deleteClassificationRule(id: string): Promise<void>
```

### Produits

```ts
quickUpdateProduct(id: string, input: QuickProductInput): Promise<void>
updateProductImage(productId: string, mediaId: string, role: "main" | "gallery"): Promise<void>
publishProduct(id: string): Promise<void>
archiveProduct(id: string): Promise<void>
duplicateProduct(id: string): Promise<ProductRow>
```

### Mode admin visuel

```ts
saveDraftText(input: EditableTextInput): Promise<void>
publishDrafts(): Promise<void>
revertDraft(id: string): Promise<void>
saveDraftImage(entityType, entityId, fieldPath, mediaId): Promise<void>
```

### Commandes

```ts
acceptOrder(id: string): Promise<void>
prepareOrder(id: string): Promise<void>
readyOrder(id: string): Promise<void>
deliverOrder(id: string): Promise<void>
cancelOrder(id: string, reason: string): Promise<void>
updateOrderItemQuantity(orderId, itemId, quantity): Promise<void>
```

### Factures

```ts
createInvoiceFromOrder(orderId: string): Promise<InvoiceRow>
updateInvoiceItem(id, input): Promise<void>
finalizeInvoice(id: string): Promise<void>
generateInvoicePdf(id: string): Promise<string>
```

### Recherche

```ts
searchProducts(query: string, limit?: number): Promise<ProductSearchResult[]>
```

---

## 4. Flux détaillés

### 4.1 Création / modification d’un produit

```
Admin saisit/modifie le nom
        ↓
Déclenchement classifyProduct(name)
        ↓
ProductClassificationPreview affiche les propositions
        ↓
Si confidence = high     →  préremplissage automatique (sauf classification_locked)
Si confidence = medium   →  proposition à confirmer
Si confidence = low      →  sélecteur manuel
        ↓
Admin confirme/corrige
        ↓
Enregistrement : product + variant + media + search_keywords
        ↓
Revalidation des routes concernées
        ↓
Publication immédiate si statut = published
```

### 4.2 Mode "Administrer le site"

```
Admin clique sur "Administrer le site" dans la navbar
        ↓
Context isAdminEditMode = true
        ↓
Les composants EditableText/EditableImage rendent leur overlay
        ↓
Admin survole/clique un élément modifiable
        ↓
Modal ou inline editor s’ouvre
        ↓
Sauvegarde → création d’un draft
        ↓
Admin clique "Publier" → batch publish des drafts
        ↓
Revalidation des pages concernées
```

### 4.3 Workflow commande

```
Client confirme sa commande
        ↓
Order status = submitted
        ↓
Notification interne (compteur + son optionnel)
        ↓
Admin clique "Accepter"
        ↓
Order status = confirmed
Stock réservé
Client notifié
Invoice draft possible
        ↓
Admin "En préparation" → preparing
        ↓
Admin "Prête" → ready
        ↓
Admin "Livrée" → delivered
Paiement final vérifié
Facture finalisée
        ↓
Audit log à chaque transition
```

---

## 5. Sécurité

| Point | Implémentation |
|-------|----------------|
| Authentification | `requireAdmin` / `requireAdminPermission` |
| RLS | tables `classification_rules`, `admin_edit_drafts`, `invoices`, `order_status_history` restreintes admin |
| Validation | Zod pour toutes les entrées |
| Audit | `audit_logs` + `content_revisions` pour toutes les modifications |
| Upload | vérification type, taille, signed URL, bucket privé |
| Paiement | jamais marqué payé sans confirmation réelle |
| Factures | `is_finalized` non modifiable silencieusement |

---

## 6. Migrations SQL à ajouter

Avant l’implémentation, prévoir :

- `0040_classification_rules.sql` : création de la table et du dictionnaire par défaut.
- `0040b_classification_history.sql` : historique des classements.
- `0040c_admin_edit_drafts.sql` : table des drafts.
- `0041_product_classification_lock.sql` : colonnes `classification_locked` et `classification_confidence`.
- `0042_invoice_numbering.sql` : numérotation sécurisée + `is_finalized` + `pdf_url`.
- `0043_dashboard_views.sql` : vues/vues matérialisées pour les stats (optionnel).

---

## 7. Ordre d’implémentation proposé

1. `classifyProduct` + `classification_rules` + `ProductClassificationPreview`
2. Dictionnaire de règles et seed par défaut
3. Formulaire produit simplifié (`ProductQuickEditor`)
4. Tableau `/admin/products` simplifié
5. Modification des photos (`EditableImage`)
6. Fiche produit publique cohérente (`/products/[slug]`)
7. Mode `AdminEditMode`
8. `EditableText`
9. `EditableImage` sur le site public
10. Ajout de produit depuis les catégories
11. `SectionBuilder` homepage
12. Workflow commandes (`OrderWorkflow`)
13. Détail de commande
14. `InvoiceBuilder` + factures
15. Notifications internes
16. Dashboard simple
17. Recherche globale
18. Historique / restauration
19. Responsive
20. Tests E2E

Chaque étape sera suivie de : lint, TypeScript, build, tests, rapport.

---

## 8. Fichiers impactés (prévision)

### Nouveaux
- `lib/classification.ts`
- `lib/classification/rules.ts`
- `lib/classification/parser.ts`
- `app/admin/products/new/page.tsx` (simplifié)
- `components/admin/product-quick-editor.tsx`
- `components/admin/product-classification-preview.tsx`
- `components/admin/products-simple-table.tsx`
- `components/admin/editable-text.tsx`
- `components/admin/editable-image.tsx`
- `components/admin/media-picker-modal.tsx`
- `components/admin/admin-edit-mode.tsx`
- `components/admin/admin-edit-bar.tsx`
- `components/admin/order-workflow.tsx`
- `components/admin/order-detail.tsx`
- `components/admin/invoice-builder.tsx`
- `components/admin/dashboard-simple.tsx`
- `components/admin/global-search.tsx`
- `components/admin/new-product-button.tsx`
- `components/admin/section-builder.tsx`
- `app/admin/orders/page.tsx` (refonte)
- `app/admin/invoices/page.tsx` (refonte)

### Modifiés
- `app/admin/products/page.tsx`
- `app/admin/products/actions.ts`
- `components/admin/product-form.tsx`
- `components/layout/navbar.tsx` (ajout mode admin)
- `app/layout.tsx` (provider mode admin)
- `lib/data/products.ts` (quick update, classification)
- `lib/data/orders.ts` (workflow)
- `lib/data/invoices.ts` (builder)
- `types/database.ts` (migrations d’abord)

---

## 9. Risques et mitigations

| Risque | Mitigation |
|--------|------------|
| Mauvais classement automatique | Niveaux de confiance + verrouillage manuel + historique |
| Perte d’ancien contenu | `admin_edit_drafts` + restauration possible |
| Factures modifiées après finalisation | `is_finalized` + RLS côté serveur |
| Upload d’images malveillantes | Vérification type/taille + Supabase Storage privé |
| Commande marquée payée à tort | Validation explicite du paiement avant statut final |
| Performance recherche | Index `search_keywords` + GIN |
| RTL / i18n | `dir="rtl"` conditionnel + champs par langue |

---

## 10. Questions de validation

1. Est-ce que le dictionnaire `classification_rules` est administrable depuis `/admin/settings` ou depuis `/admin/products` ?
2. Veux-tu que `classification_locked` soit un champ visible dans la fiche produit ?
3. Le mode "Administrer le site" doit-il être accessible par tous les admins ou seulement OWNER/MANAGER/CONTENT_EDITOR ?
4. Les `EditableText` doivent-ils enregistrer immédiatement ou passer par un draft à publier ?
5. Veux-tu que la recherche globale soit d’abord un simple `contains` sur `products.search_keywords` ou full-text PostgreSQL ?
6. L’historique de modifications doit-il être dans `content_revisions` ou une table dédiée ?
7. Les factures doivent-elles être générées en PDF côté serveur (API route + puppeteer/playwright) ou côté client (jsPDF) ?

---

Attente de validation avant implémentation.
