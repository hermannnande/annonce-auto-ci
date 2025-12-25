# 🚀 ANNONCEAUTO.CI - DOCUMENTATION CURSOR AI
## Guide complet pour continuer le développement

---

## 📁 STRUCTURE DU PROJET

```
annonceauto/
│
├── 📄 DOCUMENTATION CURSOR AI (LIRE EN PREMIER)
│   ├── CURSOR_AI_GUIDE_MIGRATION_PRODUCTION.md  ← Guide complet migration Supabase
│   ├── CURSOR_AI_README.md                       ← Ce fichier
│   ├── CORRECTION_MODERATION_ADMIN.md            ← Système de modération
│   ├── FIX_SUPABASE_ERRORS.md                    ← Corrections erreurs
│   └── scripts/export-import-guide.md            ← Export/Import données
│
├── 🗄️ MIGRATIONS SUPABASE
│   └── supabase/
│       ├── migrations/
│       │   └── 001_initial_schema.sql             ← Tables et RLS
│       └── storage-config.sql                     ← Configuration Storage
│
├── 📜 SCRIPTS UTILITAIRES
│   └── scripts/
│       ├── export-import-guide.md                 ← Guide export/import
│       └── import-to-supabase.ts (à créer)        ← Script d'import
│
├── 🎨 CODE SOURCE
│   └── src/
│       ├── app/
│       │   ├── App.tsx                            ← Point d'entrée
│       │   ├── pages/                             ← Pages React
│       │   │   ├── HomePage.tsx
│       │   │   ├── ListingsPage.tsx
│       │   │   ├── PublishPage.tsx
│       │   │   ├── LoginPage.tsx
│       │   │   ├── SignupPage.tsx
│       │   │   ├── dashboard/
│       │   │   │   ├── VendorDashboard.tsx
│       │   │   │   ├── VendorListings.tsx
│       │   │   │   ├── AdminDashboard.tsx
│       │   │   │   ├── AdminModeration.tsx
│       │   │   │   ├── AdminCredits.tsx
│       │   │   │   ├── AdminUsers.tsx
│       │   │   │   └── AdminPayments.tsx
│       │   │   └── ThankYouPage.tsx
│       │   └── components/                        ← Composants réutilisables
│       │       ├── VehicleCard.tsx
│       │       ├── SearchBar.tsx
│       │       ├── ui/                            ← UI Library
│       │       └── dashboard/
│       │           └── DashboardLayout.tsx
│       ├── lib/
│       │   └── supabase.ts                        ← Client Supabase
│       ├── services/                              ← Services API (À MIGRER)
│       │   ├── auth.service.ts
│       │   ├── listings.service.ts
│       │   ├── credits.service.ts
│       │   └── storage.service.ts
│       ├── context/
│       │   └── AuthContext.tsx                    ← Context d'authentification
│       ├── data/
│       │   └── vehicles.ts                        ← Données mock (À REMPLACER)
│       └── styles/
│           ├── theme.css
│           └── fonts.css
│
├── ⚙️ CONFIGURATION
│   ├── .env.example                               ← Template variables d'environnement
│   ├── .gitignore
│   ├── package.json
│   ├── vite.config.ts
│   └── tsconfig.json
│
└── 📦 BUILD
    └── dist/                                      ← Build production (généré)
```

---

## 🎯 ÉTAT ACTUEL DU PROJET

### ✅ TERMINÉ (99% Fonctionnel en mode DÉMO)

#### 1. **Interface Utilisateur (100%)**
- ✅ Homepage avec hero premium
- ✅ Page Annonces avec recherche en temps réel
- ✅ Filtres avancés (marque, prix, année, km, etc.)
- ✅ Page Détails véhicule
- ✅ Formulaire de publication (4 étapes)
- ✅ Pages Login/Signup avec préfixe +225 automatique
- ✅ Dashboard Vendeur complet
- ✅ Dashboard Admin ultra-professionnel
- ✅ Page Thank You

#### 2. **Fonctionnalités (99%)**
- ✅ Authentification (localStorage)
- ✅ Publication d'annonces → `status: 'pending'`
- ✅ Modération admin (Approuver/Rejeter)
- ✅ Recherche globale avec texte
- ✅ Filtres multiples fonctionnels
- ✅ Favoris avec bouton ❤️
- ✅ Compteur de vues dynamique
- ✅ Stats en temps réel (VendorDashboard)
- ✅ Système de crédits (démo)
- ✅ Boost d'annonces
- ✅ Responsive mobile-first

#### 3. **Design (100%)**
- ✅ Palette: #0F172A (bleu foncé), #FACC15 (jaune/or), #F3F4F6 (gris)
- ✅ Google Fonts premium (Poppins, Inter)
- ✅ Animations Motion (Framer Motion)
- ✅ Glass morphism
- ✅ Micro-interactions sophistiquées
- ✅ Dark mode compatible

### ⚠️ À FAIRE (Migration Production)

#### 1. **Backend Supabase (1%)**
- ❌ Configuration Supabase
- ❌ Migration tables SQL
- ❌ Configuration Storage
- ❌ Row Level Security (RLS)
- ❌ Authentification JWT
- ❌ API REST endpoints

#### 2. **Migration Code (0%)**
- ❌ auth.service.ts → Supabase Auth
- ❌ listings.service.ts → Supabase Database
- ❌ credits.service.ts → Supabase Database
- ❌ storage.service.ts → Supabase Storage
- ❌ Remplacer localStorage par appels API

#### 3. **Paiements (0%)**
- ❌ Intégration CinetPay (Côte d'Ivoire)
- ❌ Webhook gestion paiements
- ❌ Historique transactions

#### 4. **Production (0%)**
- ❌ Déploiement Vercel/Netlify
- ❌ Domaine annonceauto.ci
- ❌ SSL/HTTPS
- ❌ Analytics
- ❌ Monitoring erreurs (Sentry)

---

## 🚀 PLAN DE MIGRATION VERS PRODUCTION

### Phase 1 : Configuration Supabase (2h)

**Instructions détaillées :** Voir `CURSOR_AI_GUIDE_MIGRATION_PRODUCTION.md`

1. **Créer projet Supabase**
   - Aller sur https://supabase.com
   - Créer un projet `annonceauto-ci`
   - Région: West EU (Ireland)

2. **Exécuter migrations SQL**
   - Copier `/supabase/migrations/001_initial_schema.sql`
   - Coller dans SQL Editor Supabase
   - Cliquer "Run"

3. **Configurer Storage**
   - Créer bucket `vehicle-images`
   - Exécuter `/supabase/storage-config.sql`

4. **Récupérer credentials**
   - Copier `.env.example` → `.env`
   - Remplir `VITE_SUPABASE_URL`
   - Remplir `VITE_SUPABASE_ANON_KEY`
   - Remplir `SUPABASE_SERVICE_KEY` (pour scripts)

---

### Phase 2 : Export des données actuelles (30 min)

**Instructions détaillées :** Voir `/scripts/export-import-guide.md`

1. **Ouvrir l'app dans le navigateur**
2. **Ouvrir la console (F12)**
3. **Exécuter le script d'export :**

```javascript
function exportAnnonceAutoData() {
  const data = {
    exportedAt: new Date().toISOString(),
    version: '1.0',
    user: localStorage.getItem('annonceauto_user') 
      ? JSON.parse(localStorage.getItem('annonceauto_user')) 
      : null,
    listings: localStorage.getItem('annonceauto_demo_listings')
      ? JSON.parse(localStorage.getItem('annonceauto_demo_listings'))
      : [],
    favorites: localStorage.getItem('annonceauto_favorites')
      ? JSON.parse(localStorage.getItem('annonceauto_favorites'))
      : [],
    views: localStorage.getItem('annonceauto_views')
      ? JSON.parse(localStorage.getItem('annonceauto_views'))
      : {}
  };
  
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `annonceauto-backup-${Date.now()}.json`;
  a.click();
  URL.revokeObjectURL(url);
  
  console.log('✅ Export terminé !');
}

exportAnnonceAutoData();
```

4. **Fichier JSON téléchargé** → Sauvegarder en lieu sûr

---

### Phase 3 : Migration du code (4h)

#### A. Fichier `/src/lib/supabase.ts`

**Instructions dans :** `CURSOR_AI_GUIDE_MIGRATION_PRODUCTION.md` (Section "Mise à jour du code")

```typescript
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type Database = {
  // ... voir le guide complet
};
```

#### B. Service d'authentification

**Fichier :** `/src/services/auth.service.ts`

Remplacer localStorage par Supabase Auth :

```typescript
import { supabase } from '../lib/supabase';

export const authService = {
  async login(email: string, password: string) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });
    
    if (error) return { user: null, error };
    
    const { data: profile } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', data.user.id)
      .single();
    
    return { user: { ...data.user, profile }, error: null };
  },
  
  async signup(email: string, password: string, userData: any) {
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password
    });
    
    if (authError) return { user: null, error: authError };
    
    const { error: profileError } = await supabase
      .from('profiles')
      .insert({
        id: authData.user!.id,
        email,
        full_name: userData.name,
        phone: userData.phone,
        user_type: 'vendor',
        credits: 100
      });
    
    if (profileError) return { user: null, error: profileError };
    
    return { user: authData.user, error: null };
  },
  
  async logout() {
    return await supabase.auth.signOut();
  }
};
```

#### C. Service listings

**Fichier :** `/src/services/listings.service.ts`

```typescript
import { supabase } from '../lib/supabase';

export const listingsService = {
  async getActiveListings() {
    const { data, error } = await supabase
      .from('listings')
      .select(`
        *,
        profiles:user_id (full_name, phone, verified)
      `)
      .eq('status', 'active')
      .order('created_at', { ascending: false });
    
    return { data, error };
  },
  
  async createListing(listingData: any) {
    const { data, error } = await supabase
      .from('listings')
      .insert({
        ...listingData,
        status: 'pending'
      })
      .select()
      .single();
    
    return { data, error };
  },
  
  async moderateListing(listingId: string, action: 'approve' | 'reject', reason?: string) {
    const updates: any = {
      status: action === 'approve' ? 'active' : 'rejected',
      updated_at: new Date().toISOString()
    };
    
    if (action === 'approve') {
      updates.approved_at = new Date().toISOString();
    } else {
      updates.rejected_at = new Date().toISOString();
      updates.reject_reason = reason;
    }
    
    const { data, error } = await supabase
      .from('listings')
      .update(updates)
      .eq('id', listingId)
      .select()
      .single();
    
    return { data, error };
  }
};
```

#### D. Service storage (upload images)

**Fichier :** `/src/services/storage.service.ts` (NOUVEAU)

```typescript
import { supabase } from '../lib/supabase';
import { v4 as uuidv4 } from 'uuid';

export const storageService = {
  async uploadVehicleImage(file: File, userId: string): Promise<string | null> {
    try {
      if (!file.type.startsWith('image/')) {
        throw new Error('Le fichier doit être une image');
      }
      
      if (file.size > 5 * 1024 * 1024) {
        throw new Error('L\'image ne doit pas dépasser 5 MB');
      }
      
      const fileExt = file.name.split('.').pop();
      const fileName = `${userId}/${uuidv4()}.${fileExt}`;
      
      const { data, error } = await supabase.storage
        .from('vehicle-images')
        .upload(fileName, file);
      
      if (error) throw error;
      
      const { data: { publicUrl } } = supabase.storage
        .from('vehicle-images')
        .getPublicUrl(fileName);
      
      return publicUrl;
      
    } catch (error) {
      console.error('Erreur upload:', error);
      return null;
    }
  }
};
```

---

### Phase 4 : Import des données (1h)

**Fichier :** `/scripts/import-to-supabase.ts` (à créer)

Voir le guide complet dans `/scripts/export-import-guide.md`

```bash
# Installer dépendances
npm install --save-dev tsx @supabase/supabase-js dotenv

# Exécuter l'import
npx tsx scripts/import-to-supabase.ts ./backup.json
```

---

### Phase 5 : Tests (2h)

**Checklist de tests :**

- [ ] Inscription nouveau vendeur
- [ ] Login vendeur
- [ ] Publier annonce avec images
- [ ] Vérifier annonce en "pending"
- [ ] Login admin
- [ ] Approuver annonce
- [ ] Vérifier annonce visible sur /annonces
- [ ] Rejeter une annonce
- [ ] Vérifier annonce invisible
- [ ] Recherche et filtres
- [ ] Favoris
- [ ] Compteur de vues
- [ ] Boost d'annonce
- [ ] Logout

---

### Phase 6 : Déploiement (1h)

**Vercel (Recommandé) :**

1. **Créer compte sur :** https://vercel.com
2. **Connecter le repo GitHub**
3. **Configurer les variables d'environnement :**
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
4. **Déployer** → Cliquer "Deploy"
5. **Domaine custom :** annonceauto.ci

**Netlify (Alternative) :**

1. **Créer compte sur :** https://netlify.com
2. **Import projet GitHub**
3. **Build command :** `npm run build`
4. **Publish directory :** `dist`
5. **Variables d'environnement** → Même que Vercel

---

## 📝 COMMANDES UTILES

### Développement

```bash
# Installer les dépendances
npm install

# Démarrer le serveur de dev
npm run dev

# Build de production
npm run build

# Preview du build
npm run preview
```

### Scripts Supabase

```bash
# Générer les types TypeScript depuis la DB
npx supabase gen types typescript --project-id xxxxx > src/lib/database.types.ts

# Export des données
npx tsx scripts/auto-backup.ts

# Import des données
npx tsx scripts/import-to-supabase.ts ./backup.json

# Comparer localStorage vs Supabase
npx tsx scripts/compare-data.ts
```

---

## 🔑 VARIABLES D'ENVIRONNEMENT

Voir `.env.example` pour le template complet.

**Minimum requis :**

```env
VITE_SUPABASE_URL=https://xxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.xxxxx
```

**Pour les scripts backend :**

```env
SUPABASE_SERVICE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.xxxxx
```

---

## 🐛 DEBUGGING

### Problèmes courants

#### 1. **"Failed to fetch" dans AdminCredits**
**Solution :** Fichier déjà corrigé. Utilise maintenant des données démo localStorage.

#### 2. **"Cannot read properties of undefined"**
**Solution :** Vérifier que toutes les propriétés ont des valeurs par défaut ou `?`.

#### 3. **Images ne s'affichent pas**
**Solution :**
- Vérifier Storage configuré dans Supabase
- Vérifier policies RLS
- Vérifier URLs générées

#### 4. **RLS Policy violation**
**Solution :**
- Vérifier que l'utilisateur est authentifié
- Vérifier les policies dans la table
- Utiliser `SUPABASE_SERVICE_KEY` pour bypass (scripts uniquement)

---

## 📚 RESSOURCES SUPPLÉMENTAIRES

### Documentation officielle

- **Supabase :** https://supabase.com/docs
- **React :** https://react.dev
- **Vite :** https://vitejs.dev
- **Motion (Framer Motion) :** https://motion.dev
- **Tailwind CSS :** https://tailwindcss.com

### Guides spécifiques AnnonceAuto.CI

1. **Migration Production :** `CURSOR_AI_GUIDE_MIGRATION_PRODUCTION.md`
2. **Export/Import :** `/scripts/export-import-guide.md`
3. **Modération Admin :** `CORRECTION_MODERATION_ADMIN.md`
4. **Corrections erreurs :** `FIX_SUPABASE_ERRORS.md`

---

## 🤝 CONTRIBUTION

### Pour Cursor AI

Lors du développement avec Cursor AI, suivez ces principes :

1. **Toujours lire** les fichiers de documentation en premier
2. **Référencer** les schémas SQL dans `/supabase/migrations/`
3. **Maintenir** la cohérence avec la palette de couleurs
4. **Tester** chaque modification
5. **Documenter** les changements importants

### Structure de commit

```
feat: Ajout de [fonctionnalité]
fix: Correction de [bug]
docs: Mise à jour documentation
style: Amélioration UI/UX
refactor: Refactorisation [composant]
```

---

## 📞 SUPPORT

### Questions fréquentes

**Q : Puis-je utiliser Cursor AI pour migrer vers Supabase ?**  
R : Oui ! Cursor AI peut lire `CURSOR_AI_GUIDE_MIGRATION_PRODUCTION.md` et exécuter la migration étape par étape.

**Q : Les données localStorage seront-elles perdues ?**  
R : Non. Le script d'export sauvegarde tout dans un fichier JSON avant migration.

**Q : Combien coûte Supabase ?**  
R : Le plan gratuit (500 MB DB + 1 GB Storage) est largement suffisant pour démarrer. Passer en Pro ($25/mois) quand besoin.

**Q : Et si je veux rester en localStorage ?**  
R : Possible mais limité. Pas de multi-appareils, pas de backup auto, limite 5-10 MB.

---

## ✅ CHECKLIST DE MIGRATION COMPLÈTE

### Avant migration
- [ ] Lire `CURSOR_AI_GUIDE_MIGRATION_PRODUCTION.md`
- [ ] Lire `/scripts/export-import-guide.md`
- [ ] Créer compte Supabase
- [ ] Exporter données localStorage

### Pendant migration
- [ ] Créer projet Supabase
- [ ] Exécuter migrations SQL
- [ ] Configurer Storage
- [ ] Copier `.env.example` → `.env`
- [ ] Remplir credentials Supabase
- [ ] Migrer auth.service.ts
- [ ] Migrer listings.service.ts
- [ ] Créer storage.service.ts
- [ ] Tester chaque service

### Après migration
- [ ] Importer données vers Supabase
- [ ] Tests fonctionnels complets
- [ ] Déployer sur Vercel/Netlify
- [ ] Configurer domaine custom
- [ ] Setup backup automatique
- [ ] Monitoring (optionnel)

---

**Version :** 1.0  
**Date :** 22 Décembre 2024  
**Auteur :** Équipe AnnonceAuto.CI  
**Pour :** Cursor AI & Développeurs

**🚀 Prêt pour la production !**
