# 🔧 FIX URGENT : Erreur RLS sur table `listings`

## 🚨 Problème
```
Error: new row violates row-level security policy for table "listings"
Code: 42501
```

---

## 📝 Cause
Les **politiques RLS** (Row Level Security) de la table `listings` sont **manquantes** ou **mal configurées**.

Cela empêche :
- ✅ Les vendeurs de créer des annonces
- ✅ Les vendeurs de modifier leurs annonces
- ✅ Potentiellement d'autres actions

---

## ✅ Solution

### 1️⃣ Va dans **Supabase → SQL Editor**

### 2️⃣ Copie-colle le script `FIX_LISTINGS_RLS_URGENT.sql`

### 3️⃣ Clique **RUN**

### 4️⃣ Attends **10 secondes**

### 5️⃣ **Teste** :
1. Connecte-toi en tant que **vendeur** sur **annonceauto.ci**
2. Essaye de **créer une nouvelle annonce**
3. Remplis le formulaire
4. Clique **"Publier l'annonce"**
5. ✅ L'annonce doit être créée avec succès

---

## 📊 Politiques RLS créées

### 🔍 **SELECT (Lecture)**
1. **Public** : peut voir les annonces `active` ou `approved`
2. **Vendeurs** : peuvent voir **toutes** leurs propres annonces (tous statuts)
3. **Admins** : peuvent voir **toutes** les annonces

### ✏️ **INSERT (Création)**
1. **Utilisateurs authentifiés** : peuvent créer des annonces (avec `user_id = auth.uid()`)

### 🔄 **UPDATE (Modification)**
1. **Vendeurs** : peuvent modifier leurs propres annonces
2. **Admins** : peuvent modifier **toutes** les annonces

### 🗑️ **DELETE (Suppression)**
1. **Vendeurs** : peuvent supprimer leurs propres annonces
2. **Admins** : peuvent supprimer **toutes** les annonces

---

## 🎯 Détails techniques

### Politique INSERT (création d'annonce)
```sql
CREATE POLICY "Authenticated users can insert listings"
  ON listings FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);
```

**Explication** :
- Seuls les utilisateurs **authentifiés** peuvent créer une annonce
- Le `user_id` de l'annonce **doit** correspondre à l'utilisateur connecté
- Empêche un utilisateur de créer une annonce au nom d'un autre

### Politique UPDATE (modification d'annonce)
```sql
CREATE POLICY "Vendors can update own listings"
  ON listings FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);
```

**Explication** :
- `USING` : l'utilisateur doit être le propriétaire de l'annonce pour la modifier
- `WITH CHECK` : après modification, l'annonce doit toujours appartenir au même utilisateur

### Politique SELECT (lecture d'annonces)
```sql
-- Public : annonces actives
CREATE POLICY "Public can view active listings"
  ON listings FOR SELECT
  USING (status = 'active' OR status = 'approved');

-- Vendeurs : leurs propres annonces (tous statuts)
CREATE POLICY "Vendors can view own listings"
  ON listings FOR SELECT
  USING (auth.uid() = user_id);
```

**Explication** :
- Les visiteurs (non connectés) voient uniquement les annonces `active` ou `approved`
- Les vendeurs voient aussi leurs annonces `pending` ou `rejected`

---

## 🔍 Vérification après exécution

### 1️⃣ Vérifier que les policies existent

Va dans **Supabase → Database → Tables → listings → Policies**

Tu devrais voir **9 policies** :
1. ✅ Public can view active listings
2. ✅ Vendors can view own listings
3. ✅ Admins can view all listings
4. ✅ Authenticated users can insert listings
5. ✅ Vendors can update own listings
6. ✅ Admins can update all listings
7. ✅ Vendors can delete own listings
8. ✅ Admins can delete all listings

### 2️⃣ Tester la création d'annonce

1. Connecte-toi en tant que **vendeur**
2. Clique **"Vendre mon véhicule"**
3. Remplis le formulaire
4. Clique **"Publier"**
5. ✅ L'annonce doit être créée avec le statut `pending`

### 3️⃣ Tester la modification d'annonce

1. Va dans **Tableau de bord → Mes annonces**
2. Clique sur une annonce
3. Clique **"Modifier"**
4. Change le prix
5. Clique **"Enregistrer"**
6. ✅ La modification doit être enregistrée

### 4️⃣ Tester le boost (si le cache Supabase est ok)

1. Va sur une annonce
2. Clique **"Booster"**
3. Choisis une offre
4. Clique **"Confirmer"**
5. ✅ Le boost doit fonctionner

---

## 🐛 Dépannage

### Erreur persiste après exécution du script

**1. Vérifie que RLS est activé**
```sql
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE tablename = 'listings';
```
➡️ `rowsecurity` doit être `true`

**2. Vérifie que les policies existent**
```sql
SELECT * FROM pg_policies WHERE tablename = 'listings';
```
➡️ Tu devrais voir 8-9 policies

**3. Refresh le cache**
```sql
NOTIFY pgrst, 'reload schema';
```

**4. Vide le cache navigateur**
- Chrome/Edge : `Ctrl + Shift + R`
- Firefox : `Ctrl + F5`

---

## 📝 Notes importantes

### Ordre des politiques
Supabase évalue les politiques dans cet ordre :
1. Si **au moins une** politique permet l'action → ✅ autorisé
2. Si **aucune** politique ne permet l'action → ❌ refusé

Exemple : Un admin peut modifier une annonce grâce à `"Admins can update all listings"`, même s'il n'est pas le propriétaire.

### Différence `USING` vs `WITH CHECK`

- **`USING`** : condition pour **sélectionner/modifier/supprimer** une ligne existante
- **`WITH CHECK`** : condition pour **vérifier** la ligne après insertion/modification

Exemple pour INSERT :
```sql
-- ✅ Bon
WITH CHECK (auth.uid() = user_id)  -- Vérifie que le user_id est correct

-- ❌ Mauvais (pas de sens pour INSERT)
USING (auth.uid() = user_id)  -- USING n'a pas de sens pour INSERT
```

---

## 🎉 Résultat attendu

Après avoir exécuté le script :
- ✅ Les vendeurs peuvent **créer** des annonces
- ✅ Les vendeurs peuvent **modifier** leurs annonces
- ✅ Les vendeurs peuvent **supprimer** leurs annonces
- ✅ Les admins peuvent **tout faire** sur toutes les annonces
- ✅ Le public voit uniquement les annonces **actives**
- ✅ Les vendeurs voient leurs annonces **en attente** de modération

---

## 🚀 Résumé en 1 image

```
┌─────────────────────────────────────────────────────────┐
│ 1. Copie le script FIX_LISTINGS_RLS_URGENT.sql         │
│ 2. Colle dans Supabase → SQL Editor                    │
│ 3. Clique RUN                                           │
│ 4. Attends 10 secondes                                  │
│ 5. Teste la création d'annonce sur annonceauto.ci     │
│ 6. ✅ Ça marche !                                       │
└─────────────────────────────────────────────────────────┘
```

---

## 📦 Fichiers liés

- ✅ `FIX_LISTINGS_RLS_URGENT.sql` (script SQL à exécuter)
- ✅ `FIX_SUPABASE_SCHEMA_CACHE.sql` (fix cache boost/paiement)
- ✅ `FIX_BOOST_PAIEMENT_URGENT.md` (doc boost/paiement)

---

## ✅ Statut
**Prêt à être testé** ✅

**📢 Exécute le script SQL maintenant et dis-moi si ça fonctionne !** 🚀

---

## 🔗 Pour aller plus loin

### Vérifier toutes les tables avec RLS
```sql
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public'
AND rowsecurity = true;
```

### Voir toutes les policies du projet
```sql
SELECT tablename, policyname, cmd, qual 
FROM pg_policies 
WHERE schemaname = 'public'
ORDER BY tablename, policyname;
```

### Désactiver temporairement RLS (⚠️ DANGER)
```sql
-- NE JAMAIS FAIRE EN PRODUCTION !
ALTER TABLE listings DISABLE ROW LEVEL SECURITY;
```


