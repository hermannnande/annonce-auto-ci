# 🚀 Référence Rapide - Systèmes Clés

> **Guide condensé pour intervention rapide sur les systèmes critiques**

---

## 🎯 1. Système de Crédits

### Schéma DB (`credits_transactions`)
```sql
{
  id: uuid
  user_id: uuid (FK profiles)
  amount: integer (+ ou -)
  balance_after: integer (solde après transaction)
  type: 'purchase' | 'boost' | 'gift' | 'admin_adjustment' | 'refund'
  payment_status: 'pending' | 'completed' | 'failed'
  payment_reference: text (unique Payfonte)
  admin_id: uuid (si action admin)
  created_at: timestamp
}
```

### Fichiers clés
- **Service** : `src/app/services/credits.service.ts`
- **Admin** : `src/app/pages/dashboard/AdminCredits.tsx`
- **Recharge** : `src/app/pages/dashboard/VendorRechargePayfonte.tsx`

### Opérations courantes
```typescript
// Ajouter crédits (admin)
await creditsService.addCredits(userId, amount, 'gift', adminId);

// Dépenser crédits (boost)
const { success, error } = await creditsService.spendCredits(
  userId, 
  amount, 
  'boost', 
  listingId
);

// Recharger via Payfonte
await payfonteService.createCheckout(amount, phoneNumber);
```

---

## 💳 2. Système Payfonte

### Architecture
```
Frontend (VendorRecharge)
    ↓
Edge Function (payfonte-create-checkout)
    ↓ [Créer transaction DB + Redirect]
Payfonte Payment Page
    ↓ [Paiement utilisateur]
Callback URL (PayfonteCallback.tsx)
    ↓ [Vérifier statut DB]
Edge Function (payfonte-verify-payment) ← Fallback si pending
    ↓ [Finaliser transaction]
Profile.credits updated ✅
```

### Edge Functions
1. **payfonte-create-checkout** : Créer checkout + transaction DB
2. **payfonte-verify-payment** : Fallback webhook (finaliser transaction)
3. **payfonte-webhook** : Webhook automatique Payfonte

### Points critiques
- **Montant** : Toujours multiplier par 100 (XOF en centimes)
- **Transaction DB** : Créer AVANT redirect Payfonte
- **RLS bypass** : Utiliser `SUPABASE_SERVICE_ROLE_KEY`
- **CORS** : Headers complets dans tous les Edge Functions
- **JWT** : `verify_jwt = false` dans `config.toml`

### Debugging paiement
```typescript
// 1. Vérifier transaction existe
SELECT * FROM credits_transactions 
WHERE payment_reference = 'ref_xxx';

// 2. Vérifier statut Payfonte
curl -H "Authorization: Bearer sk_xxx" \
  https://api.payfonte.com/api/v1/checkouts/ref_xxx

// 3. Forcer finalisation (si succès Payfonte mais DB pending)
→ Appeler manuellement payfonte-verify-payment via Postman
```

---

## 🚀 3. Système de Boost

### Logique dates
```typescript
// Si déjà boosté : prolonger depuis boost_until
const startDate = listing.is_boosted && listing.boost_until
  ? new Date(listing.boost_until)
  : new Date();

const endDate = new Date(startDate);
endDate.setDate(endDate.getDate() + durationDays);

// Update
await supabase
  .from('listings')
  .update({
    is_boosted: true,
    boost_until: endDate.toISOString()
  })
  .eq('id', listingId)
  .eq('user_id', userId); // SÉCURITÉ
```

### Fichiers clés
- **Service** : `src/app/services/listings.service.ts`
- **Modal** : `src/app/components/modals/BoostModal.tsx`
- **Page** : `src/app/pages/dashboard/VendorBooster.tsx`
- **Stats** : `src/app/pages/dashboard/ListingStatsPage.tsx`

### Vérification production
```bash
psql $DATABASE_URL -f VERIF_BOOST_DATES.sql
```

---

## 🛡️ 4. RLS Policies Critiques

### Profiles
```sql
-- Vendors voient leur profil
CREATE POLICY "Users can view own profile"
ON profiles FOR SELECT 
USING (auth.uid() = id);

-- Admins voient tous les profils
CREATE POLICY "Admins can view all profiles"
ON profiles FOR SELECT
USING (auth.uid() IN (
  SELECT id FROM profiles WHERE role = 'admin'
));

-- Admins modifient tous les profils
CREATE POLICY "Admins can update any profile"
ON profiles FOR UPDATE
USING (auth.uid() IN (
  SELECT id FROM profiles WHERE role = 'admin'
));
```

### Credits Transactions
```sql
-- Vendors voient leurs transactions
CREATE POLICY "Users can view own transactions"
ON credits_transactions FOR SELECT
USING (user_id = auth.uid());

-- Admins insèrent transactions
CREATE POLICY "Admins can insert transactions"
ON credits_transactions FOR INSERT
WITH CHECK (auth.uid() IN (
  SELECT id FROM profiles WHERE role = 'admin'
));
```

### Listings
```sql
-- Public voit annonces approuvées
CREATE POLICY "Anyone can view approved listings"
ON listings FOR SELECT
USING (status = 'approved');

-- Vendors voient leurs annonces
CREATE POLICY "Vendors can view own listings"
ON listings FOR SELECT
USING (user_id = auth.uid());

-- Admins voient tout
CREATE POLICY "Admins can view all listings"
ON listings FOR SELECT
USING (auth.uid() IN (
  SELECT id FROM profiles WHERE role = 'admin'
));
```

### Reset complet policies (si conflit)
```bash
psql $DATABASE_URL -f FIX_LISTINGS_RLS_COMPLET_V2.sql
```

---

## 🔧 5. Commandes Utiles

### Git / Déploiement
```bash
# Commit + push (auto-deploy Vercel)
git add -A
git commit -m "Fix: Description"
git push origin main

# Déployer Edge Functions
npx supabase functions deploy

# Déployer fonction spécifique
npx supabase functions deploy payfonte-create-checkout
```

### Supabase
```bash
# Appliquer migrations
npx supabase db push

# Reset DB locale
npx supabase db reset

# Générer types TypeScript
npx supabase gen types typescript --project-id vnhwllsawfaueivykhly > src/types/supabase.ts
```

### Logs
```bash
# Logs Edge Functions (temps réel)
npx supabase functions logs payfonte-create-checkout --follow

# Logs toutes fonctions
npx supabase functions logs --follow
```

---

## 🐛 6. Erreurs Fréquentes & Fixes

### `TypeError: o is not a function`
**Cause** : Mauvaise destructuration retour fonction  
**Fix** : Vérifier signature fonction vs destructuration
```typescript
// ❌ Mauvais
const { error } = await spendCredits(...);

// ✅ Correct
const { success, error } = await spendCredits(...);
```

### `Invalid JWT` (401)
**Cause** : JWT expiré ou invalide  
**Fix rapide** :
1. Vérifier `config.toml` : `verify_jwt = false`
2. Frontend : implémenter refresh automatique
3. Ajouter retry logic (1 tentative)

### `CORS blocked`
**Cause** : Headers CORS manquants  
**Fix** : Ajouter dans Edge Function
```typescript
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

if (req.method === 'OPTIONS') {
  return new Response('ok', { headers: corsHeaders });
}
```

### `Row violates row-level security policy`
**Cause** : Policy RLS trop restrictive  
**Fix** : 
1. Identifier table concernée
2. Vérifier policies existantes
3. Ajouter policy manquante OU utiliser `SERVICE_ROLE_KEY`

### Montant Payfonte incorrect
**Cause** : Montant pas en centimes  
**Fix** : Multiplier par 100
```typescript
const payfonteAmount = amount * 100; // 5000 → 500000
```

### Transaction Payfonte réussie mais site affiche "échec"
**Cause** : Transaction pas créée/finalisée dans DB  
**Fix** :
1. Vérifier transaction existe : `SELECT * FROM credits_transactions WHERE payment_reference = 'xxx'`
2. Si manquante : Edge Function n'a pas créé (problème RLS)
3. Si `pending` : Appeler fallback `payfonte-verify-payment`

---

## 📊 7. Monitoring Production

### Requêtes SQL utiles
```sql
-- Transactions en attente (> 10 min)
SELECT * FROM credits_transactions
WHERE payment_status = 'pending'
AND created_at < NOW() - INTERVAL '10 minutes';

-- Crédits totaux distribués aujourd'hui
SELECT SUM(amount) FROM credits_transactions
WHERE payment_status = 'completed'
AND type = 'purchase'
AND created_at >= CURRENT_DATE;

-- Top 10 vendeurs par crédits
SELECT p.email, p.credits
FROM profiles p
WHERE p.role = 'vendor'
ORDER BY p.credits DESC
LIMIT 10;

-- Boosts actifs
SELECT COUNT(*) FROM listings
WHERE is_boosted = true
AND boost_until > NOW();
```

### Dashboards Supabase
- **Database** → Table Editor : Voir données
- **Database** → SQL Editor : Requêtes custom
- **Functions** → Edge Functions : Logs, invocations
- **Authentication** → Users : Gérer utilisateurs

---

## 🔐 8. Secrets & Variables

### Frontend (`.env`)
```env
VITE_SUPABASE_URL=https://vnhwllsawfaueivykhly.supabase.co
VITE_SUPABASE_ANON_KEY=eyJ...
VITE_PAYFONTE_SECRET_KEY=sk_...
```

### Backend (Supabase Dashboard → Settings → Edge Functions → Secrets)
```
PAYFONTE_SECRET_KEY=sk_...
SUPABASE_SERVICE_ROLE_KEY=sbp_...
```

### Vérifier secrets Edge Functions
```bash
npx supabase secrets list
```

---

## 📞 9. Contacts & Support

### Payfonte
- **API Docs** : https://docs.payfonte.com
- **Dashboard** : https://dashboard.payfonte.com
- **Support** : support@payfonte.com

### Supabase
- **Dashboard** : https://supabase.com/dashboard
- **Docs** : https://supabase.com/docs
- **Discord** : https://discord.supabase.com

---

## ✅ 10. Checklist Intervention Rapide

### Problème paiement
- [ ] Vérifier logs Edge Functions
- [ ] Vérifier transaction DB (`credits_transactions`)
- [ ] Tester endpoint Payfonte directement (curl)
- [ ] Vérifier headers CORS
- [ ] Vérifier JWT valide
- [ ] Vérifier montant (×100)
- [ ] Tester callback URL accessible

### Problème boost
- [ ] Vérifier `credits` suffisants
- [ ] Vérifier transaction créée (`type: 'boost'`)
- [ ] Vérifier `listing.boost_until` défini
- [ ] Vérifier dates cohérentes (start < end)
- [ ] Lancer `VERIF_BOOST_DATES.sql`

### Problème RLS
- [ ] Identifier table + action (SELECT/INSERT/UPDATE/DELETE)
- [ ] Vérifier policies : `SELECT * FROM pg_policies WHERE tablename = 'xxx'`
- [ ] Tester avec `SERVICE_ROLE_KEY` (bypass RLS)
- [ ] Créer policy manquante
- [ ] Si conflit : lancer script reset complet

### Problème affichage admin
- [ ] Vérifier filtres/pagination paramètres
- [ ] Vérifier requête Supabase (console)
- [ ] Tester sans filtres
- [ ] Vérifier RLS policies (admin peut voir tout ?)
- [ ] Vérifier `role = 'admin'` dans DB

---

**💡 Astuce** : Garder ce document ouvert lors d'interventions !

**📅 Dernière mise à jour : 28 décembre 2025**






