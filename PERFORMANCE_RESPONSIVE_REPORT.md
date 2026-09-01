# Rapport performance et responsive — Terminal 3

> Date : 1er septembre 2026  
> Branche : `audit-reorg-2026`  
> Dernière Preview : `https://terminal3-4hzatiirv-projet-607a8e5b.vercel.app` — statut Vercel `Ready`  
> Production : `https://terminal3-msqjygdjr-projet-607a8e5b.vercel.app` / `https://terminal3-beta.vercel.app` — déployé  
> Connexion admin : mot de passe unique (`ADMIN_PASSWORD`) via cookie HMAC signé (`ADMIN_SESSION_SECRET`).

## 1. Causes identifiées et preuves

### 1.1 `/admin/login` affichait les promotions
- La page `admin/login/page.tsx` était un Client Component utilisant `useSearchParams` sans `Suspense`. Lors d'une navigation client, ce manque pouvait empêcher le remplacement du contenu précédent (`/promotions`) et laisser l'ancien rendu à la même URL.
- Corrige par la scission en `page.tsx` (serveur) + `login-form.tsx` (client).

### 1.2 Images non optimisées
- `next.config.ts` avait `images.unoptimized: true` : les navigateurs recevaient les fichiers originaux, dont le PNG de la bouteille hero à 517 Ko.
- Test local sur `/_next/image` : requête `?url=%2Fimages%2Fterminal-3%2Fwines%2Fcastel%2Fpetit-castel-2020.png&w=384&q=75` retourne 14 Ko (réduction ~97 %).

### 1.3 Header débordant et landing trop longue
- Navigation desktop surchargée, `pl-20` et boutons redondants.
- Landing rendait des sections dupliquées (`PromoMarquee`, `NewArrivalsCarousel`, `BestSellersSection`, `TestimonialsSection` avec avis figés, etc.) et de grands blocs `h-screen`.

### 1.4 Footer avec coordonnées placeholders
- Affichage inconditionnel de `STORE_PHONE` / `STORE_WHATSAPP` pouvait montrer `+972 50-000-0000`.

## 2. Correctifs apportés

| Problème | Fichiers modifiés | Décision |
|---|---|---|
| Routage / auth | `app/admin/login/page.tsx`, `app/admin/login/login-form.tsx`, `app/api/admin/login/route.ts`, `lib/admin/admin-cookie.ts`, `lib/admin/auth.ts`, `lib/supabase/middleware.ts` | Page serveur avec formulaire POST, connexion par mot de passe unique, `/demande-produit` protégé. |
| Header | `components/layout/navbar.tsx`, `components/auth/auth-nav.tsx` | Navigation regroupée, breakpoints ajustés, accès admin discret. |
| Landing | `components/home/homepage-renderer.tsx`, `components/home/luxury-hero-section.tsx` | Cinq blocs clés, hauteurs réduites, hero compact. |
| Promotions | `app/promotions/page.tsx`, `components/commerce/promotion-card.tsx` | Suppression du libellé `CONVERSION`, message d'état adapté. |
| Footer | `components/layout/footer.tsx` | Masquage des placeholders. |
| Photos admin | `app/admin/photos/page.tsx`, `app/admin/photos/photo-manager.tsx`, `app/admin/photos/actions.ts`, `components/admin/image-uploader.tsx`, `components/admin/promotion-form.tsx` | Hub produits, catégories, hero, logo, promotions. |
| Image promotion | `types/database.ts`, `lib/data/promotions-admin.ts`, `app/admin/promotions/actions.ts`, `db/migrations/0034_promotion_images.sql`, `supabase/migrations/20260101000000_promotion_images.sql` | Champs `image_url` et `og_image_url` prêts. |
| Optimisation images | `next.config.ts`, `components/home/luxury-hero-section.tsx`, `components/home/notre-univers-section.tsx`, `components/home/platters-section.tsx`, `components/home/hero-bottle-carousel.tsx`, `components/home/club-section.tsx`, `components/brand/logo.tsx` | `unoptimized: false`, retrait des prop `unoptimized` sur les images publiques. |

## 3. Résultats des commandes

```
npx tsc --noEmit              # OK
npm run lint                  # OK
npx next build                # OK, 112 routes
vercel build                  # OK, fonctions ~23 Mo
vercel deploy --prebuilt      # OK, Ready
vercel --prod                 # OK, production déployée
npx next build                # OK après formulaire admin sans JS
npx playwright test           # 32 passed, 4 skipped (auth flow non configuré)
npm run test:unit             # 51 passed
```

## 4. Optimisations supplémentaires effectuées

- Mise à jour des dépendances : `next@16.3.4`, `eslint-config-next@16.3.4`, `@supabase/ssr@0.12.5`, `@supabase/supabase-js@2.112.4`, `framer-motion@13.1.1`, `lucide-react@1.39.0`, `vitest@4.1.11`, `zod@4.5.4`.
- Ajout `experimental.optimizePackageImports: ["lucide-react", "framer-motion"]`.
- Restriction des `deviceSizes`/`imageSizes` pour `next/image`.
- Suppression du header `X-Powered-By`.

## 5. Mesures (laboratoire local)

| Page | Environnement | Viewport | Poids transféré observé | Note |
|---|---|---|---|---|
| `/_next/image` hero | `next start` local | n/a | 14 Ko (vs 517 Ko source) | réduction ~97 % via `next/image` |
| `.vercel/output/functions` | build Vercel | n/a | ~2.16 Mo | `optimizePackageImports` + mise à jour dépendances |
| `.vercel/output/static` | build Vercel | n/a | ~545 Mo | images statiques, hors bundles fonctions |

> Les mesures LCP / CLS / INP réelles nécessitent un accès non protégé par SSO Vercel ou une exécution local avec la base de test. La Preview actuelle est protégée par Vercel SSO.

## 6. Routes vérifiées

- `/` — build OK
- `/admin/login` — build OK
- `/admin/photos` — build OK
- `/promotions` — build OK
- `/vins`, `/spiritueux`, `/categories/[slug]`, `/products/[slug]` — build OK
- `/admin`, `/admin/promotions`, `/admin/promotions/[id]`, `/admin/products` — build OK
- Playwright (partiel) : homepage, redirections auth, routes catalogue.

## 6. Contrôles bloqués ou non exécutés

- **Test de connexion admin avec un compte réel** : impossible sans l'email du compte et le rôle `admin_roles` associé.
- **Test d'upload de photos sur Supabase Storage** : impossible sans exécution réelle sur un bucket existant.
- **Lighthouse mobile / desktop** : impossible en ligne à cause de la protection SSO Vercel ; nécessite une URL publique de test ou un run local avec `.env`.
- **Migration `promotion_images`** : fichiers SQL créés mais non appliqués sur Supabase (attend l'accord / l'exécution par le propriétaire).

## 7. Reste à faire

1. Appliquer la migration `0034_promotion_images.sql` sur la base Supabase autorisée.
2. Confirmer l'email du compte admin et vérifier/insérer le rôle dans `admin_roles` si on revient à l'authentification Supabase.
3. Exécuter Lighthouse sur la production une fois accessible.
4. Remplacer le mot de passe `ADMIN_PASSWORD` par un secret fort.
