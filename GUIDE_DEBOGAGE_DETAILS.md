# 🔍 **DÉBOGAGE : PAGE DÉTAILS VÉHICULE**

---

## 🎯 **ÉTAPES DE DÉBOGAGE**

### **Étape 1 : Vérifier les annonces dans Supabase**

1. Va sur **Supabase Dashboard** : https://supabase.com/dashboard
2. Ouvre ton projet **AnnonceAuto CI**
3. Va dans **Table Editor** > **listings**
4. Vérifie combien d'annonces tu as
5. **Vérifie leur statut** : `status` doit être **`active`** pour être visible

**OU** exécute ce SQL dans l'éditeur SQL :

```sql
-- Voir toutes les annonces et leur statut
SELECT 
  id,
  title,
  brand,
  model,
  price,
  status,
  created_at
FROM listings
ORDER BY created_at DESC;

-- Compter par statut
SELECT 
  status,
  COUNT(*) as count
FROM listings
GROUP BY status;
```

---

### **Étape 2 : Vérifier la console du navigateur**

1. **Rafraîchis la page** d'accueil : `Ctrl + Shift + R`
2. Ouvre la **console** (F12 → Console)
3. Clique sur une annonce
4. Vérifie les logs :

**Logs attendus :**
```
🔍 Chargement annonce ID: abc123
📦 Annonce récupérée: {id: "abc123", title: "Toyota Camry", status: "active", ...}
✅ Annonce active chargée: Toyota Camry
🚗 Véhicules similaires: 2
```

**Si problème :**
```
❌ Annonce non trouvée dans Supabase
OU
⚠️ Annonce non active: pending
```

---

### **Étape 3 : Solutions possibles**

#### **Problème 1 : Aucune annonce active**
**Symptôme :** `⚠️ Annonce non active: pending`

**Solution :**
1. Va dans le **Dashboard Admin** : http://localhost:5173/dashboard/admin
2. Va dans **Modération**
3. **Approuve** les annonces en attente

**OU** exécute ce SQL pour activer toutes les annonces :
```sql
UPDATE listings
SET status = 'active'
WHERE status = 'pending';
```

---

#### **Problème 2 : Annonce non trouvée**
**Symptôme :** `❌ Annonce non trouvée dans Supabase`

**Causes possibles :**
1. **L'ID est incorrect** (copié depuis une ancienne URL localStorage)
2. **L'annonce a été supprimée**
3. **Problème de connexion Supabase**

**Solution :**
1. Va sur **http://localhost:5173/annonces**
2. Vérifie que des annonces s'affichent
3. Si OUI : Clique dessus pour obtenir le bon ID
4. Si NON : Tu n'as pas d'annonces actives (voir Problème 1)

---

#### **Problème 3 : Erreur Supabase**
**Symptôme :** `💥 Erreur chargement véhicule: ...`

**Solution :**
1. Vérifie le fichier `.env.local` :
   ```
   VITE_SUPABASE_URL=https://vnhwllsawfaueivykhly.supabase.co
   VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
   ```
2. **Redémarre le serveur** :
   ```bash
   # Arrête le serveur (Ctrl+C)
   # Relance
   pnpm dev
   ```

---

### **Étape 4 : Créer une annonce de test**

Si tu n'as **aucune annonce active** :

1. Va sur **http://localhost:5173/publier**
2. Remplis le formulaire
3. **Publie** l'annonce
4. Va dans **Dashboard Admin** > **Modération**
5. **Approuve** l'annonce
6. Retourne sur **http://localhost:5173/annonces**
7. Clique sur l'annonce
8. ✅ Elle doit s'afficher

---

## 🧪 **CHECKLIST DE VÉRIFICATION**

- [ ] **Supabase** : J'ai au moins 1 annonce avec `status = 'active'`
- [ ] **Console** : Aucune erreur rouge dans la console (F12)
- [ ] **Page Annonces** : Je vois mes annonces sur `/annonces`
- [ ] **Clic** : Quand je clique, je vois les logs dans la console
- [ ] **URL** : L'URL change vers `/annonces/:id` (ex: `/annonces/abc123`)

---

## 📸 **CE QUE TU DOIS VOIR**

### ✅ **Si tout fonctionne :**
1. Console :
   ```
   🔍 Chargement annonce ID: abc123
   📦 Annonce récupérée: {id: "abc123", ...}
   ✅ Annonce active chargée: Toyota Camry
   ```
2. Page : Détails complets du véhicule (images, prix, description, etc.)

### ❌ **Si ça ne fonctionne pas :**
1. Console :
   ```
   ❌ Annonce non trouvée dans Supabase
   OU
   ⚠️ Annonce non active: pending
   ```
2. Page : "Véhicule non trouvé"

---

## 🆘 **BESOIN D'AIDE ?**

Envoie-moi :
1. **Screenshot de la console** (F12 → Console) quand tu cliques sur une annonce
2. **Screenshot de Supabase** (Table Editor → listings)
3. **L'URL exacte** que tu essaies d'ouvrir

---

**💡 CONSEIL : Commence par vérifier l'Étape 1 (Supabase) !**




