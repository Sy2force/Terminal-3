# Correspondance nouvel admin — Phase 2A

## Objectif

Rassembler les fonctionnalités dispersées dans 7 sections principales avec des onglets. Aucune ancienne page n'est supprimée pour l'instant.

## Menu principal proposé

### 1. Dashboard — `/admin`
- Ancien : `/admin`
- Fonctionnalités conservées : statistiques, KPIs, vue d'ensemble.

### 2. Produits — `/admin/products`
- Tableau des produits : `/admin/products`, `/admin/products/new`, `/admin/products/[id]`, `/admin/products/import`
- Catégories : `/admin/categories`, `/admin/categories/new`, `/admin/categories/[id]`
- Marques : `/admin/brands`
- Stock / alertes : `/admin/inventory`
- Import : `/admin/products/import`
- Photos à associer : fonction extraite de `/admin/medias` et du futur `EditableImage`

### 3. Clients et leads — `/admin/customers`
- Clients inscrits : `/admin/clients`, `/admin/clients/[id]`
- Leads : `/admin/leads`
- Vérifications 18+ : `/admin/age-verifications`
- Vérifications identité : `/admin/verifications`
- Notes : `customer_notes` (actuellement via `clients/[id]`)
- Historique commandes : `/admin/orders` filtré par client
- Factures du client : `/admin/invoices` filtré par client

### 4. Commandes — `/admin/orders`
- Liste : `/admin/orders`
- Kanban : `/admin/orders/kanban`
- Détail : `/admin/orders/[id]`
- Paiements : `/admin/payments`
- Livraisons : `/admin/livraisons`

### 5. Factures — `/admin/invoices`
- Factures et reçus : `/admin/invoices`
- Brouillons : `/admin/invoices` avec filtre `kind = 'order_summary'`
- Détail/finalisation : `/admin/orders/[id]` (facturation liée)
- Numérotation : `site_settings` future clé `invoice_numbering`

### 6. Contenu et médias — `/admin/content`
- Pages et textes : `/admin/contenus`, `/admin/contenus/[slug]`
- Accueil : `/admin/homepage`
- Couvertures : `/admin/couvertures`
- Promotions : `/admin/promotions`, `/admin/promotions/new`, `/admin/promotions/[id]`
- Médiathèque : `/admin/medias`
- Navigation : `/admin/navigation`
- Photos à classer : futur onglet basé sur `audits/unused-images-review.csv`
- Blog/Inspirations : `/admin/content`, `/admin/content/[id]`

### 7. Paramètres — `/admin/settings`
- Magasin : `/admin/store`
- Facturation : TVA, préfixe numérotation (futur)
- Livraison : `/admin/livraisons` config et `/admin/store`
- Utilisateurs : `/admin/users`
- Rôles : `/admin/roles`
- Apparence : `/admin/appearance`
- Navigation : `/admin/navigation`
- Audit : `/admin/historique`

## Pages en attente de décision

- `/admin/wolt` : retirée du menu, maintenue en archivé.
- `/admin/reviews` : retirée du menu, maintenue en archivé.
- `/admin/audit` : redirigée vers `/admin/historique` (onglet Audit dans Paramètres).

## Redirections 301 à prévoir

| Ancienne | Nouvelle |
|----------|----------|
| `/admin/audit` | `/admin/settings?tab=audit` |
| `/admin/users` | `/admin/settings?tab=users` |
| `/admin/inventory` | `/admin/products?tab=stock` |
| `/admin/verifications` | `/admin/customers?tab=verifications` |
| `/admin/age-verifications` | `/admin/customers?tab=verifications` |
| `/admin/appearance` | `/admin/settings?tab=appearance` |
| `/admin/navigation` | `/admin/content?tab=navigation` |
| `/admin/medias` | `/admin/content?tab=medias` |
| `/admin/couvertures` | `/admin/content?tab=covers` |
| `/admin/homepage` | `/admin/content?tab=homepage` |
| `/admin/contenus` | `/admin/content?tab=pages` |
| `/admin/content` | `/admin/content?tab=blog` |

## Fonctionnalités non perdues

- CRUD produits, catégories, marques
- Gestion promotions, réductions, fidélité
- Commandes, kanban, queue, statuts, paiements, livraisons
- Clients, leads, vérifications, notes
- Factures, reçus, PDF
- CMS pages, blog, homepage, couvertures, médiathèque
- Paramètres magasin, apparence, navigation
- Historique d'audit

Les pages `wolt` et `reviews` sont conservées mais ne sont pas intégrées au nouveau menu en attendant ta décision.
