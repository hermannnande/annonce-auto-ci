# 🚨 CORRECTION ERREUR VERCEL

## ❌ Problème identifié

```
ERR_NAME_NOT_RESOLVED
vnhwllsawfaueivykhly…09%3A02%3A32.965Z
```

**Cause:** Les variables d'environnement `VITE_SUPABASE_URL` et `VITE_SUPABASE_ANON_KEY` ne sont **PAS correctement configurées dans Vercel** !

---

## ✅ SOLUTION EN 3 ÉTAPES

### 1️⃣ Vérifier les variables d'environnement Vercel

**Allez sur:** https://vercel.com/dashboard

1. Cliquez sur votre projet **"annonce-auto-ci"**
2. Cliquez sur **"Settings"**
3. Cliquez sur **"Environment Variables"** dans le menu gauche

---

### 2️⃣ Ajouter/Vérifier les variables

Vous devez avoir **EXACTEMENT** ces 2 variables :

#### Variable 1: VITE_SUPABASE_URL

**Name (exactement comme ça):**
```
VITE_SUPABASE_URL
```

**Value:**
```
https://vnhwllsawfaueivykhly.supabase.co
```

**Environment:** Cochez `Production`, `Preview`, et `Development`

---

#### Variable 2: VITE_SUPABASE_ANON_KEY

**Name (exactement comme ça):**
```
VITE_SUPABASE_ANON_KEY
```

**Value:**
```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZuaHdsbHNhd2ZhdWVpdnlraGx5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjY0MzczMTgsImV4cCI6MjA4MjAxMzMxOH0.W4td5ZTiGYxqutPAyGGcGpkRNlXW1PJfQ5JCb-BZt64
```

**Environment:** Cochez `Production`, `Preview`, et `Development`

---

### 3️⃣ Redéployer le site

**IMPORTANT:** Après avoir ajouté/modifié les variables, vous **DEVEZ** redéployer !

**Deux options:**

#### Option A : Redéploiement automatique (Recommandé)
1. Dans Vercel, allez dans **"Deployments"**
2. Trouvez le dernier déploiement
3. Cliquez sur le menu **"⋯"** (3 points)
4. Cliquez sur **"Redeploy"**
5. Cochez **"Use existing Build Cache"** (décochez pour forcer rebuild)
6. Cliquez sur **"Redeploy"**

#### Option B : Push sur GitHub (déclenche auto-deploy)
```bash
# Faire un petit changement et push
git commit --allow-empty -m "Redeploy after env vars update"
git push origin main
```

---

## ⚠️ VÉRIFICATIONS IMPORTANTES

### ❌ ERREURS FRÉQUENTES

1. **Nom de variable incorrect**
   - ❌ `SUPABASE_URL` 
   - ✅ `VITE_SUPABASE_URL` (avec le préfixe `VITE_`)

2. **Espace dans la valeur**
   - ❌ `https://vnhwllsawfaueivykhly.supabase.co ` (espace à la fin)
   - ✅ `https://vnhwllsawfaueivykhly.supabase.co` (pas d'espace)

3. **Environnement non coché**
   - ⚠️ Cochez **Production**, **Preview**, ET **Development**

4. **Pas redéployé après modification**
   - ⚠️ Vous **DEVEZ** redéployer pour que les changements prennent effet

---

## 🔍 VÉRIFIER QUE ÇA MARCHE

Une fois redéployé, ouvrez votre site et vérifiez :

1. **Console du navigateur (F12)**
   - Vous ne devriez plus voir d'erreurs `ERR_NAME_NOT_RESOLVED`

2. **Testez une action**
   - Essayez de vous connecter
   - Les requêtes Supabase devraient fonctionner

---

## 📋 CHECKLIST

- [ ] Variable `VITE_SUPABASE_URL` ajoutée dans Vercel
- [ ] Variable `VITE_SUPABASE_ANON_KEY` ajoutée dans Vercel
- [ ] Les 3 environnements sont cochés (Production, Preview, Development)
- [ ] Site redéployé
- [ ] Aucune erreur dans la console
- [ ] Connexion/Inscription fonctionne

---

## 🚀 APRÈS LA CORRECTION

Une fois que tout fonctionne, il faudra **configurer Supabase** :

### Configuration Supabase (À FAIRE APRÈS)

1. Allez sur https://supabase.com/dashboard/project/vnhwllsawfaueivykhly
2. **Settings** → **Authentication** → **URL Configuration**
3. Ajoutez l'URL Vercel dans **Site URL** et **Redirect URLs**

---

## 💡 ASTUCE

Pour vérifier que les variables sont bien chargées, ajoutez temporairement dans votre code :

```typescript
console.log('VITE_SUPABASE_URL:', import.meta.env.VITE_SUPABASE_URL);
```

Si ça affiche `undefined`, les variables ne sont pas chargées !

---

## ❓ BESOIN D'AIDE ?

**Envoyez-moi:**
1. Capture d'écran de vos variables d'environnement Vercel
2. L'URL de votre site Vercel
3. Les erreurs dans la console (F12)


