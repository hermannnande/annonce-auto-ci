# SAUVEGARDE SESSION - 14 Février 2026

## Résumé de la session

Cette session a porté sur la vérification et correction de plusieurs systèmes critiques de la plateforme AnnonceAuto.ci.

---

## 1. Page Admin Paiements - Données réelles (fait avant cette session)

- **Fichier** : `src/app/pages/dashboard/AdminPayments.tsx`
- **Problème** : La page affichait des données fictives (mock data)
- **Correction** : Connexion à Supabase, stats réelles, graphique, filtres, pagination, export CSV
- **Commit** : `5c5300c6`

## 2. Nettoyage transactions pending

- **Fichier** : `supabase/migrations/013_cleanup_pending_transactions.sql`
- **Action** : 14 transactions pending > 24h marquées comme "failed"
- **Fonction SQL** : `cleanup_stale_pending_transactions(hours_threshold)` créée pour usage futur
- **Bouton admin** : "Nettoyer pending" ajouté dans AdminPayments
- **Commit** : `06dc5726`

## 3. Correction Analytics - Sampling x4

- **Fichier** : `src/app/pages/dashboard/AdminAnalytics.tsx`
- **Problèmes corrigés** :
  - Stats anonymes sous-comptées (sampling 25%) → multiplié par 4
  - Requêtes inutiles supprimées (`conversionStats`, `topListings`)
  - Boutons Export rendus fonctionnels (Export Résumé CSV + Export Détaillé CSV)
- **Commit** : `99a1b8d3`

## 4. Auto-modération CRON - Diagnostic et correction

- **Fichier** : `.github/workflows/auto-moderation-cron.yml`
- **Problème** : 1173 exécutions échouées, 0 réussies depuis le 14 janvier 2026
- **Cause racine** : Edge Function `auto-moderation` jamais déployée sur Supabase (404)
- **Correction** : Remplacé l'appel Edge Function par un appel RPC direct à `auto_approve_pending_listings` via l'API REST Supabase
- **Commits** : `137813bc`, `05b989fa`
- **Action requise** : Ajouter 2 secrets GitHub :
  - `SUPABASE_URL` = `https://vnhwllsawfaueivykhly.supabase.co`
  - `SUPABASE_SERVICE_ROLE_KEY` = clé service_role (Dashboard Supabase > Settings > API)
  - Lien : https://github.com/hermannnande/annonce-auto-ci/settings/secrets/actions

### Fonctionnement auto-modération
- CRON GitHub Actions toutes les 5 minutes
- Appelle `auto_approve_pending_listings()` via REST API
- Listings pending > 5 min : validés → `active`, invalides → `rejected`
- Règles de validation : titre ≥5 car, marque connue, prix 100K-500M FCFA, année 1990+, ≥1 image

## 5. Fix affichage transactions AdminPayments

- **Fichier** : `src/app/pages/dashboard/AdminPayments.tsx`
- **Problème** : Les stats affichaient 16 transactions mais la liste était vide
- **Cause** : `profiles!inner(...)` = INNER JOIN excluait les transactions sans profil
- **Correction** : Remplacé par `profiles(...)` = LEFT JOIN
- **Commit** : `0c3f55a4`

## 6. Suppression bonus inscription

- **Action** : Modifié la fonction `handle_new_user` dans Supabase (trigger sur auth.users)
- **Changement** : `credits: 100` → `credits: 0`
- **Lieu** : Directement dans Supabase SQL Editor (pas dans le code)
- **Résultat** : Nouveaux inscrits commencent avec 0 crédits
- **Publication d'annonces** : reste gratuite

---

## Analyse Salif Koné (konesalif208@gmail.com)

### Profil
- **User ID** : `36267173-a8a9-49e9-b9c0-32922b129746`
- **Solde actuel** : 10 crédits
- **Annonces** : 5 (toutes actives, aucune boostée actuellement)

### Historique complet des transactions
| # | Date | Action | Crédits | Solde |
|---|------|--------|---------|-------|
| 1 | 3 Jan 23h13 | Boost 14j - Mercedes-Benz E350 4matic 2016 | -50 | 50 |
| 2 | 5 Jan 22h53 | Tentative recharge 100 crédits (FAILED) | -- | -- |
| 3 | 6 Jan 00h44 | Boost 7j - Hyundai Elantra 2020 | -30 | 20 |
| 4 | 6 Jan 21h40 | Recharge 50 crédits (5,000 FCFA) ✅ | +50 | 70 |
| 5 | 7 Jan 14h03 | Boost 7j - Nissan 2019 | -30 | 40 |
| 6 | 11 Jan 00h45 | Boost 7j - Hyundai Santafe 2018 | -30 | 10 |

### Conclusion
- Salif a bien bénéficié de ses crédits
- Son solde de 10 est cohérent (100 bonus + 50 achat - 140 boosts = 10)
- Sa transaction failed (10,000 FCFA) n'a pas été débitée
- Client très actif : 4 boosts en 8 jours

---

## Tarifs actuels

### Crédits (1 crédit = 100 FCFA)
| Montant | Crédits |
|---------|---------|
| 5,000 FCFA | 50 |
| 10,000 FCFA | 100 |
| 25,000 FCFA | 250 |
| 50,000 FCFA | 500 |
| Libre (min 1,000 FCFA) | montant/100 |

### Boosts
| Plan | Durée | Coût | Effet |
|------|-------|------|-------|
| BOOST ⚡ | 7 jours | 30 crédits (3,000 F) | 10× plus de vues |
| PREMIUM ⭐ | 14 jours | 50 crédits (5,000 F) | 20× plus de vues |
| VIP 👑 | 21 jours | 60 crédits (6,000 F) | 30× plus de vues |

---

## État de la base de données

- **32 annonces** : toutes en statut `active`
- **16 transactions** : 2 completed, 14 failed (nettoyées)
- **Revenus totaux** : 6,000 FCFA (2 transactions réussies)
- **Taux de succès** : 13% (webhook Payfonte à améliorer)

---

## Fichiers modifiés cette session

| Fichier | Modification |
|---------|-------------|
| `src/app/pages/dashboard/AdminAnalytics.tsx` | Sampling x4, suppression requêtes inutiles, exports CSV |
| `.github/workflows/auto-moderation-cron.yml` | Appel RPC direct au lieu d'Edge Function |
| `src/app/pages/dashboard/AdminPayments.tsx` | INNER JOIN → LEFT JOIN |

## Modifications Supabase (SQL Editor)

| Élément | Modification |
|---------|-------------|
| Fonction `handle_new_user` | `credits: 100` → `credits: 0` |
| Migration `013_cleanup_pending_transactions.sql` | Exécutée - cleanup des pending |

---

## Actions en attente

1. **CRITIQUE** : Configurer les secrets GitHub pour l'auto-modération
   - `SUPABASE_URL` et `SUPABASE_SERVICE_ROLE_KEY`
   - Sans ça, l'auto-modération reste cassée

2. **Recommandé** : Améliorer le webhook Payfonte (87% d'échec)
   - Vérifier que l'Edge Function `payfonte-webhook` est bien déployée
   - Tester avec un paiement réel

3. **Optionnel** : Vérifier sur dashboard Payfonte si la transaction de Salif (10,000 FCFA, ref `CREDITS-1767653602002-7989`) a été débitée

---

## Pour reprendre la session

```
Lis le fichier SAUVEGARDE_SESSION_14FEV2026.md pour le contexte complet.
Le projet est AnnonceAuto.ci - plateforme de vente de véhicules en Côte d'Ivoire.
Stack : React + Vite + Supabase + Payfonte (paiement Mobile Money).
```
