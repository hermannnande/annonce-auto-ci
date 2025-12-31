# 🔧 FIX URGENT : Erreur Boost & Paiement

## 🚨 Problème
```
Erreur création transaction: Could not find the 'credits_after' column 
of 'credits_transactions' in the schema cache
```

---

## 📝 Cause
Le **cache de schéma de Supabase** (PostgREST) n'a pas été mis à jour après la modification de la table `credits_transactions`.

Même si la colonne `balance_after` existe dans la base de données, PostgREST (l'API REST de Supabase) utilise toujours l'ancien schéma avec `credits_after` en cache.

---

## ✅ Solution

### Option 1 : Recharger le schéma via SQL (RECOMMANDÉ)

1. Va dans **Supabase → SQL Editor**
2. Copie-colle ce script :

```sql
-- Rafraîchir le cache du schéma Supabase
COMMENT ON TABLE credits_transactions IS 'Historique des transactions de crédits (balance_after column fixed)';
COMMENT ON COLUMN credits_transactions.balance_after IS 'Solde après la transaction';
NOTIFY pgrst, 'reload schema';
```

3. Clique **RUN**
4. Attends **30 secondes** que le cache se recharge
5. **Teste à nouveau** le boost/paiement

---

### Option 2 : Redémarrer Supabase (si Option 1 ne fonctionne pas)

1. Va dans **Supabase → Settings → Database**
2. Clique **"Restart database"** (⚠️ cela prendra 2-3 minutes)
3. Attends que la base redémarre
4. Teste à nouveau

---

### Option 3 : Forcer le refresh du cache PostgREST

1. Va dans **Supabase → Settings → API**
2. **Régénère** l'URL du projet (optionnel, radical)
3. OU attends **15 minutes** que le cache expire automatiquement

---

## 🔍 Vérification

Après avoir appliqué la solution, vérifie que ça fonctionne :

1. Va sur **annonceauto.ci**
2. Connecte-toi en tant que **vendeur**
3. Essaye de **booster une annonce** :
   - Clique "Booster"
   - Choisis une offre (ex: 7 jours)
   - Clique "Confirmer"
4. ✅ **Succès** : tu dois voir "Annonce boostée avec succès !"
5. ❌ **Échec** : tu vois encore l'erreur → essaye Option 2

---

## 📊 Détails techniques

### Schéma actuel (correct)
```sql
CREATE TABLE credits_transactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  amount INTEGER NOT NULL,
  balance_after INTEGER NOT NULL,  -- ✅ Nouvelle colonne
  type TEXT NOT NULL,
  description TEXT,
  payment_method TEXT,
  payment_reference TEXT,
  payment_status TEXT DEFAULT 'completed',
  admin_id UUID REFERENCES profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

### Ce que le code fait (correct)
```typescript
const { error: transactionError } = await supabase
  .from('credits_transactions')
  .insert({
    user_id: userId,
    amount: -amount,
    balance_after: newCredits,  // ✅ Utilise balance_after
    type: 'boost',
    description,
    payment_status: 'completed',
  });
```

### Ce que PostgREST cherche (cache obsolète)
```
credits_after  ❌ (ancienne colonne qui n'existe plus)
```

### Après le refresh du cache
```
balance_after  ✅ (nouvelle colonne reconnue)
```

---

## 🎯 Pourquoi ça arrive ?

PostgREST (l'API REST de Supabase) met en cache le schéma de la base de données pour des raisons de **performance**.

Quand on modifie une table (ex: renommer une colonne), le cache n'est pas automatiquement invalidé.

**Solutions possibles** :
1. ✅ `NOTIFY pgrst, 'reload schema';` → force le refresh
2. ✅ Redémarrer la base de données → vide tous les caches
3. ✅ Attendre 15-30 minutes → le cache expire automatiquement

---

## 📢 Message à afficher si l'erreur persiste

> **Note importante** : Si l'erreur persiste après 30 minutes, il se peut que Supabase ait besoin de plus de temps pour synchroniser le schéma. Essayez de :
> 1. Vider le cache de votre navigateur (Ctrl+Shift+R)
> 2. Redémarrer la base de données Supabase
> 3. Vérifier que la colonne `balance_after` existe bien dans Supabase → Table Editor → `credits_transactions`

---

## ✅ Fichiers déjà corrigés (aucun changement de code nécessaire)

- ✅ `src/app/services/credits.service.ts` → utilise `balance_after`
- ✅ `src/app/lib/supabase.ts` → type `CreditTransaction` mis à jour
- ✅ `src/app/pages/dashboard/AdminCredits.tsx` → utilise `balance_after`

**Le code est correct. C'est uniquement un problème de cache Supabase.**

---

## 🚀 Résumé : Comment fix en 30 secondes

```sql
-- 1. Copie ce script
COMMENT ON TABLE credits_transactions IS 'Historique des transactions de crédits (balance_after column fixed)';
COMMENT ON COLUMN credits_transactions.balance_after IS 'Solde après la transaction';
NOTIFY pgrst, 'reload schema';

-- 2. Colle dans Supabase → SQL Editor
-- 3. Clique RUN
-- 4. Attends 30 secondes
-- 5. Teste le boost
```

**Fichier SQL** : `FIX_SUPABASE_SCHEMA_CACHE.sql`

---

## ✅ Statut
**Prêt à être testé** ✅

Exécute le script SQL, attends 30 secondes, et teste le boost !



