# 🎯 Prompt Cursor AI - Reprise Session AnnonceAuto.ci

> **Utilise ce prompt pour que Cursor AI comprenne instantanément le contexte lors de la prochaine session**

---

## 📋 Contexte Projet

Je travaille sur **AnnonceAuto.ci**, une plateforme de petites annonces automobiles en Côte d'Ivoire (marketplace). Stack technique :
- **Frontend** : React + TypeScript + Vite + TailwindCSS
- **Backend** : Supabase (PostgreSQL + Edge Functions + Auth)
- **Paiement** : Payfonte (mobile money CI)
- **Déploiement** : Vercel (frontend) + Supabase (backend)

---

## 🔥 Dernières Modifications (Décembre 2025)

Voici ce qui a été fait lors de la session précédente :

### 1. ✅ Admin - Gestion Crédits
- Correction schéma DB : `balance_after` (pas `credits_after`)
- Correction RLS policies pour permettre aux admins de modifier crédits
- Ajout pagination (15 vendeurs/page)
- Ajout filtres avancés (plage crédits, recherche)
- Ajout tri dynamique (nom, crédits, date)
- Section "Transactions récentes"

**Fichiers modifiés** :
- `src/app/pages/dashboard/AdminCredits.tsx`
- `src/app/services/credits.service.ts`
- `FIX_ADMIN_CREDITS_URGENT.sql`

### 2. ✅ Admin - Modération
- Pagination (20 annonces/page)
- Filtres : statut, prix, prix suspects
- Tri : date, prix, titre
- Statistiques temps réel (total, pending, approved, rejected)
- Badges colorés pour statuts

**Fichiers modifiés** :
- `src/app/pages/dashboard/AdminModeration.tsx`
- `src/app/services/admin.service.ts`

### 3. ✅ Système de Boost
- Correction erreur `TypeError: o is not a function` (destructuration)
- Amélioration logique dates (prolongation si déjà boosté)
- Affichage dates boost dans statistiques annonces

**Fichiers modifiés** :
- `src/app/components/modals/BoostModal.tsx`
- `src/app/pages/dashboard/VendorBooster.tsx`
- `src/app/services/listings.service.ts`
- `src/app/pages/dashboard/ListingStatsPage.tsx`

### 4. ✅ Système de Paiement Payfonte
**Problèmes résolus** :
- CORS bloqué → Ajout headers complets
- JWT invalide → `verify_jwt = false` + refresh auto frontend
- Montant incorrect → Multiplication par 100 (centimes)
- Boucle pending → Création transaction AVANT redirect + fallback robuste
- Déconnexions → Session management amélioré

**Fichiers modifiés** :
- `supabase/functions/payfonte-create-checkout/index.ts`
- `supabase/functions/payfonte-verify-payment/index.ts`
- `supabase/functions/payfonte-webhook/index.ts`
- `supabase/config.toml`
- `src/app/services/payfonte.service.ts`
- `src/app/pages/PayfonteCallback.tsx`

### 5. ✅ Historique Transactions
- Pagination (5 transactions/page)
- Filtres : type (recharge, boost, cadeau) + statut
- Compteur total
- Navigation < >

**Fichiers modifiés** :
- `src/app/pages/dashboard/VendorRechargePayfonte.tsx`

---

## 🗄️ Schémas DB Importants

### `profiles`
```sql
{
  id: uuid (PK)
  email: text
  phone: text
  credits: integer (solde actuel)
  role: 'vendor' | 'admin'
  created_at: timestamp
}
```

### `credits_transactions`
```sql
{
  id: uuid (PK)
  user_id: uuid (FK profiles)
  amount: integer (+ ou -)
  balance_after: integer ⚠️ (PAS credits_after !)
  type: 'purchase' | 'boost' | 'gift' | 'admin_adjustment' | 'refund'
  payment_status: 'pending' | 'completed' | 'failed'
  payment_reference: text
  admin_id: uuid (nullable)
  created_at: timestamp
}
```

### `listings`
```sql
{
  id: uuid (PK)
  user_id: uuid (FK profiles)
  title: text
  price: numeric
  status: 'pending' | 'approved' | 'rejected'
  is_boosted: boolean
  boost_until: timestamp (nullable)
  created_at: timestamp
}
```

---

## 🔑 Points Critiques à Retenir

### 1. Schéma `credits_transactions`
- ⚠️ Utiliser `balance_after` (PAS `credits_before`/`credits_after`)
- ⚠️ Types autorisés : `purchase`, `boost`, `gift`, `admin_adjustment`, `refund`
- ⚠️ Statuts : `pending`, `completed`, `failed`

### 2. Payfonte
- ⚠️ Toujours multiplier montant par 100 (XOF en centimes)
- ⚠️ Créer transaction DB AVANT redirect Payfonte
- ⚠️ Utiliser `SUPABASE_SERVICE_ROLE_KEY` pour bypass RLS
- ⚠️ Fallback : `payfonte-verify-payment` finalise si webhook échoue

### 3. RLS Policies
- Admins doivent avoir policies spécifiques pour UPDATE/INSERT
- En cas d'erreur RLS, utiliser `SERVICE_ROLE_KEY` (backend)
- Script reset complet : `FIX_LISTINGS_RLS_COMPLET_V2.sql`

### 4. JWT Management
- `verify_jwt = false` dans `supabase/config.toml` pour Edge Functions Payfonte
- Frontend : refresh automatique + retry logic
- `ensureValidUserSession()` avant chaque paiement

### 5. Destructuration
```typescript
// ✅ CORRECT
const { success, error } = await creditsService.spendCredits(...);

// ❌ INCORRECT (cause "o is not a function")
const { error } = await creditsService.spendCredits(...);
```

---

## 📁 Fichiers Clés du Projet

### Frontend (React)
```
src/app/
├── pages/
│   ├── dashboard/
│   │   ├── AdminCredits.tsx         ← Gestion crédits vendeurs
│   │   ├── AdminModeration.tsx      ← Modération annonces
│   │   ├── VendorRechargePayfonte.tsx ← Recharge crédits
│   │   ├── VendorBooster.tsx        ← Boost annonces
│   │   ├── ListingStatsPage.tsx     ← Stats annonces (avec dates boost)
│   └── PayfonteCallback.tsx         ← Callback après paiement
├── services/
│   ├── credits.service.ts           ← Logique crédits
│   ├── payfonte.service.ts          ← Intégration Payfonte
│   ├── listings.service.ts          ← Logique annonces/boost
│   ├── admin.service.ts             ← Actions admin
├── components/
│   ├── modals/
│   │   ├── BoostModal.tsx           ← Modal boost
```

### Backend (Supabase)
```
supabase/
├── functions/
│   ├── payfonte-create-checkout/    ← Créer checkout
│   ├── payfonte-verify-payment/     ← Fallback webhook
│   ├── payfonte-webhook/            ← Webhook auto Payfonte
├── migrations/
│   ├── 001_initial_schema.sql
├── config.toml                      ← verify_jwt = false
```

### SQL Scripts
```
FIX_ADMIN_CREDITS_URGENT.sql        ← Fix RLS admin crédits
FIX_LISTINGS_RLS_COMPLET_V2.sql     ← Reset complet RLS listings
VERIF_BOOST_DATES.sql               ← Debug boosts production
```

---

## 🚨 Problèmes Connus & Solutions

| Problème | Solution Immédiate |
|----------|-------------------|
| "Invalid JWT" | 1. Vérifier `verify_jwt = false` dans `config.toml`<br>2. Redéployer Edge Functions<br>3. Vérifier refresh token frontend |
| "o is not a function" | Vérifier destructuration retour fonction (doit inclure `success`) |
| "RLS policy violation" | 1. Identifier table concernée<br>2. Ajouter policy admin manquante<br>3. OU utiliser `SERVICE_ROLE_KEY` |
| Montant Payfonte incorrect | Vérifier multiplication par 100 avant envoi API |
| Transaction "pending" en boucle | 1. Vérifier transaction créée dans DB<br>2. Appeler `payfonte-verify-payment` manuellement<br>3. Vérifier webhook configuré |

---

## 🎯 Commandes Fréquentes

```bash
# Déployer frontend (auto via Git)
git add -A && git commit -m "Description" && git push origin main

# Déployer Edge Functions
npx supabase functions deploy

# Appliquer migrations SQL
npx supabase db push

# Voir logs Edge Functions
npx supabase functions logs payfonte-create-checkout --follow

# Vérifier secrets
npx supabase secrets list
```

---

## 📚 Documentation Créée

Lors de la session précédente, 2 documents ont été créés :

1. **`HISTORIQUE_MODIFICATIONS_DEC2025.md`**
   - Détails complets de toutes les modifications
   - Erreurs rencontrées et solutions
   - Architecture systèmes
   - Leçons apprises

2. **`REFERENCE_RAPIDE_SYSTEMES.md`**
   - Guide condensé intervention rapide
   - Requêtes SQL utiles
   - Checklists debugging
   - Commandes fréquentes

---

## 🎤 Ton & Style de Réponse Attendu

- **Langue** : Français 🇫🇷 (toujours)
- **Ton** : Professionnel mais décontracté
- **Emojis** : Oui, pour clarté (🎯 🔥 ⚠️ ✅ ❌)
- **Code** : Toujours avec commentaires explicatifs
- **Explications** : Détaillées mais concises

---

## 🚀 Prompt d'Activation

**Copie-colle ceci lors de la prochaine session :**

```
Bonjour ! Je reprends le projet AnnonceAuto.ci.

Contexte : Marketplace auto en CI, stack React + Supabase + Payfonte.

Dernière session : Corrections système crédits, boost, paiement Payfonte (CORS, JWT, montants ×100, callback boucle), pagination admin, filtres, historique transactions.

Points critiques :
- credits_transactions.balance_after (PAS credits_after !)
- Montants Payfonte ×100
- verify_jwt = false dans config.toml
- RLS policies admin spécifiques

Docs créées :
- HISTORIQUE_MODIFICATIONS_DEC2025.md (détails complets)
- REFERENCE_RAPIDE_SYSTEMES.md (guide rapide)

Lis ces 2 docs pour contexte complet avant de répondre.

Ma question : [TA QUESTION ICI]
```

---

## ✅ Statut Actuel (28 déc 2025)

| Système | Statut | Notes |
|---------|--------|-------|
| Admin Crédits | ✅ PROD | Pagination + filtres OK |
| Admin Modération | ✅ PROD | Pagination + stats OK |
| Boost | ✅ PROD | Dates cohérentes + affichage stats |
| Paiement Payfonte | ✅ PROD | Montants corrects + fallback robuste |
| Callback/Webhook | ✅ PROD | Gestion pending + retry |
| Historique Transactions | ✅ PROD | Pagination + filtres |
| RLS Policies | ✅ PROD | Admin + vendor OK |

---

## 🎁 Bonus : Variables d'Environnement

### `.env` (Frontend)
```env
VITE_SUPABASE_URL=https://vnhwllsawfaueivykhly.supabase.co
VITE_SUPABASE_ANON_KEY=eyJ...
VITE_PAYFONTE_SECRET_KEY=sk_...
```

### Secrets Supabase (Backend)
```
PAYFONTE_SECRET_KEY=sk_...
SUPABASE_SERVICE_ROLE_KEY=sbp_...
```

---

**🎯 Utilise ce prompt pour reprendre le projet efficacement !**

**📅 Créé le : 28 décembre 2025**







