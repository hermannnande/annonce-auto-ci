# 🚀 GUIDE DE DÉPLOIEMENT EN LIGNE

## Date: 24 Décembre 2025

---

## 🎯 OBJECTIF

Déployer **AnnonceAuto CI** en production pour terminer la configuration complète.

---

## 📋 OPTIONS DE DÉPLOIEMENT

### Option 1: Vercel (RECOMMANDÉ) ⭐
- ✅ **Gratuit** pour projets personnels
- ✅ **Déploiement automatique** depuis Git
- ✅ **SSL gratuit**
- ✅ **Très rapide**
- ✅ **Interface simple**

### Option 2: Netlify
- ✅ Gratuit
- ✅ Simple
- ✅ SSL gratuit

### Option 3: Railway (pour backend + frontend)
- ✅ Gratuit (avec limitations)
- ✅ Supporte Node.js backend

---

## 🚀 DÉPLOIEMENT SUR VERCEL (RECOMMANDÉ)

### ÉTAPE 1: Préparer le projet

#### 1.1 Créer/Vérifier le fichier `.gitignore`

Vérifiez que ces fichiers ne sont PAS envoyés sur Git :

```gitignore
# Dépendances
node_modules/
.pnpm-store/

# Build
dist/
build/
.vite/

# Environnement
.env
.env.local
.env.production

# Logs
*.log
npm-debug.log*
pnpm-debug.log*

# Système
.DS_Store
Thumbs.db

# IDE
.vscode/
.idea/

# Temporaire
*.tmp
*.temp
```

#### 1.2 Créer un fichier `vercel.json` (optionnel)

```json
{
  "buildCommand": "pnpm build",
  "outputDirectory": "dist",
  "framework": "vite",
  "rewrites": [
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ]
}
```

---

### ÉTAPE 2: Pousser le code sur GitHub

#### 2.1 Créer un dépôt GitHub

1. Allez sur https://github.com
2. Cliquez sur **"New repository"**
3. Nom : `annonce-auto-ci`
4. Visibilité : **Private** (recommandé)
5. Cliquez **"Create repository"**

#### 2.2 Initialiser Git localement

Ouvrez un terminal dans votre projet :

```bash
cd "C:\Users\nande\Downloads\Site Annonces Véhicules (3)"

# Initialiser Git
git init

# Ajouter tous les fichiers
git add .

# Premier commit
git commit -m "Initial commit - AnnonceAuto CI"

# Lier au dépôt GitHub (remplacez VOTRE_USERNAME)
git remote add origin https://github.com/VOTRE_USERNAME/annonce-auto-ci.git

# Pousser le code
git branch -M main
git push -u origin main
```

---

### ÉTAPE 3: Déployer sur Vercel

#### 3.1 Créer un compte Vercel

1. Allez sur https://vercel.com
2. Cliquez **"Sign Up"**
3. Choisissez **"Continue with GitHub"**
4. Autorisez Vercel

#### 3.2 Importer le projet

1. Sur le dashboard Vercel, cliquez **"Add New Project"**
2. Sélectionnez **"Import Git Repository"**
3. Choisissez votre dépôt `annonce-auto-ci`
4. Cliquez **"Import"**

#### 3.3 Configurer le projet

**Framework Preset:** Vite
**Build Command:** `pnpm build`
**Output Directory:** `dist`
**Install Command:** `pnpm install`

#### 3.4 Configurer les variables d'environnement

Cliquez sur **"Environment Variables"** et ajoutez :

```env
VITE_SUPABASE_URL=https://vnhwllsawfaueivykhly.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZuaHdsbHNhd2ZhdWVpdnlraGx5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjY0MzczMTgsImV4cCI6MjA4MjAxMzMxOH0.W4td5ZTiGYxqutPAyGGcGpkRNlXW1PJfQ5JCb-BZt64
VITE_API_URL=https://votre-backend-url.com
```

⚠️ **Important** : Pour `VITE_API_URL`, utilisez l'URL de votre backend déployé (voir plus bas).

#### 3.5 Déployer

Cliquez **"Deploy"** !

⏱️ **Temps d'attente** : 2-3 minutes

---

### ÉTAPE 4: Récupérer l'URL du site

Une fois le déploiement terminé :

1. Vous verrez une URL comme : `https://annonce-auto-ci.vercel.app`
2. Notez cette URL !

---

## 🖥️ DÉPLOYER LE BACKEND (SI NÉCESSAIRE)

Si vous utilisez le backend Express pour Payfonte, vous devez aussi le déployer.

### Option A: Railway

#### 4.1 Créer un compte Railway

1. Allez sur https://railway.app
2. Connectez-vous avec GitHub

#### 4.2 Créer un nouveau projet

1. Cliquez **"New Project"**
2. Choisissez **"Deploy from GitHub repo"**
3. Sélectionnez votre dépôt

#### 4.3 Configurer

**Root Directory:** `backend`
**Start Command:** `node server.clean.js`

#### 4.4 Variables d'environnement

```env
NODE_ENV=production
PORT=5000
DB_HOST=votre-db-host
DB_PORT=5432
DB_NAME=votre-db
DB_USER=votre-user
DB_PASSWORD=votre-password
PAYFONTE_CLIENT_ID=obrille
PAYFONTE_CLIENT_SECRET=live_6884f04fce3ec3bb73bd6ea0f87e4b41e95f420e3f29108d78
PAYFONTE_ENV=production
PAYFONTE_API_URL=https://my.payfonte.com/api/v1
PAYFONTE_CALLBACK_URL=https://annonce-auto-ci.vercel.app/payfonte/callback
```

#### 4.5 Récupérer l'URL du backend

Railway vous donnera une URL comme :
```
https://votre-backend.up.railway.app
```

#### 4.6 Mettre à jour Vercel

Retournez sur Vercel → Settings → Environment Variables :
```env
VITE_API_URL=https://votre-backend.up.railway.app
```

Puis **Redéployez** le frontend.

---

### Option B: Supabase Edge Functions (RECOMMANDÉ)

Si vous utilisez **Supabase Edge Functions** pour Payfonte (comme dans votre code actuel), pas besoin de déployer un backend séparé !

#### 4.1 Déployer les Edge Functions

```bash
cd "C:\Users\nande\Downloads\Site Annonces Véhicules (3)"

# Se connecter à Supabase
supabase login

# Lier au projet
supabase link --project-ref vnhwllsawfaueivykhly

# Configurer les secrets
supabase secrets set PAYFONTE_CLIENT_ID=obrille
supabase secrets set PAYFONTE_CLIENT_SECRET=live_6884f04fce3ec3bb73bd6ea0f87e4b41e95f420e3f29108d78
supabase secrets set PAYFONTE_ENV=production

# Déployer les fonctions
supabase functions deploy payfonte-create-checkout
supabase functions deploy payfonte-verify-payment
supabase functions deploy payfonte-webhook
```

---

## 🔐 CONFIGURER SUPABASE POUR LA PRODUCTION

### ÉTAPE 5: Configuration Supabase

#### 5.1 URL Callback OAuth

Dans Supabase Dashboard → Authentication → URL Configuration :

**Site URL:**
```
https://annonce-auto-ci.vercel.app
```

**Redirect URLs:**
```
https://annonce-auto-ci.vercel.app/auth/callback
https://annonce-auto-ci.vercel.app/payfonte/callback
http://localhost:5173/auth/callback (pour dev)
```

#### 5.2 Google OAuth (si utilisé)

Dans Supabase Dashboard → Authentication → Providers → Google :

**Authorized redirect URIs** (dans Google Cloud Console) :
```
https://vnhwllsawfaueivykhly.supabase.co/auth/v1/callback
```

#### 5.3 Appliquer les migrations SQL

Si ce n'est pas déjà fait, allez dans Supabase Dashboard → SQL Editor :

1. Copiez le contenu de `MIGRATION_ANALYTICS_SIMPLE.sql`
2. Collez et exécutez

---

## ✅ CHECKLIST FINALE

### Avant de déployer

- [ ] Code poussé sur GitHub
- [ ] `.env.local` ajouté au `.gitignore`
- [ ] Pas de secrets dans le code
- [ ] `vercel.json` créé (optionnel)

### Déploiement Frontend (Vercel)

- [ ] Compte Vercel créé
- [ ] Projet importé depuis GitHub
- [ ] Variables d'environnement configurées
- [ ] Déploiement réussi
- [ ] URL notée

### Déploiement Backend (si nécessaire)

- [ ] Backend déployé sur Railway ou Edge Functions
- [ ] Variables d'environnement configurées
- [ ] URL backend notée
- [ ] Frontend mis à jour avec URL backend

### Configuration Supabase

- [ ] Site URL configurée
- [ ] Redirect URLs configurées
- [ ] Migrations SQL appliquées
- [ ] RLS activé et testé

### Tests

- [ ] Site accessible en ligne
- [ ] Inscription fonctionne
- [ ] Connexion fonctionne
- [ ] Publication d'annonce fonctionne
- [ ] Upload d'images fonctionne
- [ ] Recharge Payfonte fonctionne
- [ ] Boost fonctionne

---

## 🧪 TESTER LE SITE EN PRODUCTION

### Tests essentiels

1. **Inscription**
   - Créer un nouveau compte
   - Vérifier l'email de confirmation

2. **Connexion**
   - Se connecter avec le nouveau compte

3. **Publier une annonce**
   - Uploader des images
   - Remplir le formulaire
   - Publier

4. **Recharge de crédits**
   - Aller sur `/dashboard/vendeur/recharge`
   - Sélectionner un montant
   - Tester le paiement Payfonte

5. **Boost**
   - Aller sur `/dashboard/vendeur/annonces`
   - Cliquer "Booster"
   - Vérifier le modal
   - Tester le boost

---

## 🐛 PROBLÈMES COURANTS

### 1. "Failed to load resource" (CORS)

**Cause:** Backend pas configuré pour accepter les requêtes depuis Vercel

**Solution:** Dans votre backend, ajoutez :
```javascript
const cors = require('cors');
app.use(cors({
  origin: ['https://annonce-auto-ci.vercel.app', 'http://localhost:5173']
}));
```

### 2. "404 Not Found" sur les routes

**Cause:** Vercel ne redirige pas vers `index.html`

**Solution:** Créez `vercel.json` (voir Étape 1.2)

### 3. Variables d'environnement non chargées

**Cause:** Vercel n'a pas les variables

**Solution:** Ajoutez-les dans Settings → Environment Variables, puis redéployez

### 4. Images ne s'affichent pas

**Cause:** Bucket Supabase Storage pas public

**Solution:** Dans Supabase Dashboard → Storage → vehicle-images → Policies :
```sql
CREATE POLICY "Public read access" ON storage.objects
  FOR SELECT USING (bucket_id = 'vehicle-images');
```

---

## 📊 MONITORING

### Vercel Analytics

1. Allez dans votre projet Vercel
2. Onglet **Analytics**
3. Activez Vercel Analytics (gratuit)

### Supabase Logs

1. Allez dans Supabase Dashboard
2. Onglet **Logs**
3. Surveillez les erreurs

---

## 🚀 DÉPLOIEMENT CONTINU

### Automatiser les déploiements

Chaque fois que vous poussez du code sur GitHub :
```bash
git add .
git commit -m "Votre message"
git push
```

Vercel **déploiera automatiquement** la nouvelle version ! ✨

---

## 📞 SUPPORT

### URLs importantes

- **Site en ligne:** https://annonce-auto-ci.vercel.app (à remplacer)
- **Dashboard Vercel:** https://vercel.com/dashboard
- **Dashboard Supabase:** https://supabase.com/dashboard
- **GitHub:** https://github.com/VOTRE_USERNAME/annonce-auto-ci

### En cas de problème

1. Vérifiez les logs Vercel
2. Vérifiez la console navigateur (F12)
3. Vérifiez les variables d'environnement
4. Vérifiez les URLs de callback

---

## 🎉 FÉLICITATIONS !

Une fois tous les tests réussis, votre site est **OFFICIELLEMENT EN LIGNE** ! 🚀

**Prochaines étapes:**
1. Acheter un nom de domaine (ex: `annonceauto.ci`)
2. Le configurer sur Vercel
3. Configurer les emails (Resend)
4. Ajouter Google Analytics
5. Lancer le marketing ! 🎯

---

**Guide créé le 24 Décembre 2025 🎄**
**Bonne chance avec votre lancement ! 🚀✨**



