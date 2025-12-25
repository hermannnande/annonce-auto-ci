# ⚡ QUICKSTART CURSOR AI
## Démarrage rapide pour continuer avec Cursor AI

---

## 🎯 VOUS ÊTES ICI

```
┌─────────────────────────────────────────────────────────┐
│  ✅ APPLICATION FONCTIONNELLE À 99% (MODE DÉMO)         │
│  📦 localStorage (données volatiles)                    │
│  🎨 UI/UX Premium complète                              │
│  ⚙️  Toutes les fonctionnalités implémentées            │
└─────────────────────────────────────────────────────────┘
                          │
                          │ 🚀 MIGRATION
                          ▼
┌─────────────────────────────────────────────────────────┐
│  🎯 APPLICATION PRODUCTION (100%)                       │
│  🗄️  Supabase (base de données réelle)                  │
│  🔐 Authentification JWT                                │
│  ☁️  Storage cloud pour images                          │
│  💳 Paiements CinetPay                                  │
└─────────────────────────────────────────────────────────┘
```

---

## 📚 FICHIERS DE DOCUMENTATION CRÉÉS

### 🔴 PRIORITÉ 1 : LIRE EN PREMIER

| Fichier | Description | Temps de lecture |
|---------|-------------|------------------|
| **`CURSOR_AI_README.md`** | Vue d'ensemble complète du projet | 15 min |
| **`CURSOR_AI_GUIDE_MIGRATION_PRODUCTION.md`** | Guide pas-à-pas migration Supabase | 30 min |

### 🟡 PRIORITÉ 2 : GUIDES TECHNIQUES

| Fichier | Description | Utilité |
|---------|-------------|---------|
| **`/scripts/export-import-guide.md`** | Export localStorage → Import Supabase | Migration données |
| **`/supabase/migrations/001_initial_schema.sql`** | Schémas tables PostgreSQL | Création DB |
| **`/supabase/storage-config.sql`** | Configuration bucket images | Upload fichiers |
| **`.env.example`** | Template variables d'environnement | Configuration |

### 🟢 PRIORITÉ 3 : CORRECTIONS ET HISTORIQUE

| Fichier | Description | Contexte |
|---------|-------------|----------|
| **`CORRECTION_MODERATION_ADMIN.md`** | Système de validation annonces | Workflow admin |
| **`FIX_SUPABASE_ERRORS.md`** | Corrections erreurs localStorage | Debugging |

---

## 🚀 DÉMARRAGE RAPIDE (5 MINUTES)

### Option A : Continuer en mode DÉMO (localStorage)

```bash
# 1. Installer les dépendances (si pas déjà fait)
npm install

# 2. Démarrer le serveur de dev
npm run dev

# 3. Ouvrir dans le navigateur
# http://localhost:5173
```

**✅ Tout fonctionne déjà !**

---

### Option B : Migrer vers PRODUCTION (Supabase)

#### Étape 1 : Créer le projet Supabase (10 min)

1. **Aller sur :** https://supabase.com
2. **Créer un compte** (gratuit)
3. **New Project :**
   - Name: `annonceauto-ci`
   - Database Password: (générer un mot de passe fort)
   - Region: `West EU (Ireland)`
4. **Attendre 2-3 min** (provisioning)

---

#### Étape 2 : Récupérer les credentials (2 min)

Dans Supabase Dashboard :

1. **Aller dans :** Settings → API
2. **Copier :**
   - `Project URL` → https://xxxxx.supabase.co
   - `anon public` → eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.xxxxx

---

#### Étape 3 : Configuration locale (3 min)

```bash
# 1. Copier le template
cp .env.example .env

# 2. Éditer .env et remplir :
VITE_SUPABASE_URL=https://xxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.xxxxx
```

---

#### Étape 4 : Créer les tables (5 min)

Dans Supabase Dashboard :

1. **Aller dans :** SQL Editor
2. **Ouvrir le fichier :** `/supabase/migrations/001_initial_schema.sql`
3. **Copier TOUT le contenu**
4. **Coller dans SQL Editor**
5. **Cliquer :** "Run"
6. **Vérifier :** Tables apparaissent dans "Table Editor"

---

#### Étape 5 : Configurer le Storage (3 min)

1. **Aller dans :** Storage
2. **Cliquer :** "Create a new bucket"
3. **Paramètres :**
   - Name: `vehicle-images`
   - Public: ✅ Yes
   - File size limit: `5242880` (5 MB)
   - Allowed MIME types: `image/jpeg,image/png,image/webp`
4. **Cliquer :** "Create bucket"
5. **Aller dans :** SQL Editor
6. **Exécuter :** `/supabase/storage-config.sql`

---

#### Étape 6 : Tester (2 min)

```bash
# Redémarrer le serveur
npm run dev

# Ouvrir http://localhost:5173
# Créer un compte vendeur
# Publier une annonce
# Vérifier dans Supabase Dashboard → Table Editor → listings
```

✅ **Si vous voyez l'annonce dans Supabase → Migration réussie !**

---

## 🤖 UTILISER CURSOR AI POUR MIGRER

### Prompt pour Cursor AI

Copiez-collez ce prompt dans Cursor AI :

```
Je veux migrer mon application AnnonceAuto.CI de localStorage vers Supabase.

CONTEXTE :
- Projet React + Vite + TypeScript
- Mode DÉMO actuellement avec localStorage
- Toutes les fonctionnalités implémentées
- Fichiers de documentation créés

DOCUMENTATION DISPONIBLE :
1. CURSOR_AI_README.md (vue d'ensemble)
2. CURSOR_AI_GUIDE_MIGRATION_PRODUCTION.md (guide complet)
3. /scripts/export-import-guide.md (export/import données)
4. /supabase/migrations/001_initial_schema.sql (schémas DB)
5. /supabase/storage-config.sql (config storage)

TÂCHE :
Migrer les services suivants vers Supabase en suivant le guide :
1. /src/services/auth.service.ts (localStorage → Supabase Auth)
2. /src/services/listings.service.ts (localStorage → Supabase Database)
3. Créer /src/services/storage.service.ts (upload images)

INSTRUCTIONS :
- Lire d'abord CURSOR_AI_GUIDE_MIGRATION_PRODUCTION.md
- Suivre la section "Mise à jour du code"
- Conserver la même API (fonctions, paramètres)
- Ajouter la gestion d'erreurs
- Tester chaque service après migration

Commence par le fichier auth.service.ts
```

---

## 📋 CHECKLIST MIGRATION COMPLÈTE

### Avant de commencer

- [ ] Lire `CURSOR_AI_README.md`
- [ ] Lire `CURSOR_AI_GUIDE_MIGRATION_PRODUCTION.md`
- [ ] Créer compte Supabase
- [ ] Exporter données localStorage (script dans console)

### Configuration Supabase

- [ ] Créer projet Supabase
- [ ] Récupérer URL + ANON_KEY
- [ ] Créer fichier `.env`
- [ ] Exécuter `001_initial_schema.sql`
- [ ] Créer bucket `vehicle-images`
- [ ] Exécuter `storage-config.sql`

### Migration code

- [ ] Installer `@supabase/supabase-js`
- [ ] Créer `/src/lib/supabase.ts`
- [ ] Migrer `auth.service.ts`
- [ ] Migrer `listings.service.ts`
- [ ] Créer `storage.service.ts`
- [ ] Mettre à jour `AuthContext.tsx`

### Import données

- [ ] Installer `tsx` et `dotenv`
- [ ] Créer script d'import
- [ ] Exécuter l'import
- [ ] Vérifier dans Supabase Dashboard

### Tests

- [ ] Inscription vendeur
- [ ] Login vendeur
- [ ] Publier annonce
- [ ] Upload image
- [ ] Modération admin
- [ ] Recherche et filtres
- [ ] Favoris
- [ ] Vues

### Déploiement

- [ ] Build production (`npm run build`)
- [ ] Créer compte Vercel/Netlify
- [ ] Connecter repo GitHub
- [ ] Configurer variables d'environnement
- [ ] Déployer
- [ ] Tester en production

---

## 🎓 RESSOURCES D'APPRENTISSAGE

### Vidéos recommandées

- **Supabase Crash Course :** https://www.youtube.com/watch?v=7uKQBl9uZ00
- **React + Supabase :** https://www.youtube.com/watch?v=Ow_Uzedfohk
- **Row Level Security :** https://www.youtube.com/watch?v=Ow_Uzedfohk

### Documentation officielle

- **Supabase Docs :** https://supabase.com/docs
- **Supabase Auth :** https://supabase.com/docs/guides/auth
- **Supabase Storage :** https://supabase.com/docs/guides/storage
- **Supabase RLS :** https://supabase.com/docs/guides/auth/row-level-security

---

## 💡 CONSEILS CURSOR AI

### Pour obtenir les meilleurs résultats

1. **Toujours référencer les fichiers de documentation**
   ```
   "Lis d'abord CURSOR_AI_GUIDE_MIGRATION_PRODUCTION.md 
   puis migre auth.service.ts en suivant la section X"
   ```

2. **Demander étape par étape**
   ```
   "Migre uniquement la fonction login() de auth.service.ts 
   vers Supabase en conservant la même signature"
   ```

3. **Vérifier après chaque étape**
   ```
   "Teste si la fonction login() fonctionne avant de continuer"
   ```

4. **Utiliser les schémas SQL comme référence**
   ```
   "Vérifie que la table profiles dans 001_initial_schema.sql 
   correspond à mon code TypeScript"
   ```

---

## 🆘 PROBLÈMES COURANTS

### ❌ "Module not found: @supabase/supabase-js"

**Solution :**
```bash
npm install @supabase/supabase-js
```

---

### ❌ "Failed to fetch"

**Solution :**
- Vérifier que `VITE_SUPABASE_URL` est correct
- Vérifier que `VITE_SUPABASE_ANON_KEY` est correct
- Vérifier que les variables ont le préfixe `VITE_`
- Redémarrer le serveur de dev

---

### ❌ "row-level security policy violation"

**Solution :**
- Vérifier que les policies RLS sont créées (SQL Editor)
- Vérifier que l'utilisateur est authentifié
- Vérifier que le `user_id` correspond

---

### ❌ "relation does not exist"

**Solution :**
- Exécuter `001_initial_schema.sql` dans SQL Editor
- Vérifier que toutes les tables sont créées

---

### ❌ Images ne s'affichent pas

**Solution :**
- Créer le bucket `vehicle-images`
- Exécuter `storage-config.sql`
- Vérifier que le bucket est public
- Vérifier les policies RLS du storage

---

## 🎯 OBJECTIFS PAR PHASE

### Phase 1 : Configuration (30 min)
✅ Projet Supabase créé  
✅ Tables créées  
✅ Storage configuré  
✅ Variables d'environnement OK  

### Phase 2 : Migration code (2h)
✅ auth.service.ts migré  
✅ listings.service.ts migré  
✅ storage.service.ts créé  
✅ Tests unitaires OK  

### Phase 3 : Migration données (1h)
✅ Export localStorage  
✅ Import Supabase  
✅ Vérification données  

### Phase 4 : Tests (1h)
✅ Authentification  
✅ CRUD annonces  
✅ Upload images  
✅ Modération  

### Phase 5 : Production (1h)
✅ Build OK  
✅ Déploiement Vercel  
✅ Domaine configuré  
✅ Tests en prod  

---

## 🏁 CONCLUSION

**VOUS AVEZ MAINTENANT :**

✅ Une application complète et fonctionnelle en mode DÉMO  
✅ Toute la documentation nécessaire pour la migration  
✅ Des scripts d'export/import prêts à l'emploi  
✅ Des schémas SQL complets  
✅ Un guide étape par étape  

**PROCHAINES ÉTAPES :**

1. **Si vous voulez tester :** Lancer en mode DÉMO (localStorage)
2. **Si vous voulez migrer :** Suivre le guide de migration
3. **Si vous avez Cursor AI :** Utiliser les prompts fournis

---

**📁 FICHIERS IMPORTANTS :**

```
/CURSOR_AI_README.md                          ← Vue d'ensemble
/CURSOR_AI_GUIDE_MIGRATION_PRODUCTION.md      ← Guide complet
/scripts/export-import-guide.md               ← Export/Import
/supabase/migrations/001_initial_schema.sql   ← Schémas DB
/supabase/storage-config.sql                  ← Config Storage
/.env.example                                 ← Template config
```

---

**Date :** 22 Décembre 2024  
**Version :** 1.0  
**Statut :** ✅ PRÊT POUR LA MIGRATION

**🚀 Bon développement avec Cursor AI !**
