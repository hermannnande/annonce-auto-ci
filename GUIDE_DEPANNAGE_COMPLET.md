# 🚨 GUIDE DÉPANNAGE COMPLET - Session 27 Déc 2025

## 📋 Problèmes identifiés et solutions

---

## 🔴 **Problème 1 : Boost & Paiement ne fonctionnent pas**

### Erreur
```
Could not find the 'credits_after' column of 'credits_transactions' in the schema cache
Code: PGRST204
```

### Cause
Cache PostgREST (API Supabase) obsolète après modification de la colonne.

### Solution
1. Va dans **Supabase → SQL Editor**
2. Exécute `FIX_SUPABASE_SCHEMA_CACHE.sql` :

```sql
COMMENT ON TABLE credits_transactions IS 'Historique des transactions de crédits (balance_after column fixed)';
COMMENT ON COLUMN credits_transactions.balance_after IS 'Solde après la transaction';
NOTIFY pgrst, 'reload schema';
```

3. Attends **30 secondes**
4. Teste le boost sur **annonceauto.ci**

**📄 Documentation** : `FIX_BOOST_PAIEMENT_URGENT.md`

---

## 🔴 **Problème 2 : Création/Modification d'annonces impossible**

### Erreur
```
new row violates row-level security policy for table "listings"
Code: 42501
```

### Cause
Politiques RLS (Row Level Security) manquantes ou mal configurées sur la table `listings`.

### Solution
1. Va dans **Supabase → SQL Editor**
2. Exécute `FIX_LISTINGS_RLS_URGENT.sql` (voir ci-dessous)
3. Attends **10 secondes**
4. Teste la création d'une annonce

**📄 Documentation** : `FIX_LISTINGS_RLS_DOCUMENTATION.md`

---

## 📝 **Script SQL complet à exécuter**

### Option 1 : Tout en 1 fois (RECOMMANDÉ)

Exécute ces 2 scripts dans l'ordre :

#### **1. Fix Boost & Paiement**
```sql
COMMENT ON TABLE credits_transactions IS 'Historique des transactions de crédits (balance_after column fixed)';
COMMENT ON COLUMN credits_transactions.balance_after IS 'Solde après la transaction';
NOTIFY pgrst, 'reload schema';
```

#### **2. Fix RLS Listings**
```sql
-- Supprimer anciennes policies
DROP POLICY IF EXISTS "Public can view active listings" ON listings;
DROP POLICY IF EXISTS "Users can view own listings" ON listings;
DROP POLICY IF EXISTS "Vendors can insert own listings" ON listings;
DROP POLICY IF EXISTS "Vendors can update own listings" ON listings;
DROP POLICY IF EXISTS "Vendors can delete own listings" ON listings;
DROP POLICY IF EXISTS "Admins can view all listings" ON listings;
DROP POLICY IF EXISTS "Admins can update all listings" ON listings;
DROP POLICY IF EXISTS "Admins can delete all listings" ON listings;

-- Créer nouvelles policies
CREATE POLICY "Public can view active listings"
  ON listings FOR SELECT
  USING (status = 'active' OR status = 'approved');

CREATE POLICY "Vendors can view own listings"
  ON listings FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all listings"
  ON listings FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.user_type = 'admin'
    )
  );

CREATE POLICY "Authenticated users can insert listings"
  ON listings FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Vendors can update own listings"
  ON listings FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can update all listings"
  ON listings FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.user_type = 'admin'
    )
  );

CREATE POLICY "Vendors can delete own listings"
  ON listings FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can delete all listings"
  ON listings FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.user_type = 'admin'
    )
  );

-- Activer RLS
ALTER TABLE listings ENABLE ROW LEVEL SECURITY;

-- Refresh cache
COMMENT ON TABLE listings IS 'Annonces de véhicules avec RLS policies complètes';
NOTIFY pgrst, 'reload schema';
```

---

## ✅ **Tests à effectuer après les fixes**

### 1️⃣ Test Boost
1. Connecte-toi en tant que **vendeur**
2. Va sur une de tes annonces
3. Clique **"Booster"**
4. Choisis **"7 jours - 10 crédits"**
5. Clique **"Confirmer"**
6. ✅ Tu dois voir : "Annonce boostée avec succès !"

### 2️⃣ Test Création d'annonce
1. Clique **"Vendre mon véhicule"**
2. Remplis le formulaire (marque, modèle, prix, etc.)
3. Ajoute au moins 1 photo
4. Clique **"Publier l'annonce"**
5. ✅ L'annonce doit être créée avec le statut `pending`

### 3️⃣ Test Modification d'annonce
1. Va dans **Tableau de bord → Mes annonces**
2. Clique sur une annonce
3. Clique **"Modifier"** (icône crayon)
4. Change le **prix** (ex: 5000000 → 5500000)
5. Clique **"Enregistrer"**
6. ✅ La modification doit être sauvegardée

### 4️⃣ Test Admin Crédits
1. Connecte-toi en tant qu'**admin**
2. Va sur **Dashboard → Crédits**
3. Clique **"Ajouter"** sur un vendeur
4. Entre **50 crédits**
5. Entre une raison : "Test"
6. Clique **"Confirmer"**
7. ✅ Le solde du vendeur doit augmenter de 50

### 5️⃣ Test Admin Modération
1. Va sur **Dashboard → Modération**
2. Clique sur une annonce **"En attente"**
3. Clique **"Approuver l'annonce"**
4. ✅ L'annonce passe au statut `active`
5. ✅ Les stats changent : "En attente -1", "Approuvées +1"

---

## 🐛 **Dépannage supplémentaire**

### Si le boost ne fonctionne toujours pas

**Option A : Redémarrer la base de données**
1. Va dans **Supabase → Settings → Database**
2. Clique **"Restart database"**
3. Attends **2-3 minutes**
4. Teste à nouveau

**Option B : Vérifier le solde de crédits**
```sql
SELECT id, full_name, credits 
FROM profiles 
WHERE user_type = 'vendor'
ORDER BY credits DESC;
```
Vérifie que le vendeur a assez de crédits.

**Option C : Vérifier la table `credits_transactions`**
```sql
SELECT * FROM credits_transactions 
ORDER BY created_at DESC 
LIMIT 10;
```
Vérifie que la colonne `balance_after` existe bien.

### Si la création d'annonces ne fonctionne pas

**Option A : Vérifier que RLS est activé**
```sql
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE tablename = 'listings';
```
`rowsecurity` doit être `true`.

**Option B : Vérifier les policies**
```sql
SELECT policyname, cmd 
FROM pg_policies 
WHERE tablename = 'listings';
```
Tu devrais voir au moins 8 policies.

**Option C : Vérifier le profil utilisateur**
```sql
SELECT id, full_name, user_type, email 
FROM profiles 
WHERE email = 'ton-email@example.com';
```
Vérifie que `user_type` est bien `vendor`.

---

## 📦 **Fichiers créés aujourd'hui**

### Améliorations Pages Admin
- ✅ `AMELIORATIONS_ADMIN_CREDITS.md` (doc technique Crédits)
- ✅ `GUIDE_ADMIN_CREDITS_RAPIDE.md` (guide rapide Crédits)
- ✅ `AMELIORATIONS_ADMIN_MODERATION.md` (doc technique Modération)
- ✅ `GUIDE_ADMIN_MODERATION_RAPIDE.md` (guide rapide Modération)

### Fixes Urgents
- ✅ `FIX_SUPABASE_SCHEMA_CACHE.sql` (fix cache boost/paiement)
- ✅ `FIX_BOOST_PAIEMENT_URGENT.md` (doc boost/paiement)
- ✅ `FIX_LISTINGS_RLS_URGENT.sql` (fix RLS listings)
- ✅ `FIX_LISTINGS_RLS_DOCUMENTATION.md` (doc RLS)
- ✅ `GUIDE_DEPANNAGE_COMPLET.md` (ce fichier)

---

## 🎯 **Checklist de vérification complète**

Après avoir exécuté tous les scripts SQL :

- [ ] **Cache Supabase** : exécuté `NOTIFY pgrst, 'reload schema';`
- [ ] **RLS Listings** : 8 policies créées
- [ ] **Test Boost** : fonctionne
- [ ] **Test Création annonce** : fonctionne
- [ ] **Test Modification annonce** : fonctionne
- [ ] **Test Admin Crédits** : ajout/retrait de crédits fonctionne
- [ ] **Test Admin Modération** : approbation/rejet fonctionne
- [ ] **Cache navigateur** : vidé (Ctrl+Shift+R)
- [ ] **Pas d'erreurs console** : vérifié dans DevTools

---

## 🚀 **Résumé : Ordre d'exécution**

```
1. Copie les 2 scripts SQL
2. Va dans Supabase → SQL Editor
3. Exécute le script 1 (Cache)
4. Attends 30 secondes
5. Exécute le script 2 (RLS)
6. Attends 10 secondes
7. Vide le cache navigateur (Ctrl+Shift+R)
8. Teste tous les cas d'usage
9. ✅ Tout fonctionne !
```

---

## 📞 **Support**

Si un problème persiste après avoir suivi ce guide :

1. **Vérifie la console navigateur** (F12 → Console)
2. **Copie l'erreur complète**
3. **Vérifie les logs Supabase** (Dashboard → Logs)
4. **Fournis le message d'erreur exact**

---

## ✅ **Statut Global**

| Fonctionnalité | Statut |
|----------------|--------|
| Page Admin Crédits | ✅ 100% (pagination, filtres, tri) |
| Page Admin Modération | ✅ 100% (pagination, filtres, stats, prix suspects) |
| Système Boost | ⚠️ Fix à appliquer (cache Supabase) |
| Création annonces | ⚠️ Fix à appliquer (RLS policies) |
| Modification crédits | ✅ 100% (policy admin appliquée) |
| Analytics | ✅ 100% (données réelles, géolocalisation) |
| Messagerie vocale | ✅ 100% (signed URLs, optimistic UI) |
| Reset password | ✅ 100% (page + template email FR) |

---

**📢 Exécute les 2 scripts SQL et dis-moi si tout fonctionne !** 🚀


