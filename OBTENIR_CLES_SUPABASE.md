# 🔑 Comment obtenir vos clés Supabase (5 minutes)

---

## Étape 1 : Créer un compte Supabase (2 min)

1. Aller sur **https://supabase.com**
2. Cliquer sur **"Start your project"**
3. Se connecter avec GitHub (recommandé) ou Email
4. Gratuit, pas de carte bancaire requis

---

## Étape 2 : Créer un nouveau projet (2 min)

1. Cliquer sur **"New Project"**
2. Remplir :
   - **Name:** `annonceauto-ci` (ou ce que vous voulez)
   - **Database Password:** Choisir un mot de passe fort
   - **Region:** Choisir la région la plus proche (Europe, US, etc.)
   - **Pricing Plan:** FREE (gratuit)
3. Cliquer sur **"Create new project"**
4. Attendre 1-2 minutes (le projet se crée)

---

## Étape 3 : Récupérer vos clés (1 min)

Une fois le projet créé :

1. Dans le menu de gauche, cliquer sur **"Project Settings"** (icône d'engrenage)
2. Cliquer sur **"API"**
3. Vous verrez :

### 📋 URL du projet
```
Project URL: https://abcdefgh...

.supabase.co
```
👉 **Copier cette URL complète**

### 📋 Clé anon/public
```
anon public: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```
👉 **Copier cette clé complète** (très longue, ~300 caractères)

---

## Étape 4 : Créer le fichier `.env.local` (1 min)

1. À la racine de votre projet, créer un fichier nommé **`.env.local`**
2. Copier-coller ceci dedans :

```bash
VITE_SUPABASE_URL=https://votreprojet.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.votre_cle_ici
```

3. **Remplacer** `https://votreprojet.supabase.co` par votre vraie URL
4. **Remplacer** `eyJhbGciOi...` par votre vraie clé anon
5. **Sauvegarder** le fichier

### ✅ Exemple de fichier correct :

```bash
VITE_SUPABASE_URL=https://xyzabcdefgh.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inh5emFiY2RlZmdoIiwicm9sZSI6ImFub24iLCJpYXQiOjE2OTQwMDAwMDAsImV4cCI6MTg1NDAwMDAwMH0.abc123def456ghi789
```

---

## Étape 5 : Exécuter le script SQL (2 min)

1. Dans Supabase, cliquer sur **"SQL Editor"** dans le menu de gauche
2. Cliquer sur **"New Query"**
3. Ouvrir le fichier `/SUPABASE_SETUP.sql` de votre projet
4. **Copier tout le contenu** (400+ lignes)
5. **Coller** dans l'éditeur SQL de Supabase
6. Cliquer sur **"Run"** (en bas à droite)
7. Attendre quelques secondes
8. Vous devriez voir **"Success. No rows returned"** ✅

---

## ✅ Vérification

Pour vérifier que tout fonctionne :

1. Dans Supabase, cliquer sur **"Table Editor"** dans le menu de gauche
2. Vous devriez voir ces tables :
   - ✅ `profiles`
   - ✅ `listings`
   - ✅ `credit_transactions`
   - ✅ `boosts`
   - ✅ `favorites`
   - ✅ `messages`

Si vous voyez ces tables, **c'est bon !** ✅

---

## 🚀 Prêt à démarrer !

Maintenant que vous avez :
- ✅ Compte Supabase créé
- ✅ Fichier `.env.local` avec vos vraies clés
- ✅ Base de données créée (tables)

Vous pouvez :

```bash
pnpm run dev
```

Le site va se connecter à Supabase automatiquement !

**MAIS** il faut encore intégrer les services dans les pages (c'est ce que je vais faire maintenant).

---

## ⚠️ IMPORTANT - Sécurité

**NE COMMITTEZ JAMAIS `.env.local` dans Git !**

Le fichier `.gitignore` contient déjà `.env.local`, donc il ne sera pas commité.

✅ **OK à partager :**
- Project URL (publique)
- anon/public key (peut être vue côté client)

❌ **NE JAMAIS partager :**
- Database password
- service_role key (si vous la voyez)

---

## 🆘 Problèmes ?

### "Invalid API key"
→ Vérifiez que vous avez copié la **clé anon complète** (très longue)

### "Project URL not found"
→ Vérifiez que l'URL commence par `https://` et finit par `.supabase.co`

### Les tables ne se créent pas
→ Vérifiez que vous avez copié **tout le contenu** du fichier SQL (400+ lignes)

### Le site ne se connecte pas
→ Redémarrez le serveur : `Ctrl+C` puis `pnpm run dev`

---

**C'est tout ! Vous avez maintenant vos clés Supabase !** 🎉

**Prochaine étape : Je vais intégrer les services dans toutes les pages.**
